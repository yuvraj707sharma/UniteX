import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronRight } from 'lucide-react';
import { badgeService, UserBadge } from '../../services/badgeService';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

interface ProfileBadgesRowProps {
  userId: string;
  onViewAll?: () => void;
  limit?: number;
}

export default function ProfileBadgesRow({ 
  userId, 
  onViewAll,
  limit = 6 
}: ProfileBadgesRowProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      const userBadges = await badgeService.getUserBadges(userId);
      setBadges(userBadges.slice(0, limit));
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400/30 bg-gray-400/5';
      case 'rare':
        return 'border-blue-400/30 bg-blue-400/5 shadow-blue-400/10';
      case 'epic':
        return 'border-purple-400/30 bg-purple-400/5 shadow-purple-400/10';
      case 'legendary':
        return 'border-yellow-400/30 bg-yellow-400/5 shadow-yellow-400/20';
      default:
        return 'border-gray-400/30 bg-gray-400/5';
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="dark:text-white light:text-black flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges
          </h3>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-16 h-20 dark:bg-zinc-800 light:bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-4 border-b dark:border-zinc-800 light:border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="dark:text-white light:text-black flex items-center gap-2 font-semibold">
          <Award className="w-5 h-5" />
          Badges
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm dark:text-blue-400 light:text-red-600 hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.badge_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex-shrink-0 w-16 flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer hover:scale-105',
              getRarityColor(badge.rarity)
            )}
            title={badge.title}
          >
            <div className="text-3xl mb-1">
              {badge.icon_emoji || '🎖️'}
            </div>
            <span className="text-[10px] font-medium text-center line-clamp-1 dark:text-zinc-400 light:text-gray-600">
              {badge.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
