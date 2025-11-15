# Data Not Persisting - Complete Fix Guide

## 🔴 Problem

You're experiencing TWO issues:

### Issue 1: Likes/Comments/Reposts Don't Persist

- You like a post → Close app → Reopen → Like is gone
- Comments disappear after closing app
- Reposts don't stay

### Issue 2: Messages Exist But Conversation List is Empty

- You CAN see messages when you open a chat
- But the Messages list shows "No messages yet"
- Conversation list doesn't populate

---

## 🎯 Root Causes

### Issue 1 Root Cause: **Likes Not Saving to Database**

The like button code (line 203 in PostCard.tsx):

```typescript
const handleLike = () => {
  setLiked(!liked);
  setLikes(liked ? likes - 1 : likes + 1);
  toast.success(liked ? "Unliked" : "Liked!");
  // ❌ ONLY UPDATES LOCAL STATE - NOT SAVED TO DATABASE!
};
```

**What's happening**:

- Clicking like only changes the UI (local state)
- NO database save operation
- When you close the app, state is lost
- When you reopen, it loads from database (which has no likes)

**What's needed**:

- A `likes` table in database
- Save like to database when clicked
- Load likes from database on app start

### Issue 2 Root Cause: **Messages Query Expects `is_read` Column**

The Messages.tsx code (line 54-63) does this query:

```typescript
const { data: messages, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:sender_id(id, full_name, username, avatar_url),
    receiver:receiver_id(id, full_name, username, avatar_url)
  `)
  .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
  .order('created_at', { ascending: false });
```

Then line 76 tries to access `message.is_read`:

```typescript
unread: !message.is_read && message.receiver_id === user.id
```

If `is_read` column doesn't exist, the query fails silently!

---

## ✅ Complete Fix Solution

### Step 1: Create Missing Database Tables (10 min)

You need to run **3 SQL scripts** in your Supabase SQL Editor:

#### Script 1: Fix Messages Table

```sql
-- Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
UPDATE messages SET is_read = false WHERE is_read IS NULL;
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread 
  ON messages(receiver_id, is_read, created_at DESC) WHERE is_read = false;
```

#### Script 2: Create Likes Table

```sql
-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" 
  ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON likes;
CREATE POLICY "Users can like posts" 
  ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON likes;
CREATE POLICY "Users can unlike posts" 
  ON likes FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);

-- Function to increment like count
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement like count
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS on_like_added ON likes;
CREATE TRIGGER on_like_added
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes();

DROP TRIGGER IF EXISTS on_like_removed ON likes;
CREATE TRIGGER on_like_removed
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes();
```

#### Script 3: Create Bookmarks Table

```sql
-- Create bookmarks table (if not exists)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks" 
  ON bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark posts" ON bookmarks;
CREATE POLICY "Users can bookmark posts" 
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarks;
CREATE POLICY "Users can remove bookmarks" 
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_id);
```

### Step 2: Update PostCard.tsx to Save Likes (CRITICAL!)

I need to fix the `handleLike` function in `src/components/PostCard.tsx`:

**Current (broken) code:**

```typescript
const handleLike = () => {
  setLiked(!liked);
  setLikes(liked ? likes - 1 : likes + 1);
  toast.success(liked ? "Unliked" : "Liked!");
};
```

**Fixed code:**

```typescript
const handleLike = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }

    if (liked) {
      // Unlike: Delete from database
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);
      
      setLiked(false);
      setLikes(likes - 1);
      toast.success("Unliked!");
    } else {
      // Like: Insert into database
      await supabase
        .from('likes')
        .insert({
          post_id: id,
          user_id: user.id,
        });
      
      setLiked(true);
      setLikes(likes + 1);
      toast.success("Liked!");
    }
  } catch (error) {
    console.error('Error liking post:', error);
    toast.error('Failed to like post');
  }
};
```

**Also need to load initial like state:**

```typescript
// Add this useEffect
useEffect(() => {
  fetchLikeStatus();
}, []);

const fetchLikeStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();
    
    setLiked(!!data);
  } catch (error) {
    // User hasn't liked this post
    setLiked(false);
  }
};
```

### Step 3: Update PostCard.tsx to Save Bookmarks

**Current (broken) code:**

```typescript
const handleBookmark = () => {
  setBookmarked(!bookmarked);
  toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
};
```

**Fixed code:**

```typescript
const handleBookmark = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to bookmark posts');
      return;
    }

    if (bookmarked) {
      // Remove bookmark
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);
      
      setBookmarked(false);
      toast.success("Removed from bookmarks");
    } else {
      // Add bookmark
      await supabase
        .from('bookmarks')
        .insert({
          post_id: id,
          user_id: user.id,
        });
      
      setBookmarked(true);
      toast.success("Added to bookmarks");
    }
  } catch (error) {
    console.error('Error bookmarking:', error);
    toast.error('Failed to bookmark');
  }
};
```

**Load bookmark status:**

```typescript
useEffect(() => {
  fetchBookmarkStatus();
}, []);

const fetchBookmarkStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();
    
    setBookmarked(!!data);
  } catch (error) {
    setBookmarked(false);
  }
};
```

---

## 🔧 How to Apply the Fixes

### Option A: I Can Fix the Code for You

I can update the `PostCard.tsx` file right now with all the fixes. Just let me know!

### Option B: Manual Fix Steps

1. **Run all 3 SQL scripts** in Supabase SQL Editor
2. **Update PostCard.tsx** with the new like/bookmark handlers
3. **Rebuild the app**:
   ```bash
   npm run build
   npx cap sync android
   cd android
   .\gradlew assembleRelease
   ```
4. **Reinstall APK** on your phone

---

## 📊 What Each Fix Does

### Likes Table Fix

**Before**: Like button → Updates UI only → Close app → Likes gone  
**After**: Like button → Saves to database → Close app → Likes persist ✅

### Bookmarks Table Fix

**Before**: Bookmark → Updates UI only → Close app → Bookmarks gone  
**After**: Bookmark → Saves to database → Close app → Bookmarks persist ✅

### Messages Table Fix

**Before**: Messages query fails → Returns empty → "No messages yet"  
**After**: Messages query works → Returns conversations → Shows chat list ✅

---

## ✅ Expected Results After Fix

### Likes/Comments

| Action | Before | After |
|--------|--------|-------|
| Like a post | ✅ Works (temporarily) | ✅ Works (saves to DB) |
| Close app | ❌ Like disappears | ✅ Like persists |
| Reopen app | ❌ Like is gone | ✅ Like still there |
| Comment on post | ✅ Works (saved) | ✅ Works (saved) |
| View comments | ✅ Works | ✅ Works |

### Messages

| Action | Before | After |
|--------|--------|-------|
| Send message | ✅ Message sent | ✅ Message sent |
| View in chat | ✅ Can see | ✅ Can see |
| Messages list | ❌ Empty | ✅ Shows conversations |
| Badge count | ❌ Wrong | ✅ Correct |

---

## 🧪 Testing the Fixes

### Test 1: Likes Persistence

1. Like a post
2. **Close the app completely** (swipe away from recent apps)
3. Reopen UniteX
4. Go to the same post
5. ✅ Like should still be there!
6. Like count should be correct

### Test 2: Messages List

1. Send a message to yourself or friend
2. Go back to Messages tab
3. ✅ Should see conversation in the list!
4. Badge count should show unread count

### Test 3: Bookmarks

1. Bookmark a post
2. Close and reopen app
3. Go to Bookmarks tab
4. ✅ Post should be there!

---

## 🐛 Why This Happened

**Root Issue**: The app was built with **UI-only state management** instead of **database
integration**.

**What this means**:

- Buttons update the screen (UI state)
- But don't save to database
- When app closes, all UI state is lost
- When app reopens, it loads from database (which is empty)

**This is common in:**

- Demo/prototype apps
- Apps copied from UI templates
- Apps built without backend integration

**The fix is to**:

- Create database tables for likes, bookmarks, etc.
- Update button handlers to save to database
- Load initial state from database on mount

---

## 📋 Complete SQL Script (All-in-One)

Run this single script to fix everything:

```sql
-- ========================================
-- FIX 1: Messages Table
-- ========================================
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
UPDATE messages SET is_read = false WHERE is_read IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread 
  ON messages(receiver_id, is_read) WHERE is_read = false;

-- ========================================
-- FIX 2: Likes Table
-- ========================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);

-- Auto-update like counts
CREATE OR REPLACE FUNCTION increment_post_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_added ON likes;
CREATE TRIGGER on_like_added AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_post_likes();

DROP TRIGGER IF EXISTS on_like_removed ON likes;
CREATE TRIGGER on_like_removed AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_post_likes();

-- ========================================
-- FIX 3: Bookmarks Table
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmarks 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark posts" ON bookmarks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON bookmarks 
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- ========================================
-- Verify Everything
-- ========================================
SELECT 'Messages table columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'messages';

SELECT 'Likes table created:' as info;
SELECT COUNT(*) FROM likes;

SELECT 'Bookmarks table created:' as info;
SELECT COUNT(*) FROM bookmarks;
```

---

## 🚀 Next Steps

**Which fix do you want first?**

1. **🔴 URGENT: Fix Likes/Bookmarks** - I'll update PostCard.tsx right now
2. **🔴 URGENT: Fix Messages List** - Run SQL script
3. **Both!** - I'll do everything

Just let me know and I'll apply the fixes immediately!

---

## ✅ Success Checklist

After applying all fixes:

- [ ] Ran SQL script in Supabase
- [ ] Updated PostCard.tsx with new handlers
- [ ] Rebuilt app (`npm run build`, `npx cap sync`, rebuild APK)
- [ ] Reinstalled APK
- [ ] Liked a post → Closed app → Reopened → **Like still there** ✅
- [ ] Bookmarked a post → Closed app → Reopened → **Bookmark still there** ✅
- [ ] Sent message → **Appears in conversation list** ✅
- [ ] Badge counts show correct numbers ✅

If all checked, **your app is fully functional!** 🎉
