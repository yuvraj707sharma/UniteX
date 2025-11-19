import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, TrendingUp, Users, Flame, Trophy, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge as BadgeUI } from '../ui/badge';
import { Button } from '../ui/button';
import { badgeService, Badge, UserMetrics } from '../../services/badgeService';
import BadgeCard from './BadgeCard';
import BadgeDetailModal from './BadgeDetailModal';
import { supabase } from '../../lib/supabase';

interface BadgesPageProps {
  onBack?: () => void;
}

export default function BadgesPage({ onBack }: BadgesPageProps) {
  const [badges, setBadges] = useState<Record<string, Badge[]>>({
    engagement: [],
    community: [],
    behavior: [],
    achievement: []
  });
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    loadBadgesData();
  }, []);

  const loadBadgesData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [badgesByCategory, userMetrics] = await Promise.all([
        badgeService.getBadgesByCategory(user.id),
        badgeService.getUserMetrics(user.id)
      ]);

      setBadges(badgesByCategory);
      setMetrics(userMetrics);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement':
        return <TrendingUp className="w-4 h-4" />;
      case 'community':
        return <Users className="w-4 h-4" />;
      case 'behavior':
        return <Flame className="w-4 h-4" />;
      case 'achievement':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const filterBadges = (badgeList: Badge[]) => {
    switch (filter) {
      case 'earned':
        return badgeList.filter(b => b.is_earned);
      case 'locked':
        return badgeList.filter(b => !b.is_earned);
      default:
        return badgeList;
    }
  };

  const getTotalBadges = () => {
    return Object.values(badges).reduce((sum, list) => sum + list.length, 0);
  };

  const getEarnedBadges = () => {
    return Object.values(badges).reduce(
      (sum, list) => sum + list.filter(b => b.is_earned).length,
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
            <ArrowLeft className="w-5 h-5 dark:text-white light:text-black" />
          </button>
          <div className="flex-1">
            <h1 className="dark:text-white light:text-black text-xl font-semibold">Badges</h1>
            <p className="text-sm dark:text-zinc-500 light:text-gray-500">
              {getEarnedBadges()} of {getTotalBadges()} earned
            </p>
          </div>
          <Award className="w-6 h-6 text-yellow-400" />
        </div>
      </div>

      {/* Stats Overview */}
      {metrics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 space-y-3"
        >
          {/* Points Card */}
          <div className="dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-purple-500/10 light:bg-gradient-to-br light:from-red-50 light:to-pink-50 rounded-2xl p-4 border dark:border-blue-500/20 light:border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm dark:text-zinc-400 light:text-gray-600 mb-1">Total Points</p>
                <p className="text-3xl font-bold dark:text-white light:text-black">
                  {metrics.total_points.toLocaleString()}
                </p>
              </div>
              <div className="text-5xl">🏆</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-3 border dark:border-zinc-800 light:border-gray-200">
              <div className="text-2xl mb-1">🔥</div>
              <p className="text-lg font-bold dark:text-white light:text-black">
                {metrics.daily_active_streak}
              </p>
              <p className="text-xs dark:text-zinc-500 light:text-gray-500">Day Streak</p>
            </div>
            <div className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-3 border dark:border-zinc-800 light:border-gray-200">
              <div className="text-2xl mb-1">📝</div>
              <p className="text-lg font-bold dark:text-white light:text-black">
                {metrics.posts_count}
              </p>
              <p className="text-xs dark:text-zinc-500 light:text-gray-500">Posts</p>
            </div>
            <div className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-3 border dark:border-zinc-800 light:border-gray-200">
              <div className="text-2xl mb-1">⭐</div>
              <p className="text-lg font-bold dark:text-white light:text-black">
                {metrics.likes_received}
              </p>
              <p className="text-xs dark:text-zinc-500 light:text-gray-500">Likes</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Buttons */}
      <div className="px-4 pb-3 flex gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex-1"
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter === 'earned' ? 'default' : 'outline'}
          onClick={() => setFilter('earned')}
          className="flex-1"
        >
          Earned
        </Button>
        <Button
          size="sm"
          variant={filter === 'locked' ? 'default' : 'outline'}
          onClick={() => setFilter('locked')}
          className="flex-1"
        >
          Locked
        </Button>
      </div>

      {/* Badges Tabs */}
      <Tabs defaultValue="engagement" className="w-full">
        <div className="sticky top-[73px] z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
          <TabsList className="w-full bg-transparent rounded-none h-auto p-0 grid grid-cols-4">
            {(['engagement', 'community', 'behavior', 'achievement'] as const).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex flex-col items-center gap-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:dark:border-blue-500 data-[state=active]:light:border-red-600 data-[state=active]:bg-transparent bg-transparent dark:text-zinc-500 light:text-gray-500 data-[state=active]:dark:text-white data-[state=active]:light:text-black"
              >
                {getCategoryIcon(category)}
                <span className="text-xs">{getCategoryLabel(category)}</span>
                <BadgeUI className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
                  {filterBadges(badges[category]).length}
                </BadgeUI>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {(['engagement', 'community', 'behavior', 'achievement'] as const).map((category) => (
          <TabsContent key={category} value={category} className="m-0 p-4 space-y-3">
            <AnimatePresence mode="wait">
              {filterBadges(badges[category]).length > 0 ? (
                filterBadges(badges[category]).map((badge, index) => (
                  <motion.div
                    key={badge.badge_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BadgeCard
                      badge={badge}
                      onClick={() => setSelectedBadge(badge)}
                      showProgress={true}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-center dark:text-zinc-400 light:text-gray-600">
                    No badges found with the current filter
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}
