# UniteX Supabase Setup Guide

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "UniteX"
3. Choose region closest to India
4. Set strong database password

## 2. Database Setup

### Run SQL Scripts in Order:
1. **schema.sql** - Core database structure
2. **feed-algorithm.sql** - Personalized feed algorithms  
3. **media-storage.sql** - Media handling functions

### In Supabase SQL Editor:
```sql
-- Copy and paste each file content
```

## 3. Storage Buckets Setup

### Create Buckets:
```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('post-media', 'post-media', true),
('thumbnails', 'thumbnails', true);
```

### Storage Policies:
```sql
-- Avatar bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
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
```

## 4. Authentication Setup

### Email Domain Restriction:
1. Go to Authentication > Settings
2. Add custom SMTP (optional)
3. Set email domain allowlist: `jecrcu.edu.in`

### Auth Policies:
```sql
-- Only allow JECRC emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    IF NEW.email NOT LIKE '%@jecrcu.edu.in' THEN
        RAISE EXCEPTION 'Only JECRC email addresses are allowed';
    END IF;
    
    INSERT INTO public.profiles (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        split_part(NEW.email, '@', 1)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. Environment Variables

### Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 6. Edge Functions (Optional)

### Deploy for advanced features:
- Image processing
- Video thumbnail generation  
- Email notifications
- Algorithm calculations

## 7. Database Indexes & Performance

### Additional Indexes:
```sql
-- Full-text search
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
CREATE INDEX idx_profiles_search ON profiles USING gin(to_tsvector('english', full_name || ' ' || bio));

-- Performance indexes
CREATE INDEX idx_posts_engagement_time ON posts(engagement_score DESC, created_at DESC);
CREATE INDEX idx_user_engagement_recent ON user_engagement(user_id, created_at DESC);
```

## 8. Cron Jobs Setup

### In Supabase Dashboard > Database > Cron:
```sql
-- Update trending scores every hour
SELECT cron.schedule('update-trending', '0 * * * *', 'SELECT update_trending_scores();');

-- Cleanup orphaned media daily
SELECT cron.schedule('cleanup-media', '0 2 * * *', 'SELECT cleanup_orphaned_media();');
```

## Next Steps:
1. Run all SQL scripts
2. Set up storage buckets
3. Configure authentication
4. Test with sample data
5. Deploy frontend to Vercel/Netlify