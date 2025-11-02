import { ArrowLeft, Search, Book, MessageCircle, Mail, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface HelpCenterProps {
  onBack: () => void;
}

const helpTopics = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of UniteX",
    articles: ["Creating your first post", "Joining communities", "Finding collaborators"],
  },
  {
    icon: MessageCircle,
    title: "Messaging & Communication",
    description: "Chat with other students",
    articles: ["Sending messages", "Creating group chats", "Video calls"],
  },
  {
    icon: FileText,
    title: "Projects & Collaboration",
    description: "Work together on projects",
    articles: ["Starting a project", "Managing collaborators", "Project visibility"],
  },
];

export default function HelpCenter({ onBack }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = helpTopics.filter((topic) =>
    searchQuery
      ? topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground text-xl">Help Center</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-6"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 dark:bg-zinc-900 light:bg-gray-100 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none dark:focus:ring-2 dark:focus:ring-blue-500 light:focus:ring-2 light:focus:ring-red-600 border dark:border-zinc-800 light:border-gray-200"
          />
        </div>

        {/* Help Topics */}
        <div className="space-y-3">
          {filteredTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 dark:bg-blue-500/10 light:bg-red-50 rounded-lg">
                    <Icon className="w-5 h-5 dark:text-blue-500 light:text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-foreground">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm">{topic.description}</p>
                  </div>
                </div>
                <div className="space-y-2 ml-11">
                  {topic.articles.map((article) => (
                    <button
                      key={article}
                      onClick={() => toast.info(`Opening: ${article}`)}
                      className="block w-full text-left text-sm dark:text-blue-400 light:text-red-600 hover:underline"
                    >
                      {article}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="dark:bg-zinc-900 light:bg-white rounded-2xl border dark:border-zinc-800 light:border-gray-200 p-6 text-center">
          <Mail className="w-12 h-12 dark:text-blue-500 light:text-red-600 mx-auto mb-3" />
          <h3 className="text-foreground mb-2">Still need help?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Our support team is here to help you
          </p>
          <button
            onClick={() => toast.success("Support email: support@unitex.edu")}
            className="w-full py-3 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white rounded-full transition-colors"
          >
            Contact Support
          </button>
        </div>
      </motion.div>
    </div>
  );
}
