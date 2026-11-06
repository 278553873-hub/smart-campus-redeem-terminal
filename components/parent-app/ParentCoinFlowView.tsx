import React, { useMemo, useState } from 'react';
import { ChevronDown, Eraser, Landmark, RotateCcw, ShoppingBag, Sparkles, Ticket, TrendingUp, Undo2 } from 'lucide-react';
import {
  GROWTH_COIN_FLOW_LABELS, GROWTH_COIN_INCOME_CATEGORIES, GROWTH_COIN_EXPENSE_CATEGORIES,
  formatCampusCoinFlowTime, getGrowthCoinFlowDetail, getGrowthCoinFlowStatus, type GrowthCoinFlowRecord, type GrowthCoinFlowCategory,
} from '../../shared/growthCoinFlow';
import { ParentCard, ParentPageShell, ParentSegmentedControl } from './ParentUI';
import { parentTypography } from './ParentStyleTokens';
import TextSelectionControl from '../../mobile-app/components/ui/TextSelectionControl';
import { useGrowthCoinTerms } from '../GrowthCoinBranding';

const FLOW_DIRECTION_OPTIONS = [{ value: 'income', label: '收入' }, { value: 'expense', label: '支出' }] as const;
const FLOW_ICONS = {
  growth_award: TrendingUp, class_reward: Sparkles, bank_interest: Landmark, exchange_refund: RotateCcw,
  vending_exchange: ShoppingBag, class_exchange: Ticket, award_recovery: Undo2, manual_clear: Eraser,
};

interface Props {
  records: GrowthCoinFlowRecord[];
  header: React.ReactNode;
  canViewEvaluationDetails: boolean;
}

