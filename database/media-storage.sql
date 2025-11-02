-- Media Storage & Processing Functions
-- Seamless photo/video upload system

-- Storage buckets setup (run in Supabase dashboard)
/*
CREATE BUCKET IF NOT EXISTS 'avatars' WITH (public = true);
CREATE BUCKET IF NOT EXISTS 'post-media' WITH (public = true);
CREATE BUCKET IF NOT EXISTS 'thumbnails' WITH (public = true);
*/

-- Media upload processing function
CREATE OR REPLACE FUNCTION process_media_upload(
    p_user_id UUID,
    p_post_id UUID,
    p_file_name TEXT,
    p_file_url TEXT,
    p_file_type TEXT,
    p_file_size BIGINT,
    p_mime_type TEXT
)
RETURNS UUID AS $$
DECLARE
    media_id UUID;
BEGIN
    -- Insert media record
    INSERT INTO media_files (
        post_id,
        user_id,
        file_name,
        file_url,
        file_type,
        file_size,
        mime_type,
        processing_status
    ) VALUES (
        p_post_id,
        p_user_id,
        p_file_name,
        p_file_url,
        p_file_type,
        p_file_size,
        p_mime_type,
        'processing'
    ) RETURNING id INTO media_id;
    
    -- Update post with media URL
    UPDATE posts 
    SET 
        media_urls = COALESCE(media_urls, '{}') || ARRAY[p_file_url],
        media_types = COALESCE(media_types, '{}') || ARRAY[p_file_type],
        updated_at = NOW()
    WHERE id = p_post_id;
    
    RETURN media_id;
END;
$$ LANGUAGE plpgsql;

-- Generate optimized image sizes
CREATE OR REPLACE FUNCTION generate_image_variants(
    original_url TEXT,
    media_id UUID
)
RETURNS void AS $$
DECLARE
    base_url TEXT;
    thumbnail_url TEXT;
    medium_url TEXT;
BEGIN
    -- Extract base URL without extension
    base_url := regexp_replace(original_url, '\.[^.]*$', '');
    
    -- Generate thumbnail (150x150)
    thumbnail_url := base_url || '_thumb.webp';
    
    -- Generate medium size (800x600)
    medium_url := base_url || '_medium.webp';
    
    -- Update media record with variants
    UPDATE media_files 
    SET 
        thumbnail_url = thumbnail_url,
        processing_status = 'completed'
    WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Video processing function
CREATE OR REPLACE FUNCTION process_video_upload(
    media_id UUID,
    video_url TEXT
)
RETURNS void AS $$
DECLARE
    thumbnail_url TEXT;
BEGIN
    -- Generate video thumbnail URL
    thumbnail_url := regexp_replace(video_url, '\.[^.]*$', '_thumb.jpg');
    
    -- Update media record
    UPDATE media_files 
    SET 
        thumbnail_url = thumbnail_url,
        processing_status = 'completed'
    WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Get media with CDN optimization
CREATE OR REPLACE FUNCTION get_optimized_media_url(
    original_url TEXT,
    size_variant TEXT DEFAULT 'original' -- 'thumbnail', 'medium', 'original'
)
RETURNS TEXT AS $$
DECLARE
    optimized_url TEXT;
BEGIN
    CASE size_variant
        WHEN 'thumbnail' THEN
            optimized_url := regexp_replace(original_url, '\.[^.]*$', '_thumb.webp');
        WHEN 'medium' THEN
            optimized_url := regexp_replace(original_url, '\.[^.]*$', '_medium.webp');
        ELSE
            optimized_url := original_url;
    END CASE;
    
    RETURN optimized_url;
END;
$$ LANGUAGE plpgsql;

-- Clean up orphaned media files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete media files older than 24 hours with no associated post
    DELETE FROM media_files 
    WHERE 
        post_id IS NULL 
        AND created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Storage policies for Supabase
/*
-- Avatar bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Post media bucket policies
CREATE POLICY "Post media is publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'post-media' 
    AND auth.role() = 'authenticated'
);

-- Thumbnails bucket policies
CREATE POLICY "Thumbnails are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');
*/