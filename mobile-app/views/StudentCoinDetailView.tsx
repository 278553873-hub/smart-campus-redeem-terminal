import React, { useMemo, useState } from 'react';
import { ChevronLeft, Clock, Coins, Landmark, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { CampusCoinDetail, Student } from '../types';
import { MobileCard } from '../components/ui/MobileCard';
import { phoneText } from '../styles/phoneTokens';
import { formatCoinAmount } from '../utils/coinFormat';

interface StudentCoinDetailViewProps {
  student: Student;
  coinDetail: CampusCoinDetail;
  onBack: () => void;
}

type FlowFilter = 'all' | 'income' | 'expense';
type FlowCategory = 'all' | 'dividend' | 'reward' | 'interest' | 'vending_shop' | 'class_shop';

interface CoinFlowItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  time: string;
  type: 'income' | 'expense';
  category: FlowCategory;
}

const categoryLabels: Record<FlowCategory, string> = {
  all: '全部',
  dividend: '月度分红',
  reward: '班级奖励',
  interest: '银行利息',
  vending_shop: '货柜兑换',
  class_shop: '班级兑换',
};

const getFlowIcon = (category: FlowCategory) => {
  switch (category) {
    case 'vending_shop':
    case 'class_shop':
      return <ShoppingBag size={18} className="text-pink-500" />;
    case 'dividend':
      return <TrendingUp size={18} className="text-orange-500" />;
    case 'reward':
      return <Sparkles size={18} className="text-yellow-500" />;
    case 'interest':
      return <Landmark size={18} className="text-blue-500" />;
    default:
      return <Clock size={18} className="text-slate-500" />;
  }
};

const getFlowBg = (category: FlowCategory) => {
  switch (category) {
    case 'vending_shop':
    case 'class_shop':
      return 'bg-pink-50 ring-pink-100';
    case 'dividend':
      return 'bg-orange-50 ring-orange-100';
    case 'reward':
      return 'bg-yellow-50 ring-yellow-100';
    case 'interest':
      return 'bg-blue-50 ring-blue-100';
    default:
      return 'bg-slate-50 ring-slate-100';
  }
};

const getIssueCategory = (source: string): FlowCategory => {
  if (source.includes('结算') || source.includes('分红')) return 'dividend';
  if (source.includes('班级') || source.includes('奖励')) return 'reward';
  if (source.includes('银行') || source.includes('利息')) return 'interest';
  return 'reward';
};

const getConsumeCategory = (scene: string): FlowCategory => {
  if (scene.includes('货柜')) return 'vending_shop';
  return 'class_shop';
};

