import { useState } from "react";
import { Settings, Heart, MessageCircle, Users, AtSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const initialNotifications = {
  all: [
    {
      id: 1,
      type: "like",
      user: "Sydney Sweeny",
      username: "sydneysweeny",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
      content: "liked your project idea",
      time: "2h ago",
      read: false,
    },
    {
      id: 2,
      type: "collaboration",
      user: "Simran",
      username: "simran",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
      content: "applied to join your AI Navigation project",
      time: "4h ago",
      read: false,
      actionable: true,
    },
    {
      id: 3,
      type: "mention",
      user: "Dheemant Agarwal",
      username: "dheemant",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
      content: "mentioned you in a comment",
      time: "6h ago",
      read: true,
    },
    {
      id: 4,
      type: "comment",
      user: "Deepak",
      username: "deepak",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
      content: "commented on your post",
      time: "8h ago",
      read: true,
    },
  ],
  collaborations: [
    {
      id: 2,
      type: "collaboration",
      user: "Simran",
      username: "simran",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
      content: "applied to join your AI Navigation project",
      time: "4h ago",
      read: false,
      actionable: true,
    },
    {
      id: 5,
      type: "collaboration",
      user: "Yuvraj",
      username: "yuvraj",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj",
      content: "invited you to join IoT Parking System",
      time: "1d ago",
      read: true,
      actionable: true,
    },
  ],
  mentions: [
    {
      id: 3,
      type: "mention",
      user: "Dheemant Agarwal",
      username: "dheemant",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
      content: "mentioned you in a comment",
      time: "6h ago",
      read: true,
    },
  ],
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
}

function NotificationItem({ notification, onAccept, onDecline, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to relevant content
    if (notification.type === "like" || notification.type === "comment" || notification.type === "mention") {
      toast.info("Opening post...");
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
          {notification.user.charAt(0)}
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

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

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
          <Settings className="w-6 h-6 text-muted-foreground" />
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
              {notifications.all.map((notification, index) => (
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
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="collaborations" className="m-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {notifications.collaborations.map((notification, index) => (
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
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="mentions" className="m-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {notifications.mentions.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationItem 
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
