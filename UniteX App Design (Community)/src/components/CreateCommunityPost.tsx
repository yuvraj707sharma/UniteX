import { useState } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface CreateCommunityPostProps {
  communityId: string;
  communityName: string;
  currentUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreateCommunityPost({
  communityId,
  communityName,
  currentUser,
  onClose,
  onPostCreated,
}: CreateCommunityPostProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!content.trim()) {
        toast.error('Please enter some content');
        return;
      }

      if (content.length > 500) {
        toast.error('Post is too long (max 500 characters)');
        return;
      }

      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to post');
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          author_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      toast.success('Post created!');
      setContent('');
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background rounded-2xl w-full max-w-lg mt-20 mb-20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800 light:border-gray-200">
            <h2 className="text-lg font-semibold">Post to {communityName}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening in this community?"
                  className="min-h-[120px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                  maxLength={500}
                  autoFocus
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-full transition-colors"
                      title="Add image (coming soon)"
                      disabled
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {content.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t dark:border-zinc-800 light:border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
