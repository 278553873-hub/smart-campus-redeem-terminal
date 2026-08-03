import React, { useMemo, useState } from 'react';
import { ChevronLeft, Clock, Landmark, ShoppingBag, SlidersHorizontal, Sparkles, TrendingUp, X } from 'lucide-react';
import { CampusCoinDetail, Student } from '../types';
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
  all: '全部类型',
  dividend: '月度分红',
  reward: '班级奖励',
  interest: '银行利息',
  vending_shop: '货柜兑换',
  class_shop: '班级兑换',
};

const flowFilterOptions: Array<{ value: FlowFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
];

const getFlowIcon = (category: FlowCategory, type: CoinFlowItem['type']) => {
  const toneClass = type === 'income' ? 'text-[var(--tm-brand-reward-strong)]' : 'text-[var(--tm-text-tertiary)]';
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

const getFlowIconSurface = (type: CoinFlowItem['type']) => (
  type === 'income'
    ? 'bg-[var(--tm-brand-reward-soft)]'
    : 'bg-[var(--tm-bg-surface-muted)]'
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
  const { issueRecords, consumeRecords } = coinDetail;
  const [activeFilter, setActiveFilter] = useState<FlowFilter>('all');
  const [activeYear, setActiveYear] = useState<string>('2026');
  const [activeCategory, setActiveCategory] = useState<FlowCategory>('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

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

  const yearOptions = useMemo(() => Array.from(new Set([
    ...flowItems.map(item => item.time.slice(0, 4)),
    '2025',
    '2024',
  ])).sort((a, b) => b.localeCompare(a)), [flowItems]);

  const categoryOptions: FlowCategory[] = [
    'all',
    ...(activeFilter === 'expense' ? [] : ['dividend', 'reward', 'interest'] as FlowCategory[]),
    ...(activeFilter === 'income' ? [] : ['vending_shop', 'class_shop'] as FlowCategory[]),
  ];

  const filteredFlowItems = useMemo(() => flowItems.filter(item => (
    (activeFilter === 'all' || item.type === activeFilter)
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

  const resetFilters = () => {
    setActiveYear(yearOptions[0] ?? '2026');
    setActiveCategory('all');
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-transparent font-sans">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-4 backdrop-blur-md">
          <button type="button" onClick={onBack} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>校园币流水</h1>
          <div className="h-11 w-11" aria-hidden="true" />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4 no-scrollbar" aria-label={`${student.name}的校园币收支记录`}>
          <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 py-3 [box-shadow:var(--tm-shadow-card)]" aria-label="校园币资产">
            <div className="grid min-h-[58px] grid-cols-2 divide-x divide-[var(--tm-border-subtle)]">
              <div className="flex items-center gap-3 pr-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)]">
                  <img src="/assets/coin.png" className="h-5 w-5" alt="" />
                </span>
                <div>
                  <div className="text-[12px] font-medium text-[var(--tm-text-secondary)]">钱包</div>
                  <div className="mt-1 text-xl font-bold leading-none tabular-nums text-[var(--tm-brand-reward-strong)]">{formatCoinAmount(coinDetail.balance)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)]">
                  <Landmark className="h-[18px] w-[18px] text-[var(--tm-brand-reward-strong)]" />
                </span>
                <div>
                  <div className="text-[12px] font-medium text-[var(--tm-text-secondary)]">存款</div>
                  <div className="mt-1 text-xl font-bold leading-none tabular-nums text-[var(--tm-brand-reward-strong)]">{formatCoinAmount(coinDetail.bankDeposit)}</div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 grid grid-cols-[1fr_44px] gap-2">
            <div className="grid h-11 grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)]" aria-label="按收支类型筛选">
              {flowFilterOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectFilter(option.value)}
                  aria-pressed={activeFilter === option.value}
                  className="flex min-h-11 items-center p-1 text-[13px] font-semibold"
                >
                  <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition ${activeFilter === option.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-brand-primary-strong)]'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowFilterSheet(true)}
              aria-label="筛选校园币流水"
              className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-bg-surface-soft)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex min-h-10 items-center gap-2 text-[12px] font-medium text-[var(--tm-text-tertiary)]">
            <span>{activeYear}年</span>
            <span aria-hidden="true">·</span>
            <span>{categoryLabels[activeCategory]}</span>
          </div>

          {groupedFlowItems.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-tertiary)] [box-shadow:var(--tm-shadow-card)]">
              <Clock className="h-9 w-9 text-[var(--tm-text-disabled)]" />
              <p className="mt-3 text-sm font-medium">暂无符合条件的流水记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedFlowItems.map(group => (
                <section key={group.month}>
                  <h2 className="mb-2 px-1 text-[13px] font-semibold text-[var(--tm-text-secondary)]">{formatMonthLabel(group.month)}</h2>
                  <div className="divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 [box-shadow:var(--tm-shadow-card)]">
                    {group.items.map(item => (
                      <div key={item.id} className="flex min-h-[78px] items-start gap-3 py-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${getFlowIconSurface(item.type)}`}>
                          {getFlowIcon(item.category, item.type)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-[length:var(--tm-font-size-card-title)] font-semibold leading-5 text-[var(--tm-text-primary)]">{item.title}</h3>
                          <p className="mt-1 line-clamp-2 text-[length:var(--tm-font-size-meta)] font-medium leading-4 text-[var(--tm-text-tertiary)]">
                            {formatFlowTime(item.time)} · {item.description}
                          </p>
                        </div>
                        <span className={`shrink-0 pt-1 text-lg font-bold leading-none tabular-nums ${item.type === 'income' ? 'text-[var(--tm-status-positive)]' : 'text-[var(--tm-text-primary)]'}`}>
                          {item.type === 'income' ? '+' : '-'}{formatCoinAmount(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      {showFilterSheet && (
        <div
          className="absolute inset-0 z-[120] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]"
          onClick={() => setShowFilterSheet(false)}
          role="dialog"
          aria-modal="true"
          aria-label="筛选校园币流水"
        >
          <div className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" />
            <div className="flex min-h-11 items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">筛选</h2>
              <button type="button" onClick={() => setShowFilterSheet(false)} aria-label="关闭筛选" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <section className="mt-3">
              <h3 className="text-[13px] font-medium text-[var(--tm-text-secondary)]">年份</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {yearOptions.map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setActiveYear(year)}
                    aria-pressed={activeYear === year}
                    className={`h-11 rounded-[var(--tm-radius-control)] text-[13px] font-semibold ${activeYear === year ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}
                  >
                    {year}年
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-5">
              <h3 className="text-[13px] font-medium text-[var(--tm-text-secondary)]">交易类型</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categoryOptions.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                    className={`min-h-11 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold ${activeCategory === category ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-6 grid grid-cols-[1fr_2fr] gap-2">
              <button type="button" onClick={resetFilters} className="h-12 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] text-sm font-semibold text-[var(--tm-text-secondary)] active:scale-[0.98]">重置</button>
              <button type="button" onClick={() => setShowFilterSheet(false)} className="h-12 rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-primary)] text-sm font-semibold text-[var(--tm-text-inverse)] active:scale-[0.98]">完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCoinDetailView;
