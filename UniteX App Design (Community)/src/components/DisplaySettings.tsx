import { ArrowLeft, Sun, Moon, Type, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";

interface DisplaySettingsProps {
  onBack: () => void;
}

export default function DisplaySettings({ onBack }: DisplaySettingsProps) {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [fontSize, setFontSize] = useState("medium");

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Display and Languages</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* Theme */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Theme</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setTheme("light");
                  toast.success("Light theme enabled");
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm ${theme === "light" ? "text-primary" : "text-muted-foreground"}`}>Light</p>
              </button>

              <button
                onClick={() => {
                  setTheme("dark");
                  toast.success("Dark theme enabled");
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`}>Dark</p>
              </button>

              <button
                onClick={() => {
                  setTheme("system");
                  toast.success("System theme enabled");
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className="w-6 h-6 mx-auto mb-2 relative">
                  <Sun className={`w-3 h-3 absolute top-0 left-0 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                  <Moon className={`w-3 h-3 absolute bottom-0 right-0 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <p className={`text-sm ${theme === "system" ? "text-primary" : "text-muted-foreground"}`}>System</p>
              </button>
            </div>
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Font Size</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-5 h-5 text-muted-foreground" />
              <Select value={fontSize} onValueChange={(value) => {
                setFontSize(value);
                toast.success(`Font size set to ${value}`);
              }}>
                <SelectTrigger className="dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className={`text-foreground ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : fontSize === "xlarge" ? "text-xl" : "text-base"}`}>
                Preview text
              </p>
              <p className={`text-muted-foreground ${fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : fontSize === "xlarge" ? "text-lg" : "text-sm"}`}>
                This is how your posts will appear
              </p>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <h2 className="text-foreground px-2">Language</h2>
          <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Select value={language} onValueChange={(value) => {
                setLanguage(value);
                toast.success("Language updated");
              }}>
                <SelectTrigger className="dark:bg-zinc-800 light:bg-gray-100 dark:border-zinc-700 light:border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 light:bg-white light:border-gray-200">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
