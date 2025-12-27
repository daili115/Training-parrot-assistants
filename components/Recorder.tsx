
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
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            {isRecording && <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 animate-ping" style={{ transform: `scale(${1 + dbLevel / 40})` }} />}
            <button onClick={isRecording ? stopRecording : startRecording} className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {isRecording ? <Square className="text-white w-10 h-10 fill-current" /> : <Mic className="text-white w-10 h-10" />}
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 tracking-wide">{isRecording ? '录音中...' : '点击录制新指令'}</p>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-[32px] border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-4 mb-6">
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="flex-1 h-10"
            />
            <button onClick={() => setAudioUrl(null)} className="p-3 bg-white dark:bg-slate-700 text-red-400 dark:text-red-300 rounded-2xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {(Object.keys(EFFECT_CONFIG) as VoiceEffect[]).map((eff) => {
              const Icon = EFFECT_ICONS[eff];
              const isSelected = selectedEffect === eff;
              const config = EFFECT_CONFIG[eff];
              return (
                <button
                  key={eff}
                  onClick={() => setSelectedEffect(eff)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'bg-white shadow-md scale-110 dark:bg-slate-700' : 'grayscale opacity-50 hover:opacity-100 hover:bg-white hover:dark:bg-slate-700'}`}
                  title={config.label}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? config.color : ''}`} />
                  <span className="text-[8px] font-black">{config.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <input type="text" placeholder="给短语起个名..." className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold dark:bg-slate-600 dark:border-slate-500 dark:text-white" value={label} onChange={(e) => setLabel(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-slate-300 dark:text-slate-500 self-center mr-1" />
              {SUGGESTED_TAGS.map(t => (
                <button key={t} onClick={() => setTag(t)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${tag === t ? 'bg-slate-900 text-white dark:bg-slate-600' : 'bg-white text-slate-400 border border-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{t}</button>
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
