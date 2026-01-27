import React, { useState } from 'react';
import { X, Heart, Droplets, Apple, Home, ThermometerSun, Stethoscope, ChevronDown, ChevronUp, Bird, Sun, Star, Droplet } from 'lucide-react';

interface Tip {
  id: string;
  category: string;
  icon: React.ReactNode;
  title: string;
  content: string[];
  color: string;
}

const careTips: Tip[] = [
  {
    id: '1',
    category: '饮食',
    icon: <Apple className="w-5 h-5" />,
    title: '健康饮食指南',
    content: [
      '以高质量的混合种子作为主食，如小米、葵花籽、荞麦等',
      '每天补充新鲜蔬菜和水果，如西兰花、胡萝卜、苹果、香蕉等',
      '确保饮水每日更换，保持清洁避免变质',
      '适量提供墨鱼骨或钙质补充剂，帮助骨骼健康',
      '避免喂食巧克力、鳄梨、洋葱、大蒜等对鹦鹉有毒的食物'
    ],
    color: 'emerald'
  },
  {
    id: '2',
    category: '居住环境',
    icon: <Home className="w-5 h-5" />,
    title: '舒适居住环境',
    content: [
      '选择足够大的鸟笼，让鹦鹉能够自由展翅和活动',
      '笼子应放置在安静、光线充足但无直射阳光的地方',
      '避免将鸟笼放在厨房或有油烟的环境',
      '提供不同粗细的栖木，有助于脚部健康',
      '定期清洁鸟笼，每周至少彻底清洗一次'
    ],
    color: 'blue'
  },
  {
    id: '3',
    category: '温度湿度',
    icon: <ThermometerSun className="w-5 h-5" />,
    title: '适宜温湿度',
    content: [
      '最佳温度范围为18-28摄氏度',
      '避免温度骤变，不要将鸟笼放在空调或暖气出风口',
      '保持适当湿度（40%-60%），可以定期给鹦鹉喷水洗澡',
      '冬季注意保暖，可在笼子上加盖布遮挡',
      '夏季注意通风散热，避免中暑'
    ],
    color: 'amber'
  },
  {
    id: '4',
    category: '日常护理',
    icon: <Droplets className="w-5 h-5" />,
    title: '日常护理要点',
    content: [
      '每周提供2-3次洗澡机会，可用喷雾器或浅水盆',
      '定期检查并修剪过长的指甲和喙',
      '保持羽毛整洁，观察是否有脱毛或异常',
      '提供玩具和啃咬物，满足天然磨喙需求',
      '每天让鹦鹉有出笼活动的时间'
    ],
    color: 'cyan'
  },
  {
    id: '5',
    category: '社交互动',
    icon: <Heart className="w-5 h-5" />,
    title: '社交与互动',
    content: [
      '每天花时间与鹦鹉互动，建立信任关系',
      '用温和的声音与鹦鹉交流，避免大声吓到它',
      '循序渐进地进行训练，使用正向奖励',
      '鹦鹉是群居动物，长时间独处会导致抑郁',
      '观察鹦鹉的身体语言，了解它的情绪状态'
    ],
    color: 'pink'
  },
  {
    id: '6',
    category: '健康监测',
    icon: <Stethoscope className="w-5 h-5" />,
    title: '健康监测提醒',
    content: [
      '定期带鹦鹉去兽医处体检，建议每年至少一次',
      '注意观察排泄物颜色和形状，异常需及时就医',
      '留意食欲变化、羽毛蓬松、嗜睡等异常行为',
      '新购买的鹦鹉建议做病毒检测',
      '常见疾病包括呼吸道感染、羽虱、念珠菌感染等'
    ],
    color: 'red'
  },
  {
    id: '7',
    category: '品种特护',
    icon: <Bird className="w-5 h-5" />,
    title: '小太阳鹦鹉 (Sun Conure)',
    content: [
      '性格活泼好动，需要较大的活动空间和丰富的玩具',
      '喜欢攀爬和啃咬，提供安全的木质玩具和栖木',
      '对温度敏感，冬季需保持20℃以上，避免受凉',
      '社交性强，需要每天至少1-2小时互动时间',
      '容易肥胖，控制高脂肪种子摄入，多给蔬果',
      '叫声较大，适合有独立空间的家庭饲养'
    ],
    color: 'orange'
  },
  {
    id: '8',
    category: '品种特护',
    icon: <Star className="w-5 h-5" />,
    title: '玄凤鹦鹉 (Eclectus Parrot)',
    content: [
      '雌雄外观差异大，雌性绿色为主，雄性红色为主',
      '需要高蛋白饮食，可添加煮熟的鸡蛋、豆类',
      '对维生素A需求高，多给胡萝卜、南瓜等橙色蔬果',
      '性格相对温和，适合初学者饲养',
      '需要较大的笼子（至少80×80×100cm）',
      '喜欢安静环境，避免嘈杂和突然的惊吓',
      '换羽期需要额外营养补充'
    ],
    color: 'purple'
  },
  {
    id: '9',
    category: '品种特护',
    icon: <Droplet className="w-5 h-5" />,
    title: '彩虹吸蜜鹦鹉 (Rainbow Lorikeet)',
    content: [
      '主要以花蜜、花粉和水果为食，需要特殊饮食',
      '可喂食专门的吸蜜鹦鹉粉（混合花粉和花蜜）',
      '每天提供新鲜水果，如芒果、木瓜、香蕉',
      '需要大量的水分，保持饮水充足',
      '喜欢洗澡，每天喷水或提供浅水盆',
      '性格活泼亲人，但需要大量互动时间',
      '笼子需要有垂直空间供攀爬',
      '粪便较稀，需勤清理保持卫生'
    ],
    color: 'rose'
  }
];

