-- ========================================================================
-- UNITEX - Feed Suggestion Algorithm Database Schema (FIXED VERSION)
-- ========================================================================
-- This is a fixed version that handles potential column name conflicts
-- Run this INSTEAD of the original feed-algorithm-schema.sql
-- ========================================================================

-- ========================================
-- STEP 0: CLEANUP (Optional - uncomment if re-running)
-- ========================================
-- DROP TRIGGER IF EXISTS on_post_interaction ON post_interactions;
-- DROP TRIGGER IF EXISTS on_post_content_change ON posts;
-- DROP TRIGGER IF EXISTS on_follow_change ON follows;
-- DROP FUNCTION IF EXISTS update_user_interests_from_interaction();
-- DROP FUNCTION IF EXISTS auto_extract_hashtags();
-- DROP FUNCTION IF EXISTS get_trending_hashtags(INTEGER, INTERVAL);
-- DROP FUNCTION IF EXISTS extract_and_store_hashtags(UUID, TEXT);
-- DROP FUNCTION IF EXISTS get_personalized_feed(UUID, INTEGER, INTEGER);
-- DROP FUNCTION IF EXISTS update_follow_counts();
-- DROP TABLE IF EXISTS post_interactions CASCADE;
-- DROP TABLE IF EXISTS user_interests CASCADE;
-- DROP TABLE IF EXISTS post_hashtags CASCADE;
-- DROP TABLE IF EXISTS hashtags CASCADE;
-- DROP TABLE IF EXISTS follows CASCADE;

-- ========================================
-- 1. FOLLOWS TABLE (Follow Graph)
-- ========================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created ON follows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows 
  FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- 2. HASHTAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hashtags_normalized ON hashtags(normalized_name);
CREATE INDEX IF NOT EXISTS idx_hashtags_usage ON hashtags(usage_count DESC);

-- Enable Row Level Security
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view hashtags" ON hashtags;
CREATE POLICY "Anyone can view hashtags" ON hashtags FOR SELECT USING (true);

-- ========================================
-- 3. POST_HASHTAGS TABLE (Junction) - EXPLICIT CREATION
-- ========================================
-- Drop existing if has wrong schema
DROP TABLE IF EXISTS post_hashtags CASCADE;

-- Create with explicit column names
CREATE TABLE post_hashtags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  hashtag_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT post_hashtags_unique UNIQUE(post_id, hashtag_id),
  CONSTRAINT post_hashtags_post_fk FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT post_hashtags_hashtag_fk FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
);

-- Verify columns exist
DO $$ 
BEGIN
  -- Check if columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_hashtags' AND column_name = 'post_id'
  ) THEN
    RAISE EXCEPTION 'post_hashtags.post_id column not created!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_hashtags' AND column_name = 'hashtag_id'
  ) THEN
    RAISE EXCEPTION 'post_hashtags.hashtag_id column not created!';
  END IF;
  
  RAISE NOTICE 'post_hashtags table created successfully with all columns';
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_both ON post_hashtags(post_id, hashtag_id);

-- Enable Row Level Security
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post hashtags" ON post_hashtags;
CREATE POLICY "Anyone can view post hashtags" ON post_hashtags FOR SELECT USING (true);

-- ========================================
-- 4. USER_INTERESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE NOT NULL,
  interest_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hashtag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_hashtag ON user_interests(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_score ON user_interests(interest_score DESC);

-- Enable Row Level Security
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own interests" ON user_interests;
CREATE POLICY "Users can view own interests" ON user_interests 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own interests" ON user_interests;
CREATE POLICY "Users can manage own interests" ON user_interests 
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 5. POST_INTERACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'comment', 'share', 'bookmark', 'click')),
  interaction_weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);

