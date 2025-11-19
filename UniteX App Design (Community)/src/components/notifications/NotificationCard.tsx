import { motion } from 'framer-motion';
import { UserPlus, Heart, MessageCircle, Send, Users, Award, Bell, Trash2 } from 'lucide-react';
import { Notification, NotificationType, formatTimeAgo } from '../../services/notificationService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
}

export default function NotificationCard({ 
  notification, 
  onClick,
  onDelete 
}: NotificationCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragX < -100) {
      // Swipe to delete threshold reached
      onDelete();
    }
    setDragX(0);
  };

  return (
    <motion.div
      className="relative overflow-hidden"
      drag="x"
      dragConstraints={{ left: -150, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onDrag={(_, info) => setDragX(info.offset.x)}
      animate={{ x: dragX < -100 && !isDragging ? -150 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Delete Background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Notification Content */}
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative bg-background border-b dark:border-zinc-800 light:border-gray-200',
          'cursor-pointer transition-colors',
          'dark:hover:bg-zinc-900/50 light:hover:bg-gray-50',
          !notification.is_read && 'dark:bg-blue-500/5 light:bg-blue-50/50'
        )}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Icon or Avatar */}
          {notification.related_user_id && notification.metadata?.avatar_url ? (
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={notification.metadata.avatar_url} />
              <AvatarFallback className="dark:bg-zinc-800 light:bg-gray-200">
                {notification.title.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              getIconBg(notification.type)
            )}>
              {getIcon(notification.type)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                'text-sm font-medium',
                notification.is_read 
                  ? 'dark:text-zinc-400 light:text-gray-600'
                  : 'dark:text-white light:text-black'
              )}>
                {notification.title}
              </h3>
              <span className="text-xs dark:text-zinc-500 light:text-gray-500 flex-shrink-0">
                {formatTimeAgo(notification.created_at)}
              </span>
            </div>
            <p className={cn(
              'text-sm line-clamp-2',
              notification.is_read
                ? 'dark:text-zinc-500 light:text-gray-500'
                : 'dark:text-zinc-300 light:text-gray-700'
            )}>
              {notification.body}
            </p>

            {/* Badge for badge unlock notifications */}
            {notification.type === 'badge_unlocked' && notification.metadata?.badge_icon && (
              <div className="mt-2 flex items-center gap-2 p-2 rounded-lg dark:bg-yellow-500/10 light:bg-yellow-50 border dark:border-yellow-500/20 light:border-yellow-200">
                <span className="text-2xl">{notification.metadata.badge_icon}</span>
                <span className="text-sm font-medium dark:text-yellow-400 light:text-yellow-700">
                  {notification.metadata.badge_title}
                </span>
              </div>
            )}
          </div>

          {/* Unread Indicator */}
          {!notification.is_read && (
            <div className="flex-shrink-0 w-2 h-2 rounded-full dark:bg-blue-500 light:bg-blue-600 mt-2" />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
