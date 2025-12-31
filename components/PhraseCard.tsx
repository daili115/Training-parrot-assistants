
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
    <div className="bg-white dark:bg-slate-800 rounded-[24px] md:rounded-[32px] p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all group relative overflow-hidden parrot-card hover-lift">
      <div
        className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
        style={{ width: `${phrase.mastery}%` }}
      />

      <div className="flex items-center gap-4 md:gap-6 w-full min-w-0 z-10">
        <button
          onClick={togglePlay}
          className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] flex items-center justify-center transition-all shadow-lg shrink-0  ${isPlaying ? 'bg-emerald-500 text-white scale-105 rotate-3' : 'bg-slate-50 text-emerald-600 dark:bg-slate-700 dark:text-emerald-400 hover:bg-emerald-50'
            }`}
        >
          {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />}
        </button>

        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="font-black text-slate-800 dark:text-white text-base md:text-xl truncate leading-tight group-hover:text-emerald-600 transition-colors">{phrase.label}</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl shrink-0 border border-emerald-100 dark:border-emerald-800">
              <Icon className="w-3 md:w-4 h-3 md:h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[8px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{phrase.effect}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
              <BarChart2 className="w-3 md:w-4 h-3 md:h-4" />
              {phrase.playCount || 0} 次
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Calendar className="w-3 md:w-4 h-3 md:h-4" />
              {new Date(phrase.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Trophy className={`w-4 h-4 md:w-5 md:h-5 ${phrase.mastery > 80 ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`} />
            <span className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200">{phrase.mastery}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="10"
            value={phrase.mastery}
            onChange={(e) => onUpdateMastery(phrase.id, parseInt(e.target.value))}
            className="w-16 md:w-28 h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <button
          onClick={() => onDelete(phrase.id)}
          className="p-2 md:p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all shrink-0"
        >
          <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
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
