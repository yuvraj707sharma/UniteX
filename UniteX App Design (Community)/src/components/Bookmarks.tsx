import { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import PostCard from "./PostCard";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

interface BookmarksProps {
  onBack: () => void;
}



export default function Bookmarks({ onBack }: BookmarksProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }
      
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return;
      }

      if (profile) {
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
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
            <h1 className="text-foreground text-xl">Bookmarks</h1>
            <p className="text-muted-foreground text-sm">@{currentUser?.username || 'user'}</p>
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔖</div>
            <h2 className="text-foreground text-xl">Save posts for later</h2>
            <p className="text-muted-foreground max-w-sm">
              Bookmark posts to easily find them again in the future.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
