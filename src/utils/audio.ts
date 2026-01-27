import { VoiceEffect } from '../types';

export const EFFECT_CONFIG: Record<string, {
  label: string;
  rate: number;
  pitch: boolean;
  color: string;
}> = {
  normal: { label: '原声', rate: 1.0, pitch: true, color: 'text-slate-500' },
  parrot: { label: '鹦鹉', rate: 1.25, pitch: false, color: 'text-emerald-500' },
  deep: { label: '浑厚', rate: 0.85, pitch: false, color: 'text-blue-700' },
  robot: { label: '机械', rate: 1.0, pitch: false, color: 'text-cyan-500' },
  chipmunk: { label: '花栗鼠', rate: 1.5, pitch: false, color: 'text-amber-500' },
  baby: { label: '宝宝', rate: 1.15, pitch: false, color: 'text-pink-400' },
  monster: { label: '怪兽', rate: 0.7, pitch: false, color: 'text-red-700' },
  alien: { label: '外星', rate: 1.1, pitch: false, color: 'text-purple-500' },
  radio: { label: '对讲机', rate: 1.05, pitch: false, color: 'text-orange-500' },
  ghost: { label: '幽灵', rate: 0.75, pitch: true, color: 'text-indigo-400' },
  squirrel: { label: '松鼠', rate: 1.4, pitch: false, color: 'text-orange-400' },
  giant: { label: '巨人', rate: 0.6, pitch: false, color: 'text-slate-800' },
  female: { label: '女声', rate: 1.1, pitch: false, color: 'text-rose-400' },
  grandpa: { label: '爷爷', rate: 0.9, pitch: false, color: 'text-stone-500' }
};

export const EFFECT_KEYS = Object.keys(EFFECT_CONFIG) as VoiceEffect[];

export const SUGGESTED_TAGS = ['日常', '问候', '动作', '食物', '搞怪', '学习', '指令'];

/**
 * 获取效果配置
 */
export function getEffectConfig(effect: VoiceEffect): { rate: number; preservesPitch: boolean } {
  const config = EFFECT_CONFIG[effect];
  return {
    rate: config.rate,
    preservesPitch: config.pitch
  };
}


/**
 * 应用声音效果到音频元素
 */
export function applyAudioEffect(
  audioElement: HTMLAudioElement,
  effect: VoiceEffect
): void {
  const config = EFFECT_CONFIG[effect];
  audioElement.playbackRate = config.rate;
  // @ts-ignore
  audioElement.preservesPitch = config.pitch;
}

/**
 * 安全地释放音频 URL
 */
export function safeRevokeURL(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('Failed to revoke URL:', error);
  }
}

/**
 * 获取音频时长（异步）
 */
export async function getAudioDuration(url: string): Promise<number> {
  if (!url) return 0;
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;

    const timeout = setTimeout(() => {
      resolve(2); // 默认 2 秒如果加载失败
    }, 2000);

    audio.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      resolve(audio.duration);
    });
    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      resolve(2);
    });
  });
}


/**
 * 将音量百分比转换为线性值（0-1）
 */
export function volumePercentToLinear(percent: number): number {
  return Math.max(0, Math.min(1, percent / 100));
}

/**
 * 将线性音量值转换为百分比
 */
export function linearVolumeToPercent(linear: number): number {
  return Math.round(linear * 100);
}