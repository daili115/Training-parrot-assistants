import React, { createContext, useContext, useState, useEffect } from 'react';

interface EasyModeContextType {
  isEasyMode: boolean;
  toggleEasyMode: () => void;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  voiceAssist: boolean;
  setVoiceAssist: (enabled: boolean) => void;
  simplifiedUI: boolean;
  setSimplifiedUI: (enabled: boolean) => void;
}

const EasyModeContext = createContext<EasyModeContextType | undefined>(undefined);

export const EasyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEasyMode, setIsEasyMode] = useState(() => {
    const saved = localStorage.getItem('parrot_easy_mode');
    return saved === 'true';
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>(() => {
    const saved = localStorage.getItem('parrot_font_size');
    return (saved as 'normal' | 'large' | 'extra-large') || 'normal';
  });

  const [voiceAssist, setVoiceAssist] = useState(() => {
    const saved = localStorage.getItem('parrot_voice_assist');
    return saved === 'true';
  });

  const [simplifiedUI, setSimplifiedUI] = useState(() => {
    const saved = localStorage.getItem('parrot_simplified_ui');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('parrot_easy_mode', isEasyMode.toString());
  }, [isEasyMode]);

  useEffect(() => {
    localStorage.setItem('parrot_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('parrot_voice_assist', voiceAssist.toString());
  }, [voiceAssist]);

  useEffect(() => {
    localStorage.setItem('parrot_simplified_ui', simplifiedUI.toString());
  }, [simplifiedUI]);

  const toggleEasyMode = () => {
    setIsEasyMode(prev => !prev);
  };

  return (
    <EasyModeContext.Provider
      value={{
        isEasyMode,
        toggleEasyMode,
        fontSize,
        setFontSize,
        voiceAssist,
        setVoiceAssist,
        simplifiedUI,
        setSimplifiedUI,
      }}
    >
      {children}
    </EasyModeContext.Provider>
  );
};

export const useEasyMode = () => {
  const context = useContext(EasyModeContext);
  if (!context) {
    throw new Error('useEasyMode must be used within EasyModeProvider');
  }
  return context;
};
