# 🚀 UniteX APK Build Guide - Orange/Blue Theme

## ✅ Pre-Build Checklist

Your app is ready for APK generation! Here's what's already done:

- ✅ **Color theme updated** (Light: Blue, Dark: Orange)
- ✅ **Web assets built** (Last build: 11/19/2025 10:24 PM)
- ✅ **Synced to Android** (`android/app/src/main/assets/public`)
- ✅ **Capacitor plugins configured**

---

## 🎨 New Color Scheme

### Light Mode ☀️

- Primary color: **Blue** (#3b82f6)
- Buttons, links, active states: Blue
- Background: White

### Dark Mode 🌙

- Primary color: **Orange** (#f97316)
- Buttons, links, active states: Orange
- Background: Black

---

## 📱 Method 1: Build APK Using Android Studio (Recommended)

### Step 1: Open Project in Android Studio

```powershell
# Open Android Studio from VS Code
npx cap open android

# OR manually open Android Studio and select:
# File → Open → C:\UniteX\UniteX App Design (Community)\android
```

### Step 2: Wait for Gradle Sync

- Android Studio will automatically sync Gradle files
- Wait for "Gradle sync finished" message (usually 1-2 minutes)
- Check bottom status bar for progress

### Step 3: Generate Signed APK

#### 3a. First Time Setup - Create Keystore

1. **Menu:** Build → Generate Signed Bundle / APK
2. Select **APK** → Click **Next**
3. Click **Create new...** (Key store path)

**Keystore Details:**

```
Key store path: C:\UniteX\unitex-keystore.jks
Password: [Create strong password - SAVE THIS!]
Alias: unitex-key
Alias password: [Same or different password - SAVE THIS!]
Validity (years): 25
```

**Certificate Info:**

```
First and Last Name: Your Name
Organizational Unit: Development
Organization: UniteX
City: Your City
State: Your State
Country Code: IN (or your country)
```

4. Click **OK** → **Next**

#### 3b. If You Already Have a Keystore

1. **Menu:** Build → Generate Signed Bundle / APK
2. Select **APK** → Click **Next**
3. Click **Choose existing...**
4. Browse to your keystore file
5. Enter passwords
6. Click **Next**

### Step 4: Build Configuration

Select build variant:

- **Build Variants:** `release`
- **Signature Versions:** ✅ V1 (Jar Signature) ✅ V2 (Full APK Signature)
- Click **Create**

### Step 5: Build Progress

- Android Studio will build the APK (3-5 minutes)
- You'll see progress in the Build panel (bottom)
- Success message: "APK(s) generated successfully"

### Step 6: Locate Your APK

APK location:

```
C:\UniteX\UniteX App Design (Community)\android\app\release\app-release.apk
```

**Or click the notification:**

- "locate" link in Android Studio notification
- Opens File Explorer to APK location

---

## 📱 Method 2: Build APK Using Command Line

### Step 1: Navigate to Android Directory

```powershell
cd android
```

### Step 2: Clean Previous Builds

```powershell
.\gradlew clean
```

### Step 3: Build Release APK

```powershell
# For unsigned APK (testing only)
.\gradlew assembleRelease

# For signed APK (if configured in build.gradle)
.\gradlew assembleRelease
```

### Step 4: Find APK

```powershell
# Unsigned APK location:
android\app\build\outputs\apk\release\app-release-unsigned.apk

# Signed APK location (if keystore configured):
android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔐 Configure Automatic Signing (Optional)

To automate signing in future builds:

### Step 1: Create `keystore.properties`

```powershell
# In android/ directory
New-Item keystore.properties
```

### Step 2: Add Keystore Info

Edit `android/keystore.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=unitex-key
storeFile=C:/UniteX/unitex-keystore.jks
```

**⚠️ Important:** Add to `.gitignore`:

```
android/keystore.properties
*.jks
```

### Step 3: Update `build.gradle`

Edit `android/app/build.gradle`:

```gradle
android {
    // ... existing config ...
    
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Now `.\gradlew assembleRelease` will auto-sign!

---

## 🧪 Testing the APK

### Method 1: Install on Connected Device

```powershell
# Make sure device is connected (USB debugging enabled)
adb devices

# Install APK
adb install -r android\app\release\app-release.apk

# Or from Android Studio: Run → Run 'app'
```

### Method 2: Transfer to Device

1. **Copy APK to device:**
    - Via USB cable → Copy to Downloads folder
    - Via email/cloud → Download on device
    - Via ADB: `adb push app-release.apk /sdcard/Download/`

2. **Install on device:**
    - Open Files app
    - Navigate to Downloads
    - Tap `app-release.apk`
    - Allow "Install from Unknown Sources" if prompted
    - Click **Install**

### Method 3: Use Android Emulator

```powershell
# Start emulator from Android Studio
# Or via command line:
emulator -avd Pixel_6_API_33

# Install APK
adb install -r android\app\release\app-release.apk
```

---

## ✅ Testing Checklist

After installing APK, test these features:

### Theme Testing

- [ ] Open app in **Light mode** - buttons should be **BLUE**
- [ ] Toggle to **Dark mode** - buttons should be **ORANGE**
- [ ] Test in Settings → Display → Appearance
- [ ] Check all screens maintain correct colors

### Core Features

- [ ] Login/Signup works
- [ ] Feed loads and displays posts
- [ ] Can create new post
- [ ] Like/Unlike posts works
- [ ] Comments work
- [ ] Messages send/receive
- [ ] Notifications appear
- [ ] Profile editing works
- [ ] Image upload works
- [ ] Badge system displays

### Navigation

- [ ] Bottom navigation works
- [ ] All nav items change color when active
- [ ] Back button navigation works
- [ ] Deep links work (if configured)

### Performance

- [ ] App starts quickly (<3 seconds)
- [ ] Smooth scrolling
- [ ] No crashes
- [ ] Offline mode handles gracefully

---

## 📊 Build Information

### APK Details

- **Package Name:** `com.jecrc.unitex`
- **Version:** Check `android/app/build.gradle` → `versionCode` and `versionName`
- **Min SDK:** API 22 (Android 5.1)
- **Target SDK:** API 33 (Android 13)
- **APK Size:** ~15-25 MB (estimate)

### Increase Version for Updates

Before building new APK for updates:

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2  // Increment by 1
        versionName "1.1.0"  // Update version name
    }
}
```

---

## 🎯 Quick Build Commands

### Complete Build Process

```powershell
# From project root
npm run build
npx cap sync android
npx cap open android

# Then in Android Studio:
# Build → Generate Signed Bundle / APK → APK → Release → Create
```

### Rebuild Everything

```powershell
# Clean everything
Remove-Item -Recurse -Force build
cd android
.\gradlew clean
cd ..

# Rebuild
npm run build
npx cap sync android
cd android
.\gradlew assembleRelease
```

---

## 🐛 Troubleshooting

### Issue: "Keystore was tampered with"

**Solution:** Password is incorrect. Recreate keystore with new password.

### Issue: "Build failed - SDK not found"

**Solution:**

1. Open Android Studio
2. Tools → SDK Manager
3. Install Android SDK Platform 33
4. Apply changes

### Issue: "Gradle build failed"

**Solution:**

```powershell
cd android
.\gradlew clean
.\gradlew assembleRelease --stacktrace
```

### Issue: "App crashes on startup"

**Solution:** Check logs:

```powershell
adb logcat | Select-String "UniteX"
```

### Issue: "Colors not updating"

**Solution:**

1. Clear app data on device
2. Uninstall old APK
3. Install new APK
4. Or: `adb shell pm clear com.jecrc.unitex`

---

## 📤 Distribution

### For Internal Testing

- **Size:** ~15-25 MB
- **Share:** Email, Google Drive, Dropbox
- **Install:** Enable "Unknown Sources" on device

### For Play Store (Future)

1. Build **AAB** (Android App Bundle) instead of APK:
    - Build → Generate Signed Bundle / APK → **Android App Bundle**
2. Create Google Play Developer account ($25 one-time)
3. Upload AAB to Google Play Console
4. Complete store listing
5. Submit for review

---

## 🎉 Success!

Once your APK is built and tested:

✅ **APK Location:** `android/app/release/app-release.apk`
✅ **Theme:** Light (Blue) / Dark (Orange)
✅ **Ready to share** with testers or users
✅ **Backed up keystore** (CRITICAL - needed for all future updates!)

---

## ⚠️ IMPORTANT: Backup Your Keystore!

**CRITICAL:** Keep your keystore file and passwords safe!

```powershell
# Backup keystore
Copy-Item C:\UniteX\unitex-keystore.jks -Destination C:\UniteX\Backups\
# Upload to cloud storage
# Save passwords in password manager
```

**Without the keystore, you CANNOT update your app on Play Store!**

---

## 📞 Need Help?

Common commands:

```powershell
# Check device connection
adb devices

# View app logs
adb logcat | Select-String "chromium"

# Uninstall app
adb uninstall com.jecrc.unitex

# Install new APK
adb install -r app-release.apk

# Clear app data
adb shell pm clear com.jecrc.unitex
```

---

**Your UniteX app is ready for production! 🚀**

Good luck with your APK build and launch! 🎉
