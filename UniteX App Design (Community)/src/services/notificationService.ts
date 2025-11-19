import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// TYPES & INTERFACES
// ============================================

export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'reply'
  | 'message'
  | 'community_invite'
  | 'badge_unlocked'
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, any>;
  is_read: boolean;
  related_user_id?: string;
  related_post_id?: string;
  related_comment_id?: string;
  action_url?: string;
  created_at: string;
}

export interface NotificationSettings {
  user_id: string;
  follow_notifications: boolean;
  like_notifications: boolean;
  comment_notifications: boolean;
  reply_notifications: boolean;
  message_notifications: boolean;
  community_notifications: boolean;
  badge_notifications: boolean;
  system_notifications: boolean;
  push_enabled: boolean;
  push_follow: boolean;
  push_like: boolean;
  push_comment: boolean;
  push_reply: boolean;
  push_message: boolean;
  push_community: boolean;
  push_badge: boolean;
  push_system: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface NotificationCallback {
  (notification: Notification): void;
}

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

class NotificationService {
  private channel: RealtimeChannel | null = null;
  private callbacks: NotificationCallback[] = [];
  private unreadCount: number = 0;
  private countCallbacks: Array<(count: number) => void> = [];
  private initialized: boolean = false;

  /**
   * Initialize the notification system
   */
  async initialize(userId: string): Promise<void> {
    if (this.initialized) {
      console.warn('Notification service already initialized');
      return;
    }

    try {
      // Fetch initial unread count
      await this.fetchUnreadCount(userId);

      // Set up realtime subscription
      await this.subscribeToNotifications(userId);

      // Request push notification permissions (if on mobile/web)
      await this.requestPushPermissions(userId);

      this.initialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Subscribe to realtime notifications
   */
  private async subscribeToNotifications(userId: string): Promise<void> {
    // Clean up existing subscription
    if (this.channel) {
      await supabase.removeChannel(this.channel);
    }

    // Create new channel
    this.channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          this.handleNewNotification(notification);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to notifications');
        }
      });
  }

  /**
   * Handle new notification
   */
  private handleNewNotification(notification: Notification): void {
    // Increment unread count
    this.unreadCount++;
    this.notifyCountChange();

    // Notify all callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Add callback for new notifications
   */
  onNotification(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add callback for unread count changes
   */
  onUnreadCountChange(callback: (count: number) => void): () => void {
    this.countCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.countCallbacks.indexOf(callback);
      if (index > -1) {
        this.countCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify count change callbacks
   */
  private notifyCountChange(): void {
    this.countCallbacks.forEach((callback) => {
      try {
        callback(this.unreadCount);
      } catch (error) {
        console.error('Error in count callback:', error);
      }
    });
  }

  /**
   * Fetch notifications with pagination
   */
  async fetchNotifications(
    userId: string,
    page: number = 0,
    limit: number = 20
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Fetch unread count
   */
  async fetchUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', { p_user_id: userId });

      if (error) throw error;

      this.unreadCount = data || 0;
      this.notifyCountChange();

      return this.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('mark_notification_as_read', { p_notification_id: notificationId });

      if (error) throw error;

      // Decrement unread count
      if (this.unreadCount > 0) {
        this.unreadCount--;
        this.notifyCountChange();
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', { p_user_id: userId });

      if (error) throw error;

      // Reset unread count
      this.unreadCount = 0;
      this.notifyCountChange();

      return data || 0;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return 0;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Create manual notification (for testing or admin)
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    metadata: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_body: body,
        p_metadata: metadata,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get notification settings
   */
  async getSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update(settings)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  /**
   * Request push notification permissions
   */
  async requestPushPermissions(userId: string): Promise<boolean> {
    try {
      // Check if running in a browser that supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }

      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        console.log('Notification permission already granted');
        return true;
      }

      // Request permission
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
          // Register device token if needed
          await this.registerDeviceToken(userId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return false;
    }
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(userId: string): Promise<void> {
    try {
      // For Capacitor/mobile apps, you would get the device token here
      // For web, you would use service worker registration
      
      // This is a placeholder - implement based on your push service
      // (Firebase Cloud Messaging, OneSignal, etc.)
      
      console.log('Device token registration not yet implemented');
      
      // Example for web push:
      // const registration = await navigator.serviceWorker.ready;
      // const subscription = await registration.pushManager.subscribe({...});
      // const token = JSON.stringify(subscription);
      
      // Update profile with device token
      // await supabase
      //   .from('profiles')
      //   .update({ device_token: token })
      //   .eq('id', userId);
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification: Notification): void {
    if (Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: this.getIconForType(notification.type),
        badge: '/icon.png',
        tag: notification.id,
      });

      // Handle click
      notif.onclick = () => {
        window.focus();
        if (notification.action_url) {
          // Navigate to the action URL
          window.location.href = notification.action_url;
        }
        notif.close();
      };
    }
  }

  /**
   * Get icon for notification type
   */
  private getIconForType(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      follow: '/icons/user-plus.png',
      like: '/icons/heart.png',
      comment: '/icons/message.png',
      reply: '/icons/reply.png',
      message: '/icons/send.png',
      community_invite: '/icons/users.png',
      badge_unlocked: '/icons/award.png',
      system_announcement: '/icons/bell.png',
    };
    return icons[type] || '/icon.png';
  }

  /**
   * Get notification icon component name
   */
  getIconComponent(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      follow: 'UserPlus',
      like: 'Heart',
      comment: 'MessageCircle',
      reply: 'MessageCircle',
      message: 'Send',
      community_invite: 'Users',
      badge_unlocked: 'Award',
      system_announcement: 'Bell',
    };
    return icons[type] || 'Bell';
  }

  /**
   * Get notification color
   */
  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      follow: 'text-blue-500',
      like: 'text-red-500',
      comment: 'text-green-500',
      reply: 'text-green-500',
      message: 'text-purple-500',
      community_invite: 'text-orange-500',
      badge_unlocked: 'text-yellow-500',
      system_announcement: 'text-gray-500',
    };
    return colors[type] || 'text-gray-500';
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.callbacks = [];
    this.countCallbacks = [];
    this.initialized = false;
    console.log('✅ Notification service cleaned up');
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const notificationService = new NotificationService();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format time ago
 */
export function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return past.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const grouped: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'Earlier': [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  notifications.forEach((notification) => {
    const notifDate = new Date(notification.created_at);
    const notifDay = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    );

    if (notifDay.getTime() === today.getTime()) {
      grouped.Today.push(notification);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      grouped.Yesterday.push(notification);
    } else if (notifDay >= lastWeek) {
      grouped['This Week'].push(notification);
    } else {
      grouped.Earlier.push(notification);
    }
  });

  // Remove empty groups
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}
