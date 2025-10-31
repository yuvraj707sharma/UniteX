import { Settings } from "lucide-react";
import PostCard from "./PostCard";
import ProfileMenu from "./ProfileMenu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  const currentUser = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    name: "Alex Johnson",
  };

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
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-sm">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
          </ProfileMenu>

          <div className="flex-1 flex justify-center">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>

          <button onClick={onNavigateToSettings}>
            <Settings className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {mockPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard {...post} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
