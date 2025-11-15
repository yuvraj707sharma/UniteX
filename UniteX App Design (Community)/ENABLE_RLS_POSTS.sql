-- Re-enable RLS on posts table with proper policies
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete posts" ON public.posts;

-- Create comprehensive policies
CREATE POLICY "Enable read access for all users" 
  ON public.posts FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
  ON public.posts FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Enable update for post authors" 
  ON public.posts FOR UPDATE 
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Enable delete for post authors" 
  ON public.posts FOR DELETE 
  TO authenticated
  USING (auth.uid() = author_id);

-- Grant permissions
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;

SELECT 'RLS re-enabled on posts table!' as result;
