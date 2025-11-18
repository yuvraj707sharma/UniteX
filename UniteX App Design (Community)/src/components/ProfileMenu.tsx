import {
  User,
  Sparkles,
  MessageCircle,
  Bookmark,
  Briefcase,
  List,
  Radio,
  ChevronDown,
  Moon,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden@1.1.0";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";

interface ProfileMenuProps {
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToBookmarks: () => void;
  onNavigateToMessages: () => void;
  onNavigateToJobs?: () => void;
  onNavigateToLists?: () => void;
  onNavigateToSpaces?: () => void;
  children: React.ReactNode;
}



export default function ProfileMenu({
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToBookmarks,
  onNavigateToMessages,
  onNavigateToJobs,
  onNavigateToLists,
  onNavigateToSpaces,
  children,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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
        // Fetch follower counts
        const { data: followers } = await supabase
          .from('follows')
          .select('id')
          .eq('following_id', user.id);

        const { data: following } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id);

        setCurrentUser({
          name: profile.full_name || 'User',
          username: profile.username || 'user',
          avatar: profile.avatar_url || '',
          followers: followers?.length || 0,
          following: following?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const handleNavigation = (callback: () => void) => {
    setIsOpen(false);
    setTimeout(callback, 100);
  };

  const handleFeatureClick = (feature: string) => {
    toast.info(`${feature} feature coming soon!`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] bg-background dark:border-zinc-800 light:border-gray-200 p-0"
      >
        <VisuallyHidden.Root>
          <SheetTitle>Account Menu</SheetTitle>
          <SheetDescription>Access your profile and settings</SheetDescription>
        </VisuallyHidden.Root>
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-4 space-y-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-foreground">{currentUser?.name || 'Loading...'}</h3>
              <p className="text-muted-foreground text-sm">@{currentUser?.username || 'user'}</p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-foreground">{currentUser?.following || 0}</span>
                <span className="text-muted-foreground"> Following</span>
              </div>
              <div>
                <span className="text-foreground">{currentUser?.followers || 0}</span>
                <span className="text-muted-foreground"> Followers</span>
              </div>
            </div>
          </div>

          <Separator className="dark:bg-zinc-800 light:bg-gray-200" />

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => handleNavigation(onNavigateToProfile)}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleFeatureClick("Premium")}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span>Premium</span>
            </button>

            <button
              onClick={() => handleNavigation(onNavigateToMessages)}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Messages</span>
            </button>

            <button
              onClick={() => handleNavigation(onNavigateToBookmarks)}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              <span>Bookmarks</span>
            </button>

            <button
              onClick={() => onNavigateToJobs ? handleNavigation(onNavigateToJobs) : handleFeatureClick("Jobs")}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>Jobs</span>
            </button>

            <button
              onClick={() => onNavigateToLists ? handleNavigation(onNavigateToLists) : handleFeatureClick("Lists")}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <List className="w-5 h-5" />
              <span>Lists</span>
            </button>

            <button
              onClick={() => onNavigateToSpaces ? handleNavigation(onNavigateToSpaces) : handleFeatureClick("Vartalaap")}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <Radio className="w-5 h-5" />
              <span>Vartalaap</span>
            </button>

            <Separator className="dark:bg-zinc-800 light:bg-gray-200 my-2" />

            <button
              onClick={() => handleNavigation(onNavigateToSettings)}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings & Support</span>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t dark:border-zinc-800 light:border-gray-200">
            <button
              onClick={() => {
                toggleTheme();
                toast.success(isDarkMode ? "Light mode activated" : "Dark mode activated");
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Moon className="w-5 h-5" />
              <span>Dark Mode</span>
              <div className={`ml-auto w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
