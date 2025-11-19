# UniteX Badges System - Deployment Checklist

## 📋 Pre-Deployment Checklist

Use this checklist to ensure the badges system is properly deployed and tested.

---

## 🗄️ Database Setup

### Step 1: Run SQL Migration

- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `src/lib/badges-schema.sql`
- [ ] Execute the migration
- [ ] Verify success message received

### Step 2: Verify Tables Created

Run this query:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('badges', 'user_badges', 'user_metrics', 'badge_progress', 'post_likes');
```

- [ ] All 5 tables exist

### Step 3: Verify Sample Data

Run this query:

```sql
SELECT COUNT(*) FROM badges;
```

- [ ] Count returns 18

### Step 4: Verify Functions Created

Run this query:

```sql
SELECT proname FROM pg_proc WHERE proname IN (
  'check_and_award_badges',
  'get_user_badges',
  'get_all_badges_with_status',
  'get_user_metrics_summary',
  'update_daily_active_streak'
);
```

- [ ] All 5 functions exist

### Step 5: Verify Triggers Created

Run this query:

```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%badge%' OR trigger_name LIKE '%metric%';
```

- [ ] At least 5 triggers exist

### Step 6: Verify RLS Policies

Run this query:

```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('badges', 'user_badges', 'user_metrics', 'badge_progress');
```

- [ ] Policies exist for all 4 tables

### Step 7: Test Database Functions

Run this query (replace with real user ID):

```sql
SELECT * FROM get_user_metrics_summary('user-id-here');
```

- [ ] Query executes without errors

---

## 💻 Code Integration

### Step 8: Verify Files Exist

- [ ] `src/lib/badges-schema.sql` exists
- [ ] `src/services/badgeService.ts` exists
- [ ] `src/components/badges/BadgeCard.tsx` exists
- [ ] `src/components/badges/BadgesPage.tsx` exists
- [ ] `src/components/badges/BadgeDetailModal.tsx` exists
- [ ] `src/components/badges/ProfileBadgesRow.tsx` exists
- [ ] `src/components/badges/index.ts` exists
- [ ] `src/lib/utils.ts` exists

### Step 9: Verify File Modifications

- [ ] `src/App.tsx` imports BadgesPage
- [ ] `src/App.tsx` imports initializeBadgesSystem
- [ ] `src/App.tsx` includes "badges" screen type
- [ ] `src/App.tsx` calls initializeBadgesSystem on login
- [ ] `src/components/Profile.tsx` imports ProfileBadgesRow
- [ ] `src/components/Profile.tsx` includes ProfileBadgesRow component

### Step 10: Build Check

Run this command:

```bash
npm run build
# or
yarn build
```

- [ ] Build succeeds without errors
- [ ] No TypeScript errors
- [ ] No linter warnings related to badges

---

## 🧪 Testing

### Step 11: Login Test

- [ ] User can log in successfully
- [ ] No console errors on login
- [ ] Badge system initializes (check console logs)

### Step 12: Profile Test

- [ ] Navigate to Profile page
- [ ] Profile loads without errors
- [ ] Badges section appears (may be empty for new users)
- [ ] No layout issues

### Step 13: Badges Page Test

- [ ] Click "View All" on badges section
- [ ] Badges page loads
- [ ] 4 category tabs visible
- [ ] Filter buttons work (All/Earned/Locked)
- [ ] Stats card displays correctly
- [ ] No console errors

### Step 14: Badge Earning Test

- [ ] Create a new post
- [ ] Check if "First Post" badge is earned
- [ ] Badge appears in profile badges section
- [ ] Badge count updates
- [ ] Badge shows as "earned" on badges page

### Step 15: Badge Detail Test

- [ ] Click on any badge
- [ ] Detail modal opens
- [ ] Badge information displays correctly
- [ ] Progress bar shows (for locked badges)
- [ ] Close modal works

### Step 16: Navigation Test

- [ ] Navigate from Home → Profile
- [ ] Navigate from Profile → Badges
- [ ] Navigate from Badges → Profile
- [ ] Back button works correctly
- [ ] Bottom nav hides on badges page

---

## 🔄 Database Testing

### Step 17: Metrics Update Test

Create a post and verify metrics:

```sql
-- After creating a post
SELECT posts_count FROM user_metrics WHERE user_id = 'your-user-id';
-- Should increment by 1
```

- [ ] posts_count increments correctly

### Step 18: Badge Award Test

Manually trigger badge check:

```sql
SELECT * FROM check_and_award_badges('your-user-id');
-- Should return newly awarded badges
```

- [ ] Function returns expected badges

### Step 19: User Badges Query Test

```sql
SELECT * FROM get_user_badges('your-user-id');
```

- [ ] Returns earned badges with full details

### Step 20: Badge Progress Test

```sql
SELECT * FROM get_all_badges_with_status('your-user-id');
```

- [ ] Returns all badges with progress percentages
- [ ] is_earned flag is correct

---

## 🎨 UI/UX Testing

### Step 21: Responsive Design Test

Test on different screen sizes:

- [ ] Mobile view (< 640px) looks good
- [ ] Tablet view (640px - 1024px) looks good
- [ ] Desktop view (> 1024px) looks good
- [ ] Badge cards are readable
- [ ] Modal is centered and scrollable

### Step 22: Theme Test

- [ ] Badges look good in dark mode
- [ ] Badges look good in light mode
- [ ] Rarity colors are visible in both themes
- [ ] Text is readable in all states

### Step 23: Animation Test

- [ ] Badge cards animate on load
- [ ] Modal has smooth open/close animation
- [ ] Hover effects work on badge cards
- [ ] Progress bars animate smoothly

### Step 24: Interaction Test

- [ ] Badges are clickable
- [ ] Filter buttons respond to clicks
- [ ] Category tabs switch correctly
- [ ] Scroll behavior is smooth
- [ ] No flickering or jumping

---

## 🚀 Performance Testing

### Step 25: Load Time Test

- [ ] Profile page loads in < 2 seconds
- [ ] Badges page loads in < 2 seconds
- [ ] Badge data caches properly
- [ ] No unnecessary API calls

### Step 26: Cache Test

- [ ] Navigate to badges page
- [ ] Go back to profile
- [ ] Return to badges page
- [ ] Data loads from cache (check Network tab)

### Step 27: Database Performance Test

```sql
EXPLAIN ANALYZE SELECT * FROM get_all_badges_with_status('user-id');
```

- [ ] Query executes in < 100ms
- [ ] Uses indexes appropriately

---

## 🔒 Security Testing

### Step 28: RLS Test

Try to access another user's data:

```sql
-- As authenticated user, try to read another user's metrics
SELECT * FROM user_metrics WHERE user_id = 'other-user-id';
```

- [ ] Returns no results or only own data

### Step 29: Direct Manipulation Test

Try to insert badge directly:

```sql
-- Should fail due to RLS
INSERT INTO user_badges (user_id, badge_id) VALUES ('user-id', 'badge-id');
```

- [ ] Insert is blocked by RLS

### Step 30: Function Security Test

```sql
-- Verify functions use SECURITY DEFINER
SELECT proname, prosecdef FROM pg_proc WHERE proname LIKE '%badge%';
```

- [ ] Key functions have prosecdef = true

---

## 📊 Analytics Setup

### Step 31: Tracking Setup

Add analytics events:

- [ ] Track badge page views
- [ ] Track badge earnings
- [ ] Track badge detail opens
- [ ] Track filter usage

### Step 32: Monitoring Setup

Set up monitoring for:

- [ ] Badge earning rate
- [ ] Failed badge checks
- [ ] Database query performance
- [ ] Cache hit rate

---

## 📱 Mobile App Testing (if applicable)

### Step 33: Capacitor Build Test

```bash
npm run build:mobile
```

- [ ] Build succeeds
- [ ] App installs on device
- [ ] Badges work on mobile

### Step 34: Offline Test

- [ ] Badges load from cache offline
- [ ] Graceful degradation when offline
- [ ] Sync works when back online

---

## 📝 Documentation Check

### Step 35: Verify Documentation

- [ ] `BADGES_SYSTEM_README.md` is complete
- [ ] `BADGES_QUICK_START.md` is accurate
- [ ] `BADGES_IMPLEMENTATION_SUMMARY.md` is up to date
- [ ] Inline code comments are clear

### Step 36: API Documentation

- [ ] All service methods are documented
- [ ] TypeScript types are exported
- [ ] Usage examples are provided

---

## 🎯 User Acceptance Testing

### Step 37: User Flow Test

Complete user journey:

- [ ] New user signs up
- [ ] User sees 0 badges initially
- [ ] User creates first post
- [ ] "First Post" badge is earned
- [ ] Badge appears on profile
- [ ] User can view badge details
- [ ] User understands how to earn more badges

### Step 38: Edge Cases Test

- [ ] User with no activity (0 badges)
- [ ] User with many badges (10+ badges)
- [ ] Multiple badges earned at once
- [ ] Badge progress at 99%
- [ ] Badge just earned (100% progress)

---

## 🔧 Configuration

### Step 39: Environment Variables

Verify all required configs:

- [ ] Supabase URL is correct
- [ ] Supabase Anon Key is correct
- [ ] No hardcoded secrets in code

### Step 40: Feature Flags (if applicable)

- [ ] Badge feature can be toggled
- [ ] Graceful fallback if disabled

---

## 📢 Pre-Launch

### Step 41: Final Review

- [ ] All checklist items completed
- [ ] No known bugs
- [ ] Performance is acceptable
- [ ] Security is verified
- [ ] Documentation is complete

### Step 42: Stakeholder Demo

- [ ] Demo to product team
- [ ] Demo to design team
- [ ] Gather feedback
- [ ] Address critical issues

### Step 43: Rollback Plan

- [ ] Document rollback procedure
- [ ] SQL script to drop tables (if needed)
- [ ] Code revert process documented

---

## 🚀 Launch

### Step 44: Deploy to Production

- [ ] Database migration applied
- [ ] Code deployed
- [ ] Cache warmed up
- [ ] Monitoring active

### Step 45: Post-Launch Monitoring

Monitor for 24 hours:

- [ ] Error rate is normal
- [ ] Performance is good
- [ ] User engagement is positive
- [ ] No critical issues

### Step 46: User Communication

- [ ] Announce badge feature
- [ ] Explain how to earn badges
- [ ] Highlight benefits
- [ ] Provide support channel

---

## ✅ Completion

Date completed: _________________

Completed by: _________________

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## 🎉 Success Criteria

The deployment is successful when:

1. ✅ All 46 checklist items are completed
2. ✅ Users can earn badges automatically
3. ✅ No critical bugs in first 24 hours
4. ✅ Performance meets expectations
5. ✅ User feedback is positive

---

## 📞 Support Contacts

**Technical Issues:**

- Check `BADGES_SYSTEM_README.md`
- Review console logs
- Check Supabase logs

**Database Issues:**

- Verify triggers are active
- Check RLS policies
- Review function logs

**UI Issues:**

- Check browser console
- Verify cache is working
- Test in incognito mode

---

**Deployment Checklist Version:** 1.0
**Last Updated:** December 2024
**Next Review:** After first 100 badge earnings
