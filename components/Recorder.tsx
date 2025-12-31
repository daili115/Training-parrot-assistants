
import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Square, X, User, Bird,
  AudioLines, Zap, Rabbit, Baby, Ghost,
  Radio, Atom, Skull, Tag,
  Cat, Mountain, Flower2, Glasses
} from 'lucide-react';
import { Phrase, VoiceEffect } from '../types';
import { EFFECT_CONFIG, SUGGESTED_TAGS, applyAudioEffect, safeRevokeURL, getAudioDuration } from '../utils/audio';

interface RecorderProps {
  onSave: (phrase: Phrase) => void;
}

// 效果图标映射
const EFFECT_ICONS: Record<string, any> = {
  normal: User,
  parrot: Bird,
  deep: AudioLines,
  robot: Zap,
  chipmunk: Rabbit,
  baby: Baby,
  monster: Skull,
  alien: Atom,
  radio: Radio,
  ghost: Ghost,
  squirrel: Cat,
  giant: Mountain,
  female: Flower2,
  grandpa: Glasses
};


const Recorder: React.FC<RecorderProps> = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [tag, setTag] = useState('日常');
  const [dbLevel, setDbLevel] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>('normal');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 当音频元素加载完成或效果改变时，应用声音效果
  useEffect(() => {
    if (audioRef.current) {
      applyAudioEffect(audioRef.current, selectedEffect);
    }
  }, [selectedEffect, audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => setAudioUrl(URL.createObjectURL(new Blob(audioChunksRef.current, { type: 'audio/webm' })));

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        setDbLevel(dataArray.reduce((a, b) => a + b) / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  };

  // 清理资源
  const cleanupResources = () => {
    if (audioUrl) {
      safeRevokeURL(audioUrl);
    }
    setAudioUrl(null);
    stopRecording();
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  return (
    <div className="space-y-4">
      {!audioUrl ? (
        <div className="flex flex-col items-center gap-4 py-4 md:py-8">
          <div className="relative group">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 animate-ping" style={{ transform: `scale(${1 + dbLevel / 40})` }} />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 border-8 border-white dark:border-slate-800  parrot-bounce ${isRecording ? 'bg-red-500 rotate-12' : 'bg-emerald-500 hover:scale-105'}`}
            >
              {isRecording ? <Square className="text-white w-10 h-10 md:w-12 md:h-12 fill-current" /> : <Mic className="text-white w-10 h-10 md:w-12 md:h-12" />}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm md:text-base font-black text-slate-700 dark:text-slate-200 tracking-wide">{isRecording ? '正在倾听您的声音...' : '点击鹦鹉开始录制'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ready to mimic you!</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 md:p-8 rounded-[32px] md:rounded-[48px] border border-slate-100 dark:border-slate-600/50 animate-scale-in">
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-inner">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full h-10 md:h-12"
              />
            </div>
            <button onClick={() => setAudioUrl(null)} className="p-3 md:p-4 bg-white dark:bg-slate-700 text-red-500 dark:text-red-400 rounded-2xl md:rounded-3xl shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-200"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 md:gap-3 mb-6 md:mb-8">
            {(Object.keys(EFFECT_CONFIG) as VoiceEffect[]).map((eff) => {
              const Icon = EFFECT_ICONS[eff];
              const isSelected = selectedEffect === eff;
              const config = EFFECT_CONFIG[eff];
              return (
                <button
                  key={eff}
                  onClick={() => setSelectedEffect(eff)}
                  className={`flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl transition-all border-2 ${isSelected ? 'bg-white dark:bg-slate-600 border-emerald-400 shadow-lg scale-110' : 'bg-white/50 dark:bg-slate-800/50 border-transparent grayscale opacity-50 hover:opacity-100 hover:border-slate-200'}`}
                  title={config.label}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? config.color : 'text-slate-400 font-black'}`} />
                  <span className={`text-[9px] md:text-[10px] font-black ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 md:space-y-4">
            <input type="text" placeholder="给短语起个名..." className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-600 focus:border-emerald-500 outline-none text-xs md:text-sm font-bold dark:bg-slate-600/50 dark:text-white" value={label} onChange={(e) => setLabel(e.target.value)} />
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <Tag className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 dark:text-slate-500 self-center mr-0.5" />
              {SUGGESTED_TAGS.map(t => (
                <button key={t} onClick={() => setTag(t)} className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all  ${tag === t ? 'bg-slate-900 text-white dark:bg-slate-500' : 'bg-white text-slate-400 border border-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{t}</button>
              ))}
            </div>
            <button
              onClick={async () => {
                if (!audioUrl) return;

                // 获取音频 Duration
                const duration = await getAudioDuration(audioUrl);

                // 将 Blob URL 转换为 Base64 以实现持久化存储
                const response = await fetch(audioUrl);
                const blob = await response.blob();
                const reader = new FileReader();

                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });

                const base64Data = await base64Promise;

                onSave({
                  id: crypto.randomUUID(),
                  label,
                  audioUrl: base64Data, // 存储 Base64 而非 Blob URL
                  duration: duration > 0 ? duration : 2,
                  createdAt: Date.now(),
                  effect: selectedEffect,
                  playCount: 0,
                  mastery: 0,
                  tag
                });
                setLabel('');
                setTag('日常');
                setSelectedEffect('normal');
                setAudioUrl(null);
              }}
              disabled={!label.trim() || !audioUrl}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base  parrot-bounce"
            >
              保存指令
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Recorder;
