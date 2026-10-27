import React, { useMemo, useState } from 'react';
import { Clock, ShoppingBag, TrendingUp } from 'lucide-react';
import {
  GROWTH_COIN_FLOW_LABELS, GROWTH_COIN_INCOME_CATEGORIES, GROWTH_COIN_EXPENSE_CATEGORIES,
  formatCampusCoinFlowTime, getGrowthCoinFlowDetail, type GrowthCoinFlowRecord,
} from '../../shared/growthCoinFlow';
import { ParentCard, ParentPageShell } from './ParentUI';

interface Props {
  records: GrowthCoinFlowRecord[];
  header: React.ReactNode;
  canViewEvaluationDetails: boolean;
}

/** 家长只读收支列表。评价隐藏时只保留加分值，不透出指标或老师描述。 */
export default function ParentCoinFlowView({ records, header, canViewEvaluationDetails }: Props) {
  const years = [...new Set(records.map(record => record.date.slice(0, 4)))].sort().reverse();
  const [year, setYear] = useState(years[0] ?? String(new Date().getFullYear()));
  const [direction, setDirection] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('all');
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
  const buttonClass = 'min-h-11 rounded-[var(--pm-radius-control)] px-3 text-[length:var(--pm-font-size-compact)] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pm-brand-primary)]';
  return <ParentPageShell className="pb-6">
    {header}
    <ParentCard className="mx-5 mt-3">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2 className="text-[length:var(--pm-font-size-card-title)] font-bold">收支明细</h2>
        <select aria-label="筛选流水年份" value={year} onChange={event => setYear(event.target.value)} className="min-h-11 bg-transparent text-[length:var(--pm-font-size-body)] text-[var(--pm-text-primary)]">
          {(years.length ? years : [year]).map(value => <option key={value} value={value}>{value}年</option>)}
        </select>
      </div>
      <div role="group" aria-label="按收支类型筛选" className="mt-2 grid grid-cols-2 gap-1 rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface-soft)] p-1">
        {(['income', 'expense'] as const).map(value => <button key={value} type="button" aria-pressed={direction === value}
          onClick={() => { setDirection(value); setCategory('all'); }}
          className={`${buttonClass} ${direction === value ? 'bg-[var(--pm-bg-surface)] font-bold text-[var(--pm-brand-primary)]' : 'text-[var(--pm-text-secondary)]'}`}>
          {value === 'income' ? '收入' : '支出'}
        </button>)}
      </div>
      <div role="group" aria-label="收支来源筛选" className="mt-2 flex flex-wrap gap-1">
        {['all', ...categories].map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}
          className={`${buttonClass} ${category === value ? 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary)]' : 'text-[var(--pm-text-primary)]'}`}>
          {value === 'all' ? '全部' : GROWTH_COIN_FLOW_LABELS[value as keyof typeof GROWTH_COIN_FLOW_LABELS]}
        </button>)}
      </div>
      {groups.length === 0 ? <p role="status" className="py-12 text-center text-[length:var(--pm-font-size-body)] text-[var(--pm-text-secondary)]">暂无符合条件的流水记录</p> : groups.map(group => <section key={group.month} className="mt-4">
        <h3 className="mb-2 text-[length:var(--pm-font-size-compact)] font-semibold text-[var(--pm-text-secondary)]">{Number(group.month.slice(0, 4))}年{Number(group.month.slice(5))}月</h3>
        <ul className="divide-y divide-[var(--pm-border-subtle)]">
          {group.records.map(record => {
            const safeRecord = !canViewEvaluationDetails && record.growthAward?.type === 'score'
              ? { ...record, growthAward: { ...record.growthAward, indicatorNames: [] } } : record;
            const Icon = record.type === 'expense' ? ShoppingBag : record.category === 'growth_award' ? TrendingUp : Clock;
            return <li key={record.id} className="flex items-start gap-3 py-3">
              <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] ${record.type === 'income' ? 'bg-[var(--pm-brand-reward-soft)] text-[var(--pm-brand-reward)]' : 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary)]'}`}><Icon size={18} /></span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[length:var(--pm-font-size-card-title)] font-semibold">{GROWTH_COIN_FLOW_LABELS[record.category]}</h4>
                <p className="mt-1 line-clamp-2 text-[length:var(--pm-font-size-compact)] leading-5 text-[var(--pm-text-secondary)]">{getGrowthCoinFlowDetail(safeRecord)}</p>
                <time dateTime={record.date.replace(' ', 'T')} className="mt-1 block text-[length:var(--pm-font-size-meta)] tabular-nums text-[var(--pm-text-tertiary)]">{formatCampusCoinFlowTime(record.date)}</time>
              </div>
              <span className="shrink-0 text-[length:var(--pm-font-size-card-title)] font-semibold tabular-nums">{record.type === 'income' ? '+' : '-'}{Number(record.amount.toFixed(2))}</span>
            </li>;
          })}
        </ul>
      </section>)}
    </ParentCard>
  </ParentPageShell>;
}
