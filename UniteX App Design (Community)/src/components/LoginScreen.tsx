import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (email.includes("@") && email.includes(".edu")) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-br dark:from-blue-500 dark:to-blue-600 light:from-red-500 light:to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
          </motion.div>
          <h1 className="text-foreground text-4xl">UniteX</h1>
          <p className="text-muted-foreground">Connect. Collaborate. Create.</p>
        </div>

        {/* Login Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="yourname@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white light:bg-gray-100 light:border-gray-300 light:text-black placeholder:text-muted-foreground h-14 rounded-2xl"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!email.includes("@") || !email.includes(".edu") || isLoading}
            className="w-full h-14 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-2xl disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm space-y-2">
          <p>Only verified university emails are accepted</p>
          <p className="text-xs">Example: @jecrc.edu, @college.edu</p>
        </div>
      </motion.div>
    </div>
  );
}
