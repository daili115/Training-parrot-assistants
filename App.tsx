
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bird, Mic, Play, Square, Settings, Clock,
  BarChart3, Dna, Trophy, X, ChevronRight,
  History, Filter, Calendar, ExternalLink
} from 'lucide-react';
import { Phrase, TrainingSlot, TrainingOrder, TrainingSettings, SessionStats, Badge, AwardNotification } from './types';
import { loadPhrases, loadSlots, loadSettings, loadHistory, loadBadges, savePhrases, saveSlots, saveSettings, saveHistory, saveBadges } from './utils/storage';
import { checkNewBadges } from './utils/gamification';
import { updateTodayTraining, calculateUserStreak, checkAndAwardStreakRewards, getUserTrainingStats } from './utils/trainingTracker';
import { badgeManager } from './utils/badgeManager';
import { notificationManager, NotificationContainer } from './components/NotificationManager';
import Recorder from './components/Recorder';
import PhraseCard from './components/PhraseCard';
import Scheduler from './components/Scheduler';
import TrainingEngine from './components/TrainingEngine';
import HistoryLog from './components/HistoryLog';
import BadgeModal from './components/BadgeModal';
import { BadgeDisplay, StreakProgress } from './components/BadgeDisplay';
import TrainingTracker from './components/TrainingTracker';
import { useTheme } from './context/ThemeContext';
import ToggleTheme from './components/ToggleTheme';

const DEFAULT_SETTINGS: TrainingSettings = {
  loopInterval: 10,
  sessionDuration: 15,
  order: TrainingOrder.SEQUENTIAL,
  volume: 0.8,
  naturalJitter: true,
  fadeInOut: true
};

