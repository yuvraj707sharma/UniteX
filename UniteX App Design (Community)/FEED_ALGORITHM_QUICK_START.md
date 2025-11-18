# UniteX Feed Algorithm - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Run SQL Schema (2 minutes)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `src/lib/feed-algorithm-schema.sql`
4. Copy the entire content
5. Paste into SQL Editor
6. Click **Run**
7. Wait for success message: `✅ Feed algorithm schema created successfully!`

### Step 2: Verify Tables Created (30 seconds)

In SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('follows', 'hashtags', 'post_hashtags', 'user_interests', 'post_interactions')
ORDER BY table_name;
```

You should see 5 tables listed.

### Step 3: Verify Functions Created (30 seconds)

In SQL Editor, run:

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%feed%' OR routine_name LIKE '%hashtag%'
ORDER BY routine_name;
```

You should see 6 functions listed.

### Step 4: Build Frontend (2 minutes)

```bash
cd "C:/UniteX/UniteX App Design (Community)"
npm run build
npm run build:mobile
```

### Step 5: Test in Browser

1. Open the app in browser or emulator
2. Open browser console (F12)
3. Pull down on the home feed
4. Look for one of these messages:
    - ✅ "Using personalized feed, got X posts" - Algorithm working!
    - ℹ️ "Using chronological feed, got X posts" - Fallback mode (normal for new users)

---

## 📝 How to Use

### For Users

**The feed automatically learns from:**

- Posts from people you follow (30% weight)
- Hashtags you interact with (25% weight)
- Recent posts (20% priority)
- Content similar to what you've engaged with (15%)
- Popular posts (10% boost)

**To improve your feed:**

1. Follow users you're interested in
2. Like/comment on posts with hashtags you care about
3. Use hashtags in your own posts (e.g., `#React #WebDev`)

### For Developers

**The algorithm is called automatically** in `HomeFeed.tsx`:

```tsx
// Fetches personalized feed
const { data: posts } = await supabase.rpc('get_personalized_feed', {
  p_user_id: user.id,
  p_limit: 20,
  p_offset: 0
});
```

**Track interactions** (add to PostCard.tsx):

```tsx
// When user likes a post
trackInteraction(userId, postId, 'like');

// When user comments
trackInteraction(userId, postId, 'comment');

// When user shares
trackInteraction(userId, postId, 'share');
```

---

## 🧪 Testing with Sample Data

### Create Test Users and Follows

```sql
-- Assuming you have two test users already
-- Follow someone
INSERT INTO follows (follower_id, following_id)
VALUES (
  'your-user-id-here',
  'user-to-follow-id-here'
);
```

### Create Posts with Hashtags

```sql
-- Post with hashtags (will auto-extract)
INSERT INTO posts (author_id, content)
VALUES (
  'user-id-here',
  'Just launched my new #React app! Built with #TypeScript and #Supabase 🚀'
);
```

### Simulate Interactions

```sql
-- Like a post
INSERT INTO post_interactions (user_id, post_id, interaction_type)
VALUES ('your-user-id', 'post-id', 'like');

-- Comment on a post
INSERT INTO post_interactions (user_id, post_id, interaction_type)
VALUES ('your-user-id', 'post-id', 'comment');
```

### Check Your Personalized Feed

```sql
SELECT 
  post_id,
  content,
  relevance_score,
  score_breakdown
FROM get_personalized_feed('your-user-id', 10, 0)
ORDER BY relevance_score DESC;
```

---

## 🎯 Key Files Reference

### Frontend

- `src/components/ui/spinner.tsx` - Modern spinner component
- `src/components/ui/post-skeleton.tsx` - Skeleton loaders
- `src/components/HomeFeed.tsx` - Feed integration

### Backend

- `src/lib/feed-algorithm-schema.sql` - Complete database schema

### Documentation

- `FEED_ALGORITHM_DOCUMENTATION.md` - Full technical documentation
- `FEED_ALGORITHM_QUICK_START.md` - This file

---

## 🔍 Debugging

### Check if Algorithm is Active

```tsx
// In HomeFeed.tsx, add this in useEffect:
console.log('Personalized feed enabled:', usePersonalizedFeed);
```

