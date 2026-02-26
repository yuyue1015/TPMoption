'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  AlertTriangle,
  ExternalLink,
  Map,
  CheckCircle,
  XCircle,
  Skull,
  Zap
} from 'lucide-react';
import { DILEMMA_DATA, DilemmaRecord } from './dilemma-data';

const FORM_URL = 'https://my.feishu.cn/share/base/form/shrcnL8QkRKAuxL5J6FuT2nVOoe';

type Mode = 'search' | 'game';
type GuessType = 'negative' | 'neutral' | 'positive';
interface GroupedDilemma {
  name: string;
  map: string;
  options: GroupedOption[];
}

interface GroupedOption {
  option: string;
  records: DilemmaRecord[];
}

interface GuessState {
  revealed: boolean;
  crossed: boolean;
  guessed?: GuessType;
}

type FeedbackState = {
  type: 'correct' | 'wrong';
  earned?: number;
} | null;

const PRAISE_MIN = 10;
const PRAISE_MAX = 15;
const PRAISE_DECREMENT_PER_SECOND = 2;
const ACHIEVEMENT_THRESHOLDS = [100, 500, 1000] as const;

function randomPraiseValue() {
  return Number((Math.random() * (PRAISE_MAX - PRAISE_MIN) + PRAISE_MIN).toFixed(2));
}

function clampPraise(value: number) {
  return Number(Math.max(value, 0).toFixed(2));
}

