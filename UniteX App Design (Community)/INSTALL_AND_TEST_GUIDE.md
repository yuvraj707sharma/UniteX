# 🚀 Install & Test Community Posts Feature

## ✅ BUILD COMPLETE!

Your APK has been successfully built with the new **Community Posts** feature!

---

## 📦 APK Location

```
C:\UniteX\android\app\build\outputs\apk\release\app-release.apk
```

**File size:** ~3.5 MB

---

## 🔧 Installation Steps

### **Step 1: Connect Your Device**

1. Connect your Android phone via USB
2. Enable **USB Debugging** on your phone:
    - Go to Settings → About Phone
    - Tap "Build Number" 7 times
    - Go back → Developer Options
    - Enable "USB Debugging"
3. Allow USB Debugging popup on your phone

### **Step 2: Install APK**

Run this command in your terminal:

```powershell
cd "C:\UniteX\android"
adb install -r app\build\outputs\apk\release\app-release.apk
```

**OR** manually:

1. Copy `app-release.apk` to your phone
2. Open the file
3. Click "Install"

---

## 🧪 Testing Checklist

### **IMPORTANT: Run This SQL First!**

Before testing, make sure you ran this in Supabase:

```sql
-- 1. Add community_id to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);

-- 2. Fix NULL usernames
UPDATE public.communities
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- 3. Add default tags
UPDATE public.communities
SET tags = ARRAY['general']
WHERE tags IS NULL OR tags = '{}';

SELECT 'Database ready!' as status;
```

---

## ✅ Test Scenarios

### **Test 1: Create Community**

1. Open app → Go to Communities tab
2. Click "+" button
3. Enter name: "Test Group"
4. Enter description: "This is a test"
5. Click "Create"
6. **Expected:** Switches to "Joined" tab, shows "Test Group"

### **Test 2: View Community Detail**

1. On "Joined" tab, click "Test Group"
2. **Expected:** Shows community detail page with:
    - Community name
    - Description
    - Member count (1)
    - Two tabs: Posts, Members

### **Test 3: Create Community Post**

1. In community detail, click FAB (+ button)
2. **Expected:** Modal opens with "Post in Test Group"
3. Type: "This is my first community post!"
4. Click "Post"
5. **Expected:**
    - Toast: "Post created in community!"
    - Modal closes
    - Post appears in feed immediately

### **Test 4: View Post**

1. See your post in the feed
2. **Expected:**
    - Shows your avatar
    - Shows your name & username
    - Shows post content
    - Like button (0 likes)
    - Comment button (0 comments)

### **Test 5: Like Post**

1. Click heart icon on your community post
2. **Expected:**
    - Heart fills with color
    - Count changes from 0 to 1
    - Toast: "Liked post!"

### **Test 6: Unlike Post**

1. Click heart icon again
2. **Expected:**
    - Heart becomes outline
    - Count changes from 1 to 0
    - Toast: "Unliked post!"

### **Test 7: Persistence Test**

1. Like a post (count should be 1)
2. **Close the app completely**
3. Reopen the app
4. Go to Communities → Your community
5. **Expected:**
    - Post still shows liked (heart filled)
    - Count still shows 1
    - **This proves database is working!**

### **Test 8: Members Tab**

1. In community detail, click "Members" tab
2. **Expected:**
    - Shows YOU (your profile)
    - Shows your real avatar
    - Shows your real name & username
    - Shows "Member" role badge

### **Test 9: Post with Image**

1. Click FAB to create post
2. Click image icon
3. Select a photo from gallery
4. Write caption: "Check this out!"
5. Click "Post"
6. **Expected:**
    - Image preview shows before posting
    - Post appears with image
    - Image is visible in feed

### **Test 10: Delete Community (Admin)**

1. Go to Communities → "Joined" tab
2. Find your community
3. Click "Delete" button (only shows for creator)
4. Confirm deletion
5. **Expected:**
    - Community disappears
    - Toast: "Deleted Test Group"

### **Test 11: Join/Leave Community**

