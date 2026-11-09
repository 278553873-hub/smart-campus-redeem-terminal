import React, { useEffect, useId, useState } from 'react';
import type { LeaderReportFiveEducationStat } from '../../mobile-app/services/leaderReportService';
import { percentage } from './studentEvaluationScreenModel';
import { formatScreenNumber } from './StudentEvaluationCharts';

const HERO_ROTATION_INTERVAL = 3600;
const CENTER = { x: 300, y: 300 };
const OUTER_RADIUS = 260;
const INNER_RADIUS = 220;
const pointAt = (radius: number, angle: number) => `${(CENTER.x + radius * Math.cos(angle)).toFixed(3)},${(CENTER.y + radius * Math.sin(angle)).toFixed(3)}`;

// 拆为两段圆弧，保证单一类别占满100%时仍能绘制完整圆环。
const arc = (radius: number, start: number, end: number, clockwise = true) => {
  const middle = (start + end) / 2;
  return `A${radius},${radius} 0 0,${clockwise ? 1 : 0} ${pointAt(radius, middle)} A${radius},${radius} 0 0,${clockwise ? 1 : 0} ${pointAt(radius, end)}`;
};
const createSegments = (dimensions: LeaderReportFiveEducationStat[], total: number) => {
  let angle = -Math.PI / 2;
  return dimensions.filter(item => item.eventCount > 0).map(item => {
    const start = angle;
    angle += item.eventCount / total * Math.PI * 2;
    return {
      ...item,
      path: `M${pointAt(OUTER_RADIUS, start)} ${arc(OUTER_RADIUS, start, angle)} L${pointAt(INNER_RADIUS, angle)} ${arc(INNER_RADIUS, angle, start, false)} Z`,
      categoryEdge: `M${pointAt(265, start)} ${arc(265, start, angle)}`,
    };
  });
};

export const FiveEducationHero = ({ dimensions, visible, reducedMotion }: {
  dimensions: LeaderReportFiveEducationStat[]; visible: boolean; reducedMotion: boolean;
}) => {
  const gradientId = useId().replace(/:/g, '');
  const [activeKey, setActiveKey] = useState(dimensions[0]?.key);
  const [interacting, setInteracting] = useState(false);
  const total = dimensions.reduce((sum, item) => sum + item.eventCount, 0);
  const hasRecords = total > 0;
  const active = dimensions.find(item => item.key === activeKey) ?? dimensions[0];
  const dimensionKeys = dimensions.map(item => item.key).join(',');
  const segments = hasRecords ? createSegments(dimensions, total) : [];

  useEffect(() => {
    if (!visible || reducedMotion || interacting || !hasRecords) return;
    const keys = dimensionKeys.split(',') as LeaderReportFiveEducationStat['key'][];
    const timer = window.setInterval(() => setActiveKey(previous => keys[(keys.indexOf(previous!) + 1) % keys.length]), HERO_ROTATION_INTERVAL);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion, interacting, hasRecords, dimensionKeys]);

  return <section className="demo-evaluation-screen-panel demo-evaluation-screen-hero" aria-labelledby="demo-five-education-title">
    <div className="demo-evaluation-screen-hero-heading"><h2 id="demo-five-education-title">五育事件占比</h2></div>
    {!hasRecords ? <p className="demo-evaluation-screen-empty">本周期暂无已归类的五育记录</p> : <>
      <div className="demo-evaluation-screen-hero-visual">
        <div className="demo-evaluation-screen-hero-chart" role="img" aria-label={`五育事件分布，共${total}条。${dimensions.map(item => `${item.name}${item.eventCount}条，占${percentage(item.eventCount, total)}%`).join('；')}`}>
          <svg viewBox="0 0 600 600" aria-hidden="true" focusable="false" onPointerLeave={() => setInteracting(false)}>
            <defs>
              <linearGradient id={`${gradientId}-ivory`} x1="0" y1="0" x2=".65" y2="1">
                <stop offset="0%" stopColor="#fff9ed" /><stop offset="38%" stopColor="#dfd9ce" /><stop offset="100%" stopColor="#928b80" />
              </linearGradient>
              <linearGradient id={`${gradientId}-gold`} x1="0" y1="0" x2=".65" y2="1">
                <stop offset="0%" stopColor="var(--es-accent-light)" /><stop offset="45%" stopColor="var(--es-accent)" /><stop offset="100%" stopColor="#b66a21" />
              </linearGradient>
              <radialGradient id={`${gradientId}-center`}>
                <stop offset="0%" stopColor="var(--es-bg)" stopOpacity=".2" /><stop offset="100%" stopColor="var(--es-bg)" stopOpacity=".04" />
              </radialGradient>
            </defs>
            <circle cx="300" cy="300" r="274" className="demo-evaluation-screen-hero-rim" />
            <circle cx="300" cy="300" r="212" fill={`url(#${gradientId}-center)`} className="demo-evaluation-screen-hero-inner-rim" />
            {segments.map(item => <g key={item.key} className={`demo-evaluation-screen-hero-sector education-${item.key} ${item.key === active?.key ? 'is-active' : ''}`} onPointerEnter={() => { setInteracting(true); setActiveKey(item.key); }} onClick={() => setActiveKey(item.key)}>
              <path data-education={item.key} d={item.path} fill={`url(#${gradientId}-ivory)`} className="demo-evaluation-screen-hero-segment" />
              <path d={item.path} fill={`url(#${gradientId}-gold)`} className="demo-evaluation-screen-hero-focus" />
              <path d={item.path} className="demo-evaluation-screen-hero-sheen" />
              <path d={item.categoryEdge} className="demo-evaluation-screen-hero-category-edge" />
            </g>)}
          </svg>
        </div>
        <div className={`demo-evaluation-screen-hero-center education-${active?.key}`}>
          <span>{active?.name}</span><strong>{percentage(active?.eventCount ?? 0, total)}<small>%</small></strong><span>{formatScreenNumber(active?.eventCount ?? 0)} 条事件</span>
        </div>
      </div>
      <div className="demo-evaluation-screen-hero-legend" aria-label="五育类别">
        {dimensions.map(item => <button key={item.key} type="button" aria-pressed={item.key === active?.key} aria-label={`${item.name}，${item.eventCount}条，占${percentage(item.eventCount, total)}%`} className={`education-${item.key}`} onPointerEnter={() => { setInteracting(true); setActiveKey(item.key); }} onPointerLeave={() => setInteracting(false)} onFocus={() => { setInteracting(true); setActiveKey(item.key); }} onBlur={() => setInteracting(false)} onClick={() => setActiveKey(item.key)}><span className="demo-evaluation-screen-hero-legend-label"><i aria-hidden="true" />{item.name}</span><strong>{percentage(item.eventCount, total)}<small>%</small></strong></button>)}
      </div>
    </>}
  </section>;
};
