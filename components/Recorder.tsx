
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Save, X, Sparkles, User, Bird, 
  AudioLines, Zap, Rabbit, Baby, Ghost, 
  Radio, Atom, Skull, Tag, MessageSquare, Mic2 
} from 'lucide-react';
import { Phrase, VoiceEffect } from '../types';
import TextToSpeech from './TextToSpeech';

interface RecorderProps {
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

type InputMode = 'record' | 'text';

const Recorder: React.FC<RecorderProps> = ({ onSave }) => {
  const [mode, setMode] = useState<InputMode>('record');
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
      const config = EFFECT_CONFIG[selectedEffect];
      audioRef.current.playbackRate = config.rate;
      // @ts-ignore
      audioRef.current.preservesPitch = config.pitch;
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
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="flex bg-slate-100 rounded-2xl p-1">
        <button
          onClick={() => setMode('record')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${mode === 'record' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Mic2 className="w-5 h-5" />
          录音模式
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare className="w-5 h-5" />
          文本转语音
        </button>
      </div>

      {/* 录音模式 */}
      {mode === 'record' && (
        <>
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
            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  className="flex-1 h-10" 
                />
                <button onClick={() => setAudioUrl(null)} className="p-3 bg-white text-red-400 rounded-2xl shadow-sm"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
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

              <div className="space-y-4">
                <input type="text" placeholder="给短语起个名..." className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold" value={label} onChange={(e) => setLabel(e.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-slate-300 self-center mr-1" />
                  {SUGGESTED_TAGS.map(t => (
                    <button key={t} onClick={() => setTag(t)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${tag === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{t}</button>
                  ))}
                </div>
                <button 
                  onClick={() => onSave({id: crypto.randomUUID(), label, audioUrl, duration: 2, createdAt: Date.now(), effect: selectedEffect, playCount: 0, mastery: 0, tag})}
                  disabled={!label.trim()}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20"
                >
                  保存指令
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 文本转语音模式 */}
      {mode === 'text' && <TextToSpeech onSave={onSave} />}
    </div>
  );
};

export default Recorder;
