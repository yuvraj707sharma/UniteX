import { useState, useEffect } from "react";
import { ArrowLeft, Radio, Mic, Users, Star, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface SpacesProps {
  onBack: () => void;
}

export default function Vartalaap({ onBack }: SpacesProps) {
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground text-xl">Vartalaap</h1>
            <p className="text-muted-foreground text-sm">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[80vh] px-6"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 rounded-full dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-pink-500/20 light:bg-gradient-to-br light:from-purple-100 light:to-pink-100 flex items-center justify-center">
            <Radio className="w-16 h-16 dark:text-purple-500 light:text-purple-600" />
          </div>
          
          {/* Sparkle effects */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 dark:text-purple-400 light:text-purple-500" />
          </motion.div>
          
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: 1
            }}
            className="absolute -bottom-2 -left-2"
          >
            <Star className="w-5 h-5 dark:text-pink-400 light:text-pink-500" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-foreground mb-4 text-center"
        >
          Vartalaap Coming Soon!
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed"
        >
          Join live audio conversations with your peers! Host or participate in 
          discussions about topics you care about. Think of it as your campus radio 
          where everyone can speak.
        </motion.p>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-md space-y-3 mb-8"
        >
          {[
            { icon: "🎙️", text: "Host live audio rooms" },
            { icon: "🗣️", text: "Join conversations as speaker" },
            { icon: "👂", text: "Listen to interesting discussions" },
            { icon: "🔔", text: "Get notified about topics you follow" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-900/50 light:bg-gray-50 border dark:border-zinc-800 light:border-gray-200"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-sm text-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Button
            onClick={onBack}
            className="dark:bg-purple-500 dark:hover:bg-purple-600 light:bg-purple-600 light:hover:bg-purple-700 text-white rounded-full px-8 py-6 text-base"
          >
            <Mic className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-xs text-muted-foreground mt-8"
        >
          Get ready for live conversations 🎤
        </motion.p>
      </motion.div>
    </div>
  );
}
