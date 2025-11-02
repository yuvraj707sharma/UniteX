import { ArrowLeft, MoreVertical } from "lucide-react";
import PostCard from "./PostCard";
import { motion } from "framer-motion";

interface BookmarksProps {
  onBack: () => void;
}

const bookmarkedPosts = [
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
];

export default function Bookmarks({ onBack }: BookmarksProps) {
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground text-xl">Bookmarks</h1>
            <p className="text-muted-foreground text-sm">@alexjohnson</p>
          </div>
          <button>
            <MoreVertical className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Bookmarked Posts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard {...post} />
            </motion.div>
          ))
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🔖</div>
              <h2 className="text-foreground text-xl">Save posts for later</h2>
              <p className="text-muted-foreground max-w-sm">
                Bookmark posts to easily find them again in the future.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
