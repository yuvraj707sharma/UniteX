import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { Badge } from '../../services/badgeService';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface BadgeDetailModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  if (!badge) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return {
          border: 'border-gray-400/30',
          bg: 'bg-gray-400/10',
          text: 'text-gray-400',
          gradient: 'from-gray-400/20 to-gray-600/20'
        };
      case 'rare':
        return {
          border: 'border-blue-400/30',
          bg: 'bg-blue-400/10',
          text: 'text-blue-400',
          gradient: 'from-blue-400/20 to-blue-600/20'
        };
      case 'epic':
        return {
          border: 'border-purple-400/30',
          bg: 'bg-purple-400/10',
          text: 'text-purple-400',
          gradient: 'from-purple-400/20 to-purple-600/20'
        };
      case 'legendary':
        return {
          border: 'border-yellow-400/30',
          bg: 'bg-yellow-400/10',
          text: 'text-yellow-400',
          gradient: 'from-yellow-400/20 to-yellow-600/20'
        };
      default:
        return {
          border: 'border-gray-400/30',
          bg: 'bg-gray-400/10',
          text: 'text-gray-400',
          gradient: 'from-gray-400/20 to-gray-600/20'
        };
    }
  };

  const colors = getRarityColor(badge.rarity);

  const getCriteriaLabel = (criteriaType: string) => {
    switch (criteriaType) {
      case 'posts_count':
        return 'Posts Published';
      case 'likes_received':
        return 'Likes Received';
      case 'comments_count':
        return 'Comments Written';
      case 'communities_joined':
        return 'Communities Joined';
      case 'communities_created':
        return 'Communities Created';
      case 'daily_active_streak':
        return 'Active Days Streak';
      case 'projects_created':
        return 'Projects Created';
      case 'collaborations_count':
        return 'Collaborations Completed';
      default:
        return criteriaType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border dark:border-zinc-800 light:border-gray-200 shadow-2xl"
        >
          {/* Header with gradient */}
          <div className={cn(
            'relative p-6 bg-gradient-to-br',
            colors.gradient,
            'border-b dark:border-zinc-800 light:border-gray-200'
          )}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full dark:bg-zinc-900/80 light:bg-white/80 backdrop-blur-sm hover:bg-opacity-100 transition-all"
            >
              <X className="w-5 h-5 dark:text-white light:text-black" />
            </button>

            {/* Badge Icon */}
            <div className="flex flex-col items-center text-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className={cn(
                  'text-8xl mb-4',
                  !badge.is_earned && 'grayscale opacity-30'
                )}
              >
                {badge.icon_emoji || '🎖️'}
              </motion.div>

              {!badge.is_earned && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full dark:bg-zinc-900/80 light:bg-white/80 backdrop-blur-sm">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Locked</span>
                </div>
              )}

              {badge.is_earned && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Earned</span>
                </div>
              )}

              <h2 className="text-2xl font-bold dark:text-white light:text-black mb-2">
                {badge.title}
              </h2>

              {/* Rarity Badge */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-semibold px-3 py-1 rounded-full border',
                  colors.text,
                  colors.border,
                  colors.bg
                )}>
                  {badge.rarity.toUpperCase()}
                </span>
                {badge.rarity === 'legendary' && (
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold dark:text-zinc-400 light:text-gray-600 uppercase mb-2">
                Description
              </h3>
              <p className="dark:text-white light:text-black text-base leading-relaxed">
                {badge.description}
              </p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-sm font-semibold dark:text-zinc-400 light:text-gray-600 uppercase mb-2">
                Requirements
              </h3>
              <div className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-4 border dark:border-zinc-800 light:border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm dark:text-zinc-400 light:text-gray-600">
                    {getCriteriaLabel(badge.criteria_type)}
                  </span>
                  <span className={cn('text-sm font-semibold', colors.text)}>
                    {badge.current_progress} / {badge.criteria_value}
                  </span>
                </div>
                <Progress 
                  value={badge.progress_percentage} 
                  className="h-2 mb-2"
                />
                <p className="text-xs dark:text-zinc-500 light:text-gray-500">
                  {badge.progress_percentage.toFixed(1)}% complete
                </p>
              </div>
            </div>

            {/* Rewards */}
            <div>
              <h3 className="text-sm font-semibold dark:text-zinc-400 light:text-gray-600 uppercase mb-2">
                Rewards
              </h3>
              <div className="flex items-center gap-3">
                <div className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-4 flex-1 border dark:border-zinc-800 light:border-gray-200">
                  <div className="text-2xl mb-1">⭐</div>
                  <p className="text-2xl font-bold dark:text-white light:text-black">
                    {badge.points}
                  </p>
                  <p className="text-xs dark:text-zinc-500 light:text-gray-500">Points</p>
                </div>
                <div className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-4 flex-1 border dark:border-zinc-800 light:border-gray-200">
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-sm font-semibold dark:text-white light:text-black">
                    Profile Badge
                  </p>
                  <p className="text-xs dark:text-zinc-500 light:text-gray-500">Display</p>
                </div>
              </div>
            </div>

            {/* Category & Earned Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold dark:text-zinc-400 light:text-gray-600 uppercase mb-2">
                  Category
                </h3>
                <p className="dark:text-white light:text-black capitalize">
                  {badge.category}
                </p>
              </div>
              {badge.is_earned && badge.earned_at && (
                <div>
                  <h3 className="text-sm font-semibold dark:text-zinc-400 light:text-gray-600 uppercase mb-2">
                    Earned On
                  </h3>
                  <p className="dark:text-white light:text-black">
                    {new Date(badge.earned_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button
              onClick={onClose}
              className="w-full dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
