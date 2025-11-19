# UniteX Badges System - Complete Implementation Guide

## 📋 Overview

The UniteX Badges System is a complete gamification feature that rewards users for their activity,
engagement, and contributions to the platform. The system includes automatic badge awarding,
progress tracking, and beautiful UI components.

## ✨ Features

### Core Features

- **Automatic Badge Awarding**: Badges are automatically awarded when users meet specific criteria
- **Progress Tracking**: Users can see their progress toward earning locked badges
- **4 Badge Categories**: Engagement, Community, Behavior, and Achievement
- **Rarity System**: Common, Rare, Epic, and Legendary badges
- **Points & Gamification**: Each badge awards points for user progression
- **Profile Integration**: Badges are displayed on user profiles
- **Offline-First**: Caching system for optimal performance

### Badge Categories

#### 1. Engagement Badges

- First Post (🎯) - Share your first post
- Contributor I (📝) - Publish 10 posts
- Contributor II (✍️) - Publish 50 posts
- Prolific Creator (🌟) - Publish 100 posts
- Starred Creator (⭐) - Receive 100 likes
- Influencer (💫) - Receive 500 likes
- Legend (🏆) - Receive 1000 likes
- Conversation Starter (💬) - Write 50 comments

#### 2. Community Badges

- Community Explorer (🗺️) - Join 5 communities
- Community Leader (👥) - Join 20 communities
- Community Founder (🏛️) - Create your first community

#### 3. Behavior Badges

- 7-Day Streak (🔥) - Active for 7 consecutive days
- 30-Day Streak (⚡) - Active for 30 consecutive days
- 100-Day Streak (💎) - Active for 100 consecutive days
- Clean Record (✅) - Zero violations for 90 days

#### 4. Achievement Badges

- Project Starter (🚀) - Create your first project
- Project Veteran (🎓) - Create 5 projects
- Collaborator (🤝) - Complete 3 collaborations

## 🗄️ Database Schema

### Tables Created

#### `badges`

Stores all badge definitions with criteria and metadata.

