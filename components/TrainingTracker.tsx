import React, { useState, useEffect, useCallback } from 'react';
import {
  updateTodayTraining,
  calculateUserStreak,
  checkAndAwardStreakRewards,
  getUserTrainingStats,
  getTodayTrainingRecord
} from '../utils/trainingTracker';
import { badgeManager } from '../utils/badgeManager';
import { notificationManager } from '../components/NotificationManager';
import { BadgeDisplay, StreakProgress } from '../components/BadgeDisplay';
import { BadgeNotification } from '../components/BadgeDisplay';
import { AwardNotification } from '../types';
import { Target, Flame, Calendar, Clock, Award, Play, Pause, RotateCcw } from 'lucide-react';

interface TrainingTrackerProps {
  userId: string;
  onClose?: () => void;
  onTrainingComplete?: () => void;
  onTrainingStart?: () => void;
  onTrainingEnd?: (stats: any) => void;
}

export const TrainingTracker: React.FC<TrainingTrackerProps> = ({
  userId,
  onTrainingStart,
  onTrainingEnd
}) => {
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [userStreak, setUserStreak] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [badgeNotifications, setBadgeNotifications] = useState<AwardNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化数据
  useEffect(() => {
    const initializeData = () => {
      const stats = getUserTrainingStats(userId);
      const streak = calculateUserStreak(userId);
      const todayRec = getTodayTrainingRecord(userId);

      setUserStats(stats);
      setUserStreak(streak);
      setTodayRecord(todayRec);
      setIsInitialized(true);
    };

    initializeData();

    // 设置勋章授予监听器
    const unsubscribe = badgeManager.addAwardListener((notification) => {
      setBadgeNotifications(prev => [...prev, notification]);
    });

    return unsubscribe;
  }, [userId]);

  // 会话计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTrainingActive && sessionStartTime) {
      interval = setInterval(() => {
        setCurrentSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTrainingActive, sessionStartTime]);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始训练
  const startTraining = useCallback(() => {
    setIsTrainingActive(true);
    setSessionStartTime(Date.now());
    setCurrentSessionDuration(0);
    onTrainingStart?.();
  }, [onTrainingStart]);

  // 结束训练
  const endTraining = useCallback(() => {
    if (!sessionStartTime) return;

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const sessionMinutes = Math.floor(sessionDuration / 60);

    // 更新今日训练记录
    const updatedRecord = updateTodayTraining(userId, sessionMinutes);

    // 检查并授予连续训练奖励
    const newRewards = checkAndAwardStreakRewards(userId);

    // 检查里程碑勋章
    const newMilestoneBadges = badgeManager.awardMilestoneBadge(userId);

    // 显示训练完成通知
    notificationManager.showTrainingCompleted(1, sessionMinutes);

    // 更新状态
    const stats = getUserTrainingStats(userId);
    const streak = calculateUserStreak(userId);

    setUserStats(stats);
    setUserStreak(streak);
    setTodayRecord(updatedRecord);
    setIsTrainingActive(false);
    setSessionStartTime(null);
    setCurrentSessionDuration(0);

    onTrainingEnd?.({
      sessionDuration,
      sessionMinutes,
      totalStats: stats,
      streak: streak,
      newRewards,
      newMilestoneBadges
    });
  }, [userId, sessionStartTime, onTrainingEnd]);

  // 重置当前会话
  const resetSession = useCallback(() => {
    setIsTrainingActive(false);
    setSessionStartTime(null);
    setCurrentSessionDuration(0);
  }, []);

  // 关闭勋章通知
  const closeBadgeNotification = (index: number) => {
    setBadgeNotifications(prev => prev.filter((_, i) => i !== index));
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 勋章通知 */}
      {badgeNotifications.map((notification, index) => (
        <BadgeNotification
          key={index}
          notification={notification}
          onClose={() => closeBadgeNotification(index)}
        />
      ))}

      {/* 连续训练进度 */}
      {userStreak && (
        <StreakProgress
          currentStreak={userStreak.currentStreak}
          targetStreak={7}
          showMotivation={true}
        />
      )}

      {/* 训练控制面板 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            训练控制
          </h3>
          {isTrainingActive && (
            <div className="text-2xl font-mono font-bold text-orange-600 dark:text-orange-400">
              {formatTime(currentSessionDuration)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4">
          {!isTrainingActive ? (
            <button
              onClick={startTraining}
              className="flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              开始训练
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={endTraining}
                className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Award className="w-5 h-5 mr-2" />
                完成训练
              </button>
              <button
                onClick={resetSession}
                className="flex items-center px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </button>
            </div>
          )}
        </div>

        {isTrainingActive && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4 mr-1" />
              训练中...
            </div>
          </div>
        )}
      </div>

      {/* 今日训练状态 */}
      {todayRecord && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">今日训练</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {todayRecord.sessionCount} 次训练，总计 {todayRecord.totalDuration} 分钟
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ✅
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">已完成</div>
            </div>
          </div>
        </div>
      )}

      {/* 训练统计 */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总训练天数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats.totalTrainingDays}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500 opacity-70" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总会话数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats.totalSessions}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500 opacity-70" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总时长</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats.totalDuration}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">分钟</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-lg">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">最长连续</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats.longestStreak}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">天</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500 opacity-70" />
            </div>
          </div>
        </div>
      )}

      {/* 勋章展示 */}
      <BadgeDisplay compact={false} showDetails={true} />
    </div>
  );
};

export default TrainingTracker;