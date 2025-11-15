-- ========================================
-- FIX: Post Likes Table (Avoiding exp() conflict)
-- ========================================
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing table if it exists
DROP TABLE IF EXISTS public.post_likes CASCADE;

-- Step 2: Ensure uuid extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create post_likes table with correct UUID function
CREATE TABLE public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

-- Step 4: Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant permissions
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT ON public.post_likes TO anon;

-- Step 6: Create RLS Policies
CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Create indexes for performance
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX idx_post_likes_created_at ON public.post_likes(created_at DESC);

-- Step 8: Create trigger to auto-update like counts in posts table
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Increment like count
    UPDATE public.posts 
    SET likes_count = COALESCE(likes_count, 0) + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement like count
    UPDATE public.posts 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Attach trigger
DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Step 10: Verify table was created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'post_likes') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'post_likes';

-- Step 11: Verify policies exist
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'post_likes';

-- Step 12: Test insert (replace with your actual IDs)
-- Uncomment and update these lines to test:
-- INSERT INTO public.post_likes (post_id, user_id) 
-- VALUES (
--   'bb0473bb-7961-4443-9238-030df59d7ffa',
--   '7646b65a-83e9-4842-857a-861272d2de70'
-- );

SELECT 'post_likes table created successfully!' as status;