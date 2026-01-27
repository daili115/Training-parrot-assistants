import React, { useState } from 'react';
import { Heart, Utensils, Home, Thermometer, Activity, Users, Shield, Sun, Feather } from 'lucide-react';
import { useEasyMode } from '../context/EasyModeContext';
import { speak } from '../utils/voiceAssist';

interface SimpleCareTipsProps {
  onClose: () => void;
}

const SimpleCareTips: React.FC<SimpleCareTipsProps> = ({ onClose }) => {
  const { isEasyMode, voiceAssist } = useEasyMode();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 简化的饲养技巧分类（适合老年用户）
  const categories = [
    {
      id: 'food',
      name: '饮食',
      icon: <Utensils className="w-6 h-6" />,
      color: 'from-emerald-500 to-cyan-500',
      tips: [
        '每天提供新鲜的水果和蔬菜',
        '确保有清洁的饮用水',
        '避免喂食巧克力、咖啡、酒精',
        '适量喂食种子和谷物',
      ],
    },
    {
      id: 'home',
      name: '居住环境',
      icon: <Home className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      tips: [
        '笼子要足够大，让鹦鹉能伸展翅膀',
        '每天让鹦鹉出笼活动1-2小时',
        '保持笼子清洁，每周清理一次',
        '提供不同高度的栖木',
      ],
    },
    {
      id: 'temperature',
      name: '温度湿度',
      icon: <Thermometer className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      tips: [
        '保持室温在20-25度之间',
        '避免空调直吹',
        '适当增加湿度，特别是干燥季节',
        '避免温度剧烈变化',
      ],
    },
    {
      id: 'health',
      name: '健康监测',
      icon: <Activity className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      tips: [
        '观察鹦鹉的精神状态',
        '注意粪便的颜色和形状',
        '定期检查羽毛和皮肤',
        '发现异常及时就医',
      ],
    },
    {
      id: 'social',
      name: '社交互动',
      icon: <Users className="w-6 h-6" />,
      color: 'from-rose-500 to-orange-500',
      tips: [
        '每天与鹦鹉互动15-30分钟',
        '温柔地抚摸和说话',
        '避免大声喧哗或惊吓',
        '建立信任关系',
      ],
    },
    {
      id: 'safety',
      name: '安全防护',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-amber-500 to-yellow-500',
      tips: [
        '关好门窗，防止飞走',
        '收好电线和危险物品',
        '避免使用有毒清洁剂',
        '检查玩具是否有尖锐边角',
      ],
    },
    {
      id: 'sunlight',
      name: '阳光照射',
      icon: <Sun className="w-6 h-6" />,
      color: 'from-teal-500 to-green-500',
      tips: [
        '每天晒太阳15-30分钟',
        '避免正午强烈阳光',
        '提供阴凉处',
        '促进维生素D合成',
      ],
    },
    {
      id: 'grooming',
      name: '日常护理',
      icon: <Feather className="w-6 h-6" />,
      color: 'from-pink-500 to-purple-500',
      tips: [
        '定期修剪指甲和翅膀',
        '提供洗澡盆或喷雾',
        '保持羽毛清洁',
        '定期驱虫',
      ],
    },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category && voiceAssist) {
      speak(`选择了${category.name}分类`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-2xl font-black hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
        >
          返回
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">饲养技巧</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">选择分类查看详细指南</p>
        </div>
        <div className="w-20"></div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 分类选择 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all
                ${selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-xl`
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:shadow-lg'
                }
              `}
            >
              <div className={`p-3 rounded-2xl ${selectedCategory === category.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                {category.icon}
              </div>
              <span className="font-black text-sm">{category.name}</span>
            </button>
          ))}
        </div>

        {/* 技巧详情 */}
        {selectedCategory && (
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              {categories.find(c => c.id === selectedCategory)?.name}技巧
            </h3>
            <ul className="space-y-3">
              {categories.find(c => c.id === selectedCategory)?.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xs flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 温馨提示 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-6 border border-amber-200 dark:border-amber-800/30">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">
            💡 温馨提示：每只鹦鹉都是独特的个体，饲养时要根据实际情况灵活调整。如有疑问，请咨询专业兽医。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleCareTips;
