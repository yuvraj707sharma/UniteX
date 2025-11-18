-- ========================================================================
-- UNITEX - Feed Suggestion Algorithm Database Schema
-- ========================================================================
-- This schema implements a lightweight, explainable feed ranking algorithm
-- that considers: hashtags/topics, follow graph, interactions, and recency
-- ========================================================================

-- ========================================
-- 1. FOLLOWS TABLE (Follow Graph)
-- ========================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Triggers to update follower counts on profiles
CREATE OR REPLACE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE profiles SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    -- Increment followers count for followed user
    UPDATE profiles SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.follower_id;
    -- Decrement followers count for followed user
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
-- 2. HASHTAGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT UNIQUE NOT NULL, -- lowercase version for matching
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
-- 3. POST_HASHTAGS TABLE (Junction)
-- ========================================
CREATE TABLE IF NOT EXISTS post_hashtags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, hashtag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);

-- Enable Row Level Security
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post hashtags" ON post_hashtags;
CREATE POLICY "Anyone can view post hashtags" ON post_hashtags FOR SELECT USING (true);

-- ========================================
-- 4. USER_INTERESTS TABLE (Topic Following)
-- ========================================
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE NOT NULL,
  interest_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0, auto-calculated based on interactions
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
-- Tracks all user interactions with posts for feed ranking
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'comment', 'share', 'bookmark', 'click')),
  interaction_weight DECIMAL(3,2) DEFAULT 1.0, -- Weight: view=0.1, like=0.5, comment=1.0, share=0.8, bookmark=0.7
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
-- 6. FEED ALGORITHM - MAIN FUNCTION
-- ========================================
-- Function: get_personalized_feed
-- Returns ranked posts based on:
-- - Follow graph (posts from followed users)
-- - Hashtag interests (posts with hashtags user interacts with)
-- - Interaction history (engagement patterns)
-- - Recency (time decay)
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
    SELECT following_id 
    FROM follows 
    WHERE follower_id = p_user_id
  ),
  
  -- Get user's hashtag interests with scores
  user_hashtag_interests AS (
    SELECT 
      ui.hashtag_id,
      ui.interest_score
    FROM user_interests ui
    WHERE ui.user_id = p_user_id
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
      
      -- Score Components (each 0-1, total max 4.0)
      
      -- 1. Follow Score (1.0 if from followed user, 0.0 otherwise)
      CASE 
        WHEN p.author_id IN (SELECT following_id FROM followed_users) THEN 1.0
        ELSE 0.0
      END AS follow_score,
      
      -- 2. Hashtag Score (average interest score for post's hashtags)
      COALESCE(
        (SELECT AVG(uhi.interest_score)
         FROM post_hashtags ph
         INNER JOIN user_hashtag_interests uhi ON ph.hashtag_id = uhi.hashtag_id
         WHERE ph.post_id = p.id
        ), 0.0
      ) AS hashtag_score,
      
      -- 3. Interaction Score (based on past similar content engagement)
      COALESCE(
        (SELECT COUNT(*) * 0.1
         FROM post_interactions pi
         WHERE pi.user_id = p_user_id 
           AND pi.post_id IN (
             -- Posts with similar hashtags
             SELECT DISTINCT ph2.post_id 
             FROM post_hashtags ph1
             INNER JOIN post_hashtags ph2 ON ph1.hashtag_id = ph2.hashtag_id
             WHERE ph1.post_id = p.id AND ph2.post_id != p.id
           )
           AND pi.created_at > NOW() - INTERVAL '30 days'
         LIMIT 10
        ), 0.0
      ) AS interaction_score,
      
      -- 4. Recency Score (exponential decay, max 1.0)
      CASE
        WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN 1.0
        WHEN p.created_at > NOW() - INTERVAL '6 hours' THEN 0.8
        WHEN p.created_at > NOW() - INTERVAL '24 hours' THEN 0.6
        WHEN p.created_at > NOW() - INTERVAL '3 days' THEN 0.4
        WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 0.2
        ELSE 0.1
      END AS recency_score,
      
      -- 5. Engagement Boost (normalized engagement metric)
      LEAST(
        (p.likes_count * 0.3 + p.comments_count * 0.5 + p.shares_count * 0.2) / 10.0,
        1.0
      ) AS engagement_score
      
    FROM posts p
    WHERE p.created_at > NOW() - INTERVAL '30 days' -- Only recent posts
      AND p.author_id != p_user_id -- Don't show user's own posts
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
    
    -- Calculate final relevance score (weighted sum)
    (
      rp.follow_score * 0.30 +        -- 30% weight on follow graph
      rp.hashtag_score * 0.25 +       -- 25% weight on hashtag interests
      rp.interaction_score * 0.15 +   -- 15% weight on past interactions
      rp.recency_score * 0.20 +       -- 20% weight on recency
      rp.engagement_score * 0.10      -- 10% weight on engagement
    )::DECIMAL(10,4) AS relevance_score,
    
    -- Return breakdown for transparency/debugging
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
-- 7. HELPER FUNCTION - Extract and Store Hashtags from Post
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
    SELECT DISTINCT LOWER(substring(match[1] FROM 2)) -- Remove # and lowercase
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
    
    -- Link post to hashtag
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (p_post_id, v_hashtag_id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. AUTO-EXTRACT HASHTAGS ON POST INSERT/UPDATE
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
-- 9. AUTO-UPDATE USER INTERESTS
-- ========================================
-- When a user interacts with a post, update their hashtag interests
CREATE OR REPLACE FUNCTION update_user_interests_from_interaction() RETURNS TRIGGER AS $$
DECLARE
  v_hashtag RECORD;
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
  
  -- Update interest scores for all hashtags in the post
  FOR v_hashtag IN
    SELECT ph.hashtag_id
    FROM post_hashtags ph
    WHERE ph.post_id = NEW.post_id
  LOOP
    INSERT INTO user_interests (user_id, hashtag_id, interest_score)
    VALUES (NEW.user_id, v_hashtag.hashtag_id, v_weight)
    ON CONFLICT (user_id, hashtag_id)
    DO UPDATE SET
      interest_score = LEAST(
        user_interests.interest_score + v_weight * 0.5, -- Incremental learning
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
-- 10. HELPER FUNCTION - Get Trending Hashtags
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
-- 11. ADD MISSING COLUMNS TO PROFILES TABLE
-- ========================================
-- Ensure profiles table has follower/following counts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_following ON profiles(following_count DESC);

-- ========================================
-- VERIFICATION & INITIALIZATION
-- ========================================
SELECT '✅ Feed algorithm schema created successfully!' AS status;
SELECT 'Tables created:' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('follows', 'hashtags', 'post_hashtags', 'user_interests', 'post_interactions')
ORDER BY table_name;

SELECT 'Functions created:' AS info;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_personalized_feed',
    'extract_and_store_hashtags',
    'get_trending_hashtags',
    'update_user_interests_from_interaction',
    'auto_extract_hashtags',
    'update_follow_counts'
  )
ORDER BY routine_name;
