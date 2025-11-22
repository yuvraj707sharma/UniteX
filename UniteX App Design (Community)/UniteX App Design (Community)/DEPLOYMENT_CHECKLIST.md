# ✅ Deployment Checklist - Notification & Follow Fix

## 🎯 Objective

Fix likes, follows, and notification permissions in UniteX app

---

## 📋 Pre-Deployment

### Prerequisites Check

- [ ] Have Supabase dashboard access
- [ ] Have project source code access
- [ ] Can build Android APK
- [ ] Have test devices (Android 13+ preferred)
- [ ] Backup current database (optional but recommended)

### Backup (Optional)

```sql
-- Run in Supabase SQL Editor
-- Backup notifications table (if it exists)
CREATE TABLE notifications_backup AS SELECT * FROM notifications;

-- Backup follows table
CREATE TABLE follows_backup AS SELECT * FROM follows;
```

---

## 🔧 Deployment Steps

### Step 1: Database Migration ⏱️ 2 minutes

#### 1.1 Access Supabase

- [ ] Open https://supabase.com/dashboard
- [ ] Select your project
- [ ] Click "SQL Editor" in sidebar
- [ ] Click "New query"

#### 1.2 Run Migration

- [ ] Open file: `NOTIFICATION_AND_FOLLOW_FIX.sql`
- [ ] Copy ALL contents (Ctrl+A, Ctrl+C)
- [ ] Paste into SQL Editor (Ctrl+V)
- [ ] Click "Run" button (bottom right)
- [ ] Wait for completion (~10-30 seconds)

#### 1.3 Verify Success

- [ ] See "Setup complete!" message
- [ ] See list of tables created
- [ ] No error messages in output
- [ ] Check result shows all tables

