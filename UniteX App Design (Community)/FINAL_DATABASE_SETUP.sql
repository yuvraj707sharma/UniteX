-- ============================================
-- FINAL DATABASE SETUP FOR COMMUNITY POSTS
-- Run this ONCE before testing the new app
-- ============================================

-- Step 1: Add community_id to posts table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'community_id'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
        CREATE INDEX idx_posts_community_id ON public.posts(community_id);
        
        RAISE NOTICE '✅ community_id column added to posts table';
    ELSE
        RAISE NOTICE '✅ community_id column already exists';
    END IF;
END $$;

-- Step 2: Generate usernames for existing communities
UPDATE public.communities
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- Step 3: Add default tags for existing communities
UPDATE public.communities
SET tags = ARRAY['general']
WHERE tags IS NULL OR tags = '{}';

-- Step 4: Verify all tables exist
DO $$
BEGIN
    -- Check communities table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communities') THEN
        RAISE EXCEPTION 'ERROR: communities table does not exist! Run COMMUNITY_UPGRADE_SQL_FIXED.sql first!';
    END IF;
    
    -- Check community_members table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_members') THEN
        RAISE EXCEPTION 'ERROR: community_members table does not exist! Run COMMUNITY_UPGRADE_SQL_FIXED.sql first!';
    END IF;
    
    -- Check community_roles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_roles') THEN
        RAISE EXCEPTION 'ERROR: community_roles table does not exist! Run COMMUNITY_UPGRADE_SQL_FIXED.sql first!';
    END IF;
    
    -- Check posts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        RAISE EXCEPTION 'ERROR: posts table does not exist!';
    END IF;
    
    -- Check post_likes table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes') THEN
        RAISE EXCEPTION 'ERROR: post_likes table does not exist!';
    END IF;
    
    RAISE NOTICE '✅ All required tables exist';
END $$;

-- Step 5: Verify triggers exist
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    -- Check if triggers exist
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_table IN ('post_likes', 'comments', 'community_members');
    
    IF trigger_count = 0 THEN
        RAISE WARNING 'WARNING: No triggers found! Auto-counting may not work. Run COMMUNITY_UPGRADE_SQL_FIXED.sql!';
    ELSE
        RAISE NOTICE '✅ Triggers are active (%)', trigger_count;
    END IF;
END $$;

-- Step 6: Display summary
SELECT 
    'Database Summary' as info,
    (SELECT COUNT(*) FROM communities) as total_communities,
    (SELECT COUNT(*) FROM community_members) as total_memberships,
    (SELECT COUNT(*) FROM posts WHERE community_id IS NOT NULL) as community_posts,
    (SELECT COUNT(*) FROM posts WHERE community_id IS NULL) as regular_posts,
    (SELECT COUNT(*) FROM post_likes) as total_likes;

-- Step 7: Display communities with their details
SELECT 
    id,
    name,
    username,
    members_count,
    array_length(tags, 1) as tag_count,
    is_verified,
    created_at
FROM public.communities
ORDER BY created_at DESC;

-- ============================================
-- ✅ FINAL STATUS
-- ============================================

SELECT '
🎉 DATABASE SETUP COMPLETE!

Your database is now ready for community posts!

✅ Posts can be linked to communities
✅ Usernames generated for all communities
✅ Tags added to communities
✅ All tables verified
✅ Triggers checked

Next Steps:
1. Install the APK on your device
2. Test creating a community
3. Test posting in a community
4. Test liking/commenting

Check INSTALL_AND_TEST_GUIDE.md for detailed testing instructions!
' as status;
