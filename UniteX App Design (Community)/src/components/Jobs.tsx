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
            <p className="text-muted-foreground text-sm">{jobs.length} opportunities</p>
          </div>
          <button 
            onClick={() => setShowPostJob(true)}
            className="p-2 dark:bg-blue-500 light:bg-red-600 text-white rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-foreground text-xl">No jobs available</h2>
            <p className="text-muted-foreground max-w-sm">
              Be the first to post a job opportunity!
            </p>
            <Button onClick={() => setShowPostJob(true)} className="mt-4">
              Post a Job
            </Button>
          </div>
        </div>
      )}

      {/* Post Job Dialog */}
      <Dialog open={showPostJob} onOpenChange={setShowPostJob}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Post a Job</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share an opportunity with the community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Job Title"
              value={jobForm.title}
              onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
            />
            <Input
              placeholder="Company Name"
              value={jobForm.company}
              onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
            />
            <Input
              placeholder="Location"
              value={jobForm.location}
              onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
            />
            <select
              value={jobForm.type}
              onChange={(e) => setJobForm({...jobForm, type: e.target.value as any})}
              className="w-full h-10 px-3 rounded-md border dark:bg-zinc-800 dark:border-zinc-700 light:bg-white light:border-gray-300 text-foreground"
            >
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
              <option value="full-time">Full-time</option>
              <option value="project">Project</option>
            </select>
            <Input
              placeholder="Salary (optional)"
              value={jobForm.salary}
              onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
            />
            <Textarea
              placeholder="Job Description"
              value={jobForm.description}
              onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
              className="min-h-[100px]"
            />
            <Textarea
              placeholder="Requirements (optional)"
              value={jobForm.requirements}
              onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
              className="min-h-[80px]"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPostJob(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostJob}
                disabled={!jobForm.title || !jobForm.company || !jobForm.description}
                className="flex-1 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
              >
                Post Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Submit your application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Resume *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 light:bg-white light:border-gray-300 text-foreground"
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Cover Note</label>
              <Textarea
                placeholder="Why are you interested in this position?"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowApplyDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!resumeFile}
                className="flex-1 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
