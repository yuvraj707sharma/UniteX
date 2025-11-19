import { supabase } from '../lib/supabase';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Badge {
  badge_id: string;
  title: string;
  description: string;
  icon_emoji: string | null;
  icon_url: string | null;
  category: 'engagement' | 'community' | 'behavior' | 'achievement';
  criteria_type: string;
  criteria_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  is_earned: boolean;
  earned_at: string | null;
  current_progress: number;
  progress_percentage: number;
}

export interface UserBadge {
  badge_id: string;
  title: string;
  description: string;
  icon_emoji: string | null;
  icon_url: string | null;
  category: string;
  rarity: string;
  points: number;
  earned_at: string;
  is_featured: boolean;
}

export interface UserMetrics {
  posts_count: number;
  likes_received: number;
  comments_count: number;
  communities_joined: number;
  daily_active_streak: number;
  total_badges_earned: number;
  total_points: number;
}

export interface BadgeNotification {
  badge_id: string;
  title: string;
  icon_emoji: string;
  rarity: string;
}

// ============================================
// BADGE SERVICE CLASS
// ============================================

class BadgeService {
  private badgeCache: Map<string, Badge[]> = new Map();
  private userBadgesCache: Map<string, UserBadge[]> = new Map();
  private metricsCache: Map<string, UserMetrics> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch all badges with user's progress
   */
  async getAllBadgesWithProgress(userId: string, forceRefresh = false): Promise<Badge[]> {
    // Check cache first
    if (!forceRefresh && this.badgeCache.has(userId)) {
      const cached = this.badgeCache.get(userId);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_all_badges_with_status', { p_user_id: userId });

      if (error) throw error;

      // Update cache
      this.badgeCache.set(userId, data || []);
      
      // Clear cache after expiry
      setTimeout(() => {
        this.badgeCache.delete(userId);
      }, this.cacheExpiry);

      return data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  }

  /**
   * Fetch only earned badges for a user
   */
  async getUserBadges(userId: string, forceRefresh = false): Promise<UserBadge[]> {
    // Check cache first
    if (!forceRefresh && this.userBadgesCache.has(userId)) {
      const cached = this.userBadgesCache.get(userId);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_badges', { p_user_id: userId });

      if (error) throw error;

      // Update cache
      this.userBadgesCache.set(userId, data || []);
      
      // Clear cache after expiry
      setTimeout(() => {
        this.userBadgesCache.delete(userId);
      }, this.cacheExpiry);

      return data || [];
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  /**
   * Fetch user metrics summary
   */
  async getUserMetrics(userId: string, forceRefresh = false): Promise<UserMetrics | null> {
    // Check cache first
    if (!forceRefresh && this.metricsCache.has(userId)) {
      const cached = this.metricsCache.get(userId);
      if (cached) return cached;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_metrics_summary', { p_user_id: userId });

      if (error) throw error;

      const metrics = data && data.length > 0 ? data[0] : null;

      if (metrics) {
        // Update cache
        this.metricsCache.set(userId, metrics);
        
        // Clear cache after expiry
        setTimeout(() => {
          this.metricsCache.delete(userId);
        }, this.cacheExpiry);
      }

      return metrics;
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return null;
    }
  }

  /**
   * Check and award badges for user
   * Returns newly awarded badges
   */
  async checkAndAwardBadges(userId: string): Promise<BadgeNotification[]> {
    try {
      const { data, error } = await supabase
        .rpc('check_and_award_badges', { p_user_id: userId });

      if (error) throw error;

      // Clear caches to force refresh
      this.clearUserCache(userId);

      // Convert to notifications
      const notifications: BadgeNotification[] = [];
      if (data && data.length > 0) {
        for (const badge of data) {
          // Fetch badge details
          const { data: badgeData, error: badgeError } = await supabase
            .from('badges')
            .select('icon_emoji, rarity')
            .eq('id', badge.newly_awarded_badge_id)
            .single();

          if (!badgeError && badgeData) {
            notifications.push({
              badge_id: badge.newly_awarded_badge_id,
              title: badge.badge_title,
              icon_emoji: badgeData.icon_emoji || '🎖️',
              rarity: badgeData.rarity
            });
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  /**
   * Update user's daily active streak
   */
  async updateDailyActiveStreak(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_daily_active_streak', { p_user_id: userId });

      if (error) throw error;

      // Clear metrics cache
      this.metricsCache.delete(userId);
    } catch (error) {
      console.error('Error updating daily streak:', error);
    }
  }

  /**
   * Feature/unfeature a badge on user profile
   */
  async toggleFeaturedBadge(userId: string, badgeId: string, isFeatured: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_badges')
        .update({ is_featured: isFeatured })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) throw error;

      // Clear cache
      this.userBadgesCache.delete(userId);

      return true;
    } catch (error) {
      console.error('Error toggling featured badge:', error);
      return false;
    }
  }

  /**
   * Get badges grouped by category
   */
  async getBadgesByCategory(userId: string): Promise<Record<string, Badge[]>> {
    const badges = await this.getAllBadgesWithProgress(userId);
    
    const grouped: Record<string, Badge[]> = {
      engagement: [],
      community: [],
      behavior: [],
      achievement: []
    };

    badges.forEach(badge => {
      if (grouped[badge.category]) {
        grouped[badge.category].push(badge);
      }
    });

    return grouped;
  }

  /**
   * Get featured badges for user (max 3)
   */
  async getFeaturedBadges(userId: string): Promise<UserBadge[]> {
    const userBadges = await this.getUserBadges(userId);
    return userBadges
      .filter(badge => badge.is_featured)
      .slice(0, 3);
  }

  /**
   * Get recently earned badges
   */
  async getRecentBadges(userId: string, limit = 5): Promise<UserBadge[]> {
    const userBadges = await this.getUserBadges(userId);
    return userBadges.slice(0, limit);
  }

  /**
   * Get rarity color for styling
   */
  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'rare':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'epic':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'legendary':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  }

  /**
   * Get rarity color for dark/light theme
   */
  getRarityColorThemed(rarity: string, isDark: boolean): string {
    if (isDark) {
      switch (rarity) {
        case 'common':
          return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        case 'rare':
          return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'epic':
          return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        case 'legendary':
          return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        default:
          return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      }
    } else {
      switch (rarity) {
        case 'common':
          return 'text-gray-600 bg-gray-100 border-gray-300';
        case 'rare':
          return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'epic':
          return 'text-purple-600 bg-purple-50 border-purple-200';
        case 'legendary':
          return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        default:
          return 'text-gray-600 bg-gray-100 border-gray-300';
      }
    }
  }

  /**
   * Get badge icon (emoji or URL)
   */
  getBadgeIcon(badge: Badge | UserBadge): string {
    return badge.icon_emoji || '🎖️';
  }

  /**
   * Format progress text
   */
  formatProgress(current: number, target: number, criteriaType: string): string {
    const remaining = Math.max(0, target - current);
    
    switch (criteriaType) {
      case 'posts_count':
        return remaining > 0 ? `${remaining} more posts` : 'Earned!';
      case 'likes_received':
        return remaining > 0 ? `${remaining} more likes` : 'Earned!';
      case 'comments_count':
        return remaining > 0 ? `${remaining} more comments` : 'Earned!';
      case 'communities_joined':
        return remaining > 0 ? `Join ${remaining} more communities` : 'Earned!';
      case 'daily_active_streak':
        return remaining > 0 ? `${remaining} more active days` : 'Earned!';
      default:
        return remaining > 0 ? `${current}/${target}` : 'Earned!';
    }
  }

  /**
   * Clear all caches for a user
   */
  clearUserCache(userId: string): void {
    this.badgeCache.delete(userId);
    this.userBadgesCache.delete(userId);
    this.metricsCache.delete(userId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.badgeCache.clear();
    this.userBadgesCache.clear();
    this.metricsCache.clear();
  }

  /**
   * Manually increment a metric (for offline support)
   */
  async incrementMetric(
    userId: string, 
    metric: keyof Omit<UserMetrics, 'total_badges_earned' | 'total_points'>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_metrics')
        .update({ [metric]: supabase.raw(`${metric} + 1`) })
        .eq('user_id', userId);

      if (error) throw error;

      // Clear cache
      this.metricsCache.delete(userId);
    } catch (error) {
      console.error(`Error incrementing ${metric}:`, error);
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const badgeService = new BadgeService();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show badge notification to user
 */
export function showBadgeNotification(badges: BadgeNotification[]): void {
  if (badges.length === 0) return;

  // You can integrate with your toast/notification system
  badges.forEach(badge => {
    console.log(`🎉 Badge Earned: ${badge.icon_emoji} ${badge.title}`);
    
    // If using sonner or another toast library:
    // toast.success(`Badge Earned: ${badge.icon_emoji} ${badge.title}`, {
    //   description: `You earned a ${badge.rarity} badge!`,
    //   duration: 5000
    // });
  });
}

/**
 * Check badges after user action
 */
export async function checkBadgesAfterAction(
  userId: string,
  showNotification = true
): Promise<void> {
  const newBadges = await badgeService.checkAndAwardBadges(userId);
  
  if (showNotification && newBadges.length > 0) {
    showBadgeNotification(newBadges);
  }
}

/**
 * Initialize badges system for user session
 */
export async function initializeBadgesSystem(userId: string): Promise<void> {
  try {
    // Update daily active streak
    await badgeService.updateDailyActiveStreak(userId);
    
    // Check for any new badges
    await checkBadgesAfterAction(userId, false);
    
    // Prefetch badges data
    await badgeService.getAllBadgesWithProgress(userId);
    await badgeService.getUserBadges(userId);
    await badgeService.getUserMetrics(userId);
  } catch (error) {
    console.error('Error initializing badges system:', error);
  }
}
