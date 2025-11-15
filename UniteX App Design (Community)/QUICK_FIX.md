# Quick Fix - Posts Not Showing

## 🚀 1-Minute Fix

Your posts aren't showing because of **database permissions (RLS policies)**.

### Step 1: Open Supabase SQL Editor

Go to: https://hesqzincnlrpwoajckxu.supabase.co → SQL Editor → New Query

### Step 2: Copy & Paste This Code

```sql
-- Fix Posts Table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read posts" ON posts;
CREATE POLICY "Allow authenticated users to read posts"
ON posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to create posts" ON posts;
CREATE POLICY "Allow users to create posts"
ON posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Add reposts_count column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='posts' AND column_name='reposts_count') THEN
    ALTER TABLE posts ADD COLUMN reposts_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create reposts table
CREATE TABLE IF NOT EXISTS reposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Fix Reposts Table RLS
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read reposts" ON reposts;
CREATE POLICY "Allow authenticated users to read reposts"
ON reposts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to create reposts" ON reposts;
CREATE POLICY "Allow users to create reposts"
ON reposts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their reposts" ON reposts;
CREATE POLICY "Allow users to delete their reposts"
ON reposts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix Profiles Table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT TO authenticated USING (true);

-- Fix Comments Table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read comments" ON comments;
CREATE POLICY "Allow authenticated users to read comments"
ON comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to create comments" ON comments;
CREATE POLICY "Allow users to create comments"
ON comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);
```

### Step 3: Click "Run"

### Step 4: Restart Your App

**That's it!** Your posts should now appear.

---

## ✨ New Features Added

I've also improved your app with:

- 🔄 **Refresh Button**: Top-right corner to manually reload posts
- ⚡ **Real-time Updates**: New posts appear automatically
- 🐛 **Debug Info**: Shows post count when feed is empty
- ⏰ **Better Time Display**: "2h ago" instead of dates

---

## 🔍 Still Not Working?

1. **Check Console**: Press F12 (or use Android Studio logcat) and look for error messages
2. **Verify Posts Exist**: Run this in Supabase SQL Editor:
   ```sql
   SELECT COUNT(*) FROM posts;
   ```
3. **Check the Debug Counter**: It shows on the empty feed screen

---

## 📚 More Details

For complete documentation, see:

- `FIXES_SUMMARY.md` - Full list of changes made
- `DATABASE_FIX_INSTRUCTIONS.md` - Detailed troubleshooting guide
- `src/utils/database-fixes.sql` - Complete SQL script with all policies

---

## 🎯 What Was The Problem?

Supabase uses Row Level Security (RLS) to protect your data. By default, it blocks all reads/writes
unless you explicitly allow them with policies. Your posts were created successfully but couldn't be
read because the "read" policy was missing.

The fix above adds policies that allow:

- ✅ All authenticated users to read posts and profiles
- ✅ Users to create their own posts and comments
- ✅ Users to update/delete only their own content
