import React from 'react';
import { ASSETS } from '../../assets/images';
import type { Student } from '../../types';
import MobileSelectionIndicator from './MobileSelectionIndicator';
import StudentRosterNumber from './StudentRosterNumber';

interface StudentCompactSelectItemProps {
  student: Student;
  selected: boolean;
  selectionDescription?: string;
  secondaryLabel?: string;
  showRosterNumber?: boolean;
  onClick: () => void;
}

const StudentCompactSelectItem: React.FC<StudentCompactSelectItemProps> = ({
  student,
  selected,
  selectionDescription,
  secondaryLabel,
  showRosterNumber = true,
  onClick,
}) => {
  const studentNo = student.studentNo || student.id;
  const avatar = student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.GENERIC_GIRL : ASSETS.AVATAR.GENERIC_BOY);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${student.name}${showRosterNumber ? `，学号${studentNo}` : ''}${secondaryLabel ? `，${secondaryLabel}` : ''}${selectionDescription ? `，${selectionDescription}` : ''}`}
      className={`relative isolate flex min-w-0 select-none flex-col items-center justify-start rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-0.5 py-1 text-center ${secondaryLabel ? 'h-[var(--tm-student-card-height-minimal)] gap-0.5' : 'min-h-[76px] gap-1'}`}
    >
      <MobileSelectionIndicator selected={selected} className="absolute -right-1 -top-1 z-20 animate-in fade-in zoom-in duration-200" />
      <span className="relative h-12 w-12 shrink-0">
        <img src={avatar} alt="" className="h-full w-full rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" decoding="async" />
      </span>
      <span className="flex h-4 w-full min-w-0 items-center justify-center gap-0.5">
        {showRosterNumber && <StudentRosterNumber studentNo={studentNo} ariaHidden />}
        <span className="min-w-0 truncate text-[12px] font-medium leading-4 text-[var(--tm-text-primary)]">
          {student.name}
        </span>
      </span>
      {secondaryLabel && (
        <span className="w-full min-w-0 truncate px-0.5 text-[10px] font-medium leading-3 text-[var(--tm-text-tertiary)]">
          {secondaryLabel}
        </span>
      )}
    </button>
  );
};

export default StudentCompactSelectItem;
