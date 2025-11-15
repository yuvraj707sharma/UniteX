-- ============================================
-- Create Communities and Lists Tables
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create community_members junction table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 3. Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create list_members junction table
CREATE TABLE IF NOT EXISTS public.list_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_members ENABLE ROW LEVEL SECURITY;

-- Communities Policies
CREATE POLICY "Anyone can view communities" 
  ON public.communities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" 
  ON public.communities FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their communities" 
  ON public.communities FOR UPDATE 
  TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their communities" 
  ON public.communities FOR DELETE 
  TO authenticated USING (auth.uid() = creator_id);

-- Community Members Policies
CREATE POLICY "Anyone can view community members" 
  ON public.community_members FOR SELECT USING (true);

CREATE POLICY "Users can join communities" 
  ON public.community_members FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" 
  ON public.community_members FOR DELETE 
  TO authenticated USING (auth.uid() = user_id);

-- Lists Policies
CREATE POLICY "Users can view public lists and their own lists" 
  ON public.lists FOR SELECT 
  USING (is_private = false OR auth.uid() = user_id);

CREATE POLICY "Users can create lists" 
  ON public.lists FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" 
  ON public.lists FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" 
  ON public.lists FOR DELETE 
  TO authenticated USING (auth.uid() = user_id);

-- List Members Policies
CREATE POLICY "Users can view list members if they own the list or list is public" 
  ON public.list_members FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND (is_private = false OR user_id = auth.uid()))
  );

CREATE POLICY "List owners can add members" 
  ON public.list_members FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid())
  );

CREATE POLICY "List owners can remove members" 
  ON public.list_members FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND user_id = auth.uid())
  );

-- Grant permissions
GRANT SELECT, INSERT ON public.communities TO authenticated;
GRANT UPDATE, DELETE ON public.communities TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.community_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lists TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.list_members TO authenticated;

-- Create indexes
CREATE INDEX idx_communities_creator ON public.communities(creator_id);
CREATE INDEX idx_community_members_community ON public.community_members(community_id);
CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_lists_user ON public.lists(user_id);
CREATE INDEX idx_list_members_list ON public.list_members(list_id);
CREATE INDEX idx_list_members_user ON public.list_members(user_id);

-- Create trigger to update community member count
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.communities 
    SET members_count = COALESCE(members_count, 0) + 1 
    WHERE id = NEW.community_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.communities 
    SET members_count = GREATEST(COALESCE(members_count, 0) - 1, 0) 
    WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_members_count_trigger
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_members_count();

-- Create trigger to update list member count
CREATE OR REPLACE FUNCTION update_list_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.lists 
    SET members_count = COALESCE(members_count, 0) + 1 
    WHERE id = NEW.list_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.lists 
    SET members_count = GREATEST(COALESCE(members_count, 0) - 1, 0) 
    WHERE id = OLD.list_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER list_members_count_trigger
  AFTER INSERT OR DELETE ON public.list_members
  FOR EACH ROW EXECUTE FUNCTION update_list_members_count();

-- Verify tables created
SELECT 
  'SUCCESS! Communities and Lists tables created!' as result,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('communities', 'community_members', 'lists', 'list_members')) as tables_created;
