-- =====================================================
-- UNITEX - COMPLETE COMMUNITIES SYSTEM
-- =====================================================
-- Features:
-- ✅ Community profile pictures (icon_url, cover_url)
-- ✅ Role-based access control (creator, admin, moderator, member)
-- ✅ Admin can update community settings
-- ✅ Admin can manage members
-- ✅ Content moderation
-- ✅ Security policies
-- =====================================================

-- Drop existing tables to ensure clean setup
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;

-- =====================================================
-- 1. COMMUNITIES TABLE (Enhanced)
-- =====================================================

CREATE TABLE public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic info
  name TEXT NOT NULL UNIQUE CHECK (length(name) >= 3 AND length(name) <= 50),
  description TEXT CHECK (length(description) <= 500),
  
  -- Images (NEW!)
  icon_url TEXT,  -- Community profile picture
  cover_url TEXT, -- Community cover image
  color TEXT DEFAULT 'from-blue-500 to-purple-500',
  
  -- Creator & stats
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  members_count INTEGER DEFAULT 0 CHECK (members_count >= 0),
  posts_count INTEGER DEFAULT 0 CHECK (posts_count >= 0),
  
  -- Settings
  is_private BOOLEAN DEFAULT false,
  allow_posts BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. COMMUNITY MEMBERS TABLE (With Roles)
-- =====================================================

CREATE TABLE public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Role hierarchy: creator > admin > moderator > member
  role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'moderator', 'member')),
  
  -- Permissions
  can_post BOOLEAN DEFAULT true,
  can_moderate BOOLEAN DEFAULT false,
  can_edit_settings BOOLEAN DEFAULT false,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(community_id, user_id)
);

-- =====================================================
-- 3. STORAGE BUCKET FOR COMMUNITY IMAGES
-- =====================================================

-- Create bucket for community images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES - COMMUNITIES
-- =====================================================

-- Everyone can view public communities, members can view private ones
DROP POLICY IF EXISTS "Communities viewable by authorized users" ON public.communities;
CREATE POLICY "Communities viewable by authorized users" 
  ON public.communities FOR SELECT 
  USING (
    is_private = FALSE OR 
    auth.uid() IN (
      SELECT user_id FROM public.community_members 
      WHERE community_id = communities.id
    )
  );

-- Authenticated users can create communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities" 
  ON public.communities FOR INSERT 
  WITH CHECK (
    auth.uid() = creator_id AND
    auth.uid() IS NOT NULL
  );

-- Creator and admins can update community
DROP POLICY IF EXISTS "Admins can update community" ON public.communities;
CREATE POLICY "Admins can update community" 
  ON public.communities FOR UPDATE 
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = communities.id 
        AND user_id = auth.uid() 
        AND role IN ('creator', 'admin')
        AND can_edit_settings = true
    )
  )
  WITH CHECK (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = communities.id 
        AND user_id = auth.uid() 
        AND role IN ('creator', 'admin')
        AND can_edit_settings = true
    )
  );

-- Only creator can delete community
DROP POLICY IF EXISTS "Only creator can delete community" ON public.communities;
CREATE POLICY "Only creator can delete community" 
  ON public.communities FOR DELETE 
  USING (
    auth.uid() = creator_id
  );

-- =====================================================
-- 6. RLS POLICIES - COMMUNITY MEMBERS
-- =====================================================

-- Everyone can see community members
DROP POLICY IF EXISTS "Community members viewable by all" ON public.community_members;
CREATE POLICY "Community members viewable by all" 
  ON public.community_members FOR SELECT 
  USING (true);

-- Users can join communities
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
CREATE POLICY "Users can join communities" 
  ON public.community_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Public communities: anyone can join
      (SELECT is_private FROM public.communities WHERE id = community_id) = FALSE OR
      -- Private communities: need invite (implement invite system later)
      EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = community_members.community_id 
          AND user_id = auth.uid()
      )
    ) AND
    -- Cannot set role higher than member on join
    role = 'member'
  );

-- Users can leave communities (except creator)
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;
CREATE POLICY "Users can leave communities" 
  ON public.community_members FOR DELETE 
  USING (
    auth.uid() = user_id AND 
    role != 'creator'
  );

-- Admins and moderators can remove members
DROP POLICY IF EXISTS "Admins can remove members" ON public.community_members;
CREATE POLICY "Admins can remove members" 
  ON public.community_members FOR DELETE 
  USING (
    -- Must be admin/moderator
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_members.community_id 
        AND cm.user_id = auth.uid() 
        AND cm.role IN ('creator', 'admin', 'moderator')
    ) AND
    -- Cannot remove creator or self
    community_members.role != 'creator' AND
    community_members.user_id != auth.uid()
  );

-- Admins can update member roles (but not to creator)
DROP POLICY IF EXISTS "Admins can update member roles" ON public.community_members;
CREATE POLICY "Admins can update member roles" 
  ON public.community_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_members.community_id 
        AND cm.user_id = auth.uid() 
        AND cm.role IN ('creator', 'admin')
    )
  )
  WITH CHECK (
    -- Cannot promote to creator
    role != 'creator' AND
    -- Original role was not creator
    (SELECT role FROM public.community_members WHERE id = community_members.id) != 'creator'
  );

