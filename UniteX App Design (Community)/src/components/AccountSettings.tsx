import { ArrowLeft, User, Mail, Lock, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface AccountSettingsProps {
  onBack: () => void;
}

export default function AccountSettings({ onBack }: AccountSettingsProps) {
  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex.johnson@jecrc.edu");
  const [username, setUsername] = useState("alexjohnson");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    toast.success("Account information updated!");
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    toast.success("Password changed successfully!");
    setShowPasswordDialog(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleVerification = () => {
    toast.success("Verification request submitted! We'll review it within 24 hours.");
    setShowVerificationDialog(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Account Information</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* Name */}
        <div className="space-y-2">
          <label className="text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dark:bg-zinc-900 light:bg-gray-100 dark:border-zinc-800 light:border-gray-300"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-foreground flex items-center gap-2">
            @Username
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="dark:bg-zinc-900 light:bg-gray-100 dark:border-zinc-800 light:border-gray-300"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="dark:bg-zinc-900 light:bg-gray-100 dark:border-zinc-800 light:border-gray-300"
          />
          <p className="text-muted-foreground text-sm">
            Your university email address
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
        >
          Save Changes
        </Button>

        {/* Additional Options */}
        <div className="pt-6 space-y-3">
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="w-full p-4 dark:bg-zinc-900 light:bg-gray-50 rounded-2xl border dark:border-zinc-800 light:border-gray-200 text-left dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-foreground">Change Password</p>
                <p className="text-muted-foreground text-sm">Update your password</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowVerificationDialog(true)}
            className="w-full p-4 dark:bg-zinc-900 light:bg-gray-50 rounded-2xl border dark:border-zinc-800 light:border-gray-200 text-left dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-foreground">Verify Account</p>
                <p className="text-muted-foreground text-sm">Get verified badge</p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your current password and new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-foreground">Account Verification</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Get a verified badge to show you're authentic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="dark:bg-zinc-800 light:bg-gray-100 rounded-xl p-4">
              <h3 className="text-foreground mb-2">Requirements:</h3>
              <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                <li>University email verification</li>
                <li>Complete profile information</li>
                <li>At least 3 published posts or projects</li>
                <li>Active account for 30+ days</li>
              </ul>
            </div>
            <Button
              onClick={handleVerification}
              className="w-full dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
            >
              Request Verification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
