import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Heart, MessageCircle, Send, Users, Award, Bell } from 'lucide-react';
import { Notification, NotificationType } from '../../services/notificationService';
import { cn } from '../../lib/utils';

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
  onTap?: () => void;
}

export default function NotificationToast({ 
  notification, 
  onClose,
  onTap 
}: NotificationToastProps) {
  if (!notification) return null;

  const getIcon = (type: NotificationType) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'follow':
        return <UserPlus className={iconClass} />;
      case 'like':
        return <Heart className={iconClass} />;
      case 'comment':
      case 'reply':
        return <MessageCircle className={iconClass} />;
      case 'message':
        return <Send className={iconClass} />;
      case 'community_invite':
        return <Users className={iconClass} />;
      case 'badge_unlocked':
        return <Award className={iconClass} />;
      case 'system_announcement':
        return <Bell className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'follow':
        return 'bg-blue-500/20 text-blue-400';
      case 'like':
        return 'bg-red-500/20 text-red-400';
      case 'comment':
      case 'reply':
        return 'bg-green-500/20 text-green-400';
      case 'message':
        return 'bg-purple-500/20 text-purple-400';
      case 'community_invite':
        return 'bg-orange-500/20 text-orange-400';
      case 'badge_unlocked':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'system_announcement':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleClick = () => {
    if (onTap) {
      onTap();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30 
        }}
        className="fixed top-4 left-4 right-4 z-[100] mx-auto max-w-md"
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          className={cn(
            'relative rounded-2xl shadow-2xl backdrop-blur-xl cursor-pointer',
            'dark:bg-zinc-900/95 light:bg-white/95',
            'border dark:border-zinc-800 light:border-gray-200',
            'overflow-hidden'
          )}
        >
          {/* Accent Bar */}
          <div className={cn(
            'absolute top-0 left-0 right-0 h-1',
            notification.type === 'follow' && 'bg-blue-500',
            notification.type === 'like' && 'bg-red-500',
            (notification.type === 'comment' || notification.type === 'reply') && 'bg-green-500',
            notification.type === 'message' && 'bg-purple-500',
            notification.type === 'community_invite' && 'bg-orange-500',
            notification.type === 'badge_unlocked' && 'bg-yellow-500',
            notification.type === 'system_announcement' && 'bg-gray-500'
          )} />

          <div className="flex items-start gap-3 p-4 pt-5">
            {/* Icon */}
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              getIconBg(notification.type)
            )}>
              {getIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold dark:text-white light:text-black mb-0.5">
                {notification.title}
              </h3>
              <p className="text-sm dark:text-zinc-400 light:text-gray-600 line-clamp-2">
                {notification.body}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex-shrink-0 p-1 rounded-full dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 dark:text-zinc-400 light:text-gray-600" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
