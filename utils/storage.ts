import { Phrase, TrainingSlot, TrainingOrder, TrainingSettings, SessionStats, Badge, TrainingRecord, UserStreak, StreakReward, ParrotPhoto, Game, GameSession, GameStats } from '../types';

const STORAGE_KEYS = {
  PHRASES: 'parrot_phrases_v3',
  SLOTS: 'parrot_slots',
  SETTINGS: 'parrot_settings_v3',
  HISTORY: 'parrot_history',
  BADGES: 'parrot_badges',
  THEME: 'theme',
  TRAINING_RECORDS: 'parrot_training_records',
  USER_STREAK: 'parrot_user_streak',
  STREAK_REWARDS: 'parrot_streak_rewards',
  PHOTOS: 'parrot_photos',
  GAMES: 'parrot_games_v1',
  GAME_SESSIONS: 'parrot_game_sessions_v1',
  GAME_STATS: 'parrot_game_stats_v1'
} as const;

/**
 * 安全地解析 JSON，避免解析错误
 */
function safeParseJSON<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn('Failed to parse JSON from storage:', error);
    return fallback;
  }
}

/**
 * 加载短语列表
 */
export function loadPhrases(): Phrase[] {
  const data = localStorage.getItem(STORAGE_KEYS.PHRASES);
  return safeParseJSON(data, []);
}

/**
 * 保存短语列表
 */
export function savePhrases(phrases: Phrase[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(phrases));
  } catch (error) {
    console.error('Failed to save phrases:', error);
  }
}

/**
 * 加载训练时段
 */
export function loadSlots(): TrainingSlot[] {
  const data = localStorage.getItem(STORAGE_KEYS.SLOTS);
  return safeParseJSON(data, []);
}

/**
 * 保存训练时段
 */
export function saveSlots(slots: TrainingSlot[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  } catch (error) {
    console.error('Failed to save slots:', error);
  }
}

/**
 * 加载训练设置
 */
export function loadSettings(): TrainingSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const defaultSettings: TrainingSettings = {
    loopInterval: 10,
    sessionDuration: 15,
    order: TrainingOrder.SEQUENTIAL,
    volume: 0.8,
    naturalJitter: true,
    fadeInOut: true
  };
  return safeParseJSON(data, defaultSettings);
}

/**
 * 保存训练设置
 */
export function saveSettings(settings: TrainingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * 加载历史记录
 */
export function loadHistory(): SessionStats[] {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return safeParseJSON(data, []);
}

/**
 * 保存历史记录
 */
export function saveHistory(history: SessionStats[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * 加载勋章列表
 */
export function loadBadges(): Badge[] {
  const data = localStorage.getItem(STORAGE_KEYS.BADGES);
  return safeParseJSON(data, []);
}

/**
 * 保存勋章列表
 */
export function saveBadges(badges: Badge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch (error) {
    console.error('Failed to save badges:', error);
  }
}

/**
 * 清理所有存储数据
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * 导出所有数据为 JSON 文件
 */
export function exportAllData(): void {
  const data = {
    phrases: loadPhrases(),
    slots: loadSlots(),
    settings: loadSettings(),
    history: loadHistory(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parrot-trainer-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 从 JSON 文件导入数据
 */
export function importDataFromFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // 验证数据结构
        if (data.phrases && Array.isArray(data.phrases)) {
          savePhrases(data.phrases);
        }
        if (data.slots && Array.isArray(data.slots)) {
          saveSlots(data.slots);
        }
        if (data.settings && typeof data.settings === 'object') {
          saveSettings(data.settings);
        }
        if (data.history && Array.isArray(data.history)) {
          saveHistory(data.history);
        }

        resolve(true);
      } catch (error) {
        console.error('Failed to import data:', error);
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}

/**
 * 加载训练记录
 */
export function loadTrainingRecords(): TrainingRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.TRAINING_RECORDS);
  return safeParseJSON(data, []);
}

/**
 * 保存训练记录
 */
export function saveTrainingRecords(records: TrainingRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRAINING_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save training records:', error);
  }
}

/**
 * 加载用户连续训练数据
 */
export function loadUserStreak(): UserStreak {
  const data = localStorage.getItem(STORAGE_KEYS.USER_STREAK);
  const defaultStreak: UserStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastTrainingDate: null,
    totalTrainingDays: 0
  };
  return safeParseJSON(data, defaultStreak);
}

/**
 * 保存用户连续训练数据
 */
export function saveUserStreak(streak: UserStreak): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STREAK, JSON.stringify(streak));
  } catch (error) {
    console.error('Failed to save user streak:', error);
  }
}

