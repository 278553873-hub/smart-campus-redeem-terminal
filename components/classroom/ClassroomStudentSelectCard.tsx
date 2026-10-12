import React from 'react';
import { Check } from 'lucide-react';
import type { ClassroomDisplayConfig } from '../../shared/classroomDisplay';
import ClassroomRosterBadge from './ClassroomRosterBadge';
import type { ClassroomStudentCardStudent } from './ClassroomStudentCard';

/**
 * 课堂大屏简化版学生卡片：头像、班内号与姓名，用于分组选人等需要压缩排布的场景。
 */
interface ClassroomStudentSelectCardProps {
  student: ClassroomStudentCardStudent;
  selected: boolean;
  onClick: () => void;
  layout: ClassroomDisplayConfig['memberSelect'];
}

const ClassroomStudentSelectCard: React.FC<ClassroomStudentSelectCardProps> = ({ student, selected, onClick, layout }) => (
  <button
    type="button"
    aria-pressed={selected}
    aria-label={`${student.name}，学号${student.studentNo}`}
    onClick={onClick}
    className={`relative flex min-h-[96px] min-w-0 flex-col items-center justify-start gap-2 rounded-lg border px-2 py-2 text-center transition-[transform,border-color,background-color,box-shadow] active:scale-[0.97] ${selected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-blue-300 hover:bg-blue-50/40'}`}
    style={{ minHeight: layout.minHeight, gap: layout.gap }}
  >
    <span className={`absolute right-2 top-2 flex items-center justify-center rounded-full border ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-transparent'}`} style={{ width: Math.max(20, Math.round(layout.nameFontSize * 1.7)), height: Math.max(20, Math.round(layout.nameFontSize * 1.7)) }} aria-hidden="true">
      <Check size={Math.max(12, Math.round(layout.nameFontSize * 0.9))} strokeWidth={3} />
    </span>
    <img src={student.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full bg-slate-100 object-cover" style={{ width: layout.avatarSize, height: layout.avatarSize }} decoding="async" />
    <span className="flex w-full min-w-0 items-center justify-center gap-1" style={{ minHeight: Math.max(20, layout.studentNoFontSize + 4) }}>
      <ClassroomRosterBadge studentNo={student.studentNo} fontSize={layout.studentNoFontSize} lineHeight={16} variant="select" ariaHidden />
      <span className="min-w-0 truncate text-xs font-semibold leading-4 text-slate-700" style={{ fontSize: layout.nameFontSize }}>{student.name}</span>
    </span>
  </button>
);

export default ClassroomStudentSelectCard;
