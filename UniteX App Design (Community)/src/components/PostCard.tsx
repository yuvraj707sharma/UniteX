import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Send, Link2, Repeat2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { sanitizeHtml, containsMaliciousContent } from '../utils/sanitize';

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
  onNavigateToProfile?: (username: string) => void;
}

export default function PostCard({
  author,
  username,
  department,
  content,
  image,
  avatar,
  likes: initialLikes,
  comments: initialComments,
  shares: initialShares,
  timeAgo,
  onNavigateToProfile,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [shares, setShares] = useState(initialShares);
  const [reposted, setReposted] = useState(false);
  const [reposts, setReposts] = useState(Math.floor(Math.random() * 50));
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState([
    {
      id: 1,
      author: "John Doe",
      username: "johnd",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      text: "Great post! Very insightful.",
      timeAgo: "1h ago",
      likes: 12,
      liked: false,
    },
    {
      id: 2,
      author: "Jane Smith",
      username: "janes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      text: "I'd love to collaborate on this!",
      timeAgo: "3h ago",
      likes: 8,
      liked: false,
    },
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    toast.success(liked ? "Unliked" : "Liked!");
  };

  const handleComment = () => {
    setShowCommentDialog(true);
  };

  const handlePostComment = () => {
    try {
      const trimmedText = commentText.trim();
      if (!trimmedText) {
        toast.error('Please enter a comment');
        return;
      }

      if (trimmedText.length > 500) {
        toast.error('Comment is too long (max 500 characters)');
        return;
      }

      // Check for malicious content
      if (containsMaliciousContent(trimmedText)) {
        toast.error('Comment contains invalid content');
        return;
      }
      
      // Sanitize comment text to prevent XSS
      const sanitizedText = sanitizeHtml(trimmedText);

      const newComment = {
        id: postComments.length + 1,
        author: "You",
        username: "you",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        text: sanitizedText,
        timeAgo: "Just now",
        likes: 0,
        liked: false,
      };

      setPostComments([newComment, ...postComments]);
      setComments(comments + 1);
      setCommentText("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const handleLikeComment = (commentId: number) => {
    setPostComments(
      postComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleShareToChat = (chatName: string) => {
    setShares(shares + 1);
    toast.success(`Shared to ${chatName}!`);
    setShowShareDialog(false);
    setShareSearchQuery("");
  };

  const handleCopyLink = async () => {
    try {
      const sanitizedAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const postLink = `https://unitex.app/posts/${sanitizedAuthor}-${Date.now()}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postLink);
        toast.success("Link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = postLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleRepost = () => {
    setReposted(!reposted);
    setReposts(reposted ? reposts - 1 : reposts + 1);
    toast.success(reposted ? "Repost removed" : "Reposted!");
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleQuoteRepost = () => {
    if (!quoteText.trim()) {
      toast.error('Please add a comment to quote this post');
      return;
    }

    if (containsMaliciousContent(quoteText)) {
      toast.error('Comment contains invalid content');
      return;
    }

    setReposts(reposts + 1);
    setQuoteText("");
    setShowQuoteDialog(false);
    toast.success("Quote posted!");
  };

  return (
    <div className="bg-background border-b dark:border-zinc-800 light:border-gray-200 px-4 py-4 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <button onClick={() => onNavigateToProfile?.(username)} className="text-left">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} />
            <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
              {author.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <button onClick={() => onNavigateToProfile?.(username)} className="text-left block w-full">
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
              </button>
            </div>
          </div>

          {/* Post Content */}
          <p className="text-foreground mb-3">
            {sanitizeHtml(content).replace(/\n/g, ' ')}
          </p>

          {/* Image */}
          {image && (
            <div className="rounded-2xl overflow-hidden mb-3 border dark:border-zinc-800 light:border-gray-200">
              <img src={image} alt="Post" className="w-full h-auto" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-muted-foreground mt-3">
            <button 
              onClick={handleComment}
              className="flex items-center gap-2 dark:hover:text-blue-500 light:hover:text-red-600 transition-colors group"
            >
              <div className="p-2 rounded-full dark:group-hover:bg-blue-500/10 light:group-hover:bg-red-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">{comments}</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 transition-colors group ${
                    reposted ? "text-green-500" : "hover:text-green-500"
                  }`}
                >
                  <div className={`p-2 rounded-full transition-colors ${
                    reposted ? "bg-green-500/10" : "group-hover:bg-green-500/10"
                  }`}>
                    <motion.div
                      animate={{ scale: reposted ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Repeat2 className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <span className="text-sm">{reposts}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
                <DropdownMenuItem
                  onClick={handleRepost}
                  className="dark:text-white light:text-black dark:focus:bg-zinc-800 light:focus:bg-gray-100 cursor-pointer"
                >
                  <Repeat2 className="w-4 h-4 mr-2" />
                  {reposted ? "Undo Repost" : "Repost"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowQuoteDialog(true)}
                  className="dark:text-white light:text-black dark:focus:bg-zinc-800 light:focus:bg-gray-100 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Quote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2 dark:hover:text-blue-500 light:hover:text-red-600 transition-colors group"
            >
              <div className="p-2 rounded-full dark:group-hover:bg-blue-500/10 light:group-hover:bg-red-50 transition-colors">
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
              onClick={handleBookmark}
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Share Post</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share this post with your connections
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Copy Link */}
            <button
              onClick={() => {
                handleCopyLink();
                setShowShareDialog(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-800 dark:hover:bg-zinc-700 light:bg-gray-100 light:hover:bg-gray-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full dark:bg-blue-500/10 light:bg-red-50 flex items-center justify-center">
                <Link2 className="w-5 h-5 dark:text-blue-500 light:text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-foreground">Copy Link</p>
                <p className="text-muted-foreground text-sm">Share via WhatsApp or other apps</p>
              </div>
            </button>

            {/* Search Chats */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={shareSearchQuery}
                onChange={(e) => setShareSearchQuery(e.target.value)}
                className="pl-10 dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300"
              />
            </div>

            {/* UniteX Chats List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-muted-foreground text-sm px-2">Share to UniteX</p>
              {[
                { name: "Sydney Sweeny", username: "sydneysweeny", avatar: "Sydney" },
                { name: "Simran", username: "simran", avatar: "Simran" },
                { name: "Dheemant Agarwal", username: "dheemant", avatar: "Dheemant" },
                { name: "Deepak", username: "deepak", avatar: "Deepak" },
                { name: "Yuvraj", username: "yuvraj", avatar: "Yuvraj" },
              ]
                .filter((chat) =>
                  shareSearchQuery
                    ? chat.name.toLowerCase().includes(shareSearchQuery.toLowerCase()) ||
                      chat.username.toLowerCase().includes(shareSearchQuery.toLowerCase())
                    : true
                )
                .map((chat) => (
                  <button
                    key={chat.username}
                    onClick={() => handleShareToChat(chat.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.avatar}`} />
                      <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                        {chat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <p className="text-foreground">{chat.name}</p>
                      <p className="text-muted-foreground text-sm">@{chat.username}</p>
                    </div>
                    <Send className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog - Twitter Style */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b dark:border-zinc-800 light:border-gray-200">
            <DialogTitle className="text-foreground">Comments</DialogTitle>
          </DialogHeader>

          {/* Original Post Preview */}
          <div className="px-4 py-3 border-b dark:border-zinc-800 light:border-gray-200">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatar} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                  {author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{author}</span>
                  <span className="text-muted-foreground text-sm">@{username}</span>
                  <span className="text-muted-foreground text-sm">· {timeAgo}</span>
                </div>
                <p className="text-foreground text-sm mt-1">{content.substring(0, 100)}{content.length > 100 ? "..." : ""}</p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
            {postComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 py-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                    {comment.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground">{comment.author}</span>
                    <span className="text-muted-foreground text-sm">@{comment.username}</span>
                    <span className="text-muted-foreground text-sm">· {comment.timeAgo}</span>
                  </div>
                  <p className="text-foreground mt-1">{comment.text}</p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-6 mt-2 text-muted-foreground">
                    <button
                      onClick={() => {
                        setCommentText(`@${comment.username} `);
                      }}
                      className="flex items-center gap-1 dark:hover:text-blue-500 light:hover:text-red-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        comment.liked ? "dark:text-pink-500 light:text-red-600" : "dark:hover:text-pink-500 light:hover:text-red-600"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${comment.liked ? "fill-current" : ""}`} />
                      {comment.likes > 0 && <span className="text-sm">{comment.likes}</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {postComments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-muted-foreground text-sm">Be the first to comment!</p>
              </div>
            )}
          </div>

          {/* Comment Input - Fixed at bottom */}
          <div className="px-4 py-3 border-t dark:border-zinc-800 light:border-gray-200 bg-background">
            <div className="flex gap-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                  Y
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                  placeholder="Post your reply..."
                  className="flex-1 px-4 py-2 dark:bg-zinc-800 light:bg-gray-100 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:ring-2 dark:focus:ring-blue-500 light:focus:ring-2 light:focus:ring-red-600"
                />
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  className="w-10 h-10 dark:bg-blue-500 light:bg-red-600 hover:opacity-90 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Repost Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Quote Post</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add your thoughts about this post
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quote Input */}
            <Textarea
              placeholder="Add a comment..."
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="min-h-[100px] dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300 resize-none"
              maxLength={280}
            />
            <div className="text-right text-sm text-muted-foreground">
              {quoteText.length}/280
            </div>

            {/* Original Post Preview */}
            <div className="border dark:border-zinc-700 light:border-gray-300 rounded-xl p-3 dark:bg-zinc-800/50 light:bg-gray-50">
              <div className="flex gap-2 items-start">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="dark:bg-zinc-700 dark:text-white light:bg-gray-300 light:text-black text-xs">
                    {author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-foreground font-medium">{author}</span>
                    <span className="text-muted-foreground">@{username}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{timeAgo}</span>
                  </div>
                  <p className="text-foreground text-sm mt-1">
                    {content.length > 100 ? `${content.substring(0, 100)}...` : content}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowQuoteDialog(false)}
                variant="outline"
                className="flex-1 dark:border-zinc-700 light:border-gray-300 dark:text-white light:text-black dark:hover:bg-zinc-800 light:hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuoteRepost}
                disabled={!quoteText.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quote Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
