# Messages Not Showing - Complete Fix Guide

## 🔴 Problem

You're seeing "No messages yet" screen even after sending messages to yourself.

## 🎯 Root Cause

The `messages` table in your Supabase database is **missing required columns** that the app expects:

- Missing: `is_read` column (BOOLEAN)
- Missing: `message_type` column (TEXT)

Without these columns, the query fails silently and returns no results.

---

## ✅ Solution: Run SQL Script

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Click on your **UniteX** project
3. Click **SQL Editor** in the left sidebar (looks like `</> SQL Editor`)

### Step 2: Copy the SQL Script

Open the file: `src/utils/messages-table-fix.sql`

**OR copy this directly:**

```sql
-- Fix Messages Table Schema
-- Run this in your Supabase SQL Editor

-- Add missing columns to messages table
DO $$ 
BEGIN
  -- Add is_read column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='is_read') THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;

  -- Add message_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='message_type') THEN
    ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file'));
  END IF;

  -- Ensure read_at exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='read_at') THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Update existing messages to have proper values
UPDATE messages SET is_read = (read_at IS NOT NULL) WHERE is_read IS NULL;
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, is_read, created_at DESC) WHERE is_read = false;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- Test query to see if messages can be fetched correctly
SELECT 
    m.id,
    m.content,
    m.created_at,
    m.is_read,
    m.message_type,
    sender.username as sender_username,
    receiver.username as receiver_username
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
ORDER BY m.created_at DESC
LIMIT 10;
```

### Step 3: Run the Script

1. Paste the SQL code into the SQL Editor
2. Click the **Run** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for it to complete (should take 2-5 seconds)

### Step 4: Verify Success

You should see output showing:

```
✓ Messages table columns
✓ List of existing messages (if any)
```

Look for these columns in the output:

- `id`
- `sender_id`
- `receiver_id`
- `content`
- `is_read` ← **NEW!**
- `message_type` ← **NEW!**
- `read_at`
- `created_at`

---

## 🔍 Debugging Steps

### Check 1: Verify Messages Exist in Database

Run this in Supabase SQL Editor:

```sql
-- Check if you have any messages
SELECT COUNT(*) as total_messages FROM messages;

-- See all messages
SELECT 
    id,
    content,
    created_at,
    sender_id,
    receiver_id
FROM messages
ORDER BY created_at DESC;
```

**Expected Result**:

- If you've sent messages, you should see them here
- If count is 0, messages weren't saved (different issue)

### Check 2: Verify Table Structure

```sql
-- Check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;
```

**Required Columns**:

- ✅ `id` (uuid)
- ✅ `sender_id` (uuid)
- ✅ `receiver_id` (uuid)
- ✅ `content` (text)
- ✅ `is_read` (boolean) ← **Check this!**
- ✅ `message_type` (text) ← **Check this!**
- ✅ `created_at` (timestamp)

### Check 3: Verify RLS Policies

```sql
-- Check Row Level Security policies
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

**Required Policies**:

- Policy to let users view their own messages
- Policy to let users send messages

If missing, run:

```sql
-- Allow users to view their messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages" 
  ON messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to send messages
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Allow users to update their received messages (mark as read)
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
CREATE POLICY "Users can update their received messages" 
  ON messages FOR UPDATE 
  USING (auth.uid() = receiver_id);
```

### Check 4: Test Message Query

Run this to test if the app's query works:

```sql
-- Replace YOUR_USER_ID with your actual user ID
-- To get your user ID, run: SELECT id FROM profiles WHERE email = 'your@email.com';

SELECT 
  m.*,
  sender.id as sender_profile_id,
  sender.full_name as sender_name,
  sender.username as sender_username,
  sender.avatar_url as sender_avatar,
  receiver.id as receiver_profile_id,
  receiver.full_name as receiver_name,
  receiver.username as receiver_username,
  receiver.avatar_url as receiver_avatar
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
WHERE m.sender_id = 'YOUR_USER_ID' OR m.receiver_id = 'YOUR_USER_ID'
ORDER BY m.created_at DESC;
```

---

## 🔧 Still Not Working? Try These

### Solution A: Rebuild the App

After running the SQL script, you need to rebuild the app:

```bash
# In your project root
cd "C:/UniteX/UniteX App Design (Community)"

# Build web app
npm run build

# Sync with Android
npx cap sync android

# Build new APK
cd android
.\gradlew assembleRelease

