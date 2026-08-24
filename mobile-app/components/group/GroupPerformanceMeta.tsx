import React from 'react';
import type { StudentPerformanceSummary } from '../../domain/studentPerformance';
import { getStudentPerformanceLevel } from '../../domain/studentPerformance';
import {
  StudentPerformanceCounts,
  StudentPerformanceLevelIcons,
} from '../student-performance/StudentPerformanceMeta';

interface GroupPerformanceMetaProps {
  summary: StudentPerformanceSummary;
  layout?: 'stacked' | 'inline';
  className?: string;
}

const GroupPerformanceMeta: React.FC<GroupPerformanceMetaProps> = ({
  summary,
  layout = 'stacked',
  className = '',
}) => {
  const level = getStudentPerformanceLevel(summary.netScore);

  return (
    <span
      className={`${layout === 'inline' ? 'flex items-center gap-2' : 'flex flex-col items-center gap-1'} ${className}`}
      aria-label={`小组等级，正向评价${summary.praiseCount}次，负向评价${summary.criticismCount}次`}
    >
      <StudentPerformanceLevelIcons level={level} />
      <StudentPerformanceCounts summary={summary} />
    </span>
  );
};

export default GroupPerformanceMeta;
