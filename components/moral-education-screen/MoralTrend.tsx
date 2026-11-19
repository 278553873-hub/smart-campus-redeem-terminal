import React, { useId } from 'react';
import type { MoralScreenSnapshot } from './moralEducationScreenModel';
import { MoralScreenPanel as Panel, formatMoralNumber as number } from './MoralScreenPanel';
import { MORAL_TREND_METRICS, useMoralTrendPlayback, type MoralTrendMetric } from './useMoralTrendPlayback';
import { MoralPanelTabs } from './MoralPanelTabs';
import { useChartSize } from '../charts/useChartSize';

export function MoralTrendChart({ snapshot, metric }: { snapshot: MoralScreenSnapshot; metric: MoralTrendMetric }) {
  const points = snapshot.trend;
  const { ref, width, height } = useChartSize({ width: 520, height: 238 });
  const gradientId = `moral-trend-${useId().replace(/:/g, '')}`;
  if (!points.length) return <p className="moral-empty">暂无班级评价数据</p>;
  const values = points.map(point => point[metric]);
  const maximum = metric === 'averageScore' ? Math.max(1, snapshot.summary.maxScore, ...values) : Math.max(1, ...values);
  const minimum = metric === 'averageScore' ? Math.max(0, Math.floor(Math.min(...values) - 1)) : 0;
  const bottom = Math.max(35, height - 34);
  const x = (index: number) => 48 + index / Math.max(1, points.length - 1) * Math.max(1, width - 92);
  const y = (value: number) => bottom - (value - minimum) / Math.max(1, maximum - minimum) * Math.max(1, bottom - 34);
  const label = MORAL_TREND_METRICS.find(item => item.id === metric)!.label;
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point[metric])}`).join(' ');
  const area = `${path} L${x(points.length - 1)},${bottom} L${x(0)},${bottom} Z`;
  return <div ref={ref} className="moral-trend-plot"><svg viewBox={`0 0 ${width} ${height}`} role="img" data-metric={metric} aria-label={`${label}趋势：${points.map(point => `${point.label}，${number(point[metric])}分`).join('；')}`}>
    <defs>
      <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--moral-trend-color)" stopOpacity=".28" /><stop offset="1" stopColor="var(--moral-trend-color)" stopOpacity=".02" /></linearGradient>
      <linearGradient id={`${gradientId}-number`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--screen-gold-light)" /><stop offset=".5" stopColor="var(--screen-gold-highlight)" /><stop offset="1" stopColor="var(--screen-gold-deep)" /></linearGradient>
    </defs>
    {[minimum, (minimum + maximum) / 2, maximum].map(value => <g key={value} aria-hidden="true"><line x1="48" x2={width - 16} y1={y(value)} y2={y(value)} className="moral-trend-grid" /><text x="40" y={y(value) + 5} textAnchor="end" className="moral-trend-axis">{number(value)}</text></g>)}
    <path d={area} fill={`url(#${gradientId}-area)`} className="moral-trend-area" />
    <path d={path} className="moral-trend-line" />
    {points.map((point, index) => <g key={point.label}>
      {index === points.length - 1 && <circle cx={x(index)} cy={y(point[metric])} r="10" className="moral-trend-latest-halo" />}
      <circle cx={x(index)} cy={y(point[metric])} r={index === points.length - 1 ? 6 : 4} className="moral-trend-dot" /><text x={x(index)} y={y(point[metric]) - 14} textAnchor="middle" className={`moral-trend-value${index === points.length - 1 ? ' is-latest' : ''}`} fill={index === points.length - 1 ? `url(#${gradientId}-number)` : undefined}>{number(point[metric])}</text>
      <text x={x(index)} y={height - 6} textAnchor="middle" className="moral-trend-axis">{point.label}</text>
    </g>)}
  </svg></div>;
}

export function MoralTrend({ snapshot, active = true }: { snapshot: MoralScreenSnapshot; active?: boolean }) {
  const id = `moral-trend-${useId().replace(/:/g, '')}`;
  const { metric, setMetric } = useMoralTrendPlayback(active && snapshot.trend.length > 0);
  return <Panel title="德育趋势" className="moral-trend" action={<MoralPanelTabs id={id} ariaLabel="德育趋势指标" items={MORAL_TREND_METRICS} value={metric} onChange={setMetric} />}>
    <div id={`${id}-content`} className="moral-trend-chart" role="tabpanel" aria-labelledby={`${id}-${metric}`}><MoralTrendChart snapshot={snapshot} metric={metric} /></div>
  </Panel>;
}