export default function DilemmaSearchApp() {
  const [query, setQuery] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('search');
  const [randomDilemma, setRandomDilemma] = useState<GroupedDilemma | null>(null);
  const [guessMap, setGuessMap] = useState<Record<string, GuessState>>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPraise, setCurrentPraise] = useState(0);
  const [totalPraise, setTotalPraise] = useState(0);
  const [isPraisePaused, setIsPraisePaused] = useState(false);
  const [achievementModal, setAchievementModal] = useState<number | null>(null);
  const triggeredAchievementsRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 1000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const groupedAllDilemmas = useMemo(() => groupDilemmas(DILEMMA_DATA), []);

  const results = useMemo(() => {
    if (!hasMounted || !query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();

    const filteredRows = DILEMMA_DATA.filter(
      (item) => item.dilemma?.toLowerCase().includes(lowerQuery) || item.map?.toLowerCase().includes(lowerQuery)
    );

    return groupDilemmas(filteredRows);
  }, [query, hasMounted]);

  const revealedCount = useMemo(
    () => Object.values(guessMap).filter((state) => state.revealed).length,
    [guessMap]
  );

  const totalOptions = useMemo(() => randomDilemma?.options.length ?? 0, [randomDilemma]);

  const hasRevealedFirstOption = revealedCount > 0;
  const allOptionsRevealed = totalOptions > 0 && revealedCount === totalOptions;
  const isPraiseRunning =
    mode === 'game' && gameStarted && !isPraisePaused && !allOptionsRevealed && !feedback && achievementModal === null;

  useEffect(() => {
    if (!isPraiseRunning) return;

    const tickMs = 10;
    const decrement = PRAISE_DECREMENT_PER_SECOND * (tickMs / 1000);
    const timer = window.setInterval(() => {
      setCurrentPraise((prev) => clampPraise(prev - decrement));
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [isPraiseRunning]);

  useEffect(() => {
    if (achievementModal !== null) return;

    const nextThreshold = ACHIEVEMENT_THRESHOLDS.find(
      (threshold) => totalPraise > threshold && !triggeredAchievementsRef.current[threshold]
    );

    if (!nextThreshold) return;

    triggeredAchievementsRef.current[nextThreshold] = true;
    setIsPraisePaused(true);
    setAchievementModal(nextThreshold);
  }, [totalPraise, achievementModal]);

  useEffect(() => {
    if (achievementModal === null) return;

    const timer = window.setTimeout(() => {
      setAchievementModal(null);
      setIsPraisePaused(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [achievementModal]);

  const chooseRandomDilemma = () => {
    if (!groupedAllDilemmas.length) return;
    const randomIndex = Math.floor(Math.random() * groupedAllDilemmas.length);
    setRandomDilemma(groupedAllDilemmas[randomIndex]);
    setGuessMap({});
    setFeedback(null);
    setCurrentPraise(randomPraiseValue());
    setGameStarted(true);
    setIsPraisePaused(false);
  };

  const handleNextQuestion = () => {
    if (!gameStarted) {
      chooseRandomDilemma();
      return;
    }

    if (!hasRevealedFirstOption) return;
    chooseRandomDilemma();
  };

  const handleGuess = (optionKey: string, evaluations: string[], guess: GuessType) => {
    if (guessMap[optionKey]?.revealed) return;

    const isCorrect = evaluations.some((evaluation) => getGuessType(evaluation) === guess);
    const earnedPraise = currentPraise;

    setGuessMap((prev) => ({
      ...prev,
      [optionKey]: {
        revealed: true,
        crossed: !isCorrect,
        guessed: guess
      }
    }));

    if (isCorrect) {
      setTotalPraise((prev) => Number((prev + earnedPraise).toFixed(2)));
      setFeedback({ type: 'correct', earned: earnedPraise });
      setCurrentPraise(randomPraiseValue());
    } else {
      setFeedback({ type: 'wrong' });
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="py-4 md:py-6 min-h-screen flex flex-col antialiased bg-slate-50">
      <div className="w-full flex justify-center mb-6 px-4">
        <a
          href="/"
          className="block w-[70%] md:w-[40%] max-w-[400px] aspect-[3/1] relative overflow-hidden rounded-xl shadow-sm border border-slate-100 bg-white hover:shadow-md transition-all"
        >
          <img src="/banner.png" alt="探险困境生存指南" className="w-full h-full object-contain" />
        </a>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">
          探险困境<span className="text-orange-600">生存指南</span>
        </h1>

        <div className="mt-3 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${mode === 'search' ? 'text-orange-600' : 'text-slate-400'}`}>搜索模式</span>
          <button
            type="button"
            aria-label="切换模式"
            onClick={() => setMode((prev) => (prev === 'search' ? 'game' : 'search'))}
            className={`w-12 h-7 rounded-full p-1 transition-all ${mode === 'game' ? 'bg-orange-500' : 'bg-slate-300'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                mode === 'game' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${mode === 'game' ? 'text-orange-600' : 'text-slate-400'}`}>游戏模式</span>
        </div>

        <p className="text-slate-400 text-xs font-medium mt-2">
          已收录 {DILEMMA_DATA.length} 条探险记录 | 更新时间2026年2月22日
        </p>
      </div>

      <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mb-3 sticky top-2 z-20 max-w-2xl mx-auto flex gap-1.5 w-[92%]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border-none placeholder:text-slate-400 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            placeholder="搜索困境名称 (如: 声东击西)..."
            style={{ fontSize: '16px', transform: 'scale(0.8125)', transformOrigin: 'left center', width: '123%' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {mode === 'game' && (
        <div className="max-w-2xl mx-auto w-[92%] mb-6">
          <div className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 flex flex-col gap-1">
            <p>当前赞誉：K {currentPraise.toFixed(2)}</p>
            <p>累计总赞誉：K {totalPraise.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={gameStarted && !hasRevealedFirstOption}
            className={`w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition-colors ${
              gameStarted && !hasRevealedFirstOption
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {gameStarted ? '开始下一题' : '开始游戏'}
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex-1 w-full px-4">
        {mode === 'search' ? (
          !query ? (
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
          )
        ) : randomDilemma ? (
          <GameDilemmaCard data={randomDilemma} guessMap={guessMap} onGuess={handleGuess} />
        ) : (
          <div className="flex flex-col items-center text-slate-300 mt-6 mb-6">
            <Zap className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm font-medium">点击“开始游戏”开始挑战</p>
          </div>
        )}
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-xl px-5 py-4 shadow-xl text-center">
            {feedback.type === 'correct' ? (
              <>
                <p className="text-sm font-bold text-emerald-600">恭喜你答对了！</p>
                <p className="text-sm font-bold text-slate-700 mt-2">K {feedback.earned?.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-red-600">答错了！</p>
            )}
          </div>
        </div>
      )}

      {achievementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-xl px-6 py-5 shadow-xl text-center">
            <p className="text-base font-bold text-orange-600">你太棒了！赞誉已经超过{achievementModal}！</p>
          </div>
        </div>
      )}

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

function DilemmaCard({ data }: { data: GroupedDilemma }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-500 w-4 h-4" />
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{data.name}</h2>
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
                  <p className="text-base font-bold text-slate-800 leading-snug">{opt.option}</p>
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
                {opt.records.length > 1 && <p className="text-[11px] text-slate-400">该选项存在 {opt.records.length} 条结果</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameDilemmaCard({
  data,
  guessMap,
  onGuess
}: {
  data: GroupedDilemma;
  guessMap: Record<string, GuessState>;
  onGuess: (optionKey: string, evaluations: string[], guess: GuessType) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-500 w-4 h-4" />
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{data.name}</h2>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">
          <Map size={10} className="text-orange-400" />
          地图：{data.map || '未知'}
        </div>
      </div>

      <div className="divide-y divide-dashed divide-slate-100 px-5">
        {data.options.map((opt, idx) => (
          <div key={idx} className="py-4 -mx-5 px-5">
            <div className="flex items-start gap-2 mb-3">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center bg-slate-800 text-white rounded text-[10px] font-black">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-base font-bold text-slate-800 leading-snug">{opt.option}</p>
              </div>
            </div>

            <div className="ml-7 space-y-2">
              {(() => {
                const optionKey = `${idx}-${opt.option}`;
                const state = guessMap[optionKey];
                const optionEvaluations = opt.records.map((record) => record.evaluation);

                return (
                  <>
                    {opt.records.map((record) => (
                      <div key={record.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-2">
                          {state?.revealed ? <ResultIcon type={record.evaluation} /> : <Zap className="text-slate-300 flex-shrink-0 mt-0.5" size={16} />}
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold leading-relaxed ${
                                state?.revealed ? getResultColor(record.evaluation) : 'text-slate-500 blur-[3px] select-none'
                              } ${state?.crossed ? 'line-through decoration-2 decoration-red-400' : ''}`}
                            >
                              {record.result || '暂无记录'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <GuessButton onClick={() => onGuess(optionKey, optionEvaluations, 'negative')} label="负面" disabled={state?.revealed} />
                      <GuessButton onClick={() => onGuess(optionKey, optionEvaluations, 'neutral')} label="中性" disabled={state?.revealed} />
                      <GuessButton onClick={() => onGuess(optionKey, optionEvaluations, 'positive')} label="正面" disabled={state?.revealed} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuessButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 rounded-md text-xs font-bold border border-slate-300 text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

function groupDilemmas(rows: DilemmaRecord[]) {
  const groups: { [key: string]: GroupedDilemma } = {};
  rows.forEach((row) => {
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
}

function getGuessType(evaluation: string): GuessType {
  if (evaluation?.includes('正面')) return 'positive';
  if (
    evaluation?.includes('负面') ||
    evaluation?.includes('失踪') ||
    evaluation?.includes('疾病') ||
    evaluation?.includes('伤病')
  ) {
    return 'negative';
  }
  return 'neutral';
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
