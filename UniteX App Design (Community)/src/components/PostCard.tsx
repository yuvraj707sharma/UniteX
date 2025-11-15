import { useState, useEffect } from "react";
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
import { supabase } from '../lib/supabase';

interface PostCardProps {
  id: string;
  author: string;
  username: string;
  department: string;
  content: string;
  image?: string;
  avatar?: string;
  likes: number;
  comments: number;
  shares: number;
  reposts?: number;
  timeAgo: string;
  onNavigateToProfile?: (username: string) => void;
}

export default function PostCard({
  id,
  author,
  username,
  department,
  content,
  image,
  avatar,
  likes: initialLikes,
  comments: initialComments,
  shares: initialShares,
  reposts: initialReposts = 0,
  timeAgo,
  onNavigateToProfile,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [shares, setShares] = useState(initialShares);
  const [reposts, setReposts] = useState(initialReposts);
  const [reposted, setReposted] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [realUsers, setRealUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchCurrentUser();
    fetchReposts();
    fetchRealUsers();
    fetchLikeStatus();
    fetchBookmarkStatus();
  }, []);

  useEffect(() => {
    if (showCommentDialog) {
      fetchComments();
    }
  }, [showCommentDialog]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchReposts = async () => {
    try {
      if (!id) return; // Skip if post ID is undefined
      
      const { count } = await supabase
        .from('reposts')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

      setReposts(count || 0);

      // Check if current user has reposted
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('reposts')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
        
        setReposted(!!data);
      }
    } catch (error) {
      console.error('Error fetching reposts:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(full_name, username, avatar_url)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        author: comment.profiles.full_name || 'Unknown User',
        username: comment.profiles.username || 'unknown',
        avatar: comment.profiles.avatar_url || '',
        text: comment.content,
        timeAgo: new Date(comment.created_at).toLocaleDateString(),
        likes: comment.likes_count || 0,
        liked: false
      })) || [];

      setPostComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchRealUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url');

      if (error) throw error;

      setRealUsers(data);
    } catch (error) {
      console.error('Error fetching real users:', error);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      if (!id) return; // Skip if post ID is undefined
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching like status:', error);
        setLiked(false);
        return;
      }
      
      setLiked(!!data);
    } catch (error) {
      console.error('Error in fetchLikeStatus:', error);
      setLiked(false);
    }
  };

  const fetchBookmarkStatus = async () => {
    try {
      if (!id) return; // Skip if post ID is undefined
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching bookmark status:', error);
        setBookmarked(false);
        return;
      }
      
      setBookmarked(!!data);
    } catch (error) {
      console.error('Error in fetchBookmarkStatus:', error);
      setBookmarked(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to like');
        return;
      }

      if (liked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error deleting like:', error);
          throw error;
        }
        
        setLiked(false);
        setLikes(likes - 1);
        toast.success("Unliked!");
        
        // Update the post's like count in database
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, likes - 1) })
          .eq('id', id);
        
        if (updateError) {
          console.error('Error updating likes_count:', updateError);
        }
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            user_id: user.id,
          });
        
        if (error) {
          console.error('Error inserting like:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        setLiked(true);
        setLikes(likes + 1);
        toast.success("Liked!");
        
        // Update the post's like count in database
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: likes + 1 })
          .eq('id', id);
        
        if (updateError) {
          console.error('Error updating likes_count:', updateError);
        }
      }
      
      // Fetch updated count from database to ensure accuracy
      setTimeout(async () => {
        const { data } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', id)
          .single();
        
        if (data) {
          setLikes(data.likes_count || 0);
        }
      }, 500);
    } catch (error) {
      console.error('Error liking post:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error('Failed to like post');
    }
  };

  const handleComment = () => {
    setShowCommentDialog(true);
  };

  const handlePostComment = async () => {
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

      if (containsMaliciousContent(trimmedText)) {
        toast.error('Comment contains invalid content');
        return;
      }
      
      if (!currentUser) {
        toast.error('Please log in to comment');
        return;
      }

      const sanitizedText = sanitizeHtml(trimmedText);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to comment');
        return;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          author_id: user.id,
          content: sanitizedText
        });

      if (error) throw error;

      // Update comment count in posts table
      const newCommentCount = comments + 1;
      const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: newCommentCount })
        .eq('id', id);

      if (updateError) console.error('Error updating comment count:', updateError);

      // Add comment to local state
      const newComment = {
        id: Date.now().toString(),
        author: currentUser.full_name || 'You',
        username: currentUser.username || 'you',
        avatar: currentUser.avatar_url || '',
        text: sanitizedText,
        timeAgo: 'Just now',
        likes: 0,
        liked: false,
      };

      setPostComments([newComment, ...postComments]);
      setComments(newCommentCount);
      setCommentText("");
      toast.success("Comment posted!");
      
      // Fetch updated count from database to ensure accuracy
      setTimeout(async () => {
        const { data } = await supabase
          .from('posts')
          .select('comments_count')
          .eq('id', id)
          .single();
        
        if (data) {
          setComments(data.comments_count || 0);
        }
      }, 500);
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

  const handleRepost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to repost');
        return;
      }

      if (reposted) {
        await supabase
          .from('reposts')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
        setReposted(false);
        setReposts(reposts - 1);
        toast.success("Repost removed!");
      } else {
        await supabase
          .from('reposts')
          .insert({
            post_id: id,
            user_id: user.id,
          });
        setReposted(true);
        setReposts(reposts + 1);
        toast.success("Reposted!");
      }
    } catch (error) {
      console.error('Error reposting:', error);
      toast.error('Failed to repost');
    }
  };

  const handleBookmark = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to bookmark');
        return;
      }

      if (bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
        setBookmarked(false);
        toast.success("Removed from bookmarks!");
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            post_id: id,
            user_id: user.id,
          });
        setBookmarked(true);
        toast.success("Added to bookmarks!");
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    }
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
                  className={`flex items-center gap-2 transition-colors ${
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
              {realUsers
                .filter((user) =>
                  shareSearchQuery
                    ? user.full_name.toLowerCase().includes(shareSearchQuery.toLowerCase()) ||
                      user.username.toLowerCase().includes(shareSearchQuery.toLowerCase())
                    : true
                )
                .map((user) => (
                  <button
                    key={user.username}
                    onClick={() => handleShareToChat(user.full_name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <p className="text-foreground">{user.full_name}</p>
                      <p className="text-muted-foreground text-sm">@{user.username}</p>
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
                <AvatarImage src={currentUser?.avatar_url || ''} />
                <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                  {currentUser?.full_name?.charAt(0) || 'U'}
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
                <div className="flex-1">
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
