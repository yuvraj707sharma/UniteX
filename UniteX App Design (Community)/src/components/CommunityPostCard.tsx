import { useState } from "react";
import { Heart, MessageCircle, Share2, Trash2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface CommunityPostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  mediaUrls?: string[];
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  isLiked: boolean;
  isAdmin: boolean;
  isAuthor: boolean;
  onDelete?: () => void;
  onLikeToggle?: () => void;
}

export default function CommunityPostCard({
  id,
  author,
  content,
  mediaUrls,
  likesCount: initialLikes,
  commentsCount,
  timeAgo,
  isLiked: initialIsLiked,
  isAdmin,
  isAuthor,
  onDelete,
  onLikeToggle,
}: CommunityPostCardProps) {
  const [liked, setLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to like');
        return;
      }

      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setLiked(false);
        setLikes(likes - 1);
        onLikeToggle?.();
      } else {
        // Like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: id,
            user_id: user.id,
          });

        if (error) throw error;

        setLiked(true);
        setLikes(likes + 1);
        onLikeToggle?.();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Post deleted');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-background border-b dark:border-zinc-800 light:border-gray-200 px-4 py-4"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-10 h-10">
          <AvatarImage src={author.avatar} />
          <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
            {author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">{author.name}</span>
              <span className="text-muted-foreground text-sm">@{author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>

            {/* More Menu (for admin or author) */}
            {(isAdmin || isAuthor) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Post'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post Content */}
          <p className="text-foreground mb-3 whitespace-pre-wrap">{content}</p>

          {/* Media */}
          {mediaUrls && mediaUrls.length > 0 && (
            <div className="rounded-2xl overflow-hidden mb-3 border dark:border-zinc-800 light:border-gray-200">
              <img
                src={mediaUrls[0]}
                alt="Post media"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 text-muted-foreground mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors group ${
                liked ? "text-pink-500" : "hover:text-pink-500"
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                liked ? "bg-pink-500/10" : "group-hover:bg-pink-500/10"
              }`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </div>
              <span className="text-sm">{likes}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">{commentsCount}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
