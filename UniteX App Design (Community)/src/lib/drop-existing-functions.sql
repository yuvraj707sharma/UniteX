-- Drop existing functions that might conflict
DROP FUNCTION IF EXISTS get_personalized_feed(uuid, integer, integer);
DROP FUNCTION IF EXISTS extract_and_store_hashtags(uuid, text);
DROP FUNCTION IF EXISTS get_trending_hashtags(integer, interval);
DROP FUNCTION IF EXISTS update_user_interests_from_interaction();
DROP FUNCTION IF EXISTS auto_extract_hashtags();
DROP FUNCTION IF EXISTS update_follow_counts();