import { useState, useEffect } from "react";
import { ArrowLeft, List, Plus, MoreVertical, Lock, Globe, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const mockLists = [
  {
    id: 1,
    name: "AI Enthusiasts",
    description: "People working on AI projects",
    memberCount: 12,
    isPrivate: false,
  },
  {
    id: 2,
    name: "Startup Founders",
    description: "Student entrepreneurs",
    memberCount: 8,
    isPrivate: true,
  },
  {
    id: 3,
    name: "Design Inspiration",
    description: "Best designers on campus",
    memberCount: 15,
    isPrivate: false,
  },
];

interface ListsProps {
  onBack: () => void;
}

export default function Lists({ onBack }: ListsProps) {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*, profiles(full_name, username)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setLists(mockLists);
    } finally {
      setLoading(false);
    }
  };
  const [showCreateList, setShowCreateList] = useState(false);
  const [showExploreList, setShowExploreList] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [listForm, setListForm] = useState({
    name: "",
    description: "",
    is_private: false
  });

  const handleCreateList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to create a list');
        return;
      }

      const { error } = await supabase
        .from('lists')
        .insert({
          user_id: user.id,
          name: listForm.name,
          description: listForm.description,
          is_private: listForm.is_private
        });

      if (error) throw error;

      toast.success('List created successfully!');
      setShowCreateList(false);
      setListForm({ name: "", description: "", is_private: false });
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    }
  };

  const handleDeleteList = (listId: number, listName: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId));
    toast.success(`Deleted ${listName}`);
  };

  const handleExploreList = (list: any) => {
    setSelectedList(list);
    setShowExploreList(true);
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
            <h1 className="text-foreground text-xl">Lists</h1>
            <p className="text-muted-foreground text-sm">{lists.length} lists</p>
          </div>
          <button onClick={() => setShowCreateList(true)}>
            <Plus className="w-6 h-6 dark:text-blue-500 light:text-red-600" />
          </button>
        </div>
      </div>

      {/* Lists */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-3"
      >
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : lists.length > 0 ? lists.map((list, index) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="dark:bg-zinc-900 light:bg-gray-50 rounded-2xl p-4 border dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 dark:bg-zinc-800 light:bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <List className="w-6 h-6 dark:text-blue-500 light:text-red-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-foreground">{list.name}</h3>
                  {list.is_private ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-2">{list.description || 'No description'}</p>
                <Badge className="dark:bg-zinc-800 light:bg-gray-200 dark:text-zinc-300 light:text-gray-700 dark:border-zinc-700 light:border-gray-300 text-xs">
                  {list.members_count || 0} members
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 dark:hover:bg-zinc-800 light:hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
                  <DropdownMenuItem onClick={() => handleExploreList(list)} className="dark:hover:bg-zinc-800 light:hover:bg-gray-100">
                    <Eye className="w-4 h-4 mr-2" />
                    Explore List
                  </DropdownMenuItem>
                  <DropdownMenuItem className="dark:hover:bg-zinc-800 light:hover:bg-gray-100">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit List
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteList(list.id, list.name)}
                    className="dark:hover:bg-zinc-800 light:hover:bg-gray-100 text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-foreground text-lg mb-2">No lists yet</h3>
            <p className="text-muted-foreground">Create your first list to organize people!</p>
          </div>
        )}
      </motion.div>

      {/* Create New List Button */}
      <div className="fixed bottom-24 right-4 max-w-md mx-auto">
        <Button
          onClick={() => setShowCreateList(true)}
          className="w-14 h-14 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Empty State */}
      {lists.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-foreground text-xl">No lists yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Create lists to organize people and stay updated
            </p>
            <Button
              onClick={() => setShowCreateList(true)}
              className="dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full px-6"
            >
              Create a list
            </Button>
          </div>
        </div>
      )}

      {/* Create List Dialog */}
      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create a List</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Organize people you want to follow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="List Name"
              value={listForm.name}
              onChange={(e) => setListForm({...listForm, name: e.target.value})}
            />
            <Textarea
              placeholder="Description"
              value={listForm.description}
              onChange={(e) => setListForm({...listForm, description: e.target.value})}
              className="min-h-[80px]"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={listForm.is_private}
                onChange={(e) => setListForm({...listForm, is_private: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="private" className="text-sm text-muted-foreground">
                Make this list private
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateList(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateList}
                disabled={!listForm.name}
                className="flex-1 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
              >
                Create List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Explore List Dialog */}
      <Dialog open={showExploreList} onOpenChange={setShowExploreList}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedList?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedList?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-muted-foreground">
                {selectedList?.members_count || 0} members in this list
              </p>
              <div className="mt-4 p-4 dark:bg-zinc-800 light:bg-gray-100 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Created by: {selectedList?.profiles?.full_name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Privacy: {selectedList?.is_private ? 'Private' : 'Public'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowExploreList(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
