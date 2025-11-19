-- Fix NULL usernames and tags for existing communities

-- Generate username from name (convert to lowercase, remove special chars)
UPDATE public.communities
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- Add default tags if NULL
UPDATE public.communities
SET tags = ARRAY['general']
WHERE tags IS NULL OR tags = '{}';

-- Verify the fix
SELECT 
  name,
  username,
  members_count,
  tags,
  is_verified,
  creator_id
FROM public.communities;
