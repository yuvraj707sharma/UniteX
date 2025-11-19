# 🎨 Manual Color Update Guide for UniteX

## ✅ Colors Now Correctly Applied!

Your app now uses:

- **Dark Mode:** Orange (#f97316)
- **Light Mode:** Blue (#3b82f6)

---

## 📝 How Color System Works

UniteX uses **Tailwind CSS v4** with two color systems:

1. **Source Files** (`src/components/*.tsx`) - Use Tailwind classes like `dark:bg-blue-500`
2. **CSS Variables** (`src/index.css`) - Define actual color values

**The Key:** When you write `dark:bg-blue-500`, Tailwind outputs `var(--color-blue-500)`, and we
changed what `--color-blue-500` equals!

---

## 🔧 Method 1: Update Source Colors (Permanent - Recommended)

This is what we just did. Edit `src/index.css`:

### Step 1: Find the Color Definitions

Around line 74-90 in `src/index.css`:

```css
@layer theme {
  :root, :host {
    --color-red-600: oklch(.546 .245 262.881);  /* Now outputs blue */
    --color-blue-500: oklch(.646 .222 41.116);  /* Now outputs orange */
    --color-orange-600: oklch(.646 .222 41.116); /* Orange value */
  }
}
```

### Step 2: Swap Values

To change theme colors, **swap the color values**:

| Tailwind Class | Variable | Color Value | Result |
|----------------|----------|-------------|---------|
| `dark:bg-blue-500` | `--color-blue-500` | `oklch(.646 .222 41.116)` | Orange 🟠 |
| `light:bg-red-600` | `--color-red-600` | `oklch(.546 .245 262.881)` | Blue 🔵 |

### Step 3: Update CSS Variables at Bottom

Around line 3600+ in `src/index.css`:

```css
.light {
  --primary: #3b82f6;        /* Blue for light mode */
  --accent: #3b82f6;
  --ring: #3b82f6;
  --chart-1: #3b82f6;
  --sidebar-primary: #3b82f6;
}

.dark {
  --chart-1: #f97316;         /* Orange for dark mode */
  --sidebar-primary: #f97316;
}
```

### Step 4: Rebuild

```powershell
npm run build
npx cap sync android
```

**Done!** Colors are permanently updated.

---

## 🚀 Method 2: Quick Testing (Temporary - For Experiments)

If you want to test colors quickly without rebuilding:

### For Web Browser Testing

1. **Run dev server:**
   ```powershell
   npm run dev
   ```

2. **Open browser DevTools** (`F12`)

3. **Go to Elements/Inspector tab**

4. **Find the `:root` or `.dark`/`.light` styles**

5. **Edit CSS variables live:**
   ```css
   .dark {
     --chart-1: #00ff00; /* Test green in dark mode */
   }
   ```

6. **Changes apply instantly** (but lost on refresh)

### For Android Testing

You **cannot** edit live on Android. You must:

1. Edit `src/index.css`
2. Rebuild: `npm run build`
3. Sync: `npx cap sync android`
4. Reinstall app

---

## 📱 Method 3: Update APK Colors

To change colors in a **production APK**:

### Step 1: Edit Source

Update `src/index.css` as shown in Method 1.

### Step 2: Build Web Assets

```powershell
npm run build
```

### Step 3: Sync to Android

```powershell
npx cap sync android
```

### Step 4: Build APK

```powershell
# Option A: Android Studio
npx cap open android
# Then: Build → Generate Signed Bundle / APK

# Option B: Command Line
cd android
.\gradlew assembleRelease
```

### Step 5: Install New APK

```powershell
adb install -r android/app/release/app-release.apk
```

**Result:** APK now has updated colors!

---

## 🎨 Common Color Customizations

### Change Primary Color

Edit `src/index.css`:

```css
.light {
  --primary: #10b981;  /* Change to green */
}

.dark {
  --chart-1: #ec4899;  /* Change to pink */
}
```

Then also update the Tailwind color mapping:

```css
--color-blue-500: oklch(...);  /* Dark mode primary */
--color-red-600: oklch(...);   /* Light mode primary */
```

**Find oklch values:** Use [oklch.com](https://oklch.com) to convert hex to oklch.

### Example: Make Dark Mode Purple

```css
/* In @layer theme section: */
--color-blue-500: oklch(.558 .288 302.321);  /* Purple */

/* In .dark section: */
--chart-1: #a855f7;  /* Purple hex */
--sidebar-primary: #a855f7;
```

### Example: Make Light Mode Red

```css
/* In @layer theme section: */
--color-red-600: oklch(.577 .245 27.325);  /* Red */

/* In .light section: */
--primary: #dc2626;  /* Red hex */
--accent: #dc2626;
```

---

## 🗂️ Complete Color Reference

### Current Setup (Orange/Blue)

| Mode | Tailwind Class | CSS Variable | Color | Hex |
|------|----------------|--------------|-------|-----|
| Dark | `dark:bg-blue-500` | `--color-blue-500` | Orange | `#f97316` |
| Dark | `dark:text-blue-500` | `--color-blue-500` | Orange | `#f97316` |
| Light | `light:bg-red-600` | `--color-red-600` | Blue | `#3b82f6` |
| Light | `light:text-red-600` | `--color-red-600` | Blue | `#3b82f6` |

### Color Value Formats

```css
/* Hex */
--primary: #3b82f6;

/* OKLCH (better for Tailwind) */
--color-blue-500: oklch(.646 .222 41.116);

/* RGB */
--primary: rgb(59, 130, 246);
```

**Recommendation:** Use **hex** for CSS variables and **oklch** for Tailwind color definitions.

---

## 🔄 Complete Update Workflow

### For Development

```powershell
# 1. Edit colors
code src/index.css

# 2. Test in browser
npm run dev

# 3. When satisfied, build
npm run build

# 4. Test on Android
npx cap sync android
npx cap run android
```

### For Production APK

```powershell
# 1. Edit colors
code src/index.css

# 2. Build
npm run build

# 3. Sync
npx cap sync android

# 4. Generate APK
npx cap open android
# Then: Build → Generate Signed Bundle / APK

# 5. Test APK
adb install -r android/app/release/app-release.apk
```

---

## 🐛 Troubleshooting

### Colors Not Updating

1. **Clear build cache:**
   ```powershell
   Remove-Item -Recurse -Force build
   npm run build
   ```

2. **Clear Android cache:**
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   npx cap sync android
   ```

3. **Uninstall old app:**
   ```powershell
   adb uninstall com.jecrc.unitex
   adb install -r android/app/release/app-release.apk
   ```

### Colors Different in Browser vs Android

- **Cause:** Old build synced to Android
- **Fix:**
  ```powershell
  npm run build
  npx cap sync android
  ```

### APK Has Old Colors

- **Cause:** Built APK before color changes
- **Fix:** Build new APK after updating colors

---

## 📝 Quick Reference: File Locations

```
src/index.css              ← Edit this for color changes
src/components/*.tsx       ← Don't need to edit (uses Tailwind classes)
build/assets/*.css         ← Auto-generated (don't edit directly)
android/app/src/main/assets/public/  ← Synced from build/
```

---

## ✅ Summary

**For permanent color changes:**

1. Edit `src/index.css` (swap color values)
2. Run `npm run build`
3. Run `npx cap sync android`
4. Build new APK if needed

**Your colors are now correctly set to:**

- 🌙 Dark mode: Orange
- ☀️ Light mode: Blue

**All done! Your app will now show the correct colors on Android! 🎉**
