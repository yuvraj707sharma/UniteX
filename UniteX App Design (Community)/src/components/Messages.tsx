import { Search, Settings, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "motion/react";

const mockChats = [
  {
    id: 1,
    name: "Sydney Sweeny",
    username: "sydneysweeny",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
    lastMessage: "That sounds great! When can we meet?",
    timestamp: "2h",
    unread: true,
  },
  {
    id: 2,
    name: "Simran",
    username: "simran",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
    lastMessage: "Thanks for the collaboration opportunity!",
    timestamp: "5h",
    unread: false,
  },
  {
    id: 3,
    name: "Dheemant Agarwal",
    username: "dheemant",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
    lastMessage: "I'd love to help with the legal aspects",
    timestamp: "1d",
    unread: true,
  },
  {
    id: 4,
    name: "Deepak",
    username: "deepak",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
    lastMessage: "Check out the new designs I sent",
    timestamp: "2d",
    unread: false,
  },
  {
    id: 5,
    name: "Yuvraj",
    username: "yuvraj",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj",
    lastMessage: "Perfect! Let's start next week",
    timestamp: "3d",
    unread: false,
  },
];

export default function Messages() {
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-foreground text-xl">Messages</h1>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-muted-foreground" />
            <Edit className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Direct Messages"
              className="w-full pl-12 pr-4 py-3 dark:bg-zinc-900 dark:border-zinc-800 light:bg-gray-100 light:border-gray-300 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:border-zinc-700 light:focus:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {mockChats.map((chat, index) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full px-4 py-4 flex items-start gap-3 border-b dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                {chat.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate">{chat.name}</span>
                  <span className="text-muted-foreground text-sm">@{chat.username}</span>
                </div>
                <span className="text-muted-foreground text-sm flex-shrink-0">{chat.timestamp}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread ? "text-foreground" : "text-muted-foreground"}`}>
                {chat.lastMessage}
              </p>
            </div>

            {/* Unread Indicator */}
            {chat.unread && (
              <div className="w-2 h-2 dark:bg-blue-500 light:bg-red-600 rounded-full flex-shrink-0 mt-2" />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Empty State Alternative (if no messages) */}
      {mockChats.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-white text-xl">No messages yet</h2>
            <p className="text-zinc-400">Start a conversation with your collaborators</p>
          </div>
        </div>
      )}
    </div>
  );
}
