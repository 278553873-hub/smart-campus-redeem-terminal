import React from 'react';
import type { StudentPerformanceLevel, StudentPerformanceSummary, StudentPerformanceTier } from '../../domain/studentPerformance';
import crownLevelIcon from '../../assets/resources/student-level-icons/crown.png';
import moonLevelIcon from '../../assets/resources/student-level-icons/moon.png';
import sproutLevelIcon from '../../assets/resources/student-level-icons/sprout.png';
import starLevelIcon from '../../assets/resources/student-level-icons/star.png';
import sunLevelIcon from '../../assets/resources/student-level-icons/sun.png';

interface StudentPerformanceMetaProps {
  level: StudentPerformanceLevel;
  summary: StudentPerformanceSummary;
}

interface StudentPerformanceLevelIconsProps {
  level: StudentPerformanceLevel;
  className?: string;
}

interface StudentPerformanceCountsProps {
  summary: Pick<StudentPerformanceSummary, 'praiseCount' | 'criticismCount'>;
  className?: string;
  ariaLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  showPraiseCount?: boolean;
  showCriticismCount?: boolean;
}

const TIER_META: Record<StudentPerformanceTier, { label: string; iconSrc: string }> = {
  star: { label: '星星', iconSrc: starLevelIcon },
  moon: { label: '月亮', iconSrc: moonLevelIcon },
  sun: { label: '太阳', iconSrc: sunLevelIcon },
  crown: { label: '皇冠', iconSrc: crownLevelIcon },
};

const formatCount = (count: number) => count > 99 ? '99+' : String(count);
const formatSignedCount = (count: number, sign: '+' | '-') => count === 0 ? '0' : `${sign}${formatCount(count)}`;

export const StudentPerformanceLevelIcons: React.FC<StudentPerformanceLevelIconsProps> = ({ level, className = '' }) => {
  const currentTier = TIER_META[level.tier];
  const levelLabel = level.iconCount > 0
    ? `${level.iconCount}个${currentTier.label}`
    : '尚未点亮星星';
  const nextLabel = level.isMaxLevel
    ? '已达到最高等级'
    : `下一枚${TIER_META[level.nextIconTier ?? level.tier].label}进度${Math.round(level.progress * 100)}%`;

  return (
    <span
      aria-label={`${levelLabel}，${nextLabel}`}
      className={`flex h-[18px] items-center justify-center ${className}`}
    >
      {level.iconCount === 0 && (
        <img
          src={sproutLevelIcon}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-[18px] w-[18px] shrink-0 select-none object-contain"
        />
      )}
      {Array.from({ length: level.iconCount }, (_, index) => (
        <img
          key={`${level.tier}-${index}`}
          src={currentTier.iconSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-[18px] w-[18px] shrink-0 select-none object-contain"
        />
      ))}
    </span>
  );
};

export const StudentPerformanceCounts: React.FC<StudentPerformanceCountsProps> = ({
  summary,
  className = '',
  ariaLabel,
  orientation = 'horizontal',
  showPraiseCount = true,
  showCriticismCount = true,
}) => {
  if (!showPraiseCount && !showCriticismCount) return null;

  const visibleCountLabel = [
    showPraiseCount ? `被表扬${summary.praiseCount}次` : '',
    showCriticismCount ? `被批评${summary.criticismCount}次` : '',
  ].filter(Boolean).join('，');

  return (
    <span
      aria-label={ariaLabel ?? visibleCountLabel}
      className={`flex items-center justify-center text-[10px] font-bold tabular-nums ${orientation === 'vertical' ? 'h-10 flex-col gap-1' : 'h-[18px] gap-1.5'} ${className}`}
    >
      {showPraiseCount && (
        <span aria-hidden="true" className="flex h-[18px] min-w-[24px] items-center justify-center rounded-[5px] bg-[var(--tm-student-praise-soft)] px-1 text-[var(--tm-student-praise)]">
          {formatSignedCount(summary.praiseCount, '+')}
        </span>
      )}
      {showCriticismCount && (
        <span aria-hidden="true" className="flex h-[18px] min-w-[24px] items-center justify-center rounded-[5px] bg-[var(--tm-student-criticism-soft)] px-1 text-[var(--tm-student-criticism)]">
          {formatSignedCount(summary.criticismCount, '-')}
        </span>
      )}
    </span>
  );
};

const StudentPerformanceMeta: React.FC<StudentPerformanceMetaProps> = ({ level, summary }) => (
  <span className="flex min-h-0 w-full flex-1 flex-col items-center">
    <StudentPerformanceLevelIcons level={level} className="mt-1" />
    <StudentPerformanceCounts summary={summary} className="mb-1 mt-auto" />
  </span>
);

export default StudentPerformanceMeta;
