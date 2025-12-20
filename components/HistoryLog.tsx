
import React from 'react';
import { SessionStats } from '../types';
import { Calendar, Clock, BarChart2 } from 'lucide-react';

interface HistoryLogProps {
  history: SessionStats[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="py-10 text-center bg-white/5 rounded-[30px] border border-white/5">
        <p className="text-slate-500 text-xs font-bold italic">尚无训练记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
      {history.map((entry) => (
        <div key={entry.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black text-slate-300">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
            <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">SUCCESS</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1">播放</span>
                <span className="text-sm font-black text-white leading-none">{entry.totalPlays}次</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1">时长</span>
                <span className="text-sm font-black text-white leading-none">{entry.durationMinutes}min</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryLog;
