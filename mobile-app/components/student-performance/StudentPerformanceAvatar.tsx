import React from 'react';
import type { Student } from '../../types';
import type { StudentPerformanceLevel } from '../../domain/studentPerformance';
import { FemaleIcon, MaleIcon } from '../Icons';

interface StudentPerformanceAvatarProps {
  student: Student;
  fallbackText: string;
  fallbackClassName: string;
  level: StudentPerformanceLevel;
}

const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StudentPerformanceAvatar: React.FC<StudentPerformanceAvatarProps> = ({
  student,
  fallbackText,
  fallbackClassName,
  level,
}) => {
  const progressPercent = Math.round(level.progress * 100);
  const dashOffset = CIRCUMFERENCE * (1 - level.progress);

  return (
    <div
      role="img"
      aria-label={`${student.name}头像，下一等级图标进度${progressPercent}%`}
      className="relative mt-0.5 h-[58px] w-[58px] shrink-0"
    >
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

      <div className={`absolute inset-1 overflow-hidden rounded-full ${fallbackClassName}`}>
        {student.avatar ? (
          <img src={student.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-base font-semibold">{fallbackText}</span>
        )}
      </div>

      <span className={`absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center drop-shadow-[0_0_1px_rgba(255,255,255,1)] ${student.gender === 'male' ? 'text-[var(--tm-gender-male)]' : 'text-[var(--tm-gender-female)]'}`}>
        {student.gender === 'male'
          ? <MaleIcon className="h-4 w-4 stroke-[3]" />
          : <FemaleIcon className="h-4 w-4 stroke-[3]" />}
      </span>
    </div>
  );
};

export default StudentPerformanceAvatar;
