import React from 'react';
import type {
    RecordDistributionComparisonRow,
    RecordDistributionOverview,
} from '../../domain/classReportChartSummary';

interface RecordDistributionComparisonProps {
    overview: RecordDistributionOverview;
}

interface RecordDistributionDetailsProps {
    rows: RecordDistributionComparisonRow[];
}

const toneTextClasses: Record<RecordDistributionComparisonRow['tone'], string> = {
    positive: 'text-[var(--tm-chart-positive-text)]',
    negative: 'text-[var(--tm-chart-negative-text)]',
};

const RecordDistributionComparison: React.FC<RecordDistributionComparisonProps> = ({ overview }) => (
    <div
        role="img"
        aria-label={`本周期正向事件占${overview.positivePercentage}%，负向事件占${overview.negativePercentage}%`}
    >
        <div className="flex h-4 overflow-hidden rounded-[4px] bg-[var(--tm-bg-surface-muted)]" aria-hidden="true">
            <span
                className="h-full bg-[var(--tm-chart-positive)]"
                style={{ width: `${overview.positivePercentage}%` }}
            />
            <span
                className="h-full bg-[var(--tm-chart-negative)]"
                style={{ width: `${overview.negativePercentage}%` }}
            />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="flex items-baseline gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--tm-chart-positive)]" />
                <span className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">正向</span>
                <strong className="ml-auto text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums text-[var(--tm-chart-positive-text)]">
                    {overview.positivePercentage}%
                </strong>
            </div>
            <div className="flex items-baseline gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--tm-chart-negative)]" />
                <span className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">负向</span>
                <strong className="ml-auto text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums text-[var(--tm-chart-negative-text)]">
                    {overview.negativePercentage}%
                </strong>
            </div>
        </div>
    </div>
);

export const RecordDistributionDetails: React.FC<RecordDistributionDetailsProps> = ({ rows }) => (
    <table className="w-full table-fixed border-collapse" aria-label="本周期、上周期和年级平均的评价记录数量对比">
        <caption className="sr-only">评价记录数量对比，单位为条</caption>
        <colgroup>
            <col className="w-[31%]" />
            <col className="w-[23%]" />
            <col className="w-[23%]" />
            <col className="w-[23%]" />
        </colgroup>
        <thead>
            <tr className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                <th scope="col" className="px-1 pb-2.5 text-left font-normal">事件类型</th>
                <th scope="col" className="px-1 pb-2.5 text-center font-semibold text-[var(--tm-text-primary)]">本周期</th>
                <th scope="col" className="px-1 pb-2.5 text-center font-normal">上周期</th>
                <th scope="col" className="whitespace-nowrap px-1 pb-2.5 text-center font-normal">年级平均</th>
            </tr>
        </thead>
        <tbody className="border-t border-[var(--tm-border-subtle)]">
            {rows.map((row, index) => (
                <tr key={row.key} className={index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : undefined}>
                    <th
                        scope="row"
                        className={`whitespace-nowrap px-1 py-4 text-left text-[length:var(--tm-font-size-body)] font-medium ${toneTextClasses[row.tone]}`}
                    >
                        {row.label}
                    </th>
                    <td className="whitespace-nowrap px-1 py-4 text-center text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)]">
                        {row.current}条
                    </td>
                    <td className="whitespace-nowrap px-1 py-4 text-center text-[length:var(--tm-font-size-body)] font-normal tabular-nums text-[var(--tm-text-secondary)]">
                        {row.previous}条
                    </td>
                    <td className="whitespace-nowrap px-1 py-4 text-center text-[length:var(--tm-font-size-body)] font-normal tabular-nums text-[var(--tm-text-secondary)]">
                        {row.gradeAverage}条
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default RecordDistributionComparison;
