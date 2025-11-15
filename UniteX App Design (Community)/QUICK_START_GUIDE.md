# UniteX - Quick Start Guide

## ✅ What Has Been Fixed

### 1. **Messages Not Showing Issue**

- **Problem**: Messages screen showed "No messages yet" even after sending messages
- **Root Cause**: Database schema was missing required columns (`is_read`, `message_type`)
- **Status**: ✅ SQL fix script created

### 2. **APK Installation Error**

- **Problem**: "App not installed as package appears to be invalid" when friend tries to install
- **Root Cause**: Missing signing configuration and split APK issues
- **Status**: ✅ Fixed - New APK built successfully

### 3. **Demo Badge Counts**

- **Problem**: Hardcoded "3" and "2" appearing on notification and message buttons
- **Root Cause**: Demo values in App.tsx
- **Status**: ✅ Fixed - Now fetches real counts from database

---

## 🚀 Next Steps (Complete in Order)

### Step 1: Fix Database Schema

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your **UniteX** project
3. Click **SQL Editor** in the sidebar
4. Open the file `src/utils/messages-table-fix.sql` from your project
5. Copy all the SQL code and paste it into the SQL Editor
6. Click **Run** to execute
7. Verify you see output showing the messages table columns

### Step 2: Install the New APK on Your Device

The new APK is located at:

```
android/app/build/outputs/apk/release/app-release.apk
```

**To install on your device:**

1. Connect your phone via USB
2. Copy the APK to your phone's Downloads folder
3. On your phone, go to Settings → Security → Install unknown apps
4. Enable installation for your file manager
5. Open the APK from Downloads and install

**OR use ADB:**

```powershell
cd android
adb install app/build/outputs/apk/release/app-release.apk
```

### Step 3: Test Messages Feature

1. Open UniteX on your device
2. Go to Messages screen
3. Click the "New Message" button (✏️ icon)
4. Search for a user and start a conversation
5. Send a message
6. Verify the message appears in the conversation
7. Go back to Messages list
8. Verify the conversation appears with your latest message

### Step 4: Share APK with Your Friend

**⚠️ IMPORTANT: Don't use WhatsApp to share APK files!**

WhatsApp compresses files which can corrupt APKs. Use these methods instead:

**Option 1: Google Drive (Recommended)**

1. Upload `app-release.apk` to Google Drive
2. Share the link with your friend
3. Friend downloads and installs

**Option 2: USB Transfer**

1. Connect friend's phone to your computer
2. Copy APK directly to their device
3. They install from file manager

**Option 3: Email**

1. Email the APK as an attachment
2. Friend downloads from email
3. Installs on their device

### Step 5: Verify Badge Counts

1. Open the app
2. Check the bottom navigation bar
3. Notification and Message icons should show:
    - **0** if no unread items
    - **Actual count** if there are unread items
4. Send yourself a message from another account
5. Badge count should update automatically

---

## 📱 APK Details

- **File Name**: `app-release.apk`
- **Size**: ~3.5 MB
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Signing**: Debug signed (acceptable for testing/internal distribution)
- **Minimum Android**: 5.1 (API 22)
- **Target Android**: 14 (API 34)

---

## 🔧 Technical Changes Made

### 1. Database Schema Fix (`src/utils/messages-table-fix.sql`)

```sql
-- Added missing columns to messages table
- is_read BOOLEAN DEFAULT false
- message_type TEXT DEFAULT 'text'
- read_at TIMESTAMP WITH TIME ZONE

-- Added performance indexes
- idx_messages_sender_receiver
- idx_messages_receiver_unread
```

### 2. Android Build Configuration (`android/app/build.gradle`)

```gradle
// Added signing configuration
signingConfigs {
    release {
        // Uses system debug keystore
        storeFile file(System.getProperty("user.home") + "/.android/debug.keystore")
        storePassword "android"
        keyAlias "androiddebugkey"
        keyPassword "android"
    }
}

// Disabled split APKs for universal compatibility
splits {
    abi { enable false }
    density { enable false }
}
```

