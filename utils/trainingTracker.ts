import { TrainingRecord, UserStreak, StreakReward, GameStats } from '../types';
import { loadTrainingRecords, saveTrainingRecords, loadUserStreak, saveUserStreak, loadStreakRewards, saveStreakRewards, loadGameStats } from './storage';

/**
 * 获取日期字符串 (YYYY-MM-DD)
 */
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * 检查两个日期是否相邻
 */
export function isConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * 检查是否是今天
 */
export function isToday(dateString: string): boolean {
  return dateString === getDateString();
}

/**
 * 检查是否是昨天
 */
export function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === getDateString(yesterday);
}

/**
 * 创建新的训练记录
 */
export function createTrainingRecord(userId: string, sessionCount: number = 1, totalDuration: number = 0): TrainingRecord {
  const now = Date.now();
  const today = getDateString();

  return {
    id: `training_${now}`,
    userId,
    date: today,
    completed: true,
    sessionCount,
    totalDuration,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 获取今日训练记录
 */
export function getTodayTrainingRecord(userId: string): TrainingRecord | null {
  const records = loadTrainingRecords();
  const today = getDateString();
  return records.find(record => record.userId === userId && record.date === today) || null;
}

/**
 * 更新或创建今日训练记录
 */
/**
 * 更新或创建今日训练记录
 * @param userId 用户ID
 * @param totalPlays 本次增加的播放次数
 * @param sessionDuration 本次增加的训练时长（分钟）
 */
export function updateTodayTraining(userId: string, totalPlays: number = 0, sessionDuration: number = 0): TrainingRecord {
  const records = loadTrainingRecords();
  const today = getDateString();

  // 查找索引而不是查找对象，确保修改的是数组中的同一个引用
  const existingIndex = records.findIndex(record => record.userId === userId && record.date === today);

  if (existingIndex !== -1) {
    // 更新现有记录
    records[existingIndex].sessionCount += totalPlays; // 这里我们将播放次数记入 sessionCount 或者如果是想记入总遍数
    records[existingIndex].totalDuration += sessionDuration;
    records[existingIndex].updatedAt = Date.now();
    saveTrainingRecords(records);
    return records[existingIndex];
  } else {
    // 创建新记录
    const newRecord = createTrainingRecord(userId, totalPlays, sessionDuration);
    records.push(newRecord);
    saveTrainingRecords(records);
    return newRecord;
  }
}


/**
 * 计算用户连续训练天数
 */
export function calculateUserStreak(userId: string): UserStreak {
  const records = loadTrainingRecords()
    .filter(record => record.userId === userId && record.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (records.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastTrainingDate: null,
      totalTrainingDays: 0
    };
  }

  const userStreak = loadUserStreak();
  const uniqueDates = [...new Set(records.map(r => r.date))].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // 计算当前连续天数
  let currentStreak = 0;
  let longestStreak = userStreak.longestStreak;
  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  // 检查最近的训练是否是今天或昨天
  const lastTrainingDate = uniqueDates[0];
  if (!isToday(lastTrainingDate) && !isYesterday(lastTrainingDate)) {
    // 如果最后一次训练不是今天或昨天，连续训练已中断
    currentStreak = 0;
  } else {
    // 计算连续训练天数
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (isConsecutiveDays(uniqueDates[i], uniqueDates[i - 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 更新最长连续天数
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const updatedStreak: UserStreak = {
    currentStreak,
    longestStreak,
    lastTrainingDate,
    totalTrainingDays: uniqueDates.length
  };

  saveUserStreak(updatedStreak);
  return updatedStreak;
}

/**
 * 检查并授予连续训练奖励
 */
export function checkAndAwardStreakRewards(userId: string): StreakReward[] {
  const userStreak = calculateUserStreak(userId);
  const rewards = loadStreakRewards();
  const newlyAwarded: StreakReward[] = [];

  rewards.forEach(reward => {
    if (!reward.isClaimed && userStreak.currentStreak >= reward.streakDays) {
      reward.isClaimed = true;
      reward.claimedAt = Date.now();
      newlyAwarded.push({ ...reward });
    }
  });

  if (newlyAwarded.length > 0) {
    saveStreakRewards(rewards);
  }

  return newlyAwarded;
}

/**
 * 获取用户的训练统计
 */
export function getUserTrainingStats(userId: string) {
  const records = loadTrainingRecords().filter(record => record.userId === userId);
  const userStreak = calculateUserStreak(userId);

  const totalSessions = records.reduce((sum, record) => sum + record.sessionCount, 0);
  const totalDuration = records.reduce((sum, record) => sum + record.totalDuration, 0);
  const averageDuration = records.length > 0 ? totalDuration / records.length : 0;

  return {
    totalSessions,
    totalDuration,
    averageDuration: Math.round(averageDuration),
    totalTrainingDays: userStreak.totalTrainingDays,
    currentStreak: userStreak.currentStreak,
    longestStreak: userStreak.longestStreak,
    lastTrainingDate: userStreak.lastTrainingDate
  };
}

/**
 * 重置用户训练数据（用于测试）
 */
export function resetUserTrainingData(userId: string): void {
  const records = loadTrainingRecords();
  const filteredRecords = records.filter(record => record.userId !== userId);
  saveTrainingRecords(filteredRecords);

  const defaultStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastTrainingDate: null,
    totalTrainingDays: 0
  };
  saveUserStreak(defaultStreak);

  const rewards = loadStreakRewards();
  rewards.forEach(reward => {
    reward.isClaimed = false;
    reward.claimedAt = null;
  });
  saveStreakRewards(rewards);
}

/**
 * 获取用户的游戏统计
 */
export function getUserGameStats(): GameStats {
  return loadGameStats();
}