### View Score Breakdown

```tsx
// In HomeFeed.tsx, in fetchPosts():
formattedPosts.forEach(post => {
  if (post.scoreBreakdown) {
    console.log('Post:', post.id, 'Score:', post.relevanceScore, 'Breakdown:', post.scoreBreakdown);
  }
});
```

### Check Hashtag Extraction

```sql
-- See all hashtags
SELECT * FROM hashtags ORDER BY usage_count DESC;

-- See hashtags for a specific post
SELECT h.name, h.usage_count
FROM hashtags h
INNER JOIN post_hashtags ph ON h.id = ph.hashtag_id
WHERE ph.post_id = 'your-post-id';
```

### Check User Interests

```sql
-- See what topics a user is interested in
SELECT 
  h.name as hashtag,
  ui.interest_score
FROM user_interests ui
INNER JOIN hashtags h ON ui.hashtag_id = h.id
WHERE ui.user_id = 'your-user-id'
ORDER BY ui.interest_score DESC;
```

---

## 📊 Algorithm Weights

| Component | Weight | Description |
|-----------|--------|-------------|
| Follow Graph | 30% | Posts from followed users |
| Hashtag Interest | 25% | Posts with topics you like |
| Recency | 20% | Fresh content priority |
| Past Interactions | 15% | Similar to what you've engaged with |
| Engagement | 10% | Popular posts boost |

---

## ⚡ Performance Tips

1. **Index Maintenance**: Supabase automatically maintains indexes
2. **Cache Strategy**: Frontend caches profiles to reduce queries
3. **Pagination**: Use `p_offset` parameter for infinite scroll
4. **Interaction Tracking**: Runs asynchronously, won't slow down UI

---

## 🐛 Common Issues

### "Function get_personalized_feed does not exist"

**Fix:** Re-run the SQL schema file

### "Always seeing chronological feed"

**Cause:** No follows or interactions yet
**Fix:** Follow some users and interact with posts containing hashtags

### "Skeleton loaders not showing"

**Fix:** Clear build cache and rebuild:

```bash
rm -rf dist
npm run build
```

### "Spinner not animating"

**Fix:** Check if animations are enabled in your browser/OS

---

## 🎓 Learning Resources

### Understanding the Algorithm

1. Read `FEED_ALGORITHM_DOCUMENTATION.md` for deep dive
2. Check SQL comments in `feed-algorithm-schema.sql`
3. Review score breakdown in browser console

### Customizing Weights

Edit the weights in `get_personalized_feed()` function:

```sql
(
  rp.follow_score * 0.30 +        -- Change this
  rp.hashtag_score * 0.25 +       -- Change this
  rp.interaction_score * 0.15 +   -- Change this
  rp.recency_score * 0.20 +       -- Change this
  rp.engagement_score * 0.10      -- Change this
)::DECIMAL(10,4) AS relevance_score
```

---

## ✅ Checklist

- [ ] SQL schema executed successfully
- [ ] 5 tables created (follows, hashtags, post_hashtags, user_interests, post_interactions)
- [ ] 6 functions created
- [ ] Frontend built without errors
- [ ] Spinner component working in pull-to-refresh
- [ ] Skeleton loaders showing during initial load
- [ ] Posts loading (either personalized or chronological)
- [ ] Browser console shows feed type message

---

## 🎉 Next Steps

1. **Add More Interactions**: Integrate `trackInteraction()` in PostCard.tsx for likes, comments,
   shares
2. **Display Hashtags**: Show clickable hashtags in post content
3. **Trending Section**: Use `get_trending_hashtags()` to show trending topics
4. **User Interests Page**: Let users see their learned interests
5. **Analytics**: Track algorithm performance and user engagement

---

## 📞 Support

If you encounter issues:

1. Check `FEED_ALGORITHM_DOCUMENTATION.md` troubleshooting section
2. Verify all SQL functions exist:
   `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
3. Check browser console for error messages
4. Verify Supabase RLS policies are correct

---

**Happy Coding! 🚀**

The feed algorithm will continuously improve as users interact with content. The more data it
collects, the better the recommendations become!
