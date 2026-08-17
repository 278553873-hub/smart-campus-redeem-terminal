import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Clock, Landmark, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { ASSETS } from '../assets/images';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import { CampusCoinDetail, Student } from '../types';
import { phoneText } from '../styles/teacherMobileTokens';
import { formatCoinAmount } from '../utils/coinFormat';

interface StudentCoinDetailViewProps {
  student: Student;
  coinDetail: CampusCoinDetail;
  onBack: () => void;
}

type FlowFilter = 'income' | 'expense';
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
  dividend: '结算发放',
  reward: '班级奖励',
  interest: '银行利息',
  vending_shop: '货柜兑换',
  class_shop: '班级兑换',
};

const flowFilterOptions: Array<{ value: FlowFilter; label: string }> = [
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
];

const categoryOptionsByFilter: Record<FlowFilter, FlowCategory[]> = {
  income: ['all', 'dividend', 'reward', 'interest'],
  expense: ['all', 'vending_shop', 'class_shop'],
};

const getFlowIcon = (category: FlowCategory, type: FlowFilter) => {
  const toneClass = type === 'income' ? 'text-[var(--tm-brand-reward)]' : 'text-[var(--tm-brand-primary)]';
  switch (category) {
    case 'vending_shop':
    case 'class_shop':
      return <ShoppingBag className={`h-[18px] w-[18px] ${toneClass}`} />;
    case 'dividend':
      return <TrendingUp className={`h-[18px] w-[18px] ${toneClass}`} />;
    case 'reward':
      return <Sparkles className={`h-[18px] w-[18px] ${toneClass}`} />;
    case 'interest':
      return <Landmark className={`h-[18px] w-[18px] ${toneClass}`} />;
    default:
      return <Clock className={`h-[18px] w-[18px] ${toneClass}`} />;
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

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  return `${year}年${Number(month)}月`;
};

const formatFlowTime = (value: string) => {
  const [date, time] = value.split(' ');
  const [, month, day] = date.split('-');
  return `${Number(month)}月${Number(day)}日${time ? ` ${time.slice(0, 5)}` : ''}`;
};

const StudentCoinDetailView: React.FC<StudentCoinDetailViewProps> = ({ student, coinDetail, onBack }) => {
  const { issueRecords, consumeRecords, settlementEstimate } = coinDetail;
  const [activeFilter, setActiveFilter] = useState<FlowFilter>('income');
  const [activeYear, setActiveYear] = useState<string>(() => String(new Date().getFullYear()));
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

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const recordYears = flowItems.map(item => Number(item.time.slice(0, 4))).filter(Number.isFinite);
    const latestYear = Math.max(currentYear, ...recordYears);
    const recentYears = Array.from({ length: 3 }, (_, index) => String(latestYear - index));
    return Array.from(new Set([
      ...recordYears.map(String),
      ...recentYears,
    ])).sort((a, b) => b.localeCompare(a));
  }, [flowItems]);

  useEffect(() => {
    if (!yearOptions.includes(activeYear)) setActiveYear(yearOptions[0]);
  }, [activeYear, yearOptions]);

  const categoryOptions = categoryOptionsByFilter[activeFilter];
  const isWeeklySettlement = settlementEstimate.period === 'weekly';
  const estimateTitle = isWeeklySettlement ? '本周预计可得' : '本月预计可得';

  const filteredFlowItems = useMemo(() => flowItems.filter(item => (
    item.type === activeFilter
    && (activeCategory === 'all' || item.category === activeCategory)
    && item.time.startsWith(activeYear)
  )), [activeCategory, activeFilter, activeYear, flowItems]);

  const groupedFlowItems = useMemo(() => filteredFlowItems.reduce<Array<{ month: string; items: CoinFlowItem[] }>>((groups, item) => {
    const month = item.time.slice(0, 7);
    const currentGroup = groups[groups.length - 1];
    if (currentGroup?.month === month) currentGroup.items.push(item);
    else groups.push({ month, items: [item] });
    return groups;
  }, []), [filteredFlowItems]);

  const selectFilter = (filter: FlowFilter) => {
    setActiveFilter(filter);
    setActiveCategory('all');
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-transparent font-sans">
      <div className="flex h-full min-h-0 flex-col">
        <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
          <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[transform,background-color] [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[var(--tm-text-primary)]`}>校园币明细</h1>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)] pb-[var(--tm-space-8)] no-scrollbar" aria-label={`${student.name}的校园币收支记录`}>
          <section className="pt-[var(--tm-space-4)]" aria-labelledby="coin-overview-title">
            <div className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
              <h2 id="coin-overview-title" className="flex min-h-[var(--tm-size-touch)] items-center px-[var(--tm-space-4)] text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">账户概览</h2>
              <section className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-3)] px-[var(--tm-space-4)]" aria-label="校园币资产">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)]">
                  <img src="/assets/coin.png" className="h-4 w-4" alt="" />
                </span>
                <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)]">
                  <div className="flex min-w-0 items-baseline gap-[var(--tm-space-2)]">
                    <span className="shrink-0 text-[var(--tm-text-secondary)]">钱包</span>
                    <span className="min-w-0 truncate text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatCoinAmount(coinDetail.balance)}</span>
                  </div>
                  <span className="h-3 w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                  <div className="flex min-w-0 items-baseline gap-[var(--tm-space-2)]">
                    <span className="shrink-0 text-[var(--tm-text-secondary)]">存款</span>
                    <span className="min-w-0 truncate text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatCoinAmount(coinDetail.bankDeposit)}</span>
                  </div>
                </div>
              </section>

              <section
                className="bg-[var(--tm-brand-reward-soft)] px-[var(--tm-space-4)]"
                aria-label={settlementEstimate.enabled ? `${estimateTitle}${formatCoinAmount(settlementEstimate.estimatedTotal)}校园币` : '学校暂未开启自动发放'}
              >
                {settlementEstimate.enabled ? (
                  <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]">
                    <div className="flex min-w-0 items-baseline gap-[var(--tm-space-2)]">
                      <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">{estimateTitle}</span>
                      <strong className="truncate text-[length:var(--tm-font-size-body)] font-semibold leading-none tabular-nums text-[var(--tm-text-primary)]">
                        {formatCoinAmount(settlementEstimate.estimatedTotal)}
                      </strong>
                    </div>
                    <p className="shrink-0 text-right text-[length:var(--tm-font-size-meta)] font-medium leading-4 text-[var(--tm-text-secondary)]">
                      阳光保底 <strong className="font-semibold tabular-nums text-[var(--tm-text-secondary)]">{formatCoinAmount(settlementEstimate.sunshineReward)}</strong>
                      <span className="px-[var(--tm-space-1)] text-[var(--tm-brand-reward)]" aria-hidden="true">+</span>
                      排名奖励 <strong className="font-semibold tabular-nums text-[var(--tm-text-secondary)]">{formatCoinAmount(settlementEstimate.rankingReward)}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-3)]">
                    <Clock className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                    <span className="text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)]">学校暂未开启自动发放</span>
                  </div>
                )}
              </section>
            </div>
          </section>

          <section className="mt-[var(--tm-space-4)]" aria-labelledby="coin-flow-title">
            <div className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-2)] pb-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
              <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between px-[var(--tm-space-2)]">
                <h2 id="coin-flow-title" className="text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">收支明细</h2>
                <label className="relative shrink-0">
                  <select
                    value={activeYear}
                    onChange={event => setActiveYear(event.target.value)}
                    aria-label="筛选流水年份"
                    className="h-[var(--tm-size-touch)] appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-filter-border)] bg-[var(--tm-filter-bg)] pl-[var(--tm-space-3)] pr-9 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] [box-shadow:var(--tm-filter-shadow)] [outline:var(--tm-filter-focus-outline)] focus-visible:bg-[var(--tm-filter-focus-bg)]"
                  >
                    {yearOptions.map(year => <option key={year} value={year}>{year}年</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                </label>
              </div>

              <div className="mt-[var(--tm-space-1)] grid h-[var(--tm-size-touch)] grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)]" role="group" aria-label="按收支类型筛选">
                {flowFilterOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectFilter(option.value)}
                    aria-pressed={activeFilter === option.value}
                    className="flex min-h-[var(--tm-size-touch)] items-center rounded-[var(--tm-radius-control)] p-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold transition-transform [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100"
                  >
                    <span className={`flex h-[calc(var(--tm-size-touch)-var(--tm-space-2))] w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-var(--tm-space-1))] transition-[background-color,color,box-shadow] [transition-duration:var(--tm-duration-fast)] ease-out motion-reduce:transition-none ${activeFilter === option.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-brand-primary-strong)]'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-[var(--tm-space-1)] flex min-h-[var(--tm-size-touch)] gap-[var(--tm-space-2)] overflow-x-auto no-scrollbar" role="group" aria-label={`${activeFilter === 'income' ? '收入' : '支出'}分类筛选`}>
                {categoryOptions.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                    className={`min-h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium transition-[transform,background-color,color] [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100 ${activeCategory === category ? 'bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>

              {groupedFlowItems.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center">
                  <MobileEmptyState
                    imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER}
                    title="暂无符合条件的流水记录"
                    imageClassName="w-[58%] min-w-[156px] max-w-[196px]"
                  />
                </div>
              ) : (
                <div className="mt-[var(--tm-space-3)] space-y-[var(--tm-space-4)] px-[var(--tm-space-2)]">
                  {groupedFlowItems.map(group => (
                    <section key={group.month}>
                      <h2 className="mb-[var(--tm-space-2)] px-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">{formatMonthLabel(group.month)}</h2>
                      <div className="divide-y divide-[var(--tm-border-subtle)]">
                        {group.items.map(item => (
                          <div key={item.id} className="flex min-h-[78px] items-start gap-[var(--tm-space-3)] py-[var(--tm-space-3)]">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${item.type === 'income' ? 'bg-[var(--tm-brand-reward-soft)]' : 'bg-[var(--tm-brand-primary-soft)]'}`}>
                              {getFlowIcon(item.category, item.type)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-[length:var(--tm-font-size-card-title)] font-semibold leading-5 text-[var(--tm-text-primary)]">{item.title}</h3>
                              <p className="mt-[var(--tm-space-1)] line-clamp-2 text-[length:var(--tm-font-size-meta)] font-medium leading-4 text-[var(--tm-text-secondary)]">
                                {formatFlowTime(item.time)} · {item.description}
                              </p>
                            </div>
                            <span className="shrink-0 pt-[var(--tm-space-1)] text-[length:var(--tm-font-size-card-title)] font-semibold leading-none tabular-nums text-[var(--tm-text-primary)]">
                              {item.type === 'income' ? '+' : '-'}{formatCoinAmount(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default StudentCoinDetailView;
