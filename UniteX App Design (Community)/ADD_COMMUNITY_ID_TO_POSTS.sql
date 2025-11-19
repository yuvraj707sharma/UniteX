-- Add community_id to posts table if it doesn't exist
-- This allows posts to be linked to communities

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'community_id'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
        CREATE INDEX idx_posts_community_id ON public.posts(community_id);
        
        RAISE NOTICE 'community_id column added to posts table';
    ELSE
        RAISE NOTICE 'community_id column already exists';
    END IF;
END $$;

-- Verify it exists
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'community_id';

SELECT 'Posts table ready for community posts!' as status;
