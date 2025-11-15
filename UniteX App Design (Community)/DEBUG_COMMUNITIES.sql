-- ============================================
-- Debug Communities - Check What Exists
-- ============================================

-- Check all communities
SELECT 
  'COMMUNITIES IN DATABASE:' as info,
  id,
  name,
  description,
  creator_id,
  members_count,
  created_at
FROM public.communities
ORDER BY created_at DESC;

-- Check community members
SELECT 
  'COMMUNITY MEMBERS:' as info,
  cm.id,
  c.name as community_name,
  cm.user_id,
  p.full_name as member_name,
  cm.joined_at
FROM public.community_members cm
LEFT JOIN public.communities c ON c.id = cm.community_id
LEFT JOIN public.profiles p ON p.id = cm.user_id
ORDER BY cm.joined_at DESC;

-- Check YOUR communities (replace with your user ID)
SELECT 
  'YOUR COMMUNITIES:' as info,
  c.name,
  c.members_count,
  CASE 
    WHEN cm.user_id IS NOT NULL THEN 'JOINED'
    ELSE 'NOT JOINED'
  END as status
FROM public.communities c
LEFT JOIN public.community_members cm ON cm.community_id = c.id AND cm.user_id = '7646b65a-83e9-4842-857a-861272d2de70'
ORDER BY c.created_at DESC;

-- Count everything
SELECT 
  (SELECT COUNT(*) FROM public.communities) as total_communities,
  (SELECT COUNT(*) FROM public.community_members) as total_members,
  (SELECT COUNT(*) FROM public.community_members WHERE user_id = '7646b65a-83e9-4842-857a-861272d2de70') as your_joined_count;
