import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginScreen from "./components/LoginScreen";
import HomeFeed from "./components/HomeFeed";
import ProjectCollaboration from "./components/ProjectCollaboration";
import Communities from "./components/Communities";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import OtherProfile from "./components/OtherProfile";
import FollowersList from "./components/FollowersList";
import Messages from "./components/Messages";
import Settings from "./components/Settings";
import Bookmarks from "./components/Bookmarks";
import Search from "./components/Search";
import Jobs from "./components/Jobs";
import Lists from "./components/Lists";
import Spaces from "./components/Spaces";
import BottomNav from "./components/BottomNav";

type Screen =
  | "login"
  | "home"
  | "search"
  | "communities"
  | "notifications"
  | "profile"
  | "otherProfile"
  | "followers"
  | "messages"
  | "settings"
  | "bookmarks"
  | "project"
  | "jobs"
  | "lists"
  | "spaces";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [selectedProfileName, setSelectedProfileName] = useState("");
  const [followersTab, setFollowersTab] = useState<"followers" | "following">("followers");
  const [previousScreen, setPreviousScreen] = useState<Screen>("home");
  const [preselectedChat, setPreselectedChat] = useState<{
    name: string;
    username: string;
    avatar: string;
  } | null>(null);
  const [isInChatConversation, setIsInChatConversation] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen("home");
  };

  const handleNavigate = (screen: string) => {
    try {
      const validScreens: Screen[] = [
        "login", "home", "search", "communities", "notifications", 
        "profile", "otherProfile", "followers", "messages", "settings", 
        "bookmarks", "project", "jobs", "lists", "spaces"
      ];
      
      if (!validScreens.includes(screen as Screen)) {
        console.error('Invalid screen:', screen);
        return;
      }
      
      if (screen !== "messages") {
        setPreselectedChat(null);
      }
      setCurrentScreen(screen as Screen);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleNavigateToOtherProfile = (username: string) => {
    try {
      if (!username || typeof username !== 'string') {
        console.error('Invalid username provided');
        return;
      }
      setSelectedUsername(username.trim());
      setCurrentScreen("otherProfile");
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  };

  const handleNavigateToFollowers = (tab: "followers" | "following" = "followers", username?: string, profileName?: string) => {
    try {
      if (tab !== "followers" && tab !== "following") {
        console.error('Invalid followers tab:', tab);
        return;
      }
      setFollowersTab(tab);
      if (username) {
        setSelectedUsername(username);
      }
      if (profileName) {
        setSelectedProfileName(profileName);
      }
      setPreviousScreen(currentScreen);
      setCurrentScreen("followers");
    } catch (error) {
      console.error('Error navigating to followers:', error);
    }
  };

  const handleNavigateToChat = (user: { name: string; username: string; avatar: string }) => {
    try {
      if (!user || !user.name || !user.username) {
        console.error('Invalid user data for chat navigation');
        return;
      }
      setPreselectedChat({
        name: user.name.trim(),
        username: user.username.trim(),
        avatar: user.avatar || ''
      });
      setCurrentScreen("messages");
    } catch (error) {
      console.error('Error navigating to chat:', error);
    }
  };

  // Animation variants for screen transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
  };

  // Render current screen
  const renderScreen = () => {
    try {
      switch (currentScreen) {
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      case "home":
        return (
          <HomeFeed
            onNavigateToProfile={() => setCurrentScreen("profile")}
            onNavigateToSettings={() => setCurrentScreen("settings")}
            onNavigateToBookmarks={() => setCurrentScreen("bookmarks")}
            onNavigateToMessages={() => setCurrentScreen("messages")}
            onNavigateToJobs={() => setCurrentScreen("jobs")}
            onNavigateToLists={() => setCurrentScreen("lists")}
            onNavigateToSpaces={() => setCurrentScreen("spaces")}
            onNavigateToOtherProfile={handleNavigateToOtherProfile}
          />
        );
      case "project":
        return <ProjectCollaboration onBack={() => setCurrentScreen("home")} />;
      case "communities":
        return <Communities />;
      case "notifications":
        // Clear notifications when viewing
        if (unreadNotifications > 0) {
          setTimeout(() => setUnreadNotifications(0), 1000);
        }
        return <Notifications onNavigateToProfile={handleNavigateToOtherProfile} />;
      case "profile":
        return <Profile onNavigateToFollowers={(tab) => handleNavigateToFollowers(tab, "alexjohnson", "Alex Johnson")} />;
      case "otherProfile":
        return (
          <OtherProfile
            username={selectedUsername}
            onBack={() => setCurrentScreen("home")}
            onNavigateToFollowers={(username, profileName) => handleNavigateToFollowers("followers", username, profileName)}
            onNavigateToChat={handleNavigateToChat}
          />
        );
      case "followers":
        return (
          <FollowersList
            onBack={() => setCurrentScreen(previousScreen)}
            onNavigateToProfile={handleNavigateToOtherProfile}
            initialTab={followersTab}
            username={selectedUsername}
            profileName={selectedProfileName}
          />
        );
      case "messages":
        // Clear message notifications when viewing
        if (unreadMessages > 0) {
          setTimeout(() => setUnreadMessages(0), 1000);
        }
        return <Messages 
          initialChat={preselectedChat} 
          onClearUnread={() => setUnreadMessages(0)}
          onChatStateChange={setIsInChatConversation}
        />;
      case "settings":
        return <Settings onBack={() => setCurrentScreen("home")} />;
      case "bookmarks":
        return <Bookmarks onBack={() => setCurrentScreen("home")} />;
      case "search":
        return <Search onNavigateToProfile={handleNavigateToOtherProfile} />;
      case "jobs":
        return <Jobs onBack={() => setCurrentScreen("home")} />;
      case "lists":
        return <Lists onBack={() => setCurrentScreen("home")} />;
      case "spaces":
        return <Spaces onBack={() => setCurrentScreen("home")} />;
      default:
        console.error('Unknown screen:', currentScreen);
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <h1 className="text-xl font-bold text-foreground">Page not found</h1>
              <button 
                onClick={() => setCurrentScreen('home')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Go Home
              </button>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-background">
        <Toaster position="top-center" />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation - Only show when logged in and not in chat */}
        {isLoggedIn && 
          !isInChatConversation &&
          currentScreen !== "login" && 
          currentScreen !== "project" && 
          currentScreen !== "settings" && 
          currentScreen !== "bookmarks" &&
          currentScreen !== "jobs" &&
          currentScreen !== "lists" &&
          currentScreen !== "spaces" &&
          currentScreen !== "otherProfile" &&
          currentScreen !== "followers" && (
          <BottomNav 
            activeScreen={currentScreen} 
            onNavigate={handleNavigate}
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
          />
        )}
      </div>
    </ThemeProvider>
  );
}