-- Additional tables for missing features
-- Run this in your Supabase SQL Editor (in addition to your existing schema)

-- Jobs table (for job posting feature)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT CHECK (type IN ('internship', 'part-time', 'full-time', 'project')),
  salary TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  is_active BOOLEAN DEFAULT true,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  cover_note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Lists table (for user-created lists)
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List members table
CREATE TABLE IF NOT EXISTS list_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- Spaces table (for topic-based discussions)
CREATE TABLE IF NOT EXISTS spaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  member_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space members table
CREATE TABLE IF NOT EXISTS space_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (for real chat system)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('academic_boost', 'career_accelerator', 'networking_plus', 'analytics_dashboard')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables (skip if exists)
DO $$ 
BEGIN
  -- Jobs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Jobs are viewable by everyone') THEN
    CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Users can create jobs') THEN
    CREATE POLICY "Users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Users can update own jobs') THEN
    CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Job Applications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can view relevant job applications') THEN
    CREATE POLICY "Users can view relevant job applications" ON job_applications 
    FOR SELECT USING (
      auth.uid() = user_id OR 
      auth.uid() IN (SELECT user_id FROM jobs WHERE id = job_id)
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can create job applications') THEN
    CREATE POLICY "Users can create job applications" ON job_applications 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Lists policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lists' AND policyname = 'Public lists are viewable by everyone') THEN
    CREATE POLICY "Public lists are viewable by everyone" ON lists 
    FOR SELECT USING (is_private = false OR auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lists' AND policyname = 'Users can create lists') THEN
    CREATE POLICY "Users can create lists" ON lists 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lists' AND policyname = 'Users can update own lists') THEN
    CREATE POLICY "Users can update own lists" ON lists 
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Messages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view their own messages') THEN
    CREATE POLICY "Users can view their own messages" ON messages 
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON messages 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update their received messages') THEN
    CREATE POLICY "Users can update their received messages" ON messages 
    FOR UPDATE USING (auth.uid() = receiver_id);
  END IF;

  -- Premium subscriptions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'premium_subscriptions' AND policyname = 'Users can view own subscriptions') THEN
    CREATE POLICY "Users can view own subscriptions" ON premium_subscriptions 
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for performance (skip if exists)
CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_type_location ON jobs(type, location);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_user ON job_applications(job_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read, created_at DESC);