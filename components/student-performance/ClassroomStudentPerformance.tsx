import React from 'react';
import type {
  StudentPerformanceLevel,
  StudentPerformanceSummary,
  StudentPerformanceTier,
} from '../../mobile-app/domain/studentPerformance';
import crownLevelIcon from '../../mobile-app/assets/resources/student-level-icons/crown.png';
import moonLevelIcon from '../../mobile-app/assets/resources/student-level-icons/moon.png';
import starLevelIcon from '../../mobile-app/assets/resources/student-level-icons/star.png';
import sunLevelIcon from '../../mobile-app/assets/resources/student-level-icons/sun.png';

interface ClassroomStudentAvatarProps {
  name: string;
  avatar: string;
  level: StudentPerformanceLevel;
}

interface ClassroomStudentMetaProps {
  level: StudentPerformanceLevel;
  summary: StudentPerformanceSummary;
}

const TIER_META: Record<StudentPerformanceTier, { label: string; iconSrc: string }> = {
  star: { label: '星星', iconSrc: starLevelIcon },
  moon: { label: '月亮', iconSrc: moonLevelIcon },
  sun: { label: '太阳', iconSrc: sunLevelIcon },
  crown: { label: '皇冠', iconSrc: crownLevelIcon },
};

const RADIUS = 35;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const formatCount = (count: number) => count > 99 ? '99+' : String(count);

export const ClassroomStudentAvatar: React.FC<ClassroomStudentAvatarProps> = ({
  name,
  avatar,
  level,
}) => {
  const progressPercent = Math.round(level.progress * 100);
  const dashOffset = CIRCUMFERENCE * (1 - level.progress);

  return (
    <div
      role="img"
      aria-label={`${name}头像，下一枚等级图标进度${progressPercent}%`}
      className="relative h-[76px] w-[76px] shrink-0"
    >
      <svg aria-hidden="true" className="absolute inset-0 z-10 h-full w-full -rotate-90" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={RADIUS} fill="none" stroke="#e8edf3" strokeWidth="4" />
        <circle
          cx="38"
          cy="38"
          r={RADIUS}
          fill="none"
          stroke="#f2b84b"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth="4"
          className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
        />
      </svg>
      <img
        src={avatar}
        alt=""
        className="absolute inset-[7px] h-[62px] w-[62px] rounded-full object-cover"
      />
    </div>
  );
};

export const ClassroomStudentMeta: React.FC<ClassroomStudentMetaProps> = ({ level, summary }) => {
  const currentTier = TIER_META[level.tier];
  const currentLevelLabel = level.iconCount > 0
    ? `${level.iconCount}个${currentTier.label}`
    : '尚未点亮星星';
  const nextLevelLabel = level.isMaxLevel
    ? '已达到最高等级'
    : `下一枚${TIER_META[level.nextIconTier ?? level.tier].label}进度${Math.round(level.progress * 100)}%`;

  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <div
        aria-label={`${currentLevelLabel}，${nextLevelLabel}`}
        className="flex h-5 items-center justify-center"
      >
        {Array.from({ length: level.iconCount }, (_, index) => (
          <img
            key={`${level.tier}-${index}`}
            src={currentTier.iconSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-5 w-5 shrink-0 select-none object-contain"
          />
        ))}
      </div>
      <div
        aria-label={`被表扬${summary.praiseCount}次，被批评${summary.criticismCount}次`}
        className="flex h-5 items-center justify-center gap-2 text-[11px] font-black tabular-nums"
      >
        <span aria-hidden="true" className="flex h-5 min-w-7 items-center justify-center rounded-[5px] bg-emerald-50 px-1.5 text-emerald-600">
          {formatCount(summary.praiseCount)}
        </span>
        <span aria-hidden="true" className="flex h-5 min-w-7 items-center justify-center rounded-[5px] bg-rose-50 px-1.5 text-rose-500">
          {formatCount(summary.criticismCount)}
        </span>
      </div>
    </div>
  );
};
