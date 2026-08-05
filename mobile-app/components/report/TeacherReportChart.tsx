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
    | 'data'
    | 'brand'
    | 'secondary'
    | 'reward'
    | 'positive'
    | 'warning'
    | 'negative'
    | 'virtue'
    | 'wisdom'
    | 'fitness'
    | 'aesthetic'
    | 'labor'
    | 'indicator1'
    | 'indicator2'
    | 'indicator3'
    | 'indicator4'
    | 'indicator5'
    | 'indicator6'
    | 'peer'
    | 'total';

interface TeacherReportChartTheme {
    colors: Record<TeacherReportChartColor, string>;
    labelColors: Record<TeacherReportChartColor, string>;
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
            data: readToken(style, '--tm-chart-data-default'),
            brand: readToken(style, '--tm-brand-primary'),
            secondary: readToken(style, '--tm-brand-secondary'),
            reward: readToken(style, '--tm-brand-reward'),
            positive: readToken(style, '--tm-chart-positive'),
            warning: readToken(style, '--tm-chart-warning'),
            negative: readToken(style, '--tm-chart-negative'),
            virtue: readToken(style, '--tm-chart-edu-virtue'),
            wisdom: readToken(style, '--tm-chart-edu-wisdom'),
            fitness: readToken(style, '--tm-chart-edu-fitness'),
            aesthetic: readToken(style, '--tm-chart-edu-aesthetic'),
            labor: readToken(style, '--tm-chart-edu-labor'),
            indicator1: readToken(style, '--tm-chart-indicator-1'),
            indicator2: readToken(style, '--tm-chart-indicator-2'),
            indicator3: readToken(style, '--tm-chart-indicator-3'),
            indicator4: readToken(style, '--tm-chart-indicator-4'),
            indicator5: readToken(style, '--tm-chart-indicator-5'),
            indicator6: readToken(style, '--tm-chart-indicator-6'),
            peer: readToken(style, '--tm-chart-series-peer'),
            total: readToken(style, '--tm-chart-series-total'),
        },
        labelColors: {
            data: readToken(style, '--tm-chart-data-default-text'),
            brand: readToken(style, '--tm-brand-primary-strong'),
            secondary: readToken(style, '--tm-brand-secondary-strong'),
            reward: readToken(style, '--tm-brand-reward-strong'),
            positive: readToken(style, '--tm-chart-positive-text'),
            warning: readToken(style, '--tm-chart-warning-text'),
            negative: readToken(style, '--tm-chart-negative-text'),
            virtue: readToken(style, '--tm-text-primary'),
            wisdom: readToken(style, '--tm-text-primary'),
            fitness: readToken(style, '--tm-text-primary'),
            aesthetic: readToken(style, '--tm-text-primary'),
            labor: readToken(style, '--tm-text-primary'),
            indicator1: readToken(style, '--tm-text-primary'),
            indicator2: readToken(style, '--tm-text-primary'),
            indicator3: readToken(style, '--tm-text-primary'),
            indicator4: readToken(style, '--tm-text-primary'),
            indicator5: readToken(style, '--tm-text-primary'),
            indicator6: readToken(style, '--tm-text-primary'),
            peer: readToken(style, '--tm-text-secondary'),
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
    onItemSelect?: (name: string) => void;
}

