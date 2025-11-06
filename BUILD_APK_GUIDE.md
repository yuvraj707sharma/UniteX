# UniteX APK Build Guide

## 📱 Convert React App to Mobile APK

### Option 1: Capacitor (Recommended)

#### Step 1: Install Capacitor
```bash
cd "UniteX App Design (Community)"
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

#### Step 2: Initialize Capacitor
```bash
npx cap init UniteX com.jecrc.unitex
```

#### Step 3: Build the React App
```bash
npm run build
```

#### Step 4: Add Android Platform
```bash
npx cap add android
```

#### Step 5: Copy Web Assets
```bash
npx cap copy android
```

#### Step 6: Open in Android Studio
```bash
npx cap open android
```

#### Step 7: Build APK in Android Studio
1. Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
2. APK will be generated in `android/app/build/outputs/apk/debug/`

---

### Option 2: Cordova (Alternative)

#### Step 1: Install Cordova
```bash
npm install -g cordova
```

#### Step 2: Create Cordova Project
```bash
cordova create unitex-mobile com.jecrc.unitex UniteX
cd unitex-mobile
```

#### Step 3: Copy Built Files
```bash
# Build React app first
cd "../UniteX App Design (Community)"
npm run build

# Copy to Cordova
cp -r dist/* ../unitex-mobile/www/
```

#### Step 4: Add Android Platform
```bash
cd ../unitex-mobile
cordova platform add android
```

#### Step 5: Build APK
```bash
cordova build android
```

---

### Option 3: Online APK Builder (Easiest)

#### Using PWA Builder
1. Build your React app: `npm run build`
2. Deploy to GitHub Pages or Netlify
3. Go to https://www.pwabuilder.com/
4. Enter your deployed URL
5. Download generated APK

---

## 🔧 Required Setup

### 1. Install Android Studio
- Download from: https://developer.android.com/studio
- Install Android SDK and build tools

### 2. Install Java JDK
- Download JDK 11 or higher
- Set JAVA_HOME environment variable

### 3. Configure Environment Variables
```bash
# Add to your system PATH:
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
```

---

## 📋 Pre-Build Checklist

### 1. Update App Configuration
Create `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jecrc.unitex',
  appName: 'UniteX',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
```

### 2. Add App Icons
- Create icons in `public/` folder:
  - `icon-192x192.png`
  - `icon-512x512.png`
  - `favicon.ico`

### 3. Update Manifest
Update `public/manifest.json`:
```json
{
  "name": "UniteX - JECRC Digital Ecosystem",
  "short_name": "UniteX",
  "description": "Digital platform for JECRC students and faculty",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚀 Quick Start (Recommended Path)

1. **Install Capacitor**: `npm install @capacitor/core @capacitor/cli @capacitor/android`
2. **Initialize**: `npx cap init UniteX com.jecrc.unitex`
3. **Build React**: `npm run build`
4. **Add Android**: `npx cap add android`
5. **Copy Assets**: `npx cap copy android`
6. **Open Android Studio**: `npx cap open android`
7. **Build APK**: Build → Build APK(s)

---

## 📱 Testing on Devices

### Android Testing
- Enable Developer Options on Android device
- Enable USB Debugging
- Connect via USB and install APK directly

### iOS Testing (Requires Mac)
- Need Apple Developer Account ($99/year)
- Use Xcode to build and deploy
- Or use TestFlight for beta testing

---

## 🔒 Email Validation

The app already enforces JECRC email validation:
- Only `@jecrcu.edu.in` emails allowed
- Validation happens during signup
- Users with other emails cannot register

Your friends will need valid JECRC email addresses to sign up!