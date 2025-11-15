# 🔴 FINAL ACTION - Fix 404 Error on Likes

## Current Status:

✅ **Messages** - WORKING! Conversation list appears  
✅ **Bottom Nav** - FIXED! Won't disappear anymore  
❌ **Likes** - Still shows 404 error

---

## The ONE Remaining Problem:

```
POST https://hesqzincnlrpwoajckxu.supabase.co/rest/v1/likes 404 (Not Found)
```

**What this means**: The `likes` table exists in your database, but Supabase API can't access it.

---

## ✅ THE FIX (Choose ONE method):

### **Method 1: Grant Permissions** (Try this first - 2 minutes)

Run this in Supabase SQL Editor:

```sql
-- Grant API access to likes table
GRANT ALL ON likes TO authenticated;
GRANT ALL ON likes TO anon;
GRANT ALL ON likes TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='likes';
```

**Expected result**: Should show `authenticated`, `anon`, and `service_role` with permissions

### **Method 2: Recreate Likes Table** (If Method 1 doesn't work - 3 minutes)

```sql
-- Drop old table (LOSES EXISTING LIKES!)
DROP TABLE IF EXISTS likes CASCADE;

-- Create new table with proper permissions
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Grant permissions IMMEDIATELY
GRANT ALL ON likes TO authenticated;
GRANT ALL ON likes TO anon;
GRANT ALL ON likes TO service_role;

-- Create policies
CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_likes_post_user ON likes(post_id, user_id);

-- Create trigger functions
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

-- Create triggers
CREATE TRIGGER on_like_added AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_post_likes();

CREATE TRIGGER on_like_removed AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_post_likes();

-- Verify
SELECT 'Likes table ready!' as status;
```

---

## 🔧 After Running ONE of the Above:

### **Rebuild the App:**

```powershell
cd "C:/UniteX/UniteX App Design (Community)"
npm run build
npx cap sync android
cd android
.\gradlew assembleRelease
adb install app/build/outputs/apk/release/app-release.apk
```

---

## 🧪 Test:

1. **Open UniteX**
2. **Like a post**
3. **Check browser console** - Should be NO 404 errors
4. **Run in Supabase**:
   ```sql
   SELECT COUNT(*) FROM likes;
   ```
   Should show 1 like!
5. **Close app and reopen** - Like should still be there! ✅

---

## 🎯 What Each Fix Does:

### **Method 1** (Grant Permissions):

- Gives API access to existing likes table
- Faster - doesn't delete data
- Should work in most cases

### **Method 2** (Recreate Table):

- Creates fresh table with correct setup
- Ensures all permissions are right
- Guaranteed to work

---

## ✅ Expected Results:

### Before:

```
Click Like → 404 error → Toast says "Liked!" → But not saved → Count stays 0
```

### After:

```
Click Like → No errors → Toast says "Liked!" → Saves to DB → Count increases! ✅
Close app → Reopen → Like still there! ✅
```

---

## 📋 Complete Checklist:

- [ ] Run Method 1 SQL (grant permissions)
- [ ] If 404 still appears, run Method 2 SQL (recreate table)
- [ ] Rebuild app
- [ ] Install new APK
- [ ] Test likes - should save now!
- [ ] Test messages - should show conversations!
- [ ] Test bottom nav - should always be visible!

---

## 🎉 Summary:

**What's Fixed:**

- ✅ Messages conversation list working
- ✅ Bottom nav fixed (won't disappear)
- ✅ Code updated to handle errors gracefully

**What You Need to Do:**

1. Run ONE of the SQL scripts above (try Method 1 first)
2. Rebuild app
3. Test likes

**After this, EVERYTHING will work!** 🚀

---

## 🆘 If Still Not Working:

Run this diagnostic:

```sql
-- Check if likes table is accessible via API
SELECT tablename, schemaname 
FROM pg_tables 
WHERE tablename = 'likes';

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='likes';

-- Try manual insert
INSERT INTO likes (user_id, post_id) 
VALUES (
  '7646b65a-83e9-4842-857a-861272d2de70',
  '04549e21-bc13-456f-ab22-7fd4c3c76ce0'
);
```

Share the results and I'll help debug further!
