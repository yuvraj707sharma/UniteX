# Fix App Icon Issue

## Problem

The app icon is not showing in the APK - it shows the default Android icon instead of your UniteX
logo.

## Root Cause

Capacitor uses default placeholder icons. You need to generate proper Android icon sizes from your
logo and place them in the correct directories.

---

## Solution: Generate Android Icons

### Option 1: Use Online Icon Generator (Easiest)

1. **Go to Android Asset Studio**
    - Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
    - Or use: https://www.appicon.co/

2. **Upload Your Logo**
    - Use `public/unitex-logo.png` or `public/icon-512x512.png.png`
    - Best source: Use the 512x512 icon

3. **Configure Settings**
    - Name: `ic_launcher`
    - Trim: Adjust padding if needed
    - Shape: Circle or Square (your preference)
    - Background: Choose a color (white or your brand color)

4. **Download**
    - Download the generated ZIP file
    - Extract it

5. **Replace Icons**
    - Copy all folders from the ZIP to: `android/app/src/main/res/`
    - Replace existing:
        - `mipmap-hdpi/ic_launcher.png`
        - `mipmap-mdpi/ic_launcher.png`
        - `mipmap-xhdpi/ic_launcher.png`
        - `mipmap-xxhdpi/ic_launcher.png`
        - `mipmap-xxxhdpi/ic_launcher.png`
        - `mipmap-anydpi-v26/ic_launcher.xml` (if included)

6. **Rebuild**
   ```bash
   npx cap sync android
   npx cap open android
   ```

7. **Build APK**
    - In Android Studio: Build → Build APK

---

### Option 2: Manual Icon Creation

If you want to do it manually:

#### Required Icon Sizes:

| Density | Folder | Size | File |
|---------|--------|------|------|
| mdpi | mipmap-mdpi | 48x48 | ic_launcher.png |
| hdpi | mipmap-hdpi | 72x72 | ic_launcher.png |
| xhdpi | mipmap-xhdpi | 96x96 | ic_launcher.png |
| xxhdpi | mipmap-xxhdpi | 144x144 | ic_launcher.png |
| xxxhdpi | mipmap-xxxhdpi | 192x192 | ic_launcher.png |

#### Steps:

1. **Resize Your Logo**
    - Use Photoshop, GIMP, or online tool
    - Create PNG files at each size above
    - Maintain transparent background OR add solid background

2. **Create Round Icons** (Optional)
    - Same sizes as above
    - Name: `ic_launcher_round.png`
    - Use circular mask

3. **Place Files**
   ```
   android/app/src/main/res/
   ├── mipmap-mdpi/
   │   ├── ic_launcher.png (48x48)
   │   └── ic_launcher_round.png (48x48)
   ├── mipmap-hdpi/
   │   ├── ic_launcher.png (72x72)
   │   └── ic_launcher_round.png (72x72)
   ├── mipmap-xhdpi/
   │   ├── ic_launcher.png (96x96)
   │   └── ic_launcher_round.png (96x96)
   ├── mipmap-xxhdpi/
   │   ├── ic_launcher.png (144x144)
   │   └── ic_launcher_round.png (144x144)
   └── mipmap-xxxhdpi/
       ├── ic_launcher.png (192x192)
       └── ic_launcher_round.png (192x192)
   ```

4. **Rebuild**
   ```bash
   npx cap sync android
   ```

---

### Option 3: Use Capacitor Assets Plugin (Automated)

1. **Install Plugin**
   ```bash
   npm install @capacitor/assets --save-dev
   ```

2. **Create Source Image**
    - Place your logo at: `resources/icon.png`
    - Recommended: 1024x1024 PNG with transparency

3. **Generate Icons**
   ```bash
   npx capacitor-assets generate --android
   ```

4. **Sync**
   ```bash
   npx cap sync android
   ```

---

## Quick Fix (Temporary)

If you need a quick fix for testing:

1. **Copy Your Logo**
    - Take `public/icon-192x192.png.png`
    - Resize to 192x192 (if not already)

2. **Replace Files**
    - Copy to: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
    - Copy to: `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
    - Copy to: `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
    - Copy to: `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
    - Copy to: `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`

3. **Sync & Build**
   ```bash
   npx cap sync android
   ```

**Note**: This is not ideal as it uses the same image for all densities, but it works for quick
testing.

---

## Verification

### Check Icons Are Updated

```bash
# List icon files
ls -la android/app/src/main/res/mipmap-*/ic_launcher.png

# Check file sizes (should be different for each density)
du -h android/app/src/main/res/mipmap-*/ic_launcher.png
```

### Test on Device

1. Build APK
2. Install on device
3. Check app launcher
4. Icon should show your logo

---

## Adaptive Icons (Android 8.0+)

For modern Android devices, you should also create adaptive icons:

### Structure:

```
mipmap-anydpi-v26/
├── ic_launcher.xml
└── ic_launcher_round.xml
```

### ic_launcher.xml:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

### Add to values/colors.xml:

```xml
<color name="ic_launcher_background">#FFFFFF</color>
```

---

## Common Issues

### Icon Still Not Showing

- **Solution**: Clear app data and reinstall
  ```bash
  adb uninstall com.your.package
  adb install app-debug.apk
  ```

### Wrong Icon Size

- **Solution**: Verify each mipmap folder has correct size
- **Tool**: Use `file` command or image viewer

### Icon Pixelated

- **Solution**: Start with high-res source (1024x1024)
- **Solution**: Use PNG with transparency

### Only Shows on Some Devices

- **Solution**: Ensure all density folders have icons
- **Solution**: Add adaptive icons for Android 8+

---

## Resources

### Online Tools

- **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/
- **App Icon Generator**: https://www.appicon.co/
- **Icon Kitchen**: https://icon.kitchen/

### Image Editors

- **Photoshop**: Professional tool
- **GIMP**: Free alternative
- **Figma**: Online design tool
- **Canva**: Simple online editor

### Capacitor Docs

- **Icons Guide**: https://capacitorjs.com/docs/guides/splash-screens-and-icons
- **Assets Plugin**: https://github.com/ionic-team/capacitor-assets

---

## Recommended Workflow

1. **Design** logo in 1024x1024 PNG
2. **Generate** all sizes using Android Asset Studio
3. **Download** and extract ZIP
4. **Copy** to `android/app/src/main/res/`
5. **Sync** with `npx cap sync android`
6. **Build** APK in Android Studio
7. **Test** on device

---

## What Your Icon Should Include

✅ **Do:**

- Use high contrast
- Keep it simple and recognizable
- Use your brand colors
- Test on both light and dark backgrounds
- Ensure it's clear at small sizes

❌ **Don't:**

- Use text (hard to read when small)
- Use complex details
- Rely on specific shape (use padding)
- Forget transparency or background

---

## Final Notes

### Icon Best Practices

- **Format**: PNG-24 with alpha channel
- **Source**: 1024x1024 minimum
- **Style**: Simple, bold, memorable
- **Colors**: High contrast, brand colors
- **Shape**: Works in square and circle

### Testing

- Test on multiple devices
- Check in app drawer
- Check in recent apps
- Verify in Play Store listing

---

## Need Help?

If you're still having issues:

1. **Check Files Exist**:
   ```bash
   find android/app/src/main/res -name "ic_launcher.png"
   ```

2. **Verify Manifest**:
    - `android:icon="@mipmap/ic_launcher"` should be in AndroidManifest.xml

3. **Clean Build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx cap sync android
   ```

4. **Reinstall**:
    - Uninstall old APK
    - Install new APK
    - Check launcher

---

**After following these steps, your UniteX app icon should display properly!** 🎨
