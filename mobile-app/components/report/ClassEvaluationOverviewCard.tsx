import React from "react";
import type { ClassReportOverview } from "../../domain/classEvaluationReport";

interface ClassEvaluationOverviewCardProps {
  overview: ClassReportOverview;
}

const ClassEvaluationOverviewCard: React.FC<ClassEvaluationOverviewCardProps> = ({
  overview,
}) => {
  const hasRecords = overview.totalCount > 0;

  return (
    <section
      className="class-report-v2-overview rounded-[var(--tm-radius-inner)] p-3.5 [box-shadow:var(--tm-shadow-card-ambient)]"
      aria-label="当前周期评价统计"
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className="class-report-v2-stat-tile class-report-v2-stat-tile--positive rounded-[12px] px-3 py-3">
          <span className="flex items-center gap-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--tm-chart-positive)]"
            />
            表扬
          </span>
          <p className="mt-2.5 flex items-baseline gap-1">
            <strong className="text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[var(--tm-text-primary)]">
              {overview.positiveCount}
            </strong>
            <span className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
              条
            </span>
          </p>
        </div>

        <div className="class-report-v2-stat-tile class-report-v2-stat-tile--negative rounded-[12px] px-3 py-3">
          <span className="flex items-center gap-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--tm-chart-negative)]"
            />
            待改进
          </span>
          <p className="mt-2.5 flex items-baseline gap-1">
            <strong className="text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[var(--tm-text-primary)]">
              {overview.negativeCount}
            </strong>
            <span className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
              条
            </span>
          </p>
        </div>
      </div>

      {hasRecords && (
        <div className="mt-3">
          <div
            className="class-report-v2-ratio-bar flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            {overview.positiveRatio > 0 && (
              <span
                className="class-report-v2-ratio-bar-positive h-full rounded-full transition-[width] [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none"
                style={{ width: `${overview.positiveRatio}%` }}
              />
            )}
            {overview.negativeRatio > 0 && (
              <span
                className="class-report-v2-ratio-bar-negative h-full rounded-full transition-[width] [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none"
                style={{ width: `${overview.negativeRatio}%` }}
              />
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[length:var(--tm-font-size-meta)] font-semibold tabular-nums">
            <span className="text-[var(--tm-chart-positive-text)]">
              {overview.positiveRatio}%
            </span>
            <span className="text-[var(--tm-chart-negative-text)]">
              {overview.negativeRatio}%
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClassEvaluationOverviewCard;
