# 🔴 CRITICAL: Check Your Table Name!

## Run this in Supabase SQL Editor:

```sql
-- Check which table exists
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename = 'likes' OR tablename = 'post_likes');
```

## Possible Results:

### Result 1: Table is called `post_likes`

```
tablename   | schemaname
------------|------------
post_likes  | public
```

**Action**: Code is NOW FIXED! ✅ Just rebuild the app.

### Result 2: Table is called `likes`

```
tablename | schemaname
----------|------------
likes     | public
```

**Action**: Change code BACK to `likes` OR rename table to `post_likes`

### Result 3: NO TABLE EXISTS

```
(empty result)
```

**Action**: Create the table with this script:

```sql
CREATE TABLE public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT post_likes_post_user_unique UNIQUE (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO anon;

CREATE POLICY "Enable read access for all users" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);

-- Trigger for auto-updating post counts
CREATE OR REPLACE FUNCTION public.handle_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_count();
```

---

## After Running the Check:

1. **If table is `post_likes`**: Rebuild app and test!
2. **If table is `likes`**: I'll change the code back
3. **If no table**: Run the create script above

**Please run the check query and tell me which result you got!**
