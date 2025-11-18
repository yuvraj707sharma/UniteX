# UniteX Implementation Summary - Feed Algorithm & Modern UI

## Executive Summary

This document summarizes the implementation of two major enhancements to the UniteX social platform:

### A) Modern Pull-to-Refresh UI

Replaced basic text-based loading indicators with professional circular SVG spinners and skeleton
loaders that are:

- ✨ Modern and visually appealing
- ♿ Accessible with ARIA labels
- 🎨 Motion-friendly for users with motion sensitivities
- 📱 Optimized for mobile pull-to-refresh

### B) Intelligent Feed Algorithm

Implemented a lightweight, explainable feed suggestion system that ranks posts based on:

- 🎯 **Follow Graph** (30%) - Posts from people you follow
- 🏷️ **Hashtag Interests** (25%) - Topics you engage with
- 🕒 **Recency** (20%) - Fresh content gets priority
- 🔄 **Past Interactions** (15%) - Similar content you've liked
- 📈 **Engagement** (10%) - Popular posts get a boost

---

## What Was Changed

### New Files Created (3 files)

#### 1. `src/components/ui/spinner.tsx`

**Type:** React Component  
**Size:** ~55 lines  
**Purpose:** Reusable SVG spinner with multiple size/color variants

**Exports:**

- `Spinner` component with props:
    - `size?: "sm" | "md" | "lg" | "xl"`
    - `variant?: "default" | "primary" | "muted"`
    - `className?: string`

**Features:**

- Respects `prefers-reduced-motion` accessibility setting
- ARIA labels for screen readers
- Smooth circular animation
- Customizable colors via Tailwind

---

#### 2. `src/components/ui/post-skeleton.tsx`

**Type:** React Component  
**Size:** ~56 lines  
**Purpose:** Skeleton loader matching PostCard structure

**Exports:**

- `PostSkeleton` - Single skeleton
- `PostSkeletonList` - Multiple skeletons with `count` prop

**Features:**

- Matches PostCard layout exactly
- Randomized image placeholder (50% chance)
- Pulse animation
- Responsive design

---

#### 3. `src/lib/feed-algorithm-schema.sql`

**Type:** SQL Schema  
**Size:** ~480 lines  
**Purpose:** Complete database schema for personalized feed

**Creates:**

- 5 database tables
- 6 SQL functions
- 3 triggers
- Multiple indexes
- RLS policies

---

### Modified Files (1 file)

#### `src/components/HomeFeed.tsx`

**Changes:**

1. Added imports for `Spinner` and `PostSkeletonList`
2. Replaced 3 loading spinners with new `Spinner` component
3. Replaced loading state with `PostSkeletonList` (5 skeletons)
4. Added `usePersonalizedFeed` state variable
5. Modified `fetchPosts()` to call personalized feed algorithm
6. Added fallback to chronological feed if algorithm unavailable
7. Added `trackInteraction()` function for user interaction tracking
8. Added algorithm metadata to post data structure

**Lines Changed:** ~150 lines modified/added

---

## Database Schema Details

### Tables Created

#### 1. `follows`

**Purpose:** Store follow relationships (who follows whom)

**Columns:**

- `id` - UUID primary key
- `follower_id` - UUID of user who is following
- `following_id` - UUID of user being followed
- `created_at` - Timestamp

**Constraints:**

- UNIQUE(follower_id, following_id) - Can't follow twice
- CHECK(follower_id != following_id) - Can't follow self

**Indexes:**

- `idx_follows_follower` - Fast lookup of who user follows
- `idx_follows_following` - Fast lookup of user's followers
- `idx_follows_created` - Chronological sorting

**Trigger:** `on_follow_change` - Updates follower counts on profiles

---

#### 2. `hashtags`

**Purpose:** Store all unique hashtags extracted from posts

**Columns:**

- `id` - UUID primary key
- `name` - TEXT, original hashtag (e.g., "React")
- `normalized_name` - TEXT, lowercase version (e.g., "react")
- `usage_count` - INTEGER, total times used
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Indexes:**

- `idx_hashtags_normalized` - Fast hashtag lookup
- `idx_hashtags_usage` - Trending hashtags sorting

