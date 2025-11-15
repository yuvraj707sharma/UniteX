# Debug Steps - Posts Not Showing

## Check These:

1. **Are posts in database?**
   - Go to Supabase Dashboard
   - Table Editor → posts table
   - Check if your posts exist

2. **Check author_id matches your user ID**
   - Table Editor → profiles table
   - Find your profile, copy the `id`
   - Check if posts table has `author_id` matching that `id`

3. **Check browser console for errors**
   - Open browser DevTools (F12)
   - Look for red errors in Console tab
   - Check Network tab for failed requests

4. **Test the query directly in Supabase**
   - SQL Editor in Supabase
   - Run this query:
   ```sql
   SELECT 
     posts.*,
     profiles.full_name,
     profiles.username,
     profiles.department,
     profiles.avatar_url
   FROM posts
   JOIN profiles ON posts.author_id = profiles.id
   ORDER BY posts.created_at DESC;
   ```

## Common Issues:

- **RLS Policies**: Posts table might have Row Level Security blocking reads
- **Missing JOIN**: profiles table might not have matching author_id
- **Empty table**: No posts actually created yet

## Quick Fix - Disable RLS temporarily:

In Supabase Dashboard:
1. Go to Authentication → Policies
2. Find `posts` table
3. Click "Disable RLS" temporarily to test
4. Refresh your app

If posts show up, the issue is RLS policies.
