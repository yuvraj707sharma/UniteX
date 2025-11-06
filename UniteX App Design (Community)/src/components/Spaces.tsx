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
import SpaceRoom from "./SpaceRoom";

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

export default function Vartalaap({ onBack }: SpacesProps) {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    fetchSpaces();
    getCurrentUser();
  }, []);

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*, profiles(full_name, username)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setSpaces(mockSpaces);
    } finally {
      setLoading(false);
    }
  };
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [joinedSpace, setJoinedSpace] = useState<any>(null);
  const [spaceForm, setSpaceForm] = useState({
    title: "",
    description: "",
    topic: "",
    scheduled_for: ""
  });

  const handleDeleteSpace = async (spaceId: string, spaceName: string) => {
    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', spaceId);

      if (error) throw error;

      setSpaces((prev) => prev.filter((space) => space.id !== spaceId));
      toast.success(`Deleted ${spaceName}`);
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete space');
    }
  };

  const handleJoinSpace = async (space: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to join space');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('space_members')
        .select('id')
        .eq('space_id', space.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast.info('You are already a member of this space');
        return;
      }

      // Add user to space
      const { error } = await supabase
        .from('space_members')
        .insert({
          space_id: space.id,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      // Update member count
      await supabase
        .from('spaces')
        .update({ member_count: (space.member_count || 0) + 1 })
        .eq('id', space.id);

      toast.success(`Joined ${space.name}!`);
      setJoinedSpace(space);
    } catch (error) {
      console.error('Error joining space:', error);
      toast.error('Failed to join space');
    }
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
          created_by: user.id,
          name: spaceForm.title,
          description: spaceForm.description,
          topic: spaceForm.topic
        });

      if (error) throw error;

      toast.success('Space created successfully!');
      setShowCreateSpace(false);
      setSpaceForm({ title: "", description: "", topic: "", scheduled_for: "" });
      fetchSpaces();
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
    }
  };

  // Show SpaceRoom if user joined a space
  if (joinedSpace) {
    return (
      <SpaceRoom 
        space={joinedSpace} 
        onLeave={() => setJoinedSpace(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground text-xl">Vartalaap</h1>
            <p className="text-muted-foreground text-sm">Live voice conversations</p>
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
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* All Spaces */}
            <div>
              <h2 className="text-foreground mb-3">Live Vartalaap Rooms</h2>
              {spaces.length > 0 ? spaces.map((space, index) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-blue-900/20 light:bg-gradient-to-br light:from-red-50 light:to-orange-50 rounded-2xl p-4 border dark:border-purple-500/20 light:border-red-200 mb-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                        {space.profiles?.full_name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">{space.profiles?.full_name || 'Anonymous'}</p>
                      <h3 className="text-foreground">{space.name}</h3>
                    </div>
                  </div>

                  {space.description && (
                    <p className="text-muted-foreground text-sm">{space.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{space.member_count || 0} members</span>
                    </div>
                    {space.topic && (
                      <Badge className="dark:bg-zinc-800 light:bg-white dark:text-zinc-300 light:text-gray-700 dark:border-zinc-700 light:border-gray-300 text-xs">
                        {space.topic}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleJoinSpace(space)}
                      className="flex-1 dark:bg-purple-500 dark:hover:bg-purple-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Join Vartalaap
                    </Button>
                    {/* Show delete button only for space creator */}
                    {currentUser && space.created_by === currentUser.id && (
                      <Button
                        onClick={() => handleDeleteSpace(space.id, space.name)}
                        variant="outline"
                        className="px-3 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
              )) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎙️</div>
                  <h3 className="text-foreground text-lg mb-2">No Vartalaap rooms yet</h3>
                  <p className="text-muted-foreground">Start the first voice conversation!</p>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Create Space Dialog */}
      <Dialog open={showCreateSpace} onOpenChange={setShowCreateSpace}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Start Vartalaap</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Begin a live voice conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Vartalaap Title"
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
                Start Vartalaap
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
