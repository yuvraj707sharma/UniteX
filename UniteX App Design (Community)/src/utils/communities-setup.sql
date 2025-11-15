-- Communities Feature Database Setup
-- Run this in your Supabase SQL Editor to enable Communities feature

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT 'from-blue-500 to-purple-500',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Create community_posts table (posts specific to communities)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
DROP POLICY IF EXISTS "Public communities are viewable by everyone" ON communities;
DROP POLICY IF EXISTS "Private communities are viewable by members" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Community admins can update their communities" ON communities;
DROP POLICY IF EXISTS "Community admins can delete their communities" ON communities;
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON community_members;
DROP POLICY IF EXISTS "Users can join public communities" ON community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON community_members;
DROP POLICY IF EXISTS "Community admins can manage members" ON community_members;
DROP POLICY IF EXISTS "Community posts are viewable by members" ON community_posts;
DROP POLICY IF EXISTS "Community members can create posts" ON community_posts;

-- Policies for communities table
CREATE POLICY "Public communities are viewable by everyone" 
  ON communities FOR SELECT 
  USING (
    is_private = false OR 
    auth.uid() IN (
      SELECT user_id FROM community_members 
      WHERE community_id = communities.id
    )
  );

CREATE POLICY "Users can create communities" 
  ON communities FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community admins can update their communities" 
  ON communities FOR UPDATE 
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT user_id FROM community_members 
      WHERE community_id = communities.id AND role = 'admin'
    )
  );

CREATE POLICY "Community admins can delete their communities" 
  ON communities FOR DELETE 
  USING (auth.uid() = created_by);

-- Policies for community_members table
CREATE POLICY "Community members are viewable by everyone" 
  ON community_members FOR SELECT 
  USING (true);

CREATE POLICY "Users can join public communities" 
  ON community_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    (
      (SELECT is_private FROM communities WHERE id = community_id) = false OR
      EXISTS (
        SELECT 1 FROM community_members 
        WHERE community_id = community_members.community_id 
        AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can leave communities" 
  ON community_members FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Community admins can manage members" 
  ON community_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('admin', 'moderator')
    )
  );

-- Policies for community_posts table
CREATE POLICY "Community posts are viewable by members" 
  ON community_posts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can create posts" 
  ON community_posts FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_post ON community_posts(post_id);

-- Function to automatically increment member count when user joins
CREATE OR REPLACE FUNCTION increment_community_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities 
  SET member_count = member_count + 1 
  WHERE id = NEW.community_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically decrement member count when user leaves
CREATE OR REPLACE FUNCTION decrement_community_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities 
  SET member_count = GREATEST(member_count - 1, 0)
  WHERE id = OLD.community_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post count when post is added to community
CREATE OR REPLACE FUNCTION increment_community_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities 
  SET post_count = post_count + 1 
  WHERE id = NEW.community_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post count when post is removed from community
CREATE OR REPLACE FUNCTION decrement_community_posts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE communities 
  SET post_count = GREATEST(post_count - 1, 0)
  WHERE id = OLD.community_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_community_member_added ON community_members;
CREATE TRIGGER on_community_member_added
  AFTER INSERT ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION increment_community_members();

DROP TRIGGER IF EXISTS on_community_member_removed ON community_members;
CREATE TRIGGER on_community_member_removed
  AFTER DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION decrement_community_members();

DROP TRIGGER IF EXISTS on_community_post_added ON community_posts;
CREATE TRIGGER on_community_post_added
  AFTER INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION increment_community_posts();

DROP TRIGGER IF EXISTS on_community_post_removed ON community_posts;
CREATE TRIGGER on_community_post_removed
  AFTER DELETE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION decrement_community_posts();

-- Insert sample communities (optional - comment out if you don't want sample data)
INSERT INTO communities (name, description, color, member_count, created_by) VALUES
  ('Web Development', 'Discuss web technologies, frameworks, and best practices', 'from-blue-500 to-cyan-500', 0, (SELECT id FROM profiles LIMIT 1)),
  ('AI & Machine Learning', 'Everything about artificial intelligence and ML', 'from-purple-500 to-pink-500', 0, (SELECT id FROM profiles LIMIT 1)),
  ('Mobile Development', 'iOS, Android, and cross-platform mobile dev', 'from-green-500 to-teal-500', 0, (SELECT id FROM profiles LIMIT 1)),
  ('Startup Ideas', 'Share and discuss startup ideas and entrepreneurship', 'from-orange-500 to-red-500', 0, (SELECT id FROM profiles LIMIT 1)),
  ('Design & UI/UX', 'Design principles, tools, and inspiration', 'from-pink-500 to-rose-500', 0, (SELECT id FROM profiles LIMIT 1))
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Communities table created successfully!' as status;
SELECT 'Total communities:' as info, COUNT(*) as count FROM communities;
SELECT 'Total community members:' as info, COUNT(*) as count FROM community_members;

-- Show all communities
SELECT 
  c.id,
  c.name,
  c.description,
  c.member_count,
  c.created_at,
  p.full_name as creator_name,
  p.username as creator_username
FROM communities c
LEFT JOIN profiles p ON c.created_by = p.id
ORDER BY c.created_at DESC;
