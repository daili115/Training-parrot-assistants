import { Badge, StreakReward, AwardNotification } from '../types';
import { loadBadges, saveBadges } from './storage';
import { getUserTrainingStats } from './trainingTracker';


/**
 * 将StreakReward转换为Badge
 */
export function convertRewardToBadge(reward: StreakReward): Badge {
  return {
    id: reward.badgeId,
    name: reward.name,
    description: reward.description,
    icon: reward.icon,
    unlockedAt: reward.claimedAt!
  };
}

/**
 * 勋章授予管理器
 */
export class BadgeAwardManager {
  private static instance: BadgeAwardManager;
  private listeners: Set<(notification: AwardNotification) => void> = new Set();

  private constructor() { }

  public static getInstance(): BadgeAwardManager {
    if (!BadgeAwardManager.instance) {
      BadgeAwardManager.instance = new BadgeAwardManager();
    }
    return BadgeAwardManager.instance;
  }

  /**
   * 添加勋章授予监听器
   */
  public addAwardListener(listener: (notification: AwardNotification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 触发勋章授予通知
   */
  private notifyAward(badge: Badge, type: AwardNotification['type']): void {
    const notification: AwardNotification = {
      id: crypto.randomUUID(),
      title: '获得新勋章！',
      badge,
      message: `恭喜获得勋章：${badge.name}！${badge.description}`,
      type,
      icon: badge.icon,
      createdAt: Date.now()
    };

    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('勋章通知监听器错误:', error);
      }
    });
  }

  /**
   * 授予连续训练勋章
   */
  public awardStreakBadge(reward: StreakReward): Badge | null {
    if (!reward.isClaimed || !reward.claimedAt) {
      return null;
    }

    const badges = loadBadges();
    const existingBadge = badges.find(b => b.id === reward.badgeId);

    if (existingBadge) {
      return existingBadge; // 已经获得过的勋章
    }

    const newBadge = convertRewardToBadge(reward);
    badges.push(newBadge);
    saveBadges(badges);

    this.notifyAward(newBadge, 'streak');
    return newBadge;
  }

  /**
   * 授予里程碑勋章
   */
  public awardMilestoneBadge(userId: string): Badge[] {
    const awardedBadges: Badge[] = [];
    const stats = getUserTrainingStats(userId);
    const badges = loadBadges();
    const existingIds = new Set(badges.map(b => b.id));

    // 总训练天数里程碑
    const dayMilestones = [
      { days: 1, id: 'days_1', name: '初次尝试', description: '完成第1天训练', icon: '🌟' },
      { days: 7, id: 'days_7', name: '一周新手', description: '完成第7天训练', icon: '📅' },
      { days: 30, id: 'days_30', name: '月度达人', description: '完成第30天训练', icon: '📆' },
      { days: 100, id: 'days_100', name: '百日专家', description: '完成第100天训练', icon: '💯' },
      { days: 365, id: 'days_365', name: '年度冠军', description: '完成第365天训练', icon: '🏆' }
    ];

    dayMilestones.forEach(milestone => {
      if (stats.totalTrainingDays >= milestone.days && !existingIds.has(milestone.id)) {
        const newBadge: Badge = {
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          icon: milestone.icon,
          unlockedAt: Date.now()
        };
        badges.push(newBadge);
        awardedBadges.push(newBadge);
        this.notifyAward(newBadge, 'milestone');
      }
    });

    // 总会话数里程碑
    const sessionMilestones = [
      { sessions: 10, id: 'sessions_10', name: '十连击', description: '累计完成10次训练', icon: '🔟' },
      { sessions: 50, id: 'sessions_50', name: '五十勇士', description: '累计完成50次训练', icon: '5️⃣' },
      { sessions: 100, id: 'sessions_100', name: '百炼成钢', description: '累计完成100次训练', icon: '💯' },
      { sessions: 500, id: 'sessions_500', name: '五百宗师', description: '累计完成500次训练', icon: '5️⃣0️⃣0️⃣' },
      { sessions: 1000, id: 'sessions_1000', name: '千锤百炼', description: '累计完成1000次训练', icon: '1️⃣0️⃣0️⃣0️⃣' }
    ];

    sessionMilestones.forEach(milestone => {
      if (stats.totalSessions >= milestone.sessions && !existingIds.has(milestone.id)) {
        const newBadge: Badge = {
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          icon: milestone.icon,
          unlockedAt: Date.now()
        };
        badges.push(newBadge);
        awardedBadges.push(newBadge);
        this.notifyAward(newBadge, 'milestone');
      }
    });

    if (awardedBadges.length > 0) {
      saveBadges(badges);
    }

    return awardedBadges;
  }

  /**
   * 授予特殊勋章
   */
  public awardSpecialBadge(badgeId: string, name: string, description: string, icon: string): Badge | null {
    const badges = loadBadges();
    const existingBadge = badges.find(b => b.id === badgeId);

    if (existingBadge) {
      return existingBadge;
    }

    const newBadge: Badge = {
      id: badgeId,
      name,
      description,
      icon,
      unlockedAt: Date.now()
    };

    badges.push(newBadge);
    saveBadges(badges);
    this.notifyAward(newBadge, 'special');

    return newBadge;
  }

  /**
   * 获取所有已获得的勋章
   */
  public getAllAwardedBadges(): Badge[] {
    return loadBadges();
  }

  /**
   * 检查是否已获得特定勋章
   */
  public hasBadge(badgeId: string): boolean {
    const badges = loadBadges();
    return badges.some(b => b.id === badgeId);
  }
}

/**
 * 全局勋章管理器实例
 */
export const badgeManager = BadgeAwardManager.getInstance();