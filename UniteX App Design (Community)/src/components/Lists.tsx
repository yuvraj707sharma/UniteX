import { useState } from "react";
import { ArrowLeft, List, Plus, MoreVertical, Lock, Globe } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const mockLists = [
  {
    id: 1,
    name: "AI Enthusiasts",
    description: "People working on AI projects",
    memberCount: 12,
    isPrivate: false,
  },
  {
    id: 2,
    name: "Startup Founders",
    description: "Student entrepreneurs",
    memberCount: 8,
    isPrivate: true,
  },
  {
    id: 3,
    name: "Design Inspiration",
    description: "Best designers on campus",
    memberCount: 15,
    isPrivate: false,
  },
];

interface ListsProps {
  onBack: () => void;
}

export default function Lists({ onBack }: ListsProps) {
  const [lists, setLists] = useState(mockLists);

  const handleCreateList = () => {
    toast.success("Create list feature coming soon!");
  };

  const handleDeleteList = (listId: number, listName: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId));
    toast.success(`Deleted ${listName}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground text-xl">Lists</h1>
            <p className="text-muted-foreground text-sm">{lists.length} lists</p>
          </div>
          <button onClick={handleCreateList}>
            <Plus className="w-6 h-6 dark:text-blue-500 light:text-red-600" />
          </button>
        </div>
      </div>

      {/* Lists */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-3"
      >
        {lists.map((list, index) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 dark:bg-zinc-800 light:bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <List className="w-6 h-6 dark:text-blue-500 light:text-red-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-foreground">{list.name}</h3>
                  {list.isPrivate ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-2">{list.description}</p>
                <Badge className="dark:bg-zinc-800 light:bg-gray-200 dark:text-zinc-300 light:text-gray-700 dark:border-zinc-700 light:border-gray-300 text-xs">
                  {list.memberCount} members
                </Badge>
              </div>

              <button
                onClick={() => handleDeleteList(list.id, list.name)}
                className="p-2 dark:hover:bg-zinc-800 light:hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Create New List Button */}
      <div className="fixed bottom-24 right-4 max-w-md mx-auto">
        <Button
          onClick={handleCreateList}
          className="w-14 h-14 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Empty State */}
      {lists.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-foreground text-xl">No lists yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Create lists to organize people and stay updated
            </p>
            <Button
              onClick={handleCreateList}
              className="dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full px-6"
            >
              Create a list
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
