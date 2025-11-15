-- Database fixes for UniteX app
-- Run these commands in your Supabase SQL editor

-- 1. Check if RLS is enabled on posts table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'posts';

-- 2. Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- 3. Enable RLS on posts table (if not already enabled)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow all authenticated users to read posts
DROP POLICY IF EXISTS "Allow authenticated users to read posts" ON posts;
CREATE POLICY "Allow authenticated users to read posts"
ON posts FOR SELECT
TO authenticated
USING (true);

-- 5. Create policy to allow users to insert their own posts
DROP POLICY IF EXISTS "Allow users to create posts" ON posts;
CREATE POLICY "Allow users to create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 6. Create policy to allow users to update their own posts
DROP POLICY IF EXISTS "Allow users to update own posts" ON posts;
CREATE POLICY "Allow users to update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 7. Create policy to allow users to delete their own posts
DROP POLICY IF EXISTS "Allow users to delete own posts" ON posts;
CREATE POLICY "Allow users to delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 8. Check profiles table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
CREATE POLICY "Allow users to update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 9. Check comments table RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read comments" ON comments;
CREATE POLICY "Allow authenticated users to read comments"
ON comments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow users to create comments" ON comments;
CREATE POLICY "Allow users to create comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 10. Verify posts exist
SELECT COUNT(*) as total_posts FROM posts;
SELECT id, author_id, content, created_at, is_approved FROM posts ORDER BY created_at DESC LIMIT 10;

-- 11. Create reposts table if it doesn't exist
CREATE TABLE IF NOT EXISTS reposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 12. Enable RLS on reposts table
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read reposts" ON reposts;
CREATE POLICY "Allow authenticated users to read reposts"
ON reposts FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow users to create reposts" ON reposts;
CREATE POLICY "Allow users to create reposts"
ON reposts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their reposts" ON reposts;
CREATE POLICY "Allow users to delete their reposts"
ON reposts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 13. Add reposts_count column to posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='posts' AND column_name='reposts_count') THEN
    ALTER TABLE posts ADD COLUMN reposts_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 14. Check if foreign key constraint exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='posts';
