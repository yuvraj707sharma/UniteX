import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const mockJobs = [
  {
    id: 1,
    title: "Full-Stack Developer Intern",
    company: "TechStartup Inc.",
    location: "Remote",
    type: "Internship",
    salary: "$15-20/hr",
    posted: "2 days ago",
    description: "Looking for a passionate full-stack developer to join our team.",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Design Studio",
    location: "Hybrid",
    type: "Part-time",
    salary: "$25-30/hr",
    posted: "1 week ago",
    description: "Create beautiful user experiences for our clients.",
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Analytics Co.",
    location: "On-site",
    type: "Internship",
    salary: "$18-22/hr",
    posted: "3 days ago",
    description: "Work on machine learning projects with real-world data.",
  },
];

interface JobsProps {
  onBack: () => void;
}

export default function Jobs({ onBack }: JobsProps) {
  const handleApply = (jobTitle: string) => {
    toast.success(`Application submitted for ${jobTitle}!`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground text-xl">Jobs</h1>
            <p className="text-muted-foreground text-sm">Student opportunities</p>
          </div>
          <Briefcase className="w-6 h-6 dark:text-blue-500 light:text-red-600" />
        </div>
      </div>

      {/* Jobs List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-3"
      >
        {mockJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-foreground mb-1">{job.title}</h3>
                  <p className="text-muted-foreground text-sm">{job.company}</p>
                </div>
                <Badge className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200">
                  {job.type}
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm">{job.description}</p>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.posted}</span>
                </div>
              </div>

              <Button
                onClick={() => handleApply(job.title)}
                className="w-full dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
              >
                Apply Now
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {mockJobs.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-foreground text-xl">No jobs available</h2>
            <p className="text-muted-foreground max-w-sm">
              Check back later for new opportunities
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
