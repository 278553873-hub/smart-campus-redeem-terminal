import React from 'react';

const ReportScoreLegend = () => (
  <div aria-label="得分图例" className="flex h-8 items-center justify-end gap-3 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-secondary)]">
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--tm-chart-positive)]" />
      表扬
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--tm-chart-negative)]" />
      待改进
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--tm-chart-data-default)]" />
      总分
    </span>
  </div>
);

export default ReportScoreLegend;
