import React from 'react';
import { ASSETS } from '../../assets/images';
import type { Student, StudentCardDisplaySettings } from '../../types';
import { CheckIcon, CircleIcon, PlusIcon } from '../Icons';
import StudentPerformanceAvatar from '../student-performance/StudentPerformanceAvatar';
import {
  StudentPerformanceCounts,
  StudentPerformanceLevelIcons,
} from '../student-performance/StudentPerformanceMeta';
import {
  getStudentPerformanceLevel,
  type StudentPerformanceSummary,
} from '../../domain/studentPerformance';

interface StudentRosterCardProps {
  student: Student;
  index: number;
  performance: StudentPerformanceSummary;
  levelNetScore?: number;
  displaySettings: StudentCardDisplaySettings;
  showSelection: boolean;
  selected: boolean;
  selectionStatus?: string;
  contextLabel?: string;
  onClick: () => void;
}

const getClassRosterNumber = (studentNo: string) => {
  const trailingDigits = studentNo.match(/(\d+)$/)?.[1];
  if (!trailingDigits) return studentNo.slice(-2);
  return trailingDigits.slice(-2).padStart(2, '0');
};

const getAvatarStyle = (index: number) => {
  const avatarTones = [
    ['bg-[var(--tm-tag-jade-soft)]', 'text-[var(--tm-tag-jade-strong)]', 'border-[var(--tm-tag-jade-border)]'],
    ['bg-[var(--tm-tag-orange-soft)]', 'text-[var(--tm-tag-orange-strong)]', 'border-[var(--tm-tag-orange-border)]'],
    ['bg-[var(--tm-tag-red-soft)]', 'text-[var(--tm-tag-red-strong)]', 'border-[var(--tm-tag-red-border)]'],
    ['bg-[var(--tm-tag-gold-soft)]', 'text-[var(--tm-tag-gold-strong)]', 'border-[var(--tm-tag-gold-border)]'],
  ];
  return avatarTones[index % avatarTones.length];
};

const getStudentRosterCardHeightClass = (displaySettings: StudentCardDisplaySettings) => {
  const showPerformanceCounts = displaySettings.showPraiseCount || displaySettings.showCriticismCount;
  const visiblePerformanceRowCount = Number(displaySettings.showLevel) + Number(showPerformanceCounts);
  return visiblePerformanceRowCount === 2
    ? 'h-[var(--tm-student-card-height-full)]'
    : visiblePerformanceRowCount === 1
      ? 'h-[var(--tm-student-card-height-compact)]'
      : 'h-[var(--tm-student-card-height-minimal)]';
};

