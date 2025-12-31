import React, { useState, useEffect } from 'react';
import { Badge, AwardNotification } from '../types';
import { badgeManager } from '../utils/badgeManager';
import { Award, X, Trophy, Star, Zap } from 'lucide-react';

interface BadgeDisplayProps {
  compact?: boolean;
  showDetails?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  compact = false,
  showDetails = true
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const loadBadges = () => {
      const awardedBadges = badgeManager.getAllAwardedBadges();
      setBadges(awardedBadges);
    };

    loadBadges();

    // 监听新勋章授予
    const unsubscribe = badgeManager.addAwardListener(() => {
      loadBadges();
    });

    return unsubscribe;
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (badges.length === 0 && !compact) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>还没有获得任何勋章</p>
        <p className="text-sm">坚持训练，获得属于你的荣誉！</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span className="text-sm font-medium">{badges.length}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          我的勋章 ({badges.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            role="button"
            className="relative group cursor-pointer badge-item"
            onClick={() => setSelectedBadge(badge)}
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-600 relative overflow-hidden group-hover:-translate-y-2">
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity rotate-12">{badge.icon}</div>
              <div className="text-center relative z-10">
                <div className="text-4xl md:text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">{badge.icon}</div>
                <h4 className="font-black text-sm md:text-base text-slate-800 dark:text-white truncate">
                  {badge.name}
                </h4>
                <div className="mt-2 flex justify-center">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase tracking-tighter">
                    {formatDate(badge.unlockedAt)}
                  </span>
                </div>
              </div>

              {/* Jungle overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* 勋章详情模态框 */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">勋章详情</h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">{selectedBadge.icon}</div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedBadge.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {selectedBadge.description}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  获得时间：{formatDate(selectedBadge.unlockedAt)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 新勋章获得通知组件
 */
interface BadgeNotificationProps {
  notification: AwardNotification;
  onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  notification,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 动画效果
    setTimeout(() => setIsVisible(true), 100);

    // 5秒后自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTypeIcon = (type: AwardNotification['type']) => {
    switch (type) {
      case 'streak':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'milestone':
        return <Star className="w-5 h-5 text-blue-500" />;
      case 'special':
        return <Trophy className="w-5 h-5 text-purple-500" />;
      default:
        return <Award className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getTypeIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl">{notification.badge.icon}</span>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                获得新勋章！
              </h4>
            </div>
            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
              {notification.badge.name}
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {notification.badge.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                刚刚获得
              </span>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
              >
                知道了
              </button>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-5000 ease-linear"
            style={{ width: isVisible ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 连续训练进度组件
 */
interface StreakProgressProps {
  currentStreak: number;
  longestStreak?: number;
  targetStreak?: number;
  showMotivation?: boolean;
}

export const StreakProgress: React.FC<StreakProgressProps> = ({
  currentStreak,
  targetStreak = 7,
  showMotivation = true
}) => {
  const progress = Math.min((currentStreak / targetStreak) * 100, 100);
  const remainingDays = Math.max(targetStreak - currentStreak, 0);

  const getMotivationText = () => {
    if (currentStreak === 0) {
      return "开始你的训练之旅吧！";
    } else if (currentStreak < targetStreak) {
      return `还差 ${remainingDays} 天就能获得下一个勋章！`;
    } else {
      return "太棒了！继续保持！";
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🔥</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">连续训练</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentStreak} 天
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {currentStreak}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">天</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>进度</span>
          <span>{currentStreak}/{targetStreak}</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-400 to-yellow-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showMotivation && (
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
          {getMotivationText()}
        </p>
      )}
    </div>
  );
};
