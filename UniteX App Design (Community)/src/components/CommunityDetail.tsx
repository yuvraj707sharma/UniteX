import { useState, useEffect } from "react";
import { ArrowLeft, Users, Bell, BellOff, MoreVertical, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PostCard from "./PostCard";
import { supabase } from "../lib/supabase";

interface CommunityDetailProps {
  community: {
    id: string;
    name: string;
    members: number;
    description: string;
    joined: boolean;
    color: string;
  };
  onBack: () => void;
  onToggleJoin: () => void;
}

export default function CommunityDetail({ community, onBack, onToggleJoin }: CommunityDetailProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
    fetchPosts();
  }, [community.id]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          id,
          user_id,
          joined_at,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('community_id', community.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const formattedMembers = data?.map(member => ({
        id: member.user_id,
        name: member.profiles?.full_name || 'Unknown User',
        username: member.profiles?.username || 'unknown',
        avatar: member.profiles?.avatar_url || '',
        role: 'Member' // You can add role logic later
      })) || [];

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      // For now, posts don't have community_id field
      // This will be implemented when community posts feature is added
      setPosts([]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      notificationsEnabled
        ? "Notifications disabled for this community"
        : "Notifications enabled for this community"
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl flex-1 text-center">{community.name}</h1>
          <button onClick={() => setSearchQuery(searchQuery ? "" : "search")}>
            <Search className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Community Header */}
      <div className="px-4 py-6 border-b dark:border-zinc-800 light:border-gray-200">
        {/* Cover/Icon */}
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${community.color} flex items-center justify-center mb-4`}>
          <span className="text-4xl">{community.name.charAt(0)}</span>
        </div>

        {/* Info */}
        <h2 className="text-foreground text-2xl mb-2">{community.name}</h2>
        <p className="text-muted-foreground mb-4">{community.description}</p>

        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Users className="w-4 h-4" />
          <span>{community.members.toLocaleString()} members</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onToggleJoin}
            className={
              community.joined
                ? "dark:bg-transparent dark:border dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 light:bg-transparent light:border light:border-gray-300 light:text-black light:hover:bg-gray-100 rounded-full flex-1"
                : "dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full flex-1"
            }
          >
            {community.joined ? "Joined" : "Join"}
          </Button>
          <Button
            onClick={toggleNotifications}
            variant="outline"
            className="dark:bg-transparent dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 light:bg-transparent light:border-gray-300 light:text-black light:hover:bg-gray-100 rounded-full px-4"
          >
            {notificationsEnabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {searchQuery && (
        <div className="px-4 py-3 border-b dark:border-zinc-800 light:border-gray-200">
          <input
            type="text"
            value={searchQuery === "search" ? "" : searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "posts" ? "Search posts..." : "Search members..."}
            autoFocus
            className="w-full px-4 py-2 dark:bg-zinc-900 light:bg-gray-100 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:ring-2 dark:focus:ring-blue-500 light:focus:ring-2 light:focus:ring-red-600"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent border-b dark:border-zinc-800 light:border-gray-200 rounded-none h-12 p-0 sticky top-16 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl">
          <TabsTrigger
            value="posts"
            className="flex-1 rounded-none border-b-2 border-transparent dark:data-[state=active]:border-blue-500 light:data-[state=active]:border-red-600 data-[state=active]:bg-transparent bg-transparent text-muted-foreground dark:data-[state=active]:text-white light:data-[state=active]:text-black"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex-1 rounded-none border-b-2 border-transparent dark:data-[state=active]:border-blue-500 light:data-[state=active]:border-red-600 data-[state=active]:bg-transparent bg-transparent text-muted-foreground dark:data-[state=active]:text-white light:data-[state=active]:text-black"
          >
            Members
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="m-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {posts.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-foreground text-xl">No posts yet</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Be the first to post in this community!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Community posts feature coming soon)
                  </p>
                </div>
              </div>
            ) : (
              posts
                .filter((post) => {
                  if (!searchQuery || searchQuery === "search") return true;
                  return (
                    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.author?.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                })
                .map((post, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard {...post} />
                  </motion.div>
                ))
            )}
          </motion.div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="m-0 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {members.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">👥</div>
                    <h2 className="text-foreground text-xl">No members yet</h2>
                    <p className="text-muted-foreground max-w-sm">
                      Be the first to join this community!
                    </p>
                  </div>
                </div>
              ) : (
                members
                  .filter((member) => {
                    if (!searchQuery || searchQuery === "search") return true;
                    return (
                      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      member.username.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-900 light:bg-gray-50 border dark:border-zinc-800 light:border-gray-200"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">{member.name}</p>
                        <p className="text-muted-foreground text-sm">@{member.username}</p>
                      </div>
                      <span className="text-xs dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 px-3 py-1 rounded-full">
                        {member.role}
                      </span>
                    </motion.div>
                  ))
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
