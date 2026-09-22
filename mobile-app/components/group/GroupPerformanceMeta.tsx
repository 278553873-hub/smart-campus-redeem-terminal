import React from 'react';
import type { GroupPerformanceSummary } from '../../domain/groupPerformance';
import { StudentPerformanceValues } from '../student-performance/StudentPerformanceMeta';

interface GroupPerformanceMetaProps {
  summary: GroupPerformanceSummary;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showPraise?: boolean;
  showCriticism?: boolean;
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
  fontSize,
  itemHeight,
  itemMinWidth,
  gap,
}) => {
  const visibleValueLabel = [
    showPraise ? `累计表扬${summary.praiseScore}分` : '',
    showCriticism ? `累计待改进${summary.criticismScore}分` : '',
  ].filter(Boolean).join('，');

  return (
    <StudentPerformanceValues
      summary={summary}
      ariaLabel={`小组${visibleValueLabel}`}
      className={className}
      orientation={orientation}
      showPraise={showPraise}
      showCriticism={showCriticism}
      fontSize={fontSize}
      itemHeight={itemHeight}
      itemMinWidth={itemMinWidth}
      gap={gap}
    />
  );
};

export default GroupPerformanceMeta;
