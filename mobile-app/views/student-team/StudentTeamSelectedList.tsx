import React, { useMemo, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';

interface StudentTeamSelectedListProps {
  selectedIds: Set<string>;
  getStudentLabelById: (studentId: string) => { name: string; classLabel: string } | undefined;
  onRemove: (studentId: string) => void;
}

const StudentTeamSelectedList: React.FC<StudentTeamSelectedListProps> = ({ selectedIds, getStudentLabelById, onRemove }) => {
  const [open, setOpen] = useState(false);
  const selectedStudents = useMemo(() => Array.from(selectedIds).map(studentId => {
    const label = getStudentLabelById(studentId);
    return { id: studentId, name: label?.name ?? '学生', classLabel: label?.classLabel ?? '' };
  }), [getStudentLabelById, selectedIds]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="查看已选学生"
        className="flex min-h-11 w-full items-center justify-between gap-[var(--tm-space-2)] text-left"
      >
        <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">已选 {selectedIds.size} 人</span>
        <ChevronRight className="h-4 w-4 text-[var(--tm-brand-primary)]" />
      </button>

      <MobileBottomSheet open={open} title="已选名单" onClose={() => setOpen(false)}>
        <div className="space-y-2 pb-2">
          {selectedStudents.map(student => (
            <div key={student.id} className="flex min-h-[56px] items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name}</span>
                {student.classLabel && <span className="block truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{student.classLabel}</span>}
              </span>
              <button type="button" onClick={() => onRemove(student.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-status-negative)]" aria-label={`移除${student.name}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          {selectedStudents.length === 0 && (
            <p className="py-8 text-center text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]">还没有选择学生</p>
          )}
        </div>
      </MobileBottomSheet>
    </>
  );
};

export default StudentTeamSelectedList;

