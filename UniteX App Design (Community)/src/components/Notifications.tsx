import { useState } from "react";
import { Heart, MessageCircle, Users, AtSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const initialNotifications = {
  all: [],
  collaborations: [],
  mentions: [],
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-8 h-8 text-pink-500 fill-current" />;
    case "comment":
      return <MessageCircle className="w-8 h-8 text-blue-500" />;
    case "collaboration":
      return <Users className="w-8 h-8 text-green-500" />;
    case "mention":
      return <AtSign className="w-8 h-8 text-purple-500" />;
    default:
      return null;
  }
};

interface NotificationItemProps {
  notification: any;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
  onMarkAsRead?: (id: number) => void;
  onNavigateToPost?: (username: string) => void;
}

function NotificationItem({ notification, onAccept, onDecline, onMarkAsRead, onNavigateToPost }: NotificationItemProps) {
  const handleClick = () => {
    try {
      if (!notification.read && onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
      
      // Navigate to relevant content
      if (notification.type === "like" || notification.type === "comment" || notification.type === "mention") {
        try {
          onNavigateToPost?.(notification.username);
        } catch (navError) {
          console.error('Error navigating to post:', navError);
          toast.error('Failed to navigate to content');
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to process notification');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? "dark:bg-zinc-950/50 light:bg-gray-100/50" : ""
      }`}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12">
        <AvatarImage src={notification.avatar} />
        <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
          {notification.user?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-foreground">
          <span className="font-medium">{notification.user}</span>
          <span className="text-muted-foreground"> {notification.content}</span>
        </p>
        <span className="text-muted-foreground text-sm">{notification.time}</span>

        {/* Action Buttons for Collaboration Requests */}
        {notification.actionable && notification.type === "collaboration" && (
          <div className="flex gap-2 mt-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAccept?.(notification.id);
              }}
              className="dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full px-6 h-9"
            >
              Accept
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDecline?.(notification.id);
              }}
              variant="outline"
              className="dark:bg-transparent dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 light:bg-transparent light:border-gray-300 light:text-black light:hover:bg-gray-100 rounded-full px-6 h-9"
            >
              Decline
            </Button>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

      {/* Unread Indicator */}
      {!notification.read && (
        <div className="w-2 h-2 dark:bg-blue-500 light:bg-red-600 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

interface NotificationsProps {
  onNavigateToProfile?: (username: string) => void;
}

export default function Notifications({ onNavigateToProfile }: NotificationsProps = {}) {
  // Load read notifications from localStorage
  const getReadNotifications = () => {
    try {
      const saved = localStorage.getItem('readNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [readNotificationIds, setReadNotificationIds] = useState<number[]>(getReadNotifications());
  
  // Mark notifications as read based on localStorage
  const [notifications, setNotifications] = useState(() => {
    const readIds = getReadNotifications();
    return {
      all: initialNotifications.all.map(n => ({ ...n, read: readIds.includes(n.id) || n.read })),
      collaborations: initialNotifications.collaborations.map(n => ({ ...n, read: readIds.includes(n.id) || n.read })),
      mentions: initialNotifications.mentions.map(n => ({ ...n, read: readIds.includes(n.id) || n.read })),
    };
  });

  const handleAccept = (id: number) => {
    toast.success("Collaboration request accepted!");
    setNotifications((prev) => ({
      ...prev,
      all: prev.all.map((n) =>
        n.id === id ? { ...n, actionable: false, read: true } : n
      ),
      collaborations: prev.collaborations.map((n) =>
        n.id === id ? { ...n, actionable: false, read: true } : n
      ),
    }));
  };

  const handleDecline = (id: number) => {
    toast.info("Collaboration request declined");
    setNotifications((prev) => ({
      ...prev,
      all: prev.all.map((n) =>
        n.id === id ? { ...n, actionable: false, read: true } : n
      ),
      collaborations: prev.collaborations.map((n) =>
        n.id === id ? { ...n, actionable: false, read: true } : n
      ),
    }));
  };

  const handleMarkAsRead = (id: number) => {
    const newReadIds = [...readNotificationIds, id];
    setReadNotificationIds(newReadIds);
    localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
    
    setNotifications((prev) => ({
      ...prev,
      all: prev.all.map((n) => (n.id === id ? { ...n, read: true } : n)),
      collaborations: prev.collaborations.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      mentions: prev.mentions.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-foreground text-xl">Notifications</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-transparent border-b dark:border-zinc-800 light:border-gray-200 rounded-none h-12 p-0">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-none border-b-2 border-transparent dark:data-[state=active]:border-blue-500 light:data-[state=active]:border-red-600 data-[state=active]:bg-transparent bg-transparent text-muted-foreground dark:data-[state=active]:text-white light:data-[state=active]:text-red-600"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="collaborations"
              className="flex-1 rounded-none border-b-2 border-transparent dark:data-[state=active]:border-blue-500 light:data-[state=active]:border-red-600 data-[state=active]:bg-transparent bg-transparent text-muted-foreground dark:data-[state=active]:text-white light:data-[state=active]:text-red-600"
            >
              Collaborations
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="flex-1 rounded-none border-b-2 border-transparent dark:data-[state=active]:border-blue-500 light:data-[state=active]:border-red-600 data-[state=active]:bg-transparent bg-transparent text-muted-foreground dark:data-[state=active]:text-white light:data-[state=active]:text-red-600"
            >
              Mentions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {notifications.all.length > 0 ? notifications.all.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationItem 
                    notification={notification}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onMarkAsRead={handleMarkAsRead}
                    onNavigateToPost={onNavigateToProfile}
                  />
                </motion.div>
              )) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-4">🔔</div>
                    <p className="text-muted-foreground">No notifications yet</p>
                    <p className="text-sm text-muted-foreground">You'll see notifications here when people interact with your posts</p>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="collaborations" className="m-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {notifications.collaborations.length > 0 ? notifications.collaborations.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationItem 
                    notification={notification}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onMarkAsRead={handleMarkAsRead}
                    onNavigateToPost={onNavigateToProfile}
                  />
                </motion.div>
              )) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-4">🤝</div>
                    <p className="text-muted-foreground">No collaboration requests</p>
                    <p className="text-sm text-muted-foreground">Collaboration requests will appear here</p>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="mentions" className="m-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {notifications.mentions.length > 0 ? notifications.mentions.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationItem 
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onNavigateToPost={onNavigateToProfile}
                  />
                </motion.div>
              )) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-4">@</div>
                    <p className="text-muted-foreground">No mentions yet</p>
                    <p className="text-sm text-muted-foreground">When someone mentions you, it'll show up here</p>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
