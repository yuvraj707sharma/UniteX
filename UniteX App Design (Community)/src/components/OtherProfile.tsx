import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, Link as LinkIcon, Award, Briefcase, MoreVertical, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { toast } from "sonner";

interface OtherProfileProps {
  username: string;
  onBack: () => void;
  onNavigateToChat?: (user: { name: string; username: string; avatar: string }) => void;
  onNavigateToFollowers?: (username: string, profileName: string) => void;
}

// Mock data - in real app, this would be fetched based on username
const getUserData = (username: string) => {
  const users: Record<string, any> = {
    sydneysweeny: {
      name: "Sydney Sweeny",
      username: "sydneysweeny",
      email: "sydney.sweeny@university.edu",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
      department: "Computer Science",
      year: "4th Year",
      bio: "AI enthusiast and researcher. Building intelligent systems that make a difference. Always open to collaboration!",
      location: "University Campus",
      joined: "Joined September 2021",
      website: "sydneysweeny.dev",
      followers: 342,
      following: 189,
      isFollowing: true,
      skills: ["Python", "TensorFlow", "Machine Learning", "NLP", "Research"],
      achievements: [
        { icon: "🏆", title: "Research Excellence", description: "Published 3 papers" },
        { icon: "⭐", title: "Hackathon Winner", description: "Won 2 national hackathons" },
        { icon: "🎯", title: "Mentor", description: "Mentored 15+ students" },
      ],
      posts: [
        {
          author: "Sydney Sweeny",
          username: "sydneysweeny",
          department: "CS",
          content: "Looking for a business student to help validate my AI-powered study assistant app! 🚀",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
          likes: 45,
          comments: 12,
          shares: 8,
          timeAgo: "2h",
        },
        {
          author: "Sydney Sweeny",
          username: "sydneysweeny",
          department: "CS",
          content: "Just finished implementing a new neural network architecture for image recognition. Excited to share the results!",
          image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
          likes: 128,
          comments: 34,
          shares: 22,
          timeAgo: "1d",
        },
      ],
      projects: [
        { id: 1, title: "AI Study Assistant", status: "Active", team: 6, likes: 145 },
        { id: 2, title: "Smart Campus Navigator", status: "Active", team: 4, likes: 89 },
        { id: 3, title: "Student Marketplace", status: "Completed", team: 8, likes: 203 },
      ],
    },
    simran: {
      name: "Simran",
      username: "simran",
      email: "simran@university.edu",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
      department: "Business",
      year: "3rd Year",
      bio: "Passionate about sustainable business practices and social entrepreneurship. Let's create impact together! 🌱",
      location: "University Campus",
      joined: "Joined January 2022",
      website: "simran.business",
      followers: 256,
      following: 142,
      isFollowing: false,
      skills: ["Marketing", "Strategy", "Sustainability", "Leadership", "Analytics"],
      achievements: [
        { icon: "🏆", title: "Business Plan Winner", description: "1st place in competition" },
        { icon: "⭐", title: "Sustainability Leader", description: "Led 3 green initiatives" },
      ],
      posts: [
        {
          author: "Simran",
          username: "simran",
          department: "Business",
          content: "Excited to announce our campus sustainability project just got approved! Looking for engineering students to help design eco-friendly solutions.",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
          likes: 89,
          comments: 23,
          shares: 15,
          timeAgo: "4h",
        },
      ],
      projects: [
        { id: 1, title: "Green Campus Initiative", status: "Active", team: 12, likes: 234 },
        { id: 2, title: "Student Startup Incubator", status: "Active", team: 8, likes: 167 },
      ],
    },
    dheemant: {
      name: "Dheemant Agarwal",
      username: "dheemant",
      email: "dheemant@university.edu",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
      department: "Law",
      year: "Final Year",
      bio: "IP Law specialist | Helping student startups protect their innovations | Legal tech enthusiast",
      location: "Law School",
      joined: "Joined August 2020",
      website: "dheemantlaw.com",
      followers: 198,
      following: 87,
      isFollowing: false,
      skills: ["IP Law", "Contracts", "Legal Research", "Compliance", "Consulting"],
      achievements: [
        { icon: "🏆", title: "Moot Court Champion", description: "National winner 2023" },
        { icon: "⭐", title: "Legal Aid", description: "Helped 20+ startups" },
      ],
      posts: [
        {
          author: "Dheemant Agarwal",
          username: "dheemant",
          department: "Law",
          content: "Working on IP protection strategies for student startups. Any CS students with patentable ideas? Let's collaborate!",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dheemant",
          likes: 67,
          comments: 18,
          shares: 11,
          timeAgo: "6h",
        },
      ],
      projects: [
        { id: 1, title: "Student Startup Legal Guide", status: "Active", team: 3, likes: 156 },
      ],
    },
    deepak: {
      name: "Deepak",
      username: "deepak",
      email: "deepak@university.edu",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
      department: "Design",
      year: "3rd Year",
      bio: "UI/UX Designer crafting beautiful and intuitive experiences. Design thinking advocate. Let's make the world more beautiful!",
      location: "Design Studio",
      joined: "Joined February 2022",
      website: "deepakdesigns.com",
      followers: 412,
      following: 234,
      isFollowing: true,
      skills: ["UI/UX", "Figma", "Prototyping", "User Research", "Design Systems"],
      achievements: [
        { icon: "🏆", title: "Design Award", description: "Best UX project 2024" },
        { icon: "⭐", title: "Portfolio Excellence", description: "Featured on Behance" },
      ],
      posts: [
        {
          author: "Deepak",
          username: "deepak",
          department: "Design",
          content: "Just finished the UI mockups for a mental health awareness app. Need developers and psychology students to bring this to life.",
          image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
          likes: 134,
          comments: 31,
          shares: 24,
          timeAgo: "8h",
        },
      ],
      projects: [
        { id: 1, title: "Mental Health App", status: "Active", team: 5, likes: 289 },
        { id: 2, title: "Campus Design System", status: "Active", team: 3, likes: 167 },
      ],
    },
  };

  return users[username] || users.sydneysweeny; // Default fallback
};

