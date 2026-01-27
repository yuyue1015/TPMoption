'use client';

import { useState, useMemo } from 'react';
import { Search, Compass, AlertTriangle, ExternalLink } from 'lucide-react';
import { DILEMMA_DATA, DilemmaRecord } from './dilemma-data';

// --- 【配置区域】 ---
// 你的飞书表单链接 (直接填入你的分享链接即可)
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

    // 1. 过滤
    const filteredRows = DILEMMA_DATA.filter(item => 
      (item.dilemma?.toLowerCase().includes(lowerQuery)) ||
      (item.map?.toLowerCase().includes(lowerQuery))
    );

    // 2. 分组
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

    return Object.values(groups);

  }, [query]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col min-h-[90vh]">
        
        {/* 标题区域 */}
        <div className="text-center mb-8 mt-6">
          <div className="inline-block p-3 bg-orange-600 rounded-full text-white mb-4 shadow-lg">
            <Compass size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">
            探险困境<span className="text-orange-600">生存指南</span>
          </h1>
          <p className="text-stone-500 text-sm">
            已收录 {DILEMMA_DATA.length} 条记录
          </p>
        </div>

        {/* 搜索框 */}
        <div className="sticky top-4 z-20 bg-white p-2 rounded-xl shadow-lg border border-stone-200 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-stone-400 w-5 h-5" />
            <input 
              type="text" 
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 text-base placeholder-stone-400"
              placeholder="请输入困境名称 (如: 上古战场)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 结果列表 */}
        <div className="space-y-6 flex-grow">
          {!query ? (
            <div className="text-center py-16 opacity-40">
              <p className="text-lg">等待输入...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((group) => (
              <DilemmaCard key={group.name} data={group} />
            ))
          ) : (
            <div className="text-center py-8 text-stone-500 bg-white rounded-lg border border-dashed border-stone-300">
              <p>暂无相关记录</p>
            </div>
          )}
        </div>
        
        {/* 页脚区域 */}
        <div className="mt-16 mb-8 text-center space-y-6">
          
          {/* 反馈按钮 */}
          <div>
            <a 
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-300 rounded-full text-stone-600 font-medium hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
            >
              <span>📝 提交反馈 / 补充数据</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-stone-400">数据来源于探险家记录 | 仅供参考</p>
            <p className="text-sm font-medium text-orange-600">更多攻略欢迎关注 @悦小白游戏记</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// 卡片组件
function DilemmaCard({ data }: { data: GroupedDilemma }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
      
      {/* 头部：显示困境名称和地图 */}
      <div className="bg-orange-50 px-5 py-4 border-b border-orange-100">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-1">
          <AlertTriangle className="text-orange-600 w-5 h-5" />
          {data.name}
        </h2>
        <div className="text-stone-600 text-sm font-medium pl-7">
          地图：{data.map || '未知地图'}
        </div>
      </div>

      {/* 列表区域 */}
      <div className="px-5 py-2">
        {data.options.map((opt, idx) => (
          <div key={idx} className="py-4 border-b border-dashed border-stone-300 last:border-0 relative">
            {/* 第一行：你的选择 */}
            <div className="mb-2 text-base pr-2">
              <span className="font-bold text-stone-700">你的选择【{idx + 1}】：</span>
              <span className="text-stone-900">{opt.option}</span>
            </div>
            
            {/* 第二行：产生的后果 */}
            <div className="text-base">
              <span className="font-bold text-stone-500">产生的后果：</span>
              <span className={`font-medium ${getResultColor(opt.evaluation)}`}>
                {opt.result || "暂无明确结果"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 颜色辅助函数
function getResultColor(evaluation: string) {
  if (evaluation?.includes('正面')) return 'text-emerald-700';
  if (evaluation?.includes('负面')) return 'text-red-700';
  if (evaluation?.includes('失踪')) return 'text-purple-700';
  if (evaluation?.includes('伤病')) return 'text-rose-700';
  if (evaluation?.includes('疾病')) return 'text-yellow-700';
  if (evaluation?.includes('诅咒')) return 'text-indigo-700';
  return 'text-stone-600';
}
