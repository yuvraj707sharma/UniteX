# 🚀 Quick Start - Fix Notifications, Likes & Follows

## ⚡ 3-Minute Fix

### Step 1: Run SQL (2 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**
2. Copy **ALL** content from `NOTIFICATION_AND_FOLLOW_FIX.sql`
3. Paste and click **Run**
4. Wait for "Setup complete!" message

✅ This fixes:

- "column 'body' does not exist" error
- Notification creation for likes/follows/comments
- Follow functionality

### Step 2: Rebuild App (1 minute)

```bash
# In project root
npx cap sync android

# In android folder
cd android
./gradlew assembleDebug
```

✅ This fixes:

- Android notification permissions
- Permission request dialog

### Step 3: Test

Install new APK and test:

- ✅ Like a post (should work without errors)
- ✅ Follow someone (should work, notification created)
- ✅ Toggle notifications in settings (should ask for permission on Android 13+)

---

## 📄 Files Changed

- `NOTIFICATION_AND_FOLLOW_FIX.sql` - **RUN THIS FIRST**
- `android/app/src/main/AndroidManifest.xml` - Updated with permissions
- `src/services/notificationService.ts` - Enhanced permission handling

---

## 🐛 Common Issues

**Still getting errors?**

```sql
-- Run this in Supabase first, then run the main script
DROP TABLE IF EXISTS public.notifications CASCADE;
```

**Permission not requested on Android?**

- Must be Android 13+
- Uninstall and reinstall app
- Check Settings > Apps > UniteX > Permissions

---

## 📚 More Help

- **Complete Guide**: See `COMPLETE_FIX_GUIDE.md`
- **Technical Details**: See `FIX_NOTIFICATIONS_FOLLOWS_PERMISSIONS.md`

---

**Need help?** All fixes are backward compatible and safe to apply.
