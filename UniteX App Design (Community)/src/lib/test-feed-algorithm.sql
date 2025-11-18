-- Get a real user ID first
SELECT id, full_name, username FROM profiles LIMIT 5;

-- See trending hashtags (should work even if empty)
SELECT * FROM get_trending_hashtags(5);

-- See all hashtags
SELECT * FROM hashtags ORDER BY usage_count DESC;

-- Replace 'USER_ID_HERE' with actual UUID from first query
-- SELECT * FROM get_personalized_feed('USER_ID_HERE', 10, 0);