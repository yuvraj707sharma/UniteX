# 🔴 URGENT: Fix Like Function Error

## The Problem

When you try to like a post, you get this error:

```
function exp(interval) does not exist
Error code: 42883
```

## Root Cause

The `post_likes` table was created using `gen_random_uuid()` which has a conflict with PostgreSQL's
`exp()` function. This is a known issue in some Supabase configurations.

## The Fix (5 minutes)

### Step 1: Run This SQL

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Click **SQL Editor**
3. Copy and paste this ENTIRE script:

```sql
-- Drop existing table
DROP TABLE IF EXISTS public.post_likes CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table with correct UUID function
CREATE TABLE public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT ON public.post_likes TO anon;

-- Create policies
CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);

-- Create trigger for auto-updating counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts 
    SET likes_count = COALESCE(likes_count, 0) + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

SELECT 'Success! post_likes table created!' as status;
```

4. Click **RUN**
5. You should see: `Success! post_likes table created!`

### Step 2: Test Immediately

1. **DON'T need to rebuild the app!**
2. Just **refresh the app** (pull down to refresh or close/reopen)
3. Try to **like a post**
4. It should work now! ✅

---

## Why This Happened

- `gen_random_uuid()` - Uses internal `exp()` function (CONFLICT ❌)
- `uuid_generate_v4()` - Uses uuid-ossp extension (WORKS ✅)

The fix changes from `gen_random_uuid()` to `uuid_generate_v4()` which avoids the function name
conflict.

---

## What if it still doesn't work?

If you still get an error after running the SQL, try this:

### Alternative Fix (Simpler)

```sql
-- Simplest possible table creation
DROP TABLE IF EXISTS post_likes CASCADE;

CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "insert_likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON post_likes TO authenticated;

SELECT 'Done!' as status;
```

This uses `SERIAL` instead of `UUID` for the ID, which completely avoids the issue.

---

## Expected Result

After running the SQL:

1. ✅ Click like → Heart fills in
2. ✅ Like count increases from 0 → 1
3. ✅ Click unlike → Count goes back to 0
4. ✅ Close app → Reopen → Counts persist!
5. ✅ Multiple users can like the same post

---

**Just run the SQL and refresh the app - that's it!** 🚀

The full SQL is also in `FIX_POST_LIKES_TABLE.sql` file.