import React from 'react';
import type { StudentPerformanceLevel, StudentPerformanceSummary, StudentPerformanceTier } from '../../domain/studentPerformance';
import type { EvaluationCardValueMode } from '../../types';
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
  iconSize?: 'default' | 'student-card';
}

interface StudentPerformanceValuesProps {
  summary: Pick<StudentPerformanceSummary, 'praiseCount' | 'criticismCount' | 'praiseScore' | 'criticismScore'>;
  className?: string;
  ariaLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'student-card';
  showPraise?: boolean;
  showCriticism?: boolean;
  valueMode?: EvaluationCardValueMode;
  fontSize?: number;
  itemHeight?: number;
  itemMinWidth?: number;
  gap?: number;
}

const TIER_META: Record<StudentPerformanceTier, { label: string; iconSrc: string }> = {
  star: { label: '星星', iconSrc: starLevelIcon },
  moon: { label: '月亮', iconSrc: moonLevelIcon },
  sun: { label: '太阳', iconSrc: sunLevelIcon },
  crown: { label: '皇冠', iconSrc: crownLevelIcon },
};

const formatCount = (count: number) => count > 99 ? '99+' : String(count);
const formatSignedCount = (count: number, sign: '+' | '-') => count === 0 ? '0' : `${sign}${formatCount(count)}`;
const formatScore = (score: number) => Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/\.?0+$/, '');
const formatSignedScore = (score: number, sign: '+' | '-') => score === 0 ? '0' : `${sign}${formatScore(score)}`;

export const StudentPerformanceLevelIcons: React.FC<StudentPerformanceLevelIconsProps> = ({
  level,
  className = '',
  iconSize = 'default',
}) => {
  const currentTier = TIER_META[level.tier];
  const iconSizeClass = iconSize === 'student-card'
    ? 'h-[var(--tm-student-card-level-icon-size)] w-[var(--tm-student-card-level-icon-size)]'
    : 'h-[18px] w-[18px]';
  const rowHeightClass = iconSize === 'student-card'
    ? 'h-[var(--tm-student-card-level-row-height)]'
    : 'h-[18px]';
  const levelLabel = level.iconCount > 0
    ? `${level.iconCount}个${currentTier.label}`
    : '尚未点亮星星';
  const nextLabel = level.isMaxLevel
    ? '已达到最高等级'
    : `下一枚${TIER_META[level.nextIconTier ?? level.tier].label}进度${Math.round(level.progress * 100)}%`;

  return (
    <span
      aria-label={`${levelLabel}，${nextLabel}`}
      className={`flex ${rowHeightClass} items-center justify-center ${className}`}
    >
      {level.iconCount === 0 && (
        <img
          src={sproutLevelIcon}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`${iconSizeClass} shrink-0 select-none object-contain`}
        />
      )}
      {Array.from({ length: level.iconCount }, (_, index) => (
        <img
          key={`${level.tier}-${index}`}
          src={currentTier.iconSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`${iconSizeClass} shrink-0 select-none object-contain`}
        />
      ))}
    </span>
  );
};

interface StudentPerformanceLevelScoreProps {
  netScore: number;
  className?: string;
}

export const StudentPerformanceLevelScore: React.FC<StudentPerformanceLevelScoreProps> = ({
  netScore,
  className = '',
}) => {
  const normalizedScore = Number.isFinite(netScore) ? netScore : 0;
  const isNegative = normalizedScore < 0;

  return (
    <span
      aria-hidden="true"
      className={`flex h-[var(--tm-student-card-level-row-height)] min-w-[24px] items-center justify-center rounded-[5px] px-1 tabular-nums text-[length:var(--tm-student-card-level-score-font-size)] font-bold ${isNegative ? 'bg-[var(--tm-student-criticism-soft)] text-[var(--tm-student-criticism)]' : 'bg-[var(--tm-student-level-score-soft)] text-[var(--tm-student-level-score)]'} ${className}`}
    >
      {formatScore(normalizedScore)}
    </span>
  );
};

export const StudentPerformanceValues: React.FC<StudentPerformanceValuesProps> = ({
  summary,
  className = '',
  ariaLabel,
  orientation = 'horizontal',
  variant = 'default',
  showPraise = true,
  showCriticism = true,
  valueMode = 'count',
  fontSize,
  itemHeight,
  itemMinWidth,
  gap,
}) => {
  if (!showPraise && !showCriticism) return null;

  const isStudentCard = variant === 'student-card';
  const visibleValueCount = [showPraise, showCriticism].filter(Boolean).length;
  const verticalHeight = itemHeight
    ? itemHeight * visibleValueCount + (gap ?? 4) * Math.max(0, visibleValueCount - 1)
    : undefined;
  const typographyClass = isStudentCard
    ? 'text-[length:var(--tm-student-card-count-font-size)] font-bold'
    : 'text-[10px] font-bold';
  const horizontalHeightClass = isStudentCard ? 'h-[var(--tm-student-card-count-height)]' : 'h-[18px]';
  const chipHeightClass = isStudentCard ? 'h-[var(--tm-student-card-count-height)]' : 'h-[18px]';

  const visibleValueLabel = [
    showPraise ? (valueMode === 'score' ? `累计加分${summary.praiseScore}分` : `被表扬${summary.praiseCount}次`) : '',
    showCriticism ? (valueMode === 'score' ? `累计扣分${summary.criticismScore}分` : `被批评${summary.criticismCount}次`) : '',
  ].filter(Boolean).join('，');

  return (
    <span
      aria-label={ariaLabel ?? visibleValueLabel}
      className={`flex items-center justify-center tabular-nums ${typographyClass} ${orientation === 'vertical' ? 'min-h-10 flex-col' : `${horizontalHeightClass}`} ${className}`}
      style={{
        ...(fontSize ? { fontSize } : {}),
        ...(orientation === 'vertical' ? { height: verticalHeight, gap: gap ?? 4 } : { gap: gap ?? 6 }),
      }}
    >
      {showPraise && (
        <span aria-hidden="true" className={`flex min-w-[24px] items-center justify-center rounded-[5px] bg-[var(--tm-student-praise-soft,#ecfdf5)] px-1 text-[var(--tm-student-praise,#059669)] ${chipHeightClass}`} style={{ height: itemHeight, minWidth: itemMinWidth }}>
          {valueMode === 'score' ? formatSignedScore(summary.praiseScore, '+') : formatSignedCount(summary.praiseCount, '+')}
        </span>
      )}
      {showCriticism && (
        <span aria-hidden="true" className={`flex min-w-[24px] items-center justify-center rounded-[5px] bg-[var(--tm-student-criticism-soft)] px-1 text-[var(--tm-student-criticism)] ${chipHeightClass}`} style={{ height: itemHeight, minWidth: itemMinWidth }}>
          {valueMode === 'score' ? formatSignedScore(summary.criticismScore, '-') : formatSignedCount(summary.criticismCount, '-')}
        </span>
      )}
    </span>
  );
};

const StudentPerformanceMeta: React.FC<StudentPerformanceMetaProps> = ({ level, summary }) => (
  <span className="flex min-h-0 w-full flex-1 flex-col items-center">
    <StudentPerformanceLevelIcons level={level} className="mt-1" />
    <StudentPerformanceValues summary={summary} className="mb-1 mt-auto" />
  </span>
);

export default StudentPerformanceMeta;