1. Go to "Explore" tab
2. Find a community (not yours)
3. Click "Join"
4. **Expected:**
    - Toast: "Joined [name]!"
    - Community moves to "Joined" tab
    - Can now post in it
5. Click "Joined" button (to leave)
6. **Expected:**
    - Toast: "Left [name]"
    - Community moves back to "Explore"

### **Test 12: Empty States**

1. Create new community
2. Open it (no posts yet)
3. **Expected:**
    - "No posts yet" message with emoji
    - "Be the first to post" text
4. Switch to Members tab (only you)
5. **Expected:**
    - Shows you as only member

### **Test 13: Multiple Posts**

1. Create 3-4 posts in a community
2. **Expected:**
    - All posts appear in chronological order
    - Each has correct like/comment count
    - Smooth scroll
    - Staggered animation on load

### **Test 14: Main Feed vs Community Feed**

1. Go to Home tab → Create a post (without community)
2. Go to Communities → Your community → Create post
3. **Expected:**
    - Home feed shows only non-community posts
    - Community feed shows only that community's posts
    - **They are separate!**

---

## 🐛 Troubleshooting

### **Issue: "Failed to create post"**

**Solution:** Make sure you ran the SQL to add `community_id` column to `posts` table.

### **Issue: Posts not showing in community**

**Solution:**

1. Check if `community_id` is being set correctly
2. Run this SQL to verify:
   ```sql
   SELECT id, content, community_id FROM posts WHERE community_id IS NOT NULL;
   ```

### **Issue: Like count not updating**

**Solution:** Check if triggers exist:

```sql
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'post_likes';
```

### **Issue: Username shows NULL**

**Solution:** Run the fix SQL:

```sql
UPDATE public.communities
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;
```

### **Issue: Can't join community**

**Solution:** Make sure you're logged in. Check RLS policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'community_members';
```

---

## 📊 Performance Benchmarks

### **Expected Performance:**

- Community list load: < 1 second
- Post creation: < 2 seconds (with image)
- Like action: < 500ms
- Feed refresh: < 1 second

### **If Slower:**

1. Check internet connection
2. Check Supabase dashboard for slow queries
3. Verify indexes exist:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'posts';
   SELECT indexname FROM pg_indexes WHERE tablename = 'community_members';
   ```

---

## 🎉 What's New in This Build

### **Features Added:**

✅ Community posts feed (real data)
✅ Create posts in communities
✅ Like/comment system working
✅ Pull-to-refresh support
✅ Loading animations
✅ Empty states
✅ FAB for creating posts
✅ Members tab with real data
✅ Delete community (admin only)
✅ Auto-switch to Joined tab after creation
✅ Search functionality in community detail

### **Bug Fixes:**

✅ Removed all mock/demo data
✅ Fixed like count not updating
✅ Fixed posts not persisting
✅ Fixed community not showing after creation

### **Database Updates:**

✅ Added `username` field to communities
✅ Added `avatar_url` field
✅ Added `banner_url` field
✅ Added `tags` array field
✅ Added `is_verified` boolean
✅ Added `community_id` to posts table
✅ Created role-based permissions
✅ Added triggers for auto-counting

---

## 🚀 Next Steps

After testing everything:

1. **Share the APK** with friends (use Google Drive/Telegram)
2. **Create 2-3 communities** for different topics
3. **Invite friends** to join
4. **Create engaging posts** with images
5. **Monitor Supabase** dashboard for activity

---

## 📝 Notes

- Posts in communities are **separate** from main feed
- Only members can post in communities
- Only creator can delete community
- Like/comment counts update automatically
- All data persists in database
- No more mock data!

---

## ✅ READY TO INSTALL!

**Just connect your phone and run:**

```powershell
cd "C:\UniteX\android"
adb install -r app\build\outputs\apk\release\app-release.apk
```

**Or share the APK file located at:**

```
C:\UniteX\android\app\build\outputs\apk\release\app-release.apk
```

**Test everything and enjoy your production-ready community feature!** 🎊
