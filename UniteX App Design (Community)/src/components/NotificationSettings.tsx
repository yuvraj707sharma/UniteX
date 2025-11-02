import { ArrowLeft, Bell, Heart, MessageCircle, Users, AtSign } from "lucide-react";
import { Switch } from "./ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface NotificationSettingsProps {
  onBack: () => void;
}

export default function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [collaborations, setCollaborations] = useState(true);
  const [mentions, setMentions] = useState(true);

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
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 divide-y dark:divide-zinc-800 light:divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Bell className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Push notifications</p>
                  <p className="text-muted-foreground text-sm">
                    Receive notifications on this device
                  </p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={(checked) => {
                  setPushNotifications(checked);
                  toast.success(checked ? "Push notifications enabled" : "Push notifications disabled");
                }}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Bell className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Email notifications</p>
                  <p className="text-muted-foreground text-sm">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
                }}
              />
            </div>
          </div>
        </div>

        {/* Activity Notifications */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Activity</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 divide-y dark:divide-zinc-800 light:divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Heart className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Likes</p>
                  <p className="text-muted-foreground text-sm">
                    When someone likes your post
                  </p>
                </div>
              </div>
              <Switch
                checked={likes}
                onCheckedChange={(checked) => {
                  setLikes(checked);
                  toast.success(checked ? "Like notifications enabled" : "Like notifications disabled");
                }}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <MessageCircle className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Comments</p>
                  <p className="text-muted-foreground text-sm">
                    When someone comments on your post
                  </p>
                </div>
              </div>
              <Switch
                checked={comments}
                onCheckedChange={(checked) => {
                  setComments(checked);
                  toast.success(checked ? "Comment notifications enabled" : "Comment notifications disabled");
                }}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Users className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Collaboration requests</p>
                  <p className="text-muted-foreground text-sm">
                    When someone wants to collaborate
                  </p>
                </div>
              </div>
              <Switch
                checked={collaborations}
                onCheckedChange={(checked) => {
                  setCollaborations(checked);
                  toast.success(checked ? "Collaboration notifications enabled" : "Collaboration notifications disabled");
                }}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <AtSign className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Mentions</p>
                  <p className="text-muted-foreground text-sm">
                    When someone mentions you
                  </p>
                </div>
              </div>
              <Switch
                checked={mentions}
                onCheckedChange={(checked) => {
                  setMentions(checked);
                  toast.success(checked ? "Mention notifications enabled" : "Mention notifications disabled");
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
