import { ArrowLeft, Bell, Heart, MessageCircle, Users, AtSign } from "lucide-react";
import { Switch } from "./ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface NotificationSettingsProps {
  onBack: () => void;
}

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const NotificationItem = ({ icon, title, description, checked, onToggle }: NotificationItemProps) => (
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-start gap-3 flex-1">
      {icon}
      <div>
        <p className="text-foreground">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onToggle} />
  </div>
);

const styles = {
  card: "dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 divide-y dark:divide-zinc-800 light:divide-gray-200",
  icon: "w-5 h-5 text-muted-foreground mt-1"
};

export default function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [collaborations, setCollaborations] = useState(true);
  const [mentions, setMentions] = useState(true);

  const handleToggle = (setter: (value: boolean) => void, enabledMsg: string, disabledMsg: string) => 
    (checked: boolean) => {
      setter(checked);
      toast.success(checked ? enabledMsg : disabledMsg);
    };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Notifications</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* General Notifications */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">General</h2>
          <div className={styles.card}>
            <NotificationItem
              icon={<Bell className={styles.icon} />}
              title="Push notifications"
              description="Receive notifications on this device"
              checked={pushNotifications}
              onToggle={handleToggle(setPushNotifications, "Push notifications enabled", "Push notifications disabled")}
            />
            <NotificationItem
              icon={<Bell className={styles.icon} />}
              title="Email notifications"
              description="Receive updates via email"
              checked={emailNotifications}
              onToggle={handleToggle(setEmailNotifications, "Email notifications enabled", "Email notifications disabled")}
            />
          </div>
        </div>

        {/* Activity Notifications */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Activity</h2>
          <div className={styles.card}>
            <NotificationItem
              icon={<Heart className={styles.icon} />}
              title="Likes"
              description="When someone likes your post"
              checked={likes}
              onToggle={handleToggle(setLikes, "Like notifications enabled", "Like notifications disabled")}
            />
            <NotificationItem
              icon={<MessageCircle className={styles.icon} />}
              title="Comments"
              description="When someone comments on your post"
              checked={comments}
              onToggle={handleToggle(setComments, "Comment notifications enabled", "Comment notifications disabled")}
            />
            <NotificationItem
              icon={<Users className={styles.icon} />}
              title="Collaboration requests"
              description="When someone wants to collaborate"
              checked={collaborations}
              onToggle={handleToggle(setCollaborations, "Collaboration notifications enabled", "Collaboration notifications disabled")}
            />
            <NotificationItem
              icon={<AtSign className={styles.icon} />}
              title="Mentions"
              description="When someone mentions you"
              checked={mentions}
              onToggle={handleToggle(setMentions, "Mention notifications enabled", "Mention notifications disabled")}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
