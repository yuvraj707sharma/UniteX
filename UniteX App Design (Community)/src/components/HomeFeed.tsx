import React, { useState } from "react";
import { Settings, Plus } from "lucide-react";
import PostCard from "./PostCard";
import ProfileMenu from "./ProfileMenu";
import { CreatePost } from "./CreatePost";
import { useAuth } from "../contexts/AuthContext";
import { usePosts, usePersonalizedFeed } from "../hooks/usePosts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { motion } from "motion/react";

const mockPosts = [
  {
    id: 1,
    author: "Sydney Sweeny",
    username: "sydneysweeny",
    department: "CS",
    content: "Looking for a business student to help validate my AI-powered study assistant app! Need help with market research and business model. 🚀",
    likes: 45,
    comments: 12,
    shares: 8,
    timeAgo: "2h",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
  },
  {
    id: 2,
    author: "Simran",
    username: "simran",
    department: "Business",
    content: "Excited to announce our campus sustainability project just got approved! Looking for engineering students to help design eco-friendly solutions. DM me!",
    likes: 89,
    comments: 23,
    shares: 15,
    timeAgo: "4h",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
  },
  {
    id: 3,
    author: "Dheemant Agarwal",
    username: "dheemant",
    department: "Law",
    content: "Working on IP protection strategies for student startups. Any CS students with patentable ideas? Let's collaborate!",
    likes: 67,
    comments: 18,
    shares: 11,
    timeAgo: "6h",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
  },
  {
    id: 4,
    author: "Deepak",
    username: "deepak",
    department: "Design",
    content: "Just finished the UI mockups for a mental health awareness app. Need developers and psychology students to bring this to life. Check out my portfolio!",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
    likes: 134,
    comments: 31,
    shares: 24,
    timeAgo: "8h",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
  },
  {
    id: 5,
    author: "James Wilson",
    username: "jameswilson",
    department: "Engineering",
    content: "Built a prototype for an automated campus parking system. Looking for feedback and potential collaborators from IoT and software backgrounds.",
    likes: 92,
    comments: 27,
    shares: 19,
    timeAgo: "12h",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
  },
];

interface HomeFeedProps {
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToBookmarks?: () => void;
  onNavigateToMessages?: () => void;
}

export default function HomeFeed({ 
  onNavigateToProfile, 
  onNavigateToSettings,
  onNavigateToBookmarks,
  onNavigateToMessages 
}: HomeFeedProps) {
  const { profile, signOut } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: personalizedFeed, isLoading: feedLoading } = usePersonalizedFeed();
  
  const currentPosts = personalizedFeed || posts || [];
  const isLoading = feedLoading || postsLoading;

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <ProfileMenu
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToSettings={onNavigateToSettings}
            onNavigateToBookmarks={onNavigateToBookmarks || (() => {})}
            onNavigateToMessages={onNavigateToMessages || (() => {})}
          >
            <button className="p-0">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=3b82f6&color=fff`} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-sm">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </ProfileMenu>

          <div className="flex-1 flex justify-center">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <CreatePost onClose={() => setShowCreatePost(false)} />
              </DialogContent>
            </Dialog>
            
            <button onClick={onNavigateToSettings}>
              <Settings className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4"
      >
        {isLoading ? (
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="dark:bg-zinc-900 dark:border-zinc-800">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-700 rounded w-32"></div>
                        <div className="h-3 bg-zinc-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-700 rounded w-full"></div>
                      <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : currentPosts && currentPosts.length > 0 ? (
          currentPosts.map((post: any, index: number) => (
            <motion.div
              key={post.id || post.post_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))
        ) : (
          <Card className="dark:bg-zinc-900 dark:border-zinc-800 mt-4">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="dark:text-white text-xl mb-2">No posts yet</h3>
              <p className="dark:text-zinc-400 mb-4">
                Be the first to share an idea or start a project!
              </p>
              <Button onClick={() => setShowCreatePost(true)}>
                <Plus size={16} className="mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
