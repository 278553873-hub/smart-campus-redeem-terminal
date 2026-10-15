import React from 'react';
import { ChevronRight } from 'lucide-react';
import MobileSlidingSegmentedControl from '../components/ui/MobileSlidingSegmentedControl';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import type { RecordMode, RecordState } from './RecordView';

interface Props {
  manager: boolean;
  mode: RecordMode;
  pendingCount: number;
  stateCounts: { pending: number; returned: number };
  state: RecordState;
  onMode: (value: RecordMode) => void;
  onState: (value: RecordState) => void;
  onIndicators: () => void;
}

/** 与原教师手机端使用同一顶部滑动胶囊、宽度和微信安全区。 */
export default function RecordHeader({ manager, mode, pendingCount, stateCounts, state, onMode, onState, onIndicators }: Props) {
  return <header className="shrink-0 px-5">
    <h1 className="sr-only">{mode === 'review' ? '审核' : '记录'}</h1>
    {manager && <div className="[padding-right:var(--mini-program-capsule-right-inset,0px)]">
      <MobileSlidingSegmentedControl<RecordMode>
        value={mode}
        items={[
          { value: 'record', label: '记录', indicatorClassName: 'bg-[var(--tm-record-student-soft)]', activeTextClassName: 'text-[var(--tm-record-student-text)]' },
          { value: 'review', label: `审核 (${pendingCount})`, indicatorClassName: 'bg-[var(--tm-record-class-soft)]', activeTextClassName: 'text-[var(--tm-record-class-text)]' },
        ]}
        onChange={onMode} ariaLabel="记录与审核" className="w-[192px]"
      />
    </div>}
    <div className={`relative flex h-[var(--mini-program-title-bar-height,44px)] items-center ${manager ? '' : '[padding-right:var(--mini-program-capsule-right-inset,0px)]'}`}>
      <button type="button" onClick={onIndicators} aria-label="查看教师评价指标" className="relative z-10 flex h-[var(--tm-size-touch)] shrink-0 items-center gap-0.5 rounded-[var(--tm-radius-control)] px-1 text-[14px] font-semibold text-[var(--tm-text-secondary)]">指标<ChevronRight size={14} aria-hidden="true" /></button>
      <p className={manager ? 'ml-auto text-right text-[11px] font-medium leading-4 text-[var(--tm-text-disabled)]' : 'pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-[11px] font-medium leading-4 text-[var(--tm-text-disabled)]'}>内容由AI生成</p>
    </div>
    <TextSelectionControl<RecordState> value={state} items={mode === 'review'
      ? [{ value: 'pending', label: `待审核 (${stateCounts.pending})` }, { value: 'approved', label: '已通过' }, { value: 'returned', label: `未通过 (${stateCounts.returned})` }]
      : [{ value: 'all', label: '全部' }, { value: 'approved', label: '已通过' }, { value: 'pending', label: `待审核 (${stateCounts.pending})` }, { value: 'returned', label: `未通过 (${stateCounts.returned})` }]}
      onChange={onState} ariaLabel={mode === 'review' ? '审核状态' : '记录状态'} />
  </header>;
}
