import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import RecordInputContent from './RecordInputContent';
import RecordRecognitionCards from './RecordRecognitionCards';
import { MobileCard } from '../components/ui/MobileCard';
import { canReview } from './domain';
import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import { EmptyState } from './ui';
import { canManageRecord } from './recordActions';
import type { RecognitionField } from './recordCorrections';

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
  onActions?: (record: DevelopmentRecord) => void;
  onEdit?: (record: DevelopmentRecord, field: RecognitionField) => void;
}

/** 记录首页原位展示完整事件和识别结果；查询与处理历史留在档案。 */
export default function RecordView({ records, indicators, teacherNames, actorId, mode, state, onOpen, onActions, onEdit }: Props) {
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
      const hasActions = mode === 'record' && canManageRecord(record, actorId) && !!onActions;
      return <MobileCard key={record.id} padding="none" className="relative">
        {hasActions && <button type="button" aria-label="更多记录操作" aria-haspopup="dialog" onClick={() => onActions?.(record)} className="absolute right-1 top-1 z-10 flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]"><MoreHorizontal size={20} aria-hidden="true" /></button>}
        <div className="p-4">
          {record.inputType === 'image' ? <button type="button" aria-label="查看原始图片" className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]" onClick={() => onOpen(record)}><RecordInputContent record={record} reserveActions={hasActions} /></button> : <RecordInputContent record={record} reserveActions={hasActions} />}
          <RecordRecognitionCards record={record} indicator={indicator} teacherName={teacherNames[record.teacherId]} actorId={actorId} onEdit={onEdit ? field => onEdit(record, field) : undefined} />
          {record.note && <p className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-[1.55] text-[var(--tm-status-negative-strong)]">未通过原因：{record.note}</p>}
          {(reviewable || editable) && <button type="button" onClick={() => onOpen(record)} className="mt-3 flex min-h-[var(--tm-size-touch)] w-full items-center justify-end text-[13px] font-semibold text-[var(--tm-brand-primary)]">{reviewable ? '审核' : '修改重提'}</button>}
        </div>
      </MobileCard>;
    })}
  </section>;
}
