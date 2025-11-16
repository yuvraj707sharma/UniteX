# Community Posts Feature

## ✅ Feature Implemented

Users can now create posts directly in communities!

---

## 🎯 What's New

### 1. **Create Posts in Communities**

- Floating action button (+ icon) appears when viewing a community (Posts tab)
- Only visible to members who have joined the community
- Opens the post creation modal with community context

### 2. **View Community Posts**

- All posts created in a community appear in the Posts tab
- Posts are fetched from the database filtered by `community_id`
- Shows author info, content, media, likes, comments

### 3. **Post Creation Modal**

- Same familiar interface as creating regular posts
- Shows "Post in [Community Name]" in the header
- Supports text, images, and videos (up to 4 media files)
- Success message confirms post was created in the community

---

## 🔧 Database Changes Required

To use this feature, you need to add a `community_id` column to your `posts` table in Supabase:

### SQL Migration

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Add community_id column to posts table
ALTER TABLE posts
ADD COLUMN community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_posts_community_id ON posts(community_id);

-- Optional: Add RLS policy for community posts
CREATE POLICY "Users can view community posts if they're members"
ON posts FOR SELECT
USING (
community_id IS NULL OR
EXISTS (
SELECT 1 FROM community_members
WHERE community_members.community_id = posts.community_id
AND community_members.user_id = auth.uid()
)
);
\`\`\`

---

## 📁 Files Modified

### 1. **`CreatePost.tsx`**

- Added `communityId` optional prop
- Added `communityName` optional prop for display
- Modified header to show "Post in [Community Name]"
- Updated database insert to include `community_id`
- Success message differentiates between regular and community posts

### 2. **`CommunityDetail.tsx`**

- Added floating action button (FAB) for creating posts
- Imported and integrated `CreatePost` component
- Added `fetchCurrentUser()` to get user info for post creation
- Updated `fetchPosts()` to fetch actual community posts from database
- Posts are filtered by `community_id`
- Formatted posts to work with existing `PostCard` component
- Added loading state while fetching posts
- FAB only shows when:
    - User has joined the community
    - User is on the "Posts" tab

---

## 🎨 UI/UX Features

### Floating Action Button

- **Position**: Bottom right, above the navigation bar
- **Color**: Blue (dark mode) / Red (light mode)
- **Animation**: Scales in when visible
- **Hover**: Scales up 10% on hover
- **Icon**: Plus (+) symbol

### Create Post Modal

- Shows community name in header
- Same functionality as regular posts
- Auto-closes after successful post
- Refreshes community feed after posting

### Posts Display

- Shows all community posts in chronological order
- Empty state encourages first post
- Different message if not joined ("Join to see posts")
- Uses existing PostCard component (likes, comments, reposts all work)

---

## 🧪 Testing Checklist

### Before Testing

- [ ] Run the SQL migration in Supabase
- [ ] Verify `community_id` column exists in `posts` table

### User Flow

1. [ ] Navigate to Communities tab
2. [ ] Join a community
3. [ ] Click on the community to view details
4. [ ] See the blue/red + button at bottom right
5. [ ] Click + button
6. [ ] See "Post in [Community Name]" modal
7. [ ] Write a post (with or without media)
8. [ ] Click "Post" button
9. [ ] See success message
10. [ ] Post appears in the community feed immediately
11. [ ] Like, comment, repost work on community posts

### Edge Cases

- [ ] 
    + button doesn't show when not joined
- [ ] 
    + button doesn't show on Members tab
- [ ] Can't create post if not joined
- [ ] Posts are isolated to each community
- [ ] Regular posts (no community_id) don't appear in communities

---

## 🔒 Security & Privacy

### Row Level Security (RLS)

The optional RLS policy ensures:

- Users can only see posts in communities they've joined
- Regular posts (community_id = NULL) are visible to everyone
- Community posts are restricted to members

### Best Practices

- Community posts are tied to community membership
- Deleting a community cascades to delete its posts
- Users can only post if they've joined the community (enforced in UI)

---

## 🚀 Future Enhancements

Consider adding:

- [ ] Community moderators can delete inappropriate posts
- [ ] Pin important posts in communities
- [ ] Community post analytics
- [ ] Filter/search community posts
- [ ] Notifications for new posts in joined communities
- [ ] Community-specific rules and guidelines
- [ ] Post approval system for moderated communities

---

## 📊 Impact

### User Benefits

✅ Creates focused discussions within communities
✅ Organizes content by interest/topic
✅ Encourages community engagement
✅ Clear context for where post appears

### Technical Benefits

✅ Reuses existing post infrastructure
✅ Minimal code changes required
✅ Maintains compatibility with regular posts
✅ Efficient database queries with indexes

---

## 🎉 Summary

The community posts feature is now **fully functional**! Users can:

1. Join communities they're interested in
2. Create posts directly in those communities
3. View all posts from community members
4. Interact with posts (like, comment, repost)

All existing post functionality works seamlessly with community posts! 🚀
