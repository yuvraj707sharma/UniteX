# Quick Reference Card

## 🚀 Pull-to-Refresh (NEW!)

**How to refresh your feed:**

1. Scroll to top of home feed
2. Pull down with your finger
3. Release when it says "Release to refresh"

**Visual cues:**

- "Pull to refresh" = Keep pulling
- "Release to refresh" = Let go now!
- Loading spinner = Refreshing...

---

## 📱 Common Actions

### View Posts

- Open app → Home feed (default)
- Scroll up/down to browse
- Pull down to refresh

### Create Post

- Tap the **+ button** (bottom-right floating button)
- Write your content
- Add images/videos (optional)
- Tap "Post"

### Like/Comment/Share

- **Heart icon** = Like
- **Comment icon** = View/Add comments
- **Share icon** = Share to chat or copy link
- **Repost icon** = Repost or quote

### View Profile

- Tap avatar or username on any post
- See their posts, followers, following
- Follow/Unfollow button

---

## 🛠️ Troubleshooting

### Posts Not Showing?

1. Check you ran the SQL scripts (see `QUICK_FIX.md`)
2. Pull down to refresh
3. Check internet connection
4. Look for debug counter on empty feed

### Pull-to-Refresh Not Working?

1. Make sure you're at the TOP of feed
2. Pull down firmly (need 80px pull)
3. Works on mobile/touch devices only

### App Crashes?

1. Clear app cache
2. Restart app
3. Check console logs (F12 in browser)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `LATEST_UPDATE.md` | What's new in this version |
| `QUICK_FIX.md` | **IMPORTANT** - Database setup |
| `PULL_TO_REFRESH.md` | Pull-to-refresh guide |
| `CHANGELOG.md` | All changes over time |
| `README.md` | Project overview |
| `FIXES_SUMMARY.md` | Technical details of fixes |

---

## 🎯 Key Features

✅ **Pull-to-refresh** - Instagram-style gesture  
✅ **Real-time updates** - Auto-sync new posts  
✅ **Create posts** - Text, images, videos  
✅ **Social features** - Like, comment, share  
✅ **User profiles** - Follow, view posts  
✅ **Jobs** - Post and apply for jobs  
✅ **Messaging** - Chat with users  
✅ **Dark/Light mode** - Theme support

---

## ⚙️ Building & Deployment

```bash
# Development
npm run dev

# Build for production
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 🆘 Need Help?

1. Check `QUICK_FIX.md` for database issues
2. Check `PULL_TO_REFRESH.md` for new feature
3. Check console logs for errors
4. Verify you ran SQL scripts in Supabase

---

**Last Updated:** November 13, 2025  
**Version:** 1.2.0 with Pull-to-Refresh
