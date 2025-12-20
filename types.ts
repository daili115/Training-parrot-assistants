
export type VoiceEffect = 
  | 'normal'   // 原声
  | 'parrot'   // 鹦鹉 (高频清脆)
  | 'deep'     // 浑厚 (低沉)
  | 'robot'    // 机械 (电音)
  | 'chipmunk' // 花栗鼠 (极高极快)
  | 'baby'     // 小宝宝 (可爱稚嫩)
  | 'monster'  // 怪兽 (极低沉)
  | 'alien'    // 外星人 (空灵)
  | 'radio'    // 对讲机 (高穿透)
  | 'ghost';   // 幽灵 (空洞慢速)

export interface Phrase {
  id: string;
  label: string;
  audioUrl: string;
  duration: number;
  createdAt: number;
  effect: VoiceEffect;
  playCount: number;
  mastery: number; 
  tag: string;    // 必填分类标签
}

export interface TrainingSlot {
  id: string;
  time: string; // HH:mm format
  enabled: boolean;
}

export enum TrainingOrder {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random',
  WEAK_LINK = 'weak_link',
  NEWEST = 'newest'
}

export interface TrainingSettings {
  loopInterval: number; // seconds
  sessionDuration: number; // minutes
  order: TrainingOrder;
  volume: number; // 0 to 1
  naturalJitter: boolean;
  fadeInOut: boolean; // 新增：声音淡入淡出
}

export interface SessionStats {
  id: string;
  date: number;
  totalPlays: number;
  durationMinutes: number;
}
