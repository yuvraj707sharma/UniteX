import { ArrowLeft, Users, Target, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">About UniteX</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* Logo/Banner */}
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br dark:from-blue-500 dark:to-purple-600 light:from-red-500 light:to-orange-600 flex items-center justify-center">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-foreground text-2xl mb-2">UniteX</h2>
          <p className="text-muted-foreground">Connecting university students worldwide</p>
        </div>

        {/* Mission */}
        <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 dark:bg-blue-500/10 light:bg-red-50 rounded-lg">
              <Target className="w-5 h-5 dark:text-blue-500 light:text-red-600" />
            </div>
            <div>
              <h3 className="text-foreground mb-2">Our Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To empower students across universities to share ideas, collaborate on projects, 
                and build meaningful connections that extend beyond the classroom.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-foreground px-2">What We Offer</h3>
          <div className="space-y-3">
            <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 dark:text-blue-500 light:text-red-600 mt-1" />
                <div>
                  <p className="text-foreground">Cross-Department Collaboration</p>
                  <p className="text-muted-foreground text-sm">
                    Connect with students from different departments and universities
                  </p>
                </div>
              </div>
            </div>

            <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 dark:text-blue-500 light:text-red-600 mt-1" />
                <div>
                  <p className="text-foreground">Project Showcase</p>
                  <p className="text-muted-foreground text-sm">
                    Share your projects and get recognized for your work
                  </p>
                </div>
              </div>
            </div>

            <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 dark:text-blue-500 light:text-red-600 mt-1" />
                <div>
                  <p className="text-foreground">Community Driven</p>
                  <p className="text-muted-foreground text-sm">
                    Join communities based on your interests and passions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4 text-center">
            <p className="text-2xl dark:text-blue-500 light:text-red-600 mb-1">10K+</p>
            <p className="text-muted-foreground text-xs">Students</p>
          </div>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4 text-center">
            <p className="text-2xl dark:text-blue-500 light:text-red-600 mb-1">500+</p>
            <p className="text-muted-foreground text-xs">Projects</p>
          </div>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4 text-center">
            <p className="text-2xl dark:text-blue-500 light:text-red-600 mb-1">50+</p>
            <p className="text-muted-foreground text-xs">Universities</p>
          </div>
        </div>

        {/* Version & Links */}
        <div className="text-center pt-4 space-y-2">
          <p className="text-muted-foreground text-sm">Version 1.0.0</p>
          <div className="flex justify-center gap-4 text-sm">
            <button className="dark:text-blue-400 light:text-red-600 hover:underline">
              Terms of Service
            </button>
            <button className="dark:text-blue-400 light:text-red-600 hover:underline">
              Privacy Policy
            </button>
          </div>
          <p className="text-muted-foreground text-xs pt-2">
            © 2025 UniteX. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
