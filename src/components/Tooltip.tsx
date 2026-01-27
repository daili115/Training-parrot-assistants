import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    setIsHovered(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    setIsHovered(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>

      {(isVisible || isHovered) && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}
        >
          <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 shadow-lg max-w-xs whitespace-pre-wrap break-words">
            {text}
            <div className={`absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2'
              : position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2'
              : position === 'left' ? 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2'
              : 'right-full top-1/2 translate-x-1/2 -translate-y-1/2'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

// 便捷组件：带图标的工具提示
export const InfoTooltip: React.FC<{ text: string; size?: 'sm' | 'md' }> = ({ text, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  return (
    <Tooltip text={text}>
      <Info className={`${sizeClasses[size]} text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help`} />
    </Tooltip>
  );
};

export default Tooltip;
