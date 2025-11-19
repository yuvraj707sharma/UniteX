# UniteX Notifications - 5-Minute Integration Guide

## 🚀 Quick Setup

### Step 1: Run SQL Migration (2 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy ALL content from `src/lib/notifications-schema.sql`
4. Click **Run**
5. Wait for "Success" message

**Verify:**

```sql
SELECT COUNT(*) FROM notifications;
-- Should return 0 (table exists but empty)
```

### Step 2: Initialize Notification Service (1 minute)

Update `src/App.tsx`:

```typescript
import { notificationService } from './services/notificationService';
import { NotificationToast } from './components/notifications';

export default function App() {
  const [toastNotification, setToastNotification] = useState<any>(null);

  useEffect(() => {
    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Initialize
        await notificationService.initialize(user.id);
        
        // Listen for new notifications
        const unsubscribe = notificationService.onNotification((notif) => {
          setToastNotification(notif);
          setTimeout(() => setToastNotification(null), 5000);
        });
        
        return unsubscribe;
      }
    };

    initNotifications();
  }, []);

  return (
    <>
      <NotificationToast
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
      />
      {/* Rest of your app */}
    </>
  );
}
```

### Step 3: Update Unread Count in Bottom Nav (1 minute)

Update `src/components/BottomNav.tsx`:

```typescript
import { notificationService } from '../services/notificationService';

export default function BottomNav() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.onUnreadCountChange((count) => {
      setUnreadCount(count);
    });
    
    return unsubscribe;
  }, []);

  // Show badge with unreadCount
  return (
    // ... your nav code
    // Show {unreadCount} on notifications icon
  );
}
```

### Step 4: Replace Notifications Page (1 minute)

Update `src/App.tsx` in your screen switcher:

```typescript
import { NotificationsPage } from './components/notifications';

// Replace old Notifications component
case 'notifications':
  return <NotificationsPage onNavigate={handleNavigate} />;
```

## ✅ Verification

### Test 1: Follow Someone

```typescript
// In browser console or test script
const { data: { user } } = await supabase.auth.getUser();
const otherUserId = 'another-user-id';

// Follow someone
await supabase.from('follows').insert({
  follower_id: user.id,
  following_id: otherUserId
});

// Check notifications
SELECT * FROM notifications WHERE user_id = 'another-user-id';
// Should see a "New Follower" notification
```

### Test 2: Like a Post

```typescript
// Like someone's post
await supabase.from('post_likes').insert({
  user_id: user.id,
  post_id: 'some-post-id'
});

// Post author should receive "New Like" notification
```

### Test 3: Toast Appears

1. Have someone follow you
2. A toast should slide from top
3. Click it to navigate to their profile

### Test 4: Realtime Works

1. Open app in two browser tabs
2. In tab 1, like a post by the user in tab 2
3. Tab 2 should instantly show notification toast

## 🎨 Customization

### Change Toast Duration

```typescript
setTimeout(() => setToastNotification(null), 8000); // 8 seconds
```

### Change Notification Colors

Edit `src/components/notifications/NotificationToast.tsx`:

```typescript
case 'follow':
  return 'bg-purple-500/20 text-purple-400'; // Changed from blue
```

### Disable Push Notifications

```typescript
// In App.tsx initialization
await notificationService.initialize(user.id);
// Comment out or don't call:
// await notificationService.requestPushPermissions(user.id);
```

### Change Pagination Limit

```typescript
// Default is 20, change in NotificationsPage.tsx
await notificationService.fetchNotifications(userId, page, 50); // 50 per page
```

## 🔧 Troubleshooting

### Issue: "Function not found"

**Solution:**

```sql
-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%notification%';
-- Should show: create_notification, mark_notification_as_read, etc.
```

### Issue: Toast not appearing

**Solution:**

1. Check browser console for errors
2. Verify NotificationToast is rendered in App.tsx
3. Test manually:

```typescript
setToastNotification({
  id: 'test',
  type: 'follow',
  title: 'Test',
  body: 'This is a test notification',
  created_at: new Date().toISOString()
});
```

### Issue: Realtime not working

**Solution:**

1. Go to Supabase Dashboard → Database → Replication
2. Ensure "notifications" table is in publication
3. Click "Enable Replication" if needed

### Issue: Unread count wrong

**Solution:**

```typescript
// Manually refresh
const { data: { user } } = await supabase.auth.getUser();
await notificationService.fetchUnreadCount(user.id);
```

## 📱 Mobile (Capacitor) Integration

### Install Push Notifications Plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

### Add to App.tsx

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

useEffect(() => {
  const setupPush = async () => {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      await PushNotifications.register();
    }

    PushNotifications.addListener('registration', async (token) => {
      console.log('Push token:', token.value);
      // Save to database
      await supabase.from('profiles').update({
        device_token: token.value
      }).eq('id', user.id);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
      // Show in-app notification
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action:', notification);
      // Navigate to relevant screen
    });
  };

  setupPush();
}, []);
```

## ✨ Pro Tips

1. **Batch Notifications**: For bulk operations, use `create_notification_batch()`

```sql
SELECT create_notification_batch(
  ARRAY['user1', 'user2', 'user3'],
  'system_announcement',
  'New Feature!',
  'Check out our new badges system!'
);
```

2. **Cleanup Old Notifications**: Run weekly

```sql
SELECT cleanup_old_notifications();
-- Deletes read notifications older than 30 days
```

3. **Custom Notification Sounds**: Add to NotificationToast

```typescript
const audio = new Audio('/notification-sound.mp3');
audio.play();
```

4. **Notification Grouping**: Combine similar notifications

```typescript
// In your backend, before creating notification:
// Check if similar notification exists in last hour
// If yes, update it instead of creating new one
```

5. **Offline Support**: Notifications are queued in `notification_queue` table

```sql
-- Process queue when user comes online
SELECT * FROM notification_queue WHERE processed = false;
```

## 🎉 You're Done!

Your notification system is now fully operational!

**Next Steps:**

- Monitor notification engagement
- Add more notification types as needed
- Customize UI to match your brand
- Set up push notification backend (Firebase, OneSignal, etc.)

---

**Need Help?** Check `NOTIFICATIONS_SYSTEM_README.md` for full documentation.
