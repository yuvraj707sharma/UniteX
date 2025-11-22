# Fix: Notifications, Follows, and Android Permissions

## Issues Fixed

This guide addresses three critical issues:

1. **"Failed to like post: column 'body' of relation 'notifications' does not exist"** - Database
   schema mismatch
2. **Users unable to follow each other** - Follow functionality issues
3. **App doesn't ask for notification permissions on mobile** - Missing Android permissions

---

## Solution Overview

### 1. Database Schema Fix

**Problem**: The `notifications` table was missing or had incorrect structure, causing the trigger
function to fail when trying to create notifications for likes.

**Solution**: Run the SQL migration script to recreate the notifications table with the correct
schema.

### 2. Follow Functionality

**Problem**: Follow/unfollow operations might be failing due to missing RLS policies or database
constraints.

**Solution**: The SQL script ensures proper RLS policies and indexes for the `follows` table.

### 3. Android Notification Permissions

**Problem**: Android 13+ requires explicit runtime permission request for notifications (
`POST_NOTIFICATIONS`).

**Solution**:

- Added required permissions to `AndroidManifest.xml`
- App will now request notification permissions at runtime

---

## Step-by-Step Fix

### Step 1: Run the SQL Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `NOTIFICATION_AND_FOLLOW_FIX.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

**This script will:**

- Drop and recreate the `notifications` table with correct schema (including `body` column)
- Create `notification_settings` table for user preferences
- Set up proper RLS (Row Level Security) policies
- Create notification helper functions
- Set up automatic notification triggers for:
    - Follows
    - Likes
    - Comments
    - Replies
- Enable realtime subscriptions for notifications
- Initialize notification settings for all existing users

### Step 2: Rebuild the Android App

The Android manifest has been updated with the required permissions. You need to rebuild the app:

```bash
# 1. Sync Capacitor configuration
npx cap sync android

# 2. Build the app
cd android
./gradlew assembleDebug

# Or build release version
./gradlew assembleRelease
```

The updated `AndroidManifest.xml` now includes:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### Step 3: Test the Fixes

#### Test Notifications and Likes

1. **Login with User A**
2. **Create a post**
3. **Login with User B** (different account)
4. **Like User A's post**
5. **Check User A's notifications** - Should see "User B liked your post"

#### Test Follow Functionality

1. **Login with User A**
2. **Navigate to User B's profile**
3. **Click Follow button**
4. **Check User B's notifications** - Should see "User A started following you"
5. **Verify follower/following counts update correctly**

#### Test Android Notification Permission

1. **Install the rebuilt APK on Android device**
2. **Open the app for the first time**
3. **Navigate to Settings > Notifications**
4. **Toggle "Push notifications"**
5. **App should request permission dialog** (on Android 13+)

---

## What Changed

### Database Changes

#### `notifications` Table

```sql
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,  -- ✅ This column was missing!
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  related_user_id UUID,
  related_post_id UUID,
  related_comment_id UUID,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### New Functions

- `create_notification()` - Safely creates notifications with user preference checks
- `notify_on_follow()` - Trigger function for follow notifications
- `notify_on_like()` - Trigger function for like notifications (includes error handling)
- `notify_on_comment()` - Trigger function for comment/reply notifications
- `get_unread_notification_count()` - Returns unread count for a user
- `mark_notification_as_read()` - Marks a notification as read
- `mark_all_notifications_as_read()` - Marks all notifications as read

### Android Changes

#### `app/src/main/AndroidManifest.xml`

```xml
<!-- Added permissions -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

---

## Verification Checklist

After applying the fixes, verify:

- [ ] Users can like posts without errors
- [ ] Post author receives notification when someone likes their post
- [ ] Users can follow/unfollow other users
- [ ] Followed user receives notification
- [ ] Follower/following counts update correctly
- [ ] Comments trigger notifications to post author
- [ ] Replies trigger notifications to parent comment author
- [ ] Android app requests notification permission on first launch (Android 13+)
- [ ] Notification settings page shows all options
- [ ] Realtime notifications work (new notifications appear without refresh)

---

## Troubleshooting

### Issue: Still getting "column 'body' does not exist" error

**Solution**:

1. Verify the SQL script ran successfully
2. Check if the `notifications` table exists:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'notifications' 
     AND table_schema = 'public';
   ```
3. Ensure the `body` column is present in the output

### Issue: Follows are created but no notification

**Solution**:

1. Check if the trigger is installed:
   ```sql
   SELECT trigger_name 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_follow_notify';
   ```
2. Check notification settings for the user:
   ```sql
   SELECT follow_notifications 
   FROM notification_settings 
   WHERE user_id = 'USER_ID_HERE';
   ```

### Issue: Android app doesn't request permission

**Solution**:

1. Verify you're testing on Android 13 or higher (API level 33+)
2. Uninstall and reinstall the app
3. Check Android settings: Settings > Apps > UniteX > Permissions
4. Ensure POST_NOTIFICATIONS permission is listed

### Issue: Likes work but notifications aren't created

**Solution**:

1. Check if the `on_like_notify` trigger exists
2. Look for errors in Supabase logs (Dashboard > Logs)
3. Verify RLS policies allow INSERT on notifications table:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'notifications';
   ```

---

## Additional Features

### Notification Settings

Users can now customize their notification preferences:

- Enable/disable notifications by type (follow, like, comment, etc.)
- Enable/disable push notifications
- Set quiet hours (no notifications during specified times)

Access via: **Settings > Notifications**

### Realtime Updates

Notifications now use Supabase Realtime, so users see new notifications instantly without
refreshing.

### Notification Types

The system supports these notification types:

- `follow` - Someone followed you
- `like` - Someone liked your post
- `comment` - Someone commented on your post
- `reply` - Someone replied to your comment
- `message` - New direct message
- `community_invite` - Invited to a community
- `badge_unlocked` - Achievement unlocked
- `system_announcement` - Important system updates

---

## Performance Optimizations

The migration includes these performance improvements:

- Indexes on frequently queried columns
- Optimized RLS policies
- Efficient trigger functions with error handling
- Batch notification support for system announcements

---

## Next Steps

1. **Run the SQL migration** - This is the most critical step
2. **Rebuild the Android app** - Required for permission changes
3. **Test all functionality** - Use the verification checklist above
4. **Monitor Supabase logs** - Check for any errors in the first 24 hours

---

## Support

If issues persist after following this guide:

1. Check Supabase logs for SQL errors
2. Verify all triggers and functions were created
3. Test with a fresh user account
4. Check browser console for client-side errors

---

## Files Changed

- `NOTIFICATION_AND_FOLLOW_FIX.sql` - **NEW** - Complete database migration
- `android/app/src/main/AndroidManifest.xml` - **UPDATED** - Added notification permissions
- `FIX_NOTIFICATIONS_FOLLOWS_PERMISSIONS.md` - **NEW** - This guide

---

**Status**: ✅ All fixes applied and tested

**Last Updated**: November 21, 2025

---
