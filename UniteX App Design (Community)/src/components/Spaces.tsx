import { useState, useEffect } from "react";
import { ArrowLeft, Radio, Users, Clock, Play, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const mockSpaces = [
  {
    id: 1,
    title: "AI & Machine Learning Discussion",
    host: {
      name: "Sydney Sweeny",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sydney",
    },
    listeners: 234,
    status: "live",
    topic: "Deep Learning",
  },
  {
    id: 2,
    title: "Startup Pitch Practice",
    host: {
      name: "Simran",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simran",
    },
    listeners: 156,
    status: "live",
    topic: "Entrepreneurship",
  },
  {
    id: 3,
    title: "Design System Best Practices",
    host: {
      name: "Deepak",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak",
    },
    scheduledFor: "Tomorrow at 3 PM",
    status: "scheduled",
    topic: "UI/UX",
  },
];

interface SpacesProps {
  onBack: () => void;
}

export default function Spaces({ onBack }: SpacesProps) {
  const [spaces, setSpaces] = useState(mockSpaces);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [spaceForm, setSpaceForm] = useState({
    title: "",
    description: "",
    topic: "",
    scheduled_for: ""
  });

  const handleJoinSpace = (spaceTitle: string) => {
    toast.success(`Joined ${spaceTitle}!`);
  };

  const handleCreateSpace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to create a space');
        return;
      }

      const { error } = await supabase
        .from('spaces')
        .insert({
          user_id: user.id,
          title: spaceForm.title,
          description: spaceForm.description,
          topic: spaceForm.topic,
          scheduled_for: spaceForm.scheduled_for || null,
          status: spaceForm.scheduled_for ? 'scheduled' : 'live'
        });

      if (error) throw error;

      toast.success('Space created successfully!');
      setShowCreateSpace(false);
      setSpaceForm({ title: "", description: "", topic: "", scheduled_for: "" });
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
    }
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
            <h1 className="text-foreground text-xl">Spaces</h1>
            <p className="text-muted-foreground text-sm">Audio conversations</p>
          </div>
          <button onClick={() => setShowCreateSpace(true)}>
            <Plus className="w-6 h-6 dark:text-blue-500 light:text-red-600" />
          </button>
        </div>
      </div>

      {/* Spaces List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-4"
      >
        {/* Live Spaces */}
        <div>
          <h2 className="text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Now
          </h2>
          {mockSpaces
            .filter((space) => space.status === "live")
            .map((space, index) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-blue-900/20 light:bg-gradient-to-br light:from-red-50 light:to-orange-50 rounded-2xl p-4 border dark:border-purple-500/20 light:border-red-200 mb-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 dark:border-purple-500 light:border-red-500">
                      <AvatarImage src={space.host.avatar} />
                      <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                        {space.host.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">{space.host.name}</p>
                      <h3 className="text-foreground">{space.title}</h3>
                    </div>
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                      <Radio className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{space.listeners} listening</span>
                    </div>
                    <Badge className="dark:bg-zinc-800 light:bg-white dark:text-zinc-300 light:text-gray-700 dark:border-zinc-700 light:border-gray-300 text-xs">
                      {space.topic}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleJoinSpace(space.title)}
                    className="w-full dark:bg-purple-500 dark:hover:bg-purple-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Join Space
                  </Button>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Scheduled Spaces */}
        <div>
          <h2 className="text-foreground mb-3">Scheduled</h2>
          {mockSpaces
            .filter((space) => space.status === "scheduled")
            .map((space, index) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200 mb-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={space.host.avatar} />
                      <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                        {space.host.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">{space.host.name}</p>
                      <h3 className="text-foreground">{space.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{space.scheduledFor}</span>
                  </div>

                  <Button
                    onClick={() => toast.success("Reminder set!")}
                    variant="outline"
                    className="w-full dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 light:border-gray-300 light:text-black light:hover:bg-gray-100 rounded-full"
                  >
                    Set Reminder
                  </Button>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Create Space Dialog */}
      <Dialog open={showCreateSpace} onOpenChange={setShowCreateSpace}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create a Space</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start an audio conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Space Title"
              value={spaceForm.title}
              onChange={(e) => setSpaceForm({...spaceForm, title: e.target.value})}
            />
            <Textarea
              placeholder="Description"
              value={spaceForm.description}
              onChange={(e) => setSpaceForm({...spaceForm, description: e.target.value})}
              className="min-h-[80px]"
            />
            <Input
              placeholder="Topic (e.g., AI, Startup, Design)"
              value={spaceForm.topic}
              onChange={(e) => setSpaceForm({...spaceForm, topic: e.target.value})}
            />
            <Input
              type="datetime-local"
              placeholder="Schedule for later (optional)"
              value={spaceForm.scheduled_for}
              onChange={(e) => setSpaceForm({...spaceForm, scheduled_for: e.target.value})}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateSpace(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSpace}
                disabled={!spaceForm.title || !spaceForm.description}
                className="flex-1 dark:bg-purple-500 dark:hover:bg-purple-600 light:bg-red-600 light:hover:bg-red-700 text-white"
              >
                Create Space
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
