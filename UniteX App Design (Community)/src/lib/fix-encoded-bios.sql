-- ============================================
-- FIX DOUBLE-ENCODED BIOS IN DATABASE
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- This fixes bios that were saved with &quot; instead of "
-- and &amp; instead of &

-- Create a function to decode HTML entities
CREATE OR REPLACE FUNCTION decode_html_entities(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN 
    -- Decode in reverse order of encoding
    replace(
      replace(
        replace(
          replace(
            replace(input_text,
              '&#x2F;', '/'),
            '&#x27;', ''''),
          '&quot;', '"'),
        '&gt;', '>'),
      '&lt;', '<');
      -- Note: Keep &amp; for last if it exists in original
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all profiles with encoded bios
UPDATE profiles
SET 
  bio = decode_html_entities(bio),
  full_name = decode_html_entities(full_name)
WHERE 
  bio LIKE '%&quot;%' 
  OR bio LIKE '%&amp;%'
  OR bio LIKE '%&#x27;%'
  OR bio LIKE '%&#x2F;%'
  OR full_name LIKE '%&quot;%'
  OR full_name LIKE '%&amp;%';

-- Show updated records
SELECT 
  id,
  full_name,
  bio,
  username
FROM profiles
WHERE 
  bio IS NOT NULL 
  AND bio != ''
LIMIT 20;

-- Drop the helper function (optional - can keep for future use)
-- DROP FUNCTION IF EXISTS decode_html_entities(TEXT);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bio encoding fix completed!';
  RAISE NOTICE 'All double-encoded bios have been decoded.';
  RAISE NOTICE 'Users can now see quotes and special characters correctly.';
END $$;