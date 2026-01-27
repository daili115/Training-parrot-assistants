/**
 * 语音辅助工具
 * 用于播报文本，帮助老年用户理解界面状态
 */

let synth: SpeechSynthesis | null = null;

// 检查浏览器是否支持语音合成
export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// 获取可用的中文语音
export const getChineseVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  // 优先选择中文语音
  const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
  return chineseVoice || voices[0] || null;
};

// 播报文本
export const speak = (text: string, rate: number = 1, volume: number = 0.8): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      console.warn('语音合成不支持');
      resolve();
      return;
    }

    // 停止当前正在播放的语音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getChineseVoice();

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.volume = volume;
    utterance.lang = 'zh-CN';

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('语音播报错误:', event);
      resolve(); // 即使出错也resolve，避免阻塞
    };

    window.speechSynthesis.speak(utterance);
  });
};

// 停止播报
export const stopSpeak = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

// 播报界面状态
export const speakInterfaceState = (state: {
  mode?: string;
  phraseCount?: number;
  streak?: number;
  isRecording?: boolean;
  isTraining?: boolean;
}) => {
  const messages: string[] = [];

  if (state.mode) {
    messages.push(`当前模式：${state.mode}`);
  }

  if (state.phraseCount !== undefined) {
    messages.push(`共有${state.phraseCount}个教学词汇`);
  }

  if (state.streak !== undefined) {
    messages.push(`连续训练${state.streak}天`);
  }

  if (state.isRecording) {
    messages.push('正在录音，请对着麦克风说话');
  }

  if (state.isTraining) {
    messages.push('训练模式已启动，鹦鹉正在学习');
  }

  if (messages.length > 0) {
    speak(messages.join('。'));
  }
};

// 播报操作反馈
export const speakFeedback = (action: string, success: boolean = true) => {
  const messages: Record<string, string> = {
    'save_phrase': success ? '词汇保存成功' : '保存失败，请重试',
    'delete_phrase': success ? '词汇已删除' : '删除失败',
    'start_training': '训练开始，鹦鹉正在学习',
    'stop_training': '训练结束，做得很好',
    'play_audio': '正在播放音频',
    'record_start': '开始录音',
    'record_stop': '录音结束',
    'unlock_badge': '恭喜你，获得新勋章',
    'complete_day': '今日训练完成',
    'easy_mode_on': '简易模式已开启',
    'easy_mode_off': '标准模式已开启',
    'voice_assist_on': '语音辅助已开启',
    'voice_assist_off': '语音辅助已关闭',
    'simplified_ui_on': '简化界面已开启',
    'simplified_ui_off': '简化界面已关闭',
    'save_photo': '照片已保存',
  };

  const message = messages[action] || (success ? '操作成功' : '操作失败');
  speak(message);
};

// 播报错误信息
export const speakError = (error: string) => {
  speak(`出错了：${error}`);
};

// 播报提示信息
export const speakTip = (tip: string) => {
  speak(`提示：${tip}`);
};
