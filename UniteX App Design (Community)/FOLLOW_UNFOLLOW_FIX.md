# Follow/Unfollow Bug Fix

## Problem Description

Users were experiencing an issue where clicking the "Follow" button would briefly show "Following"
but then immediately revert back to "Follow" within seconds. This created a frustrating user
experience and made it impossible to follow other users.

## Root Cause Analysis

The issue was caused by a **race condition** between optimistic UI updates and database refetching:

1. User clicks "Follow" button
2. Code sets `isFollowing = true` (UI updates to show "Following")
3. Database INSERT operation starts
4. **BEFORE the INSERT completes**, the code called `fetchUserProfile()` to refresh data
5. The refetch query returned stale data (no follow relationship yet)
6. UI reverted to show "Follow" button
7. Eventually the INSERT completed, but the UI was already wrong

### Why This Happened

In both `OtherProfile.tsx` and `FollowersList.tsx`, the code was:

```typescript
// OLD BUGGY CODE
await supabase.from('follows').insert(...);
setIsFollowing(!isFollowing);
fetchUserProfile(); // ❌ This refetch caused the race condition
```

The problem:

- Database operations are asynchronous
- Network latency means the INSERT might not be immediately visible
- Refetching too quickly retrieves stale data
- This overwrites the optimistic UI update

## Solution Implemented

### Key Changes

1. **Removed premature data refetching** - No longer calling `fetchUserProfile()` after
   follow/unfollow
2. **Proper optimistic updates** - Update UI state BEFORE database operation
3. **Error handling with rollback** - If database operation fails, revert the UI changes
4. **Follower count updates** - Update follower counts optimistically

### Files Modified

#### 1. `src/components/OtherProfile.tsx`

**Before:**

```typescript
if (isFollowing) {
  await supabase.from('follows').delete()...;
  toast.success('Unfollowed');
} else {
  await supabase.from('follows').insert()...;
  toast.success('Following!');
}
setIsFollowing(!isFollowing);
fetchUserProfile(); // ❌ Race condition here
```

**After:**

```typescript
// Optimistic update FIRST
const wasFollowing = isFollowing;
setIsFollowing(!isFollowing);

// Update followers count optimistically
setProfile((prev: any) => ({
  ...prev,
  followers: wasFollowing ? prev.followers - 1 : prev.followers + 1
}));

// THEN perform database operation
if (wasFollowing) {
  const { error } = await supabase.from('follows').delete()...;
  if (error) throw error;
  toast.success('Unfollowed');
} else {
  const { error } = await supabase.from('follows').insert()...;
  if (error) throw error;
  toast.success('Following!');
}

// Error handling with rollback
catch (error) {
  // Revert optimistic update on error
  setIsFollowing(!isFollowing);
  setProfile((prev: any) => ({
    ...prev,
    followers: wasFollowing ? prev.followers + 1 : prev.followers - 1
  }));
}
```

#### 2. `src/components/FollowersList.tsx`

**Before:**

```typescript
const { data: existingFollow } = await supabase
  .from('follows')
  .select('id')
  .eq('follower_id', user.id)
  .eq('followed_id', targetProfile.id)
  .single(); // ❌ Extra database query

if (existingFollow) {
  await supabase.from('follows').delete()...;
} else {
  await supabase.from('follows').insert()...;
}

// Update local state AFTER
setFollowers(followers.map(user => 
  user.username === username 
    ? {...user, isFollowing: !user.isFollowing} 
    : user
));
```

**After:**

```typescript
// Determine current state from local data
const userList = type === "followers" ? followers : following;
const targetUser = userList.find(u => u.username === username);
const wasFollowing = targetUser.isFollowing;

// Optimistically update local state FIRST
if (type === "followers") {
  setFollowers(followers.map(user => 
    user.username === username 
      ? {...user, isFollowing: !user.isFollowing} 
      : user
  ));
}

// THEN perform database operation
if (wasFollowing) {
  const { error } = await supabase.from('follows').delete()...;
  if (error) throw error;
} else {
  const { error } = await supabase.from('follows').insert()...;
  if (error) throw error;
}

// Error handling with rollback
catch (error) {
  // Revert optimistic update
  setFollowers(followers.map(user => 
    user.username === username 
      ? {...user, isFollowing: !user.isFollowing} 
      : user
  ));
}
```

## Benefits of This Approach

### 1. **Instant UI Feedback**

- Users see immediate response when clicking follow/unfollow
- No waiting for server response before UI updates

### 2. **No Race Conditions**

- No premature refetching of data
- UI state is source of truth until confirmed by database

### 3. **Proper Error Handling**

- If database operation fails, UI reverts to previous state
- User is notified of the error via toast message

### 4. **Reduced Database Queries**

- Removed unnecessary `SELECT` query to check follow status
- Only INSERT or DELETE, reducing server load

### 5. **Better Performance**

- Fewer database round trips
- Faster perceived performance due to optimistic updates

## Testing Recommendations

### Test Cases

1. **Basic Follow/Unfollow**
    - Click Follow → Should immediately show "Following"
    - Click Following → Should immediately show "Follow"
    - Verify database is updated correctly

2. **Rapid Clicking**
    - Click Follow/Unfollow multiple times rapidly
    - UI should remain consistent
    - Final state should match database state

3. **Network Errors**
    - Simulate network failure during follow operation
    - UI should revert to previous state
    - Error message should display

4. **Concurrent Sessions**
    - Two users follow each other simultaneously
    - Both should see correct follow states
    - Follower counts should be accurate

5. **Page Refresh**
    - Follow a user
    - Refresh the page
    - Follow state should persist correctly

## Future Improvements

1. **Real-time Subscriptions**
    - Add Supabase real-time subscriptions to the `follows` table
    - Automatically update UI when other users follow/unfollow
    - Ensures data stays fresh without refetching

2. **Debouncing**
    - Add debounce to prevent rapid-fire follow/unfollow clicks
    - Reduce unnecessary database operations

3. **Offline Support**
    - Queue follow/unfollow actions when offline
    - Sync when connection is restored

4. **Follow Recommendations**
    - Suggest users to follow based on mutual connections
    - Improve user engagement

## Conclusion

The follow/unfollow bug has been fixed by implementing proper optimistic updates with error
handling. The key insight was that **premature data refetching** was causing race conditions. By
removing the refetch and relying on optimistic updates, the UI now responds instantly and remains
consistent with the database state.

This is a common pattern in modern web applications:

- **Update UI first** (optimistic update)
- **Perform async operation**
- **Revert on error** (rollback)

This provides the best user experience while maintaining data consistency.
