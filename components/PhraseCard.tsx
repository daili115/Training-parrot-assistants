
import React, { useRef, useState, useEffect } from 'react';
import {
  Play, Pause, Trash2, Calendar, User, Bird,
  AudioLines, Zap, BarChart2, Rabbit, Baby,
  Ghost, Radio, Atom, Skull, Trophy,
  Cat, Mountain, Flower2, Glasses
} from 'lucide-react';

import { Phrase, VoiceEffect } from '../types';
import { EFFECT_CONFIG } from '../utils/audio';

interface PhraseCardProps {
  phrase: Phrase;
  onDelete: (id: string) => void;
  onUpdateMastery: (id: string, value: number) => void;
  volume: number;
}

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


const PhraseCard: React.FC<PhraseCardProps> = ({ phrase, onDelete, onUpdateMastery, volume }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const config = EFFECT_CONFIG[phrase.effect || 'normal'];
      audioRef.current.playbackRate = config.rate;
      // @ts-ignore
      audioRef.current.preservesPitch = config.pitch;
    }
  }, [phrase.effect]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play();
    }
  };

  const Icon = EFFECT_ICONS[phrase.effect || 'normal'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 md:gap-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-all group relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 h-1 bg-emerald-400/20 transition-all duration-1000"
        style={{ width: `${phrase.mastery}%` }}
      />

      <div className="flex items-center gap-4 md:gap-5 w-full">
        <button
          onClick={togglePlay}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0 ${isPlaying ? 'bg-emerald-500 text-white scale-105 shadow-emerald-200 dark:shadow-emerald-900/50' : 'bg-slate-50 text-slate-400 dark:bg-slate-700 dark:text-slate-300'
            }`}
        >
          {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" /> : <Play className="w-6 h-6 md:w-7 md:h-7 fill-current ml-0.5 md:ml-1" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-slate-800 dark:text-white text-base md:text-lg truncate leading-none">{phrase.label}</h3>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0">
              <Icon className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-500 dark:text-slate-300" />
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-tighter">{phrase.effect}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <BarChart2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
              练习 {phrase.playCount || 0} 次
            </span>
            <span className="hidden xs:flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {new Date(phrase.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            <Trophy className={`w-3.5 h-3.5 ${phrase.mastery > 80 ? 'text-amber-400' : 'text-slate-200'}`} />
            <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300">{phrase.mastery}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="10"
            value={phrase.mastery}
            onChange={(e) => onUpdateMastery(phrase.id, parseInt(e.target.value))}
            className="w-16 md:w-24 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <button
          onClick={() => onDelete(phrase.id)}
          className="p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all active:scale-90"
        >
          <Trash2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={phrase.audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default PhraseCard;
