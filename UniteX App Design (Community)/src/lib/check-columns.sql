-- Check the exact column structures
-- Run these to see what columns exist

-- 1. Check post_hashtags columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'post_hashtags' 
ORDER BY ordinal_position;

-- 2. Check user_interests columns  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_interests' 
ORDER BY ordinal_position;

-- 3. Check hashtags columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'hashtags' 
ORDER BY ordinal_position;