/**
 * 加载连续训练奖励
 */
export function loadStreakRewards(): StreakReward[] {
  const data = localStorage.getItem(STORAGE_KEYS.STREAK_REWARDS);
  const defaultRewards: StreakReward[] = [
    {
      streakDays: 7,
      badgeId: 'streak_7',
      name: '坚持不懈',
      description: '连续训练 7 天',
      icon: '🔥',
      isClaimed: false,
      claimedAt: null
    },
    {
      streakDays: 30,
      badgeId: 'streak_30',
      name: '毅力大师',
      description: '连续训练 30 天',
      icon: '👑',
      isClaimed: false,
      claimedAt: null
    },
    {
      streakDays: 100,
      badgeId: 'streak_100',
      name: '百日恒心',
      description: '连续训练 100 天',
      icon: '💎',
      isClaimed: false,
      claimedAt: null
    }
  ];
  return safeParseJSON(data, defaultRewards);
}

/**
 * 保存连续训练奖励
 */
export function saveStreakRewards(rewards: StreakReward[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK_REWARDS, JSON.stringify(rewards));
  } catch (error) {
    console.error('Failed to save streak rewards:', error);
  }
}

/**
 * 加载鹦鹉照片
 */
export function loadPhotos(): ParrotPhoto[] {
  const data = localStorage.getItem(STORAGE_KEYS.PHOTOS);
  return safeParseJSON(data, []);
}

/**
 * 保存鹦鹉照片
 */
export function savePhotos(photos: ParrotPhoto[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
  } catch (error) {
    console.error('Failed to save photos:', error);
  }
}

/**
 * 加载游戏列表
 */
export function loadGames(): Game[] {
  const data = localStorage.getItem(STORAGE_KEYS.GAMES);
  const defaultGames: Game[] = [
    {
      id: 'imitation_1',
      name: '鹦鹉模仿秀',
      description: '鹦鹉说一个短语，你需要模仿它的发音和效果',
      type: 'imitation',
      difficulty: 'easy',
      icon: '🦜',
      color: '#10b981',
      highScore: 0,
      playCount: 0,
      lastPlayed: null,
      unlockedAt: Date.now()
    },
    {
      id: 'memory_1',
      name: '记忆挑战',
      description: '记住鹦鹉说的短语序列，然后重复出来',
      type: 'memory',
      difficulty: 'medium',
      icon: '🧠',
      color: '#8b5cf6',
      highScore: 0,
      playCount: 0,
      lastPlayed: null,
      unlockedAt: Date.now()
    },
    {
      id: 'rhythm_1',
      name: '节奏大师',
      description: '按照节奏点击鹦鹉叫声，保持节奏感',
      type: 'rhythm',
      difficulty: 'easy',
      icon: '🎵',
      color: '#f59e0b',
      highScore: 0,
      playCount: 0,
      lastPlayed: null,
      unlockedAt: Date.now()
    },
    {
      id: 'puzzle_1',
      name: '鹦鹉拼图',
      description: '拼凑鹦鹉相关的图片，解锁新成就',
      type: 'puzzle',
      difficulty: 'medium',
      icon: '🧩',
      color: '#ec4899',
      highScore: 0,
      playCount: 0,
      lastPlayed: null,
      unlockedAt: Date.now()
    }
  ];
  return safeParseJSON(data, defaultGames);
}

/**
 * 保存游戏列表
 */
export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  } catch (error) {
    console.error('Failed to save games:', error);
  }
}

/**
 * 加载游戏会话
 */
export function loadGameSessions(): GameSession[] {
  const data = localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
  return safeParseJSON(data, []);
}

/**
 * 保存游戏会话
 */
export function saveGameSessions(sessions: GameSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save game sessions:', error);
  }
}

/**
 * 加载游戏统计
 */
export function loadGameStats(): GameStats {
  const data = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
  const defaultStats: GameStats = {
    totalGamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    gamesCompleted: 0,
    perfectGames: 0,
    lastPlayedDate: null
  };
  return safeParseJSON(data, defaultStats);
}

/**
 * 保存游戏统计
 */
export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save game stats:', error);
  }
}