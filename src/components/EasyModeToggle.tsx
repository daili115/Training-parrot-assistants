import React from 'react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak, speakFeedback, speakInterfaceState } from '../utils/voiceAssist';
import { Accessibility, Volume2, Type, Zap, Contrast, Waves } from 'lucide-react';

export const EasyModeToggle: React.FC = () => {
  const {
    isEasyMode,
    toggleEasyMode,
    fontSize,
    setFontSize,
    voiceAssist,
    setVoiceAssist,
    simplifiedUI,
    setSimplifiedUI,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion
  } = useEasyMode();

  const handleToggleEasyMode = () => {
    toggleEasyMode();
    const newState = !isEasyMode;
    speakFeedback(newState ? 'easy_mode_on' : 'easy_mode_off', true);
    if (newState) {
      speak('简易模式已开启，界面将变得更简单，字体更大');
    } else {
      speak('简易模式已关闭');
    }
  };

  const handleFontSizeChange = (size: 'normal' | 'large' | 'extra-large') => {
    setFontSize(size);
    const sizeNames = { normal: '正常', large: '大字体', 'extra-large': '超大字体' };
    speak(`字体大小已切换为${sizeNames[size]}`);
  };

  const handleVoiceAssistToggle = () => {
    const newState = !voiceAssist;
    setVoiceAssist(newState);
    speakFeedback(newState ? 'voice_assist_on' : 'voice_assist_off', true);
    if (newState) {
      speak('语音辅助已开启，界面操作将会有语音提示');
    } else {
      speak('语音辅助已关闭');
    }
  };

  const handleSimplifiedUIToggle = () => {
    const newState = !simplifiedUI;
    setSimplifiedUI(newState);
    speakFeedback(newState ? 'simplified_ui_on' : 'simplified_ui_off', true);
    if (newState) {
      speak('简化界面已开启，将隐藏部分复杂功能');
    } else {
      speak('简化界面已关闭');
    }
  };

  const handleHighContrastToggle = () => {
    const newState = !highContrast;
    setHighContrast(newState);
    speak(newState ? '高对比度模式已开启，文字会更清晰' : '高对比度模式已关闭');
  };

  const handleReduceMotionToggle = () => {
    const newState = !reduceMotion;
    setReduceMotion(newState);
    speak(newState ? '动态效果已减少，画面会更稳定' : '动态效果已恢复');
  };

  return (
    <div className="relative group">
      <button
        onClick={handleToggleEasyMode}
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${
          isEasyMode
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
        title="切换简易模式"
      >
        <Accessibility className="w-5 h-5" />
        <span className="text-sm md:text-lg">{isEasyMode ? '简易模式' : '标准模式'}</span>
      </button>

      {/* 悬浮菜单 */}
      <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="space-y-4">
          {/* 简易模式开关 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">简易模式</span>
            </div>
            <button
              onClick={handleToggleEasyMode}
              className={`w-12 h-6 rounded-full relative transition-all ${
                isEasyMode ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  isEasyMode ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 字体大小 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">字体大小</span>
            </div>
            <div className="flex gap-2">
              {(['normal', 'large', 'extra-large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    fontSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {size === 'normal' ? '正常' : size === 'large' ? '大' : '超大'}
                </button>
              ))}
            </div>
          </div>

          {/* 语音辅助 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">语音辅助</span>
            </div>
            <button
              onClick={handleVoiceAssistToggle}
              className={`w-12 h-6 rounded-full relative transition-all ${
                voiceAssist ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  voiceAssist ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 简化界面 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">简化界面</span>
            </div>
            <button
              onClick={handleSimplifiedUIToggle}
              className={`w-12 h-6 rounded-full relative transition-all ${
                simplifiedUI ? 'bg-purple-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  simplifiedUI ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 高对比度 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4 text-sky-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">高对比度</span>
            </div>
            <button
              onClick={handleHighContrastToggle}
              className={`w-12 h-6 rounded-full relative transition-all ${
                highContrast ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  highContrast ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 减少动态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">减少动态</span>
            </div>
            <button
              onClick={handleReduceMotionToggle}
              className={`w-12 h-6 rounded-full relative transition-all ${
                reduceMotion ? 'bg-teal-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  reduceMotion ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => speakInterfaceState({ mode: isEasyMode ? '简易模式' : '标准模式' })}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            播报当前状态
          </button>

          {/* 提示信息 */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              💡 简易模式会放大字体、简化界面，适合老年用户使用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
