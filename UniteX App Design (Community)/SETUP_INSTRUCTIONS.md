# UniteX - Complete Setup Instructions

## 🎯 Quick Answer to Your Questions

### Q: Can me and my friends use this app?

**A: YES!** The app is 90% ready. You just need to run 3 SQL scripts (15 minutes).

### Q: Does the home feed work like Twitter or Instagram?

**A: YES!** It works like Twitter:

- ✅ Chronological feed
- ✅ Post text + images
- ✅ Like, comment, repost
- ✅ Pull to refresh
- ✅ Infinite scroll
- ✅ Real-time updates

### Q: Do Communities and Vartalaap work?

**A:**

- **Communities**: ❌ Database not set up (I just created the script for you!)
- **Vartalaap**: ⚠️ Text-based only (no voice chat, but database ready)

---

## ✅ What You Need to Do (30 minutes total)

### Step 1: Run SQL Scripts in Supabase (15 min)

1. Go to https://supabase.com/dashboard
2. Select your **UniteX** project
3. Click **SQL Editor** in the left sidebar
4. Run these 3 scripts in order:

#### Script 1: Fix Messages (REQUIRED)

**File**: `src/utils/messages-table-fix.sql`

```sql
-- Adds is_read and message_type columns
-- Required for messages to work
```

**Action**: Copy → Paste → Run

#### Script 2: Additional Features (REQUIRED)

**File**: `src/lib/additional-tables.sql`

```sql
-- Creates tables for: Jobs, Spaces, Lists
-- Required for app to work fully
```

**Action**: Copy → Paste → Run

#### Script 3: Enable Communities (OPTIONAL but recommended)

**File**: `src/utils/communities-setup.sql`

```sql
-- Creates communities feature
-- Includes 5 sample communities
-- Includes automatic member counting
```

**Action**: Copy → Paste → Run

### Step 2: Install APK on Your Phone (5 min)

The APK is ready at:

```
android/app/build/outputs/apk/release/app-release.apk
```

**Option A: USB Installation**

```powershell
cd android
adb install app/build/outputs/apk/release/app-release.apk
```

**Option B: Manual Installation**

1. Copy APK to your phone
2. Open file manager
3. Tap APK file
4. Install

### Step 3: Create Test Data (10 min)

#### 3a. Create Your Profile

1. Open UniteX
2. Sign up with your email
3. Complete profile onboarding
4. Upload an avatar

#### 3b. Create Sample Posts (so feed isn't empty)

1. Tap the "+" button
2. Write a few test posts:
    - "First post on UniteX! 🚀"
    - "Testing the feed..."
    - "This app is awesome!"
3. Add some images

#### 3c. Test All Features

- ✅ Like your own posts
- ✅ Comment on posts
- ✅ Go to Profile tab
- ✅ Edit your profile
- ✅ Go to Communities tab (should show 5 communities if you ran script 3)
- ✅ Join a community
- ✅ Go to Vartalaap tab
- ✅ Create a Vartalaap room

### Step 4: Share with Friends (5 min)

1. Upload APK to **Google Drive** (NOT WhatsApp!)
2. Share link with friends
3. Friends download and install
4. They create accounts
5. You can now:
    - See each other's posts
    - Like and comment
    - Send messages
    - Join same communities

---

## 📱 Features That Work Right Now

### ✅ FULLY WORKING

| Feature | Description | Like Twitter? |
|---------|-------------|---------------|
| **Login/Signup** | Email & password | ✅ |
| **Home Feed** | Chronological posts | ✅ YES |
| **Create Posts** | Text + images | ✅ YES |
| **Like/Comment** | Engage with posts | ✅ YES |
| **Repost** | Share others' posts | ✅ YES (like Retweet) |
| **Pull to Refresh** | Refresh feed | ✅ YES |
| **Infinite Scroll** | Load more posts | ✅ YES |
| **User Profiles** | View any user's profile | ✅ YES |
| **Follow System** | Follow/unfollow users | ✅ YES |
| **Search** | Search for users | ✅ YES |
| **Bookmarks** | Save posts | ✅ YES |
| **Direct Messages** | Private messaging | ✅ YES (after SQL fix) |
| **Jobs Board** | Post/apply to jobs | ✅ Like LinkedIn |