---

#### 3. `post_hashtags`

**Purpose:** Junction table linking posts to hashtags (many-to-many)

**Columns:**

- `id` - UUID primary key
- `post_id` - UUID reference to posts
- `hashtag_id` - UUID reference to hashtags
- `created_at` - Timestamp

**Constraints:**

- UNIQUE(post_id, hashtag_id) - No duplicate tags per post

**Indexes:**

- `idx_post_hashtags_post` - Find hashtags for a post
- `idx_post_hashtags_hashtag` - Find posts for a hashtag

---

#### 4. `user_interests`

**Purpose:** Track user interest in topics (learned from interactions)

**Columns:**

- `id` - UUID primary key
- `user_id` - UUID reference to user
- `hashtag_id` - UUID reference to hashtag
- `interest_score` - DECIMAL(3,2), range 0.0 to 1.0
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Constraints:**

- UNIQUE(user_id, hashtag_id) - One score per user per hashtag

**How It Works:**

- Starts at default when user first interacts with hashtag
- Increases based on interaction type:
    - View: +0.05
    - Like: +0.20
    - Comment: +0.40
    - Share: +0.30
    - Bookmark: +0.35
    - Click: +0.10
- Capped at 1.0 maximum

---

#### 5. `post_interactions`

**Purpose:** Track all user interactions for algorithm learning

**Columns:**

- `id` - UUID primary key
- `user_id` - UUID reference to user
- `post_id` - UUID reference to post
- `interaction_type` - TEXT, one of: 'view', 'like', 'comment', 'share', 'bookmark', 'click'
- `interaction_weight` - DECIMAL(3,2)
- `created_at` - Timestamp

**Indexes:**

- `idx_post_interactions_user` - User's interaction history
- `idx_post_interactions_post` - Post's interaction analytics
- `idx_post_interactions_type` - Filter by interaction type

**Trigger:** `on_post_interaction` - Updates user_interests automatically

---

### SQL Functions

#### 1. `get_personalized_feed(p_user_id, p_limit, p_offset)`

**Purpose:** Main algorithm - returns ranked posts

**Parameters:**

- `p_user_id` UUID - User requesting feed
- `p_limit` INTEGER - Number of posts (default 20)
- `p_offset` INTEGER - Pagination offset (default 0)

**Returns:** Table with columns:

- `post_id` UUID
- `author_id` UUID
- `content` TEXT
- `media_urls` TEXT[]
- `likes_count` INTEGER
- `comments_count` INTEGER
- `shares_count` INTEGER
- `created_at` TIMESTAMP
- `relevance_score` DECIMAL
- `score_breakdown` JSONB

**Algorithm:**

```
relevance_score = 
  follow_score * 0.30 +        // Is author followed?
  hashtag_score * 0.25 +       // Matches user interests?
  interaction_score * 0.15 +   // Similar to past likes?
  recency_score * 0.20 +       // How fresh?
  engagement_score * 0.10      // How popular?
```

**Performance:**

- Uses CTEs for efficient queries
- Indexed lookups
- Limited to posts from last 30 days
- Excludes user's own posts

---

#### 2. `extract_and_store_hashtags(p_post_id, p_content)`

**Purpose:** Extract hashtags from text

**Parameters:**

- `p_post_id` UUID - Post to tag
- `p_content` TEXT - Content to scan

**Returns:** INTEGER - Number of hashtags found

**How It Works:**

1. Regex match: `#(\w+)` finds all hashtags
2. Converts to lowercase
3. Inserts into `hashtags` table (or increments usage_count)
4. Links to post in `post_hashtags` table

**Example:**

```
Input: "Check out my #React app! #JavaScript #WebDev"
Extracts: ["react", "javascript", "webdev"]
Returns: 3
```

**Trigger:** `on_post_content_change` - Runs automatically on INSERT/UPDATE

---

#### 3. `get_trending_hashtags(p_limit, p_time_window)`

**Purpose:** Find trending topics

**Parameters:**

- `p_limit` INTEGER - How many to return (default 10)
- `p_time_window` INTERVAL - Time range (default 24 hours)

