import { Settings, MapPin, Calendar, Link as LinkIcon, Award, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";

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
};

export default function Profile() {
  return (
    <div className="min-h-screen bg-black pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-white text-xl">{mockProfile.name}</h1>
            <p className="text-zinc-500 text-sm">{mockProfile.projects.length} projects</p>
          </div>
          <Settings className="w-6 h-6 text-zinc-400" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Header */}
        <div className="px-4 pt-4 pb-4 border-b border-zinc-800">
          {/* Avatar and Stats */}
          <div className="flex items-start justify-between mb-4">
            <Avatar className="w-20 h-20 border-4 border-zinc-800">
              <AvatarImage src={mockProfile.avatar} />
              <AvatarFallback className="bg-zinc-800 text-white text-2xl">
                {mockProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-white text-xl">{mockProfile.followers}</p>
                <p className="text-zinc-500 text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-white text-xl">{mockProfile.following}</p>
                <p className="text-zinc-500 text-sm">Following</p>
              </div>
            </div>
          </div>

          {/* Name and Department */}
          <div className="mb-3">
            <h2 className="text-white text-xl mb-1">{mockProfile.name}</h2>
            <p className="text-zinc-500">@{mockProfile.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {mockProfile.department}
              </Badge>
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
                {mockProfile.year}
              </Badge>
            </div>
          </div>

          {/* Bio */}
          <p className="text-white mb-3">{mockProfile.bio}</p>

          {/* Meta Info */}
          <div className="space-y-2 text-zinc-400 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{mockProfile.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="text-blue-400">{mockProfile.website}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{mockProfile.joined}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full">
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-zinc-700 text-white hover:bg-zinc-900 rounded-full"
            >
              Share Profile
            </Button>
          </div>
        </div>

        {/* Skills */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <h3 className="text-white mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {mockProfile.skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <h3 className="text-white mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </h3>
          <div className="space-y-3">
            {mockProfile.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <p className="text-white">{achievement.title}</p>
                  <p className="text-zinc-400 text-sm">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts & Projects Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <div className="sticky top-[57px] z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
            <TabsList className="w-full bg-transparent rounded-none h-12 p-0">
              <TabsTrigger
                value="posts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-zinc-500 data-[state=active]:text-white"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-zinc-500 data-[state=active]:text-white"
              >
                Projects
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="posts" className="m-0">
            {/* User Posts */}
            <div className="border-b border-zinc-800 px-4 py-4 hover:bg-zinc-950 transition-colors">
              <p className="text-white mb-2">
                Just published my thoughts on cross-departmental collaboration in tech startups. Check it out! 🚀
              </p>
              <div className="flex items-center gap-6 text-zinc-500 text-sm">
                <span>2h ago</span>
                <span>45 likes</span>
                <span>12 comments</span>
              </div>
            </div>
            <div className="border-b border-zinc-800 px-4 py-4 hover:bg-zinc-950 transition-colors">
              <p className="text-white mb-2">
                Looking for a business student to help validate my AI-powered study assistant app! 
              </p>
              <div className="flex items-center gap-6 text-zinc-500 text-sm">
                <span>1d ago</span>
                <span>67 likes</span>
                <span>23 comments</span>
              </div>
            </div>
            <div className="border-b border-zinc-800 px-4 py-4 hover:bg-zinc-950 transition-colors">
              <p className="text-white mb-2">
                Excited to share that our campus navigation app prototype is ready for testing! 
              </p>
              <div className="rounded-2xl overflow-hidden my-3 border border-zinc-800">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" 
                  alt="Post" 
                  className="w-full h-auto" 
                />
              </div>
              <div className="flex items-center gap-6 text-zinc-500 text-sm">
                <span>3d ago</span>
                <span>134 likes</span>
                <span>31 comments</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="m-0 p-4 space-y-3">
            {mockProfile.projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white">{project.title}</h4>
                  <Badge className={`text-xs ${
                    project.status === "Active" 
                      ? "bg-green-500/10 text-green-400 border-green-500/20" 
                      : "bg-zinc-700 text-zinc-300 border-zinc-600"
                  }`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-zinc-400 text-sm">
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
