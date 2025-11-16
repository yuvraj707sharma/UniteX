import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Send, Check, CheckCheck, Plus, Video, Phone, Image as ImageIcon, Film } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Message {
  id: number;
  text: string;
  timestamp: string;
  isSent: boolean;
  status: "sent" | "delivered" | "read";
  image?: string;
  video?: string;
}

interface ChatConversationProps {
  onBack: () => void;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  onClearUnread?: () => void;
}

export default function ChatConversation({ onBack, user, onClearUnread }: ChatConversationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await fetchMessages();
        await markMessagesAsRead(); // Mark messages as read
        try {
          onClearUnread?.();
        } catch (clearError) {
          console.error('Error clearing unread messages:', clearError);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to load chat');
      }
    };
    
    initializeChat();
  }, [user.id]);

  const markMessagesAsRead = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get the sender's profile ID
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', user.username)
        .single();

      if (!senderProfile) return;

      // Mark all unread messages from this sender as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderProfile.id)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Failed to authenticate user');
        setLoading(false);
        return;
      }
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      setCurrentUserId(currentUser.id);

      // Get the receiver's profile to get their user ID
      const { data: receiverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', user.username)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Failed to find user profile');
        setLoading(false);
        return;
      }

      if (!receiverProfile) {
        console.log('Receiver profile not found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverProfile.id}),and(sender_id.eq.${receiverProfile.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Messages error:', error);
        toast.error('Failed to load messages');
        throw error;
      }

      const formattedMessages = data?.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        isSent: msg.sender_id === currentUser.id,
        status: msg.is_read ? 'read' : 'delivered',
        image: msg.image_url,
        video: msg.video_url
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const [inputText, setInputText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{
    file: File;
    type: "image" | "video";
    url: string;
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileType = file.type.startsWith("image") ? "image" : "video";
      const fileURL = URL.createObjectURL(file);

      setSelectedMedia({
        file,
        type: fileType,
        url: fileURL,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedMedia) return;

    try {
      const messageContent = selectedMedia 
        ? `${selectedMedia.type === "image" ? "📷 Photo" : "🎥 Video"}${inputText ? `: ${inputText}` : ""}`
        : inputText;

      // Get the receiver's profile to get their user ID
      const { data: receiverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', user.username)
        .single();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        toast.error('Failed to find user');
        return;
      }

      if (!receiverProfile) {
        toast.error('User not found');
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverProfile.id,
          content: messageContent,
          message_type: selectedMedia ? selectedMedia.type : 'text',
          image_url: selectedMedia?.type === 'image' ? selectedMedia.url : null,
          video_url: selectedMedia?.type === 'video' ? selectedMedia.url : null
        });

      if (error) throw error;

      setInputText("");
      setSelectedMedia(null);
      fetchMessages(); // Refresh messages
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getTickIcon = (status: "sent" | "delivered" | "read") => {
    if (status === "sent") {
      return <Check className="w-4 h-4" />;
    }
    return (
      <CheckCheck
        className={`w-4 h-4 ${status === "read" ? "dark:text-blue-500 light:text-red-600" : ""}`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-foreground">{user.name}</p>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <MoreVertical className="w-6 h-6 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
              <DropdownMenuItem 
                onClick={() => toast.success("Starting video call...")}
                className="dark:text-white light:text-black dark:focus:bg-zinc-800 light:focus:bg-gray-100 cursor-pointer"
              >
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toast.success("Starting voice call...")}
                className="dark:text-white light:text-black dark:focus:bg-zinc-800 light:focus:bg-gray-100 cursor-pointer"
              >
                <Phone className="w-4 h-4 mr-2" />
                Voice Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[75%]`}>
              {/* Image or Video */}
              {(message.image || message.video) && (
                <div className="mb-2 rounded-2xl overflow-hidden">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Shared"
                      className="max-w-full h-auto max-h-[300px] object-cover"
                    />
                  )}
                  {message.video && (
                    <video
                      src={message.video}
                      controls
                      className="max-w-full h-auto max-h-[300px]"
                    />
                  )}
                </div>
              )}
              
              {/* Text Message */}
              <div
                className={`${
                  message.isSent
                    ? "dark:bg-blue-500 light:bg-red-600 text-white"
                    : "dark:bg-zinc-800 light:bg-gray-200 dark:text-white light:text-black"
                } rounded-2xl px-4 py-2`}
              >
                <p className="break-words">{message.text}</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <span
                    className={`text-xs ${
                      message.isSent
                        ? "text-white/70"
                        : "dark:text-zinc-400 light:text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </span>
                  {message.isSent && (
                    <span className="text-white/70">{getTickIcon(message.status)}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto dark:bg-black light:bg-white border-t dark:border-zinc-800 light:border-gray-200 p-4 z-50">
        {/* Media Preview */}
        {selectedMedia && (
          <div className="mb-2 flex items-center gap-2 p-2 dark:bg-zinc-900 light:bg-gray-100 rounded-lg">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border dark:border-zinc-700 light:border-gray-300 flex-shrink-0">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  className="w-full h-full object-cover"
                  controls={false}
                />
              )}
            </div>
            <span className="text-sm text-muted-foreground flex-1">
              {selectedMedia.type === "image" ? "📷 Photo" : "🎥 Video"}
            </span>
            <button
              onClick={() => setSelectedMedia(null)}
              className="w-6 h-6 dark:bg-zinc-700 light:bg-gray-300 text-foreground rounded-full flex items-center justify-center text-sm hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 dark:bg-zinc-900 light:bg-gray-100 hover:opacity-90 rounded-full flex items-center justify-center transition-opacity">
                <Plus className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
              <DropdownMenuItem
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
                className="dark:text-white light:text-black dark:focus:bg-zinc-800 light:focus:bg-gray-100 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Send Photo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                  }
                }}
                className="dark:text-white light:text-black dark:focus:bg-zinc-800 light:focus:bg-gray-100 cursor-pointer"
              >
                <Film className="w-4 h-4 mr-2" />
                Send Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 dark:bg-zinc-900 light:bg-gray-100 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:ring-2 dark:focus:ring-blue-500 light:focus:ring-2 light:focus:ring-red-600"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() && !selectedMedia}
            className="w-12 h-12 dark:bg-blue-500 light:bg-red-600 hover:opacity-90 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
