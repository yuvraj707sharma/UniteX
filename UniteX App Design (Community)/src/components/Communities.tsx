import { useState, useEffect } from "react";
import { Search, Settings, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CommunityDetail from "./CommunityDetail";

const initialCommunities: any[] = [];

export default function Communities() {
  const [communities, setCommunities] = useState(initialCommunities);
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
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
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleJoinToggle = (communityId: number) => {
    setCommunities((prev) =>
      prev.map((community) => {
        if (community.id === communityId) {
          const newJoinedState = !community.joined;
          toast.success(
            newJoinedState
              ? `Joined ${community.name}!`
              : `Left ${community.name}`
          );
          return { ...community, joined: newJoinedState };
        }
        return community;
      })
    );
  };

  const joinedCommunities = communities.filter((c) => c.joined);
  const exploreCommunities = communities;

  const handleCommunityClick = (community: typeof initialCommunities[0]) => {
    setSelectedCommunity(community);
  };

  const handleToggleJoin = (communityId: number) => {
    setCommunities((prev) =>
      prev.map((community) => {
        if (community.id === communityId) {
          const newJoinedState = !community.joined;
          toast.success(
            newJoinedState
              ? `Joined ${community.name}!`
              : `Left ${community.name}`
          );
          // Update selected community if it's the one being toggled
          if (selectedCommunity?.id === communityId) {
            setSelectedCommunity({ ...community, joined: newJoinedState });
          }
          return { ...community, joined: newJoinedState };
        }
        return community;
      })
    );
  };

  // If a community is selected, show its detail view
  if (selectedCommunity) {
    return (
      <CommunityDetail
        community={selectedCommunity}
        onBack={() => setSelectedCommunity(null)}
        onToggleJoin={() => handleToggleJoin(selectedCommunity.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="dark:text-white light:text-black text-xl">Communities</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreateCommunity(true)}>
              <Plus className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
            </button>
            <button onClick={() => toast.info("Search communities coming soon!")}>
              <Search className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent border-b dark:border-zinc-800 light:border-gray-200 rounded-none h-12 p-0">
            <TabsTrigger
              value="joined"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
            >
              Joined ({joinedCommunities.length})
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
            >
              Explore
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Communities List */}
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="joined" className="m-0 p-4 space-y-3">
          {joinedCommunities.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-foreground text-xl">No communities joined yet</h2>
                <p className="text-muted-foreground max-w-sm">
                  Explore and join communities to connect with others
                </p>
              </div>
            </div>
          ) : (
            joinedCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCommunityClick(community)}
                className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200 dark:hover:border-zinc-700 light:hover:border-gray-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl">{community.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="dark:text-white light:text-black mb-1">{community.name}</h3>
                    <p className="dark:text-zinc-400 light:text-gray-600 text-sm mb-2">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="dark:text-zinc-500 light:text-gray-500 text-sm">
                        {community.members.toLocaleString()} members
                      </span>
                      <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200 text-xs">
                        Joined
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinToggle(community.id);
                    }}
                    variant="outline"
                    className="dark:bg-transparent dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 light:bg-transparent light:border-gray-300 light:text-black light:hover:bg-gray-100 rounded-full px-6 h-9"
                  >
                    Joined
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="explore" className="m-0 p-4 space-y-3">
          {exploreCommunities.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🏘️</div>
                <h2 className="text-foreground text-xl">No communities yet</h2>
                <p className="text-muted-foreground max-w-sm">
                  Be the first to create a community for your interests
                </p>
                <button 
                  onClick={() => setShowCreateCommunity(true)}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Create Community
                </button>
              </div>
            </div>
          ) : exploreCommunities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCommunityClick(community)}
              className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200 dark:hover:border-zinc-700 light:hover:border-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Community Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">
                    {community.name.charAt(0)}
                  </span>
                </div>

                {/* Community Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="dark:text-white light:text-black mb-1">{community.name}</h3>
                  <p className="dark:text-zinc-400 light:text-gray-600 text-sm mb-2">{community.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="dark:text-zinc-500 light:text-gray-500 text-sm">{community.members.toLocaleString()} members</span>
                    {community.joined && (
                      <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200 text-xs">
                        Joined
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinToggle(community.id);
                  }}
                  className={
                    community.joined
                      ? "dark:bg-transparent dark:border dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 light:bg-transparent light:border light:border-gray-300 light:text-black light:hover:bg-gray-100 rounded-full px-6 h-9"
                      : "dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full px-6 h-9"
                  }
                >
                  {community.joined ? "Joined" : "Join"}
                </Button>
              </div>
            </motion.div>
          ))}

        </TabsContent>
      </Tabs>

      {/* Create Community Modal */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create Community</h2>
            <div className="space-y-4">
              <input 
                placeholder="Community name"
                className="w-full p-3 border border-border rounded-lg bg-background"
              />
              <textarea 
                placeholder="Description"
                className="w-full h-24 p-3 border border-border rounded-lg bg-background resize-none"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => {
                  toast.success('Community created!');
                  setShowCreateCommunity(false);
                }}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Create
              </button>
              <button 
                onClick={() => setShowCreateCommunity(false)}
                className="px-4 py-2 border border-border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
