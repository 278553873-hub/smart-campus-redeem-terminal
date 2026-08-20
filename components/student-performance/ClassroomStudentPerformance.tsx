import React from 'react';
import type {
  StudentPerformanceLevel,
  StudentPerformanceSummary,
  StudentPerformanceTier,
} from '../../mobile-app/domain/studentPerformance';
import crownLevelIcon from '../../mobile-app/assets/resources/student-level-icons/crown.png';
import moonLevelIcon from '../../mobile-app/assets/resources/student-level-icons/moon.png';
import sproutLevelIcon from '../../mobile-app/assets/resources/student-level-icons/sprout.png';
import starLevelIcon from '../../mobile-app/assets/resources/student-level-icons/star.png';
import sunLevelIcon from '../../mobile-app/assets/resources/student-level-icons/sun.png';

interface ClassroomStudentAvatarProps {
  name: string;
  avatar: string;
  level: StudentPerformanceLevel;
  compact?: boolean;
}

interface ClassroomStudentMetaProps {
  level: StudentPerformanceLevel;
  summary: StudentPerformanceSummary;
  compact?: boolean;
}

interface ClassroomStudentLevelIconsProps {
  level: StudentPerformanceLevel;
  compact?: boolean;
}

interface ClassroomStudentCountsProps {
  summary: StudentPerformanceSummary;
  compact?: boolean;
}

const TIER_META: Record<StudentPerformanceTier, { label: string; iconSrc: string }> = {
  star: { label: '星星', iconSrc: starLevelIcon },
  moon: { label: '月亮', iconSrc: moonLevelIcon },
  sun: { label: '太阳', iconSrc: sunLevelIcon },
  crown: { label: '皇冠', iconSrc: crownLevelIcon },
};

const formatCount = (count: number) => count > 99 ? '99+' : String(count);
const formatSignedCount = (count: number, sign: '+' | '-') => count === 0 ? '0' : `${sign}${formatCount(count)}`;

export const ClassroomStudentAvatar: React.FC<ClassroomStudentAvatarProps> = ({
  name,
  avatar,
  level,
  compact = false,
}) => {
  const size = compact ? 68 : 76;
  const radius = compact ? 32 : 35;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.round(level.progress * 100);
  const dashOffset = circumference * (1 - level.progress);

  return (
    <div
      role="img"
      aria-label={`${name}头像，下一枚等级图标进度${progressPercent}%`}
      className={`relative shrink-0 ${compact ? 'h-[68px] w-[68px]' : 'h-[76px] w-[76px]'}`}
    >
      <svg aria-hidden="true" className="absolute inset-0 z-10 h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2eaf3" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f2b84b"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={4}
          className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
        />
      </svg>
      <img
        src={avatar}
        alt=""
        className={`absolute rounded-full object-cover ${compact ? 'inset-1.5 h-14 w-14' : 'inset-[7px] h-[62px] w-[62px]'}`}
      />
    </div>
  );
};

export const ClassroomStudentLevelIcons: React.FC<ClassroomStudentLevelIconsProps> = ({ level, compact = false }) => {
  const currentTier = TIER_META[level.tier];
  const currentLevelLabel = level.iconCount > 0
    ? `${level.iconCount}个${currentTier.label}`
    : '尚未点亮星星';
  const nextLevelLabel = level.isMaxLevel
    ? '已达到最高等级'
    : `下一枚${TIER_META[level.nextIconTier ?? level.tier].label}进度${Math.round(level.progress * 100)}%`;

  return (
    <div
      aria-label={`${currentLevelLabel}，${nextLevelLabel}`}
      className={`flex items-center justify-center ${compact ? 'h-5 min-w-20 gap-0' : 'h-5'}`}
    >
      {level.iconCount === 0 && (
        <img
          src={sproutLevelIcon}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-5 w-5 shrink-0 select-none object-contain"
        />
      )}
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
  );
};

export const ClassroomStudentCounts: React.FC<ClassroomStudentCountsProps> = ({ summary, compact = false }) => (
  <div
    aria-label={`被表扬${summary.praiseCount}次，被批评${summary.criticismCount}次`}
    className={`flex items-center justify-center font-black tabular-nums ${compact ? 'h-[18px] w-full gap-2 text-[10px]' : 'h-5 gap-2 text-[11px]'}`}
  >
    <span aria-hidden="true" className={`flex items-center justify-center bg-emerald-50 text-emerald-600 ${compact ? 'h-[18px] min-w-6 rounded-md px-1' : 'h-5 min-w-7 rounded-[5px] px-1.5'}`}>
      {formatSignedCount(summary.praiseCount, '+')}
    </span>
    <span aria-hidden="true" className={`flex items-center justify-center bg-rose-50 text-rose-500 ${compact ? 'h-[18px] min-w-6 rounded-md px-1' : 'h-5 min-w-7 rounded-[5px] px-1.5'}`}>
      {formatSignedCount(summary.criticismCount, '-')}
    </span>
  </div>
);

export const ClassroomStudentMeta: React.FC<ClassroomStudentMetaProps> = ({ level, summary, compact = false }) => {
  if (compact) {
    return (
      <div className="flex w-full flex-col items-center gap-1">
        <ClassroomStudentLevelIcons level={level} compact />
        <ClassroomStudentCounts summary={summary} compact />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <ClassroomStudentLevelIcons level={level} />
      <ClassroomStudentCounts summary={summary} />
    </div>
  );
};
