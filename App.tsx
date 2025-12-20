
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bird, Mic, Play, Square, Settings, Clock, 
  BarChart3, Dna, Trophy, X, ChevronRight,
  History, Filter, Calendar, ExternalLink
} from 'lucide-react';
import { Phrase, TrainingSlot, TrainingOrder, TrainingSettings, SessionStats } from './types';
import Recorder from './components/Recorder';
import PhraseCard from './components/PhraseCard';
import Scheduler from './components/Scheduler';
import TrainingEngine from './components/TrainingEngine';
import HistoryLog from './components/HistoryLog';

const DEFAULT_SETTINGS: TrainingSettings = {
  loopInterval: 10,
  sessionDuration: 15,
  order: TrainingOrder.SEQUENTIAL,
  volume: 0.8,
  naturalJitter: true,
  fadeInOut: true
};

const App: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [settings, setSettings] = useState<TrainingSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<SessionStats[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [lastSessionStats, setLastSessionStats] = useState<SessionStats | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const lastTriggeredRef = useRef<string | null>(null);

  useEffect(() => {
    const savedPhrases = localStorage.getItem('parrot_phrases_v3');
    const savedSlots = localStorage.getItem('parrot_slots');
    const savedSettings = localStorage.getItem('parrot_settings_v3');
    const savedHistory = localStorage.getItem('parrot_history');

    if (savedPhrases) setPhrases(JSON.parse(savedPhrases));
    if (savedSlots) setSlots(JSON.parse(savedSlots));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('parrot_phrases_v3', JSON.stringify(phrases));
    localStorage.setItem('parrot_slots', JSON.stringify(slots));
    localStorage.setItem('parrot_settings_v3', JSON.stringify(settings));
    localStorage.setItem('parrot_history', JSON.stringify(history));
  }, [phrases, slots, settings, history]);

  const handleTrainingFinish = (stats: Omit<SessionStats, 'id' | 'date'>) => {
    setIsTraining(false);
    const newEntry: SessionStats = {
      ...stats,
      id: crypto.randomUUID(),
      date: Date.now()
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 100)); // 增加上限到100条以供查看
    setLastSessionStats(newEntry);
  };

  const addPhrase = (phrase: Phrase) => setPhrases(prev => [phrase, ...prev]);
  const removePhrase = (id: string) => setPhrases(prev => prev.filter(p => p.id !== id));
  const updateMastery = (id: string, val: number) => setPhrases(prev => prev.map(p => p.id === id ? { ...p, mastery: val } : p));
  const incrementPlayCount = useCallback((id: string) => {
    setPhrases(prev => prev.map(p => p.id === id ? { ...p, playCount: (p.playCount || 0) + 1 } : p));
  }, []);

  const tags = ['全部', ...Array.from(new Set(phrases.map(p => p.tag).filter(Boolean)))];
  const filteredPhrases = selectedTag === '全部' ? phrases : phrases.filter(p => p.tag === selectedTag);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <header className="bird-gradient text-white px-6 py-6 md:p-8 shadow-2xl sticky top-0 z-30 rounded-b-[32px] md:rounded-b-[40px]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-2.5 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-md shadow-inner">
              <Bird className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none mb-1.5 md:mb-2">鹦鹉学舌大师</h1>
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold">
                <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  累计播放 {phrases.reduce((acc, p) => acc + (p.playCount || 0), 0)} 次
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => phrases.length > 0 && setIsTraining(true)}
            className={`w-full sm:w-auto group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 rounded-2xl md:rounded-3xl font-black transition-all shadow-xl active:scale-95 ${
              isTraining ? 'bg-red-500 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>开启沉浸教学</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 mt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <section id="recorder-section" className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100 relative">
            <h2 className="text-lg md:text-xl font-black mb-6 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-emerald-50 rounded-xl"><Mic className="w-5 h-5 text-emerald-500" /></div>
              新增录制
            </h2>
            <Recorder onSave={addPhrase} />
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
              <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl"><BarChart3 className="w-5 h-5 text-blue-500" /></div>
                教学库 ({filteredPhrases.length})
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                {tags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${
                      selectedTag === tag ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              {filteredPhrases.map(phrase => (
                <PhraseCard 
                  key={phrase.id} 
                  phrase={phrase} 
                  onDelete={removePhrase}
                  onUpdateMastery={updateMastery}
                  volume={settings.volume} 
                />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6 md:space-y-8">
           <section className="bg-slate-900 rounded-[32px] md:rounded-[40px] p-6 md:p-8 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black flex items-center gap-3">
                <History className="w-5 h-5 text-emerald-400" />
                最近训练
              </h2>
              {history.length > 0 && (
                <button 
                  onClick={() => setShowFullHistory(true)}
                  className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  查看全部
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <HistoryLog history={history.slice(0, 5)} />
          </section>

          <section className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-slate-800">
              <Settings className="w-5 h-5 text-blue-500" />
              参数微调
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">播放音量</label>
                  <span className="text-blue-600 font-black">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={settings.volume}
                  onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
                  className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">播放间隔</label>
                  <span className="text-blue-600 font-black">{settings.loopInterval}秒</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="1"
                  value={settings.loopInterval}
                  onChange={(e) => setSettings({ ...settings, loopInterval: parseInt(e.target.value) })}
                  className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-600">声音淡入淡出</span>
                <button 
                  onClick={() => setSettings({...settings, fadeInOut: !settings.fadeInOut})}
                  className={`w-10 h-5 rounded-full relative transition-all ${settings.fadeInOut ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.fadeInOut ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-slate-800">
              <Clock className="w-5 h-5 text-amber-500" />
              定时闹钟
            </h2>
            <Scheduler slots={slots} onAdd={(t) => setSlots([...slots, {id: crypto.randomUUID(), time: t, enabled: true}].sort((a,b)=>a.time.localeCompare(b.time)))} onRemove={(id)=>setSlots(slots.filter(s=>s.id!==id))} onToggle={(id)=>setSlots(slots.map(s=>s.id===id?{...s,enabled:!s.enabled}:s))} />
          </section>
        </div>
      </main>

      {/* 全屏历史模态框 */}
      {showFullHistory && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[85vh] rounded-[40px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <History className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">完整训练档案</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Training History Records</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullHistory(false)}
                className="p-3 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              <div className="grid gap-4">
                {history.map((entry) => (
                  <div key={entry.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-black text-slate-200">
                          {new Date(entry.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        </span>
                      </div>
                      <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {entry.durationMinutes} 分钟教学
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">播放指令</span>
                        <span className="text-2xl font-black text-white">{entry.totalPlays} <span className="text-sm text-slate-500">次</span></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">训练收益</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="text-lg font-black text-white">显著提升</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 border-t border-white/10 bg-black/20 shrink-0 flex justify-center">
              <button 
                onClick={() => setShowFullHistory(false)}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95"
              >
                关闭记录
              </button>
            </div>
          </div>
        </div>
      )}

      {isTraining && (
        <TrainingEngine 
          phrases={filteredPhrases} 
          settings={settings} 
          onFinish={handleTrainingFinish}
          onPhrasePlayed={incrementPlayCount}
        />
      )}

      {lastSessionStats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 rounded-[30px] flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">训练完成！</h2>
            <p className="text-slate-400 text-sm mb-8">本次教学了 {lastSessionStats.totalPlays} 次，用时 {lastSessionStats.durationMinutes} 分钟。</p>
            <button onClick={() => setLastSessionStats(null)} className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black">收下了</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
