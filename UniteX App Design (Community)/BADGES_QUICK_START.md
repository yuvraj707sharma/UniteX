# UniteX Badges System - Quick Start Guide

## 🚀 5-Minute Setup

This guide will get your badges system up and running in 5 minutes.

### Step 1: Run the SQL Migration (2 minutes)

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `src/lib/badges-schema.sql`
4. Paste and click **Run**
5. Wait for success message: "Success. No rows returned"

✅ **Verify**: Check that these tables were created in your Database section:

- `badges`
- `user_badges`
- `user_metrics`
- `badge_progress`
- `post_likes`

### Step 2: Test Badge Data (30 seconds)

Run this query in SQL Editor to verify sample badges were inserted:

```sql
SELECT title, category, rarity FROM badges ORDER BY display_order;
```

You should see 18 badges across 4 categories.

### Step 3: Update Your App (2 minutes)

The following files have already been created/updated:

**New Files Created:**

- ✅ `src/lib/badges-schema.sql` - Database migration
- ✅ `src/services/badgeService.ts` - TypeScript service
- ✅ `src/components/badges/BadgeCard.tsx` - Badge display component
- ✅ `src/components/badges/BadgesPage.tsx` - Full badges page
- ✅ `src/components/badges/BadgeDetailModal.tsx` - Badge details modal
- ✅ `src/components/badges/ProfileBadgesRow.tsx` - Profile badges display
- ✅ `src/components/badges/index.ts` - Barrel exports

**Updated Files:**

- ✅ `src/App.tsx` - Added badges screen and initialization
- ✅ `src/components/Profile.tsx` - Added ProfileBadgesRow
- ✅ `src/lib/utils.ts` - Added cn utility function

### Step 4: Test the System (1 minute)

1. **Log in** to your app
2. **Navigate to Profile** - You should see the badges section
3. **Click "View All"** - Opens the full badges page
4. **Create a post** - Should earn "First Post" badge
5. **Check Profile again** - Badge should appear!

## 🎯 Verification Checklist

Run through this checklist to ensure everything works:

### Database Check

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('badges', 'user_badges', 'user_metrics', 'badge_progress');

-- Check if sample badges exist
SELECT COUNT(*) FROM badges;
-- Should return: 18

-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%badge%';
-- Should return multiple triggers
```

### Frontend Check

- [ ] Profile page loads without errors
- [ ] Badges section appears on profile
- [ ] "View All" button works
- [ ] Badges page shows 4 categories
- [ ] Badges can be filtered (All/Earned/Locked)
- [ ] Clicking a badge opens detail modal
- [ ] Progress bars show correctly

### Functionality Check

- [ ] Creating a post earns "First Post" badge
- [ ] Badge appears immediately after earning
- [ ] User metrics update correctly
- [ ] Badge count increases on profile

## 🐛 Quick Troubleshooting

### Issue: Tables not created

**Solution**:

```sql
-- Check for errors in function creation
SELECT proname FROM pg_proc WHERE proname LIKE '%badge%';
-- Should show: check_and_award_badges, get_user_badges, etc.
```

### Issue: Badges not showing on profile

**Solution**:

```typescript
// In browser console:
const { data } = await supabase.auth.getUser();
console.log('User ID:', data.user.id);

// Then in SQL:
SELECT * FROM user_metrics WHERE user_id = 'paste-user-id-here';
```

### Issue: Badge not earned after action

**Solution**:

```sql
-- Manually trigger badge check
SELECT * FROM check_and_award_badges('your-user-id');

-- Check current metrics
SELECT * FROM user_metrics WHERE user_id = 'your-user-id';
```

### Issue: Import errors

**Solution**:

```bash
# Make sure all dependencies are installed
npm install
# or
yarn install
```

## 📱 Testing Flow

### Manual Test Script

1. **Fresh User Journey**:
   ```
   ✓ Login/Register
   ✓ Check profile (should have 0 badges)
   ✓ Create first post
   ✓ Check profile (should have "First Post" badge)
   ✓ View badges page (should show 1 earned, rest locked)
   ```

2. **Badge Progress**:
   ```
   ✓ Click locked badge
   ✓ Modal shows progress (e.g., 1/10 posts)
   ✓ Progress bar displays correctly
   ✓ Points and rarity shown
   ```

3. **Multiple Badges**:
   ```
   ✓ Create 10 posts
   ✓ Earn "Contributor I" badge
   ✓ Profile shows 2 badges
   ✓ Points accumulate correctly
   ```

## 🔧 Optional Enhancements

### Add Toast Notifications for Badge Earning

In `src/services/badgeService.ts`, update the `showBadgeNotification` function:

```typescript
import { toast } from 'sonner';

