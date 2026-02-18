'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Compass, 
  AlertTriangle, 
  ExternalLink, 
  Map, 
  CheckCircle, 
  XCircle, 
  Skull, 
  Zap 
} from 'lucide-react';
import { DILEMMA_DATA, DilemmaRecord } from './dilemma-data';

// --- 【配置区域】 ---
const FORM_URL = "https://my.feishu.cn/share/base/form/shrcnL8QkRKAuxL5J6FuT2nVOoe"; 
// -------------------

interface GroupedDilemma {
  name: string;
  map: string;
  options: GroupedOption[];
}

interface GroupedOption {
  option: string;
  records: DilemmaRecord[];
}

export default function DilemmaSearchApp() {
  const [query, setQuery] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  // 1. 解决水合错误：确保页面只在客户端完全挂载后显示
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const results = useMemo(() => {
    if (!hasMounted || !query.trim()) return [];
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

      const optionGroups = groups[row.dilemma].options;
      const sameOption = optionGroups.find((opt) => opt.option === row.option);

      if (sameOption) {
        sameOption.records.push(row);
      } else {
        optionGroups.push({ option: row.option, records: [row] });
      }
    });

    return Object.values(groups);
  }, [query, hasMounted]);

  // 挂载前保持空白，防止闪烁报错
  if (!hasMounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="py-4 md:py-6 min-h-screen flex flex-col antialiased bg-slate-50">
      
      {/* 顶部 Banner - 缩小居中显示 */}
      <div className="w-full flex justify-center mb-6 px-4">
        <a 
          href="/" 
          className="block w-[70%] md:w-[40%] max-w-[400px] aspect-[3/1] relative overflow-hidden rounded-xl shadow-sm border border-slate-100 bg-white hover:shadow-md transition-all"
        >
          <img 
            src="/banner.png" 
            alt="探险困境生存指南" 
            className="w-full h-full object-contain"
          />
        </a>
      </div>

      {/* 标题区域 */}
      <div className="text-center mb-4">

        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">
          探险困境<span className="text-orange-600">生存指南</span>
        </h1>
        <p className="text-slate-400 text-xs font-medium">
          已收录 {DILEMMA_DATA.length} 条探险记录 | 更新时间2026年2月18日
        </p>
      </div>

      {/* 搜索框 - 优化字号且防止 iOS 缩放 */}
      <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-2 z-20 max-w-2xl mx-auto flex gap-1.5 w-[92%]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            placeholder="搜索困境名称 (如: 声东击西)..."
            // 物理 16px 防止 iOS 缩放，视觉通过 scale 缩小至 13px
            style={{ fontSize: '16px', transform: 'scale(0.8125)', transformOrigin: 'left center', width: '123%' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 结果展示区 */}
      <div className="max-w-3xl mx-auto flex-1 w-full px-4">
        {!query ? (
          <div className="flex flex-col items-center text-slate-300 mt-6 mb-6">
            <Zap className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm font-medium">输入指令开启生存检索</p>
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
      
      {/* 底部关注信息 */}
      <footer className="mt-8 pb-10 text-center border-t border-slate-200 pt-8 max-w-3xl mx-auto w-full px-4">
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
                  className="text-orange-600 underline decoration-orange-600/30 decoration-2 underline-offset-4 hover:text-red-500 hover:decoration-red-500 transition-all ml-1"
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
              
              <div className="ml-7 space-y-2">
                {opt.records.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-slate-50/50 rounded-xl border border-transparent group-hover:bg-white group-hover:border-orange-100 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <ResultIcon type={record.evaluation} />
                      <p className={`text-sm font-bold leading-relaxed ${getResultColor(record.evaluation)}`}>
                        {record.result || '暂无记录'}
                      </p>
                    </div>
                  </div>
                ))}
                {opt.records.length > 1 && (
                  <p className="text-[11px] text-slate-400">该选项存在 {opt.records.length} 条结果</p>
                )}
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





