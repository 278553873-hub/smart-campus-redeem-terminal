import React from 'react';
import type { EvaluationCardValueMode } from '../../mobile-app/types';

interface ClassroomPerformanceSummary {
  praiseCount: number;
  criticismCount: number;
  praiseScore: number;
  criticismScore: number;
}

interface ClassroomPerformanceValuesProps {
  summary: ClassroomPerformanceSummary;
  ariaLabelPrefix?: string;
  showPraise?: boolean;
  showCriticism?: boolean;
  valueMode?: EvaluationCardValueMode;
  fontSize?: number;
  itemHeight?: number;
  itemMinWidth?: number;
  gap?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const formatCount = (count: number) => count > 99 ? '99+' : String(count);
const formatSignedCount = (count: number, sign: '+' | '-') => count === 0 ? '0' : `${sign}${formatCount(count)}`;
export const formatScore = (score: number) => Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/\.?0+$/, '');
const formatSignedScore = (score: number, sign: '+' | '-') => score === 0 ? '0' : `${sign}${formatScore(score)}`;

const ClassroomPerformanceValues: React.FC<ClassroomPerformanceValuesProps> = ({
  summary,
  ariaLabelPrefix = '',
  showPraise = true,
  showCriticism = true,
  valueMode = 'count',
  fontSize = 11,
  itemHeight = 18,
  itemMinWidth = 24,
  gap = 8,
  orientation = 'horizontal',
  className = '',
}) => {
  const visibleValueLabels = [
    showPraise ? (valueMode === 'score' ? `累计加分${summary.praiseScore}分` : `被表扬${summary.praiseCount}次`) : '',
    showCriticism ? (valueMode === 'score' ? `累计扣分${summary.criticismScore}分` : `被批评${summary.criticismCount}次`) : '',
  ].filter(Boolean);

  if (visibleValueLabels.length === 0) return null;

  return (
    <div
      aria-label={`${ariaLabelPrefix}${visibleValueLabels.join('，')}`}
      className={`flex shrink-0 items-center justify-center font-sans font-bold tabular-nums ${orientation === 'vertical' ? 'flex-col' : ''} ${className}`}
      style={{
        height: orientation === 'vertical'
          ? itemHeight * visibleValueLabels.length + gap * Math.max(0, visibleValueLabels.length - 1)
          : itemHeight,
        gap,
        fontSize,
      }}
    >
      {showPraise && (
        <span
          aria-hidden="true"
          className="flex items-center justify-center rounded-md bg-emerald-50 px-1 text-emerald-700"
          style={{ height: itemHeight, minWidth: itemMinWidth }}
        >
          {valueMode === 'score' ? formatSignedScore(summary.praiseScore, '+') : formatSignedCount(summary.praiseCount, '+')}
        </span>
      )}
      {showCriticism && (
        <span
          aria-hidden="true"
          className="flex items-center justify-center rounded-md bg-rose-50 px-1 text-rose-700"
          style={{ height: itemHeight, minWidth: itemMinWidth }}
        >
          {valueMode === 'score' ? formatSignedScore(summary.criticismScore, '-') : formatSignedCount(summary.criticismCount, '-')}
        </span>
      )}
    </div>
  );
};

export default ClassroomPerformanceValues;