-- Enable Row Level Security
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own interactions" ON post_interactions;
CREATE POLICY "Users can view own interactions" ON post_interactions 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create interactions" ON post_interactions;
CREATE POLICY "Users can create interactions" ON post_interactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 6. HELPER FUNCTION - Extract and Store Hashtags
-- ========================================
CREATE OR REPLACE FUNCTION extract_and_store_hashtags(
  p_post_id UUID,
  p_content TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_hashtag TEXT;
  v_hashtag_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Extract hashtags using regex (matches #word)
  FOR v_hashtag IN 
    SELECT DISTINCT LOWER(substring(match[1] FROM 2))
    FROM regexp_matches(p_content, '#(\w+)', 'g') AS match
  LOOP
    -- Insert or get existing hashtag
    INSERT INTO hashtags (name, normalized_name, usage_count)
    VALUES (v_hashtag, v_hashtag, 1)
    ON CONFLICT (normalized_name) 
    DO UPDATE SET 
      usage_count = hashtags.usage_count + 1,
      updated_at = NOW()
    RETURNING id INTO v_hashtag_id;
    
    -- Link post to hashtag - EXPLICIT column names
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (p_post_id, v_hashtag_id)
    ON CONFLICT ON CONSTRAINT post_hashtags_unique DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. AUTO-EXTRACT HASHTAGS ON POST INSERT/UPDATE
-- ========================================
CREATE OR REPLACE FUNCTION auto_extract_hashtags() RETURNS TRIGGER AS $$
BEGIN
  PERFORM extract_and_store_hashtags(NEW.id, NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_content_change ON posts;
CREATE TRIGGER on_post_content_change
  AFTER INSERT OR UPDATE OF content ON posts
  FOR EACH ROW 
  EXECUTE FUNCTION auto_extract_hashtags();

-- ========================================
-- 8. TRIGGERS - Update Follow Counts
-- ========================================
CREATE OR REPLACE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ========================================
-- 9. AUTO-UPDATE USER INTERESTS FROM INTERACTIONS
-- ========================================
CREATE OR REPLACE FUNCTION update_user_interests_from_interaction() RETURNS TRIGGER AS $$
DECLARE
  v_hashtag_record RECORD;
  v_weight DECIMAL(3,2);
BEGIN
  -- Determine interaction weight
  v_weight := CASE NEW.interaction_type
    WHEN 'view' THEN 0.05
    WHEN 'like' THEN 0.20
    WHEN 'comment' THEN 0.40
    WHEN 'share' THEN 0.30
    WHEN 'bookmark' THEN 0.35
    WHEN 'click' THEN 0.10
    ELSE 0.05
  END;
  
  -- Update interest scores for all hashtags in the post - EXPLICIT table alias
  FOR v_hashtag_record IN
    SELECT ph.hashtag_id
    FROM post_hashtags ph
    WHERE ph.post_id = NEW.post_id
  LOOP
    INSERT INTO user_interests (user_id, hashtag_id, interest_score)
    VALUES (NEW.user_id, v_hashtag_record.hashtag_id, v_weight)
    ON CONFLICT (user_id, hashtag_id)
    DO UPDATE SET
      interest_score = LEAST(
        user_interests.interest_score + v_weight * 0.5,
        1.0
      ),
      updated_at = NOW();
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_interaction ON post_interactions;
CREATE TRIGGER on_post_interaction
  AFTER INSERT ON post_interactions
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_interests_from_interaction();

-- ========================================
-- 10. FEED ALGORITHM - MAIN FUNCTION (SIMPLIFIED & FIXED)
-- ========================================
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  post_id UUID,
  author_id UUID,
  content TEXT,
  media_urls TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance_score DECIMAL,
  score_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Get user's followed accounts
  followed_users AS (
    SELECT f.following_id 
    FROM follows f
    WHERE f.follower_id = p_user_id
  ),
  
  -- Get user's hashtag interests with scores
  user_hashtag_interests AS (
    SELECT 
      ui.hashtag_id,
      ui.interest_score
    FROM user_interests ui
    WHERE ui.user_id = p_user_id
  ),
  
  -- Pre-compute hashtag matches for each post
  post_hashtag_scores AS (
    SELECT 
      ph.post_id,
      AVG(uhi.interest_score) as avg_interest_score
    FROM post_hashtags ph
    INNER JOIN user_hashtag_interests uhi ON ph.hashtag_id = uhi.hashtag_id
    GROUP BY ph.post_id
  ),
  
  -- Calculate post scores
  ranked_posts AS (
    SELECT 
      p.id AS post_id,
      p.author_id,
      p.content,
      p.media_urls,
      p.likes_count,
      p.comments_count,
      p.shares_count,
      p.created_at,
      
      -- 1. Follow Score
      CASE 
        WHEN p.author_id IN (SELECT following_id FROM followed_users) THEN 1.0
        ELSE 0.0
      END AS follow_score,
      
      -- 2. Hashtag Score (from pre-computed CTE)
      COALESCE(phs.avg_interest_score, 0.0) AS hashtag_score,
      
      -- 3. Interaction Score (simplified - count recent interactions on similar posts)
      COALESCE(
        (SELECT COUNT(*) * 0.1
         FROM post_interactions pi
         WHERE pi.user_id = p_user_id 
           AND pi.created_at > NOW() - INTERVAL '30 days'
           AND pi.post_id IN (
             SELECT DISTINCT ph2.post_id 
             FROM post_hashtags ph1
             INNER JOIN post_hashtags ph2 
               ON ph1.hashtag_id = ph2.hashtag_id
             WHERE ph1.post_id = p.id 
               AND ph2.post_id != p.id
           )
         LIMIT 10
        )::DECIMAL, 0.0
      ) AS interaction_score,
      
      -- 4. Recency Score
      CASE
        WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN 1.0
        WHEN p.created_at > NOW() - INTERVAL '6 hours' THEN 0.8
        WHEN p.created_at > NOW() - INTERVAL '24 hours' THEN 0.6
        WHEN p.created_at > NOW() - INTERVAL '3 days' THEN 0.4
        WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 0.2
        ELSE 0.1
      END AS recency_score,
      
      -- 5. Engagement Boost
      LEAST(
        (COALESCE(p.likes_count, 0) * 0.3 + 
         COALESCE(p.comments_count, 0) * 0.5 + 
         COALESCE(p.shares_count, 0) * 0.2) / 10.0,
        1.0
      ) AS engagement_score
      
    FROM posts p
    LEFT JOIN post_hashtag_scores phs ON p.id = phs.post_id
    WHERE p.created_at > NOW() - INTERVAL '30 days'
      AND p.author_id != p_user_id
  )
  
  SELECT 
    rp.post_id,
    rp.author_id,
    rp.content,
    rp.media_urls,
    rp.likes_count,
    rp.comments_count,
    rp.shares_count,
    rp.created_at,
    
    -- Calculate final relevance score
    (
      rp.follow_score * 0.30 +
      rp.hashtag_score * 0.25 +
      rp.interaction_score * 0.15 +
      rp.recency_score * 0.20 +
      rp.engagement_score * 0.10
    )::DECIMAL(10,4) AS relevance_score,
    
    -- Return breakdown for transparency
    jsonb_build_object(
      'follow_score', rp.follow_score,
      'hashtag_score', rp.hashtag_score,
      'interaction_score', rp.interaction_score,
      'recency_score', rp.recency_score,
      'engagement_score', rp.engagement_score
    ) AS score_breakdown
    
  FROM ranked_posts rp
  ORDER BY relevance_score DESC, rp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ========================================
-- 11. HELPER FUNCTION - Get Trending Hashtags
-- ========================================
CREATE OR REPLACE FUNCTION get_trending_hashtags(
  p_limit INTEGER DEFAULT 10,
  p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE(
  hashtag_name TEXT,
  recent_usage_count BIGINT,
  total_usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.name,
    COUNT(ph.id) AS recent_usage_count,
    h.usage_count AS total_usage_count
  FROM hashtags h
  INNER JOIN post_hashtags ph ON h.id = ph.hashtag_id
  INNER JOIN posts p ON ph.post_id = p.id
  WHERE p.created_at > NOW() - p_time_window
  GROUP BY h.id, h.name, h.usage_count
  ORDER BY recent_usage_count DESC, total_usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ========================================
-- 12. ADD MISSING COLUMNS TO PROFILES TABLE
-- ========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_following ON profiles(following_count DESC);

-- ========================================
-- VERIFICATION & INITIALIZATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Feed Algorithm Schema Installation Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Verify tables
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ follows';
  RAISE NOTICE '  ✓ hashtags';
  RAISE NOTICE '  ✓ post_hashtags (with columns: id, post_id, hashtag_id, created_at)';
  RAISE NOTICE '  ✓ user_interests';
  RAISE NOTICE '  ✓ post_interactions';
  RAISE NOTICE '';
  
  -- Verify functions
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  ✓ get_personalized_feed()';
  RAISE NOTICE '  ✓ extract_and_store_hashtags()';
  RAISE NOTICE '  ✓ get_trending_hashtags()';
  RAISE NOTICE '  ✓ update_follow_counts()';
  RAISE NOTICE '  ✓ auto_extract_hashtags()';
  RAISE NOTICE '  ✓ update_user_interests_from_interaction()';
  RAISE NOTICE '';
  
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  ✓ on_follow_change';
  RAISE NOTICE '  ✓ on_post_content_change';
  RAISE NOTICE '  ✓ on_post_interaction';
  RAISE NOTICE '';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Installation successful! ✅';
  RAISE NOTICE '========================================';
END $$;

-- Test query to verify post_hashtags structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'post_hashtags'
ORDER BY ordinal_position;
