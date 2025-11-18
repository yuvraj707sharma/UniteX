-- Simple fix for hashtag_id column error
-- Run this FIRST before the main schema

-- Drop and recreate post_hashtags table with correct structure
DROP TABLE IF EXISTS post_hashtags CASCADE;

-- Create hashtags table first if it doesn't exist
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_hashtags with all required columns
CREATE TABLE post_hashtags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, hashtag_id)
);

-- Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'post_hashtags' 
ORDER BY ordinal_position;