**Returns:** Table with:

- `hashtag_name` TEXT
- `recent_usage_count` BIGINT
- `total_usage_count` INTEGER

**Usage:**

```sql
-- Top 10 trending in last 24 hours
SELECT * FROM get_trending_hashtags(10, INTERVAL '24 hours');

-- Top 5 trending this week
SELECT * FROM get_trending_hashtags(5, INTERVAL '7 days');
```

---

#### 4. `update_follow_counts()`

**Purpose:** Trigger to update follower/following counts

**Trigger:** `on_follow_change`  
**Fires:** AFTER INSERT OR DELETE on `follows`

**Actions:**

- INSERT: Increments counts
- DELETE: Decrements counts (minimum 0)

---

#### 5. `auto_extract_hashtags()`

**Purpose:** Trigger to extract hashtags from posts

**Trigger:** `on_post_content_change`  
**Fires:** AFTER INSERT OR UPDATE OF content on `posts`

**Action:** Calls `extract_and_store_hashtags()` for the post

---

#### 6. `update_user_interests_from_interaction()`

**Purpose:** Trigger to learn user interests

**Trigger:** `on_post_interaction`  
**Fires:** AFTER INSERT on `post_interactions`

**Action:**

- Determines weight based on interaction type
- Updates interest score for all hashtags in post
- Uses incremental learning (adds 50% of weight)
- Caps at 1.0 maximum

---

## Frontend Integration

### Component Changes

#### HomeFeed.tsx

**New State Variables:**

```tsx
const [usePersonalizedFeed, setUsePersonalizedFeed] = useState(true);
```

**Modified Functions:**

##### `fetchPosts(pageNum, append)`

**Old Flow:**

1. Fetch posts from `posts` table
2. Order by `created_at DESC`
3. Fetch profiles
4. Format and display

**New Flow:**

1. Get current user ID
2. Try to call `get_personalized_feed()` RPC
3. If successful, use personalized results
4. If fails, fall back to chronological query
5. Track views as interactions
6. Fetch profiles
7. Format and display (includes relevance score)

**RPC Call:**

```tsx
const { data: personalizedPosts } = await supabase
  .rpc('get_personalized_feed', {
    p_user_id: user.id,
    p_limit: POSTS_PER_PAGE,
    p_offset: pageNum * POSTS_PER_PAGE
  });
```

**New Function:**

##### `trackInteraction(userId, postId, interactionType)`

**Purpose:** Record user interactions for learning

**Parameters:**

- `userId` - Current user UUID
- `postId` - Post being interacted with
- `interactionType` - 'view', 'like', 'comment', 'share', 'bookmark', 'click'

**Implementation:**

```tsx
const trackInteraction = async (userId, postId, interactionType) => {
  try {
    await supabase
      .from('post_interactions')
      .insert({ user_id: userId, post_id: postId, interaction_type: interactionType });
  } catch (error) {
    console.debug('Failed to track interaction:', error);
  }
};
```

**Auto-Called:** When posts are viewed in feed

**TODO:** Add to PostCard for likes, comments, shares

---

### UI Components

#### Spinner Component

**Replaced 3 instances:**

1. **Pull-to-refresh indicator** (line ~377)
    - Old: `<div className="animate-spin w-4 h-4 border-2..."></div>`
    - New: `<Spinner size="sm" variant="primary" />`

2. **Initial loading state** (line ~437)
    - Old: Single spinner centered
    - New: `<PostSkeletonList count={5} />`

3. **Load more spinner** (line ~479)
    - Old: `<div className="animate-spin w-6 h-6..."></div>`
    - New: `<Spinner size="md" variant="primary" />`

---

## How It Works - Step by Step

### For New Users (No Data Yet)

1. User opens app
2. HomeFeed calls `fetchPosts()`
3. Tries to get personalized feed
4. No follows/interests exist, returns empty
5. Falls back to chronological feed
6. Shows posts ordered by `created_at DESC`
7. User sees **all posts** from everyone

**Console:** "Using chronological feed, got X posts"

---

### As User Interacts

#### User Follows Someone

