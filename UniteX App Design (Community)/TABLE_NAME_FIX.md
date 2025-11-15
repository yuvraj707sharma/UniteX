# 🎯 TABLE NAME MISMATCH - THE REAL ISSUE!

## You Found It! 🎉

**The Problem:**

- Database table: `post_likes`
- Code looking for: `likes` ❌

**That's why you get 404 error!**

---

## ✅ OPTION 1: Rename Database Table (Easiest)

Run this in Supabase SQL Editor:

```sql
-- Rename post_likes to likes
ALTER TABLE IF EXISTS post_likes RENAME TO likes;

-- Verify
SELECT tablename FROM pg_tables WHERE tablename IN ('likes', 'post_likes');
```

**Then rebuild the app** and it will work!

---

## ✅ OPTION 2: Fix the Code (If table is really post_likes)

If your table is actually called `post_likes`, change these 3 lines in `PostCard.tsx`:

**Line 177:** (in `fetchLikeStatus`)

```typescript
// Change from:
.from('likes')

// To:
.from('post_likes')
```

**Line 212:** (in `handleLike` - delete)

```typescript
// Change from:
await supabase.from('likes').delete()

// To:
await supabase.from('post_likes').delete()
```

**Line 220:** (in `handleLike` - insert)

```typescript
// Change from:
await supabase.from('likes').insert({

// To:
await supabase.from('post_likes').insert({
```

---

## 🔍 First: Check Your Table Name

Run this in Supabase SQL Editor:

```sql
-- What tables do you have?
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%like%';
```

**Tell me the result!** Is it:

- `likes`
- `post_likes`
- Both?
- Neither?

Then I'll know which fix to apply!

---

## 🚀 Quick Fix (Try This First)

**If you have `post_likes` table:**

```sql
-- Just rename it to likes
ALTER TABLE post_likes RENAME TO likes;
```

**Then rebuild:**

```powershell
cd "C:/UniteX/UniteX App Design (Community)"
npm run build
npx cap sync android
cd android
.\gradlew assembleRelease
adb install app/build/outputs/apk/release/app-release.apk
```

**Done! Likes will work!** ✅

---

## Summary

**The 404 error is because:**

- Code: `.from('likes')`
- Database: `post_likes` table

**Solution:**

- Either rename table to `likes` (easiest)
- Or change code to use `post_likes`

Check your table name and let me know which one you have!
