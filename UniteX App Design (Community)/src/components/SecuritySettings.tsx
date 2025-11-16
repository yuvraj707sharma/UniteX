import { ArrowLeft, Lock, Key, Smartphone, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface SecuritySettingsProps {
  onBack: () => void;
}

export default function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    try {
      if (!oldPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill all fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(
        twoFactorEnabled
          ? "Two-factor authentication disabled"
          : "Two-factor authentication enabled"
      );
    } catch (error) {
      console.error('Error toggling two-factor authentication:', error);
      toast.error('Failed to update two-factor authentication');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Security</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* Change Password */}
        <div className="space-y-4 dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
          <h2 className="text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300"
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300"
            />
            <Button
              onClick={handleChangePassword}
              className="w-full dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-foreground">Two-factor authentication</p>
                <p className="text-muted-foreground text-sm">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={handleToggleTwoFactor} />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 px-2">
            <Key className="w-5 h-5" />
            Active Sessions
          </h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-foreground">Chrome on MacBook Pro</p>
                <p className="text-muted-foreground text-sm">Active now • Mumbai, India</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("This is your current session")}
                className="dark:border-zinc-700 light:border-gray-300 rounded-full"
              >
                Current
              </Button>
            </div>
            
            <div className="border-t dark:border-zinc-800 light:border-gray-200 pt-3">
              <Button
                variant="ghost"
                onClick={() => toast.success("All other sessions logged out")}
                className="w-full text-red-600 dark:hover:bg-red-500/10 light:hover:bg-red-50"
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Log out of all other sessions
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
