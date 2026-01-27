import React from 'react';
import { X, Trophy, Lock } from 'lucide-react';
import { Badge } from '../types';
import { BADGE_DEFINITIONS } from '../utils/gamification';

interface BadgeModalProps {
    unlockedBadges: Badge[];
    newBadge: Badge | null;
    onClose: () => void;
    onAckNewBadge: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ unlockedBadges, newBadge, onClose, onAckNewBadge }) => {
    const isNewBadgeView = !!newBadge;
    const unlockedIds = new Set(unlockedBadges.map(b => b.id));

    if (isNewBadgeView && newBadge) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 modal-overlay">
                <div className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden animate-scale-in">
                    {/* Confetti effect background (simplified as gradients) */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-100/50 to-transparent dark:from-amber-900/20" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner ring-4 ring-amber-50 dark:ring-amber-900/20">
                            <span className="text-4xl md:text-5xl animate-bounce">{newBadge.icon}</span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-black text-amber-500 mb-1 md:mb-2 uppercase tracking-wide">勋章解锁!</h2>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3 md:mb-4">{newBadge.name}</h3>
                        <p className="text-sm md:text-slate-500 dark:text-slate-400 font-medium mb-6 md:mb-8 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-xl md:rounded-2xl">
                            {newBadge.description}
                        </p>

                        <button
                            onClick={onAckNewBadge}
                            className="w-full py-3.5 md:py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl md:rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        >
                            太棒了！
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-8 modal-overlay">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] rounded-[32px] md:rounded-[40px] flex flex-col shadow-2xl animate-scale-in overflow-hidden">
                <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl md:rounded-2xl">
                            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">勋章墙</h2>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Achievements</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 md:p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl md:rounded-2xl transition-all"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        {BADGE_DEFINITIONS.map((def) => {
                            const isUnlocked = unlockedIds.has(def.id);
                            const unlockedInfo = unlockedBadges.find(b => b.id === def.id);

                            return (
                                <div
                                    key={def.id}
                                    className={`relative p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center text-center gap-2 md:gap-4 transition-all ${isUnlocked
                                        ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'
                                        : 'bg-slate-100 dark:bg-slate-900/50 grayscale opacity-60 border border-transparent'
                                        }`}
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-sm ${isUnlocked ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-slate-200 dark:bg-slate-800'
                                        }`}>
                                        {def.icon}
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <h3 className="font-black text-slate-800 dark:text-white mb-0.5 md:mb-1 text-xs md:text-sm truncate">{def.name}</h3>
                                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold leading-tight line-clamp-2">{def.description}</p>
                                    </div>

                                    {isUnlocked ? (
                                        <div className="absolute top-2 md:top-4 right-2 md:right-4 text-[8px] md:text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                                            已得
                                        </div>
                                    ) : (
                                        <div className="absolute top-2 md:top-4 right-2 md:right-4">
                                            <Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                                        </div>
                                    )}

                                    {isUnlocked && unlockedInfo && (
                                        <div className="mt-1 md:mt-2 text-[8px] md:text-[9px] text-slate-300 font-medium">
                                            {new Date(unlockedInfo.unlockedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeModal;
