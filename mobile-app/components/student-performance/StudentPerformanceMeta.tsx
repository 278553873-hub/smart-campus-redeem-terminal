import React from 'react';
import type { StudentPerformanceLevel, StudentPerformanceSummary, StudentPerformanceTier } from '../../domain/studentPerformance';
import crownLevelIcon from '../../assets/resources/student-level-icons/crown.png';
import moonLevelIcon from '../../assets/resources/student-level-icons/moon.png';
import starLevelIcon from '../../assets/resources/student-level-icons/star.png';
import sunLevelIcon from '../../assets/resources/student-level-icons/sun.png';

interface StudentPerformanceMetaProps {
  level: StudentPerformanceLevel;
  summary: StudentPerformanceSummary;
}

const TIER_META: Record<StudentPerformanceTier, { label: string; iconSrc: string }> = {
  star: { label: '星星', iconSrc: starLevelIcon },
  moon: { label: '月亮', iconSrc: moonLevelIcon },
  sun: { label: '太阳', iconSrc: sunLevelIcon },
  crown: { label: '皇冠', iconSrc: crownLevelIcon },
};

const formatCount = (count: number) => count > 99 ? '99+' : String(count);

const StudentPerformanceMeta: React.FC<StudentPerformanceMetaProps> = ({ level, summary }) => {
  const currentTier = TIER_META[level.tier];
  const levelLabel = level.iconCount > 0
    ? `${level.iconCount}个${currentTier.label}`
    : '尚未点亮星星';
  const nextLabel = level.isMaxLevel
    ? '已达到最高等级'
    : `下一枚${TIER_META[level.nextIconTier ?? level.tier].label}进度${Math.round(level.progress * 100)}%`;

  return (
    <span className="flex min-h-0 w-full flex-1 flex-col items-center">
      <span
        aria-label={`${levelLabel}，${nextLabel}`}
        className="mt-0.5 flex h-4 items-center justify-center"
      >
        {Array.from({ length: level.iconCount }, (_, index) => (
          <img
            key={`${level.tier}-${index}`}
            src={currentTier.iconSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-4 w-4 shrink-0 select-none object-contain"
          />
        ))}
      </span>

      <span
        aria-label={`被表扬${summary.praiseCount}次，被批评${summary.criticismCount}次`}
        className="mb-1.5 mt-auto flex h-[18px] items-center justify-center gap-2 text-[10px] font-bold tabular-nums"
      >
        <span aria-hidden="true" className="flex h-[18px] min-w-[24px] items-center justify-center rounded-[5px] bg-[var(--tm-student-praise-soft)] px-1 text-[var(--tm-student-praise)]">
          {formatCount(summary.praiseCount)}
        </span>
        <span aria-hidden="true" className="flex h-[18px] min-w-[24px] items-center justify-center rounded-[5px] bg-[var(--tm-student-criticism-soft)] px-1 text-[var(--tm-student-criticism)]">
          {formatCount(summary.criticismCount)}
        </span>
      </span>
    </span>
  );
};

export default StudentPerformanceMeta;
