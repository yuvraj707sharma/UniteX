import { Home, Search, Users, Bell, Mail } from "lucide-react";
import { motion } from "motion/react";

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "communities", icon: Users, label: "Communities" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "messages", icon: Mail, label: "Messages" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t dark:border-zinc-800 light:border-gray-200 px-2 py-3 flex justify-around items-center max-w-md mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center justify-center w-14 h-12"
          >
            <motion.div
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Icon className={`w-6 h-6 ${isActive ? "dark:text-blue-500 light:text-red-600" : "dark:text-zinc-400 light:text-gray-600"}`} />
            </motion.div>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -bottom-3 w-1 h-1 dark:bg-blue-500 light:bg-red-600 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
