import { useState, useEffect } from "react";
import * as React from "react";
import { Search, Settings, Edit, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ChatConversation from "./ChatConversation";



interface MessagesProps {
  initialChat?: {
    name: string;
    username: string;
    avatar: string;
  } | null;
  onClearUnread?: () => void;
  onChatStateChange?: (inChat: boolean) => void;
}

export default function Messages({ initialChat, onClearUnread, onChatStateChange }: MessagesProps = {}) {
  const [selectedChat, setSelectedChat] = useState<{
    name: string;
    username: string;
    avatar: string;
    id: string;
  } | null>(initialChat || null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");

  // Notify parent when chat state changes
  React.useEffect(() => {
    onChatStateChange?.(!!selectedChat);
  }, [selectedChat, onChatStateChange]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, username, avatar_url),
          receiver:receiver_id(id, full_name, username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationMap = new Map();
      messages?.forEach(message => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const partner = message.sender_id === user.id ? message.receiver : message.sender;
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: partnerId,
            name: partner.full_name,
            username: partner.username,
            avatar: partner.avatar_url,
            lastMessage: message.content,
            timestamp: message.created_at,
            unread: !message.is_read && message.receiver_id === user.id
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, department')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startConversation = (user: any) => {
    setSelectedChat({
      id: user.id,
      name: user.full_name,
      username: user.username,
      avatar: user.avatar_url
    });
    setShowNewMessageDialog(false);
    setSearchUsername("");
    setSearchResults([]);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  if (selectedChat) {
    return (
      <ChatConversation
        onBack={() => setSelectedChat(null)}
        user={selectedChat}
        onClearUnread={onClearUnread}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-foreground text-xl">Messages</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => toast.info("Message settings updated!")}>
              <Settings className="w-6 h-6 text-muted-foreground" />
            </button>
            <button onClick={() => setShowNewMessageDialog(true)}>
              <Edit className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Direct Messages"
              className="w-full pl-12 pr-4 py-3 dark:bg-zinc-900 dark:border-zinc-800 light:bg-gray-100 light:border-gray-300 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:border-zinc-700 light:focus:border-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {conversations.map((chat, index) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() =>
              setSelectedChat({
                id: chat.id,
                name: chat.name,
                username: chat.username,
                avatar: chat.avatar,
              })
            }
            className="w-full px-4 py-4 flex items-start gap-3 border-b dark:border-zinc-800 light:border-gray-200 dark:hover:bg-zinc-950 light:hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                {chat.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate">{chat.name}</span>
                  <span className="text-muted-foreground text-sm">@{chat.username}</span>
                </div>
                <span className="text-muted-foreground text-sm flex-shrink-0">{formatTimeAgo(chat.timestamp)}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread ? "text-foreground" : "text-muted-foreground"}`}>
                {chat.lastMessage}
              </p>
            </div>

            {/* Unread Indicator */}
            {chat.unread && (
              <div className="w-2 h-2 dark:bg-blue-500 light:bg-red-600 rounded-full flex-shrink-0 mt-2" />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && conversations.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-foreground text-xl">No messages yet</h2>
            <p className="text-muted-foreground">Start a conversation with your collaborators</p>
            <Button onClick={() => setShowNewMessageDialog(true)} className="mt-4">
              Start Chatting
            </Button>
          </div>
        </div>
      )}

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-foreground">New Message</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Search for a user to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search username..."
                value={searchUsername}
                onChange={(e) => {
                  setSearchUsername(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="pl-10 dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300"
              />
            </div>
            
            {/* Search Results */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-muted-foreground text-sm px-2">Search Results</p>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user)}
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
                    <p className="text-muted-foreground text-sm">@{user.username} • {user.department}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