export default function OtherProfile({ username, onBack, onNavigateToChat, onNavigateToFollowers }: OtherProfileProps) {
  const profile = getUserData(username);
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed" : "Following!");
  };

  const handleMessage = () => {
    if (onNavigateToChat) {
      onNavigateToChat({
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
      });
    } else {
      toast.success("Opening chat...");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div>
              <h1 className="dark:text-white light:text-black text-xl">{profile.name}</h1>
              <p className="dark:text-zinc-500 light:text-gray-500 text-sm">{profile.posts.length} posts</p>
            </div>
          </div>
          <button>
            <MoreVertical className="w-6 h-6 dark:text-zinc-400 light:text-gray-600" />
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

          {/* Name and Department */}
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

          {/* Bio */}
          <p className="dark:text-white light:text-black mb-3">{profile.bio}</p>

          {/* Meta Info */}
          <div className="space-y-2 dark:text-zinc-400 light:text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="dark:text-blue-400 light:text-red-600">{profile.website}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{profile.joined}</span>
            </div>
          </div>

          {/* Action Buttons */}
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

        {/* Skills */}
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

        {/* Achievements */}
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
            {profile.posts.map((post: any, index: number) => (
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
            {profile.projects.map((project: any, index: number) => (
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
                      ? "dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 light:bg-green-50 light:text-green-600 light:border-green-200"
                      : "dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 light:bg-gray-100 light:text-gray-600 light:border-gray-300"
                  }`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 dark:text-zinc-400 light:text-gray-600 text-sm">
                  <span>{project.team} members</span>
                  <span>❤️ {project.likes}</span>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