# Install on phone
adb install app/build/outputs/apk/release/app-release.apk
```

### Solution B: Clear App Data

Sometimes the app caches old data:

1. Go to: Settings → Apps → UniteX
2. Tap "Storage"
3. Tap "Clear Data"
4. Open UniteX again
5. Log in
6. Check Messages

### Solution C: Check Browser Console (for debugging)

If testing in browser:

1. Open UniteX in Chrome
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for any errors related to messages
5. Check the query being executed

Common errors:

- `column "is_read" does not exist` → Run SQL script
- `permission denied` → Check RLS policies
- `null value in column` → Data integrity issue

### Solution D: Manually Insert Test Message

Try inserting a test message directly in Supabase:

```sql
-- Get your user ID first
SELECT id, email, username FROM profiles WHERE email = 'your@email.com';

-- Insert test message (replace USER_ID_1 and USER_ID_2)
INSERT INTO messages (sender_id, receiver_id, content, is_read, message_type)
VALUES (
  'USER_ID_1',  -- Your user ID
  'USER_ID_2',  -- Another user's ID (or same for testing)
  'Test message from SQL',
  false,
  'text'
);

-- Verify it was inserted
SELECT * FROM messages ORDER BY created_at DESC LIMIT 1;
```

Now check the app - if this message shows up, the SQL fix worked!

---

## 📱 Testing the Fix

### Test 1: Send Message to Yourself

1. Open UniteX
2. Go to Messages
3. Click "Start Chatting" or "+" button
4. Search for your own username
5. Select yourself
6. Send a test message: "Testing messages!"
7. Go back to Messages list
8. **You should see the conversation now!** ✅

### Test 2: Send Message to Friend

1. Have a friend create an account
2. Search for their username
3. Send them a message
4. They should receive it
5. Both of you should see the conversation in Messages list

### Test 3: Check Badge Count

1. Have someone send you a message
2. Don't open it yet
3. Look at the Messages icon in bottom navigation
4. **You should see a badge with "1"** ✅
5. Open the message
6. Badge should disappear

---

## 🎯 Expected Result After Fix

### Before Fix:

```
┌─────────────────────┐
│     Messages        │
│                     │
│       💬            │
│  No messages yet    │
│                     │
│  [Start Chatting]   │
└─────────────────────┘
```

### After Fix:

```
┌─────────────────────┐
│     Messages        │
│                     │
│  ┌───────────────┐  │
│  │ 👤 John Doe   │  │
│  │ @johndoe · 2h │  │
│  │ Hey there!    │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 👤 Jane       │  │
│  │ @jane · 5h    │  │
│  │ Thanks! 🎉    │  │
│  └───────────────┘  │
└─────────────────────┘
```

---

## ❓ FAQ

### Q: I ran the SQL script but still see "No messages yet"

**A:** Try these steps in order:

1. Clear app data (Settings → Apps → UniteX → Clear Data)
2. Rebuild and reinstall the APK
3. Check if messages exist in database (see Check 1 above)
4. Verify RLS policies (see Check 3 above)

### Q: The SQL script gave an error

**A:** Common errors and fixes:

**Error**: `table "messages" does not exist`

- **Fix**: Run `src/lib/additional-tables.sql` first to create the table

**Error**: `column "is_read" already exists`

- **Fix**: Script is safe to re-run, it checks if column exists first

**Error**: `permission denied`

- **Fix**: Make sure you're logged in as the Supabase project owner

### Q: Messages work but badge count is wrong

**A:** The badge count should fix automatically after running the SQL script and rebuilding. If not:

1. Check `src/App.tsx` has the real-time subscription code
2. Clear app data and log in again
3. Check browser console for errors

### Q: Can I undo the SQL changes?

**A:** The changes are safe and required for the app to work. But if needed:

```sql
-- Remove added columns (NOT RECOMMENDED)
ALTER TABLE messages DROP COLUMN IF EXISTS is_read;
ALTER TABLE messages DROP COLUMN IF EXISTS message_type;
```

---

## 📞 Still Having Issues?

If messages still don't show after:

1. ✅ Running the SQL script
2. ✅ Rebuilding the app
3. ✅ Clearing app data
4. ✅ Verifying messages exist in database

Then there might be a different issue. Check:

- Supabase project is online and accessible
- Your Supabase URL and anon key are correct in code
- Network connection is working
- No firewall blocking Supabase

You can also share:

- Screenshots of the SQL Editor results
- Any error messages from browser console
- Results from the debugging queries above

And I'll help you troubleshoot further!

---

## ✅ Success Checklist

After running the fix, verify:

- [ ] SQL script ran without errors
- [ ] Can see `is_read` and `message_type` columns in database
- [ ] Messages exist in the `messages` table
- [ ] RLS policies are active
- [ ] App rebuilt and reinstalled
- [ ] Can send new messages
- [ ] Messages appear in conversation list
- [ ] Badge counts show correct numbers
- [ ] Can click on conversation to view messages
- [ ] Messages marked as read when opened

If all checked, **you're done!** ✅🎉
