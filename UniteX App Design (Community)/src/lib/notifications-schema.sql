-- ============================================
-- UNITEX NOTIFICATION SYSTEM - COMPLETE SQL SCHEMA
-- ============================================
-- This migration creates all tables, functions, triggers, and policies
-- for the UniteX Notification System
--
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE/UPDATE TABLES
-- ============================================

-- Add device_token column to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'device_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN device_token TEXT;
  END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'follow',
    'like',
    'comment',
    'reply',
    'message',
    'community_invite',
    'badge_unlocked',
    'system_announcement'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Notification preferences
  follow_notifications BOOLEAN DEFAULT true,
  like_notifications BOOLEAN DEFAULT true,
  comment_notifications BOOLEAN DEFAULT true,
  reply_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  community_notifications BOOLEAN DEFAULT true,
  badge_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  
  -- Push notification preferences
  push_enabled BOOLEAN DEFAULT true,
  push_follow BOOLEAN DEFAULT true,
  push_like BOOLEAN DEFAULT false,
  push_comment BOOLEAN DEFAULT true,
  push_reply BOOLEAN DEFAULT true,
  push_message BOOLEAN DEFAULT true,
  push_community BOOLEAN DEFAULT true,
  push_badge BOOLEAN DEFAULT true,
  push_system BOOLEAN DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification queue table (for batch processing)
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_post ON notifications(related_post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_user ON notifications(related_user_id);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed ON notification_queue(processed, scheduled_for);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Notifications: Users can only read their own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" 
  ON notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Notification Settings: Users can read and update their own
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
CREATE POLICY "Users can view own notification settings" 
  ON notification_settings FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
CREATE POLICY "Users can update own notification settings" 
  ON notification_settings FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
CREATE POLICY "Users can insert own notification settings" 
  ON notification_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Notification Queue: No direct user access
-- Only server functions can read/write

-- ============================================
-- 5. ENABLE REALTIME
-- ============================================

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- 6. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to initialize notification settings for new users
CREATE OR REPLACE FUNCTION initialize_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create notification settings
DROP TRIGGER IF EXISTS on_profile_created_init_notification_settings ON profiles;
CREATE TRIGGER on_profile_created_init_notification_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_notification_settings();

-- Function to update notification_settings timestamp
CREATE OR REPLACE FUNCTION update_notification_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_settings_timestamp ON notification_settings;
CREATE TRIGGER update_notification_settings_timestamp
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_timestamp();

-- ============================================
-- 7. NOTIFICATION CREATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_related_user_id UUID DEFAULT NULL,
  p_related_post_id UUID DEFAULT NULL,
  p_related_comment_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_settings RECORD;
  v_notification_enabled BOOLEAN;
BEGIN
  -- Get user's notification settings
  SELECT * INTO v_settings
  FROM notification_settings
  WHERE user_id = p_user_id;
  
  -- Check if this type of notification is enabled
  v_notification_enabled := CASE p_type
    WHEN 'follow' THEN COALESCE(v_settings.follow_notifications, true)
    WHEN 'like' THEN COALESCE(v_settings.like_notifications, true)
    WHEN 'comment' THEN COALESCE(v_settings.comment_notifications, true)
    WHEN 'reply' THEN COALESCE(v_settings.reply_notifications, true)
    WHEN 'message' THEN COALESCE(v_settings.message_notifications, true)
    WHEN 'community_invite' THEN COALESCE(v_settings.community_notifications, true)
    WHEN 'badge_unlocked' THEN COALESCE(v_settings.badge_notifications, true)
    WHEN 'system_announcement' THEN COALESCE(v_settings.system_notifications, true)
    ELSE true
  END;
  
  -- Don't create notification if disabled
  IF NOT v_notification_enabled THEN
    RETURN NULL;
  END IF;
  
  -- Create the notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    metadata,
    related_user_id,
    related_post_id,
    related_comment_id,
    action_url
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_metadata,
    p_related_user_id,
    p_related_post_id,
    p_related_comment_id,
    p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. BATCH NOTIFICATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION create_notification_batch(
  p_user_ids UUID[],
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  FOREACH v_user_id IN ARRAY p_user_ids
  LOOP
    PERFORM create_notification(
      v_user_id,
      p_type,
      p_title,
      p_body,
      p_metadata
    );
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. MARK AS READ FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = p_user_id
    AND user_id = auth.uid()
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. GET UNREAD COUNT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. AUTOMATIC NOTIFICATION TRIGGERS
-- ============================================

-- Trigger for new followers
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
BEGIN
  -- Get follower's name
  SELECT full_name INTO v_follower_name
  FROM profiles
  WHERE id = NEW.follower_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    'New Follower',
    v_follower_name || ' started following you',
    jsonb_build_object('follower_id', NEW.follower_id),
    NEW.follower_id,
    NULL,
    NULL,
    '/profile/' || NEW.follower_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_notify ON follows;
CREATE TRIGGER on_follow_notify
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Trigger for post likes
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_liker_name TEXT;
BEGIN
  -- Get post author
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user liked their own post
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker's name
  SELECT full_name INTO v_liker_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    v_post_author_id,
    'like',
    'New Like',
    v_liker_name || ' liked your post',
    jsonb_build_object('liker_id', NEW.user_id, 'post_id', NEW.post_id),
    NEW.user_id,
    NEW.post_id,
    NULL,
    '/post/' || NEW.post_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_notify ON post_likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- Trigger for comments
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_commenter_name TEXT;
  v_parent_comment_author_id UUID;
BEGIN
  -- Get commenter's name
  SELECT full_name INTO v_commenter_name
  FROM profiles
  WHERE id = NEW.author_id;
  
  -- If it's a reply to a comment
  IF NEW.parent_id IS NOT NULL THEN
    -- Get parent comment author
    SELECT author_id INTO v_parent_comment_author_id
    FROM comments
    WHERE id = NEW.parent_id;
    
    -- Don't notify if user replied to their own comment
    IF v_parent_comment_author_id != NEW.author_id THEN
      -- Notify parent comment author
      PERFORM create_notification(
        v_parent_comment_author_id,
        'reply',
        'New Reply',
        v_commenter_name || ' replied to your comment',
        jsonb_build_object('commenter_id', NEW.author_id, 'post_id', NEW.post_id, 'comment_id', NEW.id),
        NEW.author_id,
        NEW.post_id,
        NEW.id,
        '/post/' || NEW.post_id || '/comment/' || NEW.id
      );
    END IF;
  END IF;
  
  -- Always notify post author (unless they're the commenter)
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = NEW.post_id;
  
  IF v_post_author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_post_author_id,
      'comment',
      'New Comment',
      v_commenter_name || ' commented on your post',
      jsonb_build_object('commenter_id', NEW.author_id, 'post_id', NEW.post_id, 'comment_id', NEW.id),
      NEW.author_id,
      NEW.post_id,
      NEW.id,
      '/post/' || NEW.post_id || '/comment/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_notify ON comments;
CREATE TRIGGER on_comment_notify
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- Trigger for badge unlocks
CREATE OR REPLACE FUNCTION notify_on_badge_unlock()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_title TEXT;
  v_badge_icon TEXT;
BEGIN
  -- Get badge details
  SELECT title, icon_emoji INTO v_badge_title, v_badge_icon
  FROM badges
  WHERE id = NEW.badge_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.user_id,
    'badge_unlocked',
    'Badge Unlocked!',
    'You earned the "' || v_badge_title || '" badge',
    jsonb_build_object('badge_id', NEW.badge_id, 'badge_title', v_badge_title, 'badge_icon', v_badge_icon),
    NULL,
    NULL,
    NULL,
    '/badges'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_badge_unlock_notify ON user_badges;
CREATE TRIGGER on_badge_unlock_notify
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_badge_unlock();

-- ============================================
-- 12. CLEANUP FUNCTIONS
-- ============================================

-- Function to delete old read notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = true
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 13. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification_batch(UUID[], TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications() TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- The notification system is now fully set up!
-- 
-- Next steps:
-- 1. Test notification creation
-- 2. Set up realtime subscription in client
-- 3. Implement push notification handling
-- ============================================
