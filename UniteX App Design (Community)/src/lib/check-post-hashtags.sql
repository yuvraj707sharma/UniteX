-- Check post_hashtags table structure specifically
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'post_hashtags' 
ORDER BY ordinal_position;