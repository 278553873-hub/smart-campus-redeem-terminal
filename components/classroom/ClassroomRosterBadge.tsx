import React from 'react';

type ClassroomRosterBadgeVariant = 'card' | 'select';

interface ClassroomRosterBadgeProps {
  studentNo: string;
  fontSize: number;
  lineHeight?: number;
  width?: number;
  height?: number;
  variant?: ClassroomRosterBadgeVariant;
  className?: string;
  ariaHidden?: boolean;
}

export const formatClassroomRosterNumber = (studentNo: string) => {
  const trailingDigits = studentNo.match(/(\d+)$/)?.[1];
  if (!trailingDigits) return studentNo.slice(-2);
  return trailingDigits.slice(-2).padStart(2, '0');
};

const ClassroomRosterBadge: React.FC<ClassroomRosterBadgeProps> = ({
  studentNo,
  fontSize,
  lineHeight,
  width,
  height,
  variant = 'card',
  className = '',
  ariaHidden = false,
}) => {
  const isSelectVariant = variant === 'select';
  const widthStyle = isSelectVariant
    ? { minWidth: Math.max(20, Math.round(fontSize * 1.6)) }
    : { width: width ?? Math.max(22, Math.round(fontSize * 2)) };

  return (
    <span
      className={`${isSelectVariant ? 'rounded px-1 font-semibold' : 'rounded px-0.5 font-extrabold'} inline-flex shrink-0 items-center justify-center border border-slate-200/80 bg-slate-100 font-[NumberFont] leading-none tabular-nums text-slate-800 ${className}`}
      style={{
        ...widthStyle,
        height: height ?? lineHeight ?? Math.max(isSelectVariant ? 20 : 18, Math.round(fontSize * (isSelectVariant ? 1.5 : 1.65))),
        fontSize,
      }}
      aria-hidden={ariaHidden || undefined}
    >
      {formatClassroomRosterNumber(studentNo)}
    </span>
  );
};

export const ClassroomFullStudentNumber: React.FC<{
  studentNo: string;
  fontSize: number;
}> = ({ studentNo, fontSize }) => (
  <span className="mt-1 inline-flex items-center whitespace-nowrap font-[NumberFont] font-semibold tabular-nums text-slate-500" style={{ fontSize, lineHeight: `${Math.round(fontSize * 1.35)}px` }}>
    {studentNo}
  </span>
);

export default ClassroomRosterBadge;