interface ParrotCareTipsProps {
  onClose: () => void;
}

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50 dark:bg-emerald-900/20' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50 dark:bg-blue-900/20' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50 dark:bg-amber-900/20' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50 dark:bg-cyan-900/20' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50 dark:bg-pink-900/20' },
  red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50 dark:bg-red-900/20' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50 dark:bg-orange-900/20' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50 dark:bg-purple-900/20' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50 dark:bg-rose-900/20' },
};

const ParrotCareTips: React.FC<ParrotCareTipsProps> = ({ onClose }) => {
  const [expandedTip, setExpandedTip] = useState<string | null>('1');

  const toggleTip = (id: string) => {
    setExpandedTip(expandedTip === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 modal-overlay">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] rounded-[40px] flex flex-col shadow-2xl animate-scale-in relative z-10">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">鹦鹉饲养技巧</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Parrot Care Tips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
          <div className="space-y-4">
            {careTips.map((tip) => {
              const colors = colorClasses[tip.color];
              const isExpanded = expandedTip === tip.id;
              
              return (
                <div
                  key={tip.id}
                  className={`rounded-3xl border ${colors.border} dark:border-slate-700 overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
                >
                  <button
                    onClick={() => toggleTip(tip.id)}
                    className={`w-full p-5 flex items-center justify-between ${colors.light} hover:opacity-90 transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 ${colors.bg} text-white rounded-xl shadow-sm`}>
                        {tip.icon}
                      </div>
                      <div className="text-left">
                        <span className={`text-xs font-bold ${colors.text} dark:text-slate-400 uppercase tracking-wider`}>
                          {tip.category}
                        </span>
                        <h3 className="text-base font-black text-slate-800 dark:text-white">
                          {tip.title}
                        </h3>
                      </div>
                    </div>
                    <div className={`p-2 rounded-xl ${isExpanded ? 'bg-slate-200 dark:bg-slate-700' : 'bg-white/50 dark:bg-slate-800/50'} transition-all`}>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-5 pt-0 bg-white dark:bg-slate-900">
                      <ul className="space-y-3 mt-4">
                        {tip.content.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className={`w-2 h-2 ${colors.bg} rounded-full mt-2 shrink-0`} />
                            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex justify-center rounded-b-[40px]">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParrotCareTips;
