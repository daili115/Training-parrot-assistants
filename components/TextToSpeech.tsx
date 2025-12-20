import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, X, Sparkles, User, Bird, 
  AudioLines, Zap, Rabbit, Baby, Ghost, 
  Radio, Atom, Skull, Tag 
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
  const [isPreviewing, setIsPreviewing] = useState(false);

  // 当选择不同音效时，直接使用 Web Speech API 预览效果
  const previewSpeech = () => {
    if (!text.trim()) return;
    
    setIsPreviewing(true);
    
    // 使用 Web Speech API 直接播放语音，不进行录制
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = EFFECT_CONFIG[selectedEffect].rate;
    utterance.pitch = EFFECT_CONFIG[selectedEffect].pitch ? 1 : 0.5;
    utterance.volume = 1;
    
    utterance.onend = () => {
      setIsPreviewing(false);
    };
    
    utterance.onerror = () => {
      setIsPreviewing(false);
    };
    
    window.speechSynthesis.speak(utterance);
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
                <button key={eff} onClick={() => setSelectedEffect(eff)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'bg-white shadow-md scale-110' : 'grayscale opacity-50'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? EFFECT_CONFIG[eff].color : ''}`} />
                  <span className="text-[8px] font-black">{EFFECT_CONFIG[eff].label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={previewSpeech}
              disabled={!text.trim() || isPreviewing}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {isPreviewing ? '播放中...' : '预览语音'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-slate-300 self-center mr-1" />
              {SUGGESTED_TAGS.map(t => (
                <button key={t} onClick={() => setTag(t)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${tag === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{t}</button>
              ))}
            </div>
            <button
              onClick={() => {
                // 保存文本和音效配置，不保存实际音频文件
                // 实际播放时会使用 Web Speech API 动态生成带效果的语音
                onSave({
                  id: crypto.randomUUID(),
                  label: text,
                  audioUrl: '', // 使用空字符串作为占位符
                  duration: 2,
                  createdAt: Date.now(),
                  effect: selectedEffect,
                  playCount: 0,
                  mastery: 0,
                  tag
                });
              }}
              disabled={!text.trim()}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20"
            >
              保存指令
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;