const StudentRosterCard: React.FC<StudentRosterCardProps> = ({
  student,
  index,
  performance,
  levelNetScore,
  displaySettings,
  showSelection,
  selected,
  selectionStatus,
  contextLabel,
  onClick,
}) => {
  const [bgClass, textClass, borderClass] = getAvatarStyle(index);
  const studentNo = student.studentNo || student.id;
  const rosterNumber = getClassRosterNumber(studentNo);
  const level = getStudentPerformanceLevel(levelNetScore ?? performance.netScore);
  const showPerformanceCounts = displaySettings.showPraiseCount || displaySettings.showCriticismCount;
  const visiblePerformanceRowCount = Number(displaySettings.showLevel) + Number(showPerformanceCounts);
  const baseHeightClass = getStudentRosterCardHeightClass(displaySettings);
  const contextHeightClass = visiblePerformanceRowCount === 2
    ? 'h-[calc(var(--tm-student-card-height-full)+18px)]'
    : visiblePerformanceRowCount === 1
      ? 'h-[calc(var(--tm-student-card-height-compact)+18px)]'
      : 'h-[calc(var(--tm-student-card-height-minimal)+18px)]';
  const accessibilityDetails = [
    `${student.name}，学号${studentNo}`,
    contextLabel ?? '',
    displaySettings.showLevel ? `等级分值${levelNetScore ?? performance.netScore}分` : '',
    displaySettings.showPraiseCount ? `被表扬${performance.praiseCount}次` : '',
    displaySettings.showCriticismCount ? `被批评${performance.criticismCount}次` : '',
    selectionStatus ?? '',
  ].filter(Boolean).join('，');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={showSelection ? selected : undefined}
      aria-label={accessibilityDetails}
      className={`relative flex w-full min-w-0 select-none flex-col items-center overflow-visible rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] py-1 text-center [box-shadow:var(--tm-shadow-card)] transition-[transform,box-shadow] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] motion-reduce:transition-none ${contextLabel ? contextHeightClass : baseHeightClass}`}
    >
      {showSelection && (
        <span className={`absolute -right-1 -top-1 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full animate-in fade-in zoom-in duration-200 ${selected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'}`}>
          {selected
            ? <CheckIcon className="h-3 w-3 text-white [stroke-width:3]" />
            : <CircleIcon className="h-[18px] w-[18px] fill-white text-[var(--tm-border-subtle)]" />}
        </span>
      )}
      {contextLabel && (
        <span className="flex h-[18px] w-full shrink-0 items-center justify-center truncate px-1 text-[10px] font-medium leading-[18px] text-[var(--tm-text-tertiary)]">
          {contextLabel}
        </span>
      )}
      <span className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
        {displaySettings.showLevel && <StudentPerformanceLevelIcons level={level} />}
        <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center">
          <StudentPerformanceAvatar
            compact
            student={{ ...student, avatar: student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.STUDENT_GIRL_DEFAULT : undefined) }}
            fallbackText={student.name.slice(-1)}
            fallbackClassName={`${bgClass} ${textClass} border ${borderClass}`}
            level={level}
            showLevelProgress={displaySettings.showLevel}
          />
        </span>
        {showPerformanceCounts && (
          <StudentPerformanceCounts
            summary={performance}
            variant="student-card"
            showPraiseCount={displaySettings.showPraiseCount}
            showCriticismCount={displaySettings.showCriticismCount}
          />
        )}
      </span>
      <span className="flex h-[var(--tm-student-card-identity-height)] w-full shrink-0 items-center justify-center px-0.5">
        <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-0.5">
          <span
            aria-label={`学号${studentNo}`}
            className="flex h-[var(--tm-student-card-roster-height)] w-4 shrink-0 items-center justify-center self-center rounded-[4px] bg-[var(--tm-bg-surface-muted)] font-mono text-[length:var(--tm-student-card-roster-font-size)] font-semibold leading-none tabular-nums text-[var(--tm-text-tertiary)]"
          >
            {rosterNumber}
          </span>
          <span className="block min-w-0 max-w-[52px] truncate text-[length:var(--tm-student-card-name-font-size)] [font-weight:var(--tm-student-card-name-font-weight)] leading-4 text-[var(--tm-text-primary)]">
            {student.name}
          </span>
        </span>
      </span>
    </button>
  );
};

interface StudentRosterAddCardProps {
  displaySettings: StudentCardDisplaySettings;
  onClick: () => void;
}

export const StudentRosterAddCard: React.FC<StudentRosterAddCardProps> = ({ displaySettings, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="添加学生"
    className={`flex w-full min-w-0 select-none items-center justify-center rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] text-center [box-shadow:var(--tm-shadow-card)] transition-[transform,box-shadow] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] motion-reduce:transition-none ${getStudentRosterCardHeightClass(displaySettings)}`}
  >
    <span className="flex flex-col items-center justify-center gap-[var(--tm-space-2)]">
      <PlusIcon className="h-6 w-6 text-[var(--tm-action-icon-brand)]" />
      <span className="text-[length:var(--tm-font-size-compact)] font-medium leading-4 text-[var(--tm-brand-primary)]">
        添加学生
      </span>
    </span>
  </button>
);

export default StudentRosterCard;
