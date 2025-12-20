import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, X, Sparkles, User, Bird, 
  AudioLines, Zap, Rabbit, Baby, Ghost, 
  Radio, Atom, Skull, Tag, Volume2 
} from 'lucide-react';
import { Phrase, VoiceEffect } from '../types';

interface TextToSpeechProps {
  onSave: (phrase: Phrase) => void;
}

const EFFECT_CONFIG: Record<VoiceEffect, { label: string; icon: any; rate: number; pitch: boolean; color: string }> = {
  normal:   { label: '原声', icon: User, rate: 1.0, pitch: true, color: 'text-slate-500' },
  parrot:   { label: '鹦鹉', icon: Bird, rate: 1.25, pitch: false, color: 'text-emerald-500' },
  deep:     { label: '浑厚', icon: AudioLines, rate: 0.85, pitch: false, color: 'text-blue-700' },
  robot:    { label: '机械', icon: Zap, rate: 1.0, pitch: false, color: 'text-cyan-500' },
  chipmunk: { label: '花栗鼠', icon: Rabbit, rate: 1.5, pitch: false, color: 'text-amber-500' },
  baby:     { label: '宝宝', icon: Baby, rate: 1.15, pitch: false, color: 'text-pink-400' },
  monster:  { label: '怪兽', icon: Skull, rate: 0.7, pitch: false, color: 'text-red-700' },
  alien:    { label: '外星', icon: Atom, rate: 1.1, pitch: false, color: 'text-purple-500' },
  radio:    { label: '对讲机', icon: Radio, rate: 1.05, pitch: false, color: 'text-orange-500' },
  ghost:    { label: '幽灵', icon: Ghost, rate: 0.75, pitch: true, color: 'text-indigo-400' }
};

const SUGGESTED_TAGS = ['日常', '问候', '动作', '食物', '搞怪'];

const TextToSpeech: React.FC<TextToSpeechProps> = ({ onSave }) => {
  const [text, setText] = useState('');
  const [tag, setTag] = useState('日常');
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect>('normal');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEffect, setCurrentEffect] = useState<VoiceEffect>('normal');

  // 当音频元素加载完成或效果改变时，应用声音效果
  useEffect(() => {
    if (audioRef.current) {
      const config = EFFECT_CONFIG[currentEffect];
      audioRef.current.playbackRate = config.rate;
      // @ts-ignore
      audioRef.current.preservesPitch = config.pitch;
    }
  }, [currentEffect, audioUrl]);

  const generateSpeech = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    try {
      // 使用 Web Speech API 生成语音
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0; // 先使用正常语速生成，效果在播放时应用
      utterance.pitch = 1.0; // 先使用正常音调生成，效果在播放时应用
      utterance.volume = 1;

      // 创建一个简单的音频流来捕获语音
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setCurrentEffect(selectedEffect);
        } else {
          // 如果直接录制失败，使用替代方案
          // 直接播放并让用户听到效果，然后保存原始语音和效果配置
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'zh-CN';
          utterance.rate = EFFECT_CONFIG[selectedEffect].rate;
          utterance.pitch = EFFECT_CONFIG[selectedEffect].pitch ? 1 : 0.5;
          window.speechSynthesis.speak(utterance);
          
          // 创建一个空的音频URL，仅用于保存效果配置
          // 实际效果将在播放时应用
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          
          // 使用一个简单的静音音频作为占位符
          const audioBlob = new Blob([], { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setCurrentEffect(selectedEffect);
        }
      };

      // 使用 SpeechSynthesis 生成语音
      const speechSynthesis = window.speechSynthesis;
      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      };

      mediaRecorder.start();
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('语音合成失败:', err);
      // 失败时使用简单的替代方案
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200">
        <div className="space-y-4">
          <textarea
            placeholder="输入要合成的文本..."
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold h-24 resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="grid grid-cols-5 gap-2 mb-4">
            {(Object.keys(EFFECT_CONFIG) as VoiceEffect[]).map((eff) => {
              const Icon = EFFECT_CONFIG[eff].icon;
              const isSelected = selectedEffect === eff;
              return (
                <button key={eff} onClick={() => {
                  setSelectedEffect(eff);
                  setCurrentEffect(eff);
                }} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'bg-white shadow-md scale-110' : 'grayscale opacity-50'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? EFFECT_CONFIG[eff].color : ''}`} />
                  <span className="text-[8px] font-black">{EFFECT_CONFIG[eff].label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={generateSpeech}
              disabled={!text.trim() || isGenerating}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {isGenerating ? '生成中...' : '生成语音'}
            </button>
          </div>

          {audioUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="flex-1 h-10"
                />
                <button onClick={() => setAudioUrl(null)} className="p-3 bg-white text-red-400 rounded-2xl shadow-sm"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-slate-300 self-center mr-1" />
                  {SUGGESTED_TAGS.map(t => (
                    <button key={t} onClick={() => setTag(t)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${tag === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{t}</button>
                  ))}
                </div>
                <button
                  onClick={() => onSave({
                    id: crypto.randomUUID(),
                    label: text,
                    audioUrl,
                    duration: 2,
                    createdAt: Date.now(),
                    effect: selectedEffect,
                    playCount: 0,
                    mastery: 0,
                    tag
                  })}
                  disabled={!text.trim()}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20"
                >
                  保存指令
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;