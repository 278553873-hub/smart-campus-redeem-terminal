import React, { useEffect, useRef, useState } from 'react';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';

type EChartsRuntime = typeof import('echarts/core');

let teacherReportChartRuntimePromise: Promise<EChartsRuntime> | null = null;

const loadTeacherReportChartRuntime = async () => {
    if (!teacherReportChartRuntimePromise) {
        teacherReportChartRuntimePromise = Promise.all([
            import('echarts/core'),
            import('echarts/charts'),
            import('echarts/components'),
            import('echarts/renderers'),
        ]).then(([echartsCore, charts, components, renderers]) => {
            echartsCore.use([
                charts.BarChart,
                charts.PieChart,
                components.GridComponent,
                components.LegendComponent,
                components.TooltipComponent,
                renderers.CanvasRenderer,
            ]);
            return echartsCore;
        });
    }

    return teacherReportChartRuntimePromise;
};

export type TeacherReportChartColor =
    | 'brand'
    | 'secondary'
    | 'reward'
    | 'positive'
    | 'negative'
    | 'virtue'
    | 'wisdom'
    | 'fitness'
    | 'aesthetic'
    | 'labor'
    | 'peer'
    | 'total';

interface TeacherReportChartTheme {
    colors: Record<TeacherReportChartColor, string>;
    textPrimary: string;
    textSecondary: string;
    gridLine: string;
    tooltip: string;
    surface: string;
    mutedOpacity: number;
}

const readToken = (style: CSSStyleDeclaration, name: string) => style.getPropertyValue(name).trim();

const readChartTheme = (element: HTMLElement): TeacherReportChartTheme => {
    const style = getComputedStyle(element);

    return {
        colors: {
            brand: readToken(style, '--tm-brand-primary'),
            secondary: readToken(style, '--tm-brand-secondary'),
            reward: readToken(style, '--tm-brand-reward'),
            positive: readToken(style, '--tm-status-positive'),
            negative: readToken(style, '--tm-status-negative'),
            virtue: readToken(style, '--tm-edu-virtue'),
            wisdom: readToken(style, '--tm-edu-wisdom'),
            fitness: readToken(style, '--tm-edu-fitness'),
            aesthetic: readToken(style, '--tm-edu-aesthetic'),
            labor: readToken(style, '--tm-edu-labor'),
            peer: readToken(style, '--tm-chart-series-peer'),
            total: readToken(style, '--tm-chart-series-total'),
        },
        textPrimary: readToken(style, '--tm-text-primary'),
        textSecondary: readToken(style, '--tm-text-secondary'),
        gridLine: readToken(style, '--tm-chart-grid'),
        tooltip: readToken(style, '--tm-chart-tooltip'),
        surface: readToken(style, '--tm-bg-surface'),
        mutedOpacity: Number.parseFloat(readToken(style, '--tm-chart-series-muted-opacity')) || 0.4,
    };
};

interface TeacherReportChartProps {
    ariaLabel: string;
    className: string;
    optionKey: string;
    createOption: (theme: TeacherReportChartTheme) => EChartsCoreOption;
}

const TeacherReportChart: React.FC<TeacherReportChartProps> = ({
    ariaLabel,
    className,
    optionKey,
    createOption,
}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<EChartsType | null>(null);
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        if (!chartRef.current) return;

        let disposed = false;
        let resizeObserver: ResizeObserver | null = null;

        const loadChart = async () => {
            const echartsCore = await loadTeacherReportChartRuntime();
            if (disposed || !chartRef.current) return;

            const chart = echartsCore.init(chartRef.current, undefined, { renderer: 'canvas' });
            chartInstanceRef.current = chart;
            resizeObserver = new ResizeObserver(() => chart.resize());
            resizeObserver.observe(chartRef.current);
            setChartReady(true);
        };

        loadChart();

        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        const chart = chartInstanceRef.current;
        const element = chartRef.current;
        if (!chartReady || !chart || !element) return;

        chart.setOption(createOption(readChartTheme(element)), true);
    }, [chartReady, createOption, optionKey]);

    return (
        <div className={`relative ${className}`}>
            <div ref={chartRef} className="h-full w-full" role="img" aria-label={ariaLabel} />
            {!chartReady && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                    图表加载中...
                </div>
            )}
        </div>
    );
};

export interface TeacherReportBarSeries {
    name: string;
    values: number[];
    color: TeacherReportChartColor;
    // 弱化系列（如上周期）：同色系按 --tm-chart-series-muted-opacity 降低透明度。
    muted?: boolean;
}

interface TeacherReportBarChartProps {
    ariaLabel: string;
    categories: string[];
    series: TeacherReportBarSeries[];
    optionKey: string;
    className?: string;
    // 分类维度着色（如五育）：每个类目使用固定分类色，系列维度改用明度层级表达。
    categoryColors?: TeacherReportChartColor[];
}

