import { useState } from "react";
import { ArrowLeft, ChevronRight, User, Bell, Shield, Eye, Globe, HelpCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AccountSettings from "./AccountSettings";
import SecuritySettings from "./SecuritySettings";
import PrivacySettings from "./PrivacySettings";
import NotificationSettings from "./NotificationSettings";
import DisplaySettings from "./DisplaySettings";
import HelpCenter from "./HelpCenter";
import AboutPage from "./AboutPage";

interface SettingsProps {
  onBack: () => void;
}

type SettingsView = "main" | "account" | "security" | "privacy" | "notifications" | "display" | "help" | "about";

const settingsOptions = [
  {
    category: "Account",
    items: [
      { icon: User, label: "Account Information", description: "See your account information" },
      { icon: Shield, label: "Security and account access", description: "Manage password and security" },
      { icon: Eye, label: "Privacy and safety", description: "Control who can see your content" },
    ],
  },
  {
    category: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", description: "Select notification preferences" },
      { icon: Globe, label: "Accessibility, display, and languages", description: "Manage display and language" },
    ],
  },
  {
    category: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", description: "Get help using UniteX" },
      { icon: Info, label: "About", description: "Learn more about UniteX" },
    ],
  },
];

export default function Settings({ onBack }: SettingsProps) {
  const [currentView, setCurrentView] = useState<SettingsView>("main");

  const handleSettingClick = (setting: string) => {
    switch (setting) {
      case "Account Information":
        setCurrentView("account");
        break;
      case "Security and account access":
        setCurrentView("security");
        break;
      case "Privacy and safety":
        setCurrentView("privacy");
        break;
      case "Notifications":
        setCurrentView("notifications");
        break;
      case "Accessibility, display, and languages":
        setCurrentView("display");
        break;
      case "Help Center":
        setCurrentView("help");
        break;
      case "About":
        setCurrentView("about");
        break;
      default:
        toast.info(`${setting} coming soon!`);
    }
  };

  if (currentView === "account") {
    return <AccountSettings onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "security") {
    return <SecuritySettings onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "privacy") {
    return <PrivacySettings onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "notifications") {
    return <NotificationSettings onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "display") {
    return <DisplaySettings onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "help") {
    return <HelpCenter onBack={() => setCurrentView("main")} />;
  }

  if (currentView === "about") {
    return <AboutPage onBack={() => setCurrentView("main")} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Settings</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {settingsOptions.map((section, sectionIndex) => (
          <div key={section.category} className="space-y-2">
            <h2 className="text-muted-foreground text-sm px-2 mb-3">{section.category}</h2>
            <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleSettingClick(item.label)}
                    className={`w-full px-4 py-4 flex items-center gap-3 dark:hover:bg-zinc-800 light:hover:bg-gray-50 transition-colors ${
                      itemIndex !== section.items.length - 1 ? "border-b dark:border-zinc-800 light:border-gray-200" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-foreground">{item.label}</p>
                      <p className="text-muted-foreground text-sm truncate">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Version */}
        <div className="text-center pt-8 space-y-2">
          <p className="text-muted-foreground text-sm">UniteX for Students</p>
          <p className="text-muted-foreground text-xs">Version 1.0.0</p>
        </div>
      </motion.div>
    </div>
  );
}
