import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import './dashboardDonutChart.css';

export interface DashboardDonutDatum {
  name: string;
  value: number;
  color: string;
  gradient?: { from: string; to: string };
}

let runtime: Promise<typeof import('echarts/core')> | null = null;
const loadRuntime = () => runtime ??= Promise.all([
  import('echarts/core'), import('echarts/charts'), import('echarts/renderers'),
]).then(([core, charts, renderers]) => {
  core.use([charts.PieChart, renderers.CanvasRenderer]);
  return core;
}).catch(error => { runtime = null; throw error; });

/** 标准看板环形图配置，几何布局及分段均由ECharts负责。 */
export function createDashboardDonutOption(data: DashboardDonutDatum[]): EChartsCoreOption {
  return {
    animation: false,
    series: [{
      type: 'pie', radius: ['60%', '82%'], center: ['50%', '50%'],
      startAngle: 90, padAngle: 2, silent: true,
      stillShowZeroSum: false, label: { show: false }, labelLine: { show: false },
      emphasis: { disabled: true }, itemStyle: { borderRadius: 4 },
      data: data.map(item => ({ name: item.name, value: item.value, itemStyle: { color: item.gradient ? {
        type: 'linear' as const, x: 0, y: 0, x2: 1, y2: 1,
        colorStops: [{ offset: 0, color: item.gradient.from }, { offset: 1, color: item.gradient.to }],
      } : item.color } })),
    }],
  };
}

export function DashboardDonutChart({ data, ariaLabel, children }: {
  data: DashboardDonutDatum[]; ariaLabel: string; children?: ReactNode;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    loadRuntime().then(core => {
      const element = elementRef.current;
      if (disposed || !element) return;
      chartRef.current = core.init(element, undefined, { renderer: 'canvas' });
      resize = new ResizeObserver(() => chartRef.current?.resize());
      resize.observe(element);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; resize?.disconnect(); chartRef.current?.dispose(); chartRef.current = null; };
  }, []);
  useEffect(() => {
    const element = elementRef.current;
    const chart = chartRef.current;
    if (!ready || !element || !chart) return;
    const update = () => {
      const style = getComputedStyle(element);
      const resolve = (color: string) => {
        const variable = /^var\((--[\w-]+)\)$/.exec(color);
        return variable ? style.getPropertyValue(variable[1]).trim() : color;
      };
      chart.setOption(createDashboardDonutOption(data.map(item => {
        return { ...item, color: resolve(item.color), gradient: item.gradient ? { from: resolve(item.gradient.from), to: resolve(item.gradient.to) } : undefined };
      })), true);
    };
    update();
    const theme = new MutationObserver(update);
    theme.observe(element.closest('[data-theme]') ?? document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    return () => theme.disconnect();
  }, [data, ready]);
  return <div className="dashboard-donut-chart" role="img" aria-label={ariaLabel}>
    <div ref={elementRef} className="dashboard-donut-canvas" aria-hidden="true" />
    {ready ? children && <div className="dashboard-donut-center" aria-hidden="true">{children}</div> : <div className="dashboard-donut-status" role="status">{failed ? '图表暂不可用' : '图表加载中…'}</div>}
  </div>;
}