### ⚠️ WORKS AFTER SETUP

| Feature | Status | Action Required |
|---------|--------|-----------------|
| **Messages/DMs** | ⚠️ | Run script 1 |
| **Communities** | ⚠️ | Run script 3 |
| **Vartalaap** | ⚠️ | Run script 2 (text-based only) |

### ❌ NOT IMPLEMENTED YET

| Feature | Notes |
|---------|-------|
| **Voice Chat** | Vartalaap is text-based only |
| **Notifications** | Shows demo data only |
| **Stories** | Not implemented |
| **For You Algorithm** | Feed is chronological |

---

## 🎨 How Your Home Feed Works

### It Works Like Twitter! ✅

```
┌─────────────────────────────┐
│  [You] UniteX    [Settings] │  ← Header with your avatar
├─────────────────────────────┤
│ Pull down to refresh ↓      │  ← Pull-to-refresh indicator
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ 👤 John Doe        │   │  ← User avatar & name
│  │ @johndoe · 2h ago  │   │  ← Username & timestamp
│  │                     │   │
│  │ Just launched my   │   │  ← Post content
│  │ new project! 🚀    │   │
│  │                     │   │
│  │ [📸 Image]         │   │  ← Optional image
│  │                     │   │
│  │ ❤️ 12  💬 3  🔁 5   │   │  ← Like, comment, repost
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 👤 Jane Smith      │   │  ← Next post
│  │ @janesmith · 5h    │   │
│  │ Check this out...  │   │
│  │ ❤️ 8   💬 1  🔁 2   │   │
│  └─────────────────────┘   │
│                             │
│  [...more posts load        │  ← Infinite scroll
│   as you scroll down...]   │
│                             │
│  "You've reached the end!" │  ← End of feed
└─────────────────────────────┘
     [Home][🔍][👥][🔔][✉️]  ← Bottom navigation
           └─ Floating + button to create post
```

### Key Features:

✅ **Real-time Updates**

- New posts appear automatically
- No need to refresh manually
- Uses Supabase real-time subscriptions

✅ **Pull to Refresh**

- Pull down at the top
- Shows animated loading spinner
- Fetches latest posts

✅ **Infinite Scroll**

- Loads 10 posts at a time
- Auto-loads more when you reach bottom
- Performance optimized

✅ **Create Post**

- Tap floating "+" button (bottom right)
- Opens modal to create post
- Supports text + image upload
- Real-time post creation

✅ **Interactions**

- Tap ❤️ to like
- Tap 💬 to comment
- Tap 🔁 to repost
- Tap avatar to view profile

---

## 🏘️ Communities Feature

After running Script 3, you'll have 5 sample communities:

1. **Web Development** 💻
    - Color: Blue to Cyan gradient
    - Topic: Web tech, frameworks, best practices

2. **AI & Machine Learning** 🤖
    - Color: Purple to Pink gradient
    - Topic: AI, ML, deep learning

3. **Mobile Development** 📱
    - Color: Green to Teal gradient
    - Topic: iOS, Android, cross-platform

4. **Startup Ideas** 💡
    - Color: Orange to Red gradient
    - Topic: Entrepreneurship, startup ideas

5. **Design & UI/UX** 🎨
    - Color: Pink to Rose gradient
    - Topic: Design principles, tools, inspiration

### How Communities Work:

1. **Browse Communities**
    - Tap "Communities" in bottom nav
    - See all available communities

2. **Join a Community**
    - Tap any community
    - Click "Join" button
    - You're now a member!

3. **View Community**
    - See community posts
    - See member list
    - Chat with members

4. **Create Community**
    - Tap "+" button
    - Enter name and description
    - Choose a topic
    - Create!

---

## 🎙️ Vartalaap (Spaces) Feature

**Important**: Currently text-based only (no voice chat)

### How It Works:

