import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Link as LinkIcon, Award, Briefcase, MoreVertical, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { toast } from "sonner";
import { supabase } from '../lib/supabase';

interface OtherProfileProps {
  username: string;
  onBack: () => void;
  onNavigateToChat?: (user: { name: string; username: string; avatar: string }) => void;
  onNavigateToFollowers?: (username: string, profileName: string) => void;
}

export default function OtherProfile({ username, onBack, onNavigateToChat, onNavigateToFollowers }: OtherProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });

      const { data: followers } = await supabase
        .from('follows')
        .select('id')
        .eq('followed_id', profileData.id);

      const { data: following } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', profileData.id);

      if (currentUser) {
        const { data: followStatus } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('followed_id', profileData.id)
          .single();
        
        setIsFollowing(!!followStatus);
      }

      setProfile({
        name: profileData.full_name || 'Unknown User',
        username: profileData.username || 'unknown',
        email: profileData.email || '',
        avatar: profileData.avatar_url || '',
        department: profileData.department || 'Unknown',
        year: profileData.year_of_study ? `${profileData.year_of_study}${getOrdinalSuffix(profileData.year_of_study)} Year` : 'Unknown',
        bio: profileData.bio || 'No bio available',
        location: 'JECRC University',
        joined: `Joined ${new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        website: profileData.portfolio_url || '',
        followers: followers?.length || 0,
        following: following?.length || 0,
        skills: profileData.skills || [],
        achievements: [
          { icon: "🏆", title: "Active Member", description: "Part of UniteX community" },
          { icon: "📝", title: "Content Creator", description: `Posted ${posts?.length || 0} times` },
        ],
        posts: posts || []
      });

      setUserPosts(posts || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  const handleFollowToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to follow');
        return;
      }

      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (!targetProfile) return;

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', targetProfile.id);
        toast.success('Unfollowed');
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            followed_id: targetProfile.id
          });
        toast.success('Following!');
      }

      setIsFollowing(!isFollowing);
      fetchUserProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleMessage = () => {
    if (onNavigateToChat && profile) {
      onNavigateToChat({
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">User not found</p>
          <button onClick={onBack} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div>
              <h1 className="dark:text-white light:text-black text-xl">{profile.name}</h1>
              <p className="dark:text-zinc-500 light:text-gray-500 text-sm">{userPosts.length} posts</p>
            </div>
          </div>
          <button>
            <MoreVertical className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="px-4 pt-4 pb-4 border-b dark:border-zinc-800 light:border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <Avatar className="w-20 h-20 border-4 dark:border-zinc-800 light:border-gray-200">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-2xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-4">
              <button onClick={() => onNavigateToFollowers?.(username, profile.name)} className="text-center">
                <p className="dark:text-white light:text-black text-xl">{profile.followers}</p>
                <p className="dark:text-zinc-500 light:text-gray-500 text-sm">Followers</p>
              </button>
              <button onClick={() => onNavigateToFollowers?.(username, profile.name)} className="text-center">
                <p className="dark:text-white light:text-black text-xl">{profile.following}</p>
                <p className="dark:text-zinc-500 light:text-gray-500 text-sm">Following</p>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <h2 className="dark:text-white light:text-black text-xl mb-1">{profile.name}</h2>
            <p className="dark:text-zinc-500 light:text-gray-500">@{profile.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200">
                {profile.department}
              </Badge>
              <Badge className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 light:bg-gray-100 light:text-gray-700 light:border-gray-300">
                {profile.year}
              </Badge>
            </div>
          </div>

          <p className="dark:text-white light:text-black mb-3">{profile.bio}</p>

          <div className="space-y-2 dark:text-zinc-400 light:text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
            {profile.website && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <span className="dark:text-blue-400 light:text-red-600">{profile.website}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{profile.joined}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleFollowToggle}
              variant={isFollowing ? "outline" : "default"}
              className={`flex-1 rounded-full ${
                isFollowing
                  ? "bg-transparent dark:border-zinc-700 light:border-gray-300 dark:text-white light:text-black dark:hover:bg-zinc-900 dark:hover:border-red-500 dark:hover:text-red-500 light:hover:bg-red-50 light:hover:border-red-500 light:hover:text-red-600"
                  : "dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              onClick={handleMessage}
              variant="outline"
              className="flex-1 bg-transparent dark:border-zinc-700 light:border-gray-300 dark:text-white light:text-black dark:hover:bg-zinc-900 light:hover:bg-gray-100 rounded-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        {profile.skills.length > 0 && (
          <div className="px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200">
            <h3 className="dark:text-white light:text-black mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <Badge
                  key={skill}
                  className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 light:bg-gray-100 light:text-gray-700 light:border-gray-300 rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200">
          <h3 className="dark:text-white light:text-black mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </h3>
          <div className="space-y-3">
            {profile.achievements.map((achievement: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <p className="dark:text-white light:text-black">{achievement.title}</p>
                  <p className="dark:text-zinc-400 light:text-gray-600 text-sm">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <div className="sticky top-[57px] z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
            <TabsList className="w-full bg-transparent rounded-none h-12 p-0">
              <TabsTrigger
                value="posts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                Projects
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="posts" className="m-0">
            {userPosts.length > 0 ? userPosts.map((post, index) => {
              const formattedPost = {
                id: post.id,
                author: profile.name,
                username: profile.username,
                department: profile.department,
                content: post.content,
                avatar: profile.avatar,
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                shares: post.shares_count || 0,
                timeAgo: new Date(post.created_at).toLocaleDateString(),
                image: post.media_urls?.[0] || undefined
              };
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard {...formattedPost} />
                </motion.div>
              );
            }) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="m-0 p-4 space-y-3">
            {userPosts.filter(post => post.post_type === 'project').length > 0 ? (
              userPosts.filter(post => post.post_type === 'project').map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="dark:text-white light:text-black">{project.project_title || 'Untitled Project'}</h4>
                    <Badge className={`text-xs ${
                      project.project_status === "active"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 light:bg-gray-200 light:text-gray-700 light:border-gray-400"
                    }`}>
                      {project.project_status || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.content}</p>
                  <div className="flex items-center gap-4 dark:text-zinc-400 light:text-gray-600 text-sm">
                    <span>{project.team_size_needed || 0} members needed</span>
                    <span>{project.likes_count || 0} likes</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-muted-foreground">No projects yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
