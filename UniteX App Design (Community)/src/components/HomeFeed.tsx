import { useState, useEffect, useRef } from "react";
import { Settings, Plus } from "lucide-react";
import PostCard from "./PostCard";
import ProfileMenu from "./ProfileMenu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import CreatePost from "./CreatePost";

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
  const [totalPostsCount, setTotalPostsCount] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
    
    // Set up real-time subscription for new posts
    const subscription = supabase
      .channel('posts_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        console.log('New post detected:', payload);
        fetchPosts(); // Refresh posts when new one is added
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
      
      // First, let's check the current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      // Get total count of posts
      const { count: totalCount, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      console.log('Total posts in database:', totalCount, 'Error:', countError);
      setTotalPostsCount(totalCount);
      
      // Try fetching posts without profiles first to debug
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1);

      console.log('Raw posts data:', { postsData, postsError, count: postsData?.length });
      
      if (postsError) {
        console.error('Supabase error:', postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        console.log('No posts found in database');
        setPosts([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Now fetch profiles for these posts
      const authorIds = postsData.map(post => post.author_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, department, avatar_url')
        .in('id', authorIds);

      console.log('Profiles data:', { profilesData, profilesError });

      if (profilesError) {
        console.error('Profiles error:', profilesError);
      }

      // Create a map of profiles for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Fetch reposts count for all posts
      const postIds = postsData.map(post => post.id);
      const repostsMap = new Map();
      
      for (const postId of postIds) {
        const { count } = await supabase
          .from('reposts')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        repostsMap.set(postId, count || 0);
      }

      const formattedPosts = postsData.map(post => {
        const profile = profilesMap.get(post.author_id);
        console.log('Processing post:', post.id, 'Author ID:', post.author_id, 'Profile:', profile);
        
        // Better time formatting
        let timeAgo = 'Unknown';
        try {
          const postDate = new Date(post.created_at);
          const now = new Date();
          const diffMs = now.getTime() - postDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          if (diffMins < 1) {
            timeAgo = 'Just now';
          } else if (diffMins < 60) {
            timeAgo = `${diffMins}m ago`;
          } else if (diffHours < 24) {
            timeAgo = `${diffHours}h ago`;
          } else if (diffDays < 7) {
            timeAgo = `${diffDays}d ago`;
          } else {
            timeAgo = postDate.toLocaleDateString();
          }
        } catch (error) {
          console.error('Error formatting date:', error);
          timeAgo = 'Recently';
        }
        
        return {
          id: post.id,
          author: profile?.full_name || 'Unknown User',
          username: profile?.username || 'unknown',
          department: profile?.department || 'Unknown',
          content: post.content,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          reposts: repostsMap.get(post.id) || 0,
          timeAgo: timeAgo,
          avatar: profile?.avatar_url || '',
          image: post.media_urls?.[0] || undefined
        };
      });

      console.log('Formatted posts:', formattedPosts.length, formattedPosts);

      if (append) {
        setPosts(prev => [...prev, ...formattedPosts]);
      } else {
        setPosts(formattedPosts);
      }

      setHasMore(formattedPosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (!append) setPosts([]);
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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = new Date().getTime();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    
    if (scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;
      
      if (distance > 0) {
        setIsPulling(true);
        // Max pull distance is 120px for smooth effect
        setPullDistance(Math.min(distance, 120));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      fetchPosts().then(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }, 500);
      });
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts(); 
    setShowCreatePost(false);
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="min-h-screen bg-background pb-20 max-w-md mx-auto overflow-y-auto" 
      onScroll={handleScroll} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out"
          style={{ 
            transform: `translate(-50%, ${Math.min(pullDistance - 40, 40)}px)`,
            opacity: Math.min(pullDistance / 80, 1)
          }}
        >
          <div className="bg-background border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            {isRefreshing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-sm text-foreground">Refreshing...</span>
              </>
            ) : (
              <>
                <div 
                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full transition-transform"
                  style={{ transform: `rotate(${pullDistance * 3}deg)` }}
                ></div>
                <span className="text-sm text-foreground">
                  {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

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
              <img src="/unitex-logo.png" alt="UniteX" className="w-8 h-8" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={onNavigateToSettings}>
              <Settings className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-foreground text-xl">No posts yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Be the first to share something!
            </p>
            {totalPostsCount !== null && (
              <p className="text-xs text-muted-foreground">
                Debug: {totalPostsCount} posts found in database
              </p>
            )}
            <button 
              onClick={() => setShowCreatePost(true)}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Create Post
            </button>
          </div>
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
