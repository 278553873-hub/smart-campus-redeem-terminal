import React, { useMemo, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import StudentRosterNumber from '../../components/student/StudentRosterNumber';
import type { StudentTeamLabel } from '../../types';

interface StudentTeamSelectedListProps {
  selectedIds: Set<string>;
  getStudentLabelById: (studentId: string) => StudentTeamLabel | undefined;
  onRemove: (studentId: string) => void;
  className?: string;
}

const StudentTeamSelectedList: React.FC<StudentTeamSelectedListProps> = ({ selectedIds, getStudentLabelById, onRemove, className = 'min-h-11' }) => {
  const [open, setOpen] = useState(false);
  const selectedStudents = useMemo(() => Array.from(selectedIds).map(studentId => {
    const label = getStudentLabelById(studentId);
    return {
      id: studentId,
      name: label?.name ?? '学生',
      classLabel: label?.classLabel ?? '',
      avatar: label?.avatar,
      studentNo: label?.studentNo ?? studentId,
    };
  }), [getStudentLabelById, selectedIds]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="查看已选学生"
        className={'flex w-full items-center justify-between gap-[var(--tm-space-2)] text-left ' + className}
      >
        <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">已选 {selectedIds.size} 人</span>
        <ChevronRight className="h-4 w-4 text-[var(--tm-brand-primary)]" />
      </button>

      <MobileBottomSheet open={open} title="已选名单" onClose={() => setOpen(false)}>
        <div className="space-y-[var(--tm-layout-list-gap-compact)] pb-2">
          {selectedStudents.map(student => (
            <div key={student.id} className="flex min-h-[56px] items-center gap-3 rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface-soft)] px-3">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]">{student.avatar && <img src={student.avatar} alt="" className="h-full w-full object-cover" decoding="async" />}</span>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-[var(--tm-space-1)]">
                  <StudentRosterNumber studentNo={student.studentNo} ariaHidden variant="student-card" />
                  <span className="min-w-0 truncate text-[length:var(--tm-student-card-name-font-size)] [font-weight:var(--tm-student-card-name-font-weight)] leading-4 text-[var(--tm-text-primary)]">{student.name}</span>
                </span>
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

