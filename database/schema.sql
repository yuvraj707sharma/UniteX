-- UniteX Database Schema
-- JECRC Digital Ecosystem Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User Profiles with detailed information
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@jecrcu.edu.in'),
    
    -- Basic Info
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    
    -- Academic Details
    student_id TEXT UNIQUE, -- For students
    employee_id TEXT UNIQUE, -- For faculty
    department TEXT NOT NULL,
    course TEXT, -- For students (B.Tech CSE, MBA, etc.)
    year_of_study INTEGER, -- For students
    graduation_year INTEGER,
    
    -- Professional Info
    designation TEXT, -- For faculty (Professor, HOD, etc.)
    specialization TEXT[],
    skills TEXT[],
    interests TEXT[],
    
    -- Contact & Social
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    
    -- Platform Stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    
    -- Account Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_faculty BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts (Ideas Feed + Project Posts)
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'idea' CHECK (post_type IN ('idea', 'project', 'collaboration', 'announcement')),
    
    -- Media
    media_urls TEXT[], -- Array of image/video URLs
    media_types TEXT[], -- Array of media types (image, video)
    
    -- Project specific fields
    project_title TEXT,
    required_skills TEXT[],
    required_departments TEXT[],
    project_status TEXT CHECK (project_status IN ('planning', 'active', 'completed', 'paused')),
    team_size_needed INTEGER,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Algorithm factors
    engagement_score FLOAT DEFAULT 0,
    trending_score FLOAT DEFAULT 0,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Storage Details
CREATE TABLE media_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- File Details
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
    file_size BIGINT,
    mime_type TEXT,
    
    -- Processing Status
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    thumbnail_url TEXT, -- For videos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes System
CREATE TABLE post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Comments System
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id), -- For replies
    
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow System
CREATE TABLE follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    followed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, followed_id)
);

-- Project Collaborations
CREATE TABLE project_collaborations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Interests & Skills Matching
CREATE TABLE user_interests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0, -- For algorithm weighting
    UNIQUE(user_id, interest)
);

-- Notifications System
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'collaboration_request', 'post_approved', 'mention')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_post_id UUID REFERENCES posts(id),
    related_user_id UUID REFERENCES profiles(id),
    
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Algorithm Engagement Tracking
CREATE TABLE user_engagement (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Engagement types
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'like', 'comment', 'share', 'click', 'time_spent')),
    duration INTEGER, -- Time spent in seconds (for views)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Create indexes for performance
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_trending_score ON posts(trending_score DESC, created_at DESC);
CREATE INDEX idx_posts_department ON posts USING GIN(required_departments);
CREATE INDEX idx_posts_skills ON posts USING GIN(required_skills);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_user_engagement_user_post ON user_engagement(user_id, post_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Everyone can read approved posts, users can CRUD their own
CREATE POLICY "Approved posts are viewable by everyone" ON posts FOR SELECT USING (is_approved = true OR author_id = auth.uid());
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Functions for algorithm calculations
CREATE OR REPLACE FUNCTION calculate_engagement_score(post_id UUID)
RETURNS FLOAT AS $$
DECLARE
    likes_weight FLOAT := 1.0;
    comments_weight FLOAT := 2.0;
    shares_weight FLOAT := 3.0;
    views_weight FLOAT := 0.1;
    time_decay FLOAT;
    engagement_score FLOAT;
    post_age INTERVAL;
BEGIN
    SELECT 
        EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 INTO post_age
    FROM posts WHERE id = post_id;
    
    -- Time decay factor (posts lose relevance over time)
    time_decay := EXP(-post_age / 24.0); -- Decay over 24 hours
    
    SELECT 
        (likes_count * likes_weight + 
         comments_count * comments_weight + 
         shares_count * shares_weight + 
         views_count * views_weight) * time_decay
    INTO engagement_score
    FROM posts WHERE id = post_id;
    
    RETURN COALESCE(engagement_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update engagement scores
CREATE OR REPLACE FUNCTION update_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_score := calculate_engagement_score(NEW.id);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_engagement
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement();