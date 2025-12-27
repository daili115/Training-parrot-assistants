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
import { Target, Flame, Calendar, Clock, Award, Play, Pause, RotateCcw, X, Activity } from 'lucide-react';

interface TrainingTrackerProps {
  userId: string;
  onClose?: () => void;
  onTrainingComplete?: () => void;
  onTrainingStart?: () => void;
  onTrainingEnd?: (stats: any) => void;
}

export const TrainingTracker: React.FC<TrainingTrackerProps> = ({
  userId,
  onClose,
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
      <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 modal-overlay">
      <div className="bg-white dark:bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[85vh] rounded-[40px] flex flex-col shadow-2xl animate-scale-in">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">训练全景追踪</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Training Statistics & Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
          {/* 勋章通知 */}
          <div className="space-y-4">
            {badgeNotifications.map((notification, index) => (
              <BadgeNotification
                key={index}
                notification={notification}
                onClose={() => closeBadgeNotification(index)}
              />
            ))}
          </div>

          {/* 连续训练进度 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">连续训练进程</h4>
            {userStreak && (
              <StreakProgress
                currentStreak={userStreak.currentStreak}
                targetStreak={7}
                showMotivation={true}
              />
            )}
          </div>

          {/* 训练控制面板 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">训练引擎控制</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <Activity className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-200">训练会话状态</span>
                </div>
                {isTrainingActive && (
                  <div className="px-4 py-2 bg-orange-500 text-white rounded-2xl font-mono font-bold text-xl shadow-lg shadow-orange-500/20">
                    {formatTime(currentSessionDuration)}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                {!isTrainingActive ? (
                  <button
                    onClick={startTraining}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white rounded-3xl font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span className="text-lg">开启今日特训</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={endTraining}
                      className="flex items-center justify-center gap-2 px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                      <Award className="w-5 h-5" />
                      <span>结算训练成果</span>
                    </button>
                    <button
                      onClick={resetSession}
                      className="flex items-center justify-center gap-2 px-6 py-5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-3xl font-black transition-all active:scale-95"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>重置本番</span>
                    </button>
                  </div>
                )}

                {isTrainingActive && (
                  <div className="mt-2 flex items-center gap-2 text-orange-500 font-bold text-sm animate-pulse">
                    <Flame className="w-4 h-4" />
                    <span>正在进行高强度学习...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 训练统计 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全量数据分析</h4>
            {userStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">训练总日</span>
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{userStats.totalTrainingDays}</span>
                    <span className="text-xs text-slate-400 font-bold">DAYS</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">累计时长</span>
                    <Clock className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{userStats.totalDuration}</span>
                    <span className="text-xs text-slate-400 font-bold">MINS</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">最长连胜</span>
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{userStats.longestStreak}</span>
                    <span className="text-xs text-slate-400 font-bold">DAYS</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">今日状态</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-800 dark:text-white">{todayRecord ? '已达标' : '未开始'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 勋章展示 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">勋章成就详情</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-4 border border-slate-100 dark:border-slate-800">
              <BadgeDisplay compact={false} showDetails={true} />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex justify-center">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            关闭追踪面板
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingTracker;