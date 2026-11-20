import React, { useEffect, useId, useState } from 'react';
import { percentage, type ScreenFiveEducationStat } from './studentEvaluationScreenModel';
import { formatScreenNumber } from './StudentEvaluationCharts';
import { HERO_SELECTION, useHeroSectorMotion } from './useHeroSectorMotion';

const COLORS = {
  virtue: ['#ffd77c', '#f5a623', '#a05c12'],
  wisdom: ['#b4f5da', '#78c9ad', '#356b5a'],
  fitness: ['#c4e4ff', '#76a9df', '#355e93'],
  aesthetic: ['#e1c3ff', '#b080d3', '#654481'],
  labor: ['#fffdf7', '#e7e5df', '#8f8a81'],
  innovation: ['#ffe1eb', '#e49dbb', '#88506a'],
} as const;
const point = (radius: number, angle: number) => [320 + radius * Math.cos(angle), 286 + radius * Math.sin(angle)];
const position = (radius: number, angle: number) => point(radius, angle).map(value => value.toFixed(3)).join(',');
const arc = (radius: number, start: number, end: number, clockwise = true) => {
  const mid = (start + end) / 2;
  return `A${radius},${radius} 0 0,${clockwise ? 1 : 0} ${position(radius, mid)} A${radius},${radius} 0 0,${clockwise ? 1 : 0} ${position(radius, end)}`;
};

export const getHeroSectorTransform = (angle: number, progress: number) => {
  const offset = HERO_SELECTION.offset * progress;
  return `translate(${Math.cos(angle) * offset} ${Math.sin(angle) * offset})`;
};

export const getHeroSectorPath = (start: number, end: number, progress: number) => {
  const radius = 221 + HERO_SELECTION.radiusGrowth * progress;
  return `M${position(radius, start)} ${arc(radius, start, end)} L${position(153, end)} ${arc(153, end, start, false)}Z`;
};

export const getHeroCalloutLayout = (angle: number, progress = 1) => {
  const right = Math.cos(angle) >= 0;
  const radius = 221 + (HERO_SELECTION.radiusGrowth + HERO_SELECTION.offset) * progress;
  const start = point(radius + 3, angle);
  const elbow = point(221 + HERO_SELECTION.radiusGrowth + HERO_SELECTION.offset + 25, angle);
  const titleY = Math.max(58, Math.min(354, elbow[1] - 12));
  const left = right ? 596 : -164;
  const end = left + 208;
  const anchorX = right ? left : end;
  return { right, left, end, anchorX, titleY, start, elbow, points: `${start.join(',')} ${elbow.join(',')} ${anchorX},${titleY + 14}` };
};

