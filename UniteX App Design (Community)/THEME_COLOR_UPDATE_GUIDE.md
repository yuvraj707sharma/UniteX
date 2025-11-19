# Theme Color Update Guide

## ✅ Theme Colors Updated!

### **Changes Made:**

- 🌙 **Dark Mode:** Blue → Orange
- ☀️ **Light Mode:** Red → Blue

---

## 🎨 **New Color Scheme**

### **Dark Mode (Black + Orange)**

```css
--chart-1: #f97316;  /* Orange 500 */
--chart-2: #ea580c;  /* Orange 600 */
--chart-3: #fb923c;  /* Orange 400 */
--sidebar-primary: #f97316;
```

### **Light Mode (White + Blue)**

```css
--primary: #3b82f6;  /* Blue 500 */
--accent: #3b82f6;   /* Blue 500 */
--ring: #3b82f6;     /* Blue 500 */
--sidebar-primary: #3b82f6;
```

---

## 🔄 **Components Using Hardcoded Colors**

These components use **hardcoded Tailwind colors** (like `bg-blue-500`, `text-red-600`) instead of
CSS variables. They need manual updates:

### **Search & Replace Patterns**

Run these find-and-replace commands in VS Code:

#### **For Dark Mode Classes (Change Blue → Orange):**

```
Find: dark:bg-blue-500
Replace: dark:bg-orange-500

Find: dark:text-blue-500
Replace: dark:text-orange-500

Find: dark:text-blue-400
Replace: dark:text-orange-400

Find: dark:border-blue-500
Replace: dark:border-orange-500

Find: dark:hover:bg-blue-600
Replace: dark:hover:bg-orange-600

Find: dark:hover:bg-blue-500
Replace: dark:hover:bg-orange-500

Find: dark:hover:text-blue-500
Replace: dark:hover:text-orange-500

Find: dark:focus:ring-blue-500
Replace: dark:focus:ring-orange-500

Find: dark:from-blue-500
Replace: dark:from-orange-500

Find: dark:to-blue-600
Replace: dark:to-orange-600
```

#### **For Light Mode Classes (Change Red → Blue):**

```
Find: light:bg-red-600
Replace: light:bg-blue-600

Find: light:text-red-600
Replace: light:text-blue-600

Find: light:border-red-600
Replace: light:border-blue-600

Find: light:hover:bg-red-700
Replace: light:hover:bg-blue-700

Find: light:hover:text-red-600
Replace: light:hover:text-blue-600

Find: light:focus:ring-red-600
Replace: light:focus:ring-blue-600

Find: light:from-red-500
Replace: light:from-blue-500

Find: light:to-red-600
Replace: light:to-blue-600

Find: light:bg-red-50
Replace: light:bg-blue-50

Find: light:text-red-600
Replace: light:text-blue-600

Find: light:border-red-200
Replace: light:border-blue-200
```

---

## 📂 **Files That Likely Need Updates**

Search these components for hardcoded colors:

### **High Priority:**

- `src/components/Profile.tsx`
- `src/components/EditProfile.tsx`
- `src/components/HomeFeed.tsx`
- `src/components/PostCard.tsx`
- `src/components/BottomNav.tsx`
- `src/components/LoginScreen.tsx`
- `src/components/CreatePost.tsx`

### **Medium Priority:**

- `src/components/Messages.tsx`
- `src/components/ChatConversation.tsx`
- `src/components/Communities.tsx`
- `src/components/Settings.tsx`
- `src/components/badges/*`
- `src/components/notifications/*`

---

## 🔍 **How to Find & Replace in VS Code**

### **Option 1: Find & Replace in All Files**

1. Press `Ctrl+Shift+H` (Windows/Linux) or `Cmd+Shift+H` (Mac)
2. In **Find** field: `dark:bg-blue-500`
3. In **Replace** field: `dark:bg-orange-500`
4. Click **Replace All** or review each match

### **Option 2: Find & Replace in Specific Folder**

1. Right-click on `src/components` folder
2. Select **"Find in Folder..."**
3. Enter search term
4. Review and replace

---

## 🎯 **Quick Test**

After making changes, test these screens:

### **Dark Mode (Should show Orange):**

- ✅ Buttons in Profile
- ✅ Links in Feed
- ✅ Active icons in BottomNav
- ✅ Badges
- ✅ Notification icons

### **Light Mode (Should show Blue):**

- ✅ Buttons in Profile
- ✅ Links in Feed
- ✅ Active icons in BottomNav
- ✅ Badges
- ✅ Notification icons

---

## 🛠️ **Automated Script** (Optional)

Create a file `update-colors.js`:

```javascript
const fs = require('fs');
const path = require('path');

const replacements = [
  // Dark mode: Blue → Orange
  { from: /dark:bg-blue-500/g, to: 'dark:bg-orange-500' },
  { from: /dark:text-blue-500/g, to: 'dark:text-orange-500' },
  { from: /dark:text-blue-400/g, to: 'dark:text-orange-400' },
  { from: /dark:border-blue-500/g, to: 'dark:border-orange-500' },
  { from: /dark:hover:bg-blue-600/g, to: 'dark:hover:bg-orange-600' },
  
  // Light mode: Red → Blue  
  { from: /light:bg-red-600/g, to: 'light:bg-blue-600' },
  { from: /light:text-red-600/g, to: 'light:text-blue-600' },
  { from: /light:border-red-600/g, to: 'light:border-blue-600' },
  { from: /light:hover:bg-red-700/g, to: 'light:hover:bg-blue-700' },
];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  }
}

// Run on all .tsx files in src/components
const componentsDir = path.join(__dirname, 'src', 'components');
// Add your logic to recursively update files

console.log('🎨 Theme color update complete!');
```

Run with:

```bash
node update-colors.js
```

---

## ✅ **Checklist**

After updating:

- [ ] Run find & replace for all patterns above
- [ ] Test dark mode (should be orange)
- [ ] Test light mode (should be blue)
- [ ] Check all major screens (Profile, Feed, Messages, etc.)
- [ ] Rebuild app: `npm run build`
- [ ] Sync to Android: `npx cap sync android`

---

## 🎨 **Color Reference**

### **Orange Shades (Dark Mode)**

```
orange-400: #fb923c
orange-500: #f97316 (primary)
orange-600: #ea580c
orange-700: #c2410c
```

### **Blue Shades (Light Mode)**

```
blue-400: #60a5fa
blue-500: #3b82f6 (primary)
blue-600: #2563eb
blue-700: #1d4ed8
```

---

**Status:** ✅ CSS Variables Updated
**Next:** Update hardcoded Tailwind classes in components

**Time Required:** 15-30 minutes for find & replace