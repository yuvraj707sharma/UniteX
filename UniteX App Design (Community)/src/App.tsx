import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginScreen from "./components/LoginScreen";
import HomeFeed from "./components/HomeFeed";
import ProjectCollaboration from "./components/ProjectCollaboration";
import Communities from "./components/Communities";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import Messages from "./components/Messages";
import Settings from "./components/Settings";
import Bookmarks from "./components/Bookmarks";
import BottomNav from "./components/BottomNav";

type Screen =
  | "login"
  | "home"
  | "search"
  | "communities"
  | "notifications"
  | "profile"
  | "messages"
  | "settings"
  | "bookmarks"
  | "project";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen("home");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
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
          />
        );
      case "project":
        return <ProjectCollaboration onBack={() => setCurrentScreen("home")} />;
      case "communities":
        return <Communities />;
      case "notifications":
        return <Notifications />;
      case "profile":
        return <Profile />;
      case "messages":
        return <Messages />;
      case "settings":
        return <Settings onBack={() => setCurrentScreen("home")} />;
      case "bookmarks":
        return <Bookmarks onBack={() => setCurrentScreen("home")} />;
      case "search":
        return (
          <div className="min-h-screen bg-black pb-20 max-w-md mx-auto flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-white text-2xl">Search</h2>
              <p className="text-zinc-400">
                Search for projects, users, and ideas
              </p>
              <p className="text-zinc-600 text-sm">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <HomeFeed
            onNavigateToProfile={() => setCurrentScreen("profile")}
            onNavigateToSettings={() => setCurrentScreen("settings")}
            onNavigateToBookmarks={() => setCurrentScreen("bookmarks")}
            onNavigateToMessages={() => setCurrentScreen("messages")}
          />
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

        {/* Bottom Navigation - Only show when logged in */}
        {isLoggedIn && currentScreen !== "login" && currentScreen !== "project" && currentScreen !== "settings" && currentScreen !== "bookmarks" && (
          <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} />
        )}
      </div>
    </ThemeProvider>
  );
}
