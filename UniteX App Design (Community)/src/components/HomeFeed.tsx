import { useState, useEffect } from "react";
import { Settings, Plus } from "lucide-react";
import PostCard from "./PostCard";
import ProfileMenu from "./ProfileMenu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import CreatePost from "./CreatePost";

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
  onNavigateToJobs?: () => void;
  onNavigateToLists?: () => void;
  onNavigateToSpaces?: () => void;
  onNavigateToOtherProfile?: (username: string) => void;
}

export default function HomeFeed({ 
  onNavigateToProfile, 
  onNavigateToSettings,
  onNavigateToBookmarks,
  onNavigateToMessages,
  onNavigateToJobs,
  onNavigateToLists,
  onNavigateToSpaces,
  onNavigateToOtherProfile
}: HomeFeedProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser({
          avatar: profile.avatar_url || '',
          name: profile.full_name || 'User'
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async (pageNum = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const POSTS_PER_PAGE = 10;
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(full_name, username, department, avatar_url)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;

      const formattedPosts = data?.map(post => ({
        id: post.id,
        author: post.profiles.full_name || 'Unknown User',
        username: post.profiles.username || 'unknown',
        department: post.profiles.department || 'Unknown',
        content: post.content,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: post.shares_count || 0,
        timeAgo: new Date(post.created_at).toLocaleDateString(),
        avatar: post.profiles.avatar_url || '',
        image: post.media_urls?.[0] || undefined
      })) || [];

      if (append) {
        setPosts(prev => [...prev, ...formattedPosts]);
      } else {
        const allPosts = formattedPosts.length > 0 ? formattedPosts : mockPosts;
        setPosts(allPosts);
      }

      setHasMore(formattedPosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (!append) setPosts(mockPosts);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMorePosts();
    }
  };

  const handlePostCreated = () => {
    fetchPosts(); // Refresh posts
    setShowCreatePost(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto" onScroll={handleScroll}>
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <ProfileMenu
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToSettings={onNavigateToSettings}
            onNavigateToBookmarks={onNavigateToBookmarks || (() => {})}
            onNavigateToMessages={onNavigateToMessages || (() => {})}
            onNavigateToJobs={onNavigateToJobs}
            onNavigateToLists={onNavigateToLists}
            onNavigateToSpaces={onNavigateToSpaces}
          >
            <button className="p-0">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-sm">
                  {currentUser?.name?.charAt(0) || 'U'}
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
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard {...post} onNavigateToProfile={onNavigateToOtherProfile} />
            </motion.div>
          ))}
          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              You've reached the end!
            </div>
          )}
        </motion.div>
      )}

      {/* Floating Compose Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-20 right-4 w-14 h-14 dark:bg-blue-500 light:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