export const TeacherReportBarChart: React.FC<TeacherReportBarChartProps> = ({
    ariaLabel,
    categories,
    series,
    optionKey,
    className = 'h-56',
    categoryColors,
}) => {
    const useCategoryColors = Boolean(categoryColors && categoryColors.length > 0);
    const createOption = React.useCallback((theme: TeacherReportChartTheme): EChartsCoreOption => ({
        animationDuration: 500,
        animationDurationUpdate: 250,
        color: series.map(item => theme.colors[item.color]),
        tooltip: {
            trigger: 'axis',
            backgroundColor: theme.tooltip,
            borderWidth: 0,
            textStyle: { color: theme.surface, fontSize: 12 },
            axisPointer: { type: 'shadow' },
        },
        legend: {
            top: 0,
            itemWidth: 12,
            itemHeight: 8,
            itemGap: 14,
            textStyle: { color: theme.textSecondary, fontSize: 11 },
            // 分类着色时，图例只表达系列维度：主角深色、弱化系列中灰、外部参照浅灰。
            ...(useCategoryColors ? {
                data: series.map(item => ({
                    name: item.name,
                    itemStyle: {
                        color: item.color === 'peer' ? theme.colors.peer : (item.muted ? theme.textSecondary : theme.textPrimary),
                    },
                })),
            } : {}),
        },
        grid: { left: 38, right: 8, top: 42, bottom: 30 },
        xAxis: {
            type: 'category',
            data: categories,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: theme.gridLine } },
            axisLabel: { color: theme.textSecondary, fontSize: 11, interval: 0 },
        },
        yAxis: {
            type: 'value',
            min: 0,
            splitNumber: 4,
            axisLabel: { color: theme.textSecondary, fontSize: 10 },
            splitLine: { lineStyle: { color: theme.gridLine, type: 'dashed' } },
        },
        series: series.map(item => ({
            name: item.name,
            type: 'bar',
            data: useCategoryColors && item.color !== 'peer'
                ? item.values.map((value, index) => ({
                    value,
                    itemStyle: { color: theme.colors[categoryColors![index]] },
                }))
                : item.values,
            barMaxWidth: 22,
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                opacity: item.muted ? theme.mutedOpacity : 1,
            },
            label: {
                show: true,
                position: 'top',
                color: item.muted || item.color === 'peer'
                    ? theme.textSecondary
                    : (useCategoryColors ? theme.textPrimary : theme.colors[item.color]),
                fontSize: 9,
                fontWeight: 600,
            },
        })),
    }), [categories, series, useCategoryColors, categoryColors]);

    return (
        <TeacherReportChart
            ariaLabel={ariaLabel}
            className={className}
            optionKey={optionKey}
            createOption={createOption}
        />
    );
};

export interface TeacherReportDonutDatum {
    name: string;
    value: number;
    color: TeacherReportChartColor;
}

interface TeacherReportDonutChartProps {
    ariaLabel: string;
    data: TeacherReportDonutDatum[];
    optionKey: string;
    className?: string;
}

export const TeacherReportDonutChart: React.FC<TeacherReportDonutChartProps> = ({
    ariaLabel,
    data,
    optionKey,
    className = 'h-64',
}) => {
    const createOption = React.useCallback((theme: TeacherReportChartTheme): EChartsCoreOption => ({
        animationDuration: 500,
        color: data.map(item => theme.colors[item.color]),
        tooltip: {
            trigger: 'item',
            backgroundColor: theme.tooltip,
            borderWidth: 0,
            textStyle: { color: theme.surface, fontSize: 12 },
            formatter: '{b}<br/>{c}条 · {d}%',
        },
        legend: {
            left: 'center',
            bottom: 0,
            width: '94%',
            itemWidth: 10,
            itemHeight: 8,
            itemGap: 10,
            textStyle: { color: theme.textSecondary, fontSize: 11 },
        },
        series: [{
            name: '五育事件',
            type: 'pie',
            center: ['50%', '43%'],
            radius: ['43%', '66%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: theme.surface, borderWidth: 2, borderRadius: 3 },
            label: {
                color: theme.textSecondary,
                fontSize: 10,
                formatter: ({ percent }: { percent?: number }) => `${percent ?? 0}%`,
            },
            labelLine: { length: 8, length2: 6 },
            data: data.map(item => ({ name: item.name, value: item.value })),
        }],
    }), [data]);

    return (
        <TeacherReportChart
            ariaLabel={ariaLabel}
            className={className}
            optionKey={optionKey}
            createOption={createOption}
        />
    );
};
