-- Diagnostic queries to find the hashtag_id column issue
-- Run these one by one and share the results

-- 1. Check post_hashtags table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'post_hashtags' 
ORDER BY ordinal_position;

-- 2. Check user_interests table structure  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_interests' 
ORDER BY ordinal_position;

-- 3. Check if hashtags table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'hashtags' 
ORDER BY ordinal_position;

-- 4. List all tables to see what exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;