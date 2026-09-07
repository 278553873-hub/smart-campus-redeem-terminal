import React from 'react';
import type { GroupPerformanceSummary } from '../../domain/groupPerformance';
import { StudentPerformanceCounts } from '../student-performance/StudentPerformanceMeta';

interface GroupPerformanceMetaProps {
  summary: GroupPerformanceSummary;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showPraiseCount?: boolean;
  showCriticismCount?: boolean;
  fontSize?: number;
  itemHeight?: number;
  itemMinWidth?: number;
  gap?: number;
}

const GroupPerformanceMeta: React.FC<GroupPerformanceMetaProps> = ({
  summary,
  className = '',
  orientation = 'horizontal',
  showPraiseCount = true,
  showCriticismCount = true,
  fontSize,
  itemHeight,
  itemMinWidth,
  gap,
}) => {
  const visibleCountLabel = [
    showPraiseCount ? `被表扬${summary.praiseCount}次` : '',
    showCriticismCount ? `被批评${summary.criticismCount}次` : '',
  ].filter(Boolean).join('，');

  return (
    <StudentPerformanceCounts
      summary={summary}
      ariaLabel={`小组${visibleCountLabel}`}
      className={className}
      orientation={orientation}
      showPraiseCount={showPraiseCount}
      showCriticismCount={showCriticismCount}
      fontSize={fontSize}
      itemHeight={itemHeight}
      itemMinWidth={itemMinWidth}
      gap={gap}
    />
  );
};

export default GroupPerformanceMeta;
