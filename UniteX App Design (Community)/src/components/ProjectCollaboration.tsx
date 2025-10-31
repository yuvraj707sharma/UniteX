import { ArrowLeft, Shield, Users, Calendar, Tag, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "motion/react";

const mockProject = {
  title: "AI-Powered Campus Navigation System",
  description: "Developing an intelligent navigation app for JECRC campus that uses AR and machine learning to help students find classrooms, labs, and facilities. The app will include real-time crowd density tracking, optimal route suggestions, and accessibility features for students with disabilities.",
  owner: {
    name: "Rahul Verma",
    username: "rahulverma",
    department: "CS",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
  },
  departmentsNeeded: ["Design", "Business", "Data Science"],
  skillsNeeded: ["React Native", "Python", "UI/UX", "Market Research"],
  teamSize: "4/8 members",
  deadline: "Dec 15, 2025",
  verified: true,
  likes: 234,
  applicants: 47,
};

interface ProjectCollaborationProps {
  onBack: () => void;
}

export default function ProjectCollaboration({ onBack }: ProjectCollaborationProps) {
  return (
    <div className="min-h-screen bg-black pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">Project Details</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-6"
      >
        {/* Project Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-white text-2xl flex-1">{mockProject.title}</h2>
            {mockProject.verified && (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={mockProject.owner.avatar} />
              <AvatarFallback className="bg-zinc-800 text-white">
                {mockProject.owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white">{mockProject.owner.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm">@{mockProject.owner.username}</span>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                  {mockProject.owner.department}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-white">About the Project</h3>
          <p className="text-zinc-400">{mockProject.description}</p>
        </div>

        {/* Departments Needed */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            <h3>Departments Needed</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockProject.departmentsNeeded.map((dept) => (
              <Badge
                key={dept}
                className="bg-purple-500/10 text-purple-400 border-purple-500/20 rounded-full"
              >
                {dept}
              </Badge>
            ))}
          </div>
        </div>

        {/* Skills Needed */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white">
            <Tag className="w-5 h-5" />
            <h3>Skills Required</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockProject.skillsNeeded.map((skill) => (
              <Badge
                key={skill}
                className="bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Team</span>
            </div>
            <p className="text-white text-xl">{mockProject.teamSize}</p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Deadline</span>
            </div>
            <p className="text-white text-xl">{mockProject.deadline}</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-6 text-zinc-400 text-sm">
          <span>{mockProject.likes} likes</span>
          <span>{mockProject.applicants} applicants</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl">
            Apply to Join Project
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 bg-transparent border-zinc-700 text-white hover:bg-zinc-900 rounded-2xl"
          >
            Contact Project Owner
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
