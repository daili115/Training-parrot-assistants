import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Volume2, Trash2 } from 'lucide-react';
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 预设的简单标签
  const presetTags = ['日常用语', '指令', '名字', '问候', '其他'];

  // 预设的声音效果（简化版）
  const presetEffects: { name: string; value: VoiceEffect; description: string }[] = [
    { name: '原声', value: 'normal', description: '正常声音' },
    { name: '鹦鹉', value: 'parrot', description: '清脆高亢' },
    { name: '浑厚', value: 'deep', description: '低沉稳重' },
    { name: '宝宝', value: 'baby', description: '可爱稚嫩' },
  ];

  // 获取音量
  const getVolume = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average / 255);
        if (isRecording) {
          requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // 停止流，只用于音量检测
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('无法获取音量:', err);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      speakFeedback('record_start');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        speakFeedback('record_stop');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // 开始音量检测
      getVolume();

      // 自动停止录音（30秒限制）
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
    } catch (err) {
      speakError('无法访问麦克风');
      console.error('录音错误:', err);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // 播放录音
  const playRecording = () => {
    if (!audioUrl) return;

    speakFeedback('play_audio');

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // 应用音效
    const effectMap: Record<VoiceEffect, number> = {
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

    audio.playbackRate = effectMap[effect] || 1;
    audio.preservesPitch = false;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      speakError('播放失败');
    };

    audio.play();
  };

  // 停止播放
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // 保存录音
  const saveRecording = async () => {
    if (!audioBlob || !label.trim()) {
      speakError('请先录音并输入名称');
      return;
    }

    try {
      // 转换为Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;

        const newPhrase: Phrase = {
          id: crypto.randomUUID(),
          label: label.trim(),
          audioUrl: base64,
          duration: 0, // 将在播放时计算
          createdAt: Date.now(),
          effect,
          playCount: 0,
          mastery: 50,
          tag: '日常用语',
        };

        onSave(newPhrase);
        speakFeedback('save_phrase');

        // 重置状态
        setAudioBlob(null);
        setAudioUrl(null);
        setLabel('');
        setEffect('normal');
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      speakError('保存失败');
      console.error('保存错误:', err);
    }
  };

  // 删除录音
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setLabel('');
    speakFeedback('delete_phrase');
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  return (
    <div className="space-y-6">
      {/* 录音按钮区域 */}
      <div className="flex flex-col items-center gap-4">
        {/* 音量指示器 */}
        {isRecording && (
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-100"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        )}

        {/* 主录音按钮 */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`
            flex flex-col items-center justify-center gap-2
            w-32 h-32 rounded-full
            transition-all active:scale-95
            ${isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white hover:shadow-xl'
            }
            ${isEasyMode ? 'text-lg' : 'text-base'}
          `}
        >
          {isRecording ? (
            <>
              <Square className="w-8 h-8 fill-current" />
              <span className="font-black">停止录音</span>
            </>
          ) : (
            <>
              <Mic className="w-8 h-8" />
              <span className="font-black">按住录音</span>
            </>
          )}
        </button>

        {/* 录音提示 */}
        {isRecording && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            正在录音中... 请对着麦克风说话
          </p>
        )}
      </div>

      {/* 播放和删除按钮 */}
      {audioUrl && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={isPlaying ? stopPlaying : playRecording}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all
              ${isPlaying
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? '停止播放' : '播放录音'}
          </button>

          <button
            onClick={deleteRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      )}

      {/* 声音效果选择 */}
      <div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">选择声音效果</p>
        <div className="flex flex-wrap gap-2">
          {presetEffects.map((e) => (
            <button
              key={e.value}
              onClick={() => setEffect(e.value)}
              className={`
                px-4 py-2 rounded-xl font-black transition-all
                ${effect === e.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }
              `}
              title={e.description}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* 标签选择 */}
      <div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">选择分类</p>
        <div className="flex flex-wrap gap-2">
          {presetTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setLabel(tag)}
              className={`
                px-4 py-2 rounded-xl font-black transition-all
                ${label === tag
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 保存按钮 */}
      <button
        onClick={saveRecording}
        disabled={!audioBlob || !label.trim()}
        className={`
          w-full py-4 rounded-2xl font-black text-lg transition-all
          ${audioBlob && label.trim()
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }
        `}
      >
        保存录音
      </button>

      {/* 使用提示 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/30">
        <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">
          💡 使用提示：点击"按住录音"按钮开始录音，对着麦克风说话，然后点击"停止录音"。
        </p>
      </div>
    </div>
  );
};

export default SimpleRecorder;
