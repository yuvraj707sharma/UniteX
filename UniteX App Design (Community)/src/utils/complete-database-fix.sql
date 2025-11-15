-- ========================================================================
-- UNITEX - Complete Database Fix Script
-- Run this ONCE in your Supabase SQL Editor to fix all data persistence issues
-- ========================================================================

-- ========================================
-- FIX 1: Messages Table (Fix conversation list)
-- ========================================
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
UPDATE messages SET is_read = false WHERE is_read IS NULL;
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread 
  ON messages(receiver_id, is_read, created_at DESC) WHERE is_read = false;

-- ========================================
-- FIX 2: Likes Table (Fix likes persistence)
-- ========================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON likes;
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON likes;
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
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
-- FIX 3: Bookmarks Table (Fix bookmarks persistence)
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks" ON bookmarks 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark posts" ON bookmarks;
CREATE POLICY "Users can bookmark posts" ON bookmarks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarks;
CREATE POLICY "Users can remove bookmarks" ON bookmarks 
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_id);

-- ========================================
-- Verify Everything Was Created
-- ========================================
SELECT '✅ Messages table fixed!' as status;
SELECT 'Columns:' as info, column_name FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name IN ('is_read', 'message_type');

SELECT '✅ Likes table created!' as status;
SELECT 'Total likes:' as info, COUNT(*) as count FROM likes;

SELECT '✅ Bookmarks table created!' as status;
SELECT 'Total bookmarks:' as info, COUNT(*) as count FROM bookmarks;

SELECT '🎉 All fixes applied successfully!' as final_status;
