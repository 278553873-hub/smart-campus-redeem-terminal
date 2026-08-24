import React from 'react';
import type { GroupPerformanceSummary } from '../../domain/groupPerformance';
import { StudentPerformanceCounts } from '../student-performance/StudentPerformanceMeta';

interface GroupPerformanceMetaProps {
  summary: GroupPerformanceSummary;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showPraiseCount?: boolean;
  showCriticismCount?: boolean;
}

const GroupPerformanceMeta: React.FC<GroupPerformanceMetaProps> = ({
  summary,
  className = '',
  orientation = 'horizontal',
  showPraiseCount = true,
  showCriticismCount = true,
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
    />
  );
};

export default GroupPerformanceMeta;