const StudentCoinDetailView: React.FC<StudentCoinDetailViewProps> = ({ student, coinDetail, onBack }) => {
  const { issueRecords, consumeRecords, monthlyEstimate } = coinDetail;
  const [activeFilter, setActiveFilter] = useState<FlowFilter>('all');
  const [activeYear, setActiveYear] = useState<string>('2026');
  const [activeCategory, setActiveCategory] = useState<FlowCategory>('all');

  const flowItems = useMemo<CoinFlowItem[]>(() => {
    const incomeItems = issueRecords.map(record => ({
      id: record.id,
      title: record.source,
      description: `${record.description} · ${record.operator}`,
      amount: record.amount,
      time: record.time,
      type: 'income' as const,
      category: getIssueCategory(record.source),
    }));
    const expenseItems = consumeRecords.map(record => ({
      id: record.id,
      title: record.item,
      description: record.scene,
      amount: record.amount,
      time: record.time,
      type: 'expense' as const,
      category: getConsumeCategory(record.scene),
    }));

    return [...incomeItems, ...expenseItems].sort((a, b) => b.time.localeCompare(a.time));
  }, [consumeRecords, issueRecords]);

  const filteredFlowItems = flowItems.filter(item => (
    (activeFilter === 'all' || item.type === activeFilter) &&
    (activeCategory === 'all' || item.category === activeCategory) &&
    item.time.startsWith(activeYear)
  ));

  const categoryOptions: FlowCategory[] = [
    'all',
    ...(activeFilter === 'expense' ? [] : ['dividend', 'reward', 'interest'] as FlowCategory[]),
    ...(activeFilter === 'income' ? [] : ['vending_shop', 'class_shop'] as FlowCategory[]),
  ];

  const growthReward = monthlyEstimate.basePerformance + monthlyEstimate.classBonus - monthlyEstimate.deductions;
  const scoreReward = monthlyEstimate.rankingReward;
  const estimateBonusItems = [
    { label: '成长奖励', value: growthReward },
    { label: '得分奖励', value: scoreReward },
  ].filter(item => item.value !== 0);

  const selectFilter = (filter: FlowFilter) => {
    setActiveFilter(filter);
    setActiveCategory('all');
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#F8FAFC]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-100/80 bg-white/90 px-4 backdrop-blur-md">
          <button onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-slate-900`}>校园币详情</h1>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-8 no-scrollbar">
          <MobileCard variant="hero" padding="lg" className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <div className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <Coins size={110} className="absolute -bottom-8 -right-7 text-white/10" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/90">{student.name} · 只读校园币档案</p>
              <div className="mt-3 flex items-center text-[34px] font-black leading-none tracking-tight">
                <img src="/assets/coin.png" className="mr-1.5 h-[1em] w-[1em] drop-shadow-sm" alt="coin" />
                {formatCoinAmount(coinDetail.balance + coinDetail.bankDeposit)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-black/10 px-3 py-1.5 text-xs font-bold text-white/90 shadow-inner">钱包 {formatCoinAmount(coinDetail.balance)}</span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-black/10 px-3 py-1.5 text-xs font-bold text-white/90 shadow-inner">存款 {formatCoinAmount(coinDetail.bankDeposit)}</span>
              </div>
            </div>
          </MobileCard>

          <MobileCard variant="card" padding="lg" className="mt-4 overflow-hidden rounded-[2rem] border-2 border-orange-100/60 bg-gradient-to-b from-orange-50/80 to-amber-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-600/80">预计可得</h2>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-black text-orange-500">预估</span>
            </div>

            <div className="flex items-center justify-center py-6">
              <div className="flex items-center justify-center gap-3 text-[52px] font-black leading-none tracking-tight text-orange-500">
                <img src="/assets/coin.png" className="h-[0.9em] w-[0.9em] -translate-y-0.5" alt="coin" />
                <span>{formatCoinAmount(monthlyEstimate.estimatedTotal)}</span>
              </div>
            </div>

            <div className="flex h-[56px] items-center justify-between gap-3">
              {estimateBonusItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 && <div className="shrink-0 text-sm font-black leading-none text-orange-300">+</div>}
                  <div className="flex h-full flex-1 flex-col items-center justify-center rounded-2xl border border-orange-100/50 bg-white/70 px-2 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <span className="mb-0.5 text-[10px] font-bold text-orange-600/70">{item.label}</span>
                    <div className="flex items-center justify-center gap-1 text-sm font-black text-orange-500">
                      <img src="/assets/coin.png" className="h-[1.1em] w-[1.1em] -translate-y-px" alt="coin" />
                      <span>{formatCoinAmount(item.value)}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </MobileCard>

          <div className="mt-4 rounded-[1.75rem] bg-[#f8fbff] p-4 shadow-sm" aria-label="校园币流水明细，包含发币记录和兑换记录">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="relative shrink-0">
                <select
                  value={activeYear}
                  onChange={event => setActiveYear(event.target.value)}
                  className="cursor-pointer appearance-none rounded-2xl border-2 border-slate-50 bg-white py-2 pl-4 pr-8 text-sm font-bold text-slate-800 shadow-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2026">2026 年</option>
                  <option value="2025">2025 年</option>
                  <option value="2024">2024 年</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 mt-px -translate-y-1/2 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-400" />
              </div>

              <div className="flex max-w-[240px] flex-1 rounded-2xl bg-slate-200/60 p-1">
                {([
                  ['all', '全部'],
                  ['income', '收入'],
                  ['expense', '支出'],
                ] as [FlowFilter, string][]).map(([filter, label]) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => selectFilter(filter)}
                    className={`flex-1 rounded-xl py-1.5 text-sm font-bold transition-all ${activeFilter === filter ? `bg-white shadow-sm ${filter === 'income' ? 'text-green-600' : filter === 'expense' ? 'text-red-500' : 'text-slate-800'}` : 'text-slate-500 active:text-slate-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-bold transition-all ${activeCategory === category ? 'border border-blue-200 bg-blue-100 text-blue-700 shadow-sm' : 'border border-slate-200 bg-white text-slate-500 active:bg-slate-50'}`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFlowItems.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-slate-400 opacity-60">
                  <Clock size={42} className="mb-4 text-slate-300" />
                  <p className="text-sm font-bold">暂无符合条件的流水记录</p>
                </div>
              ) : filteredFlowItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 rounded-3xl border-2 border-slate-50 bg-white p-4 shadow-sm transition-transform active:scale-[0.98]">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-4 ring-white shadow-sm ${getFlowBg(item.category)}`}>
                    {getFlowIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-base font-bold text-slate-800">{item.title}</h4>
                    <div className="truncate text-xs font-bold text-slate-400">
                      <span>{item.time}</span>
                      <span className="mx-1">·</span>
                      <span>{item.description}</span>
                    </div>
                  </div>
                  <div className="shrink-0 pl-2">
                    <div className={`flex items-center gap-1 text-2xl font-black leading-none ${item.type === 'income' ? 'text-green-500' : 'text-slate-700'}`}>
                      {item.type === 'income' ? '+' : '-'}
                      <span>{formatCoinAmount(item.amount)}</span>
                      <img src="/assets/coin.png" className="h-[0.9em] w-[0.9em] -translate-y-px" alt="coin" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoinDetailView;
