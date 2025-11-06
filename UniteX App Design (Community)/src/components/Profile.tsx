import { useState, useEffect } from "react";
import { Settings, MapPin, Calendar, Link as LinkIcon, Award, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import EditProfile from "./EditProfile";
import { supabase } from "../lib/supabase";

interface ProfileProps {
  onNavigateToFollowers?: (tab: "followers" | "following", username: string, profileName: string) => void;
  onNavigateToSettings?: () => void;
}



export default function Profile({ onNavigateToFollowers, onNavigateToSettings }: ProfileProps = {}) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch follower counts
      const { data: followers } = await supabase
        .from('follows')
        .select('id')
        .eq('followed_id', user.id);

      const { data: following } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id);

      // Format profile data
      const formattedProfile = {
        name: profile.full_name || 'Unknown User',
        username: profile.username || 'unknown',
        email: profile.email || '',
        avatar: profile.avatar_url || '',
        department: profile.department || 'Unknown Department',
        year: profile.year_of_study ? `${profile.year_of_study}${getOrdinalSuffix(profile.year_of_study)} Year` : 'Unknown Year',
        bio: profile.bio || 'No bio available',
        location: 'JECRC University',
        joined: `Joined ${new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        website: profile.portfolio_url || '',
        followers: followers?.length || 0,
        following: following?.length || 0,
        skills: profile.skills || [],
        achievements: [
          { icon: "🏆", title: "Active Member", description: "Joined the UniteX community" },
          { icon: "📝", title: "Content Creator", description: `Posted ${posts?.length || 0} times` },
          { icon: "🎯", title: "Collaborator", description: "Ready to work with others" },
        ],
        projects: [], // Will be populated from posts with project type
        posts: posts || []
      };

      setProfileData(formattedProfile);
      setUserPosts(posts || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't fallback to mock data, show the actual error
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  const handleSaveProfile = (updatedProfile: any) => {
    setProfileData(updatedProfile)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (showEditProfile) {
    return (
      <EditProfile
        onBack={() => {
          setShowEditProfile(false);
          fetchUserProfile(); // Refresh profile after edit
        }}
        profile={profileData}
        onSave={handleSaveProfile}
      />
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load profile</p>
          <button 
            onClick={fetchUserProfile}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="dark:text-white light:text-black text-xl">{profileData.name}</h1>
            <p className="dark:text-zinc-500 light:text-gray-500 text-sm">{userPosts.length} posts</p>
          </div>
          <button onClick={onNavigateToSettings}>
            <Settings className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Header */}
        <div className="px-4 pt-4 pb-4 border-b dark:border-zinc-800 light:border-gray-200">
          {/* Avatar and Stats */}
          <div className="flex items-start justify-between mb-4">
            <Avatar className="w-20 h-20 border-4 dark:border-zinc-800 light:border-gray-200">
              <AvatarImage src={profileData.avatar} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-2xl">
                {profileData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-4">
              <button onClick={() => onNavigateToFollowers?.("followers", profileData.username, profileData.name)} className="text-center">
                <p className="dark:text-white light:text-black text-xl">{profileData.followers}</p>
                <p className="dark:text-zinc-500 light:text-gray-500 text-sm">Followers</p>
              </button>
              <button onClick={() => onNavigateToFollowers?.("following", profileData.username, profileData.name)} className="text-center">
                <p className="dark:text-white light:text-black text-xl">{profileData.following}</p>
                <p className="dark:text-zinc-500 light:text-gray-500 text-sm">Following</p>
              </button>
            </div>
          </div>

          {/* Name and Department */}
          <div className="mb-3">
            <h2 className="dark:text-white light:text-black text-xl mb-1">{profileData.name}</h2>
            <p className="dark:text-zinc-500 light:text-gray-500">@{profileData.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200">
                {profileData.department}
              </Badge>
              <Badge className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 light:bg-gray-100 light:text-gray-700 light:border-gray-300">
                {profileData.year}
              </Badge>
            </div>
          </div>

          {/* Bio */}
          <p className="dark:text-white light:text-black mb-3">{profileData.bio}</p>

          {/* Meta Info */}
          <div className="space-y-2 dark:text-zinc-400 light:text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{profileData.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="dark:text-blue-400 light:text-red-600">{profileData.website}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{profileData.joined}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={() => setShowEditProfile(true)}
              className="flex-1 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent dark:border-zinc-700 light:border-gray-300 dark:text-white light:text-black dark:hover:bg-zinc-900 light:hover:bg-gray-100 rounded-full"
            >
              Share Profile
            </Button>
          </div>
        </div>

        {/* Skills */}
        <div className="px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200">
          <h3 className="dark:text-white light:text-black mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill) => (
              <Badge
                key={skill}
                className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 light:bg-gray-100 light:text-gray-700 light:border-gray-300 rounded-full"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200">
          <h3 className="dark:text-white light:text-black mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </h3>
          <div className="space-y-3">
            {profileData.achievements.map((achievement, index) => (
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

        {/* Posts & Projects Tabs */}
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
                author: profileData.name,
                username: profileData.username,
                department: profileData.department,
                content: post.content,
                avatar: profileData.avatar,
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
                <p className="text-sm text-muted-foreground mt-2">Share your first post to get started!</p>
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
                <p className="text-sm text-muted-foreground mt-2">Start your first project to collaborate with others!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
