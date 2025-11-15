# Debug & Fix - Likes and Messages Not Working

## 🔴 Current Issues

1. ✅ **Bookmarks** - Working!
2. ❌ **Likes** - Not showing (stays at 0)
3. ❌ **Comments** - Not showing counts
4. ❌ **Messages list** - Empty (but messages exist in chats)

---

## 🔍 Step 1: Debug in Supabase

Let's check what's actually in your database:

### Check 1: Do likes exist?

Run this in Supabase SQL Editor:

```sql
-- Check if likes table exists and has data
SELECT COUNT(*) as total_likes FROM likes;

-- See all likes
SELECT l.*, p.content as post_content, pr.username as liked_by
FROM likes l
JOIN posts p ON l.post_id = p.id
JOIN profiles pr ON l.user_id = pr.id
ORDER BY l.created_at DESC
LIMIT 10;
```

**Expected**: Should show your likes

**If shows 0**: Likes aren't being saved - there's an error when clicking like

### Check 2: Are triggers working?

```sql
-- Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'likes';
```

**Expected**: Should show 2 triggers:

- `on_like_added`
- `on_like_removed`

**If missing**: Triggers weren't created - SQL script didn't run fully

### Check 3: Check post like counts

```sql
-- See posts and their like counts
SELECT 
  p.id,
  p.content,
  p.likes_count as stored_count,
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as actual_count
FROM posts p
ORDER BY p.created_at DESC
LIMIT 5;
```

**Expected**: `stored_count` should match `actual_count`

**If different**: Triggers aren't firing - need to fix them

### Check 4: Check messages

```sql
-- Check if messages have is_read column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('is_read', 'message_type');
```

**Expected**: Should show both columns

**If missing**: SQL script didn't run or failed

### Check 5: Are there actually messages?

```sql
-- See all messages
SELECT 
  m.id,
  m.content,
  m.is_read,
  m.created_at,
  sender.username as from_user,
  receiver.username as to_user
FROM messages m
JOIN profiles sender ON m.sender_id = sender.id
JOIN profiles receiver ON m.receiver_id = receiver.id
ORDER BY m.created_at DESC
LIMIT 10;
```

**Expected**: Should show your messages with `is_read` column

---

## 🔧 Step 2: Fix Based on Results

### Fix A: If Likes Table is Empty

**Problem**: Clicking like isn't saving to database

**Solution**: Check browser console for errors

1. Open UniteX in Chrome
2. Press F12
3. Click a like button
4. Look for errors in Console tab

**Common errors**:

- `permission denied` → RLS policy issue
- `relation "likes" does not exist` → Table not created
- `violates foreign key constraint` → Post ID or User ID is wrong

**Fix RLS if needed**:

```sql
DROP POLICY IF EXISTS "Users can like posts" ON likes;
CREATE POLICY "Users can like posts" ON likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Fix B: If Triggers Don't Exist

**Problem**: Triggers weren't created

**Solution**: Run this to create them:

```sql
-- Create trigger functions
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

-- Create triggers
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

### Fix C: If Like Counts Don't Match

**Problem**: Existing likes don't have correct counts

**Solution**: Manually fix the counts:

```sql
-- Recalculate all like counts
UPDATE posts p
SET likes_count = (
  SELECT COUNT(*) FROM likes WHERE post_id = p.id
);

-- Verify
SELECT p.id, p.content, p.likes_count, 
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as actual
FROM posts p
LIMIT 5;
```

### Fix D: If Messages Column Missing

**Problem**: SQL script didn't add columns

**Solution**: Run this:

```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Update existing messages
UPDATE messages SET is_read = false WHERE is_read IS NULL;
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;
```

### Fix E: Messages Exist But List is Empty

**Problem**: Frontend query is failing

**Solution**: Check the query in browser console:

1. Open Messages screen
2. Open browser console (F12)
3. Look for error messages
4. Check what `fetchConversations` is returning

**Manual test query**:

```sql
-- Replace YOUR_USER_ID with your actual ID
SELECT 
  m.*,
  sender.full_name as sender_name,
  receiver.full_name as receiver_name
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
WHERE m.sender_id = 'YOUR_USER_ID' OR m.receiver_id = 'YOUR_USER_ID'
ORDER BY m.created_at DESC;
```

---

## 🧪 Step 3: Test Each Fix

### Test Likes:

1. Like a post
2. Run in Supabase:
   ```sql
   SELECT COUNT(*) FROM likes;
   ```
3. Should increase by 1
4. Check post:
   ```sql
   SELECT likes_count FROM posts WHERE id = 'POST_ID';
   ```
5. Should be updated

### Test Messages:

1. Send a message to yourself
2. Run in Supabase:
   ```sql
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 1;
   ```
3. Should show the message with `is_read = false`
4. Check in app - should appear in list

---

## 🚀 Complete Fix Script

If nothing is working, run this complete script:

```sql
-- ========================================
-- COMPLETE FIX - RUN THIS
-- ========================================

-- Fix Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
UPDATE messages SET is_read = false WHERE is_read IS NULL;
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;

-- Create Likes Table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on Likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all policies
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can like posts" ON likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON likes;

CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, is_read);

-- Create/recreate triggers
CREATE OR REPLACE FUNCTION increment_post_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_added ON likes;
CREATE TRIGGER on_like_added AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_post_likes();

DROP TRIGGER IF EXISTS on_like_removed ON likes;
CREATE TRIGGER on_like_removed AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_post_likes();

-- Fix existing like counts
UPDATE posts p SET likes_count = (
  SELECT COUNT(*) FROM likes WHERE post_id = p.id
);

-- Verify
SELECT '✅ Messages fixed' as status;
SELECT '✅ Likes table created' as status;
SELECT '✅ Triggers created' as status;
SELECT '✅ Counts updated' as status;

-- Show current state
SELECT 'Total likes in DB:' as info, COUNT(*) as count FROM likes;
SELECT 'Total messages:' as info, COUNT(*) as count FROM messages;
```

---

## 📋 Debugging Checklist

Run through this checklist:

- [ ] Run Check 1 - Likes exist in database?
- [ ] Run Check 2 - Triggers exist?
- [ ] Run Check 3 - Like counts match?
- [ ] Run Check 4 - Messages have is_read column?
- [ ] Run Check 5 - Messages exist in database?
- [ ] Open browser console - Any errors?
- [ ] Run complete fix script above
- [ ] Clear app data and reinstall
- [ ] Test like button - Does it save?
- [ ] Test messages - Do they appear in list?

---

## 🆘 If Still Not Working

Share these results with me:

1. Output of Check 1 (likes count)
2. Output of Check 2 (triggers)
3. Output of Check 3 (like counts comparison)
4. Output of Check 5 (messages with is_read)
5. Any errors from browser console
6. Screenshot of Supabase RLS policies for `likes` table

Then I can help you debug further!
