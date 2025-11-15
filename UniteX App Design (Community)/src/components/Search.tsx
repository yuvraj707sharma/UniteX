import { useState, useEffect } from "react";
import { Search as SearchIcon, X, Hash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { sanitizeSearchInput } from '../utils/sanitize';
import { supabase } from '../lib/supabase';

interface SearchProps {
  onNavigateToProfile?: (username: string) => void;
}



export default function Search({ onNavigateToProfile }: SearchProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("top");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchDatabase();
    } else {
      setUsers([]);
      setPosts([]);
    }
  }, [searchQuery]);

  const searchDatabase = async () => {
    try {
      setLoading(true);
      const query = searchQuery.toLowerCase();

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, username, department, avatar_url, bio')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,department.ilike.%${query}%`)
        .limit(10);

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(full_name, username, department, avatar_url)
        `)
        .ilike('content', `%${query}%`)
        .limit(10);

      setUsers(usersData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitizedQuery = sanitizeSearchInput(e.target.value);
      setSearchQuery(sanitizedQuery);
    } catch (error) {
      console.error('Error handling search input:', error);
    }
  };

  const filteredUsers = users.map(u => ({
    id: u.id,
    name: u.full_name,
    username: u.username,
    department: u.department,
    avatar: u.avatar_url,
    bio: u.bio
  }));

  const filteredPosts = posts.map(p => ({
    id: p.id,
    author: p.profiles.full_name,
    username: p.profiles.username,
    department: p.profiles.department,
    content: p.content,
    likes: p.likes_count || 0,
    comments: p.comments_count || 0,
    shares: p.shares_count || 0,
    timeAgo: new Date(p.created_at).toLocaleDateString(),
    avatar: p.profiles.avatar_url,
    image: p.media_urls?.[0]
  }));

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
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-foreground text-xl">Search UniteX</h2>
            <p className="text-muted-foreground max-w-sm">
              Find people, posts, and communities
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="top" className="m-0">
            <div className="space-y-4 p-4">
              {filteredUsers.length > 0 && (
                <div>
                  <h3 className="text-muted-foreground text-sm mb-2">People</h3>
                  {filteredUsers.slice(0, 5).map((user) => (
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
              {filteredUsers.length === 0 && filteredPosts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found</p>
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
