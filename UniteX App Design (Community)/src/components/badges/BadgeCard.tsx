import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Badge as BadgeData } from '../../services/badgeService';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';

interface BadgeCardProps {
  badge: BadgeData;
  onClick?: () => void;
  compact?: boolean;
  showProgress?: boolean;
}

export default function BadgeCard({ 
  badge, 
  onClick, 
  compact = false,
  showProgress = true 
}: BadgeCardProps) {
  const getRarityColor = (rarity: string, isEarned: boolean) => {
    const baseOpacity = isEarned ? '1' : '0.3';
    
    switch (rarity) {
      case 'common':
        return {
          border: isEarned ? 'border-gray-400/30' : 'border-gray-600/20',
          bg: isEarned ? 'bg-gray-400/5' : 'bg-gray-600/5',
          text: 'text-gray-400',
          glow: 'shadow-gray-400/10'
        };
      case 'rare':
        return {
          border: isEarned ? 'border-blue-400/30' : 'border-blue-600/20',
          bg: isEarned ? 'bg-blue-400/5' : 'bg-blue-600/5',
          text: 'text-blue-400',
          glow: 'shadow-blue-400/20'
        };
      case 'epic':
        return {
          border: isEarned ? 'border-purple-400/30' : 'border-purple-600/20',
          bg: isEarned ? 'bg-purple-400/5' : 'bg-purple-600/5',
          text: 'text-purple-400',
          glow: 'shadow-purple-400/20'
        };
      case 'legendary':
        return {
          border: isEarned ? 'border-yellow-400/30' : 'border-yellow-600/20',
          bg: isEarned ? 'bg-yellow-400/5' : 'bg-yellow-600/5',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-400/20'
        };
      default:
        return {
          border: 'border-gray-600/20',
          bg: 'bg-gray-600/5',
          text: 'text-gray-400',
          glow: 'shadow-gray-400/10'
        };
    }
  };

  const colors = getRarityColor(badge.rarity, badge.is_earned);

  if (compact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all',
          colors.border,
          colors.bg,
          badge.is_earned ? colors.glow : '',
          'hover:shadow-lg'
        )}
      >
        {!badge.is_earned && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        )}
        
        <div className={cn(
          'text-3xl mb-1',
          !badge.is_earned && 'grayscale opacity-30'
        )}>
          {badge.icon_emoji || '🎖️'}
        </div>
        
        <div className={cn(
          'text-xs font-medium text-center line-clamp-1',
          colors.text,
          !badge.is_earned && 'opacity-50'
        )}>
          {badge.title}
        </div>
        
        {badge.rarity === 'legendary' && badge.is_earned && (
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full p-4 rounded-xl border transition-all text-left',
        colors.border,
        colors.bg,
        badge.is_earned ? colors.glow + ' shadow-lg' : '',
        'hover:shadow-xl'
      )}
    >
      {!badge.is_earned && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Lock className="w-6 h-6 text-gray-500 mb-2" />
            <span className="text-xs text-gray-400">Locked</span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Badge Icon */}
        <div className={cn(
          'text-5xl flex-shrink-0',
          !badge.is_earned && 'grayscale opacity-30'
        )}>
          {badge.icon_emoji || '🎖️'}
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn(
              'font-semibold text-base dark:text-white light:text-black',
              !badge.is_earned && 'opacity-50'
            )}>
              {badge.title}
            </h3>
            
            {badge.rarity === 'legendary' && badge.is_earned && (
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse flex-shrink-0" />
            )}
          </div>

          <p className={cn(
            'text-sm dark:text-gray-400 light:text-gray-600 mb-2 line-clamp-2',
            !badge.is_earned && 'opacity-50'
          )}>
            {badge.description}
          </p>

          {/* Rarity Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-full border',
              colors.text,
              colors.border,
              colors.bg
            )}>
              {badge.rarity.toUpperCase()}
            </span>
            <span className="text-xs dark:text-gray-500 light:text-gray-500">
              {badge.points} points
            </span>
          </div>

          {/* Progress Bar */}
          {showProgress && !badge.is_earned && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="dark:text-gray-400 light:text-gray-600">
                  Progress
                </span>
                <span className={cn('font-medium', colors.text)}>
                  {badge.current_progress}/{badge.criteria_value}
                </span>
              </div>
              <Progress 
                value={badge.progress_percentage} 
                className="h-1.5"
              />
              <p className="text-xs dark:text-gray-500 light:text-gray-500">
                {badge.progress_percentage.toFixed(0)}% complete
              </p>
            </div>
          )}

          {/* Earned Date */}
          {badge.is_earned && badge.earned_at && (
            <p className="text-xs dark:text-gray-500 light:text-gray-500 mt-2">
              Earned {new Date(badge.earned_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
