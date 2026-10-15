import React from 'react';
import RecordInputContent from './RecordInputContent';
import { ASSETS } from '../assets/images';
import { MobileCard } from '../components/ui/MobileCard';
import { canReview } from './domain';
import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import { EmptyState } from './ui';

export type RecordState = 'all' | 'approved' | 'pending' | 'returned';
export type RecordMode = 'record' | 'review';
interface Props {
  records: DevelopmentRecord[];
  indicators: DevelopmentIndicator[];
  teacherNames: Record<string, string>;
  actorId: string;
  mode: RecordMode;
  state: RecordState;
  onOpen: (record: DevelopmentRecord) => void;
}

/** 记录首页原位展示完整事件和识别结果；查询与处理历史留在档案。 */
export default function RecordView({ records, indicators, teacherNames, actorId, mode, state, onOpen }: Props) {
  const indicatorById = Object.fromEntries(indicators.map(item => [item.id, item]));
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return <section className={`space-y-3 ${mode === 'record' ? 'pb-24' : 'pb-3'}`} aria-label={mode === 'review' ? '审核记录' : '成长记录'}>
    {!sorted.length && <EmptyState
      title={state === 'pending' ? mode === 'review' ? '当前没有待审核事项' : '暂无待审核的记录' : state === 'returned' ? '暂无未通过的记录' : state === 'approved' ? '暂无已通过的记录' : '暂无成长记录'}
      description={mode === 'review' ? '可切换标签查看已处理的记录。' : state === 'all' ? '用下方入口说一件事、输入文字或上传图片。' : '可以切换“全部”查看其他记录。'}
    />}
    {sorted.map(record => {
      const indicator = indicatorById[record.indicatorId];
      const reviewable = mode === 'review' && canReview(record, actorId);
      const editable = record.authorId === actorId && record.status === 'returned';
      const isNegative = record.delta < 0;
      const isNeutral = record.delta === 0 || record.status === 'returned';
      const surfaceClass = isNeutral
        ? 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]'
        : isNegative
          ? 'border-[var(--tm-record-negative-border)] bg-[var(--tm-record-negative-bg)]'
          : 'border-[var(--tm-record-positive-border)] bg-[var(--tm-record-positive-bg)]';
      const accentClass = isNeutral ? 'bg-[var(--tm-text-tertiary)]' : isNegative ? 'bg-[var(--tm-score-negative)]' : 'bg-[var(--tm-status-positive)]';
      const scoreClass = isNeutral
        ? 'border-[var(--tm-border-subtle)] text-[var(--tm-text-secondary)]'
        : isNegative ? 'border-[var(--tm-record-negative-border)] text-[var(--tm-score-negative)]' : 'border-[var(--tm-record-positive-border)] text-[var(--tm-status-positive)]';
      const hasScore = record.status !== 'returned' && record.delta !== 0;
      const score = record.delta > 0 ? `+${record.delta}` : `${record.delta}`;
      const scoreLabel = record.status === 'returned' ? '未通过' : record.status === 'pending' ? '待审核' : '仅归档';
      const extra = [record.level, record.contribution].filter(Boolean).join(' · ');
      return <MobileCard key={record.id} padding="none">
        <button type="button" onClick={() => onOpen(record)} aria-label={`${teacherNames[record.teacherId]}，${record.title}，${reviewable ? '审核记录' : editable ? '修改重提' : '记录操作'}`}
          className="block w-full p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]">
          <RecordInputContent record={record} />
          <div className={`rounded-[var(--tm-radius-inner)] border p-3.5 ${surfaceClass}`}>
            <div className="mb-3 grid grid-cols-[26px_auto_1fr_auto] items-center gap-2">
              <img src={ASSETS.MANAGEMENT.AI_BOT} alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />
              <span className="text-[14px] font-semibold text-[var(--tm-text-primary)]">AI 智能解读</span>
              <span className={`h-1 w-6 rounded-full opacity-75 ${accentClass}`} aria-hidden="true" />
              <span className={`flex min-h-10 min-w-[68px] items-center justify-center gap-1 rounded-[var(--tm-radius-control)] border bg-white/90 px-2.5 ${scoreClass}`}>
                {hasScore ? <><span className="text-[22px] font-bold leading-none tabular-nums">{score}</span><span className="text-[10px] font-medium text-[var(--tm-text-secondary)]">{record.status === 'pending' ? '待审核' : '分'}</span></> : <span className="text-[12px] font-semibold">{scoreLabel}</span>}
              </span>
            </div>
            <dl className="grid grid-cols-[38px_minmax(0,1fr)] gap-x-2 gap-y-2 text-[13px] font-medium leading-[1.55] text-[var(--tm-text-primary)]">
              <dt className="pt-1 text-[12px] text-[var(--tm-text-secondary)]">时间：</dt>
              <dd className="flex min-h-7 items-center"><time dateTime={record.date}>{record.date.replace('-', '年').replace('-', '月')}日</time></dd>
              <dt className="pt-1 text-[12px] text-[var(--tm-text-secondary)]">对象：</dt>
              <dd className="flex min-h-7 items-center font-semibold">{teacherNames[record.teacherId]}{record.teacherId === actorId ? '(本人)' : ''}</dd>
              <dt className="pt-1 text-[12px] text-[var(--tm-text-secondary)]">指标：</dt>
              <dd className="min-w-0 py-1"><span className="break-words">{indicator ? `${indicator.dimension} / ${indicator.name}` : '指标已调整'}</span>{extra && <span className="mt-1 block text-[12px] text-[var(--tm-text-secondary)]">{extra}</span>}</dd>
            </dl>
          </div>
          {record.note && <p className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-[1.55] text-[var(--tm-status-negative-strong)]">未通过原因：{record.note}</p>}
          {(reviewable || editable) && <span className="mt-3 flex min-h-[var(--tm-size-touch)] items-center justify-end text-[13px] font-semibold text-[var(--tm-brand-primary)]">{reviewable ? '审核' : '修改重提'}</span>}
        </button>
      </MobileCard>;
    })}
  </section>;
}