/** 家长只读收支列表。评价隐藏时只保留加分值，不透出指标或老师描述。 */
export default function ParentCoinFlowView({ records, header, canViewEvaluationDetails }: Props) {
  const coinTerms = useGrowthCoinTerms();
  const years = [...new Set(records.map(record => record.date.slice(0, 4)))].sort().reverse();
  const [year, setYear] = useState(years[0] ?? String(new Date().getFullYear()));
  const [direction, setDirection] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<'all' | GrowthCoinFlowCategory>('all');
  const groups = useMemo(() => {
    const result: Array<{ month: string; records: GrowthCoinFlowRecord[] }> = [];
    records.filter(record => record.type === direction && record.date.startsWith(year)
      && (category === 'all' || record.category === category))
      .sort((a, b) => b.date.localeCompare(a.date)).forEach(record => {
        const month = record.date.slice(0, 7);
        if (result.at(-1)?.month !== month) result.push({ month, records: [] });
        result.at(-1)!.records.push(record);
      });
    return result;
  }, [records, direction, category, year]);
  const categories = direction === 'income' ? GROWTH_COIN_INCOME_CATEGORIES : GROWTH_COIN_EXPENSE_CATEGORIES;
  return <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--pm-page-plain-content-bg)] text-[var(--pm-text-primary)]">
    {header}
    <ParentPageShell className="px-[var(--pm-space-5)] pt-[var(--pm-space-4)] pb-[calc(var(--pm-space-6)+env(safe-area-inset-bottom,0px))]">
      <ParentCard shape="subtle">
        <div className="mb-[var(--pm-space-2)] flex min-h-[var(--pm-size-touch)] items-center justify-between gap-[var(--pm-space-3)]">
          <h2 className={parentTypography.cardTitle}>收支明细</h2>
          <label className="relative shrink-0">
            <select aria-label="筛选流水年份" value={year} onChange={event => setYear(event.target.value)}
              className="h-[var(--pm-size-touch)] min-w-[var(--pm-size-touch)] appearance-none rounded-[var(--pm-radius-control-compact)] border border-[var(--pm-filter-border)] bg-[var(--pm-filter-bg)] pl-[var(--pm-space-3)] pr-[var(--pm-space-8)] text-[length:var(--pm-font-size-body)] font-[var(--pm-font-weight-semibold)] tabular-nums text-[var(--pm-text-primary)] [box-shadow:var(--pm-filter-shadow)] [outline:var(--pm-filter-focus-outline)] focus-visible:bg-[var(--pm-filter-focus-bg)]">
              {(years.length ? years : [year]).map(value => <option key={value} value={value}>{value}年</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-[var(--pm-space-2)] top-1/2 h-[var(--pm-space-4)] w-[var(--pm-space-4)] -translate-y-1/2 text-[var(--pm-text-tertiary)]" />
          </label>
        </div>
        <ParentSegmentedControl<'income' | 'expense'> value={direction} items={FLOW_DIRECTION_OPTIONS}
          onChange={value => { setDirection(value); setCategory('all'); }} ariaLabel="按收支类型筛选" />
        <TextSelectionControl<'all' | GrowthCoinFlowCategory> value={category} onChange={setCategory}
          items={[{ value: 'all', label: '全部' }, ...categories.map(value => ({ value, label: GROWTH_COIN_FLOW_LABELS[value] }))]}
          ariaLabel="收支来源筛选" semantics="group" className="mt-[var(--pm-space-2)]" />
      </ParentCard>
      {groups.length === 0 ? <ParentCard shape="subtle" className="mt-[var(--pm-layout-card-gap)]">
        <p role="status" className={`${parentTypography.body} py-[var(--pm-space-8)] text-center text-[var(--pm-text-secondary)]`}>暂无符合条件的流水记录</p>
      </ParentCard> : groups.map(group => <section key={group.month} className="mt-[var(--pm-layout-card-gap)]">
        <h3 className={`${parentTypography.cardTitle} mb-[var(--pm-space-2)] text-[var(--pm-text-primary)]`}>{Number(group.month.slice(0, 4))}年{Number(group.month.slice(5))}月</h3>
        <ParentCard shape="subtle">
        <ul className="divide-y divide-[var(--pm-border-subtle)]">
          {group.records.map(record => {
            const status = getGrowthCoinFlowStatus(record, records);
            const Icon = FLOW_ICONS[record.category];
            return <li key={record.id} className="flex items-start gap-[var(--pm-space-3)] py-[var(--pm-space-3)] first:pt-0 last:pb-0">
              <span aria-hidden="true" className={`flex h-[var(--pm-space-8)] w-[var(--pm-space-8)] shrink-0 items-center justify-center rounded-[var(--pm-radius-control-compact)] ${record.type === 'income' ? 'bg-[var(--pm-brand-reward-soft)] text-[var(--pm-brand-reward-strong)]' : 'bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-secondary)]'}`}>
                <Icon className="h-[var(--pm-space-5)] w-[var(--pm-space-5)]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-[var(--pm-space-3)] gap-y-[var(--pm-space-1)]">
                  <div className="flex flex-wrap items-center gap-[var(--pm-space-1)]">
                    <h4 className={parentTypography.cardTitle}>{GROWTH_COIN_FLOW_LABELS[record.category]}</h4>
                    {status && <span className={`${parentTypography.meta} rounded-[var(--pm-radius-control-compact)] bg-[var(--pm-bg-surface-soft)] px-[var(--pm-space-1)] text-[var(--pm-text-secondary)]`}>{status}</span>}
                  </div>
                  <span className={`${parentTypography.cardTitle} ml-auto max-w-full tabular-nums [overflow-wrap:anywhere] ${record.type === 'income' ? 'text-[var(--pm-brand-reward-strong)]' : 'text-[var(--pm-text-primary)]'}`}>
                    {record.type === 'income' ? '+' : '-'}{Number(record.amount.toFixed(2))}
                  </span>
                </div>
                <p className="mt-[var(--pm-space-1)] break-words text-[length:var(--pm-font-size-compact)] font-[var(--pm-font-weight-regular)] leading-relaxed text-[var(--pm-text-secondary)]">{getGrowthCoinFlowDetail(record, { canViewEvaluationDetails, coinName: coinTerms.name })}</p>
                <time dateTime={record.date.replace(' ', 'T')} className={`${parentTypography.meta} mt-[var(--pm-space-1)] block tabular-nums text-[var(--pm-text-tertiary)]`}>{formatCampusCoinFlowTime(record.date)}</time>
              </div>
            </li>;
          })}
        </ul>
        </ParentCard>
      </section>)}
    </ParentPageShell>
  </div>;
}
