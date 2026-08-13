import React, { useMemo, useState } from 'react';
import { ChevronLeft, Clock, Landmark, ShoppingBag, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';
import { ASSETS } from '../assets/images';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
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

const getFlowIcon = (category: FlowCategory) => {
  const toneClass = 'text-[var(--tm-text-tertiary)]';
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
  const { issueRecords, consumeRecords } = coinDetail;
  const [activeFilter, setActiveFilter] = useState<FlowFilter>('all');
  const [activeYear, setActiveYear] = useState<string>('2026');
  const [activeCategory, setActiveCategory] = useState<FlowCategory>('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [draftYear, setDraftYear] = useState<string>('2026');
  const [draftCategory, setDraftCategory] = useState<FlowCategory>('all');

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

  const defaultYear = yearOptions[0] ?? '2026';
  const appliedFilterCount = Number(activeYear !== defaultYear) + Number(activeCategory !== 'all');

  const openFilterSheet = () => {
    setDraftYear(activeYear);
    setDraftCategory(activeCategory);
    setShowFilterSheet(true);
  };

  const applyFilters = () => {
    setActiveYear(draftYear);
    setActiveCategory(draftCategory);
    setShowFilterSheet(false);
  };

  const resetAppliedFilters = () => {
    setActiveYear(defaultYear);
    setActiveCategory('all');
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-transparent font-sans">
      <div className="flex h-full min-h-0 flex-col">
        <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
          <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[var(--tm-text-primary)]`}>校园币流水</h1>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3 no-scrollbar" aria-label={`${student.name}的校园币收支记录`}>
          <section className="flex min-h-[var(--tm-size-touch)] items-center gap-3 px-1" aria-label="校园币资产">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)]">
              <img src="/assets/coin.png" className="h-4 w-4" alt="" />
            </span>
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-3 text-[length:var(--tm-font-size-body)]">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="shrink-0 text-[var(--tm-text-secondary)]">钱包</span>
                <span className="min-w-0 truncate font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatCoinAmount(coinDetail.balance)}</span>
              </div>
              <span className="h-3 w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="shrink-0 text-[var(--tm-text-secondary)]">存款</span>
                <span className="min-w-0 truncate font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatCoinAmount(coinDetail.bankDeposit)}</span>
              </div>
            </div>
          </section>

          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
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
              onClick={openFilterSheet}
              aria-label={`筛选校园币流水${appliedFilterCount ? `，已应用${appliedFilterCount}项条件` : ''}`}
              className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-3 text-[13px] font-medium text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-bg-surface-soft)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>筛选{appliedFilterCount > 0 ? `·${appliedFilterCount}` : ''}</span>
            </button>
          </div>

          {groupedFlowItems.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center">
              <MobileEmptyState
                imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER}
                title="暂无符合条件的流水记录"
                imageClassName="w-[58%] min-w-[156px] max-w-[196px]"
              />
              {appliedFilterCount > 0 && (
                <button type="button" onClick={resetAppliedFilters} className="mt-2 min-h-11 px-4 text-[14px] font-semibold text-[var(--tm-brand-primary)] active:text-[var(--tm-brand-primary-strong)]">
                  重置筛选
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {groupedFlowItems.map(group => (
                <section key={group.month}>
                  <h2 className="mb-2 px-1 text-[13px] font-semibold text-[var(--tm-text-secondary)]">{formatMonthLabel(group.month)}</h2>
                  <div className="divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 [box-shadow:var(--tm-shadow-card)]">
                    {group.items.map(item => (
                      <div key={item.id} className="flex min-h-[78px] items-start gap-3 py-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)]">
                          {getFlowIcon(item.category)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-[length:var(--tm-font-size-card-title)] font-semibold leading-5 text-[var(--tm-text-primary)]">{item.title}</h3>
                          <p className="mt-1 line-clamp-2 text-[length:var(--tm-font-size-meta)] font-medium leading-4 text-[var(--tm-text-tertiary)]">
                            {formatFlowTime(item.time)} · {item.description}
                          </p>
                        </div>
                        <span className="shrink-0 pt-1 text-lg font-bold leading-none tabular-nums text-[var(--tm-text-primary)]">
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

      <MobileBottomSheet
        open={showFilterSheet}
        title="筛选校园币流水"
        onClose={() => setShowFilterSheet(false)}
        footer={(
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <button type="button" onClick={() => { setDraftYear(defaultYear); setDraftCategory('all'); }} className="h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[14px] font-semibold text-[var(--tm-text-secondary)] active:scale-[0.98]">重置</button>
            <button type="button" onClick={applyFilters} className="h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[14px] font-semibold text-[var(--tm-text-inverse)] active:scale-[0.98]">应用筛选</button>
          </div>
        )}
      >
        <div className="space-y-5 pb-1">
          <section>
            <h3 className="text-[13px] font-medium text-[var(--tm-text-secondary)]">年份</h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {yearOptions.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setDraftYear(year)}
                  aria-pressed={draftYear === year}
                  className={`h-11 rounded-[var(--tm-radius-control)] text-[13px] font-semibold ${draftYear === year ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}
                >
                  {year}年
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-medium text-[var(--tm-text-secondary)]">交易类型</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setDraftCategory(category)}
                  aria-pressed={draftCategory === category}
                  className={`min-h-11 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold ${draftCategory === category ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          </section>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default StudentCoinDetailView;
