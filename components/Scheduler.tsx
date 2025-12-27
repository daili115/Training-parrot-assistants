
import React, { useState } from 'react';
import { Plus, Trash2, Clock, CheckCircle2, Circle } from 'lucide-react';
import { TrainingSlot } from '../types';

interface SchedulerProps {
  slots: TrainingSlot[];
  onAdd: (time: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ slots, onAdd, onRemove, onToggle }) => {
  const [newTime, setNewTime] = useState('10:00');

  const handleAdd = () => {
    onAdd(newTime);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="time"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {slots.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm italic">未设定训练计划</p>
        ) : (
          slots.map(slot => (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                slot.enabled ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-slate-50 border-slate-100 opacity-60 dark:bg-slate-700 dark:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onToggle(slot.id)}
                  className={`p-1 rounded-full transition-colors ${
                    slot.enabled ? 'text-amber-500' : 'text-slate-300'
                  }`}
                >
                  {slot.enabled ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`font-bold ${slot.enabled ? 'text-amber-900 dark:text-amber-300' : 'text-slate-500 dark:text-slate-300'}`}>
                  {slot.time}
                </span>
              </div>
              <button
                  onClick={() => onRemove(slot.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors dark:text-slate-400 dark:hover:text-red-400"
                >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Scheduler;
