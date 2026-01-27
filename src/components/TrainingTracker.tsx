import React, { useState, useEffect, useCallback } from 'react';
import { Trophy } from 'lucide-react';
import {
  updateTodayTraining,
  calculateUserStreak,
  checkAndAwardStreakRewards,
  getUserTrainingStats,
  getTodayTrainingRecord,
  getUserGameStats
} from '../utils/trainingTracker';
import { badgeManager } from '../utils/badgeManager';
import { notificationManager } from '../components/NotificationManager';
import { BadgeDisplay, StreakProgress } from '../components/BadgeDisplay';
import { BadgeNotification } from '../components/BadgeDisplay';
import { AwardNotification, GameStats } from '../types';
import { Target, Flame, Calendar, Clock, Award, Play, Pause, RotateCcw, X, Activity, Bird, Gamepad2 } from 'lucide-react';

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
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [badgeNotifications, setBadgeNotifications] = useState<AwardNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化数据
  useEffect(() => {
    const initializeData = () => {
      const stats = getUserTrainingStats(userId);
      const streak = calculateUserStreak(userId);
      const todayRec = getTodayTrainingRecord(userId);
      const gameStats = getUserGameStats();

      setUserStats(stats);
      setUserStreak(streak);
      setTodayRecord(todayRec);
      setGameStats(gameStats);
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-8 modal-overlay">
      <div className="bg-white dark:bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[95vh] md:max-h-[85vh] rounded-[24px] md:rounded-[40px] flex flex-col shadow-2xl animate-scale-in">
        <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 relative overflow-hidden">
          {/* Decorative Mascot */}
          <div className="absolute -right-4 -top-2 w-20 md:w-28 opacity-20 pointer-events-none transform rotate-12">
            <img src="/parrot_mascot.png" alt="Mascot" className="w-full h-auto" />
          </div>

          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <div className="p-2 md:p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl md:rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <Bird className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex gap-1 mb-1">
                <span className="feather-decoration feather-red !w-3"></span>
                <span className="feather-decoration feather-green !w-3"></span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white truncate">训练全景追踪</h2>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Training Statistics & Insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 md:p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl md:rounded-2xl transition-all relative z-10"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 no-scrollbar space-y-6 md:space-y-8">
          {/* 勋章通知 */}
          {badgeNotifications.length > 0 && (
            <div className="space-y-4">
              {badgeNotifications.map((notification, index) => (
                <BadgeNotification
                  key={index}
                  notification={notification}
                  onClose={() => closeBadgeNotification(index)}
                />
              ))}
            </div>
          )}

          {/* 连续训练进度 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">连续训练进程</h4>
            {userStreak && (
              <StreakProgress
                currentStreak={userStreak.currentStreak}
                targetStreak={7}
                showMotivation={true}
              />
            )}
          </div>

          {/* 训练控制面板 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">训练引擎控制</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[24px] md:rounded-[32px] p-5 md:p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg md:rounded-xl">
                    <Activity className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-sm md:text-base font-black text-slate-700 dark:text-slate-200">训练会话状态</span>
                </div>
                {isTrainingActive && (
                  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-orange-500 text-white rounded-xl md:rounded-2xl font-mono font-bold text-lg md:text-xl shadow-lg shadow-orange-500/20">
                    {formatTime(currentSessionDuration)}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                {!isTrainingActive ? (
                  <button
                    onClick={startTraining}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 md:py-5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white rounded-2xl md:rounded-3xl font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95  parrot-bounce"
                  >
                    <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    <span className="text-base md:text-lg">开启今日特训</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 md:gap-4 w-full">
                    <button
                      onClick={endTraining}
                      className="flex items-center justify-center gap-2 px-6 py-4 md:py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl md:rounded-3xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95  parrot-bounce"
                    >
                      <Award className="w-5 h-5" />
                      <span className="text-sm md:text-base">结算训练成果</span>
                    </button>
                    <button
                      onClick={resetSession}
                      className="flex items-center justify-center gap-2 px-6 py-4 md:py-5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-2xl md:rounded-3xl font-black transition-all active:scale-95 "
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="text-sm md:text-base">重置本次</span>
                    </button>
                  </div>
                )}

                {isTrainingActive && (
                  <div className="mt-2 flex items-center gap-2 text-orange-500 font-bold text-xs md:text-sm animate-pulse">
                    <Flame className="w-4 h-4" />
                    <span>正在进行高强度学习...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 训练统计 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">全量数据分析</h4>
            {userStats && (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">训练总日</span>
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{userStats.totalTrainingDays}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Days</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">累计时长</span>
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{userStats.totalDuration}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Mins</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">最长连练</span>
                    <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{userStats.longestStreak}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Days</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">今日状态</span>
                    <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm md:text-xl font-black text-slate-800 dark:text-white">{todayRecord ? '已达标' : '未开始'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 游戏统计 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">游戏数据统计</h4>
            {gameStats && (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">总游戏数</span>
                    <Gamepad2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{gameStats.totalGamesPlayed}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Games</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">最高分数</span>
                    <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{gameStats.bestScore}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Points</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">完成数</span>
                    <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{gameStats.gamesCompleted}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Completed</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">完美通关</span>
                    <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{gameStats.perfectGames}</span>
                    <span className="text-[8px] md:text-xs text-slate-400 font-bold uppercase">Perfect</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 勋章展示 */}
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">勋章成就详情</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[24px] md:rounded-[32px] p-3 md:p-4 border border-slate-100 dark:border-slate-800">
              <BadgeDisplay compact={false} showDetails={true} />
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex justify-center">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-10 py-3.5 md:py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-xl md:rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95"
          >
            关闭追踪面板
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingTracker;
