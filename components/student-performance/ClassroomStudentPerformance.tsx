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
import ClassroomPerformanceValues, { formatScore } from '../classroom/ClassroomPerformanceValues';

interface ClassroomStudentAvatarProps {
  name: string;
  avatar: string;
  level: StudentPerformanceLevel;
  compact?: boolean;
  size?: number;
  showLevelProgress?: boolean;
}

interface ClassroomStudentMetaProps {
  level: StudentPerformanceLevel;
  summary: StudentPerformanceSummary;
  compact?: boolean;
  layout?: {
    iconSize?: number;
    countFontSize?: number;
    countItemHeight?: number;
    countItemMinWidth?: number;
    countGap?: number;
    gap?: number;
  };
}

interface ClassroomStudentLevelIconsProps {
  level: StudentPerformanceLevel;
  compact?: boolean;
  iconSize?: number;
}

interface ClassroomStudentLevelScoreProps {
  netScore: number;
  fontSize?: number;
  height?: number;
}

const TIER_META: Record<StudentPerformanceTier, { label: string; iconSrc: string }> = {
  star: { label: '星星', iconSrc: starLevelIcon },
  moon: { label: '月亮', iconSrc: moonLevelIcon },
  sun: { label: '太阳', iconSrc: sunLevelIcon },
  crown: { label: '皇冠', iconSrc: crownLevelIcon },
};

export const ClassroomStudentAvatar: React.FC<ClassroomStudentAvatarProps> = ({
  name,
  avatar,
  level,
  compact = false,
  size: requestedSize,
  showLevelProgress = true,
}) => {
  const size = requestedSize ?? (compact ? 68 : 76);
  const inset = compact ? Math.max(4, Math.round(size * 0.088)) : Math.max(6, Math.round(size * 0.092));
  const radius = size / 2 - inset / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.round(level.progress * 100);
  const dashOffset = circumference * (1 - level.progress);

  return (
    <div
      role="img"
      aria-label={showLevelProgress ? `${name}头像，下一枚等级图标进度${progressPercent}%` : `${name}头像`}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {showLevelProgress && (
        <svg aria-hidden="true" className="absolute inset-0 z-10 h-full w-full" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#edf1f5" strokeWidth={4} />
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
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
          />
        </svg>
      )}
      <img
        src={avatar}
        alt=""
        className="absolute rounded-full object-cover"
        style={{ inset, width: size - inset * 2, height: size - inset * 2 }}
      />
    </div>
  );
};

export const ClassroomStudentLevelIcons: React.FC<ClassroomStudentLevelIconsProps> = ({ level, compact = false, iconSize = 20 }) => {
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
      style={{ height: iconSize, minWidth: compact ? iconSize * 4 : undefined }}
    >
      {level.iconCount === 0 && (
        <img
          src={sproutLevelIcon}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="shrink-0 select-none object-contain"
          style={{ width: iconSize, height: iconSize }}
        />
      )}
      {Array.from({ length: level.iconCount }, (_, index) => (
        <img
          key={`${level.tier}-${index}`}
          src={currentTier.iconSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="shrink-0 select-none object-contain"
          style={{ width: iconSize, height: iconSize }}
        />
      ))}
    </div>
  );
};

export const ClassroomStudentLevelScore: React.FC<ClassroomStudentLevelScoreProps> = ({ netScore, fontSize = 20, height = 24 }) => {
  const normalizedScore = Number.isFinite(netScore) ? netScore : 0;
  const isNegative = normalizedScore < 0;

  return (
    <div
      aria-hidden="true"
      className={`flex min-w-[24px] items-center justify-center rounded-md px-1 font-bold tabular-nums ${isNegative ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}
      style={{ height, fontSize, lineHeight: 1 }}
    >
      {formatScore(normalizedScore)}
    </div>
  );
};

export const ClassroomStudentMeta: React.FC<ClassroomStudentMetaProps> = ({ level, summary, compact = false, layout }) => {
  const iconSize = layout?.iconSize ?? (compact ? 20 : 20);
  const countFontSize = layout?.countFontSize;
  const countItemHeight = layout?.countItemHeight;
  const countItemMinWidth = layout?.countItemMinWidth;
  const countGap = layout?.countGap;
  const gap = layout?.gap ?? (compact ? 4 : 6);
  if (compact) {
    return (
      <div className="flex w-full flex-col items-center" style={{ gap }}>
        <ClassroomStudentLevelIcons level={level} compact iconSize={iconSize} />
        <ClassroomPerformanceValues summary={summary} fontSize={countFontSize} itemHeight={countItemHeight} itemMinWidth={countItemMinWidth} gap={countGap} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center" style={{ gap }}>
      <ClassroomStudentLevelIcons level={level} iconSize={iconSize} />
      <ClassroomPerformanceValues summary={summary} fontSize={countFontSize} itemHeight={countItemHeight} itemMinWidth={countItemMinWidth} gap={countGap} />
    </div>
  );
};
