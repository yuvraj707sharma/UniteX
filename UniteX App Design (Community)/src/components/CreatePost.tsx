import { useState, useRef } from "react";
import { X, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface CreatePostProps {
  onClose: () => void;
  onPostCreated: () => void;
  currentUser: any;
}

export default function CreatePost({ onClose, onPostCreated, currentUser }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedMedia(prev => [...prev, ...validFiles].slice(0, 4)); // Max 4 files
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setMediaPreview(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      toast.error("Please write something or add media!");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      // Upload media files if any
      if (selectedMedia.length > 0) {
        for (const file of selectedMedia) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('post-media')
            .getPublicUrl(fileName);
            
          mediaUrls.push(publicUrl);
          mediaTypes.push(file.type.startsWith('image/') ? 'image' : 'video');
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          post_type: 'idea',
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          media_types: mediaTypes.length > 0 ? mediaTypes : null,
          is_approved: true // Auto-approve for now
        });

      if (error) throw error;

      toast.success("Post created successfully!");
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-background rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={onClose}>
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
          <h2 className="text-lg font-semibold">Create Post</h2>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full px-6"
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-32 p-0 border-none bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-lg"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {mediaPreview.length > 0 && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {mediaPreview.map((preview, index) => (
                <div key={index} className="relative">
                  {selectedMedia[index]?.type.startsWith('image/') ? (
                    <img src={preview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <video src={preview} className="w-full h-24 object-cover rounded-lg" />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaSelect}
            className="hidden"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                disabled={selectedMedia.length >= 4}
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {content.length}/280 • {selectedMedia.length}/4 media
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}