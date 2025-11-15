# 🔍 Verify Post_Likes Table

## Your Code is Already Correct! ✅

The `PostCard.tsx` is already using `post_likes` table:

- ✅ Line 182: `.from('post_likes')`
- ✅ Line 217: `.from('post_likes')`
- ✅ Line 225: `.from('post_likes')`

## The Issue: Table Doesn't Exist or Not Accessible

Since you're still getting 404 errors, the problem is in the DATABASE, not the code.

---

## 🎯 ACTION: Verify & Fix Database

### Step 1: Check if `post_likes` table exists

Run this in **Supabase SQL Editor**:

```sql
-- Check if post_likes table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'post_likes';
```

**Expected Result:** Should show `post_likes`  
**If Empty:** The table doesn't exist! (Go to Step 2)

---

### Step 2: Create the `post_likes` table

```sql
-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT post_likes_post_user_unique UNIQUE (post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Grant permissions to API
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO anon;

-- Create RLS Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_likes;
CREATE POLICY "Enable read access for all users" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.post_likes;
CREATE POLICY "Enable insert for authenticated users only" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.post_likes;
CREATE POLICY "Enable delete for users based on user_id" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON public.post_likes(post_id, user_id);

-- Create trigger to auto-update like counts
CREATE OR REPLACE FUNCTION public.handle_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like_change ON public.post_likes;
CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_count();

-- Verify everything worked
SELECT 'post_likes table created successfully!' AS status;
```

---

### Step 3: Rebuild the App

After running the SQL:

```powershell
cd "C:/UniteX/UniteX App Design (Community)"
npm run build
npx cap sync android
cd android
.\gradlew assembleRelease
adb install app/build/outputs/apk/release/app-release.apk
```

---

### Step 4: Test

1. Open the app
2. Like a post
3. Check browser console - **NO 404 error!**
4. Close and reopen app - **Like should persist!**

---

## 🔍 Additional Debugging

If it STILL doesn't work after this, run:

```sql
-- Test manual insert
INSERT INTO public.post_likes (post_id, user_id) 
VALUES (
  '04549e21-bc13-456f-ab22-7fd4c3c76ce0',
  '7646b65a-83e9-4842-857a-861272d2de70'
);

-- Check if it worked
SELECT * FROM public.post_likes;
```

If this gives an error, **share the exact error message** and I'll fix it!

---

## ✅ Summary

- Your code is ALREADY correct ✅
- The problem is the `post_likes` table doesn't exist in database ❌
- Run Step 2 SQL to create it ✅
- Rebuild app ✅
- Likes will work! 🎉