export function FiveEducationHero({ dimensions, visible = true, reducedMotion = false }: {
  dimensions: ScreenFiveEducationStat[]; visible?: boolean; reducedMotion?: boolean;
}) {
  const id = `school-pc-hero-${useId().replace(/:/g, '')}`;
  const [activeKey, setActiveKey] = useState(dimensions[0]?.key);
  const [interacting, setInteracting] = useState(false);
  const total = dimensions.reduce((sum, item) => sum + item.eventCount, 0);
  const describeDimension = (item: ScreenFiveEducationStat) => `${item.name}${percentage(item.eventCount, total)}%，${item.eventCount}条事件，总加分${item.plusScore}分，加分学生数${item.positiveStudentCount}人`;
  const active = dimensions.find(item => item.key === activeKey && item.eventCount > 0) ?? dimensions.find(item => item.eventCount > 0);
  const keys = dimensions.filter(item => item.eventCount > 0).map(item => item.key).join(',');
  const emphasis = useHeroSectorMotion(active?.key, keys, visible && !reducedMotion);
  useEffect(() => {
    if (!visible || reducedMotion || interacting || !keys) return;
    const values = keys.split(',') as ScreenFiveEducationStat['key'][];
    const timer = window.setInterval(() => setActiveKey(previous => values[(values.indexOf(previous!) + 1) % values.length]), 3600);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion, interacting, keys]);
  let cursor = -Math.PI / 2;
  const sectors = dimensions.filter(item => item.eventCount > 0).map(item => {
    const start = cursor;
    cursor += item.eventCount / total * Math.PI * 2;
    const gap = item.eventCount < total ? Math.min(.007, (cursor - start) / 5) : 0;
    const path = getHeroSectorPath(start + gap, cursor - gap, emphasis[item.key] ?? 0);
    return { ...item, path, middle: (start + cursor) / 2 };
  });
  const activeSector = sectors.find(item => item.key === active?.key);
  const callout = activeSector ? getHeroCalloutLayout(activeSector.middle, emphasis[activeSector.key] ?? 0) : null;
  const calloutMetrics = active ? [
    { label: '事件占比', value: percentage(active.eventCount, total), unit: '%', primary: true },
    { label: '事件条数', value: active.eventCount, unit: '条' },
    { label: '总加分', value: active.plusScore, unit: '分', positive: true },
    { label: '加分学生数', value: active.positiveStudentCount, unit: '人' },
  ] : [];
  return <section className="school-pc-evaluation-screen-panel school-pc-evaluation-screen-hero" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}><span className="school-pc-evaluation-screen-hero-heading-text">五育并举，全面成长</span></h2>
    {!total ? <p className="school-pc-evaluation-screen-empty">本周期暂无已归类的五育记录</p> : <>
      <div className="school-pc-evaluation-screen-hero-visual">
        <svg viewBox="-184 -20 1008 630" role="img" aria-label={`五育事件占比：${dimensions.map(describeDimension).join('；')}`} onPointerLeave={() => setInteracting(false)}>
          <defs>
            {sectors.map(item => <linearGradient key={item.key} id={`${id}-${item.key}`} x1=".2" y1="0" x2=".9" y2="1"><stop stopColor={COLORS[item.key][0]} /><stop offset=".25" stopColor={COLORS[item.key][1]} /><stop offset=".68" stopColor={COLORS[item.key][1]} /><stop offset="1" stopColor={COLORS[item.key][2]} /></linearGradient>)}
            <radialGradient id={`${id}-core`}><stop stopColor="#17120d" stopOpacity=".15" /><stop offset=".88" stopColor="#0a0807" stopOpacity=".65" /><stop offset="1" stopColor="#ffb94a" stopOpacity=".14" /></radialGradient>
            <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffffff" stopOpacity=".6" /><stop offset=".22" stopColor="#ffffff" stopOpacity="0" /><stop offset=".75" stopColor="#ffffff" stopOpacity="0" /><stop offset="1" stopColor="#ffffff" stopOpacity=".3" /></linearGradient>
            <linearGradient id={`${id}-halo`}><stop stopColor="#b76d1d" stopOpacity="0" /><stop offset=".2" stopColor="#e8a33f" stopOpacity=".5" /><stop offset=".5" stopColor="#ffe3aa" /><stop offset=".8" stopColor="#e8a33f" stopOpacity=".5" /><stop offset="1" stopColor="#b76d1d" stopOpacity="0" /></linearGradient>
            <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" /></filter>
            <pattern id={`${id}-groove`} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 1H3" stroke="#f8dab3" strokeOpacity=".045" strokeWidth=".5" /></pattern>
          </defs>
          <ellipse cx="320" cy="535" rx="257" ry="22" fill="none" stroke={`url(#${id}-halo)`} strokeWidth="7" filter={`url(#${id}-glow)`} />
          <ellipse cx="320" cy="535" rx="257" ry="22" fill="none" stroke={`url(#${id}-halo)`} strokeWidth="1.8" />
          <ellipse cx="320" cy="537" rx="286" ry="28" fill="none" stroke="#d4943245" strokeWidth=".7" />
          <circle cx="320" cy="286" r="253" fill="none" stroke="#d59f3b38" />
          {Array.from({ length: 120 }, (_, index) => {
            const angle = index / 120 * Math.PI * 2 - Math.PI / 2;
            const [x1, y1] = point(index % 5 === 0 ? 240 : 244, angle);
            const [x2, y2] = point(248, angle);
            return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8b858" strokeWidth={index % 5 === 0 ? 1.3 : .7} opacity={index % 5 === 0 ? .8 : .35} />;
          })}
          <circle cx="320" cy="286" r="149" fill={`url(#${id}-core)`} stroke="#d29d535e" />
          <circle cx="320" cy="286" r="146" fill={`url(#${id}-groove)`} />
          {sectors.map(item => {
            const selected = item.key === active?.key;
            return <g key={item.key} className={`school-pc-evaluation-screen-hero-sector${selected ? ' is-active' : ''}`} data-education={item.key}
              transform={getHeroSectorTransform(item.middle, emphasis[item.key] ?? 0)}
              onPointerEnter={() => { setInteracting(true); setActiveKey(item.key); }} onClick={() => setActiveKey(item.key)}>
              <title>{describeDimension(item)}</title>
              <path d={item.path} transform="translate(0 5)" fill={COLORS[item.key][2]} stroke="#060605" strokeWidth="2" />
              <path d={item.path} fill={`url(#${id}-${item.key})`} stroke={COLORS[item.key][0]} strokeWidth="1.6" />
              <path d={item.path} fill={`url(#${id}-sheen)`} stroke="#fff7e8" strokeOpacity=".25" strokeWidth=".6" />
            </g>;
          })}
          <circle cx="320" cy="286" r="151" fill="none" stroke="#ffc366" strokeOpacity=".45" strokeWidth="3" filter={`url(#${id}-glow)`} />
          <text x="320" y="252" textAnchor="middle" className="school-pc-evaluation-screen-hero-core-label">五育事件总数</text>
          <text x="320" y="326" textAnchor="middle" className="school-pc-evaluation-screen-hero-total">{formatScreenNumber(total)}<tspan>条</tspan></text>
          {active && callout && <g key={active.key} className="school-pc-evaluation-screen-hero-callout" style={{ '--education-color': COLORS[active.key][1] } as React.CSSProperties}>
            <polyline className="school-pc-evaluation-screen-hero-leader" points={callout.points} />
            <circle cx={callout.start[0]} cy={callout.start[1]} r="3.5" className="school-pc-evaluation-screen-hero-leader-dot" />
            <circle cx={callout.anchorX} cy={callout.titleY + 14} r="2.5" className="school-pc-evaluation-screen-hero-leader-dot" />
            <text x={callout.anchorX} y={callout.titleY} textAnchor={callout.right ? 'start' : 'end'} className="school-pc-evaluation-screen-hero-callout-name">{active.name}</text>
            {calloutMetrics.map((metric, index) => <g key={metric.label}>
              <text x={callout.left} y={callout.titleY + 54 + index * 38} className="school-pc-evaluation-screen-hero-stat-label">{metric.label}</text>
              <text x={callout.end} y={callout.titleY + 54 + index * 38} textAnchor="end" className={`school-pc-evaluation-screen-hero-stat-number${metric.positive ? ' is-positive' : ''}${metric.primary ? ' is-primary' : ''}`}>{metric.positive ? '+' : ''}{formatScreenNumber(metric.value)}<tspan>{metric.unit}</tspan></text>
            </g>)}
          </g>}
        </svg>
      </div>
      <div className="school-pc-evaluation-screen-hero-legend" aria-label="选择五育类别">
        {dimensions.map(item => <button key={item.key} type="button" className={`education-${item.key}`} style={{ '--education-color': COLORS[item.key][1] } as React.CSSProperties} aria-pressed={item.key === active?.key}
          aria-label={describeDimension(item)}
          onClick={() => setActiveKey(item.key)} onPointerEnter={() => { setInteracting(true); setActiveKey(item.key); }} onPointerLeave={() => setInteracting(false)}
          onFocus={() => { setInteracting(true); setActiveKey(item.key); }} onBlur={() => setInteracting(false)}>
          <span className="school-pc-evaluation-screen-hero-legend-label"><i aria-hidden="true" />{item.name}</span><strong>{formatScreenNumber(item.eventCount)}<small>条</small></strong>
        </button>)}
      </div>
    </>}
  </section>;
}
