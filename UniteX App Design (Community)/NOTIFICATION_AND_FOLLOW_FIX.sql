-- =====================================================
-- UNITEX - FIX NOTIFICATIONS AND FOLLOWS
-- =====================================================
-- This script fixes:
-- 1. "column 'body' of relation 'notifications' does not exist" error
-- 2. Follow/unfollow functionality
-- 3. Like notification issues
-- =====================================================

-- Step 1: Drop existing notifications table and recreate with correct structure
-- =====================================================

DROP TABLE IF EXISTS public.notifications CASCADE;

-- Create notifications table with correct structure
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
  body TEXT NOT NULL,  -- This is the column that was missing!
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  related_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
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

-- Step 2: Enable RLS on notifications tables
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow system to insert notifications (for triggers)
CREATE POLICY "System can insert notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- Create policies for notification settings
CREATE POLICY "Users can view own notification settings" 
  ON public.notification_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" 
  ON public.notification_settings FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" 
  ON public.notification_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 3: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

-- Step 4: Create notification helper functions
-- =====================================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
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
  FROM public.notification_settings
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
  INSERT INTO public.notifications (
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

-- Function to initialize notification settings for new users
CREATE OR REPLACE FUNCTION public.initialize_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create notification settings
DROP TRIGGER IF EXISTS on_profile_created_init_notification_settings ON public.profiles;
CREATE TRIGGER on_profile_created_init_notification_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_notification_settings();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.notifications
  WHERE user_id = p_user_id
    AND is_read = false;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE id = p_notification_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = p_user_id
    AND user_id = auth.uid()
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create triggers for automatic notifications
-- =====================================================

-- Trigger for new followers
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
BEGIN
  -- Get follower's name
  SELECT full_name INTO v_follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;
  
  -- Create notification
  PERFORM public.create_notification(
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the follow action
    RAISE WARNING 'Error creating follow notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_notify ON public.follows;
CREATE TRIGGER on_follow_notify
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_follow();

-- Trigger for post likes
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_liker_name TEXT;
BEGIN
  -- Get post author
  SELECT author_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;
  
  -- Don't notify if user liked their own post
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker's name
  SELECT full_name INTO v_liker_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM public.create_notification(
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the like action
    RAISE WARNING 'Error creating like notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_notify ON public.post_likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_like();

-- Trigger for comments
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_commenter_name TEXT;
  v_parent_comment_author_id UUID;
BEGIN
  -- Get commenter's name
  SELECT full_name INTO v_commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- If it's a reply to a comment
  IF NEW.parent_id IS NOT NULL THEN
    -- Get parent comment author
    SELECT author_id INTO v_parent_comment_author_id
    FROM public.comments
    WHERE id = NEW.parent_id;
    
    -- Don't notify if user replied to their own comment
    IF v_parent_comment_author_id != NEW.author_id THEN
      -- Notify parent comment author
      PERFORM public.create_notification(
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
  FROM public.posts
  WHERE id = NEW.post_id;
  
  IF v_post_author_id != NEW.author_id THEN
    PERFORM public.create_notification(
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the comment action
    RAISE WARNING 'Error creating comment notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_notify ON public.comments;
CREATE TRIGGER on_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

-- Step 6: Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_as_read(UUID) TO authenticated;

-- Step 7: Initialize notification settings for existing users
-- =====================================================

INSERT INTO public.notification_settings (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Step 8: Enable realtime for notifications
-- =====================================================

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if notifications table has 'body' column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND table_schema = 'public'
  AND column_name = 'body';

-- Check if all triggers are created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('on_follow_notify', 'on_like_notify', 'on_comment_notify');

-- =====================================================
-- DONE! 
-- =====================================================
-- Now likes and follows should work correctly
-- Notifications will be created automatically
-- =====================================================
