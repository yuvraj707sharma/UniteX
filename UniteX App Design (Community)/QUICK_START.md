# ⚡ Quick Start - Community Posts

## 🚀 3 Steps to Get Running

### **Step 1: Database Setup (2 minutes)**

Open Supabase SQL Editor and run:

```sql
-- Run FINAL_DATABASE_SETUP.sql
-- (Copy the entire file content and paste here)
```

Expected output: "DATABASE SETUP COMPLETE!"

---

### **Step 2: Install APK (1 minute)**

Connect your phone and run:

```powershell
cd "C:\UniteX\android"
adb install -r app\build\outputs\apk\release\app-release.apk
```

---

### **Step 3: Test (2 minutes)**

1. Open app → Go to **Communities** tab
2. Click **+** → Create "Test Community"
3. Click the community → Click **+ FAB**
4. Create a post → Like it
5. Close app → Reopen → **Like still there!** ✅

---

## ✅ That's It!

Your community posts feature is now fully functional!

---

## 📚 Full Documentation

- **Detailed Guide:** `COMMUNITY_POSTS_COMPLETE_GUIDE.md`
- **Testing:** `INSTALL_AND_TEST_GUIDE.md`
- **README:** `README_COMMUNITY_POSTS.md`
- **SQL Files:** `COMMUNITY_UPGRADE_SQL_FIXED.sql`, `FINAL_DATABASE_SETUP.sql`

---

## 🎯 What You Can Do Now

✅ Create communities with @usernames
✅ Post text & images in communities  
✅ Like & comment on posts
✅ Join & leave communities
✅ Manage as admin (delete)
✅ View members with real profiles

---

## 📦 APK Location

```
C:\UniteX\android\app\build\outputs\apk\release\app-release.apk
```

**Share this with your friends!**

---

## 🐛 Quick Troubleshooting

**Posts not showing?**
→ Run `FINAL_DATABASE_SETUP.sql` again

**Like count not updating?**
→ Check Supabase triggers are active

**Username shows NULL?**
→ SQL updates it automatically, refresh the page

---

## 🎉 Enjoy!

You now have a production-grade community system!

**Need help?** Check the full documentation files listed above.
