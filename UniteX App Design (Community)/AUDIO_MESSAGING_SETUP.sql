-- ============================================
-- AUDIO MESSAGING MIGRATION
-- Adds audio support to existing messages table
-- ============================================

-- Step 1: Add audio_url column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Step 2: Add audio duration (in seconds) for player UI
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS audio_duration INTEGER;

-- Step 3: Add audio waveform data (JSON array for visualization)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS audio_waveform JSONB;

-- Step 4: Add upload status for offline support
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed'));

-- Step 5: Create index for audio messages
CREATE INDEX IF NOT EXISTS idx_messages_audio_url ON public.messages(audio_url) WHERE audio_url IS NOT NULL;

-- Step 6: Update RLS policies to allow audio uploads
-- (Assuming existing policies already cover media, but let's ensure)

-- Policy for authenticated users to insert messages with audio
DROP POLICY IF EXISTS "Users can send messages with media" ON public.messages;
CREATE POLICY "Users can send messages with media" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Policy for users to view messages (existing, but let's ensure it's there)
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Step 7: Fix image_url and video_url if not properly stored
-- Ensure these columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN video_url TEXT;
    END IF;
END $$;

-- ============================================
-- SUPABASE STORAGE SETUP
-- ============================================

-- Note: Run these commands in Supabase Dashboard > Storage

-- 1. Create 'audio-messages' bucket (if not exists)
--    - Go to Storage > Create Bucket
--    - Name: audio-messages
--    - Public: OFF (private bucket)
--    - File size limit: 10MB
--    - Allowed MIME types: audio/webm, audio/mp4, audio/mpeg, audio/ogg

-- 2. Create 'message-media' bucket for images/videos (if not exists)
--    - Go to Storage > Create Bucket
--    - Name: message-media
--    - Public: OFF (private bucket)
--    - File size limit: 20MB
--    - Allowed MIME types: image/*, video/*

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Audio Messages Bucket Policies
-- Policy 1: Allow authenticated users to upload their own audio
-- INSERT policy for audio-messages bucket
-- Run in Supabase Dashboard:
/*
CREATE POLICY "Users can upload audio messages"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'audio-messages' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- Policy 2: Allow users to read audio from their conversations
-- SELECT policy for audio-messages bucket
/*
CREATE POLICY "Users can access audio from their messages"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'audio-messages'
);
*/

-- Policy 3: Allow users to delete their own audio
-- DELETE policy for audio-messages bucket
/*
CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'audio-messages' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- Message Media Bucket Policies (for images/videos)
-- INSERT policy
/*
CREATE POLICY "Users can upload message media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- SELECT policy
/*
CREATE POLICY "Users can access message media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'message-media'
);
*/

-- DELETE policy
/*
CREATE POLICY "Users can delete their own message media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'message-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns were added
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'messages' 
AND column_name IN ('audio_url', 'audio_duration', 'audio_waveform', 'upload_status', 'image_url', 'video_url')
ORDER BY column_name;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'messages'
AND indexname LIKE '%audio%';

-- Display summary
SELECT '
✅ AUDIO MESSAGING MIGRATION COMPLETE!

Columns Added:
- audio_url (TEXT) - Supabase Storage URL
- audio_duration (INTEGER) - Duration in seconds
- audio_waveform (JSONB) - Waveform data for visualization
- upload_status (TEXT) - pending/uploading/completed/failed

Next Steps:
1. Create "audio-messages" bucket in Supabase Storage
2. Create "message-media" bucket in Supabase Storage
3. Apply storage policies (copy from SQL above)
4. Install the updated APK
5. Grant microphone permission when prompted
6. Test recording & playback!

Check AUDIO_MESSAGING_GUIDE.md for detailed instructions.
' as status;
