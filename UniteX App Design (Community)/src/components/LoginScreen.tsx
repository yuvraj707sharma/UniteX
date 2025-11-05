import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { validateEmail } from '../utils/sanitize';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: () => void;
  onNeedsOnboarding: (email: string) => void;
}

export default function LoginScreen({ onLogin, onNeedsOnboarding }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");



  const isValidUniversityEmail = (email: string): boolean => {
    const validDomains = ['@jecrcu.edu.in', '.edu', '.ac.', '.edu.'];
    return validDomains.some(domain => email.toLowerCase().includes(domain));
  };

  const handleLogin = async () => {
    try {
      setError("");
      
      if (!email.trim()) {
        setError("Please enter your email address");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!isValidUniversityEmail(email)) {
        setError("Please use a valid university email (@jecrcu.edu.in or .edu domain)");
        return;
      }

      setIsLoading(true);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        // User exists, sign them in
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false
          }
        });
        
        if (signInError) {
          setError('Failed to send login link. Please try again.');
          return;
        }
        
        toast.success('Check your email for the login link!');
        onLogin();
      } else {
        // New user, needs onboarding
        const { error: signUpError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: true
          }
        });
        
        if (signUpError) {
          setError('Failed to create account. Please try again.');
          return;
        }
        
        toast.success('Check your email to verify your account!');
        onNeedsOnboarding(email);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
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
                onChange={handleEmailChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleLogin();
                  }
                }}
                className={`pl-12 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white light:bg-gray-100 light:border-gray-300 light:text-black placeholder:text-muted-foreground h-14 rounded-2xl ${
                  error ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!email.trim() || isLoading}
            className="w-full h-14 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm space-y-2">
          <p>Only verified university emails are accepted</p>
          <p className="text-xs">Example: @jecrcu.edu.in, @college.edu</p>
        </div>
      </motion.div>
    </div>
  );
}