1. Click "Follow" button
2. Insert into `follows` table
3. Trigger updates `following_count` and `followers_count`
4. Next feed refresh gives 30% boost to followed user's posts

#### User Views Posts

1. Posts load in feed
2. `trackInteraction()` called for each post
3. Inserts 'view' interaction
4. Trigger updates interest scores for hashtags in post (+0.05 each)

#### User Likes a Post with #React

1. Like button clicked (need to add tracking)
2. `trackInteraction(userId, postId, 'like')` called
3. Inserts 'like' interaction
4. Trigger finds #react hashtag in post
5. Updates user's #react interest score (+0.20)

#### Next Feed Load

1. User refreshes feed
2. `get_personalized_feed()` called
3. Calculates scores:
    - Posts from followed users get 0.30 boost
    - Posts with #react get 0.25 * (user's interest score) boost
    - Recent posts get up to 0.20 boost
    - Posts similar to liked content get 0.15 boost
    - Popular posts get up to 0.10 boost
4. Sorts by total score
5. Returns top 20 posts

**Console:** "Using personalized feed, got X posts"

---

### Example Score Calculation

**Post Details:**

- Content: "Check out my new #React dashboard! #JavaScript"
- Author: User B (followed by User A)
- Created: 2 hours ago
- Likes: 15, Comments: 3, Shares: 2

**User A's Interest Scores:**

- #React: 0.80 (high interest)
- #JavaScript: 0.60 (medium interest)

**Score Calculation:**

```
1. Follow Score: 1.0 (author is followed)
2. Hashtag Score: (0.80 + 0.60) / 2 = 0.70 (average of interests)
3. Interaction Score: 0.40 (interacted with 4 similar #React posts)
4. Recency Score: 0.80 (posted 2 hours ago)
5. Engagement Score: (15*0.3 + 3*0.5 + 2*0.2) / 10 = 0.64

Final Score = 1.0*0.30 + 0.70*0.25 + 0.40*0.15 + 0.80*0.20 + 0.64*0.10
            = 0.30 + 0.175 + 0.06 + 0.16 + 0.064
            = 0.759 (High relevance!)
```

This post will rank very high in User A's feed.

---

## Files Reference

### Created Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/ui/spinner.tsx` | 55 | SVG spinner component |
| `src/components/ui/post-skeleton.tsx` | 56 | Skeleton loader component |
| `src/lib/feed-algorithm-schema.sql` | 480 | Complete database schema |
| `FEED_ALGORITHM_DOCUMENTATION.md` | 901 | Full technical documentation |
| `FEED_ALGORITHM_QUICK_START.md` | 335 | Quick setup guide |
| `IMPLEMENTATION_SUMMARY.md` | This file | Implementation overview |

### Modified Files

| File | Changes | Description |
|------|---------|-------------|
| `src/components/HomeFeed.tsx` | ~150 lines | Integrated algorithm and new UI |

---

## Database Objects

### Tables: 5

1. `follows` - Follow graph
2. `hashtags` - Hashtag directory
3. `post_hashtags` - Post-hashtag links
4. `user_interests` - User topic preferences
5. `post_interactions` - Interaction tracking

### Functions: 6

1. `get_personalized_feed()` - Main algorithm
2. `extract_and_store_hashtags()` - Hashtag extraction
3. `get_trending_hashtags()` - Trending topics
4. `update_follow_counts()` - Trigger function
5. `auto_extract_hashtags()` - Trigger function
6. `update_user_interests_from_interaction()` - Trigger function

### Triggers: 3

1. `on_follow_change` - Updates follower counts
2. `on_post_content_change` - Extracts hashtags
3. `on_post_interaction` - Updates interests

### Indexes: 14

- 3 on `follows`
- 2 on `hashtags`
- 2 on `post_hashtags`
- 3 on `user_interests`
- 3 on `post_interactions`
- 1 on `profiles` (followers_count)

### RLS Policies: 11

- 3 on `follows`
- 1 on `hashtags`
- 1 on `post_hashtags`
- 2 on `user_interests`
- 2 on `post_interactions`
- 2 on `profiles` (columns added)

---

## Setup Checklist

### Database Setup

