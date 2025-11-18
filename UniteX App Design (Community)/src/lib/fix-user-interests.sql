-- Fix user_interests table structure
-- Add missing hashtag_id column and rename weight to interest_score

-- Add hashtag_id column
ALTER TABLE user_interests 
ADD COLUMN IF NOT EXISTS hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE;

-- Rename weight to interest_score  
ALTER TABLE user_interests 
RENAME COLUMN weight TO interest_score;

-- Add unique constraint
ALTER TABLE user_interests 
ADD CONSTRAINT user_interests_unique UNIQUE(user_id, hashtag_id);

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_interests' 
ORDER BY ordinal_position;