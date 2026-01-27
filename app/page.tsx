'use client';

import { useState, useMemo } from 'react';
import { Search, Map, Compass, AlertTriangle } from 'lucide-react';
import { DILEMMA_DATA, DilemmaRecord } from './dilemma-data';

// 定义聚合后的数据结构
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

    // 1. 先过滤出符合条件的行 (支持搜困境名、地图)
    const filteredRows = DILEMMA_DATA.filter(item => 
      (item.dilemma?.toLowerCase().includes(lowerQuery)) ||
      (item.map?.toLowerCase().includes(lowerQuery))
    );

    // 2. 将扁平的行按“困境名称”分组聚合
    const groups: { [key: string]: GroupedDilemma } = {};

    filteredRows.forEach(row => {
      if (!groups[row.dilemma]) {
        groups[row.dilemma] = {
          name: row.dilemma,
          map: row.map,
          options: []
        };
      }
      groups[row.dilemma].options.push(row);
    });

    // 转为数组返回
    return Object.values(groups);

  }, [query]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 mt-8">
          <div className="inline-block p-3 bg-orange-600 rounded-full text-white mb-4 shadow-lg">
            <Compass size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
            探险困境<span className="text-orange-600">生存指南</span>
          </h1>
          <p className="text-stone-500">
            已收录 {DILEMMA_DATA.length} 条记录，助你避开危险。
          </p>
        </div>

        {/* Search Bar */}
        <div className="sticky top-6 z-20 bg-white p-2 rounded-2xl shadow-xl border border-stone-200 mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-stone-400 w-6 h-6" />
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg placeholder-stone-400"
              placeholder="搜索困境名称 (例如: 上古战场)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-8">
          {!query ? (
            <div className="text-center py-20 opacity-40">
              <Map size={80} className="mx-auto mb-4 text-stone-300" />
              <p className="text-xl">请输入关键词开始查询...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((group) => (
              <DilemmaCard key={group.name} data={group} />
            ))
          ) : (
            <div className="text-center py-10 text-stone-500 bg-white rounded-xl border border-stone-200 border-dashed">
              <p>未收录该困境数据，请谨慎选择！</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-20 text-center text-xs text-stone-400">
          数据来源于探险家记录 | 仅供参考
        </div>

      </div>
    </div>
  );
}

// 单个困境卡片组件
function DilemmaCard({ data }: { data: GroupedDilemma }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-500 overflow-hidden hover:shadow-md transition-shadow">
      {/* 卡片头部：困境名 + 地图 */}
      <div className="bg-stone-50 p-4 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-orange-600" size={20} />
          {data.name}
        </h2>
        {data.map && (
          <span className="text-xs font-medium px-2 py-1 bg-stone-200 text-stone-600 rounded flex items-center gap-1">
            <Map size={12} />
            {data.map}
          </span>
        )}
      </div>

      {/* 选项列表 */}
      <div className="divide-y divide-stone-100">
        {data.options.map((opt, idx) => (
          <div key={idx} className="p-4 md:p-5 flex flex-col md:flex-row gap-2 md:gap-4 md:items-center group hover:bg-orange-50/30 transition-colors">
            
            {/* 左侧：选择 */}
            <div className="md:w-1/3 shrink-0">
              <span className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1 block">
                你的选择
              </span>
              <div className="font-bold text-stone-800 text-lg leading-tight">
                {opt.option}
              </div>
            </div>

            {/* 右侧：结果 (修改点：去图标，加冒号，横排) */}
            <div className="flex-1">
               <div className="text-base">
                 <span className="text-xs text-stone-400 uppercase font-bold tracking-wider mr-2">
                   产生的后果：
                 </span>
                 <span className={`font-medium ${getResultColor(opt.evaluation)}`}>
                   {opt.result || "暂无明确结果记录"}
                 </span>
               </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// 辅助组件：根据评价显示不同颜色的文字
function getResultColor(evaluation: string) {
  if (evaluation?.includes('正面')) return 'text-emerald-700';
  if (evaluation?.includes('负面')) return 'text-red-700';
  if (evaluation?.includes('失踪')) return 'text-purple-700';
  if (evaluation?.includes('伤病')) return 'text-rose-700';
  if (evaluation?.includes('疾病')) return 'text-yellow-700'; // 疾病用土黄色/深黄色
  if (evaluation?.includes('诅咒')) return 'text-indigo-700';
  return 'text-stone-600';
}
