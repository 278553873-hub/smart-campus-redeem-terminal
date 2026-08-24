import React from 'react';
import type { Student } from '../../types';
import type { StudentPerformanceLevel } from '../../domain/studentPerformance';

interface StudentPerformanceAvatarProps {
  student: Student;
  fallbackText: string;
  fallbackClassName: string;
  level: StudentPerformanceLevel;
  compact?: boolean;
  showLevelProgress?: boolean;
}

const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StudentPerformanceAvatar: React.FC<StudentPerformanceAvatarProps> = ({
  student,
  fallbackText,
  fallbackClassName,
  level,
  compact = false,
  showLevelProgress = true,
}) => {
  const progressPercent = Math.round(level.progress * 100);
  const dashOffset = CIRCUMFERENCE * (1 - level.progress);

  return (
    <div
      role="img"
      aria-label={showLevelProgress ? `${student.name}头像，下一等级图标进度${progressPercent}%` : `${student.name}头像`}
      className={`relative shrink-0 ${compact ? 'h-[58px] w-[58px]' : 'h-[60px] w-[60px]'}`}
    >
      {showLevelProgress && (
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 58 58">
          <circle
            cx="29"
            cy="29"
            r={RADIUS}
            fill="none"
            stroke="var(--tm-student-level-track)"
            strokeWidth="3"
          />
          <circle
            cx="29"
            cy="29"
            r={RADIUS}
            fill="none"
            stroke="var(--tm-student-level-progress)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="3"
            className="transition-[stroke-dashoffset] [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:transition-none"
          />
        </svg>
      )}

      <div className={`absolute inset-1 overflow-hidden rounded-full ${fallbackClassName}`}>
        {student.avatar ? (
          <img src={student.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-base font-semibold">{fallbackText}</span>
        )}
      </div>
    </div>
  );
};

export default StudentPerformanceAvatar;
