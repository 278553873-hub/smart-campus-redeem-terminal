import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';

export interface EvaluationTeacherOption {
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
  const selectableTeachers = useMemo(() => teachers.filter(teacher => teacher.count > 0 || teacher.id === value), [teachers, value]);
  const currentTeacher = selectableTeachers.find(teacher => teacher.id === currentTeacherId);
  const otherTeachers = useMemo(() => selectableTeachers.filter(teacher => (
    teacher.id !== currentTeacherId
  )), [currentTeacherId, selectableTeachers]);

  const selectTeacher = (teacherId: string) => {
    onSelect(teacherId);
    onClose();
  };

  const optionClass = (selected: boolean) => `flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-3 rounded-[var(--tm-radius-control)] px-3 text-left transition-colors ${selected
    ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
    : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`;

  const renderTeacher = (teacher: EvaluationTeacherOption) => (
    <button
      key={teacher.id}
      type="button"
      onClick={() => selectTeacher(teacher.id)}
      aria-label={`选择${teacher.name}，当前时间范围${teacher.count}条评价`}
      className={optionClass(value === teacher.id)}
    >
      <span className="min-w-0 truncate text-[13px] font-medium">{teacher.name}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-[12px] text-[var(--tm-text-tertiary)]">{teacher.count}条</span>
        {value === teacher.id && <Check className="h-4 w-4" />}
      </span>
    </button>
  );

  return (
    <MobileBottomSheet open={open} title="选择评价人" onClose={onClose}>
      <div className="pb-2">
        <div className="space-y-1">
          <button type="button" onClick={() => selectTeacher('all')} className={optionClass(value === 'all')}>
            <span className="text-[13px] font-medium">全部评价人</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-[12px] text-[var(--tm-text-tertiary)]">{totalCount}条</span>
              {value === 'all' && <Check className="h-4 w-4" />}
            </span>
          </button>
          {currentTeacher && (
            <button type="button" onClick={() => selectTeacher(currentTeacher.id)} className={optionClass(value === currentTeacher.id)}>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">我的评价</span>
                <span className="block truncate text-[12px] text-[var(--tm-text-tertiary)]">{currentTeacherName}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-[12px] text-[var(--tm-text-tertiary)]">{currentTeacher.count}条</span>
                {value === currentTeacher.id && <Check className="h-4 w-4" />}
              </span>
            </button>
          )}
          {otherTeachers.map(renderTeacher)}
        </div>
      </div>
    </MobileBottomSheet>
  );
};

export default EvaluationTeacherFilterSheet;
