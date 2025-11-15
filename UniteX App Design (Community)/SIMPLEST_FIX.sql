-- ============================================
-- SIMPLEST FIX - Guaranteed to Work
-- ============================================
-- Run this in Supabase SQL Editor

-- Drop the problematic table
DROP TABLE IF EXISTS post_likes CASCADE;

-- Create the simplest possible version (no UUID conflicts!)
CREATE TABLE post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Add foreign keys manually (safer)
ALTER TABLE post_likes 
  ADD CONSTRAINT fk_post 
  FOREIGN KEY (post_id) 
  REFERENCES posts(id) 
  ON DELETE CASCADE;

ALTER TABLE post_likes 
  ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "view_all" ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON post_likes TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE post_likes_id_seq TO authenticated;

-- Create indexes
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- Create simple trigger
CREATE OR REPLACE FUNCTION handle_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS like_count_trigger ON post_likes;
CREATE TRIGGER like_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION handle_like_count();

-- Test query to verify it worked
SELECT 
  'Table created successfully!' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'post_likes';
