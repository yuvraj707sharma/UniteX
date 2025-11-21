# 🔧 Supabase Setup Fix - Enable Sign Up & Comments

## ❌ **Current Issue:**

- Friends cannot sign up → "Failed to load"
- Comments fail → "Failed to comment"

## ✅ **Root Cause:**

Your Supabase database needs proper configuration for:

1. Email authentication
2. Database tables
3. Row Level Security (RLS) policies

---

## 📋 **Step-by-Step Fix:**

### **Step 1: Go to Supabase Dashboard**

1. Open: https://supabase.com/dashboard/project/hesqzincnlrpwoajckxu
2. Log in with your account

---

### **Step 2: Enable Email Authentication**

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **ENABLED**
4. Enable these options:
    - ✅ **Confirm email** (or disable for testing)
    - ✅ **Enable sign ups**
5. Click **Save**

---

### **Step 3: Create Database Tables**

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  student_id TEXT,
  employee_id TEXT,
  department TEXT NOT NULL DEFAULT 'General',
  course TEXT,
  year_of_study INTEGER,
  graduation_year INTEGER,
  designation TEXT,
  specialization TEXT[],
  skills TEXT[],
  interests TEXT[],
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_faculty BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  account_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'idea',
  media_urls TEXT[],
  media_types TEXT[],
  project_title TEXT,
  required_skills TEXT[],
  required_departments TEXT[],
  project_status TEXT,
  team_size_needed INTEGER,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  media_urls TEXT[],
  media_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Click **Run** (F5)
5. You should see: **Success. No rows returned**

---

### **Step 4: Enable Row Level Security (RLS)**

Copy and paste this SQL to enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Posts: Anyone can read, authenticated users can create
CREATE POLICY "Posts are viewable by everyone" 
  ON public.posts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" 
  ON public.posts FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" 
  ON public.posts FOR DELETE 
  USING (auth.uid() = author_id);

-- Comments: Anyone can read, authenticated users can create
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = author_id);

-- Post Likes: Anyone can read, authenticated users can like
CREATE POLICY "Likes are viewable by everyone" 
  ON public.post_likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like posts" 
  ON public.post_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" 
  ON public.post_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Follows: Anyone can read, authenticated users can follow
CREATE POLICY "Follows are viewable by everyone" 
  ON public.follows FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can follow others" 
  ON public.follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
  ON public.follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- Messages: Users can only see their own messages
CREATE POLICY "Users can view their messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = receiver_id);
```

Click **Run** (F5)

---

### **Step 5: Create Auto-Profile Function**

This function automatically creates a profile when a user signs up:

```sql
-- Function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'department', 'General')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Click **Run** (F5)

---

### **Step 6: Test the Setup**

Go to **Authentication** → **Users** and check if you see any test users.

If the tables are empty, that's okay! The app will populate them when users sign up.

---

## 🎉 **You're Done!**

Now rebuild and test your app:

```powershell
cd C:\UniteX\UniteX App Design (Community)
npm run build
npx cap sync android
npx cap run android
```

---

## ✅ **What Should Work Now:**

| Feature | Status |
|---------|--------|
| Sign up with email | ✅ **WORKS** |
| Receive magic link | ✅ **WORKS** |
| Create profile | ✅ **WORKS** |
| Post content | ✅ **WORKS** |
| Comment on posts | ✅ **WORKS** |
| Like posts | ✅ **WORKS** |
| Send messages | ✅ **WORKS** |

---

## 🐛 **Still Not Working?**

### **Check Email Delivery:**

1. Go to **Authentication** → **Email Templates**
2. Test email delivery
3. Check spam folder

### **Disable Email Confirmation (for testing):**

1. Go to **Authentication** → **Providers** → **Email**
2. **Uncheck** "Confirm email"
3. Save

This allows users to sign up without email verification (good for testing).

---

## 📧 **Alternative: Use Development Mode**

For faster testing, you can disable email confirmation entirely:

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Toggle OFF "Confirm email"
3. Save

Now users can sign up and log in immediately without waiting for email!

---

## 🔐 **Security Notes:**

- The RLS policies above are secure for production
- Users can only modify their own data
- Everyone can read public posts/profiles
- Messages are private between sender/receiver

---

**After completing these steps, your friends should be able to sign up and comment successfully!**
🎉
