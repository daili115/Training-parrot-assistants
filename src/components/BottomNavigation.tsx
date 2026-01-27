import React from 'react';
import { Mic, Play, Heart, Trophy, Settings, Camera, BookOpen } from 'lucide-react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak } from '../utils/voiceAssist';

interface BottomNavigationProps {
  onRecordClick: () => void;
  onTrainClick: () => void;
  onCareClick: () => void;
  onBadgesClick: () => void;
  onGalleryClick: () => void;
  onSettingsClick: () => void;
  onTipsClick: () => void;
  isTraining: boolean;
  hasPhrases: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onRecordClick,
  onTrainClick,
  onCareClick,
  onBadgesClick,
  onGalleryClick,
  onSettingsClick,
  onTipsClick,
  isTraining,
  hasPhrases,
}) => {
  const { isEasyMode, voiceAssist } = useEasyMode();

  const handleClick = (action: string, callback: () => void) => {
    if (voiceAssist) {
      const messages: Record<string, string> = {
        record: '开始录音',
        train: isTraining ? '停止训练' : '开始训练',
        care: '查看饲养技巧',
        badges: '查看勋章',
        gallery: '查看照片墙',
        settings: '设置',
        tips: '饲养技巧',
      };
      speak(messages[action] || action);
    }
    callback();
  };

  const navItems = [
    {
      id: 'record',
      icon: <Mic className="w-6 h-6" />,
      label: '录音',
      onClick: () => handleClick('record', onRecordClick),
      color: 'from-emerald-500 to-cyan-500',
      hidden: false,
    },
    {
      id: 'train',
      icon: <Play className="w-6 h-6" />,
      label: isTraining ? '停止' : '训练',
      onClick: () => handleClick('train', onTrainClick),
      color: isTraining ? 'from-red-500 to-pink-500' : 'from-purple-500 to-pink-500',
      hidden: !hasPhrases,
      pulse: isTraining,
    },
    {
      id: 'care',
      icon: <Heart className="w-6 h-6" />,
      label: '饲养',
      onClick: () => handleClick('care', onCareClick),
      color: 'from-rose-500 to-orange-500',
      hidden: false,
    },
    {
      id: 'badges',
      icon: <Trophy className="w-6 h-6" />,
      label: '勋章',
      onClick: () => handleClick('badges', onBadgesClick),
      color: 'from-amber-500 to-yellow-500',
      hidden: false,
    },
    {
      id: 'gallery',
      icon: <Camera className="w-6 h-6" />,
      label: '照片',
      onClick: () => handleClick('gallery', onGalleryClick),
      color: 'from-blue-500 to-indigo-500',
      hidden: false,
    },
    {
      id: 'settings',
      icon: <Settings className="w-6 h-6" />,
      label: '设置',
      onClick: () => handleClick('settings', onSettingsClick),
      color: 'from-slate-500 to-gray-600',
      hidden: false,
    },
    {
      id: 'tips',
      icon: <BookOpen className="w-6 h-6" />,
      label: '技巧',
      onClick: () => handleClick('tips', onTipsClick),
      color: 'from-teal-500 to-green-500',
      hidden: false,
    },
  ];

  const visibleItems = navItems.filter(item => !item.hidden);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className={`grid gap-2 ${isEasyMode ? 'grid-cols-4' : `grid-cols-${Math.min(visibleItems.length, 7)}`}`}>
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                flex flex-col items-center justify-center gap-1 p-3 rounded-2xl
                bg-gradient-to-br ${item.color} text-white
                transition-all active:scale-95
                ${item.pulse ? 'animate-pulse shadow-lg' : ''}
                ${isEasyMode ? 'text-lg font-bold py-4' : 'text-xs font-bold'}
              `}
              title={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