```sql
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- icon_url (TEXT, optional)
- icon_emoji (TEXT)
- category (TEXT: engagement|community|behavior|achievement)
- criteria_type (TEXT: posts_count, likes_received, etc.)
- criteria_value (INTEGER)
- is_level_based (BOOLEAN)
- level (INTEGER)
- rarity (TEXT: common|rare|epic|legendary)
- points (INTEGER)
- display_order (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### `user_badges`

Tracks which badges each user has earned.

```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles.id)
- badge_id (UUID, FK -> badges.id)
- earned_at (TIMESTAMP)
- progress (INTEGER)
- is_featured (BOOLEAN)
- UNIQUE(user_id, badge_id)
```

#### `user_metrics`

Tracks user activity metrics for badge calculation.

```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles.id, UNIQUE)
- posts_count (INTEGER)
- likes_given (INTEGER)
- likes_received (INTEGER)
- comments_count (INTEGER)
- shares_count (INTEGER)
- communities_joined (INTEGER)
- communities_created (INTEGER)
- daily_active_streak (INTEGER)
- total_active_days (INTEGER)
- last_active_date (DATE)
- violations_count (INTEGER)
- projects_created (INTEGER)
- projects_completed (INTEGER)
- collaborations_count (INTEGER)
- profile_views (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

#### `badge_progress`

Tracks progress toward level-based badges.

```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles.id)
- badge_id (UUID, FK -> badges.id)
- current_value (INTEGER)
- last_updated (TIMESTAMP)
- UNIQUE(user_id, badge_id)
```

#### `post_likes` (Created if doesn't exist)

Tracks post likes for badge calculations.

```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles.id)
- post_id (UUID, FK -> posts.id)
- created_at (TIMESTAMP)
- UNIQUE(user_id, post_id)
```

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### Badges Table

- ✅ Everyone can read active badges
- ❌ Only admins can modify (not implemented in policies, manual only)

### User Badges Table

- ✅ Everyone can read all earned badges
- ✅ Users can update their own badge preferences (featured status)

### User Metrics Table

- ✅ Users can read their own metrics
- ❌ Only server functions can write (SECURITY DEFINER)

### Badge Progress Table

- ✅ Users can read their own progress

## ⚙️ Database Functions

### `check_and_award_badges(p_user_id UUID)`

**Purpose**: Check all badge criteria and award newly earned badges.

**Returns**: Table of newly awarded badges (badge_id, badge_title)

**Usage**:

```sql
SELECT * FROM check_and_award_badges('user-uuid-here');
```

**Behavior**:

1. Loops through all active badges
2. Checks if user already earned each badge
3. Fetches relevant metric value
4. Awards badge if criteria met
5. Returns list of newly awarded badges

### `get_user_badges(p_user_id UUID)`

**Purpose**: Get all badges earned by a user with full details.

**Returns**: Table of earned badges with metadata

**Usage**:

```sql
SELECT * FROM get_user_badges('user-uuid-here');
```

### `get_all_badges_with_status(p_user_id UUID)`

**Purpose**: Get all badges with earned status and progress for a user.

**Returns**: All badges with is_earned flag and progress percentage

**Usage**:

```sql
SELECT * FROM get_all_badges_with_status('user-uuid-here');
```

### `get_user_metrics_summary(p_user_id UUID)`

**Purpose**: Get aggregated metrics summary for display.

**Returns**: Single row with key metrics and badge counts

**Usage**:

```sql
SELECT * FROM get_user_metrics_summary('user-uuid-here');
```

### `update_daily_active_streak(p_user_id UUID)`

**Purpose**: Update user's daily active streak.

**Behavior**:

- If active yesterday: increment streak
- If active today already: do nothing
- Otherwise: reset streak to 1

**Usage**:

```sql
SELECT update_daily_active_streak('user-uuid-here');
```

### `initialize_user_metrics()`

**Purpose**: Trigger function to create user_metrics row for new users.

**Trigger**: Runs automatically when a new profile is created

## 🔄 Automatic Triggers

### `on_profile_created_init_metrics`

- **Table**: profiles
- **Event**: AFTER INSERT
- **Action**: Creates user_metrics row for new user

### `on_post_created_increment_posts`

- **Table**: posts
- **Event**: AFTER INSERT
- **Action**: Increments posts_count and checks for badges

### `on_like_created_increment_likes`

- **Table**: post_likes
- **Event**: AFTER INSERT
- **Action**: Increments likes_received for post author and likes_given for liker

### `on_comment_created_increment_comments`

- **Table**: comments
- **Event**: AFTER INSERT
- **Action**: Increments comments_count for commenter

### `on_community_joined_increment`

- **Table**: community_members
- **Event**: AFTER INSERT
- **Action**: Increments communities_joined and checks for badges

## 💻 TypeScript Service API

### BadgeService Class

The main service class for all badge operations.

#### Methods

##### `getAllBadgesWithProgress(userId: string, forceRefresh?: boolean)`

Fetches all badges with user's progress.

```typescript
const badges = await badgeService.getAllBadgesWithProgress(userId);
```

##### `getUserBadges(userId: string, forceRefresh?: boolean)`

Fetches only earned badges for a user.

```typescript
const earnedBadges = await badgeService.getUserBadges(userId);
```

##### `getUserMetrics(userId: string, forceRefresh?: boolean)`

Fetches user metrics summary.

```typescript
const metrics = await badgeService.getUserMetrics(userId);
```

##### `checkAndAwardBadges(userId: string)`

Checks for and awards new badges. Returns notifications.

```typescript
const newBadges = await badgeService.checkAndAwardBadges(userId);
// newBadges: BadgeNotification[]
```

##### `updateDailyActiveStreak(userId: string)`

Updates the user's daily active streak.

```typescript
await badgeService.updateDailyActiveStreak(userId);
```

##### `toggleFeaturedBadge(userId: string, badgeId: string, isFeatured: boolean)`

Feature or unfeature a badge on user's profile.

```typescript
await badgeService.toggleFeaturedBadge(userId, badgeId, true);
```

##### `getBadgesByCategory(userId: string)`

Gets badges grouped by category.

```typescript
const badgesByCategory = await badgeService.getBadgesByCategory(userId);
// Returns: { engagement: Badge[], community: Badge[], ... }
```

##### `getFeaturedBadges(userId: string)`

Gets user's featured badges (max 3).

```typescript
const featured = await badgeService.getFeaturedBadges(userId);
```

##### `getRarityColor(rarity: string)`

Gets CSS classes for badge rarity.

```typescript
const colors = badgeService.getRarityColor('legendary');
// Returns: 'text-yellow-400 bg-yellow-400/10 ...'
```

### Helper Functions

#### `initializeBadgesSystem(userId: string)`

Initializes the badges system for a user session.

```typescript
await initializeBadgesSystem(userId);
```

**What it does**:

1. Updates daily active streak
2. Checks for new badges
3. Prefetches badge data for caching

**When to call**: On app startup after user login

#### `checkBadgesAfterAction(userId: string, showNotification?: boolean)`

Checks for new badges after a user action.

```typescript
await checkBadgesAfterAction(userId, true);
```

**When to call**:

- After user creates a post
- After user receives a like
- After user joins a community
- After any significant action

## 🎨 UI Components

### BadgeCard

Displays a single badge with progress and styling.

```typescript
<BadgeCard
  badge={badge}
  onClick={() => console.log('Clicked')}
  compact={false}
  showProgress={true}
/>
```

**Props**:

- `badge`: Badge object
- `onClick`: Optional click handler
- `compact`: Show compact version (default: false)
- `showProgress`: Show progress bar (default: true)

### BadgesPage

Full-page badges view with categories and filtering.

```typescript
<BadgesPage onBack={() => navigate('profile')} />
```

**Props**:

- `onBack`: Callback when back button is pressed

**Features**:

- Stats overview (points, streak, posts, likes)
- Filter by All/Earned/Locked
- Category tabs
- Badge detail modal
- Progress tracking

### BadgeDetailModal

Modal showing detailed badge information.

```typescript
<BadgeDetailModal
  badge={selectedBadge}
  onClose={() => setSelectedBadge(null)}
/>
```

**Props**:

- `badge`: Badge object or null
- `onClose`: Callback to close modal

**Shows**:

- Badge icon and rarity
- Description
- Requirements with progress
- Rewards
- Earned date (if earned)

### ProfileBadgesRow

Horizontal scrollable row of badges for profiles.

```typescript
<ProfileBadgesRow
  userId={userId}
  onViewAll={() => navigate('badges')}
  limit={6}
/>
```

**Props**:

- `userId`: User ID to fetch badges for
- `onViewAll`: Optional callback to view all badges
- `limit`: Number of badges to show (default: 6)

## 🚀 Integration Guide

### Step 1: Run SQL Migration

1. Open Supabase SQL Editor
2. Copy contents of `src/lib/badges-schema.sql`
3. Run the migration
4. Verify tables are created successfully

### Step 2: Initialize on App Startup

In your main App component or auth handler:

```typescript
import { initializeBadgesSystem } from './services/badgeService';

// After successful login
useEffect(() => {
  if (user) {
    initializeBadgesSystem(user.id);
  }
}, [user]);
```

### Step 3: Add Badge Checks to User Actions

#### When Creating a Post

```typescript
import { checkBadgesAfterAction } from './services/badgeService';

const createPost = async (content: string) => {
  // Create post logic...
  
  // Check for badges
  await checkBadgesAfterAction(userId, true);
};
```

#### When User Receives a Like

The trigger handles this automatically when a row is inserted into `post_likes`.

#### When Joining a Community

The trigger handles this automatically when a row is inserted into `community_members`.

### Step 4: Add Badges to Profile

```typescript
import { ProfileBadgesRow } from './components/badges';

function Profile({ userId }) {
  return (
    <div>
      {/* Other profile content */}
      
      <ProfileBadgesRow 
        userId={userId}
        onViewAll={() => navigate('/badges')}
      />
      
      {/* Rest of profile */}
    </div>
  );
}
```

### Step 5: Add Badges Page Route

```typescript
import { BadgesPage } from './components/badges';

// In your router or screen switcher
case 'badges':
  return <BadgesPage onBack={() => navigate('profile')} />;
```

## 🎯 Badge Notification System

### Showing Toast Notifications

Integrate with your toast library (e.g., Sonner):

```typescript
import { toast } from 'sonner';
import { badgeService } from './services/badgeService';

const newBadges = await badgeService.checkAndAwardBadges(userId);

newBadges.forEach(badge => {
  toast.success(`Badge Earned: ${badge.icon_emoji} ${badge.title}`, {
    description: `You earned a ${badge.rarity} badge!`,
    duration: 5000
  });
});
```

### Custom Badge Earned Modal

Create a celebratory modal for badge earnings:

```typescript
function BadgeEarnedModal({ badge }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-9xl mb-4"
        >
          {badge.icon_emoji}
        </motion.div>
        <h1 className="text-3xl font-bold">Badge Earned!</h1>
        <p className="text-xl">{badge.title}</p>
      </div>
    </motion.div>
  );
}
```

## 📊 Performance & Caching

### Caching Strategy

The BadgeService implements a 5-minute cache for:

- Badge lists
- User badges
- User metrics

### Cache Control

```typescript
// Force refresh data
const badges = await badgeService.getAllBadgesWithProgress(userId, true);

// Clear user cache
badgeService.clearUserCache(userId);

// Clear all caches
badgeService.clearAllCaches();
```

### Offline Support

```typescript
// Manually increment metric for offline support
await badgeService.incrementMetric(userId, 'posts_count');
```

## 🔧 Customization

### Adding New Badges

1. **Add badge definition to database**:

```sql
INSERT INTO badges (
  title, 
  description, 
  icon_emoji, 
  category, 
  criteria_type, 
  criteria_value, 
  rarity, 
  points, 
  display_order
) VALUES (
  'Custom Badge',
  'Description here',
  '🎨',
  'achievement',
  'posts_count',
  500,
  'epic',
  750,
  100
);
```

2. **Add new criteria type** (if needed):

Add new column to `user_metrics`:

```sql
ALTER TABLE user_metrics ADD COLUMN custom_metric INTEGER DEFAULT 0;
```

Create trigger to update it:

```sql
CREATE OR REPLACE FUNCTION increment_custom_metric()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_metrics 
  SET custom_metric = custom_metric + 1
  WHERE user_id = NEW.user_id;
  
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Styling Customization

Modify rarity colors in `BadgeCard.tsx`:

```typescript
const getRarityColor = (rarity: string, isEarned: boolean) => {
  switch (rarity) {
    case 'custom':
      return {
        border: 'border-pink-400/30',
        bg: 'bg-pink-400/5',
        text: 'text-pink-400',
        glow: 'shadow-pink-400/20'
      };
    // ... other rarities
  }
};
```

## 🐛 Troubleshooting

### Badges Not Awarding

1. Check if trigger fired:

```sql
SELECT * FROM user_metrics WHERE user_id = 'user-uuid';
```

2. Manually trigger badge check:

```sql
SELECT * FROM check_and_award_badges('user-uuid');
```

3. Verify badge criteria:

```sql
SELECT * FROM badges WHERE is_active = true;
```

### Metrics Not Updating

1. Check if triggers are enabled:

```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%badge%';
```

2. Manually update metric:

```sql
UPDATE user_metrics 
SET posts_count = posts_count + 1 
WHERE user_id = 'user-uuid';
```

### RLS Issues

1. Check current policies:

```sql
SELECT * FROM pg_policies WHERE tablename IN ('badges', 'user_badges', 'user_metrics');
```

2. Test as user:

```sql
SET ROLE authenticated;
SELECT * FROM badges;
RESET ROLE;
```

## 📈 Analytics & Monitoring

### Track Badge Engagement

```sql
-- Most earned badges
SELECT b.title, COUNT(*) as times_earned
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
GROUP BY b.id, b.title
ORDER BY times_earned DESC;

-- Average time to earn each badge
SELECT 
  b.title,
  AVG(EXTRACT(EPOCH FROM (ub.earned_at - um.created_at)) / 86400) as avg_days_to_earn
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN user_metrics um ON ub.user_id = um.user_id
GROUP BY b.id, b.title;

-- User badge distribution
SELECT 
  COUNT(*) as badge_count,
  COUNT(DISTINCT user_id) as user_count
FROM user_badges
GROUP BY badge_count
ORDER BY badge_count;
```

## 🔒 Security Considerations

1. **Function Security**: All metric update functions use `SECURITY DEFINER` to bypass RLS
2. **Input Validation**: User IDs are validated through foreign key constraints
3. **Rate Limiting**: Consider adding rate limiting to badge check functions
4. **Audit Trail**: Badge awarding is logged with timestamps

## 📝 Future Enhancements

### Potential Features

- [ ] Badge leaderboards
- [ ] Seasonal/time-limited badges
- [ ] Badge trading/gifting
- [ ] Badge combinations (earn X badges to unlock Y)
- [ ] Animated badge reveals
- [ ] Badge NFTs/blockchain integration
- [ ] Social sharing of earned badges
- [ ] Badge challenges/quests

### Technical Improvements

- [ ] Add badge version history
- [ ] Implement badge revocation
- [ ] Add badge expiration dates
- [ ] Create admin dashboard for badge management
- [ ] Add A/B testing for badge criteria
- [ ] Implement badge recommendation system

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Best Practices](https://react.dev/)

## 🤝 Contributing

When adding new badges or features:

1. Update the SQL migration file
2. Add TypeScript types to `badgeService.ts`
3. Create/update UI components as needed
4. Update this README
5. Add tests for new functionality
6. Submit PR with clear description

## 📄 License

This badges system is part of the UniteX application.

---

**Built with ❤️ for the UniteX Community**

For questions or support, please contact the development team.
