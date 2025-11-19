import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { 
  notificationService, 
  Notification,
  groupNotificationsByDate 
} from '../../services/notificationService';
import NotificationCard from './NotificationCard';
import { cn } from '../../lib/utils';

interface NotificationsPageProps {
  onNavigate?: (screen: string, params?: any) => void;
}

export default function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      await loadNotifications(user.id, 0);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (uid: string, pageNum: number) => {
    try {
      const newNotifications = await notificationService.fetchNotifications(uid, pageNum, 20);
      
      if (pageNum === 0) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      setHasMore(newNotifications.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefresh = async () => {
    if (refreshing || !userId) return;
    
    setRefreshing(true);
    try {
      await loadNotifications(userId, 0);
      await notificationService.fetchUnreadCount(userId);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loading || !userId) return;
    loadNotifications(userId, page + 1);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }

    // Navigate based on type
    if (notification.action_url && onNavigate) {
      // Parse action URL and navigate
      if (notification.action_url.includes('/profile/')) {
        const username = notification.action_url.split('/profile/')[1];
        onNavigate('otherProfile', { username });
      } else if (notification.action_url.includes('/badges')) {
        onNavigate('badges');
      } else if (notification.action_url.includes('/post/')) {
        // Navigate to post detail if you have that screen
        onNavigate('home');
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0 && diff < 120) {
      setPullDistance(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsPulling(false);
    
    if (pullDistance > 80) {
      handleRefresh();
    }
    
    setPullDistance(0);
  };

  const groupedNotifications = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="dark:text-white light:text-black text-xl font-semibold">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm dark:text-zinc-500 light:text-gray-500">
                {unreadCount} unread
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">Mark all read</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-0 right-0 flex justify-center z-20"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full dark:bg-zinc-900 light:bg-white border dark:border-zinc-800 light:border-gray-200 shadow-lg">
              <motion.div
                animate={{ rotate: pullDistance > 80 ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <RefreshCw className={cn(
                  'w-4 h-4',
                  pullDistance > 80 ? 'text-blue-500' : 'dark:text-zinc-500 light:text-gray-500'
                )} />
              </motion.div>
              <span className="text-sm dark:text-zinc-400 light:text-gray-600">
                {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="overflow-y-auto"
        style={{ 
          transform: `translateY(${Math.min(pullDistance, 80)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🔔</div>
              <p className="dark:text-zinc-400 light:text-gray-600 font-medium">
                No notifications yet
              </p>
              <p className="text-sm dark:text-zinc-500 light:text-gray-500">
                You'll see notifications here when people interact with your posts
              </p>
            </div>
          </div>
        ) : (
          <div>
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-[57px] z-10 px-4 py-2 dark:bg-zinc-900/80 light:bg-gray-100/80 backdrop-blur-sm border-b dark:border-zinc-800 light:border-gray-200">
                  <h2 className="text-sm font-semibold dark:text-zinc-400 light:text-gray-600 uppercase tracking-wide">
                    {date}
                  </h2>
                </div>

                {/* Notifications */}
                {notifs.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NotificationCard
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => handleDelete(notification.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="p-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refresh FAB (optional, for non-pull-to-refresh scenarios) */}
      {refreshing && (
        <div className="fixed bottom-24 right-4 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-12 h-12 rounded-full dark:bg-blue-500 light:bg-red-600 shadow-lg flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
