import { ArrowLeft, Eye, EyeOff, Users, MessageCircle, AtSign } from "lucide-react";
import { Switch } from "./ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PrivacySettingsProps {
  onBack: () => void;
}

export default function PrivacySettings({ onBack }: PrivacySettingsProps) {
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [allowTags, setAllowTags] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [whoCanSeeProfile, setWhoCanSeeProfile] = useState("everyone");

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Privacy and Safety</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* Account Privacy */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Account Privacy</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                {isPrivateAccount ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground mt-1" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground mt-1" />
                )}
                <div>
                  <p className="text-foreground">Private Account</p>
                  <p className="text-muted-foreground text-sm">
                    Only approved followers can see your posts
                  </p>
                </div>
              </div>
              <Switch
                checked={isPrivateAccount}
                onCheckedChange={(checked) => {
                  setIsPrivateAccount(checked);
                  toast.success(checked ? "Account is now private" : "Account is now public");
                }}
              />
            </div>
          </div>
        </div>

        {/* Who Can See Your Content */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Who Can See Your Content</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4 space-y-4">
            <div>
              <label className="text-foreground text-sm mb-2 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                Profile visibility
              </label>
              <Select value={whoCanSeeProfile} onValueChange={setWhoCanSeeProfile}>
                <SelectTrigger className="dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="university">University students only</SelectItem>
                  <SelectItem value="followers">Followers only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Interactions</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 divide-y dark:divide-zinc-800 light:divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <AtSign className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Allow tags</p>
                  <p className="text-muted-foreground text-sm">
                    Let others tag you in posts
                  </p>
                </div>
              </div>
              <Switch
                checked={allowTags}
                onCheckedChange={(checked) => {
                  setAllowTags(checked);
                  toast.success(checked ? "Tags enabled" : "Tags disabled");
                }}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <MessageCircle className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">Allow direct messages</p>
                  <p className="text-muted-foreground text-sm">
                    Receive messages from anyone
                  </p>
                </div>
              </div>
              <Switch
                checked={allowDMs}
                onCheckedChange={(checked) => {
                  setAllowDMs(checked);
                  toast.success(checked ? "DMs enabled" : "DMs disabled");
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
