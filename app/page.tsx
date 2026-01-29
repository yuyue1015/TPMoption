'use client';

import { useState, useMemo } from 'react';
import { Search, Compass, AlertTriangle, ExternalLink, Map, CheckCircle, XCircle, Skull, Zap } from 'lucide-react';
import { DILEMMA_DATA, DilemmaRecord } from './dilemma-data';

// --- 【配置区域】 ---
const FORM_URL = "https://my.feishu.cn/share/base/form/shrcnL8QkRKAuxL5J6FuT2nVOoe"; 
// -------------------

interface GroupedDilemma {
  name: string;
  map: string;
  options: DilemmaRecord[];
}

export default function DilemmaSearchApp() {
  const [query, setQuery] = useState('');

  // 核心逻辑：搜索 + 分组
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();

    const filteredRows = DILEMMA_DATA.filter(item => 
      (item.dilemma?.toLowerCase().includes(lowerQuery)) ||
      (item.map?.toLowerCase().includes(lowerQuery))
    );

    const groups: { [key: string]: GroupedDilemma } = {};
    filteredRows.forEach(row => {
      if (!groups[row.dilemma]) {
        groups[row.dilemma] = { name: row.dilemma, map: row.map, options: [] };
      }
      groups[row.dilemma].options.push(row);
    });

    return Object.values(groups);
  }, [query]);

  return (
    <div className="py-8 md:py-12 min-h-screen">
      {/* 标题区域 */}
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-orange-500 rounded-2xl text-white mb-4 shadow-lg shadow-orange-200">
          <Compass size={36} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
          探险困境<span className="text-orange-600">生存指南</span>
        </h1>
        <p className="text-slate-500 font-medium">
          已收录 {DILEMMA_DATA.length} 条探险记录
        </p>
      </div>

      {/* 搜索框 */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-12 sticky top-4 z-20 max-w-2xl mx-auto flex gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none text-base focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="搜索困境名称 (如: 上古战场)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 结果列表 */}
      <div className="max-w-3xl mx-auto min-h-[400px]">
        {!query ? (
          <div className="flex flex-col items-center text-slate-300 mt-20">
            <Zap className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">输入指令开启生存检索</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-10">
            {results.map((group) => (
              <DilemmaCard key={group.name} data={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <p className="font-medium italic">尚未收录该困境，请探险家谨慎决策！</p>
          </div>
        )}
      </div>
      
    {/* 底部关注信息 */}
      <footer className="mt-20 pb-12 text-center border-t border-slate-200 pt-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <a 
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
          >
            <span>📝 提交反馈 / 补充数据</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Adventure Survival Database | 仅供参考</p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
             <span className="text-slate-600 font-bold">
               欢迎关注 
               <a 
                 href="https://xhslink.com/m/4fdFysr8G7t" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-orange-600 hover:text-red-500 hover:underline decoration-2 underline-offset-4 transition-all ml-1"
               >
                 悦小白游戏记
               </a>
             </span>
             <span className="hidden sm:block text-slate-300">|</span>
             <span className="text-slate-400 font-medium text-sm font-sans">小红书 @悦小白游戏记</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 困境卡片组件
function DilemmaCard({ data }: { data: GroupedDilemma }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      {/* 卡片头部 */}
      <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <AlertTriangle className="text-orange-500 w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {data.name}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500">
          <Map size={12} className="text-orange-400" />
          地图：{data.map || '未知区域'}
        </div>
      </div>

      {/* 选项列表 - 增加虚线分隔 */}
      <div className="divide-y-2 divide-dashed divide-slate-50 px-6">
        {data.options.map((opt, idx) => (
          <div key={idx} className="py-6 group transition-colors hover:bg-orange-50/30 -mx-6 px-6">
            <div className="flex flex-col gap-3">
              {/* 选择行 */}
              <div className="flex items-start gap-2">
                <span className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-900 text-white rounded-lg text-[10px] font-black">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Your Choice / 你的选择</span>
                  <p className="text-lg font-bold text-slate-800 leading-tight">
                    {opt.option}
                  </p>
                </div>
              </div>
              
              {/* 后果行 */}
              <div className="ml-8 p-4 bg-slate-50/50 rounded-2xl border border-transparent group-hover:bg-white group-hover:border-orange-100 transition-all">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Consequence / 产生后果</span>
                <div className="flex items-start gap-3">
                  <ResultIcon type={opt.evaluation} />
                  <p className={`text-base font-bold leading-relaxed ${getResultColor(opt.evaluation)}`}>
                    {opt.result || "暂无明确结果记录"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 辅助组件：根据评价显示图标
function ResultIcon({ type }: { type: string }) {
  const iconSize = 20;
  if (type?.includes('正面')) return <CheckCircle className="text-emerald-500 flex-shrink-0" size={iconSize} />;
  if (type?.includes('负面')) return <XCircle className="text-red-500 flex-shrink-0" size={iconSize} />;
  if (type?.includes('失踪')) return <Skull className="text-purple-500 flex-shrink-0" size={iconSize} />;
  if (type?.includes('诅咒')) return <Zap className="text-indigo-500 flex-shrink-0" size={iconSize} />;
  return <Zap className="text-slate-400 flex-shrink-0 opacity-20" size={iconSize} />;
}

// 颜色辅助函数
function getResultColor(evaluation: string) {
  if (evaluation?.includes('正面')) return 'text-emerald-700';
  if (evaluation?.includes('负面')) return 'text-red-700';
  if (evaluation?.includes('失踪')) return 'text-purple-700';
  if (evaluation?.includes('伤病')) return 'text-rose-700';
  if (evaluation?.includes('疾病')) return 'text-yellow-700';
  if (evaluation?.includes('诅咒')) return 'text-indigo-700';
  return 'text-slate-600';
}


