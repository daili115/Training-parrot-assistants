import React from 'react';
import { useEasyMode } from '../context/EasyModeContext';

interface BigCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export const BigCard: React.FC<BigCardProps> = ({
  title,
  icon,
  children,
  color = 'from-emerald-500 to-cyan-500',
  onClick,
  className = '',
}) => {
  const { isEasyMode } = useEasyMode();

  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-3xl md:rounded-[48px]
        p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700
        transition-all hover:shadow-2xl
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${isEasyMode ? 'text-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-6">
        {icon && (
          <div className={`p-3 md:p-4 bg-gradient-to-br ${color} rounded-2xl md:rounded-3xl shadow-sm`}>
            {icon}
          </div>
        )}
        <h2 className={`font-black ${isEasyMode ? 'text-2xl' : 'text-xl'} text-slate-800 dark:text-white`}>
          {title}
        </h2>
      </div>

      <div className={isEasyMode ? 'text-lg' : ''}>
        {children}
      </div>
    </div>
  );
};
