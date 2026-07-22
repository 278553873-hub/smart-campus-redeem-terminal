import React, { useMemo, useState } from 'react';
import { ChevronLeft, Clock, Coins, Landmark, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { CampusCoinDetail, Student } from '../types';
import { MobileCard } from '../components/ui/MobileCard';
import { phoneText } from '../styles/teacherMobileTokens';
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

const getFlowIcon = (category: FlowCategory, type: CoinFlowItem['type']) => {
  const toneClass = type === 'income' ? 'text-[var(--tm-brand-reward-strong)]' : 'text-[var(--tm-text-tertiary)]';
  switch (category) {
    case 'vending_shop':
    case 'class_shop':
      return <ShoppingBag size={18} className={toneClass} />;
    case 'dividend':
      return <TrendingUp size={18} className={toneClass} />;
    case 'reward':
      return <Sparkles size={18} className={toneClass} />;
    case 'interest':
      return <Landmark size={18} className={toneClass} />;
    default:
      return <Clock size={18} className={toneClass} />;
  }
};

const getFlowBg = (type: CoinFlowItem['type']) => (
  type === 'income'
    ? 'bg-[var(--tm-brand-reward-soft)] ring-[var(--tm-brand-reward-soft)]'
    : 'bg-[var(--tm-bg-surface-muted)] ring-[var(--tm-bg-surface-soft)]'
);

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
    <div className="h-full min-h-0 overflow-hidden bg-transparent font-sans">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/40 bg-white/38 px-4 backdrop-blur-md">
          <button onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>校园币详情</h1>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-8 no-scrollbar">
          <MobileCard variant="hero" padding="lg" className="relative overflow-hidden bg-gradient-to-br from-[var(--tm-brand-reward)] to-[var(--tm-brand-reward-strong)] text-white shadow-[var(--tm-shadow-card)]">
            <div className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <Coins size={110} className="absolute -bottom-8 -right-7 text-white/10" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{student.name} · 只读校园币档案</p>
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

          <MobileCard variant="card" padding="lg" className="mt-4 overflow-hidden border border-[var(--tm-brand-reward)]/20 bg-[var(--tm-brand-reward-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-[var(--tm-brand-reward-strong)]">预计可得</h2>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-black text-[var(--tm-brand-reward-strong)]">预估</span>
            </div>

            <div className="flex items-center justify-center py-6">
              <div className="flex items-center justify-center gap-3 text-[52px] font-black leading-none tracking-tight text-[var(--tm-brand-reward-strong)]">
                <img src="/assets/coin.png" className="h-[0.9em] w-[0.9em] -translate-y-0.5" alt="coin" />
                <span>{formatCoinAmount(monthlyEstimate.estimatedTotal)}</span>
              </div>
            </div>

            <div className="flex h-[56px] items-center justify-between gap-3">
              {estimateBonusItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 && <div className="shrink-0 text-sm font-black leading-none text-[var(--tm-brand-reward)]">+</div>}
                  <div className="flex h-full flex-1 flex-col items-center justify-center rounded-[var(--tm-radius-inner)] border border-[var(--tm-brand-reward)]/15 bg-white/70 px-2 py-1 shadow-[var(--tm-shadow-control)]">
                    <span className="mb-0.5 text-[10px] font-bold text-[var(--tm-text-tertiary)]">{item.label}</span>
                    <div className="flex items-center justify-center gap-1 text-sm font-black text-[var(--tm-brand-reward-strong)]">
                      <img src="/assets/coin.png" className="h-[1.1em] w-[1.1em] -translate-y-px" alt="coin" />
                      <span>{formatCoinAmount(item.value)}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </MobileCard>

          <div className="mt-4 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]" aria-label="校园币流水明细，包含发币记录和兑换记录">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="relative shrink-0">
                <select
                  value={activeYear}
                  onChange={event => setActiveYear(event.target.value)}
                  className="cursor-pointer appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] py-2 pl-4 pr-8 text-sm font-bold text-[var(--tm-text-primary)] shadow-sm outline-none transition-colors focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                >
                  <option value="2026">2026 年</option>
                  <option value="2025">2025 年</option>
                  <option value="2024">2024 年</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 mt-px -translate-y-1/2 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent [border-top-color:var(--tm-text-tertiary)]" />
              </div>

              <div className="flex max-w-[240px] flex-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] p-1">
                {([
                  ['all', '全部'],
                  ['income', '收入'],
                  ['expense', '支出'],
                ] as [FlowFilter, string][]).map(([filter, label]) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => selectFilter(filter)}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-bold transition-all ${activeFilter === filter ? 'bg-white text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-brand-primary-strong)]'}`}
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
                  className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-bold transition-all ${activeCategory === category ? 'border border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)] shadow-sm' : 'border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFlowItems.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-[var(--tm-text-tertiary)]">
                  <Clock size={42} className="mb-4 text-[var(--tm-text-disabled)]" />
                  <p className="text-sm font-bold">暂无符合条件的流水记录</p>
                </div>
              ) : filteredFlowItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-4 transition-transform active:scale-[0.98]">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ring-4 ${getFlowBg(item.type)}`}>
                    {getFlowIcon(item.category, item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-base font-bold text-[var(--tm-text-primary)]">{item.title}</h4>
                    <div className="truncate text-xs font-bold text-[var(--tm-text-tertiary)]">
                      <span>{item.time}</span>
                      <span className="mx-1">·</span>
                      <span>{item.description}</span>
                    </div>
                  </div>
                  <div className="shrink-0 pl-2">
                    <div className={`flex items-center gap-1 text-2xl font-black leading-none ${item.type === 'income' ? 'text-[var(--tm-status-positive)]' : 'text-[var(--tm-text-primary)]'}`}>
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