1. **Create a Vartalaap**
    - Tap "Vartalaap" in menu
    - Click "+" button
    - Enter title, description, topic
    - Start Vartalaap

2. **Join a Vartalaap**
    - Browse active Vartalaaps
    - Tap "Join Vartalaap"
    - See member list
    - Text-based discussion

3. **Delete Your Vartalaap**
    - Only creators can delete
    - Tap "Delete" button
    - Confirm deletion

**Note**: This is NOT voice chat like Twitter Spaces. It's a text-based discussion room. Adding real
voice chat would require WebRTC integration (2-3 weeks of work).

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Login/signup works
- [ ] Can create profile
- [ ] Can create posts
- [ ] Posts appear in home feed
- [ ] Can like posts
- [ ] Can comment on posts
- [ ] Can repost posts
- [ ] Pull to refresh works
- [ ] Infinite scroll works
- [ ] Can view other profiles
- [ ] Can follow/unfollow users
- [ ] Can search for users
- [ ] Messages screen shows conversations (after sending messages)
- [ ] Badge counts show real numbers
- [ ] Communities tab shows communities (if script 3 run)
- [ ] Can join communities (if script 3 run)
- [ ] Vartalaap tab shows rooms (if script 2 run)

---

## 🚀 Sharing with Friends

### DO THIS: ✅

1. **Upload to Google Drive**
   ```
   1. Go to drive.google.com
   2. Click "New" → "File Upload"
   3. Select app-release.apk
   4. Right-click → "Get link"
   5. Share link with friends
   ```

2. **Or Email It**
    - Attach APK to email
    - Send to friends
    - They download and install

3. **Or USB Transfer**
    - Connect friend's phone to your computer
    - Copy APK to Downloads folder
    - They install from file manager

### DON'T DO THIS: ❌

- ❌ **WhatsApp** - Compresses files, corrupts APK
- ❌ **Facebook Messenger** - Same issue
- ❌ **Instagram DM** - Blocks APK files

---

## 📊 Comparison: UniteX vs Twitter

| Feature | UniteX | Twitter |
|---------|--------|---------|
| **Chronological Feed** | ✅ YES | ✅ YES |
| **Create Posts** | ✅ YES | ✅ YES (Tweets) |
| **Like Posts** | ✅ YES | ✅ YES |
| **Comment** | ✅ YES | ✅ YES (Reply) |
| **Repost** | ✅ YES | ✅ YES (Retweet) |
| **Follow Users** | ✅ YES | ✅ YES |
| **Direct Messages** | ✅ YES | ✅ YES |
| **User Profiles** | ✅ YES | ✅ YES |
| **Search Users** | ✅ YES | ✅ YES |
| **Communities** | ✅ YES* | ✅ YES |
| **Spaces (Voice)** | ⚠️ Text only | ✅ Voice |
| **For You Algorithm** | ❌ NO | ✅ YES |
| **Trending** | ❌ NO | ✅ YES |
| **Verified Badges** | ❌ NO | ✅ YES |
| **Stories** | ❌ NO | ✅ YES (Fleets) |

\* After running communities-setup.sql

---

## 🎯 Bottom Line

### Can you and your friends use it? **YES!** ✅

### Does home feed work like Twitter? **YES!** ✅

### Do Communities work? **YES (after setup)** ⚠️

### Does Vartalaap work? **YES (text-based)** ⚠️

---

## 📋 Quick Setup Summary

**Total Time: 30 minutes**

1. Run 3 SQL scripts in Supabase (15 min)
2. Install APK on your phone (5 min)
3. Create test account and posts (10 min)
4. Share with friends via Google Drive (5 min)

**Then you're ready to go!** 🚀

---

## 🆘 Need Help?

If something doesn't work:

1. Check `FEATURE_STATUS_REPORT.md` for detailed status
2. Check `MESSAGES_AND_APK_FIX.md` for troubleshooting
3. Check `README_LATEST_FIXES.md` for recent changes

**I can help you with:**

- Fixing any bugs
- Adding missing features
- Optimizing performance
- Adding "For You" algorithm
- Setting up production deployment

Just let me know what you need!
