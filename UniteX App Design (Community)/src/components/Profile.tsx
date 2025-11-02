import { useState } from "react";
import { Settings, MapPin, Calendar, Link as LinkIcon, Award, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import EditProfile from "./EditProfile";

interface ProfileProps {
  onNavigateToFollowers?: (tab: "followers" | "following", username: string, profileName: string) => void;
}

const mockProfile = {
  name: "Alex Johnson",
  username: "alexjohnson",
  email: "alex.johnson@jecrc.edu",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  department: "Computer Science",
  year: "3rd Year",
  bio: "Passionate about AI and machine learning. Looking to collaborate on innovative projects that make a difference. Open to cross-departmental teams!",
  location: "JECRC University",
  joined: "Joined January 2023",
  website: "alexjohnson.dev",
  followers: 234,
  following: 156,
  skills: ["React", "Python", "Machine Learning", "UI/UX", "Firebase"],
  achievements: [
    { icon: "🏆", title: "Top Contributor", description: "Most active member this month" },
    { icon: "⭐", title: "Project Leader", description: "Led 5 successful projects" },
    { icon: "🎯", title: "Collaborator Pro", description: "Joined 10+ teams" },
  ],
  projects: [
    {
      id: 1,
      title: "AI Study Assistant",
      status: "Active",
      team: 6,
      likes: 145,
    },
    {
      id: 2,
      title: "Campus Event Finder",
      status: "Completed",
      team: 4,
      likes: 89,
    },
    {
      id: 3,
      title: "Student Marketplace",
      status: "Active",
      team: 8,
      likes: 203,
    },
  ],
  posts: [
    {
      author: "Alex Johnson",
      username: "alexjohnson",
      department: "Computer Science",
      content: "Just published my thoughts on cross-departmental collaboration in tech startups. Check it out! 🚀 #collaboration #innovation",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      likes: 45,
      comments: 12,
      shares: 8,
      timeAgo: "2h",
    },
    {
      author: "Alex Johnson",
      username: "alexjohnson",
      department: "Computer Science",
      content: "Looking for a business student to help validate my AI-powered study assistant app! DM me if interested. #AI #startup #collaboration",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      likes: 67,
      comments: 23,
      shares: 15,
      timeAgo: "1d",
    },
    {
      author: "Alex Johnson",
      username: "alexjohnson",
      department: "Computer Science",
      content: "Excited to share that our campus navigation app prototype is ready for testing! 🎉",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      likes: 134,
      comments: 31,
      shares: 22,
      timeAgo: "3d",
    },
  ],
};

export default function Profile({ onNavigateToFollowers }: ProfileProps = {}) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileData, setProfileData] = useState(mockProfile)

  const handleSaveProfile = (updatedProfile: any) => {
    setProfileData(updatedProfile)
  }

  if (showEditProfile) {
    return (
      <EditProfile
        onBack={() => setShowEditProfile(false)}
        profile={profileData}
        onSave={handleSaveProfile}
      />
    )
  }
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="dark:text-white light:text-black text-xl">{mockProfile.name}</h1>
            <p className="dark:text-zinc-500 light:text-gray-500 text-sm">{mockProfile.projects.length} projects</p>
          </div>
          <Settings className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
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
              <span>{mockProfile.joined}</span>
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
            {profileData.posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard {...post} />
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="projects" className="m-0 p-4 space-y-3">
            {profileData.projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="dark:text-white light:text-black">{project.title}</h4>
                  <Badge className={`text-xs ${
                    project.status === "Active" 
                      ? "bg-green-500/10 text-green-400 border-green-500/20" 
                      : "dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 light:bg-gray-200 light:text-gray-700 light:border-gray-400"
                  }`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 dark:text-zinc-400 light:text-gray-600 text-sm">
                  <span>{project.team} members</span>
                  <span>{project.likes} likes</span>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
