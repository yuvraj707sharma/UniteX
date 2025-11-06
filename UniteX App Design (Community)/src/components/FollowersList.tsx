import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface User {
  name: string;
  username: string;
  avatar: string;
  department: string;
  bio: string;
  isFollowing: boolean;
}

const mockFollowers: User[] = [
  {
    name: "Sydney Sweeny",
    username: "sydneysweeny",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
    department: "CS",
    bio: "AI enthusiast | Building cool stuff",
    isFollowing: true,
  },
  {
    name: "Simran",
    username: "simran",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
    department: "Business",
    bio: "Entrepreneur | Sustainability advocate",
    isFollowing: true,
  },
  {
    name: "Dheemant Agarwal",
    username: "dheemant",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
    department: "Law",
    bio: "IP Law | Startup Legal Advisor",
    isFollowing: false,
  },
  {
    name: "Deepak",
    username: "deepak",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
    department: "Design",
    bio: "UI/UX Designer | Creative thinker",
    isFollowing: true,
  },
];

const mockFollowing: User[] = [
  {
    name: "James Wilson",
    username: "jameswilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    department: "Engineering",
    bio: "IoT Developer | Hardware enthusiast",
    isFollowing: true,
  },
  {
    name: "Sarah Chen",
    username: "sarahchen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    department: "CS",
    bio: "Full-stack developer | Open source contributor",
    isFollowing: true,
  },
  {
    name: "Michael Brown",
    username: "michaelbrown",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    department: "Business",
    bio: "Marketing strategist | Growth hacker",
    isFollowing: true,
  },
];

interface FollowersListProps {
  onBack: () => void;
  onNavigateToProfile?: (username: string) => void;
  initialTab?: "followers" | "following";
  username?: string;
  profileName?: string;
}

export default function FollowersList({ onBack, onNavigateToProfile, initialTab = "followers", username, profileName }: FollowersListProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowData();
  }, [username]);

  const fetchFollowData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUser(profile);

      // Fetch followers
      const { data: followersData } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey(id, full_name, username, department, bio, avatar_url)
        `)
        .eq('followed_id', user.id);

      // Fetch following
      const { data: followingData } = await supabase
        .from('follows')
        .select(`
          followed_id,
          profiles!follows_followed_id_fkey(id, full_name, username, department, bio, avatar_url)
        `)
        .eq('follower_id', user.id);

      const formattedFollowers = followersData?.map(f => ({
        name: f.profiles.full_name || 'Unknown',
        username: f.profiles.username || 'unknown',
        avatar: f.profiles.avatar_url || '',
        department: f.profiles.department || 'Unknown',
        bio: f.profiles.bio || 'No bio available',
        isFollowing: followingData?.some(fw => fw.followed_id === f.profiles.id) || false
      })) || [];

      const formattedFollowing = followingData?.map(f => ({
        name: f.profiles.full_name || 'Unknown',
        username: f.profiles.username || 'unknown',
        avatar: f.profiles.avatar_url || '',
        department: f.profiles.department || 'Unknown',
        bio: f.profiles.bio || 'No bio available',
        isFollowing: true
      })) || [];

      setFollowers(formattedFollowers);
      setFollowing(formattedFollowing);
    } catch (error) {
      console.error('Error fetching follow data:', error);
      // Fallback to mock data
      setFollowers(mockFollowers.slice(0, 2));
      setFollowing(mockFollowing.slice(0, 1));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = (username: string, type: "followers" | "following") => {
    if (type === "followers") {
      setFollowers(
        followers.map((user) =>
          user.username === username
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } else {
      setFollowing(
        following.map((user) =>
          user.username === username
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    }
    toast.success("Updated!");
  };

  const renderUserList = (users: User[], type: "followers" | "following") => (
    <div className="space-y-0">
      {users.map((user, index) => (
        <motion.div
          key={user.username}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border-b dark:border-zinc-800 light:border-gray-200 px-4 py-4 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors"
        >
          <div className="flex gap-3">
            <button
              onClick={() => onNavigateToProfile?.(user.username)}
              className="text-left"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onNavigateToProfile?.(user.username)}
                className="text-left block w-full"
              >
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate">{user.name}</span>
                  <Badge className="dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 light:bg-red-50 light:text-red-600 light:border-red-200 text-xs rounded-full">
                    {user.department}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">@{user.username}</p>
                <p className="text-foreground text-sm mt-1">{user.bio}</p>
              </button>
            </div>
            <Button
              onClick={() => handleFollowToggle(user.username, type)}
              variant={user.isFollowing ? "outline" : "default"}
              className={`rounded-full px-5 h-9 ${
                user.isFollowing
                  ? "bg-transparent dark:border-zinc-700 light:border-gray-300 dark:text-white light:text-black dark:hover:bg-zinc-900 dark:hover:border-red-500 dark:hover:text-red-500 light:hover:bg-red-50 light:hover:border-red-500 light:hover:text-red-600"
                  : "dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
              }`}
            >
              {user.isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="dark:text-white light:text-black text-xl">{profileName || currentUser?.full_name || 'Loading...'}</h1>
            <p className="dark:text-zinc-500 light:text-gray-500 text-sm">@{username || currentUser?.username || 'user'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={initialTab} className="w-full">
        <div className="sticky top-[65px] z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
          <TabsList className="w-full bg-transparent rounded-none h-12 p-0">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
            >
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
            >
              Following ({following.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="followers" className="m-0">
          {renderUserList(followers, "followers")}
        </TabsContent>

        <TabsContent value="following" className="m-0">
          {renderUserList(following, "following")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
