# Messages and APK Installation Fix Guide

## Issues Identified

### 1. Messages Not Showing

**Problem**: The Messages screen shows "No messages yet" even after sending messages to yourself.

**Root Cause**: The database schema for the `messages` table is missing required columns (`is_read`,
`message_type`) that the app expects.

### 2. APK Installation Error

**Problem**: When sharing APK via WhatsApp, friend gets "App not installed as package appears to be
invalid"

**Root Causes**:

- Missing signing configuration for release builds
- Potential split APK issues
- Debug keystore mismatch between devices

---

## Solution 1: Fix Messages Database Schema

### Step 1: Run the SQL Fix Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your UniteX project
3. Click on **SQL Editor** in the left sidebar
4. Copy and paste the contents of `src/utils/messages-table-fix.sql`
5. Click **Run** to execute the script

This will:

- Add the missing `is_read` column
- Add the missing `message_type` column
- Ensure `read_at` column exists
- Create performance indexes
- Verify the table structure

### Step 2: Verify Messages Table

After running the script, you should see output showing:

- All columns in the messages table
- Sample messages with correct structure

### Step 3: Test the Messages Feature

1. Build a new APK with the changes
2. Install on your device
3. Send messages to yourself or another user
4. Messages should now appear in the Messages screen

---

## Solution 2: Fix APK Installation Issue

### Changes Made to `android/app/build.gradle`

I've made the following changes:

1. **Added Signing Configuration**:
   ```gradle
   signingConfigs {
       release {
           storeFile file("debug.keystore")
           storePassword "android"
           keyAlias "androiddebugkey"
           keyPassword "android"
       }
   }
   ```

2. **Disabled Split APKs**:
   ```gradle
   splits {
       abi {
           enable false
       }
       density {
           enable false
       }
   }
   ```

3. **Applied Signing to Release Builds**:
   ```gradle
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```

### Build a New APK

#### Method 1: Using Gradle (Recommended)

```powershell
# Navigate to android directory
cd android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease
```

The APK will be located at:

```
android/app/build/outputs/apk/release/app-release.apk
```

#### Method 2: Using Android Studio

1. Open the `android` folder in Android Studio
2. Go to **Build** → **Clean Project**
3. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Wait for build to complete
5. Click "locate" in the notification to find the APK

### Important Notes

⚠️ **Current Setup Uses Debug Keystore**

The current configuration uses the debug keystore which is acceptable for testing and internal
distribution. However, for production release on Google Play Store, you need to:

1. **Create a Production Keystore**:
   ```bash
   keytool -genkey -v -keystore unitex-release.keystore -alias unitex -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update build.gradle**:
   ```gradle
   signingConfigs {
       release {
           storeFile file("unitex-release.keystore")
           storePassword "YOUR_STORE_PASSWORD"
           keyAlias "unitex"
           keyPassword "YOUR_KEY_PASSWORD"
       }
   }
   ```

3. **Keep your keystore safe** - Never commit it to git!

---

## Additional Fixes

### Fix Demo Notification Badges

The "3" and "2" badges you're seeing are demo/placeholder values. To remove them:

1. Check the `BottomNav.tsx` component
2. Look for hardcoded badge counts
3. Replace with actual unread counts from database

### Real-time Message Updates

Consider implementing real-time subscriptions using Supabase:

```typescript
// In Messages.tsx
useEffect(() => {
  const subscription = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${currentUserId}`
    }, (payload) => {
      // Add new message to state
      fetchConversations();
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [currentUserId]);
```

---

## Testing Checklist

- [ ] Run SQL fix script in Supabase
- [ ] Verify messages table has all required columns
- [ ] Clean and rebuild Android app
- [ ] Install APK on your device
- [ ] Send a message to yourself
- [ ] Verify message appears in Messages list
- [ ] Build release APK
- [ ] Share APK to friend via WhatsApp
- [ ] Friend can install successfully
- [ ] Friend can receive and send messages

---

## Troubleshooting

### Messages Still Not Showing

1. Check browser console for errors
2. Verify Supabase RLS policies allow message queries:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   ```
3. Check if profile exists:
   ```sql
   SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
   ```

### APK Still Won't Install on Friend's Device

1. **Check Android Version**: Ensure friend's device is running Android 5.1+ (minSdkVersion 22)
2. **Enable Unknown Sources**: Settings → Security → Install unknown apps → Enable for the app used
   to install
3. **Try Different Transfer Method**:
    - Instead of WhatsApp, try Google Drive or direct USB transfer
    - WhatsApp compresses files which might corrupt the APK
4. **Check File Size**: Ensure the full APK was transferred (should be 40-80 MB)
5. **Verify APK Integrity**:
   ```bash
   aapt dump badging app-release.apk
   ```

### Still Having Issues?

1. Check Capacitor configuration in `capacitor.config.ts`
2. Verify all Capacitor plugins are properly installed
3. Run `npx cap sync android` to sync web assets
4. Check Android logs: `adb logcat | grep UniteX`

---

## Production Readiness

Before publishing to Play Store:

1. ✅ Create production keystore
2. ✅ Update signing configuration
3. ✅ Enable ProGuard/R8 minification
4. ✅ Add app signing configuration in Google Play Console
5. ✅ Test on multiple devices
6. ✅ Implement proper error handling
7. ✅ Add crash reporting (Firebase Crashlytics)
8. ✅ Optimize app size
9. ✅ Test offline functionality
10. ✅ Verify all permissions are necessary

---

## Summary

**For Messages Issue**:

1. Run `src/utils/messages-table-fix.sql` in Supabase
2. Rebuild app and test

**For APK Installation Issue**:

1. Build new APK using: `cd android && ./gradlew assembleRelease`
2. Share the APK from `android/app/build/outputs/apk/release/app-release.apk`
3. Use Google Drive or USB transfer instead of WhatsApp

The fixes have been applied to your codebase. You just need to run the SQL script and rebuild the
APK.
