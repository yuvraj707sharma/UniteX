-- ============================================
-- COMMUNITY UPGRADE - Production Grade (FIXED)
-- ============================================

-- STEP 1: Upgrade communities table with new fields
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add unique constraint separately to avoid errors if column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'communities_username_key'
  ) THEN
    ALTER TABLE public.communities ADD CONSTRAINT communities_username_key UNIQUE (username);
  END IF;
END $$;

-- STEP 2: Create community_roles table
DROP TABLE IF EXISTS public.community_roles CASCADE;
CREATE TABLE public.community_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'member')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(community_id, user_id)
);

-- STEP 3: Create community_posts table
DROP TABLE IF EXISTS public.community_posts CASCADE;
CREATE TABLE public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);

-- STEP 4: Create community_post_likes table
DROP TABLE IF EXISTS public.community_post_likes CASCADE;
CREATE TABLE public.community_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- STEP 5: Create community_post_comments table
DROP TABLE IF EXISTS public.community_post_comments CASCADE;
CREATE TABLE public.community_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- STEP 6: Enable RLS on all tables
ALTER TABLE public.community_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

-- STEP 7: Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view community roles" ON public.community_roles;
DROP POLICY IF EXISTS "Admins can assign roles" ON public.community_roles;
DROP POLICY IF EXISTS "Admins can remove roles" ON public.community_roles;
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Members can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.community_post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.community_post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON public.community_post_likes;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_post_comments;
DROP POLICY IF EXISTS "Members can comment" ON public.community_post_comments;
DROP POLICY IF EXISTS "Authors can update their comments" ON public.community_post_comments;
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.community_post_comments;

-- STEP 8: Create RLS Policies for community_roles
CREATE POLICY "Anyone can view community roles"
  ON public.community_roles FOR SELECT USING (true);

CREATE POLICY "Admins can assign roles"
  ON public.community_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_roles.community_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can remove roles"
  ON public.community_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_roles.community_id
      AND creator_id = auth.uid()
    )
  );

-- STEP 9: Create RLS Policies for community_posts
CREATE POLICY "Anyone can view community posts"
  ON public.community_posts FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Members can create posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      EXISTS (
        SELECT 1 FROM public.community_members
        WHERE community_id = community_posts.community_id
        AND user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.communities
        WHERE id = community_posts.community_id
        AND creator_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authors and admins can update posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_posts.community_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Authors and admins can delete posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_posts.community_id
      AND creator_id = auth.uid()
    )
  );

-- STEP 10: Create RLS Policies for community_post_likes
CREATE POLICY "Anyone can view post likes"
  ON public.community_post_likes FOR SELECT USING (true);

CREATE POLICY "Users can like posts"
  ON public.community_post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.community_post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- STEP 11: Create RLS Policies for community_post_comments
CREATE POLICY "Anyone can view comments"
  ON public.community_post_comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Members can comment"
  ON public.community_post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments"
  ON public.community_post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments"
  ON public.community_post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- STEP 12: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.community_post_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_post_comments TO authenticated;

-- STEP 13: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_roles_community ON public.community_roles(community_id);
CREATE INDEX IF NOT EXISTS idx_community_roles_user ON public.community_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_community_roles_role ON public.community_roles(role);
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON public.community_posts(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post ON public.community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user ON public.community_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post ON public.community_post_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communities_username ON public.communities(username);
CREATE INDEX IF NOT EXISTS idx_communities_tags ON public.communities USING GIN(tags);

-- STEP 14: Create triggers for auto-updating counts

-- Trigger for community_post_likes count
CREATE OR REPLACE FUNCTION update_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.community_posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.community_posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_post_likes_count_trigger ON public.community_post_likes;
CREATE TRIGGER community_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_community_post_likes_count();

-- Trigger for community_post_comments count
CREATE OR REPLACE FUNCTION update_community_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.community_posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.community_posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_post_comments_count_trigger ON public.community_post_comments;
CREATE TRIGGER community_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_community_post_comments_count();

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 15: Auto-assign creator as admin when community is created
CREATE OR REPLACE FUNCTION assign_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_roles (community_id, user_id, role, assigned_by)
  VALUES (NEW.id, NEW.creator_id, 'admin', NEW.creator_id)
  ON CONFLICT (community_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assign_creator_admin_trigger ON public.communities;
CREATE TRIGGER assign_creator_admin_trigger
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION assign_creator_as_admin();

-- STEP 16: Function to get user role in community
CREATE OR REPLACE FUNCTION get_user_community_role(p_community_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if user is creator (always admin)
  IF EXISTS (
    SELECT 1 FROM public.communities
    WHERE id = p_community_id AND creator_id = p_user_id
  ) THEN
    RETURN 'admin';
  END IF;
  
  -- Check community_roles table
  SELECT role INTO v_role
  FROM public.community_roles
  WHERE community_id = p_community_id AND user_id = p_user_id;
  
  -- If no role found, check if they're a member
  IF v_role IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = p_community_id AND user_id = p_user_id
    ) THEN
      RETURN 'member';
    ELSE
      RETURN NULL;
    END IF;
  END IF;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 17: Generate usernames for existing communities
UPDATE public.communities
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- Handle duplicates by adding ID suffix
UPDATE public.communities c1
SET username = username || '_' || SUBSTRING(id::text, 1, 4)
WHERE EXISTS (
  SELECT 1
  FROM public.communities c2
  WHERE c2.username = c1.username
  AND c2.id != c1.id
  AND c2.created_at < c1.created_at
)
AND username NOT LIKE '%\_%';

-- STEP 18: Verify everything
SELECT 
  'SUCCESS! Community upgrade complete!' as status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'communities' AND column_name IN ('username', 'avatar_url', 'banner_url', 'tags', 'is_verified')) as new_community_fields,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('community_roles', 'community_posts', 'community_post_likes', 'community_post_comments')) as new_tables_created,
  (SELECT COUNT(*) FROM public.communities WHERE username IS NOT NULL) as communities_with_usernames;

SELECT 'Ready for production!' as final_status;