export function showBadgeNotification(badges: BadgeNotification[]): void {
  badges.forEach(badge => {
    toast.success(`🎉 Badge Earned: ${badge.icon_emoji} ${badge.title}`, {
      description: `You earned a ${badge.rarity} badge!`,
      duration: 5000
    });
  });
}
```

### Add Badge Count to Profile Header

In `src/components/Profile.tsx`:

```typescript
// After fetching badges
const badgeCount = await badgeService.getUserBadges(userId);

// Display in header
<div className="flex items-center gap-2">
  <Award className="w-5 h-5" />
  <span>{badgeCount.length} Badges</span>
</div>
```

### Add Leaderboard

Create a new component:

```typescript
// src/components/badges/BadgeLeaderboard.tsx
const { data } = await supabase
  .from('user_badges')
  .select('user_id, count')
  .order('count', { ascending: false })
  .limit(10);
```

## 📊 Monitoring Queries

### Check Badge Distribution

```sql
SELECT 
  category,
  COUNT(*) as total_badges,
  COUNT(CASE WHEN rarity = 'common' THEN 1 END) as common,
  COUNT(CASE WHEN rarity = 'rare' THEN 1 END) as rare,
  COUNT(CASE WHEN rarity = 'epic' THEN 1 END) as epic,
  COUNT(CASE WHEN rarity = 'legendary' THEN 1 END) as legendary
FROM badges
GROUP BY category;
```

### Check User Engagement

```sql
SELECT 
  COUNT(DISTINCT user_id) as total_users_with_badges,
  AVG(badge_count) as avg_badges_per_user,
  MAX(badge_count) as max_badges_earned
FROM (
  SELECT user_id, COUNT(*) as badge_count
  FROM user_badges
  GROUP BY user_id
) stats;
```

### Check Most Popular Badges

```sql
SELECT 
  b.title,
  b.category,
  b.rarity,
  COUNT(ub.id) as times_earned
FROM badges b
LEFT JOIN user_badges ub ON b.id = ub.badge_id
GROUP BY b.id, b.title, b.category, b.rarity
ORDER BY times_earned DESC
LIMIT 10;
```

## 🎨 Customization Examples

### Change Badge Colors

In `src/components/badges/BadgeCard.tsx`:

```typescript
case 'legendary':
  return {
    border: 'border-amber-400/30',  // Change from yellow
    bg: 'bg-amber-400/5',
    text: 'text-amber-400',
    glow: 'shadow-amber-400/20'
  };
```

### Add New Badge Category

1. **Update SQL**:

```sql
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;
ALTER TABLE badges ADD CONSTRAINT badges_category_check 
  CHECK (category IN ('engagement', 'community', 'behavior', 'achievement', 'special'));
```

2. **Add Badge**:

```sql
INSERT INTO badges (title, description, icon_emoji, category, criteria_type, criteria_value, rarity, points, display_order)
VALUES ('VIP Member', 'Exclusive VIP badge', '👑', 'special', 'posts_count', 0, 'legendary', 5000, 1000);
```

3. **Update UI** in `BadgesPage.tsx`:

```typescript
(['engagement', 'community', 'behavior', 'achievement', 'special'] as const)
```

## ✅ Success Indicators

You know the system is working when:

1. ✅ **Automatic Awarding**: Badges appear without manual intervention
2. ✅ **Real-time Updates**: Profile shows new badges immediately
3. ✅ **Progress Tracking**: Locked badges show accurate progress
4. ✅ **Performance**: Pages load quickly with caching
5. ✅ **User Engagement**: Users check their badges regularly

## 📞 Need Help?

If you encounter issues:

1. Check the full documentation: `BADGES_SYSTEM_README.md`
2. Review error logs in browser console
3. Check Supabase logs in Dashboard → Database → Logs
4. Run diagnostic queries provided above

## 🎉 You're Done!

Your badges system is now live! Users will automatically earn badges as they engage with the
platform.

**Next Steps**:

- Monitor user engagement with badges
- Add more badges based on usage patterns
- Customize styling to match your brand
- Consider adding badge achievements page
- Implement social sharing of badges

---

**Happy Badging! 🏆**
