-- =====================================================
-- UNITEX SUPABASE QUICK FIX
-- Run this entire script in Supabase SQL Editor
-- This fixes: Sign up failures & Comment failures
-- =====================================================

-- Step 1: Create all necessary tables
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  student_id TEXT,
  employee_id TEXT,
  department TEXT NOT NULL DEFAULT 'General',
  course TEXT,
  year_of_study INTEGER,
  graduation_year INTEGER,
  designation TEXT,
  specialization TEXT[],
  skills TEXT[],
  interests TEXT[],
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_faculty BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  account_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'idea',
  media_urls TEXT[],
  media_types TEXT[],
  project_title TEXT,
  required_skills TEXT[],
  required_departments TEXT[],
  project_status TEXT,
  team_size_needed INTEGER,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  media_urls TEXT[],
  media_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (if any)
-- =====================================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Authenticated users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;

-- Step 4: Create RLS Policies
-- =====================================================

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" 
  ON public.posts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" 
  ON public.posts FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" 
  ON public.posts FOR DELETE 
  USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Likes are viewable by everyone" 
  ON public.post_likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like posts" 
  ON public.post_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" 
  ON public.post_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" 
  ON public.follows FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can follow others" 
  ON public.follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
  ON public.follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- Messages policies
CREATE POLICY "Users can view their messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Step 5: Auto-create profile function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'department', 'General')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's an error (like profile already exists), just continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- =====================================================
-- DONE! Your database is now configured correctly.
-- =====================================================

-- Verify the setup
SELECT 'Setup complete! Tables created:' AS status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'posts', 'comments', 'post_likes', 'follows', 'messages');
