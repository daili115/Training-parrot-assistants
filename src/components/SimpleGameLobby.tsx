import React, { useState } from 'react';
import { Play, Trophy, Volume2, Heart, Zap } from 'lucide-react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak, speakFeedback } from '../utils/voiceAssist';
import { Phrase } from '../types';

interface SimpleGameLobbyProps {
  phrases: Phrase[];
  onClose: () => void;
}

const SimpleGameLobby: React.FC<SimpleGameLobbyProps> = ({ phrases, onClose }) => {
  const { isEasyMode, voiceAssist } = useEasyMode();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // 简化的游戏列表（适合老年用户）
  const simpleGames = [
    {
      id: 'listen_repeat',
      name: '听音跟读',
      description: '听鹦鹉说话，然后跟读',
      icon: <Volume2 className="w-8 h-8" />,
      color: 'from-emerald-500 to-cyan-500',
      difficulty: '简单',
    },
    {
      id: 'guess_phrase',
      name: '猜猜看',
      description: '听声音猜是哪个词汇',
      icon: <Play className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      difficulty: '中等',
    },
    {
      id: 'memory_match',
      name: '记忆配对',
      description: '记住声音，找出相同的',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-rose-500 to-orange-500',
      difficulty: '简单',
    },
    {
      id: 'rhythm_clap',
      name: '节奏拍手',
      description: '跟着节奏拍手',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-amber-500 to-yellow-500',
      difficulty: '简单',
    },
  ];

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    const game = simpleGames.find(g => g.id === gameId);
    if (game && voiceAssist) {
      speak(`选择了${game.name}游戏，${game.description}`);
    }
  };

  const startGame = () => {
    if (!selectedGame) return;

    const game = simpleGames.find(g => g.id === selectedGame);
    if (game && voiceAssist) {
      speakFeedback('start_training');
      speak(`开始${game.name}游戏`);
    }

    // 这里可以启动实际的游戏逻辑
    // 为了简化，我们先显示一个提示
    alert(`游戏功能开发中...\n\n游戏：${game?.name}\n\n这是一个适合老年用户的简化游戏模式。`);
  };

  // 如果没有短语，显示提示
  if (phrases.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">没有游戏词汇</h2>
          <p className="text-slate-500 mb-6">请先录制一些词汇再玩游戏</p>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-2xl font-black hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
        >
          返回
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black text-purple-600 dark:text-purple-400">鹦鹉游戏</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">选择一个游戏开始</p>
        </div>
        <div className="px-6 py-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
          <span className="text-amber-700 dark:text-amber-300 font-black">
            {phrases.length} 个词汇
          </span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 游戏选择 */}
        <div className="space-y-4 mb-8">
          {simpleGames.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-3xl transition-all
                ${selectedGame === game.id
                  ? `bg-gradient-to-r ${game.color} text-white shadow-xl`
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:shadow-lg'
                }
              `}
            >
              <div className={`p-3 rounded-2xl ${selectedGame === game.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                {game.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-black text-lg">{game.name}</div>
                <div className="text-sm opacity-80">{game.description}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-black ${selectedGame === game.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                {game.difficulty}
              </div>
            </button>
          ))}
        </div>

        {/* 游戏说明 */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8">
          <h3 className="font-black text-lg mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            游戏说明
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>• 选择一个游戏开始</li>
            <li>• 游戏会播放您录制的词汇</li>
            <li>• 根据提示完成游戏任务</li>
            <li>• 完成游戏获得积分</li>
          </ul>
        </div>

        {/* 开始游戏按钮 */}
        <button
          onClick={startGame}
          disabled={!selectedGame}
          className={`
            w-full py-6 rounded-3xl font-black text-xl transition-all
            ${selectedGame
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {selectedGame ? '开始游戏' : '请选择一个游戏'}
        </button>

        {/* 温馨提示 */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-6 border border-amber-200 dark:border-amber-800/30">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">
            💡 温馨提示：游戏可以帮助鹦鹉更好地学习，也让训练过程更有趣！
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleGameLobby;
