import React from 'react';
import type { GroupPerformanceSummary } from '../../domain/groupPerformance';
import type { EvaluationCardValueMode } from '../../types';
import { StudentPerformanceValues } from '../student-performance/StudentPerformanceMeta';

interface GroupPerformanceMetaProps {
  summary: GroupPerformanceSummary;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showPraise?: boolean;
  showCriticism?: boolean;
  valueMode?: EvaluationCardValueMode;
  fontSize?: number;
  itemHeight?: number;
  itemMinWidth?: number;
  gap?: number;
}

const GroupPerformanceMeta: React.FC<GroupPerformanceMetaProps> = ({
  summary,
  className = '',
  orientation = 'horizontal',
  showPraise = true,
  showCriticism = true,
  valueMode = 'count',
  fontSize,
  itemHeight,
  itemMinWidth,
  gap,
}) => {
  const visibleValueLabel = [
    showPraise ? (valueMode === 'score' ? `累计加分${summary.praiseScore}分` : `被表扬${summary.praiseCount}次`) : '',
    showCriticism ? (valueMode === 'score' ? `累计扣分${summary.criticismScore}分` : `被批评${summary.criticismCount}次`) : '',
  ].filter(Boolean).join('，');

  return (
    <StudentPerformanceValues
      summary={summary}
      ariaLabel={`小组${visibleValueLabel}`}
      className={className}
      orientation={orientation}
      showPraise={showPraise}
      showCriticism={showCriticism}
      valueMode={valueMode}
      fontSize={fontSize}
      itemHeight={itemHeight}
      itemMinWidth={itemMinWidth}
      gap={gap}
    />
  );
};

export default GroupPerformanceMeta;
