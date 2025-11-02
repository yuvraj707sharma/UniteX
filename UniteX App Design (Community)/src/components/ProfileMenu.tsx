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
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";

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

const mockUser = {
  name: "Alex Johnson",
  username: "alexjohnson",
  avatar: "/api/placeholder/150/150", // This will be replaced with real uploaded images
  followers: 234,
  following: 156,
};

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
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

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
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                {mockUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-foreground">{mockUser.name}</h3>
              <p className="text-muted-foreground text-sm">@{mockUser.username}</p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-foreground">{mockUser.following}</span>
                <span className="text-muted-foreground"> Following</span>
              </div>
              <div>
                <span className="text-foreground">{mockUser.followers}</span>
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
              onClick={() => onNavigateToSpaces ? handleNavigation(onNavigateToSpaces) : handleFeatureClick("Spaces")}
              className="w-full px-4 py-3 flex items-center gap-3 text-foreground dark:hover:bg-zinc-900 light:hover:bg-gray-100 transition-colors"
            >
              <Radio className="w-5 h-5" />
              <span>Spaces</span>
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
