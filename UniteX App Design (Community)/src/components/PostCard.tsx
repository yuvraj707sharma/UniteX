import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface PostCardProps {
  author: string;
  username: string;
  department: string;
  content: string;
  image?: string;
  avatar?: string;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
}

export default function PostCard({
  author,
  username,
  department,
  content,
  image,
  avatar,
  likes: initialLikes,
  comments,
  shares,
  timeAgo,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-background border-b dark:border-zinc-800 light:border-gray-200 px-4 py-4 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar} />
          <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
            {author.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-foreground truncate">{author}</span>
                <Badge className="dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 light:bg-red-50 light:text-red-600 light:border-red-200 text-xs rounded-full">
                  {department}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>@{username}</span>
                <span>·</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <p className="text-foreground mb-3">{content}</p>

          {/* Image */}
          {image && (
            <div className="rounded-2xl overflow-hidden mb-3 border dark:border-zinc-800 light:border-gray-200">
              <img src={image} alt="Post" className="w-full h-auto" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-muted-foreground mt-3">
            <button className="flex items-center gap-2 dark:hover:text-blue-500 light:hover:text-red-600 transition-colors group">
              <div className="p-2 rounded-full dark:group-hover:bg-blue-500/10 light:group-hover:bg-red-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">{comments}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-sm">{shares}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors group ${
                liked ? "dark:text-pink-500 light:text-red-600" : "dark:hover:text-pink-500 light:hover:text-red-600"
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                liked ? "dark:bg-pink-500/10 light:bg-red-50" : "dark:group-hover:bg-pink-500/10 light:group-hover:bg-red-50"
              }`}>
                <motion.div
                  animate={{ scale: liked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                </motion.div>
              </div>
              <span className="text-sm">{likes}</span>
            </button>

            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`transition-colors ${
                bookmarked ? "dark:text-blue-500 light:text-red-600" : "dark:hover:text-blue-500 light:hover:text-red-600"
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                bookmarked ? "dark:bg-blue-500/10 light:bg-red-50" : "dark:hover:bg-blue-500/10 light:hover:bg-red-50"
              }`}>
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
