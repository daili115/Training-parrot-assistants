import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BadgeNotification } from '../components/BadgeDisplay';
import { AwardNotification } from '../types';
import { badgeManager } from '../utils/badgeManager';

export interface Notification {
  id: string;
  type: 'badge' | 'streak' | 'milestone' | 'reminder';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * 通知管理器
 */
export class NotificationManager {
  private static instance: NotificationManager;
  private listeners: Set<(notification: Notification) => void> = new Set();
  private activeNotifications: Map<string, Notification> = new Map();

  private constructor() { }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * 添加通知监听器
   */
  public addListener(listener: (notification: Notification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 显示通知
   */
  public showNotification(notification: Omit<Notification, 'id'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: Notification = { ...notification, id };

    this.activeNotifications.set(id, fullNotification);
    this.listeners.forEach(listener => listener(fullNotification));

    return id;
  }

  /**
   * 关闭通知
   */
  public dismissNotification(id: string): void {
    this.activeNotifications.delete(id);
  }

  /**
   * 显示勋章获得通知
   */
  public showBadgeNotification(badgeNotification: AwardNotification): void {
    this.showNotification({
      type: 'badge',
      title: '获得新勋章！',
      message: badgeNotification.message,
      icon: badgeNotification.badge.icon,
      duration: 5000
    });
  }

  /**
   * 显示连续训练提醒
   */
  public showStreakReminder(currentStreak: number, daysUntilNextReward: number): void {
    this.showNotification({
      type: 'streak',
      title: '连续训练提醒',
      message: `你已经连续训练 ${currentStreak} 天，再坚持 ${daysUntilNextReward} 天就能获得新勋章！`,
      icon: '🔥',
      duration: 4000
    });
  }

  /**
   * 显示训练完成通知
   */
  public showTrainingCompleted(sessionCount: number, totalDuration: number): void {
    this.showNotification({
      type: 'milestone',
      title: '训练完成！',
      message: `完成了 ${sessionCount} 次训练，总计 ${totalDuration} 分钟`,
      icon: '✅',
      duration: 3000
    });
  }
}

/**
 * 通知组件
 */
interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    setTimeout(() => setIsVisible(true), 100);

    // 自动关闭
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(onDismiss, 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, onDismiss]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  const getIcon = () => {
    if (notification.icon) {
      return <span className="text-xl">{notification.icon}</span>;
    }

    switch (notification.type) {
      case 'badge':
        return <span className="text-xl">🏆</span>;
      case 'streak':
        return <span className="text-xl">🔥</span>;
      case 'milestone':
        return <span className="text-xl">⭐</span>;
      case 'reminder':
        return <span className="text-xl">⏰</span>;
      default:
        return <span className="text-xl">📢</span>;
    }
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'badge':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'streak':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800';
      case 'milestone':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'reminder':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <div className={`mb-3 transition-all duration-300 transform ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
      <div className={`rounded-lg shadow-lg border p-4 max-w-sm ${getTypeStyles()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${action.variant === 'primary'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : action.variant === 'danger'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                      }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 通知容器组件
 */
interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const notificationManager = NotificationManager.getInstance();

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);
    };

    const unsubscribe = notificationManager.addListener(handleNewNotification);
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    NotificationManager.getInstance().dismissNotification(id);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => handleDismiss(notification.id)}
        />
      ))}
    </div>,
    document.body
  );
};

/**
 * 全局通知管理器实例
 */
export const notificationManager = NotificationManager.getInstance();