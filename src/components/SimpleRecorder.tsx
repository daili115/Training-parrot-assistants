import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Timer } from 'lucide-react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak, speakFeedback, speakError } from '../utils/voiceAssist';
import { Phrase, VoiceEffect } from '../types';

interface SimpleRecorderProps {
  onSave: (phrase: Phrase) => void;
}

const SimpleRecorder: React.FC<SimpleRecorderProps> = ({ onSave }) => {
  const { isEasyMode, voiceAssist } = useEasyMode();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [effect, setEffect] = useState<VoiceEffect>('normal');
  const [label, setLabel] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTag, setSelectedTag] = useState('日常用语');
  const [recordLimit, setRecordLimit] = useState<15 | 30 | 60>(30);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const presetTags = ['日常用语', '指令', '名字', '问候', '其他'];

  const presetEffects: { name: string; value: VoiceEffect; description: string }[] = [
    { name: '原声', value: 'normal', description: '正常声音' },
    { name: '鹦鹉', value: 'parrot', description: '清脆高亢' },
    { name: '浑厚', value: 'deep', description: '低沉稳重' },
    { name: '宝宝', value: 'baby', description: '可爱稚嫩' },
    { name: '卡通', value: 'cartoon', description: '活泼有趣' },
    { name: '耳语', value: 'whisper', description: '轻声柔和' },
  ];

  const startVolumeMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average / 255);

        if (isRecording) {
          requestAnimationFrame(updateVolume);
        } else {
          setVolume(0);
        }
      };

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      updateVolume();
    } catch (err) {
      console.error('无法启动音量监控:', err);
    }
  };

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      if (voiceAssist) speak('开始录音，请说话');
      speakFeedback('record_start');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        speakFeedback('record_stop');
        if (voiceAssist) speak('录音结束');
        clearTimer();
        setRemainingSeconds(0);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRemainingSeconds(recordLimit);
      startVolumeMonitoring(stream);

      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      speakError('无法访问麦克风');
      console.error('录音错误:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    clearTimer();

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;

    speakFeedback('play_audio');

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const effectMap: Record<VoiceEffect, number> = {
      normal: 1,
      parrot: 1.25,
      deep: 0.85,
      robot: 1,
      chipmunk: 1.5,
      baby: 1.3,
      monster: 0.7,
      alien: 1.1,
      radio: 1.05,
      ghost: 0.75,
      squirrel: 1.4,
      giant: 0.6,
      female: 1.1,
      grandpa: 0.9,
      echo: 0.95,
      cartoon: 1.35,
      narrator: 0.92,
      opera: 1.18,
      whisper: 0.88,
      fast: 1.6,
      slow: 0.65,
    };

    audio.playbackRate = effectMap[effect] || 1;
    // @ts-ignore
    audio.preservesPitch = false;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      speakError('播放失败');
    };

    audio.play();
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const saveRecording = async () => {
    if (!audioBlob || !label.trim()) {
      speakError('请先录音并选择分类');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;

        const newPhrase: Phrase = {
          id: crypto.randomUUID(),
          label: label.trim(),
          audioUrl: base64,
          duration: 0,
          createdAt: Date.now(),
          effect,
          playCount: 0,
          mastery: 50,
          tag: selectedTag,
        };

        onSave(newPhrase);
        speakFeedback('save_phrase');

        setAudioBlob(null);
        setAudioUrl(null);
        setLabel('');
        setEffect('normal');
        setSelectedTag('日常用语');
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      speakError('保存失败');
      console.error('保存错误:', err);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setLabel('');
    speakFeedback('delete_phrase');
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioRef.current) audioRef.current.pause();
      if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      clearTimer();
    };
  }, [audioUrl]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-blue-100 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Timer className="w-4 h-4" /> 录音时长
        </p>
        <div className="grid grid-cols-3 gap-2">
          {([15, 30, 60] as const).map((s) => (
            <button
              key={s}
              onClick={() => setRecordLimit(s)}
              className={`py-2 rounded-xl font-black ${recordLimit === s ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {s}秒
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {isRecording && (
          <div className="w-full space-y-2">
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-100" style={{ width: `${volume * 100}%` }} />
            </div>
            <p className="text-center text-sm font-bold text-rose-600 dark:text-rose-300">剩余 {remainingSeconds} 秒</p>
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`
            flex flex-col items-center justify-center gap-2
            ${isEasyMode ? 'w-36 h-36' : 'w-32 h-32'} rounded-full
            transition-all active:scale-95
            ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white hover:shadow-xl'}
          `}
        >
          {isRecording ? (
            <><Square className="w-8 h-8 fill-current" /><span className="font-black text-lg">停止录音</span></>
          ) : (
            <><Mic className="w-8 h-8" /><span className="font-black text-lg">开始录音</span></>
          )}
        </button>

        {isRecording && <p className="text-sm text-slate-500 dark:text-slate-400">正在录音中... 请对着麦克风说话</p>}
      </div>

      {audioUrl && (
        <div className="flex gap-3 justify-center">
          <button onClick={isPlaying ? stopPlaying : playRecording} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? '停止播放' : '播放结果'}
          </button>
          <button onClick={deleteRecording} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"><Trash2 className="w-4 h-4" />删除</button>
        </div>
      )}

      <div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">想要的声音效果：</p>
        <div className="grid grid-cols-2 gap-2">
          {presetEffects.map((e) => (
            <button key={e.value} onClick={() => { setEffect(e.value); if (voiceAssist) speak(`${e.name}效果`); }} className={`px-4 py-3 rounded-xl font-black transition-all ${effect === e.value ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              <div>{e.name}</div>
              <div className="text-[11px] opacity-80 font-semibold">{e.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">词汇名称：</p>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="例如：早上好、吃饭了"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white font-bold"
        />
      </div>

      <div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">选择分类：</p>
        <div className="flex flex-wrap gap-2">
          {presetTags.map((tag) => (
            <button key={tag} onClick={() => { setSelectedTag(tag); if (voiceAssist) speak(tag); }} className={`px-4 py-3 rounded-xl font-black transition-all ${selectedTag === tag ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button onClick={saveRecording} disabled={!audioBlob || !label.trim()} className={`w-full py-5 rounded-2xl font-black text-xl transition-all ${audioBlob && label.trim() ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
        保存教学词汇
      </button>

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200">
        <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">💡 提示：可先选录音时长，再录制并保存到对应分类。</p>
      </div>
    </div>
  );
};

export default SimpleRecorder;