**If errors occur**, see [Troubleshooting](#troubleshooting) section.

#### 1.4 Verification Queries

Run these to confirm:

```sql
-- 1. Check 'body' column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND column_name = 'body';
-- Expected: 1 row with 'body | text'
```

- [ ] Query returned 1 row with `body` column

```sql
-- 2. Check triggers installed
SELECT trigger_name 
FROM information_schema.triggers
WHERE trigger_name IN ('on_follow_notify', 'on_like_notify', 'on_comment_notify');
-- Expected: 3 rows
```

- [ ] Query returned 3 triggers

```sql
-- 3. Test notification creation
SELECT create_notification(
  (SELECT id FROM profiles LIMIT 1),
  'system_announcement',
  'Test',
  'This is a test',
  '{}'::jsonb
);
-- Expected: Returns a UUID
```

- [ ] Query returned a UUID (notification ID)

---

### Step 2: Rebuild Android App ⏱️ 5 minutes

#### 2.1 Sync Capacitor

```bash
# In project root
npx cap sync android
```

- [ ] Command completed successfully
- [ ] No error messages
- [ ] See "✔ Copying web assets from dist to android/app/src/main/assets/public"

#### 2.2 Clean Build

```bash
# Navigate to android folder
cd android

# Clean previous builds
./gradlew clean
```

- [ ] Clean completed successfully

#### 2.3 Build Debug APK

```bash
# In android folder
./gradlew assembleDebug
```

- [ ] Build completed successfully
- [ ] See "BUILD SUCCESSFUL"
- [ ] APK created at: `app/build/outputs/apk/debug/app-debug.apk`

**OR** Build Release APK:

```bash
./gradlew assembleRelease
```

- [ ] Build completed successfully
- [ ] APK created at: `app/build/outputs/apk/release/app-release-unsigned.apk`

#### 2.4 Verify APK Permissions

```bash
# Check permissions in APK
cd app/build/outputs/apk/debug
aapt dump permissions app-debug.apk | grep POST_NOTIFICATIONS
```

- [ ] See `uses-permission: name='android.permission.POST_NOTIFICATIONS'`

---

### Step 3: Testing ⏱️ 10 minutes

#### 3.1 Install APK

- [ ] Transfer APK to Android device
- [ ] Enable "Install from unknown sources" if needed
- [ ] Uninstall old version (important!)
- [ ] Install new APK
- [ ] Open app

#### 3.2 Test Like Functionality

**Test Case**: User can like a post

1. [ ] Login as User A
2. [ ] Create a test post
3. [ ] Logout and login as User B
4. [ ] Find and like User A's post
5. [ ] Verify: Like count increases
6. [ ] Verify: No error message appears
7. [ ] Logout and login back as User A
8. [ ] Verify: User A has notification "User B liked your post"

**Result**:

- [ ] ✅ Pass - All steps worked
- [ ] ❌ Fail - Issue: _______________

#### 3.3 Test Follow Functionality

**Test Case**: User can follow another user

1. [ ] Login as User A
2. [ ] Go to User B's profile
3. [ ] Click "Follow" button
4. [ ] Verify: Button changes to "Following"
5. [ ] Verify: User B's follower count increases
6. [ ] Verify: User A's following count increases
7. [ ] Logout and login as User B
8. [ ] Verify: User B has notification "User A started following you"

**Result**:

- [ ] ✅ Pass - All steps worked
- [ ] ❌ Fail - Issue: _______________

#### 3.4 Test Unfollow Functionality

**Test Case**: User can unfollow

1. [ ] As User A, go to User B's profile
2. [ ] Click "Following" button
3. [ ] Verify: Button changes to "Follow"
4. [ ] Verify: Counts decrease

**Result**:

- [ ] ✅ Pass - All steps worked
- [ ] ❌ Fail - Issue: _______________

#### 3.5 Test Comment Notifications

**Test Case**: Comments trigger notifications

1. [ ] Login as User A
2. [ ] Create a post
3. [ ] Logout and login as User B
4. [ ] Comment on User A's post
5. [ ] Login back as User A
6. [ ] Verify: Notification appears

**Result**:

- [ ] ✅ Pass - All steps worked
- [ ] ❌ Fail - Issue: _______________

#### 3.6 Test Android Permissions (Android 13+ only)

**Test Case**: App requests notification permission

1. [ ] Fresh install on Android 13+ device
2. [ ] Open app and login
3. [ ] Go to Settings
4. [ ] Go to Notifications
5. [ ] Toggle "Push notifications" ON
6. [ ] Verify: System permission dialog appears
7. [ ] Grant permission
8. [ ] Verify: Toggle remains ON

**Result**:

- [ ] ✅ Pass - Permission dialog appeared
- [ ] ⚠️ N/A - Android version < 13
- [ ] ❌ Fail - Issue: _______________

#### 3.7 Test Real-time Notifications

**Test Case**: Notifications appear in real-time

1. [ ] Login as User A on Device 1
2. [ ] Stay on notifications page
3. [ ] On Device 2, login as User B
4. [ ] Like/follow/comment as User B
5. [ ] Check Device 1 (User A)
6. [ ] Verify: Notification appears without refresh

**Result**:

- [ ] ✅ Pass - Real-time update worked
- [ ] ❌ Fail - Issue: _______________

---

## 🔍 Post-Deployment Verification

### Check Database Health

```sql
-- Check notification count (should be > 0 after testing)
SELECT COUNT(*) FROM notifications;
```

- [ ] Query returns count > 0

```sql
-- Check recent notifications
SELECT type, title, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;
```

- [ ] Query returns recent test notifications

```sql
-- Check for errors in triggers
SELECT * FROM pg_stat_user_functions 
WHERE funcname LIKE '%notify%';
```

- [ ] No errors reported

### Check App Logs

- [ ] No "column 'body' does not exist" errors
- [ ] No "failed to like post" errors
- [ ] No "unable to follow" errors

### Check Android Logs

```bash
# If device is connected via ADB
adb logcat | grep -i notification
```

- [ ] Logs show permission requests (if Android 13+)
- [ ] Logs show notification creation
- [ ] No error messages

---

## 📊 Success Criteria

### Must Pass (Critical)

- [ ] Users can like posts without errors
- [ ] Users can follow/unfollow others
- [ ] Notifications are created in database
- [ ] Like count updates correctly
- [ ] Follower count updates correctly

### Should Pass (Important)

- [ ] Notifications appear in real-time
- [ ] Android 13+ shows permission dialog
- [ ] Notification settings page works
- [ ] No database errors in logs

### Nice to Have (Optional)

- [ ] Push notifications work on device lock screen
- [ ] Notification sounds/vibration work
- [ ] Notification icons display correctly

---

## 🐛 Troubleshooting

### Issue: SQL Script Fails

**Symptom**: Errors when running migration script

**Solutions**:

1. Check if notifications table exists:
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename = 'notifications';
   ```
   If exists, drop it first:
   ```sql
   DROP TABLE IF EXISTS public.notifications CASCADE;
   ```
   Then run main script again.

2. Check permissions:
   ```sql
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
   ```

3. Use alternative script: `quick-fix-supabase.sql`

### Issue: APK Build Fails

**Symptom**: Gradle build errors

**Solutions**:

1. Clean build:
   ```bash
   cd android
   ./gradlew clean
   rm -rf .gradle
   ./gradlew assembleDebug
   ```

2. Check Android SDK:
   ```bash
   echo $ANDROID_HOME
   # Should point to Android SDK location
   ```

3. Update Gradle wrapper:
   ```bash
   ./gradlew wrapper --gradle-version 8.0
   ```

### Issue: Likes Still Fail

**Symptom**: "column 'body' does not exist" error persists

**Solutions**:

1. Verify column exists:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'notifications';
   ```

2. Check if trigger is using new table:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_like_notify';
   ```

3. Restart trigger:
   ```sql
   DROP TRIGGER IF EXISTS on_like_notify ON post_likes;
   -- Then re-run trigger creation from main script
   ```

### Issue: Permission Dialog Doesn't Appear

**Symptom**: No permission request on Android

**Checks**:

1. Verify Android version: Must be 13+ (API 33+)
2. Check manifest has permission:
   ```bash
   grep POST_NOTIFICATIONS android/app/src/main/AndroidManifest.xml
   ```
3. Uninstall app completely and reinstall
4. Check Android settings: Settings > Apps > UniteX > Permissions

---

## 📝 Rollback Plan (If Needed)

### If SQL Migration Causes Issues

```sql
-- Restore from backup
DROP TABLE IF EXISTS notifications CASCADE;
ALTER TABLE notifications_backup RENAME TO notifications;

DROP TABLE IF EXISTS follows CASCADE;
ALTER TABLE follows_backup RENAME TO follows;
```

### If APK Has Issues

- [ ] Reinstall previous APK version
- [ ] Restore from app backup if available

---

## 📞 Support Contacts

### If Issues Persist

1. Check Supabase dashboard logs
2. Check Android device logs (adb logcat)
3. Review COMPLETE_FIX_GUIDE.md
4. Check ISSUES_AND_SOLUTIONS.md

---

## ✅ Final Sign-Off

### Pre-Deployment

- [ ] All prerequisites met
- [ ] Backup completed (if desired)
- [ ] SQL script ready
- [ ] Build environment ready

### Deployment

- [ ] SQL migration completed successfully
- [ ] All verification queries passed
- [ ] Android APK built successfully
- [ ] APK has required permissions

### Testing

- [ ] Like functionality tested - PASS
- [ ] Follow functionality tested - PASS
- [ ] Comment notifications tested - PASS
- [ ] Android permissions tested - PASS
- [ ] Real-time updates tested - PASS

### Post-Deployment

- [ ] Database health check - OK
- [ ] App logs - No errors
- [ ] User acceptance testing - PASS
- [ ] Documentation updated

---

## 🎉 Deployment Complete!

**Deployed by**: _____________  
**Date**: _____________  
**Time**: _____________  
**Version**: v1.1.0 (Post-Notification-Fix)  
**Status**: ✅ SUCCESS

### Deployment Summary

- Database migration: ✅ Complete
- Android rebuild: ✅ Complete
- Testing: ✅ All tests passed
- Issues: ☐ None / ☐ Minor (documented below)
- Rollback needed: ☐ No

### Notes:

_____________________________________________
_____________________________________________
_____________________________________________

---

**Signature**: _____________  
**Date**: _____________

---

## 📎 Attachments

Attached files for this deployment:

1. NOTIFICATION_AND_FOLLOW_FIX.sql (SQL migration)
2. app-debug.apk or app-release.apk (New build)
3. This checklist (completed)
4. Test results screenshots (optional)
5. Database verification results

---

**End of Deployment Checklist**
