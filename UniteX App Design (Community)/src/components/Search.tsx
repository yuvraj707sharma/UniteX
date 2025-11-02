import { useState } from "react";
import { Search as SearchIcon, X, Hash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { sanitizeSearchInput } from '../utils/sanitize';

interface SearchProps {
  onNavigateToProfile?: (username: string) => void;
}

const mockUsers = [
  {
    id: 1,
    name: "Sydney Sweeny",
    username: "sydneysweeny",
    department: "CS",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
    bio: "AI enthusiast & full-stack developer",
  },
  {
    id: 2,
    name: "Simran",
    username: "simran",
    department: "Business",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
    bio: "Sustainability advocate",
  },
  {
    id: 3,
    name: "Dheemant Agarwal",
    username: "dheemant",
    department: "Law",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
    bio: "IP law specialist",
  },
];

const mockCommunities = [
  {
    id: 1,
    name: "Computer Science",
    members: 1234,
    description: "AI, Web Dev, Mobile Apps, and more",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Business & Entrepreneurship",
    members: 892,
    description: "Startups, Marketing, Finance",
    color: "from-green-500 to-emerald-500",
  },
];

const mockPosts = [
  {
    id: 1,
    author: "Sydney Sweeny",
    username: "sydneysweeny",
    department: "CS",
    content: "Looking for a business student to help validate my AI-powered study assistant app! #AI #Collaboration",
    likes: 45,
    comments: 12,
    shares: 8,
    timeAgo: "2h",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
  },
];

const trendingHashtags = [
  { tag: "AI", posts: 234 },
  { tag: "Collaboration", posts: 189 },
  { tag: "Startup", posts: 156 },
  { tag: "Innovation", posts: 143 },
  { tag: "TechForGood", posts: 98 },
];

export default function Search({ onNavigateToProfile }: SearchProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("top");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitizedQuery = sanitizeSearchInput(e.target.value);
      setSearchQuery(sanitizedQuery);
    } catch (error) {
      console.error('Error handling search input:', error);
    }
  };

  const safeSearchQuery = sanitizeSearchInput(searchQuery);

  const filteredUsers = mockUsers.filter((user) => {
    try {
      if (!safeSearchQuery) return false;
      const query = safeSearchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error('Error filtering users:', error);
      return false;
    }
  });

  const filteredCommunities = mockCommunities.filter((community) => {
    try {
      if (!safeSearchQuery) return false;
      const query = safeSearchQuery.toLowerCase();
      return (
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error('Error filtering communities:', error);
      return false;
    }
  });

  const filteredPosts = mockPosts.filter((post) => {
    try {
      if (!safeSearchQuery) return false;
      const query = safeSearchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error('Error filtering posts:', error);
      return false;
    }
  });

  const filteredHashtags = trendingHashtags.filter((hashtag) => {
    try {
      if (!safeSearchQuery) return false;
      return hashtag.tag.toLowerCase().includes(safeSearchQuery.toLowerCase());
    } catch (error) {
      console.error('Error filtering hashtags:', error);
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search UniteX"
              value={searchQuery}
              onChange={handleSearchChange}
              maxLength={100}
              className="w-full pl-12 pr-10 py-3 dark:bg-zinc-900 dark:border-zinc-800 light:bg-gray-100 light:border-gray-300 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:border-zinc-700 light:focus:border-gray-400 border"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-transparent border-b dark:border-zinc-800 light:border-gray-200 rounded-none h-12 p-0">
              <TabsTrigger
                value="top"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                Top
              </TabsTrigger>
              <TabsTrigger
                value="people"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                People
              </TabsTrigger>
              <TabsTrigger
                value="communities"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                Communities
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                Posts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {!searchQuery ? (
        // Trending Section
        <div className="p-4">
          <h2 className="text-foreground text-xl mb-4">Trending Hashtags</h2>
          <div className="space-y-3">
            {trendingHashtags.map((hashtag, index) => (
              <motion.button
                key={hashtag.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  try {
                    const hashtagQuery = `#${hashtag.tag}`;
                    setSearchQuery(sanitizeSearchInput(hashtagQuery));
                  } catch (error) {
                    console.error('Error setting hashtag search:', error);
                  }
                }}
                className="w-full p-4 dark:bg-zinc-900 light:bg-gray-50 rounded-2xl border dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 dark:text-blue-500 light:text-red-600" />
                  <div className="flex-1">
                    <p className="text-foreground">#{hashtag.tag}</p>
                    <p className="text-muted-foreground text-sm">
                      {hashtag.posts} posts
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="top" className="m-0">
            <div className="space-y-4 p-4">
              {/* People Results */}
              {filteredUsers.length > 0 && (
                <div>
                  <h3 className="text-muted-foreground text-sm mb-2">People</h3>
                  {filteredUsers.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onNavigateToProfile?.(user.username)}
                      className="w-full flex items-center gap-3 p-3 dark:hover:bg-zinc-900 light:hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-foreground">{user.name}</p>
                        <p className="text-muted-foreground text-sm">@{user.username}</p>
                      </div>
                      <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200 text-xs">
                        {user.department}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Communities Results */}
              {filteredCommunities.length > 0 && (
                <div>
                  <h3 className="text-muted-foreground text-sm mb-2">Communities</h3>
                  {filteredCommunities.slice(0, 2).map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center gap-3 p-3 dark:hover:bg-zinc-900 light:hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${community.color} flex items-center justify-center`}>
                        <span className="text-xl">{community.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{community.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {community.members.toLocaleString()} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="people" className="m-0">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onNavigateToProfile?.(user.username)}
                className="w-full flex items-start gap-3 p-4 border-b dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-foreground">{user.name}</p>
                    <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200 text-xs">
                      {user.department}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">@{user.username}</p>
                  <p className="text-muted-foreground text-sm mt-1">{user.bio}</p>
                </div>
              </button>
            ))}
          </TabsContent>

          <TabsContent value="communities" className="m-0 p-4">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200 mb-3"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl">{community.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">{community.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {community.description}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {community.members.toLocaleString()} members
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="posts" className="m-0">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
