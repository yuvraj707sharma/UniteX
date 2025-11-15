-- ============================================
-- Fix RLS Policies for post_likes
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON post_likes;

-- Create new permissive policies for both authenticated and anon
CREATE POLICY "Enable read for all" 
  ON post_likes FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON post_likes FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users" 
  ON post_likes FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Also grant to anon role (for API access)
GRANT SELECT ON post_likes TO anon;
GRANT INSERT, DELETE ON post_likes TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE post_likes_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE post_likes_id_seq TO authenticated;

-- Verify policies
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'post_likes';

SELECT 'Policies updated successfully!' as result;