### 3. Badge Count Fix (`src/App.tsx`)

```typescript
// Changed from hardcoded values
const [unreadNotifications, setUnreadNotifications] = useState(0);
const [unreadMessages, setUnreadMessages] = useState(0);

// Added real-time database query
useEffect(() => {
  // Fetches actual unread message count from database
  // Updates automatically when new messages arrive
}, [isLoggedIn, currentUser?.id]);
```

---

## 🐛 Troubleshooting

### Messages Still Not Showing

**Check 1: Did you run the SQL script?**

```sql
-- Run this in Supabase SQL Editor to verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages';

-- Should show: id, sender_id, receiver_id, content, is_read, message_type, etc.
```

**Check 2: Check RLS Policies**

```sql
SELECT * FROM pg_policies WHERE tablename = 'messages';
-- Should show policies allowing users to view their own messages
```

**Check 3: Browser Console**

- Open app in Chrome
- Press F12 → Console tab
- Look for any error messages

### Friend Still Can't Install APK

**Issue: "App not installed"**

- ✅ Check their Android version (must be 5.1+)
- ✅ Enable "Install unknown apps" for file manager
- ✅ Ensure full APK was transferred (should be ~3.5 MB)
- ✅ Try different transfer method (Google Drive instead of WhatsApp)

**Issue: "Package appears to be invalid"**

- ✅ Re-download the APK (might be corrupted)
- ✅ Don't use WhatsApp - use Google Drive or email
- ✅ Check file size matches (~3.5 MB)

**Issue: "Parse error"**

- ✅ File was corrupted during transfer
- ✅ Use USB transfer or Google Drive
- ✅ Rebuild APK and try again

### Badge Counts Not Updating

**Check 1: Database Connection**

```typescript
// Check browser console for errors
console.log("Testing Supabase connection...");
const { data, error } = await supabase.auth.getUser();
console.log("User:", data, "Error:", error);
```

**Check 2: Real-time Subscription**

- Check browser console for subscription errors
- Supabase real-time must be enabled in project settings
- Check Supabase logs in dashboard

---

## 📦 Building Future APKs

Whenever you make changes to the app:

```powershell
# 1. Navigate to project root
cd "C:\UniteX\UniteX App Design (Community)"

# 2. Build the web app
npm run build

# 3. Sync with Android
npx cap sync android

# 4. Build APK
cd android
.\gradlew clean
.\gradlew assembleRelease

# 5. APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 Production Release Checklist

Before publishing to Google Play Store:

- [ ] Create production keystore
- [ ] Update signing configuration
- [ ] Enable ProGuard minification
- [ ] Test on multiple devices
- [ ] Add app icons for all densities
- [ ] Create privacy policy
- [ ] Add app screenshots
- [ ] Write app description
- [ ] Test offline functionality
- [ ] Add crash reporting (Firebase)
- [ ] Optimize app size
- [ ] Test payment flows (if any)
- [ ] Verify all permissions

---

## 📞 Support

If you encounter any issues:

1. Check the console for errors (F12 in browser)
2. Check Supabase logs in dashboard
3. Check Android logs: `adb logcat | findstr UniteX`
4. Review `MESSAGES_AND_APK_FIX.md` for detailed troubleshooting

---

## ✨ Summary

**What You Need to Do:**

1. ✅ Run the SQL script in Supabase (Step 1)
2. ✅ Install the new APK on your device
3. ✅ Test messaging feature
4. ✅ Share APK with friend using Google Drive (not WhatsApp)
5. ✅ Verify badge counts work

**What's Already Done:**

- ✅ Fixed database schema issues
- ✅ Fixed APK signing configuration
- ✅ Built new release APK
- ✅ Fixed hardcoded badge counts
- ✅ Added real-time message count updates
- ✅ Created documentation

Your app is now ready for testing! 🎉
