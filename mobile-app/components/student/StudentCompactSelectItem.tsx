import React from 'react';
import { ASSETS } from '../../assets/images';
import type { Student } from '../../types';
import { CheckIcon, CircleIcon } from '../Icons';

interface StudentCompactSelectItemProps {
  student: Student;
  selected: boolean;
  selectionDescription?: string;
  onClick: () => void;
}

const getRosterNumber = (studentNo: string) => {
  const trailingDigits = studentNo.match(/(\d+)$/)?.[1];
  if (!trailingDigits) return studentNo.slice(-2);
  return trailingDigits.slice(-2).padStart(2, '0');
};

const StudentCompactSelectItem: React.FC<StudentCompactSelectItemProps> = ({
  student,
  selected,
  selectionDescription,
  onClick,
}) => {
  const studentNo = student.studentNo || student.id;
  const rosterNumber = getRosterNumber(studentNo);
  const avatar = student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.GENERIC_GIRL : ASSETS.AVATAR.GENERIC_BOY);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${student.name}，学号${studentNo}${selectionDescription ? `，${selectionDescription}` : ''}`}
      className="relative flex min-h-[76px] min-w-0 select-none flex-col items-center justify-start gap-1 rounded-[var(--tm-radius-control)] px-0.5 py-1 text-center transition-[transform,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)] motion-reduce:transition-none"
    >
      <span className="relative h-12 w-12 shrink-0">
        <img src={avatar} alt="" className="h-full w-full rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" decoding="async" />
        <span className={`absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full ${selected ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface)]'}`} aria-hidden="true">
          {selected
            ? <CheckIcon className="h-3 w-3 text-[var(--tm-text-inverse)] [stroke-width:3]" />
            : <CircleIcon className="h-[18px] w-[18px] fill-[var(--tm-bg-surface)] text-[var(--tm-border-subtle)]" />}
        </span>
      </span>
      <span className="flex h-4 w-full min-w-0 items-center justify-center gap-0.5">
        <span className="flex h-[14px] w-3.5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--tm-bg-surface-muted)] font-mono text-[8px] font-semibold leading-none tabular-nums text-[var(--tm-text-tertiary)]" aria-hidden="true">
          {rosterNumber}
        </span>
        <span className="min-w-0 truncate text-[12px] font-medium leading-4 text-[var(--tm-text-primary)]">
          {student.name}
        </span>
      </span>
    </button>
  );
};

export default StudentCompactSelectItem;
