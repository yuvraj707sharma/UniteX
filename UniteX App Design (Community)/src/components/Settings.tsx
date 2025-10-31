import { ArrowLeft, ChevronRight, User, Bell, Shield, Eye, Globe, HelpCircle, Info } from "lucide-react";
import { motion } from "motion/react";

interface SettingsProps {
  onBack: () => void;
}

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
