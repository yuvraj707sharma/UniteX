import { Search, Settings } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";

const mockCommunities = [
  {
    id: 1,
    name: "Computer Science",
    members: 1234,
    description: "AI, Web Dev, Mobile Apps, and more",
    joined: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Business & Entrepreneurship",
    members: 892,
    description: "Startups, Marketing, Finance",
    joined: false,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    name: "Design & Creative",
    members: 756,
    description: "UI/UX, Graphic Design, Animation",
    joined: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    name: "Engineering",
    members: 1089,
    description: "Mechanical, Electrical, Civil projects",
    joined: false,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    name: "Law & Legal Studies",
    members: 423,
    description: "IP, Contracts, Student Rights",
    joined: false,
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    name: "Data Science & Analytics",
    members: 678,
    description: "ML, Statistics, Data Visualization",
    joined: true,
    color: "from-teal-500 to-cyan-500",
  },
];

export default function Communities() {
  return (
    <div className="min-h-screen bg-black pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-white text-xl">Communities</h1>
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-zinc-400" />
            <Settings className="w-6 h-6 text-zinc-400" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-zinc-800 rounded-none h-12 p-0">
            <TabsTrigger
              value="joined"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-zinc-500 data-[state=active]:text-white"
            >
              Joined
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent text-zinc-500 data-[state=active]:text-white"
            >
              Explore
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Communities List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-3"
      >
        {mockCommunities.map((community, index) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
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
                <h3 className="text-white mb-1">{community.name}</h3>
                <p className="text-zinc-400 text-sm mb-2">{community.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">{community.members.toLocaleString()} members</span>
                  {community.joined && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      Joined
                    </Badge>
                  )}
                </div>
              </div>

              {/* Join Button */}
              {!community.joined && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 h-9"
                >
                  Join
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
