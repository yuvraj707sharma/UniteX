import { ArrowLeft, Shield, Users, Calendar, Tag, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";

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

const styles = {
  text: "dark:text-white light:text-black",
  mutedText: "dark:text-zinc-400 light:text-gray-600",
  card: "dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200",
  button: "w-full h-14 rounded-2xl",
  primaryButton: "dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white",
  secondaryButton: "bg-transparent dark:border-zinc-700 light:border-gray-300 dark:text-white light:text-black dark:hover:bg-zinc-900 light:hover:bg-gray-100"
};

export default function ProjectCollaboration({ onBack }: ProjectCollaborationProps) {
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 dark:text-white light:text-black" />
          </button>
          <h1 className="dark:text-white light:text-black text-xl">Project Details</h1>
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
            <h2 className={`${styles.text} text-2xl flex-1`}>{mockProject.title}</h2>
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
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                {mockProject.owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className={styles.text}>{mockProject.owner.name}</p>
              <div className="flex items-center gap-2">
                <span className="dark:text-zinc-500 light:text-gray-500 text-sm">@{mockProject.owner.username}</span>
                <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200 text-xs">
                  {mockProject.owner.department}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className={styles.text}>About the Project</h3>
          <p className={styles.mutedText}>{mockProject.description}</p>
        </div>

        {/* Departments Needed */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 ${styles.text}`}>
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
          <div className={`flex items-center gap-2 ${styles.text}`}>
            <Tag className="w-5 h-5" />
            <h3>Skills Required</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockProject.skillsNeeded.map((skill) => (
              <Badge
                key={skill}
                className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 light:bg-gray-100 light:text-gray-700 light:border-gray-300 rounded-full"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={styles.card}>
            <div className={`flex items-center gap-2 ${styles.mutedText} mb-1`}>
              <Users className="w-4 h-4" />
              <span className="text-sm">Team</span>
            </div>
            <p className={`${styles.text} text-xl`}>{mockProject.teamSize}</p>
          </div>

          <div className={styles.card}>
            <div className={`flex items-center gap-2 ${styles.mutedText} mb-1`}>
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Deadline</span>
            </div>
            <p className={`${styles.text} text-xl`}>{mockProject.deadline}</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className={`flex items-center gap-6 ${styles.mutedText} text-sm`}>
          <span>{mockProject.likes} likes</span>
          <span>{mockProject.applicants} applicants</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button className={`${styles.button} ${styles.primaryButton}`}>
            Apply to Join Project
          </Button>
          <Button
            variant="outline"
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            Contact Project Owner
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
