import CompactSegmentedControl from '../../components/ui/CompactSegmentedControl';
import React, { useEffect, useState, useRef } from 'react';
import { Check } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';

export interface EvaluationTeacherOption {
  source?: 'school' | 'parent';
  id: string;
  name: string;
  count: number;
}

interface EvaluationTeacherFilterSheetProps {
  open: boolean;
  value: string;
  teachers: EvaluationTeacherOption[];
  totalCount: number;
  currentTeacherId: string;
  currentTeacherName: string;
  onClose: () => void;
  onSelect: (teacherId: string) => void;
}

const EvaluationTeacherFilterSheet: React.FC<EvaluationTeacherFilterSheetProps> = ({
  open,
  value,
  teachers,
  totalCount,
  currentTeacherId,
  currentTeacherName,
  onClose,
  onSelect,
}) => {
  const [source, setSource] = useState<'school' | 'parent'>('school');
  const touch = useRef<{x: number; y: number} | null>(null);
  useEffect(() => {
    if (open) setSource(value === 'source:parent' || value.startsWith('relation:') ? 'parent' : 'school');
  }, [open, value]);
  const sourceCount = (source: string) => teachers.find(t => t.id === `source:${source}`)?.count ?? 0;
  const selectableTeachers = teachers.filter(t => !t.id.startsWith('source:') && (t.source ?? 'school') === source && (t.count > 0 || t.id === value));
  const currentTeacher = source === 'school' ? selectableTeachers.find(t => t.id === currentTeacherId) : undefined;
  const otherTeachers = selectableTeachers.filter(t => t.id !== currentTeacher?.id);
  const selectTeacher = (teacherId: string) => {
    onSelect(teacherId);
    onClose();
  };

  const optionClass = (selected: boolean) => `flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-3 rounded-[var(--tm-radius-control-compact)] px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tm-text-primary)] ${selected
    ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [&>span:first-child]:font-semibold [&>span:first-child>span:first-child]:font-semibold'
    : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`;

  const renderTeacher = (teacher: EvaluationTeacherOption) => (
    <button
      key={teacher.id}
      type="button"
      onClick={() => selectTeacher(teacher.id)}
      aria-label={`选择${teacher.name}，当前时间范围${teacher.count}条评价`}
      aria-pressed={value === teacher.id}
      className={optionClass(value === teacher.id)}
    >
      <span className="min-w-0 truncate text-[13px] font-medium">{teacher.name}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-[12px] text-[var(--tm-text-tertiary)]">{teacher.count}条</span>
        {value === teacher.id && <Check className="h-4 w-4 text-[var(--tm-brand-primary-strong)]" />}
      </span>
    </button>
  );

  return (
    <MobileBottomSheet open={open} title="选择评价人" onClose={onClose}>
      <div className="pb-2" onTouchStart={event => { const t = event.touches[0]; touch.current = {x: t.clientX, y: t.clientY}; }} onTouchEnd={event => { const t = event.changedTouches[0]; const start = touch.current; touch.current = null; if (start && Math.abs(t.clientX - start.x) > 50 && Math.abs(t.clientX - start.x) > Math.abs(t.clientY - start.y)) setSource(t.clientX < start.x ? 'parent' : 'school'); }}>
        <CompactSegmentedControl value={source} items={[{value: 'school', label: `学校评价(${sourceCount('school')})`}, {value: 'parent', label: `家长评价(${sourceCount('parent')})`}]} onChange={setSource} ariaLabel="评价来源" fullWidth motion="sliding" shape="subtle" />
        <div className="space-y-1">
          <button type="button" onClick={() => selectTeacher(`source:${source}`)} aria-pressed={value === `source:${source}`} className={optionClass(value === `source:${source}`)}>
            <span className="text-[13px] font-medium">全部</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-[12px] text-[var(--tm-text-tertiary)]">{sourceCount(source)}条</span>
              {value === `source:${source}` && <Check className="h-4 w-4 text-[var(--tm-brand-primary-strong)]" />}
            </span>
          </button>
          {currentTeacher && (
            <button type="button" onClick={() => selectTeacher(currentTeacher.id)} aria-pressed={value === currentTeacher.id} className={optionClass(value === currentTeacher.id)}>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">我的评价</span>
                <span className="block truncate text-[12px] text-[var(--tm-text-tertiary)]">{currentTeacherName}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-[12px] text-[var(--tm-text-tertiary)]">{currentTeacher.count}条</span>
                {value === currentTeacher.id && <Check className="h-4 w-4 text-[var(--tm-brand-primary-strong)]" />}
              </span>
            </button>
          )}
          {otherTeachers.map(renderTeacher)}
          {selectableTeachers.length === 0 && <p className="px-3 py-6 text-center text-sm text-[var(--tm-text-tertiary)]">暂无{source === 'school' ? '学校' : '家长'}评价</p>}
        </div>
      </div>
    </MobileBottomSheet>
  );
};

export default EvaluationTeacherFilterSheet;