- [ ] Open Supabase SQL Editor
- [ ] Copy `src/lib/feed-algorithm-schema.sql`
- [ ] Run in SQL Editor
- [ ] Verify 5 tables created
- [ ] Verify 6 functions created
- [ ] Verify no errors

### Frontend Setup

- [ ] Files already created in correct locations
- [ ] Run `npm run build`
- [ ] Run `npm run build:mobile`
- [ ] Verify no build errors

### Testing

- [ ] Open app in browser
- [ ] Check console for feed type message
- [ ] Test pull-to-refresh (spinner shows)
- [ ] Clear cache, reload (skeleton loaders show)
- [ ] Create post with hashtags
- [ ] Verify hashtags extracted (check `hashtags` table)

---

## Performance Metrics

### Expected Query Performance

- Feed generation: 50-200ms for 20 posts
- Hashtag extraction: 5-10ms per post
- Interaction tracking: 2-5ms (async, non-blocking)

### Database Efficiency

- All queries use indexes
- Limited to 30-day window
- Pagination supported
- Profile data cached in frontend

### Optimization Features

- CTEs for complex queries
- Indexed foreign keys
- STABLE function attribute
- Batch profile fetching
- Async interaction tracking

---

## Future Enhancement Ideas

1. **Diversity Injection**
    - Show 10-20% posts outside user's filter bubble
    - Prevents echo chamber effect

2. **Temporal Learning**
    - Track when user is most active
    - Prioritize posts from those hours

3. **Content Type Preferences**
    - Learn if user prefers text/images/videos
    - Boost preferred content types

4. **Collaborative Filtering**
    - "Users similar to you also liked..."
    - Find users with similar interest profiles

5. **Negative Signals**
    - Track hidden/reported posts
    - Reduce similar content

6. **A/B Testing Framework**
    - Test different weight combinations
    - Measure engagement metrics
    - Auto-optimize weights

7. **Hashtag Following**
    - Let users explicitly follow hashtags
    - Add to interest scores

8. **Trending Section**
    - Dedicated page for `get_trending_hashtags()`
    - Show trending posts for each hashtag

9. **User Interests Page**
    - Show user their learned interests
    - Allow manual adjustments
    - Transparency and control

10. **Analytics Dashboard**
    - Feed performance metrics
    - User engagement stats
    - Algorithm effectiveness

---

## Migration Path for Existing Data

If you have existing posts/users:

### Extract Hashtags from Old Posts

```sql
-- Run for all existing posts
SELECT extract_and_store_hashtags(id, content)
FROM posts;
```

### Initialize User Interests

```sql
-- Create initial interests from likes
INSERT INTO user_interests (user_id, hashtag_id, interest_score)
SELECT DISTINCT 
  l.user_id,
  ph.hashtag_id,
  0.20 as initial_score  -- Like weight
FROM likes l
INNER JOIN post_hashtags ph ON l.post_id = ph.post_id
ON CONFLICT (user_id, hashtag_id) DO NOTHING;
```

### Backfill Interactions

```sql
-- Create view interactions from existing data
INSERT INTO post_interactions (user_id, post_id, interaction_type, created_at)
SELECT user_id, post_id, 'like', created_at
FROM likes;

INSERT INTO post_interactions (user_id, post_id, interaction_type, created_at)
SELECT user_id, post_id, 'bookmark', created_at
FROM bookmarks;
```

---

## Troubleshooting Guide

### Issue: Function doesn't exist

**Error:** `function get_personalized_feed(uuid, integer, integer) does not exist`

**Fix:**

1. Verify schema was run:
   `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'get_personalized_feed';`
2. Re-run entire schema file
3. Check for SQL errors in output

---

### Issue: Always chronological feed

**Symptom:** Console shows "Using chronological feed" every time

**Causes:**

1. No follows exist
2. No hashtag interactions
3. Function returning empty

**Debug:**

```sql
-- Check if function works
SELECT * FROM get_personalized_feed('your-user-id', 10, 0);

-- Check follows
SELECT COUNT(*) FROM follows WHERE follower_id = 'your-user-id';

-- Check interests
SELECT COUNT(*) FROM user_interests WHERE user_id = 'your-user-id';
```