const TeacherReportChart: React.FC<TeacherReportChartProps> = ({
    ariaLabel,
    className,
    optionKey,
    createOption,
    onItemSelect,
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

    useEffect(() => {
        const chart = chartInstanceRef.current;
        if (!chartReady || !chart || !onItemSelect) return undefined;

        const handleItemSelect = (params: {
            componentType?: string;
            name?: string;
            value?: string | number;
        }) => {
            if (params.componentType === 'series' && params.name) {
                onItemSelect(params.name);
                return;
            }

            if (params.componentType === 'xAxis' && typeof params.value === 'string') {
                onItemSelect(params.value);
            }
        };
        chart.on('click', handleItemSelect);
        return () => {
            if (!chart.isDisposed()) chart.off('click', handleItemSelect);
        };
    }, [chartReady, onItemSelect]);

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
    // 柱顶已有精确值时，可关闭手机端冗余的纵轴标尺与网格。
    showValueAxis?: boolean;
    showLegend?: boolean;
    valueLabelSuffix?: string;
    onCategorySelect?: (name: string) => void;
}

export const TeacherReportBarChart: React.FC<TeacherReportBarChartProps> = ({
    ariaLabel,
    categories,
    series,
    optionKey,
    className = 'h-56',
    categoryColors,
    showValueAxis = true,
    showLegend = true,
    valueLabelSuffix = '',
    onCategorySelect,
}) => {
    const useCategoryColors = Boolean(categoryColors && categoryColors.length > 0);
    const hasNegativeValue = series.some(item => item.values.some(value => value < 0));
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
            show: showLegend,
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
        grid: { left: showValueAxis ? 38 : 8, right: 8, top: showLegend ? 42 : 10, bottom: 30 },
        xAxis: {
            type: 'category',
            data: categories,
            triggerEvent: Boolean(onCategorySelect),
            axisTick: { show: false },
            axisLine: { lineStyle: { color: theme.gridLine } },
            axisLabel: {
                color: theme.textPrimary,
                fontSize: 11,
                fontWeight: onCategorySelect ? 600 : 400,
                interval: 0,
                formatter: onCategorySelect ? (value: string) => `{label|${value}} {arrow|›}` : undefined,
                rich: onCategorySelect ? {
                    label: { color: theme.textPrimary, fontSize: 11, fontWeight: 600 },
                    arrow: { color: theme.textSecondary, fontSize: 11, fontWeight: 400 },
                } : undefined,
            },
        },
        yAxis: {
            type: 'value',
            min: hasNegativeValue ? undefined : 0,
            splitNumber: 4,
            axisLabel: { show: showValueAxis, color: theme.textSecondary, fontSize: 10 },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: {
                show: showValueAxis,
                lineStyle: { color: theme.gridLine, type: 'dashed' },
            },
        },
        series: series.map(item => ({
            name: item.name,
            type: 'bar',
            cursor: onCategorySelect ? 'pointer' : 'default',
            data: item.values.map((value, index) => ({
                value,
                ...(useCategoryColors && item.color !== 'peer'
                    ? { itemStyle: { color: theme.colors[categoryColors![index]] } }
                    : {}),
                label: {
                    position: value < 0 ? 'bottom' : 'top',
                    ...(useCategoryColors && !item.muted && item.color !== 'peer'
                        ? { color: theme.labelColors[categoryColors![index]] }
                        : {}),
                },
            })),
            barMaxWidth: showValueAxis ? 22 : 16,
            barGap: showValueAxis ? '30%' : '100%',
            barMinHeight: 2,
            itemStyle: {
                borderRadius: [4, 4, 0, 0],
                opacity: item.muted ? theme.mutedOpacity : 1,
            },
            emphasis: onCategorySelect ? {
                itemStyle: { opacity: 0.72 },
            } : undefined,
            label: {
                show: true,
                position: 'top',
                formatter: `{c}${valueLabelSuffix}`,
                color: item.muted || item.color === 'peer'
                    ? theme.textSecondary
                    : (useCategoryColors ? theme.textPrimary : theme.labelColors[item.color]),
                fontSize: showValueAxis ? 9 : 10,
                fontWeight: 600,
            },
        })),
    }), [categories, series, useCategoryColors, categoryColors, hasNegativeValue, showValueAxis, showLegend, valueLabelSuffix, onCategorySelect]);

    return (
        <TeacherReportChart
            ariaLabel={ariaLabel}
            className={className}
            optionKey={optionKey}
            createOption={createOption}
            onItemSelect={onCategorySelect}
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
    onCategorySelect?: (name: string) => void;
}

export const TeacherReportDonutChart: React.FC<TeacherReportDonutChartProps> = ({
    ariaLabel,
    data,
    optionKey,
    className = 'h-64',
    onCategorySelect,
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
            cursor: onCategorySelect ? 'pointer' : 'default',
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
    }), [data, onCategorySelect]);

    return (
        <TeacherReportChart
            ariaLabel={ariaLabel}
            className={className}
            optionKey={optionKey}
            createOption={createOption}
            onItemSelect={onCategorySelect}
        />
    );
};
