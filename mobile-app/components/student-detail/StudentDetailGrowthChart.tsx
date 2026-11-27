import React, { useId, useMemo, useState } from 'react';
import type { TeacherIndicatorLevelOne } from '../../data/teacherIndicatorCatalog';
import { getStudentGrowthTrend, getStudentIndicatorTotalScore, type StudentGrowthPeriod } from '../../domain/studentDetailGrowth';
import type { ScoreItem } from '../../types';
import type { StudentEvaluationRecord } from '../../views/student-evaluation/types';
import { TeacherReportLineChart, type TeacherReportLineSeries } from '../report/TeacherReportChart';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';
import type { StudentTermOption } from './StudentTermSelector';
import './StudentDetailGrowthChart.css';

interface StudentDetailGrowthChartProps {
    indicators: readonly TeacherIndicatorLevelOne[];
    scores: readonly ScoreItem[];
    records: readonly StudentEvaluationRecord[];
    term: StudentTermOption;
    totalScore: number;
}

const PERIOD_OPTIONS = [
    { value: 'week', label: '按周' },
    { value: 'month', label: '按月' },
] satisfies ReadonlyArray<{ value: StudentGrowthPeriod; label: string }>;

function getAxisRange(values: readonly number[]) {
    const lowest = Math.min(...values);
    const highest = Math.max(...values);
    const padding = Math.max(2, (highest - lowest) / 5);
    const roughStep = (highest - lowest + 2 * padding) / 3;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const step = ([1, 2, 5, 10].find(interval => interval * magnitude >= roughStep) ?? 10) * magnitude;
    const minValue = Math.floor((lowest - padding) / step) * step;
    return {
        minValue: lowest >= 0 ? Math.max(0, minValue) : minValue,
        maxValue: Math.ceil((highest + padding) / step) * step,
    };
}

export default function StudentDetailGrowthChart({ indicators, scores, records, term, totalScore }: StudentDetailGrowthChartProps) {
    const titleId = useId();
    const [period, setPeriod] = useState<StudentGrowthPeriod>('week');
    const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>();
    const indicator = indicators.find(item => item.id === selectedIndicatorId) ?? indicators[0];
    const { categories, series } = useMemo(() => {
        const trend = indicator ? getStudentGrowthTrend({ records, indicator, scores, term, period }) : [];
        const series: TeacherReportLineSeries[] = indicator && trend.length
            ? [{ name: indicator.name, values: trend.map(point => point.value), color: 'reward' }]
            : [];
        return { categories: trend.map(point => point.label), series };
    }, [records, indicator, scores, term, period]);
    const chartSummary = series[0]?.values.map((value, index) => `${categories[index]} ${value} 分`).join('，');
    const isZeroTrend = series[0]?.values.every(value => value === 0) ?? false;

    return (
        <section className="student-detail-growth" aria-labelledby={titleId}>
            <div className="student-detail-growth-header">
                <h2 id={titleId} className="student-detail-growth-title">五育成长曲线</h2>
                <div className="student-detail-growth-summary">
                    <p className="student-detail-growth-total">总分 <strong>{Number(totalScore.toFixed(10))}</strong></p>
                    <CompactSegmentedControl<StudentGrowthPeriod>
                        className="student-detail-growth-period teacher-mobile-gold-period"
                        value={period}
                        items={PERIOD_OPTIONS}
                        onChange={setPeriod}
                        ariaLabel="成长曲线统计周期"
                        semantics="group"
                        density="compact"
                        shape="pill"
                        motion="sliding"
                        fullWidth
                    />
                </div>
            </div>
            {indicators.length > 0 && (
                <div className="student-detail-growth-indicators" role="group" aria-label="成长曲线一级指标">
                    {indicators.map(item => {
                        const total = Number(getStudentIndicatorTotalScore(scores, item).toFixed(10));
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className="student-detail-growth-indicator"
                                aria-label={`${item.name} ${total} 分`}
                                aria-pressed={item.id === indicator?.id}
                                onClick={() => setSelectedIndicatorId(item.id)}
                            >
                                <span className="student-detail-growth-indicator-pill">
                                    {item.name} <span className="student-detail-growth-indicator-score">{total}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
            {indicator && series.length > 0 ? (
                <TeacherReportLineChart
                    ariaLabel={`${indicator.name}${period === 'week' ? '按周' : '按月'}累计积分，${chartSummary}`}
                    className="student-detail-growth-plot"
                    categories={categories}
                    series={series}
                    optionKey={`${term.value}:${period}:${indicator.id}`}
                    valueLabelSuffix=" 分"
                    highlightLastValue
                    showValueLabels={isZeroTrend}
                    {...getAxisRange(series[0].values)}
                />
            ) : (
                <p className="student-detail-growth-empty" role="status">{indicator ? `暂无${indicator.name}积分记录` : '暂无积分记录'}</p>
            )}
        </section>
    );
}
