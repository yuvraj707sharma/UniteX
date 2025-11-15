-- ============================================
-- FIXED: Create Communities and Lists Tables
-- ============================================

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.list_members CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;

-- Step 3: Create communities table
CREATE TABLE public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create community_members table
CREATE TABLE public.community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Step 5: Create lists table
CREATE TABLE public.lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Create list_members table
CREATE TABLE public.list_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

-- Step 7: Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_members ENABLE ROW LEVEL SECURITY;

-- Step 8: Create simple policies
CREATE POLICY "communities_all" ON public.communities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "community_members_all" ON public.community_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "lists_all" ON public.lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "list_members_all" ON public.list_members FOR ALL USING (true) WITH CHECK (true);

-- Step 9: Grant permissions
GRANT ALL ON public.communities TO authenticated;
GRANT ALL ON public.community_members TO authenticated;
GRANT ALL ON public.lists TO authenticated;
GRANT ALL ON public.list_members TO authenticated;

-- Step 10: Verify success
SELECT 
  'SUCCESS! All tables created!' as result,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('communities', 'community_members', 'lists', 'list_members')) as tables_created;