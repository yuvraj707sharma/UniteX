-- Check user_interests table structure specifically
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_interests' 
ORDER BY ordinal_position;