**Fix:** Create test data (see Quick Start Guide)

---

### Issue: Skeleton loaders not showing

**Symptom:** Just see blank screen or old spinner

**Fixes:**

1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Rebuild: `rm -rf dist && npm run build`
4. Check imports in HomeFeed.tsx

---

### Issue: Hashtags not being extracted

**Symptom:** Posts created but `hashtags` table empty

**Debug:**

```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_post_content_change';

-- Manually test extraction
SELECT extract_and_store_hashtags(
  'post-id-here',
  'Test post with #React #JavaScript'
);
```

**Fix:** Re-run trigger creation part of schema

---

### Issue: Spinner not animating

**Causes:**

1. Animations disabled in browser
2. Animations disabled in OS (accessibility)
3. CSS not loading

**Fixes:**

1. Check browser settings
2. Check OS accessibility settings
3. Verify Tailwind animations enabled

---

## Testing Strategy

### Unit Testing SQL Functions

```sql
-- Test hashtag extraction
SELECT extract_and_store_hashtags(
  uuid_generate_v4(),
  'Testing #UnitTest #SQL #PostgreSQL'
) as extracted_count;

-- Should return 3

-- Test feed algorithm with test user
SELECT 
  post_id,
  relevance_score,
  score_breakdown
FROM get_personalized_feed('test-user-id', 5, 0);

-- Should return 5 posts with scores
```

### Integration Testing

1. **Create test users** (A, B, C)
2. **User A follows User B**
3. **User B creates post with #Test**
4. **User A views posts** (tracking view)
5. **User A likes B's post**
6. **Verify interest score increased**
7. **Create new #Test post from C**
8. **Verify A's feed ranks it higher**

### Load Testing

```sql
-- Benchmark feed generation
EXPLAIN ANALYZE
SELECT * FROM get_personalized_feed('user-id', 20, 0);

-- Should complete in < 200ms
```

---

## Documentation Files

1. **`FEED_ALGORITHM_DOCUMENTATION.md`** (901 lines)
    - Complete technical reference
    - Algorithm explanation
    - API documentation
    - Examples and use cases

2. **`FEED_ALGORITHM_QUICK_START.md`** (335 lines)
    - 5-minute setup guide
    - Quick testing commands
    - Common issues and fixes

3. **`IMPLEMENTATION_SUMMARY.md`** (This file)
    - High-level overview
    - What was changed
    - How it works
    - Migration guide

---

## Success Criteria

### ✅ Implementation Complete When:

1. All 3 new files created and working
2. HomeFeed.tsx successfully modified
3. SQL schema runs without errors
4. 5 tables created in database
5. 6 functions created in database
6. 3 triggers active
7. Spinner shows during pull-to-refresh
8. Skeleton loaders show during initial load
9. Posts load (chronological or personalized)
10. Console logs show feed type
11. No TypeScript errors
12. No linter errors
13. Build succeeds
14. Mobile build succeeds

### ✅ Algorithm Working When:

1. Console shows "Using personalized feed"
2. Posts include `relevanceScore` field
3. Posts include `scoreBreakdown` field
4. Followed users' posts appear first
5. Hashtags extracted from new posts
6. User interests update after interactions
7. Trending hashtags function returns data

---

## Maintenance

### Regular Tasks

**Weekly:**

- Monitor query performance
- Check error logs for RPC failures
- Verify hashtag extraction working

**Monthly:**

- Review trending hashtags
- Analyze user interest distributions
- Consider weight adjustments

**Quarterly:**

- Clean old interaction data (> 1 year)
- Optimize indexes if needed
- Review and update algorithm

---

## Conclusion

This implementation adds:

- ✨ Professional loading UI
- 🧠 Intelligent content ranking
- 📊 Transparent, explainable algorithm
- 🚀 Optimized database queries
- 🔮 Self-improving recommendations

The system will continuously learn and improve as users interact with content, providing an
increasingly personalized experience without sacrificing transparency or user control.

**Total Development Time:** ~4-6 hours for full implementation
**Maintenance Time:** ~1-2 hours per month

---

**Ready to deploy! 🎉**