const App: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [settings, setSettings] = useState<TrainingSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<SessionStats[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  const [isTraining, setIsTraining] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [lastSessionStats, setLastSessionStats] = useState<SessionStats | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [showTrainingTracker, setShowTrainingTracker] = useState(false);
  const [userStreak, setUserStreak] = useState<any>(null);
  const [badgeNotifications, setBadgeNotifications] = useState<AwardNotification[]>([]);

  const { theme, toggleTheme } = useTheme();
  const lastTriggeredRef = useRef<string | null>(null);
  const userId = 'default_user'; // 可以扩展为实际的用户ID系统

  useEffect(() => {
    setPhrases(loadPhrases());
    setSlots(loadSlots());
    setSettings(loadSettings());
    const loadedHistory = loadHistory();
    setHistory(loadedHistory);
    const loadedBadges = loadBadges();
    setBadges(loadedBadges);

    // 初始化用户连续训练数据
    const streak = calculateUserStreak(userId);
    setUserStreak(streak);

    // Check for badges on load (in case missed)
    const totalPlays = loadedHistory.reduce((acc, s) => acc + s.totalPlays, 0);
    const newlyEarned = checkNewBadges(loadedHistory, loadedBadges, totalPlays);
    if (newlyEarned.length > 0) {
      setBadges(prev => [...prev, ...newlyEarned]);
      setNewBadge(newlyEarned[0]); // Show first new badge
    }

    // 设置勋章授予监听器
    const unsubscribe = badgeManager.addAwardListener((notification) => {
      setBadgeNotifications(prev => [...prev, notification]);
      // 同步本地勋章状态，避免 UI 延迟
      setBadges(prev => {
        const exists = prev.some(b => b.id === notification.badge.id);
        if (exists) return prev;
        return [...prev, notification.badge];
      });
    });


    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    savePhrases(phrases);
    saveSlots(slots);
    saveSettings(settings);
    saveHistory(history);
    saveBadges(badges);
  }, [phrases, slots, settings, history, badges]);

  const handleTrainingFinish = (stats: Omit<SessionStats, 'id' | 'date'>) => {
    setIsTraining(false);
    const newEntry: SessionStats = {
      ...stats,
      id: crypto.randomUUID(),
      date: Date.now()
    };

    // Update history
    const newHistory = [newEntry, ...history].slice(0, 100);
    setHistory(newHistory);
    setLastSessionStats(newEntry);

    // 更新今日训练记录
    updateTodayTraining(userId, stats.totalPlays, stats.durationMinutes);


    // 检查连续训练奖励
    const newlyAwardedRewards = checkAndAwardStreakRewards(userId);
    if (newlyAwardedRewards.length > 0) {
      // 更新用户连续训练数据
      const updatedStreak = calculateUserStreak(userId);
      setUserStreak(updatedStreak);
    }

    // Check for new badges
    const totalPlays = newHistory.reduce((acc, s) => acc + s.totalPlays, 0);
    const newlyEarned = checkNewBadges(newHistory, badges, totalPlays);

    if (newlyEarned.length > 0) {
      setBadges(prev => [...prev, ...newlyEarned]);
      setTimeout(() => setNewBadge(newlyEarned[0]), 500); // Delay slightly for effect
    }
  };

  const addPhrase = (phrase: Phrase) => setPhrases(prev => [phrase, ...prev]);
  const removePhrase = (id: string) => setPhrases(prev => prev.filter(p => p.id !== id));
  const updateMastery = (id: string, val: number) => setPhrases(prev => prev.map(p => p.id === id ? { ...p, mastery: val } : p));
  const incrementPlayCount = useCallback((id: string) => {
    setPhrases(prev => prev.map(p => p.id === id ? { ...p, playCount: (p.playCount || 0) + 1 } : p));
  }, []);

  const tags = ['全部', ...Array.from(new Set(phrases.map(p => p.tag).filter(Boolean)))];
  const filteredPhrases = selectedTag === '全部' ? phrases : phrases.filter(p => p.tag === selectedTag);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-12">
      <header className="bird-gradient dark:bg-slate-900 dark:text-white text-white px-6 py-6 md:p-8 shadow-2xl sticky top-0 z-30 rounded-b-[32px] md:rounded-b-[40px]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-2.5 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-md shadow-inner">
              <Bird className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none mb-1.5 md:mb-2">鹦鹉学舌大师</h1>
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold">
                <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  累计播放 {phrases.reduce((acc, p) => acc + (p.playCount || 0), 0)} 次
                </span>
                <button
                  onClick={() => setShowBadges(true)}
                  className="bg-amber-400/20 hover:bg-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors text-amber-200 cursor-pointer"
                >
                  <Trophy className="w-3 h-3" />
                  <span>{badges.length} 枚勋章</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <ToggleTheme />
            <button
              onClick={() => phrases.length > 0 && setIsTraining(true)}
              className={`w-full sm:w-auto group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 rounded-2xl md:rounded-3xl font-black transition-all shadow-xl active:scale-95 ${isTraining ? 'bg-red-500 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>开启沉浸教学</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 dark:text-white">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <section id="recorder-section" className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative">
            <h2 className="text-lg md:text-xl font-black mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
              <div className="p-2 bg-emerald-50 rounded-xl"><Mic className="w-5 h-5 text-emerald-500" /></div>
              新增录制
            </h2>
            <Recorder onSave={addPhrase} />
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
              <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl"><BarChart3 className="w-5 h-5 text-blue-500" /></div>
                教学库 ({filteredPhrases.length})
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${selectedTag === tag ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              {filteredPhrases.map(phrase => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  onDelete={removePhrase}
                  onUpdateMastery={updateMastery}
                  volume={settings.volume}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* 连续训练进度 */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black flex items-center gap-3 text-amber-800 dark:text-amber-200">
                <Trophy className="w-5 h-5 text-amber-500" />
                连续训练
              </h2>
              <button
                onClick={() => setShowTrainingTracker(true)}
                className="text-[10px] font-black text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                详情
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {userStreak && (
              <StreakProgress
                currentStreak={userStreak.currentStreak}
                longestStreak={userStreak.longestStreak}
                targetStreak={7}
              />
            )}
          </section>

          <section className="bg-slate-900 dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 text-white dark:text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black flex items-center gap-3">
                <History className="w-5 h-5 text-emerald-400" />
                最近训练
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => setShowFullHistory(true)}
                  className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  查看全部
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <HistoryLog history={history.slice(0, 5)} />
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
              <Settings className="w-5 h-5 text-blue-500" />
              参数微调
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">播放音量</label>
                  <span className="text-blue-600 font-black">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={settings.volume}
                  onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">播放间隔</label>
                  <span className="text-blue-600 font-black">{settings.loopInterval}秒</span>
                </div>
                <input
                  type="range" min="1" max="30" step="1"
                  value={settings.loopInterval}
                  onChange={(e) => setSettings({ ...settings, loopInterval: parseInt(e.target.value) })}
                  className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">声音淡入淡出</span>
                <button
                  onClick={() => setSettings({ ...settings, fadeInOut: !settings.fadeInOut })}
                  className={`w-10 h-5 rounded-full relative transition-all ${settings.fadeInOut ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.fadeInOut ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
              <Clock className="w-5 h-5 text-amber-500" />
              定时闹钟
            </h2>
            <Scheduler slots={slots} onAdd={(t) => setSlots([...slots, { id: crypto.randomUUID(), time: t, enabled: true }].sort((a, b) => a.time.localeCompare(b.time)))} onRemove={(id) => setSlots(slots.filter(s => s.id !== id))} onToggle={(id) => setSlots(slots.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))} />
          </section>
        </div>
      </main>

      {/* 勋章模态框 */}
      {(showBadges || newBadge) && (
        <BadgeModal
          unlockedBadges={badges}
          newBadge={newBadge}
          onClose={() => setShowBadges(false)}
          onAckNewBadge={() => setNewBadge(null)}
        />
      )}

      {/* 全屏历史模态框 */}
      {showFullHistory && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[85vh] rounded-[40px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <History className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">完整训练档案</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Training History Records</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullHistory(false)}
                className="p-3 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              <div className="grid gap-4">
                {history.map((entry) => (
                  <div key={entry.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-black text-slate-200">
                          {new Date(entry.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        </span>
                      </div>
                      <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {entry.durationMinutes} 分钟教学
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">播放指令</span>
                        <span className="text-2xl font-black text-white">{entry.totalPlays} <span className="text-sm text-slate-500">次</span></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">训练收益</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="text-lg font-black text-white">显著提升</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 border-t border-white/10 bg-black/20 shrink-0 flex justify-center">
              <button
                onClick={() => setShowFullHistory(false)}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95"
              >
                关闭记录
              </button>
            </div>
          </div>
        </div>
      )}

      {isTraining && (
        <TrainingEngine
          phrases={filteredPhrases}
          settings={settings}
          onFinish={handleTrainingFinish}
          onPhrasePlayed={incrementPlayCount}
        />
      )}

      {lastSessionStats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 rounded-[30px] flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">训练完成！</h2>
            <p className="text-slate-400 text-sm mb-8">本次教学了 {lastSessionStats.totalPlays} 次，用时 {lastSessionStats.durationMinutes} 分钟。</p>
            <button onClick={() => setLastSessionStats(null)} className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black">收下了</button>
          </div>
        </div>
      )}

      {/* 训练追踪器模态框 */}
      {showTrainingTracker && (
        <TrainingTracker
          userId={userId}
          onClose={() => setShowTrainingTracker(false)}
          onTrainingComplete={() => {
            // 更新用户连续训练数据
            const streak = calculateUserStreak(userId);
            setUserStreak(streak);
          }}
        />
      )}

      {/* 勋章通知 */}
      {badgeNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-[200] space-y-2">
          {badgeNotifications.map((notification, index) => (
            <div
              key={notification.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-600 animate-in slide-in-from-right duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{notification.icon}</div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white">{notification.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
                </div>
                <button
                  onClick={() => {
                    setBadgeNotifications(prev =>
                      prev.filter(n => n.id !== notification.id)
                    );
                  }}
                  className="ml-auto p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
