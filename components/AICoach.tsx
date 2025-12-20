
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Phrase } from '../types';
import { BrainCircuit, Loader2, Sparkles, RotateCcw as RefreshIcon } from 'lucide-react';

interface AICoachProps {
  phrases: Phrase[];
}

const AICoach: React.FC<AICoachProps> = ({ phrases }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const phraseLabels = phrases.map(p => p.label).join('、');
      
      const prompt = phrases.length > 0 
        ? `我正在训练鹦鹉说话。目前我录制的短语包括：${phraseLabels}。请提供 3 条科学且实用的教学建议，关于如何更有效地教它这些特定词语，或是通用的模仿训练技巧。请用中文回答，保持简洁并具有鼓励性。`
        : `我还没有给我的鹦鹉录制任何训练短语。请给我推荐 3 个适合初学者的经典中文词汇，并提供一个关于选择最佳训练时段的建议。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "获取建议时出现问题。");
    } catch (err) {
      console.error(err);
      setAdvice("请确保 API Key 已正确配置。典型建议：使用高价值零食作为奖励，并保持每次训练时间短而精！");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {advice ? (
        <div className="text-sm text-emerald-900 leading-relaxed animate-in fade-in duration-500">
          <div className="prose prose-sm prose-emerald">
            {advice.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          <button 
            onClick={() => setAdvice(null)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2 flex items-center gap-1"
          >
            <RefreshIcon className="w-3 h-3" />
            换一批建议
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-xs text-emerald-700/70 italic">
            根据你录制的短语，获取个性化的训练策略。
          </p>
          <button 
            onClick={getAdvice}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? '正在咨询导师...' : '生成训练策略'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AICoach;
