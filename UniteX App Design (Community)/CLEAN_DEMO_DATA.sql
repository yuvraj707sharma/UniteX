-- ============================================
-- Clean ALL Demo/Mock Data from Database
-- ============================================

-- STEP 1: View what data exists (to verify before deleting)
SELECT 'CURRENT COMMUNITIES:' as info;
SELECT id, name, description, creator_id, members_count, created_at FROM public.communities;

SELECT 'CURRENT COMMUNITY MEMBERS:' as info;
SELECT id, community_id, user_id FROM public.community_members;

SELECT 'CURRENT LISTS:' as info;
SELECT id, name, description, user_id FROM public.lists;

-- STEP 2: Delete ALL demo/mock data
-- Delete all community members
DELETE FROM public.community_members;

-- Delete all communities
DELETE FROM public.communities;

-- Delete all list members
DELETE FROM public.list_members;

-- Delete all lists
DELETE FROM public.lists;

-- STEP 3: Reset sequences (so new IDs start fresh)
-- Not needed for UUID-based tables, but included for completeness

-- STEP 4: Verify cleanup
SELECT 'AFTER CLEANUP:' as info;
SELECT COUNT(*) as communities_count FROM public.communities;
SELECT COUNT(*) as community_members_count FROM public.community_members;
SELECT COUNT(*) as lists_count FROM public.lists;
SELECT COUNT(*) as list_members_count FROM public.list_members;

SELECT '✅ All demo data cleaned!' as result;
