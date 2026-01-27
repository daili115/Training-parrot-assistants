import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, SkipForward, Trophy } from 'lucide-react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak, speakFeedback, speakError } from '../utils/voiceAssist';
import { Phrase, TrainingSettings } from '../types';

interface SimpleTrainingEngineProps {
  phrases: Phrase[];
  settings: TrainingSettings;
  onFinish: (stats: { totalPlays: number; durationMinutes: number }) => void;
  onClose: () => void;
}

const SimpleTrainingEngine: React.FC<SimpleTrainingEngineProps> = ({
  phrases,
  settings,
  onFinish,
  onClose,
}) => {
  const { isEasyMode, voiceAssist } = useEasyMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [showNoiseWarning, setShowNoiseWarning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 获取当前短语
  const currentPhrase = phrases[currentPhraseIndex];

  // 监听音量和噪音变化
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupAudioMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalized = average / 255;
          setVolume(normalized);

          // 检测噪音（超过阈值）
          if (normalized > 0.3 && isPlaying) {
            setNoiseLevel(normalized);
            setShowNoiseWarning(true);
            setTimeout(() => setShowNoiseWarning(false), 2000);
          }

          if (isPlaying) {
            requestAnimationFrame(checkVolume);
          } else {
            setVolume(0);
          }
        };

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        checkVolume();

        return () => {
          stream.getTracks().forEach(track => track.stop());
          if (audioContext.state !== 'closed') {
            audioContext.close().catch(() => { });
          }
        };
      } catch (err) {
        console.error('无法监控音量:', err);
      }
    };

    if (isPlaying) {
      setupAudioMonitoring().then(c => {
        if (c) cleanup = c;
      });
    }

    return () => {
      if (cleanup) cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => { });
        audioContextRef.current = null;
        analyserRef.current = null;
      }
    };
  }, [isPlaying]);

  // 播放当前短语
  const playCurrentPhrase = () => {
    if (!currentPhrase) return;

    if (voiceAssist) {
      speak(`正在播放：${currentPhrase.label}`);
    }

    const audio = new Audio(currentPhrase.audioUrl);
    audioRef.current = audio;

    // 应用音效
    const effectMap: Record<string, number> = {
      normal: 1,
      parrot: 1.25,
      deep: 0.85,
      robot: 1,
      chipmunk: 1.5,
      baby: 1.3,
      monster: 0.7,
      alien: 0.9,
      radio: 1.1,
      ghost: 0.6,
      squirrel: 1.4,
      giant: 0.5,
      female: 1.15,
      grandpa: 0.8,
    };

    audio.playbackRate = effectMap[currentPhrase.effect] || 1;
    // @ts-ignore
    audio.preservesPitch = false;
    audio.volume = settings.volume;

    audio.onplay = () => {
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlayCount(prev => prev + 1);

      // 自动播放下一个
      intervalRef.current = setTimeout(() => {
        if (isPlaying) {
          if (currentPhraseIndex < phrases.length - 1) {
            setCurrentPhraseIndex(prev => prev + 1);
          } else {
            setCurrentPhraseIndex(0);
          }
        }
      }, settings.loopInterval * 1000);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      speakError('播放失败');
    };

    audio.play();
  };

  // 监听当前索引变化并播放
  useEffect(() => {
    if (startTime && !isPlaying) {
      playCurrentPhrase();
    }
  }, [currentPhraseIndex, startTime]);

  // 停止播放
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 开始训练
  const startTraining = () => {
    if (phrases.length === 0) {
      speakError('请先添加教学词汇');
      return;
    }

    speakFeedback('start_training');
    setStartTime(Date.now());
    setCurrentPhraseIndex(0);
    setPlayCount(0);
    setElapsedTime(0);

    // 开始计时器
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // 自动结束训练
    setTimeout(() => {
      finishTraining();
    }, settings.sessionDuration * 60 * 1000);
  };

  // 结束训练
  const finishTraining = () => {
    speakFeedback('stop_training');

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const durationMinutes = Math.max(1, Math.round(elapsedTime / 60));
    onFinish({
      totalPlays: playCount,
      durationMinutes,
    });

    onClose();
  };

  // 跳过当前短语
  const skipPhrase = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(prev => prev + 1);
    } else {
      setCurrentPhraseIndex(0);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => { });
      }
    };
  }, []);

  if (phrases.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">没有教学词汇</h2>
          <p className="text-slate-500 mb-6">请先录制一些词汇再开始训练</p>
          <button onClick={onClose} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all">返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <div className="flex items-center justify-between p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
        <button onClick={onClose} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-2xl font-black hover:bg-slate-300 transition-all">退出</button>
        <div className="text-center">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatTime(elapsedTime)}</div>
          <div className="text-xs text-slate-500">目标：{settings.sessionDuration}分钟</div>
        </div>
        <div className="px-6 py-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
          <span className="text-amber-700 dark:text-amber-300 font-black">第 {currentPhraseIndex + 1} / {phrases.length} 个</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        {showNoiseWarning && (
          <div className="mb-6 px-6 py-3 bg-red-500 text-white rounded-2xl font-black animate-pulse">⚠️ 环境噪音较大，建议在安静环境中训练</div>
        )}

        <div className="text-center mb-8">
          <div className="text-sm font-bold text-slate-500 mb-2">正在播放</div>
          <div className={`font-black ${isEasyMode ? 'text-5xl' : 'text-4xl'} text-slate-800 dark:text-white mb-2`}>{currentPhrase?.label || '...'}</div>
          <div className="text-sm text-slate-500">声音效果：{currentPhrase?.effect || '正常'}</div>
        </div>

        <div className="w-full max-w-md mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">环境音量</span>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-100" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{playCount}</div>
            <div className="text-xs text-slate-500">播放次数</div>
          </div>
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{phrases.length}</div>
            <div className="text-xs text-slate-500">总词汇数</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {isPlaying ? (
            <>
              <button onClick={stopPlaying} className="flex flex-col items-center gap-2 px-8 py-6 bg-red-500 text-white rounded-3xl font-black hover:bg-red-600 transition-all active:scale-95">
                <Square className="w-8 h-8 fill-current" />
                <span className="text-lg">暂停</span>
              </button>
              <button onClick={skipPhrase} className="flex flex-col items-center gap-2 px-8 py-6 bg-slate-500 text-white rounded-3xl font-black hover:bg-slate-600 transition-all active:scale-95">
                <SkipForward className="w-8 h-8" />
                <span className="text-lg">跳过</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={startTraining} className="flex flex-col items-center gap-2 px-10 py-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-3xl font-black hover:shadow-2xl transition-all active:scale-95">
                <Play className="w-10 h-10 fill-current" />
                <span className="text-xl">开始训练</span>
              </button>
              <button onClick={finishTraining} className="flex flex-col items-center gap-2 px-8 py-6 bg-amber-500 text-white rounded-3xl font-black hover:bg-amber-600 transition-all active:scale-95">
                <Trophy className="w-8 h-8" />
                <span className="text-lg">完成</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-6 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl">
        <p className="text-center text-sm text-slate-600 dark:text-slate-300 font-bold">💡 提示：训练过程中请保持环境安静，鹦鹉会学得更快</p>
      </div>
    </div>
  );
};

export default SimpleTrainingEngine;
