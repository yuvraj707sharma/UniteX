# Fix: Posts Not Showing in Home Feed

## Problem

The home feed shows "No posts yet" even though you have created 4 posts.

## Root Cause

This is likely caused by **Row Level Security (RLS)** policies in Supabase that are preventing the
app from reading posts from the database.

## Solution

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://hesqzincnlrpwoajckxu.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Fix Script

Copy and paste the contents of `src/utils/database-fixes.sql` into the SQL editor and run it.

Or run these commands one by one:

```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read posts
DROP POLICY IF EXISTS "Allow authenticated users to read posts" ON posts;
CREATE POLICY "Allow authenticated users to read posts"
ON posts FOR SELECT
TO authenticated
USING (true);

-- Allow users to create their own posts
DROP POLICY IF EXISTS "Allow users to create posts" ON posts;
CREATE POLICY "Allow users to create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);
```

### Step 3: Fix Profiles Table RLS

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read profiles
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

### Step 4: Verify Posts Exist

Run this query to check if posts are in the database:

```sql
SELECT COUNT(*) as total_posts FROM posts;
SELECT id, author_id, content, created_at, is_approved FROM posts ORDER BY created_at DESC LIMIT 10;
```

### Step 5: Rebuild and Test

After running the SQL commands:

1. Close and reopen your app
2. Pull down to refresh the home feed
3. Click the refresh icon in the top right corner

## Changes Made to the App

I've made the following improvements to help debug and fix the issue:

1. **Better Error Handling**: Added detailed console logging to track what's happening
2. **Separate Queries**: Split the posts query from the profiles query to identify where the issue
   is
3. **Refresh Button**: Added a refresh icon in the header to manually reload posts
4. **Real-time Updates**: Added a Supabase real-time subscription to automatically show new posts
5. **Debug Counter**: Shows total posts count from database in the empty state

## Testing the Fix

1. Run the SQL scripts in Supabase
2. Open the app
3. Check the browser console (if testing in browser) or logcat (if on Android) for debug messages:
    - "Total posts in database: X"
    - "Raw posts data: {...}"
    - "Profiles data: {...}"
4. If you see posts in the console but not on screen, there might be a rendering issue
5. If you see errors in the console, they will tell us what's blocking the queries

## Additional Debugging

If posts still don't show after running the SQL fixes:

1. **Check User Authentication**:
   ```sql
   SELECT id, email FROM auth.users LIMIT 10;
   ```

2. **Check if posts have author_id set correctly**:
   ```sql
   SELECT p.id, p.author_id, pr.full_name 
   FROM posts p
   LEFT JOIN profiles pr ON p.author_id = pr.id
   LIMIT 10;
   ```

3. **Verify foreign key constraint**:
   ```sql
   SELECT constraint_name FROM information_schema.table_constraints 
   WHERE table_name = 'posts' AND constraint_type = 'FOREIGN KEY';
   ```

## Contact

If the issue persists after these steps, please provide:

- Screenshots of the SQL query results
- Console logs from the app
- Any error messages you see
