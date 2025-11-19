-- ============================================
-- UNITEX BADGES SYSTEM - COMPLETE SQL SCHEMA
-- ============================================
-- This migration creates all tables, functions, triggers, and sample badges
-- for the UniteX Badges System
--
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Badges definition table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  icon_emoji TEXT, -- Fallback emoji if no URL
  category TEXT NOT NULL CHECK (category IN ('engagement', 'community', 'behavior', 'achievement')),
  criteria_type TEXT NOT NULL, -- e.g., 'posts_count', 'likes_received', 'daily_active_streak'
  criteria_value INTEGER NOT NULL, -- The threshold to achieve
  is_level_based BOOLEAN DEFAULT false, -- If true, can be earned multiple times at different levels
  level INTEGER DEFAULT 1, -- Badge level (for progression badges)
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 0, -- Gamification points awarded
  display_order INTEGER DEFAULT 0, -- Order in which badges are displayed
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges - tracks which badges users have earned
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- Current progress towards next level
  is_featured BOOLEAN DEFAULT false, -- User can feature this badge on their profile
  UNIQUE(user_id, badge_id)
);

-- User metrics - tracks user activity for badge calculation
CREATE TABLE IF NOT EXISTS user_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Engagement metrics
  posts_count INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Community metrics
  communities_joined INTEGER DEFAULT 0,
  communities_created INTEGER DEFAULT 0,
  
  -- Behavior metrics
  daily_active_streak INTEGER DEFAULT 0,
  total_active_days INTEGER DEFAULT 0,
  last_active_date DATE,
  violations_count INTEGER DEFAULT 0,
  
  -- Achievement metrics
  projects_created INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  collaborations_count INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_metrics_user_id_key UNIQUE(user_id)
);

-- Badge progress tracking (for level-based badges)
CREATE TABLE IF NOT EXISTS badge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  current_value INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_criteria_type ON badges(criteria_type);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_featured ON user_badges(user_id, is_featured);

CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_updated ON user_metrics(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_badge_progress_user_badge ON badge_progress(user_id, badge_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Badges: Everyone can read badge definitions
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
CREATE POLICY "Badges are viewable by everyone" 
  ON badges FOR SELECT 
  USING (is_active = true);

-- User Badges: Users can read their own and others' earned badges
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON user_badges;
CREATE POLICY "User badges are viewable by everyone" 
  ON user_badges FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update own badge preferences" ON user_badges;
CREATE POLICY "Users can update own badge preferences" 
  ON user_badges FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Metrics: Users can read their own metrics
DROP POLICY IF EXISTS "Users can view own metrics" ON user_metrics;
CREATE POLICY "Users can view own metrics" 
  ON user_metrics FOR SELECT 
  USING (auth.uid() = user_id);

-- Badge Progress: Users can read their own progress
DROP POLICY IF EXISTS "Users can view own progress" ON badge_progress;
CREATE POLICY "Users can view own progress" 
  ON badge_progress FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to initialize user metrics for new users
CREATE OR REPLACE FUNCTION initialize_user_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metrics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user_metrics when profile is created
DROP TRIGGER IF EXISTS on_profile_created_init_metrics ON profiles;
CREATE TRIGGER on_profile_created_init_metrics
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_metrics();

-- Function to update user metrics timestamp
CREATE OR REPLACE FUNCTION update_user_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_metrics_timestamp ON user_metrics;
CREATE TRIGGER update_user_metrics_timestamp
  BEFORE UPDATE ON user_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_metrics_timestamp();

-- ============================================
-- 6. BADGE CHECKING AND AWARDING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE(newly_awarded_badge_id UUID, badge_title TEXT) AS $$
DECLARE
  v_badge RECORD;
  v_metric_value INTEGER;
  v_already_earned BOOLEAN;
BEGIN
  -- Loop through all active badges
  FOR v_badge IN 
    SELECT * FROM badges WHERE is_active = true
  LOOP
    -- Check if user already has this badge
    SELECT EXISTS(
      SELECT 1 FROM user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_already_earned;
    
    -- Skip if already earned (unless level-based)
    IF v_already_earned AND NOT v_badge.is_level_based THEN
      CONTINUE;
    END IF;
    
    -- Get the metric value based on criteria_type
    EXECUTE format(
      'SELECT COALESCE(%I, 0) FROM user_metrics WHERE user_id = $1',
      v_badge.criteria_type
    ) INTO v_metric_value USING p_user_id;
    
    -- Check if criteria is met
    IF v_metric_value >= v_badge.criteria_value THEN
      -- Award the badge if not already earned
      IF NOT v_already_earned THEN
        INSERT INTO user_badges (user_id, badge_id, progress)
        VALUES (p_user_id, v_badge.id, v_metric_value)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        -- Return the newly awarded badge
        newly_awarded_badge_id := v_badge.id;
        badge_title := v_badge.title;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. METRIC UPDATE FUNCTIONS
-- ============================================

-- Update posts count
CREATE OR REPLACE FUNCTION increment_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metrics (user_id, posts_count)
  VALUES (NEW.author_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    posts_count = user_metrics.posts_count + 1,
    updated_at = NOW();
  
  -- Check for badges after incrementing
  PERFORM check_and_award_badges(NEW.author_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_created_increment_posts ON posts;
CREATE TRIGGER on_post_created_increment_posts
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION increment_posts_count();

-- Update likes received count
CREATE OR REPLACE FUNCTION increment_likes_received()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;
  
  IF v_post_author_id IS NOT NULL THEN
    INSERT INTO user_metrics (user_id, likes_received)
    VALUES (v_post_author_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      likes_received = user_metrics.likes_received + 1,
      updated_at = NOW();
    
    -- Check for badges
    PERFORM check_and_award_badges(v_post_author_id);
  END IF;
  
  -- Also increment likes_given for the liker
  INSERT INTO user_metrics (user_id, likes_given)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    likes_given = user_metrics.likes_given + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This requires a 'likes' or 'post_likes' table
-- Create it if it doesn't exist
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

DROP TRIGGER IF EXISTS on_like_created_increment_likes ON post_likes;
CREATE TRIGGER on_like_created_increment_likes
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_received();

-- Update comments count
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metrics (user_id, comments_count)
  VALUES (NEW.author_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    comments_count = user_metrics.comments_count + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Assuming 'comments' table exists
DROP TRIGGER IF EXISTS on_comment_created_increment_comments ON comments;
CREATE TRIGGER on_comment_created_increment_comments
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_comments_count();

-- Update communities joined
CREATE OR REPLACE FUNCTION increment_communities_joined()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_metrics (user_id, communities_joined)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    communities_joined = user_metrics.communities_joined + 1,
    updated_at = NOW();
  
  -- Check for badges
  PERFORM check_and_award_badges(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Assuming 'community_members' table exists
DROP TRIGGER IF EXISTS on_community_joined_increment ON community_members;
CREATE TRIGGER on_community_joined_increment
  AFTER INSERT ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION increment_communities_joined();

-- Update daily active streak
CREATE OR REPLACE FUNCTION update_daily_active_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_active_date, daily_active_streak
  INTO v_last_active, v_current_streak
  FROM user_metrics
  WHERE user_id = p_user_id;
  
  -- If user was active yesterday, increment streak
  IF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_metrics
    SET 
      daily_active_streak = daily_active_streak + 1,
      total_active_days = total_active_days + 1,
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  -- If user was active today already, do nothing
  ELSIF v_last_active = CURRENT_DATE THEN
    RETURN;
  -- Otherwise, reset streak to 1
  ELSE
    UPDATE user_metrics
    SET 
      daily_active_streak = 1,
      total_active_days = total_active_days + 1,
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check for badges
  PERFORM check_and_award_badges(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. INSERT SAMPLE BADGES
-- ============================================

-- Clear existing sample badges (optional, comment out if you want to keep existing)
-- DELETE FROM badges WHERE TRUE;

-- ENGAGEMENT BADGES
INSERT INTO badges (title, description, icon_emoji, category, criteria_type, criteria_value, rarity, points, display_order) VALUES
('First Post', 'Share your first post with the UniteX community', '🎯', 'engagement', 'posts_count', 1, 'common', 10, 1),
('Contributor I', 'Publish 10 posts', '📝', 'engagement', 'posts_count', 10, 'common', 50, 2),
('Contributor II', 'Publish 50 posts', '✍️', 'engagement', 'posts_count', 50, 'rare', 100, 3),
('Prolific Creator', 'Publish 100 posts', '🌟', 'engagement', 'posts_count', 100, 'epic', 250, 4),
('Starred Creator', 'Receive 100 likes on your posts', '⭐', 'engagement', 'likes_received', 100, 'rare', 150, 5),
('Influencer', 'Receive 500 likes on your posts', '💫', 'engagement', 'likes_received', 500, 'epic', 500, 6),
('Legend', 'Receive 1000 likes on your posts', '🏆', 'engagement', 'likes_received', 1000, 'legendary', 1000, 7),
('Conversation Starter', 'Write 50 comments', '💬', 'engagement', 'comments_count', 50, 'common', 75, 8)
ON CONFLICT DO NOTHING;

-- COMMUNITY BADGES
INSERT INTO badges (title, description, icon_emoji, category, criteria_type, criteria_value, rarity, points, display_order) VALUES
('Community Explorer', 'Join 5 communities', '🗺️', 'community', 'communities_joined', 5, 'common', 50, 11),
('Community Leader', 'Join 20 communities', '👥', 'community', 'communities_joined', 20, 'rare', 200, 12),
('Community Founder', 'Create your first community', '🏛️', 'community', 'communities_created', 1, 'rare', 100, 13)
ON CONFLICT DO NOTHING;

-- BEHAVIOR BADGES
INSERT INTO badges (title, description, icon_emoji, category, criteria_type, criteria_value, rarity, points, display_order) VALUES
('7-Day Streak', 'Active for 7 consecutive days', '🔥', 'behavior', 'daily_active_streak', 7, 'common', 100, 21),
('30-Day Streak', 'Active for 30 consecutive days', '⚡', 'behavior', 'daily_active_streak', 30, 'epic', 500, 22),
('100-Day Streak', 'Active for 100 consecutive days', '💎', 'behavior', 'daily_active_streak', 100, 'legendary', 2000, 23),
('Clean Record', 'Zero violations for 90 days', '✅', 'behavior', 'violations_count', 0, 'rare', 150, 24)
ON CONFLICT DO NOTHING;

-- ACHIEVEMENT BADGES
INSERT INTO badges (title, description, icon_emoji, category, criteria_type, criteria_value, rarity, points, display_order) VALUES
('Project Starter', 'Create your first project', '🚀', 'achievement', 'projects_created', 1, 'common', 50, 31),
('Project Veteran', 'Create 5 projects', '🎓', 'achievement', 'projects_created', 5, 'rare', 250, 32),
('Collaborator', 'Complete 3 collaborations', '🤝', 'achievement', 'collaborations_count', 3, 'rare', 200, 33)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. UTILITY FUNCTIONS FOR CLIENT
-- ============================================

-- Get user's earned badges with details
CREATE OR REPLACE FUNCTION get_user_badges(p_user_id UUID)
RETURNS TABLE(
  badge_id UUID,
  title TEXT,
  description TEXT,
  icon_emoji TEXT,
  icon_url TEXT,
  category TEXT,
  rarity TEXT,
  points INTEGER,
  earned_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.description,
    b.icon_emoji,
    b.icon_url,
    b.category,
    b.rarity,
    b.points,
    ub.earned_at,
    ub.is_featured
  FROM user_badges ub
  JOIN badges b ON ub.badge_id = b.id
  WHERE ub.user_id = p_user_id
  ORDER BY ub.earned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all badges with earned status for a user
CREATE OR REPLACE FUNCTION get_all_badges_with_status(p_user_id UUID)
RETURNS TABLE(
  badge_id UUID,
  title TEXT,
  description TEXT,
  icon_emoji TEXT,
  icon_url TEXT,
  category TEXT,
  criteria_type TEXT,
  criteria_value INTEGER,
  rarity TEXT,
  points INTEGER,
  is_earned BOOLEAN,
  earned_at TIMESTAMP WITH TIME ZONE,
  current_progress INTEGER,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.description,
    b.icon_emoji,
    b.icon_url,
    b.category,
    b.criteria_type,
    b.criteria_value,
    b.rarity,
    b.points,
    (ub.id IS NOT NULL) as is_earned,
    ub.earned_at,
    COALESCE(
      (SELECT current_value FROM badge_progress bp WHERE bp.user_id = p_user_id AND bp.badge_id = b.id),
      (SELECT CASE b.criteria_type
        WHEN 'posts_count' THEN um.posts_count
        WHEN 'likes_received' THEN um.likes_received
        WHEN 'comments_count' THEN um.comments_count
        WHEN 'communities_joined' THEN um.communities_joined
        WHEN 'communities_created' THEN um.communities_created
        WHEN 'daily_active_streak' THEN um.daily_active_streak
        WHEN 'projects_created' THEN um.projects_created
        WHEN 'collaborations_count' THEN um.collaborations_count
        ELSE 0
      END FROM user_metrics um WHERE um.user_id = p_user_id),
      0
    )::INTEGER as current_progress,
    LEAST(
      100,
      ROUND(
        (COALESCE(
          (SELECT current_value FROM badge_progress bp WHERE bp.user_id = p_user_id AND bp.badge_id = b.id),
          (SELECT CASE b.criteria_type
            WHEN 'posts_count' THEN um.posts_count
            WHEN 'likes_received' THEN um.likes_received
            WHEN 'comments_count' THEN um.comments_count
            WHEN 'communities_joined' THEN um.communities_joined
            WHEN 'communities_created' THEN um.communities_created
            WHEN 'daily_active_streak' THEN um.daily_active_streak
            WHEN 'projects_created' THEN um.projects_created
            WHEN 'collaborations_count' THEN um.collaborations_count
            ELSE 0
          END FROM user_metrics um WHERE um.user_id = p_user_id),
          0
        )::NUMERIC / NULLIF(b.criteria_value, 0) * 100),
        2
      )
    ) as progress_percentage
  FROM badges b
  LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = p_user_id
  WHERE b.is_active = true
  ORDER BY b.display_order, b.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user metrics for display
CREATE OR REPLACE FUNCTION get_user_metrics_summary(p_user_id UUID)
RETURNS TABLE(
  posts_count INTEGER,
  likes_received INTEGER,
  comments_count INTEGER,
  communities_joined INTEGER,
  daily_active_streak INTEGER,
  total_badges_earned INTEGER,
  total_points INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(um.posts_count, 0),
    COALESCE(um.likes_received, 0),
    COALESCE(um.comments_count, 0),
    COALESCE(um.communities_joined, 0),
    COALESCE(um.daily_active_streak, 0),
    (SELECT COUNT(*)::INTEGER FROM user_badges WHERE user_id = p_user_id),
    COALESCE((SELECT SUM(b.points)::INTEGER FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = p_user_id), 0)
  FROM user_metrics um
  WHERE um.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION check_and_award_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_badges_with_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_metrics_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_active_streak(UUID) TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- The badges system is now fully set up!
-- 
-- Next steps:
-- 1. Test badge awarding by creating posts
-- 2. Call check_and_award_badges(user_id) from your app
-- 3. Use get_all_badges_with_status(user_id) to show badges UI
-- ============================================
