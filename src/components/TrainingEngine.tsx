
import React, { useState, useEffect, useRef } from 'react';
import {
  Bird, Timer, RotateCcw, X, Loader2,
  Activity, Pause, Play, Waves, Volume2, ShieldAlert
} from 'lucide-react';
import { Phrase, TrainingSettings, SessionStats } from '../types';
import { EFFECT_CONFIG } from '../utils/audio';


interface TrainingEngineProps {
  phrases: Phrase[];
  settings: TrainingSettings;
  onFinish: (stats: Omit<SessionStats, 'id' | 'date'>) => void;
  onPhrasePlayed: (id: string) => void;
}

const TrainingEngine: React.FC<TrainingEngineProps> = ({ phrases, settings, onFinish, onPhrasePlayed }) => {
  const [timeLeft, setTimeLeft] = useState(settings.sessionDuration * 60);
  const [nextPlayIn, setNextPlayIn] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [ambientNoise, setAmbientNoise] = useState(0);
  const [status, setStatus] = useState<'playing' | 'waiting' | 'loading'>('loading');

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const phraseIndexRef = useRef(0);
  const noiseAnalyserRef = useRef<AnalyserNode | null>(null);
  const startTimeRef = useRef(Date.now());
  const fadeIntervalRef = useRef<any>(null);

  // 噪音检测
  useEffect(() => {
    let animationId: number;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;

    const initNoiseMonitor = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        noiseAnalyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const check = () => {
          if (!noiseAnalyserRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const level = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAmbientNoise(level);
          animationId = requestAnimationFrame(check);
        };
        check();
      } catch (e) {
        console.debug("Noise monitor failed", e);
      }
    };
    initNoiseMonitor();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (ctx && ctx.state !== 'closed') ctx.close();
      noiseAnalyserRef.current = null;
    };
  }, []);

  const playNext = async () => {
    if (isPaused) return;
    if (phrases.length === 0) return;

    setStatus('loading');
    const phrase = phrases[phraseIndexRef.current];
    phraseIndexRef.current = (phraseIndexRef.current + 1) % phrases.length;
    setCurrentPhrase(phrase);

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    try {
      audioRef.current.src = phrase.audioUrl;

      // 应用声音效果
      const config = EFFECT_CONFIG[phrase.effect || 'normal'];
      if (config) {
        audioRef.current.playbackRate = config.rate;
        // @ts-ignore
        audioRef.current.preservesPitch = config.pitch;
      }

      audioRef.current.volume = 0; // 初始为 0 用于淡入
      await audioRef.current.play();

      // 淡入逻辑
      if (settings.fadeInOut) {
        let v = 0;
        fadeIntervalRef.current = setInterval(() => {
          v += 0.05;
          if (v >= settings.volume) {
            audioRef.current.volume = settings.volume;
            if (fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
          } else {
            audioRef.current.volume = v;
          }
        }, 50);
      } else {
        audioRef.current.volume = settings.volume;
      }

      setStatus('playing');
      setPlayCount(c => c + 1);
      onPhrasePlayed(phrase.id);
    } catch (err) {
      console.error("Playback failed", err);
      setStatus('waiting');
      setTimeout(playNext, 2000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeLeft(t => {
          if (t <= 1) {
            onFinish({
              totalPlays: playCount,
              durationMinutes: Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000))
            });
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    const handleEnded = () => {
      setStatus('waiting');
      let wait = settings.loopInterval;
      if (settings.naturalJitter) wait += (Math.random() * 4 - 2);
      setNextPlayIn(Math.max(1, Math.round(wait)));
    };

    const currentAudio = audioRef.current;
    currentAudio.addEventListener('ended', handleEnded);
    playNext();

    return () => {
      clearInterval(timer);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      currentAudio.removeEventListener('ended', handleEnded);
      currentAudio.pause();
      currentAudio.src = "";
    };
  }, []);


  useEffect(() => {
    if (status === 'waiting' && nextPlayIn > 0 && !isPaused) {
      const waitTimer = setTimeout(() => {
        setNextPlayIn(n => {
          if (n <= 1) { playNext(); return 0; }
          return n - 1;
        });
      }, 1000);
      return () => clearTimeout(waitTimer);
    }
  }, [status, nextPlayIn, isPaused]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col text-white animate-in fade-in">
      <div className="p-8 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Bird className="w-8 h-8 text-emerald-400" />
          <h2 className="font-black text-lg">专注教学中</h2>
        </div>
        <button onClick={() => onFinish({ totalPlays: playCount, durationMinutes: Math.round((Date.now() - startTimeRef.current) / 60000) })} className="p-4 bg-white/10 rounded-2xl"><X /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[60px] flex items-center justify-center mb-12 transition-all ${status === 'playing' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`}>
          {status === 'playing' ? <Waves className="w-24 h-24" /> : <Bird className="w-20 h-20" />}
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-8">"{currentPhrase?.label || '同步中'}"</h1>

        {/* 噪音计 */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${ambientNoise > 40 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (ambientNoise / 80) * 100)}%` }} />
            </div>
          </div>
          {ambientNoise > 40 && (
            <p className="text-[10px] font-black text-red-400 flex items-center gap-1 uppercase tracking-widest animate-bounce">
              <ShieldAlert className="w-3 h-3" /> 环境太嘈杂，建议移至安静处
            </p>
          )}
        </div>
      </div>

      <div className="p-8 md:p-12 bg-white/5 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div><p className="text-[10px] text-white/40 uppercase font-black mb-1">剩余时间</p><p className="text-3xl font-mono font-black">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p></div>
          <div><p className="text-[10px] text-white/40 uppercase font-black mb-1">循环倒计</p><p className="text-3xl font-mono font-black text-emerald-400">{status === 'waiting' ? nextPlayIn : 0}s</p></div>
          <div className="hidden md:block"><p className="text-[10px] text-white/40 uppercase font-black mb-1">已教遍数</p><p className="text-3xl font-mono font-black text-blue-400">{playCount}</p></div>
          <button onClick={() => setIsPaused(!isPaused)} className={`h-16 rounded-[24px] font-black ${isPaused ? 'bg-emerald-500' : 'bg-white/10'}`}>{isPaused ? '继续' : '暂停'}</button>
        </div>
      </div>
    </div>
  );
};

export default TrainingEngine;
