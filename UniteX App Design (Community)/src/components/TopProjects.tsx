import { ArrowLeft, Trophy, TrendingUp, Heart, Users, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";

const mockTopProjects = [
  {
    rank: 1,
    title: "AI-Powered Mental Health Companion",
    owner: "Emma Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    department: "CS + Psychology",
    likes: 2456,
    members: 12,
    growth: "+245%",
    color: "from-yellow-500 to-orange-500",
  },
  {
    rank: 2,
    title: "Sustainable Campus Energy Grid",
    owner: "Ryan Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
    department: "Engineering",
    likes: 2103,
    members: 15,
    growth: "+189%",
    color: "from-gray-400 to-gray-500",
  },
  {
    rank: 3,
    title: "Student Startup Legal Framework",
    owner: "Sofia Martinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    department: "Law + Business",
    likes: 1987,
    members: 8,
    growth: "+167%",
    color: "from-amber-600 to-amber-700",
  },
  {
    rank: 4,
    title: "AR Campus Navigation System",
    owner: "Liam Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    department: "CS + Design",
    likes: 1823,
    members: 10,
    growth: "+142%",
    color: "",
  },
  {
    rank: 5,
    title: "Blockchain Student Credentials",
    owner: "Ava Williams",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava",
    department: "CS + Finance",
    likes: 1654,
    members: 9,
    growth: "+128%",
    color: "",
  },
  {
    rank: 6,
    title: "Smart Library Book Tracker",
    owner: "Noah Brown",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
    department: "IoT",
    likes: 1432,
    members: 7,
    growth: "+115%",
    color: "",
  },
  {
    rank: 7,
    title: "Food Waste Reduction App",
    owner: "Mia Taylor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
    department: "Business + CS",
    likes: 1298,
    members: 11,
    growth: "+98%",
    color: "",
  },
  {
    rank: 8,
    title: "Collaborative Study Spaces Platform",
    owner: "Ethan Anderson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan",
    department: "Design",
    likes: 1167,
    members: 6,
    growth: "+87%",
    color: "",
  },
  {
    rank: 9,
    title: "Campus Safety Alert System",
    owner: "Isabella White",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella",
    department: "Engineering + CS",
    likes: 1045,
    members: 13,
    growth: "+76%",
    color: "",
  },
  {
    rank: 10,
    title: "Student Mentorship Matching AI",
    owner: "Oliver Harris",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    department: "Data Science",
    likes: 998,
    members: 5,
    growth: "+65%",
    color: "",
  },
];

interface TopProjectsProps {
  onBack: () => void;
}

export default function TopProjects({ onBack }: TopProjectsProps) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 dark:text-white light:text-black" />
          </button>
          <div className="flex-1">
            <h1 className="dark:text-white light:text-black text-xl">Top Projects</h1>
            <p className="dark:text-zinc-500 light:text-gray-500 text-sm">October 2025</p>
          </div>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
      </div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-3"
      >
        {mockTopProjects.map((project, index) => (
          <motion.div
            key={project.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border ${
              project.rank <= 3 ? "dark:border-zinc-700 light:border-gray-300" : "dark:border-zinc-800 light:border-gray-200"
            }`}
          >
            {/* Top 3 Gradient Background */}
            {project.color && (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${project.color} opacity-5`}
              />
            )}

            <div className="relative flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {project.rank <= 3 ? (
                  <span className="text-3xl">{getMedalEmoji(project.rank)}</span>
                ) : (
                  <div className="w-10 h-10 rounded-full dark:bg-zinc-800 light:bg-gray-200 flex items-center justify-center">
                    <span className="dark:text-white light:text-black">{project.rank}</span>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <h3 className="dark:text-white light:text-black mb-1 truncate">{project.title}</h3>
                
                {/* Owner */}
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={project.avatar} />
                    <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-xs">
                      {project.owner.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="dark:text-zinc-400 light:text-gray-600 text-sm truncate">{project.owner}</span>
                </div>

                {/* Department Badge */}
                <Badge className="dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 light:bg-red-50 light:text-red-600 light:border-red-200 text-xs mb-2">
                  {project.department}
                </Badge>

                {/* Stats */}
                <div className="flex items-center gap-4 dark:text-zinc-400 light:text-gray-600 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 dark:text-pink-500 light:text-red-500 fill-current" />
                    <span>{project.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.members}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>{project.growth}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Info */}
      <div className="px-4 py-6 text-center space-y-2">
        <p className="dark:text-zinc-500 light:text-gray-500 text-sm">Rankings updated monthly</p>
        <p className="dark:text-zinc-600 light:text-gray-400 text-xs">
          Based on likes, shares, and team engagement
        </p>
      </div>
    </div>
  );
}
