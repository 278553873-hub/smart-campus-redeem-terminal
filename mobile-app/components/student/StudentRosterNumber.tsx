import React from 'react';

interface StudentRosterNumberProps {
  studentNo: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  className?: string;
  variant?: 'default' | 'student-card';
}

/**
 * 教师端身份标识只展示末两位，完整学号通过读屏标签保留。
 * 学生卡片使用更醒目的专用尺寸，其他紧凑列表继续使用默认规格。
 */
export const getStudentRosterNumber = (studentNo: string) => {
  const normalized = studentNo.replace(/^学号/, '').trim();
  const numeric = normalized.match(/\d+/g)?.join('') ?? normalized;
  return numeric.slice(-2).padStart(2, '0');
};

const StudentRosterNumber: React.FC<StudentRosterNumberProps> = ({
  studentNo,
  ariaLabel,
  ariaHidden = false,
  className = '',
  variant = 'default',
}) => {
  const sizeClasses = variant === 'student-card'
    ? 'h-[var(--tm-student-card-roster-height-strong)] w-[var(--tm-student-card-roster-width-strong)] text-[length:var(--tm-student-card-roster-font-size-strong)] [font-weight:var(--tm-student-card-roster-font-weight-strong)]'
    : 'h-[var(--tm-student-card-roster-height)] w-4 text-[length:var(--tm-student-card-roster-font-size)] font-bold';

  return (
    <span
      aria-label={ariaLabel}
      aria-hidden={ariaHidden || undefined}
      className={`flex ${sizeClasses} shrink-0 items-center justify-center rounded-[4px] bg-[var(--tm-student-roster-number-bg)] font-[NumberFont] leading-none tabular-nums text-[var(--tm-student-roster-number-text)] ${className}`}
    >
      {getStudentRosterNumber(studentNo)}
    </span>
  );
};

export default StudentRosterNumber;
