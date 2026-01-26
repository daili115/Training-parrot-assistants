import React, { useState, useEffect } from 'react';
import { Game, GameSession, GameStats, Badge } from '../types';
import { loadGames, saveGames, loadGameSessions, saveGameSessions, loadGameStats, saveGameStats } from '../utils/storage';
import { loadBadges, saveBadges } from '../utils/storage';
import { checkNewGameBadges } from '../utils/gamification';
import { GameEngine } from './GameEngine';
import { BadgeModal } from './BadgeModal';
import { notificationManager } from './NotificationManager';

interface GameLobbyProps {
  phrases: any[];
  onClose: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ phrases, onClose }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = () => {
    const loadedGames = loadGames();
    const loadedSessions = loadGameSessions();
    const loadedStats = loadGameStats();
    const loadedBadges = loadBadges();

    setGames(loadedGames);
    setSessions(loadedSessions);
    setStats(loadedStats);
    setBadges(loadedBadges);
  };

  const handlePlayGame = (game: Game) => {
    if (phrases.length === 0) {
      addNotification('请先添加一些训练短语再开始游戏！', 'warning');
      return;
    }
    setSelectedGame(game);
  };

  const handleGameComplete = (session: GameSession, isPerfect: boolean) => {
    // 更新游戏会话
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    saveGameSessions(updatedSessions);

    // 更新游戏统计
    if (stats) {
      const updatedStats: GameStats = {
        ...stats,
        totalGamesPlayed: stats.totalGamesPlayed + 1,
        totalScore: stats.totalScore + session.score,
        bestScore: Math.max(stats.bestScore, session.score),
        gamesCompleted: stats.gamesCompleted + (session.completed ? 1 : 0),
        perfectGames: stats.perfectGames + (isPerfect ? 1 : 0),
        lastPlayedDate: new Date().toISOString().split('T')[0]
      };
      setStats(updatedStats);
      saveGameStats(updatedStats);

      // 检查新徽章
      const newGameBadges = checkNewGameBadges(updatedStats, updatedSessions, badges);
      if (newGameBadges.length > 0) {
        const updatedBadges = [...badges, ...newGameBadges];
        setBadges(updatedBadges);
        saveBadges(updatedBadges);
        setNewBadges(newGameBadges);
        setShowBadgeModal(true);

        // 添加通知
        newGameBadges.forEach(badge => {
          addNotification(`解锁新徽章：${badge.name}！`, 'badge');
        });
      }
    }

    // 更新游戏数据
    const updatedGames = games.map(g =>
      g.id === session.gameId
        ? {
            ...g,
            highScore: Math.max(g.highScore, session.score),
            playCount: g.playCount + 1,
            lastPlayed: Date.now()
          }
        : g
    );
    setGames(updatedGames);
    saveGames(updatedGames);

    setSelectedGame(null);
  };

  const addNotification = (message: string, type: 'success' | 'warning' | 'badge' | 'streak') => {
    const title = type === 'warning' ? '提醒' : type === 'badge' ? '获得新徽章！' : '通知';
    const icon = type === 'warning' ? '⏰' : type === 'badge' ? '🏆' : '📢';
    const duration = type === 'warning' ? 3000 : 5000;

    notificationManager.showNotification({
      type: type === 'warning' ? 'reminder' : type,
      title,
      message,
      icon,
      duration
    });
  };

  const getGameDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
    }
  };

  const getGameTypeLabel = (type: Game['type']) => {
    switch (type) {
      case 'imitation': return '模仿';
      case 'memory': return '记忆';
      case 'rhythm': return '节奏';
      case 'puzzle': return '拼图';
    }
  };

  if (selectedGame) {
    return (
      <GameEngine
        game={selectedGame}
        phrases={phrases}
        onComplete={handleGameComplete}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎮</span> 鹦鹉游戏大厅
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                选择一个游戏开始挑战，获得高分解锁徽章！
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats?.totalGamesPlayed || 0}</div>
              <div className="text-sm opacity-80">总游戏</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.bestScore || 0}</div>
              <div className="text-sm opacity-80">最高分</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.gamesCompleted || 0}</div>
              <div className="text-sm opacity-80">完成数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{badges.length}</div>
              <div className="text-sm opacity-80">徽章</div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map(game => (
              <div
                key={game.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={() => handlePlayGame(game)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center text-2xl`}>
                    {game.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">{game.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getGameDifficultyColor(game.difficulty)}`}>
                        {game.difficulty === 'easy' ? '简单' : game.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{game.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>🏆 {game.highScore}</span>
                      <span>🎮 {game.playCount}</span>
                      <span>📊 {getGameTypeLabel(game.type)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">最近游戏记录</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sessions.slice(-5).reverse().map(session => (
                <div key={session.id} className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">
                    {games.find(g => g.id === session.gameId)?.name || '未知游戏'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {session.score} 分
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <BadgeModal
          unlockedBadges={newBadges}
          newBadge={null}
          onClose={() => setShowBadgeModal(false)}
          onAckNewBadge={() => setShowBadgeModal(false)}
        />
      )}
    </div>
  );
};
