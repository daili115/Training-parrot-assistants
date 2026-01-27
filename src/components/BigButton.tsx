import React from 'react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak } from '../utils/voiceAssist';

interface BigButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  color?: string;
  disabled?: boolean;
  size?: 'normal' | 'large' | 'extra-large';
  description?: string;
}

export const BigButton: React.FC<BigButtonProps> = ({
  onClick,
  icon,
  label,
  color = 'from-emerald-500 to-cyan-500',
  disabled = false,
  size = 'normal',
  description,
}) => {
  const { isEasyMode, voiceAssist } = useEasyMode();

  const handleClick = () => {
    if (disabled) return;

    if (voiceAssist) {
      speak(label);
    }

    onClick();
  };

  const getSizeClasses = () => {
    if (isEasyMode || size === 'extra-large') {
      return {
        container: 'py-6 px-8 text-xl',
        icon: 'w-8 h-8',
        text: 'text-lg',
      };
    }

    if (size === 'large') {
      return {
        container: 'py-5 px-6 text-lg',
        icon: 'w-7 h-7',
        text: 'text-base',
      };
    }

    return {
      container: 'py-4 px-5 text-base',
      icon: 'w-6 h-6',
      text: 'text-sm',
    };
  };

  const sizes = getSizeClasses();

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden flex flex-col items-center justify-center gap-2
        bg-gradient-to-br ${color} text-white
        rounded-3xl shadow-xl
        transition-all active:scale-95 hover:shadow-2xl
        ${sizes.container}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${isEasyMode ? 'min-h-[80px]' : 'min-h-[60px]'}
      `}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />

      {icon && (
        <div className={sizes.icon}>
          {icon}
        </div>
      )}

      <span className={`font-black ${sizes.text} relative z-10`}>
        {label}
      </span>

      {description && isEasyMode && (
        <span className="text-xs opacity-80 relative z-10">
          {description}
        </span>
      )}
    </button>
  );
};
