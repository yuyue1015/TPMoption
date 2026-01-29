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
    // 1. 缩小整体页面的上下内边距 (py-8 md:py-12 -> py-4 md:py-6)
    <div className="py-4 md:py-6 min-h-screen flex flex-col">
      
      {/* 2. 缩小标题区域的底部间距 (mb-10 -> mb-4) */}
      <div className="text-center mb-4">
        <div className="inline-flex p-2 bg-orange-500 rounded-xl text-white mb-2 shadow-md shadow-orange-100">
          <Compass size={28} />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">
          探险困境<span className="text-orange-600">生存指南</span>
        </h1>
        <p className="text-slate-400 text-xs font-medium">
          已收录 {DILEMMA_DATA.length} 条探险记录
        </p>
      </div>

      {/* 3. 缩小搜索框的底部间距 (mb-12 -> mb-6) */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-2 z-20 max-w-2xl mx-auto flex gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border-none text-sm focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="搜索困境名称 (如: 上古战场)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. 结果展示区：缩小初始占位图的间距 */}
      <div className="max-w-3xl mx-auto flex-1 w-full">
        {!query ? (
          <div className="flex flex-col items-center text-slate-300 mt-6 mb-6">
            <Zap className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-base font-medium">输入指令开启生存检索</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((group) => (
              <DilemmaCard key={group.name} data={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 px-4">
            <p className="font-medium text-sm italic">尚未收录该困境，请探险家谨慎决策！</p>
          </div>
        )}
      </div>
      
      {/* 5. 缩小页脚与内容的间距 (mt-20 -> mt-6) 并优化布局 */}
      <footer className="mt-6 pb-8 text-center border-t border-slate-100 pt-6 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <a 
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm"
          >
            <span>📝 提交反馈 / 补充数据</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] text-slate-300 uppercase tracking-widest font-sans">Data Source: Explorer Records</p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
             <span className="text-slate-600 font-bold text-sm">
               欢迎关注 
               <a 
                 href="https://xhslink.com/m/4fdFysr8G7t" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-orange-600 hover:text-red-500 hover:underline decoration-2 underline-offset-4 ml-1"
               >
                 悦小白游戏记
               </a>
             </span>
             <span className="hidden sm:block text-slate-200">|</span>
             <span className="text-slate-400 font-medium text-xs font-sans">小红书 @悦小白游戏记</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 困境卡片组件
function DilemmaCard({ data }: { data: GroupedDilemma }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      {/* 卡片头部：减小内边距 (py-5 -> py-3) */}
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-500 w-4 h-4" />
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            {data.name}
          </h2>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">
          <Map size={10} className="text-orange-400" />
          地图：{data.map || '未知'}
        </div>
      </div>

      {/* 选项列表：减小内边距 (py-6 -> py-4) */}
      <div className="divide-y divide-dashed divide-slate-100 px-5">
        {data.options.map((opt, idx) => (
          <div key={idx} className="py-4 group transition-colors hover:bg-orange-50/20 -mx-5 px-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center bg-slate-800 text-white rounded text-[10px] font-black">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-base font-bold text-slate-800 leading-snug">
                    {opt.option}
                  </p>
                </div>
              </div>
              
              <div className="ml-7 p-3 bg-slate-50/50 rounded-xl border border-transparent group-hover:bg-white group-hover:border-orange-100 transition-all">
                <div className="flex items-start gap-2">
                  <ResultIcon type={opt.evaluation} />
                  <p className={`text-sm font-bold leading-relaxed ${getResultColor(opt.evaluation)}`}>
                    {opt.result || "暂无记录"}
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

function ResultIcon({ type }: { type: string }) {
  const iconSize = 16;
  if (type?.includes('正面')) return <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={iconSize} />;
  if (type?.includes('负面')) return <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={iconSize} />;
  if (type?.includes('失踪')) return <Skull className="text-purple-500 flex-shrink-0 mt-0.5" size={iconSize} />;
  if (type?.includes('诅咒')) return <Zap className="text-indigo-500 flex-shrink-0 mt-0.5" size={iconSize} />;
  return <Zap className="text-slate-400 flex-shrink-0 opacity-20 mt-0.5" size={iconSize} />;
}

function getResultColor(evaluation: string) {
  if (evaluation?.includes('正面')) return 'text-emerald-700';
  if (evaluation?.includes('负面')) return 'text-red-700';
  if (evaluation?.includes('失踪')) return 'text-purple-700';
  if (evaluation?.includes('伤病')) return 'text-rose-700';
  if (evaluation?.includes('疾病')) return 'text-yellow-700';
  if (evaluation?.includes('诅咒')) return 'text-indigo-700';
  return 'text-slate-600';
}
