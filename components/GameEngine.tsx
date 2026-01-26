import React, { useState, useEffect, useRef } from 'react';
import { Game, GameSession, VoiceEffect } from '../types';
import { loadPhrases } from '../utils/storage';
import { getEffectConfig } from '../utils/audio';

interface GameEngineProps {
  game: Game;
  phrases: any[];
  onComplete: (session: GameSession, isPerfect: boolean) => void;
  onBack: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ game, phrases, onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result'>('ready');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [currentPhrase, setCurrentPhrase] = useState<any>(null);
  const [currentEffect, setCurrentEffect] = useState<VoiceEffect>('normal');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // 根据游戏类型设置最大轮数
    switch (game.type) {
      case 'imitation':
        setMaxRounds(5);
        break;
      case 'memory':
        setMaxRounds(3);
        break;
      case 'rhythm':
        setMaxRounds(10);
        break;
      case 'puzzle':
        setMaxRounds(1);
        break;
    }

    // 初始化音频上下文
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext();
        setAudioContext(context);
      } catch (error) {
        console.warn('Audio context not available:', error);
      }
    };

    initAudio();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (audioContext) audioContext.close();
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(0);
    setPerfectRounds(0);
    setStartTime(Date.now());
    nextRound();
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      endGame();
      return;
    }

    setRound(prev => prev + 1);
    setUserInput('');
    setFeedback(null);

    // 随机选择短语和效果
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const effects: VoiceEffect[] = ['parrot', 'deep', 'chipmunk', 'monster', 'alien', 'robot', 'ghost'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];

    setCurrentPhrase(randomPhrase);
    setCurrentEffect(randomEffect);

    // 根据游戏类型设置不同的计时器
    let timeLimit = 15; // 默认15秒
    if (game.type === 'imitation') timeLimit = 15;
    if (game.type === 'memory') timeLimit = 20;
    if (game.type === 'rhythm') timeLimit = 10;
    if (game.type === 'puzzle') timeLimit = 30;

    setTimer(timeLimit);

    // 播放音频
    playPhrase(randomPhrase, randomEffect);

    // 开始倒计时
    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const playPhrase = async (phrase: any, effect: VoiceEffect) => {
    if (!phrase.audioUrl) return;

    setIsPlaying(true);

    try {
      const audio = new Audio(phrase.audioUrl);
      const config = getEffectConfig(effect);

      // 应用效果
      audio.playbackRate = config.rate;
      audio.preservesPitch = config.preservesPitch;

      audio.onended = () => {
        setIsPlaying(false);
      };

      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleTimeout = () => {
    setFeedback({ message: '时间到！', type: 'error' });
    setTimeout(() => nextRound(), 1500);
  };

  const handleSubmit = () => {
    if (!currentPhrase || !userInput.trim()) return;

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentPhrase.label.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    let points = 0;
    let isPerfect = false;

    if (isCorrect) {
      // 根据游戏类型和剩余时间计算分数
      const timeBonus = Math.floor(timer * 10);
      const basePoints = 100;
      const roundBonus = game.difficulty === 'easy' ? 50 : game.difficulty === 'medium' ? 100 : 150;

      points = basePoints + timeBonus + roundBonus;

      // 检查是否完美（时间充足且正确）
      if (timer >= 10) {
        isPerfect = true;
        setPerfectRounds(prev => prev + 1);
      }

      setScore(prev => prev + points);
      setFeedback({ message: `正确！+${points}分`, type: 'success' });
    } else {
      setFeedback({ message: `错误！正确答案是：${currentPhrase.label}`, type: 'error' });
    }

    setTimeout(() => nextRound(), 1500);
  };

  const endGame = () => {
    if (timerInterval) clearInterval(timerInterval);

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const isPerfect = perfectRounds === maxRounds;

    const session: GameSession = {
      id: Date.now().toString(),
      gameId: game.id,
      score,
      duration,
      date: Date.now(),
      completed: true,
      perfect: isPerfect
    };

    onComplete(session, isPerfect);
  };

  const handleReplay = () => {
    if (currentPhrase && currentEffect) {
      playPhrase(currentPhrase, currentEffect);
    }
  };

  const getFeedbackColor = () => {
    switch (feedback?.type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getGameIcon = () => {
    switch (game.type) {
      case 'imitation': return '🦜';
      case 'memory': return '🧠';
      case 'rhythm': return '🎵';
      case 'puzzle': return '🧩';
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">{getGameIcon()}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{game.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{game.description}</p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">游戏规则：</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {game.type === 'imitation' && (
                <>
                  <li>• 鹦鹉会说一个短语并使用特殊效果</li>
                  <li>• 你需要模仿鹦鹉的发音</li>
                  <li>• 答对越快，得分越高</li>
                </>
              )}
              {game.type === 'memory' && (
                <>
                  <li>• 鹦鹉会说一系列短语</li>
                  <li>• 记住所有短语并重复出来</li>
                  <li>• 序列会越来越长</li>
                </>
              )}
              {game.type === 'rhythm' && (
                <>
                  <li>• 按照节奏点击按钮</li>
                  <li>• 保持节奏感，不要错过</li>
                  <li>• 连击越多，得分越高</li>
                </>
              )}
              {game.type === 'puzzle' && (
                <>
                  <li>• 拼凑鹦鹉相关的图片</li>
                  <li>• 完成拼图解锁成就</li>
                  <li>• 挑战最快速度</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              返回
            </button>
            <button
              onClick={startGame}
              className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getGameIcon()}</span>
              <span className="font-bold text-gray-900 dark:text-white">{game.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">轮次</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  {round}/{maxRounds}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">分数</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{score}</div>
              </div>
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="退出游戏"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>时间</span>
              <span className="font-bold">{timer}s</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timer > 10 ? 'bg-emerald-500' : timer > 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(timer / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Game Content */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-4">
            {game.type === 'imitation' && (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🦜</div>
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    {currentPhrase ? '听鹦鹉说...' : '准备中...'}
                  </p>
                </div>
                <div className="flex justify-center gap-3 mb-4">
                  <button
                    onClick={handleReplay}
                    disabled={isPlaying}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? '播放中...' : '重播'}
                  </button>
                </div>
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="输入你听到的短语..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                />
              </>
            )}

            {game.type === 'memory' && (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🧠</div>
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    记住鹦鹉说的短语！
                  </p>
                </div>
                <div className="flex justify-center gap-3 mb-4">
                  <button
                    onClick={handleReplay}
                    disabled={isPlaying}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? '播放中...' : '重播'}
                  </button>
                </div>
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="输入所有短语（用逗号分隔）..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                />
              </>
            )}

            {game.type === 'rhythm' && (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    按照节奏点击按钮！
                  </p>
                </div>
                <div className="flex justify-center gap-3 mb-4">
                  <button
                    onClick={() => {
                      const points = Math.floor(timer * 20);
                      setScore(prev => prev + points);
                      setFeedback({ message: `节奏正确！+${points}分`, type: 'success' });
                      setTimeout(() => nextRound(), 1000);
                    }}
                    className="px-6 py-4 bg-emerald-500 text-white rounded-xl font-bold text-xl hover:bg-emerald-600 active:scale-95 transition-transform"
                  >
                    点击！
                  </button>
                </div>
              </>
            )}

            {game.type === 'puzzle' && (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🧩</div>
                  <p className="text-lg text-gray-800 dark:text-gray-200">
                    拼凑鹦鹉图片！
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <div
                      key={i}
                      className="aspect-square bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80"
                      onClick={() => {
                        setScore(prev => prev + 50);
                        setFeedback({ message: `拼图完成！+50分`, type: 'success' });
                      }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`text-center font-bold ${getFeedbackColor()} mb-4`}>
              {feedback.message}
            </div>
          )}

          {/* Submit Button */}
          {game.type === 'imitation' || game.type === 'memory' ? (
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          ) : null}

          {/* Progress */}
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            完美轮次: {perfectRounds}/{maxRounds}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
