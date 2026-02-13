import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Sparkles, Play, Trash2 } from 'lucide-react';
import { speak } from '../utils/voiceAssist';
import { notificationManager } from './NotificationManager';

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResultItem {
  0: RecognitionAlternative;
}

interface RecognitionEvent {
  results: RecognitionResultItem[];
}

interface RecognitionEngine {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => RecognitionEngine;

interface ExtendedWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const STORAGE_KEY = 'parrot_mama_encouragement_audio_v1';
const ENCOURAGEMENTS = [
  '太棒了！你家鹦鹉会叫妈妈啦！',
  '听到了“妈妈”，做得非常好，继续鼓励它！',
  '真聪明！鹦鹉说“妈妈”成功，给它一点奖励吧！'
];

export const ParrotCallResponder: React.FC = () => {
  const recognitionRef = useRef<RecognitionEngine | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const detectCooldownRef = useRef(0);

  const [isListening, setIsListening] = useState(false);
  const [isRecordingEncouragement, setIsRecordingEncouragement] = useState(false);
  const [status, setStatus] = useState('待机中');
  const [detectCount, setDetectCount] = useState(0);
  const [lastTranscript, setLastTranscript] = useState('');
  const [encouragementAudio, setEncouragementAudio] = useState<string | null>(null);

  const isSupported = useMemo(() => {
    const speechWindow = window as ExtendedWindow;
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.onend = null;
      recognitionRef.current = null;
    }
    setIsListening(false);
    setStatus('已停止监听');
  }, []);

  const stopEncouragementRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingEncouragement) {
      mediaRecorderRef.current.stop();
    }

    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(track => track.stop());
      recordingStreamRef.current = null;
    }

    setIsRecordingEncouragement(false);
  }, [isRecordingEncouragement]);

  const playEncouragementAudio = useCallback(async () => {
    if (!encouragementAudio) return false;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(encouragementAudio);
      audioRef.current = audio;
      await audio.play();
      return true;
    } catch (error) {
      console.error('播放鼓励录音失败:', error);
      return false;
    }
  }, [encouragementAudio]);

  const handleDetectedMama = useCallback(async (recognizedText: string) => {
    const now = Date.now();
    if (now - detectCooldownRef.current < 3500) {
      return;
    }
    detectCooldownRef.current = now;

    setDetectCount(prev => prev + 1);
    const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

    setStatus('检测到“妈妈”并已鼓励');
    notificationManager.showNotification({
      type: 'milestone',
      title: '检测到鹦鹉叫“妈妈”',
      message: encouragementAudio ? '已播放你的鼓励录音' : encouragement,
      icon: '🦜',
      duration: 3500
    });

    if (navigator.vibrate) {
      navigator.vibrate(120);
    }

    const played = await playEncouragementAudio();
    if (!played) {
      await speak(`检测到鹦鹉说妈妈。${encouragement}`, 1, 0.9);
    }

    setLastTranscript(recognizedText);
  }, [encouragementAudio, playEncouragementAudio]);

  const startEncouragementRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem(STORAGE_KEY, base64);
          setEncouragementAudio(base64);
          setStatus('鼓励录音已保存');
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      recordingStreamRef.current = stream;
      setIsRecordingEncouragement(true);
      setStatus('正在录制鼓励语音...');
    } catch (error) {
      console.error('录制鼓励音频失败:', error);
      setStatus('无法录制鼓励语音，请检查麦克风权限');
    }
  }, []);

  const clearEncouragementAudio = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEncouragementAudio(null);
    setStatus('已清除鼓励录音，将使用系统语音');
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setStatus('当前浏览器不支持语音识别');
      return;
    }

    const speechWindow = window as ExtendedWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setStatus('当前浏览器不支持语音识别');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('正在监听麦克风...');
    };

    recognition.onerror = () => {
      setStatus('语音识别出错，请检查麦克风权限');
      setIsListening(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
          setStatus('监听已停止，请重新开始');
        }
      }
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
        .replace(/[\s，。！？!?,.]/g, '');

      setLastTranscript(transcript);

      if (transcript.includes('妈妈') || transcript.includes('麻麻')) {
        handleDetectedMama(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [handleDetectedMama, isSupported]);

  useEffect(() => {
    setEncouragementAudio(localStorage.getItem(STORAGE_KEY));
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
      stopEncouragementRecording();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stopListening, stopEncouragementRecording]);

  return (
    <section className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-lg font-black mb-4 flex items-center gap-3 text-slate-800 dark:text-white">
        <Sparkles className="w-5 h-5 text-pink-500" />
        鹦鹉“妈妈”自动响应
      </h2>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        使用手机麦克风持续监听。当识别到鹦鹉叫“妈妈”时，优先播放你录制的鼓励音频；若未录制则自动语音鼓励并弹出提示。
      </p>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all ${isListening ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? '停止监听' : '开始监听'}
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400">状态：{status}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={isRecordingEncouragement ? stopEncouragementRecording : startEncouragementRecording}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-white ${isRecordingEncouragement ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          <Mic className="w-4 h-4" />
          {isRecordingEncouragement ? '停止并保存鼓励录音' : '录制鼓励录音'}
        </button>
        <button
          onClick={() => playEncouragementAudio()}
          disabled={!encouragementAudio}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          试听鼓励录音
        </button>
        <button
          onClick={clearEncouragementAudio}
          disabled={!encouragementAudio}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          清除录音
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-slate-500 dark:text-slate-400">识别到“妈妈”次数</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{detectCount}</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3">
          <p className="text-slate-500 dark:text-slate-400">最近识别文本</p>
          <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{lastTranscript || '暂无'}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        当前鼓励模式：{encouragementAudio ? '自定义录音（优先）' : '系统语音播报'}
      </p>

      {!isSupported && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          当前浏览器可能不支持语音识别。建议使用手机 Chrome 浏览器。
        </p>
      )}
    </section>
  );
};

export default ParrotCallResponder;
