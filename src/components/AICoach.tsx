import React, { useState } from 'react';
import { Phrase } from '../types';
import { Sparkles, RotateCcw as RefreshIcon } from 'lucide-react';

interface AICoachProps {
  phrases: Phrase[];
}

const GENERAL_ADVICE = [
  '每次训练 5-10 分钟即可，短而频繁比长时间训练更有效。',
  '用固定口令开始训练，例如“开始学说话”，帮助鹦鹉建立条件反射。',
  '只在鹦鹉状态放松时训练，避免在惊吓或躁动时强行引导。',
  '说出目标词后立刻奖励，奖励越及时，学习速度越快。',
  '每天在同一时间段训练，更容易形成稳定习惯。'
];

const buildPhraseAdvice = (phrases: Phrase[]): string[] => {
  if (phrases.length === 0) {
    return [
      '建议先从 2-3 个双音节词开始，比如“你好”“吃饭”“宝贝”。',
      '先训练高频场景词：喂食前、互动前、睡前。',
      ...GENERAL_ADVICE.slice(0, 2)
    ];
  }

  const labels = phrases.slice(0, 4).map((phrase) => `“${phrase.label}”`).join('、');
  return [
    `你当前的训练词包括：${labels}。建议先主练其中 1-2 个词，避免一次过多。`,
    '把目标词拆成清晰节奏，保持稳定语速，并重复 8-12 次为一组。',
    '每完成一组就让鹦鹉休息 1 分钟，防止注意力下降。',
    GENERAL_ADVICE[Math.floor(Math.random() * GENERAL_ADVICE.length)]
  ];
};

const AICoach: React.FC<AICoachProps> = ({ phrases }) => {
  const [advice, setAdvice] = useState<string | null>(null);

  const getAdvice = () => {
    const nextAdvice = buildPhraseAdvice(phrases).join('\n');
    setAdvice(nextAdvice);
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
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2 flex items-center gap-1 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <RefreshIcon className="w-3 h-3" />
            换一批建议
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-xs text-emerald-700/70 italic">
            根据你录制的短语，获取本地生成的训练建议。
          </p>
          <button
            onClick={getAdvice}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            <Sparkles className="w-4 h-4" />
            生成训练策略
          </button>
        </div>
      )}
    </div>
  );
};

export default AICoach;