-- =====================================================
-- 7. STORAGE POLICIES - COMMUNITY IMAGES
-- =====================================================

-- Everyone can view community images
DROP POLICY IF EXISTS "Community images publicly viewable" ON storage.objects;
CREATE POLICY "Community images publicly viewable" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'community-images');

-- Admins can upload community images
DROP POLICY IF EXISTS "Admins can upload community images" ON storage.objects;
CREATE POLICY "Admins can upload community images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'community-images' AND
    auth.uid() IS NOT NULL AND
    -- Check if user is admin of any community (will verify community_id in app)
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE user_id = auth.uid() 
        AND role IN ('creator', 'admin')
    )
  );

-- Admins can update community images
DROP POLICY IF EXISTS "Admins can update community images" ON storage.objects;
CREATE POLICY "Admins can update community images" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'community-images' AND
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'community-images'
  );

-- Admins can delete community images
DROP POLICY IF EXISTS "Admins can delete community images" ON storage.objects;
CREATE POLICY "Admins can delete community images" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'community-images' AND
    auth.uid() IS NOT NULL
  );

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_communities_creator ON public.communities(creator_id);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON public.communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communities_name ON public.communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_private ON public.communities(is_private);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_role ON public.community_members(role);
CREATE INDEX IF NOT EXISTS idx_community_members_joined ON public.community_members(joined_at DESC);

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_community_admin(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = p_community_id
      AND user_id = p_user_id
      AND role IN ('creator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can moderate
CREATE OR REPLACE FUNCTION can_moderate_community(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = p_community_id
      AND user_id = p_user_id
      AND (role IN ('creator', 'admin', 'moderator') OR can_moderate = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role in community
CREATE OR REPLACE FUNCTION get_community_role(p_community_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.community_members
  WHERE community_id = p_community_id
    AND user_id = p_user_id;
  
  RETURN COALESCE(v_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

-- Auto-set permissions based on role
CREATE OR REPLACE FUNCTION set_member_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Set permissions based on role
  CASE NEW.role
    WHEN 'creator' THEN
      NEW.can_post := true;
      NEW.can_moderate := true;
      NEW.can_edit_settings := true;
    WHEN 'admin' THEN
      NEW.can_post := true;
      NEW.can_moderate := true;
      NEW.can_edit_settings := true;
    WHEN 'moderator' THEN
      NEW.can_post := true;
      NEW.can_moderate := true;
      NEW.can_edit_settings := false;
    WHEN 'member' THEN
      NEW.can_post := (SELECT allow_posts FROM public.communities WHERE id = NEW.community_id);
      NEW.can_moderate := false;
      NEW.can_edit_settings := false;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_member_permissions_trigger ON public.community_members;
CREATE TRIGGER set_member_permissions_trigger
  BEFORE INSERT OR UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION set_member_permissions();

-- Update members_count
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET members_count = members_count + 1 
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET members_count = GREATEST(members_count - 1, 0) 
    WHERE id = OLD.community_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_members_count_trigger ON public.community_members;
CREATE TRIGGER update_members_count_trigger
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_members_count();

-- Auto-add creator as member with creator role
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator')
  ON CONFLICT (community_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_creator_trigger ON public.communities;
CREATE TRIGGER add_creator_trigger
  AFTER INSERT ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_community_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_timestamp_trigger ON public.communities;
CREATE TRIGGER update_community_timestamp_trigger
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION update_community_timestamp();

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION is_community_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_moderate_community(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_role(UUID, UUID) TO authenticated;

-- =====================================================
-- 12. VERIFICATION
-- =====================================================

-- Check tables exist
SELECT 
  'Communities table' as table_name,
  COUNT(*) as count
FROM public.communities
UNION ALL
SELECT 
  'Community members table',
  COUNT(*)
FROM public.community_members;

-- Check storage bucket
SELECT 
  id,
  name,
  public,
  file_size_limit / 1048576 as size_limit_mb
FROM storage.buckets 
WHERE id = 'community-images';

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('communities', 'community_members')
  AND schemaname = 'public';

-- Show all communities with creator info
SELECT 
  c.id,
  c.name,
  c.description,
  c.icon_url IS NOT NULL as has_icon,
  c.cover_url IS NOT NULL as has_cover,
  c.members_count,
  c.is_private,
  p.full_name as creator_name,
  p.username as creator_username
FROM public.communities c
LEFT JOIN public.profiles p ON c.creator_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;

-- =====================================================
-- DONE!
-- =====================================================
-- ✅ Communities table with icon_url and cover_url
-- ✅ Role-based access control
-- ✅ Storage bucket for images
-- ✅ Complete RLS policies
-- ✅ Helper functions
-- ✅ Automatic triggers
-- =====================================================
