import React, { useEffect, useId, useState } from 'react';
import type { LeaderReportFiveEducationStat } from '../../mobile-app/services/leaderReportService';
import { percentage } from './studentEvaluationScreenModel';
import { formatScreenNumber } from './StudentEvaluationCharts';

const COLORS = {
  virtue: ['#ffd77c', '#f5a623', '#a05c12'],
  wisdom: ['#b4f5da', '#78c9ad', '#356b5a'],
  fitness: ['#c4e4ff', '#76a9df', '#355e93'],
  aesthetic: ['#e1c3ff', '#b080d3', '#654481'],
  labor: ['#fffdf7', '#e7e5df', '#8f8a81'],
} as const;
const point = (radius: number, angle: number) => [320 + radius * Math.cos(angle), 286 + radius * Math.sin(angle)];
const position = (radius: number, angle: number) => point(radius, angle).map(value => value.toFixed(3)).join(',');
const arc = (radius: number, start: number, end: number, clockwise = true) => {
  const mid = (start + end) / 2;
  return `A${radius},${radius} 0 0,${clockwise ? 1 : 0} ${position(radius, mid)} A${radius},${radius} 0 0,${clockwise ? 1 : 0} ${position(radius, end)}`;
};

export function FiveEducationHero({ dimensions, visible = true, reducedMotion = false }: {
  dimensions: LeaderReportFiveEducationStat[]; visible?: boolean; reducedMotion?: boolean;
}) {
  const id = `school-hero-${useId().replace(/:/g, '')}`;
  const [activeKey, setActiveKey] = useState(dimensions[0]?.key);
  const [interacting, setInteracting] = useState(false);
  const total = dimensions.reduce((sum, item) => sum + item.eventCount, 0);
  const active = dimensions.find(item => item.key === activeKey && item.eventCount > 0) ?? dimensions.find(item => item.eventCount > 0);
  const keys = dimensions.filter(item => item.eventCount > 0).map(item => item.key).join(',');
  useEffect(() => {
    if (!visible || reducedMotion || interacting || !keys) return;
    const values = keys.split(',') as LeaderReportFiveEducationStat['key'][];
    const timer = window.setInterval(() => setActiveKey(previous => values[(values.indexOf(previous!) + 1) % values.length]), 3600);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion, interacting, keys]);
  let cursor = -Math.PI / 2;
  const sectors = dimensions.filter(item => item.eventCount > 0).map(item => {
    const start = cursor;
    cursor += item.eventCount / total * Math.PI * 2;
    const gap = item.eventCount < total ? Math.min(.007, (cursor - start) / 5) : 0;
    const path = `M${position(221, start + gap)} ${arc(221, start + gap, cursor - gap)} L${position(153, cursor - gap)} ${arc(153, cursor - gap, start + gap, false)}Z`;
    return { ...item, path, middle: (start + cursor) / 2 };
  });
  return <section className="evaluation-screen-panel evaluation-screen-hero" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>五育事件占比</h2>
    {!total ? <p className="evaluation-screen-empty">本周期暂无已归类的五育记录</p> : <>
      <div className="evaluation-screen-hero-visual">
        <svg viewBox="0 0 640 590" role="img" aria-label={`五育事件占比：${dimensions.map(item => `${item.name}${percentage(item.eventCount, total)}%，${item.eventCount}条`).join('；')}`} onPointerLeave={() => setInteracting(false)}>
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
          <g className="evaluation-screen-hero-orbits">
            <circle cx="320" cy="286" r="273" fill="none" stroke="#d8953a" strokeWidth=".8" strokeDasharray="330 170 180 1035" />
            {[.28, 2.6, 3.95, 5.2].map(angle => {
              const [cx, cy] = point(273, angle);
              return <g key={angle}><circle cx={cx} cy={cy} r="6" fill="#ffad42" filter={`url(#${id}-glow)`} /><circle cx={cx} cy={cy} r="2.6" fill="#ffe4b0" /></g>;
            })}
          </g>
          <circle cx="320" cy="286" r="149" fill={`url(#${id}-core)`} stroke="#d29d535e" />
          <circle cx="320" cy="286" r="146" fill={`url(#${id}-groove)`} />
          {sectors.map(item => {
            const selected = item.key === active?.key;
            const offset = selected ? 4 : 0;
            return <g key={item.key} className={`evaluation-screen-hero-sector${selected ? ' is-active' : ''}`} data-education={item.key}
              transform={`translate(${Math.cos(item.middle) * offset} ${Math.sin(item.middle) * offset})`}
              onPointerEnter={() => { setInteracting(true); setActiveKey(item.key); }} onClick={() => setActiveKey(item.key)}>
              <title>{`${item.name}，${percentage(item.eventCount, total)}%，${item.eventCount}条事件`}</title>
              <path d={item.path} transform="translate(0 5)" fill={COLORS[item.key][2]} stroke="#060605" strokeWidth="2" />
              <path d={item.path} fill={`url(#${id}-${item.key})`} stroke={COLORS[item.key][0]} strokeWidth="1.6" />
              <path d={item.path} fill={`url(#${id}-sheen)`} stroke="#fff7e8" strokeOpacity=".25" strokeWidth=".6" />
            </g>;
          })}
          <circle cx="320" cy="286" r="151" fill="none" stroke="#ffc366" strokeOpacity=".45" strokeWidth="3" filter={`url(#${id}-glow)`} />
          <text x="320" y="242" textAnchor="middle" className="evaluation-screen-hero-active-label">{active?.name}</text>
          <text x="320" y="319" textAnchor="middle" className="evaluation-screen-hero-percentage">{percentage(active?.eventCount ?? 0, total)}<tspan>%</tspan></text>
          <text x="320" y="359" textAnchor="middle" className="evaluation-screen-hero-event-count">{formatScreenNumber(active?.eventCount ?? 0)} 条事件</text>
        </svg>
      </div>
      <div className="evaluation-screen-hero-legend" aria-label="选择五育类别">
        {dimensions.map(item => <button key={item.key} type="button" className={`education-${item.key}`} aria-pressed={item.key === active?.key}
          aria-label={`${item.name}，${percentage(item.eventCount, total)}%，${item.eventCount}条事件`}
          onClick={() => setActiveKey(item.key)} onPointerEnter={() => { setInteracting(true); setActiveKey(item.key); }} onPointerLeave={() => setInteracting(false)}
          onFocus={() => { setInteracting(true); setActiveKey(item.key); }} onBlur={() => setInteracting(false)}>
          <span><i aria-hidden="true" />{item.name}</span><strong>{percentage(item.eventCount, total)}<small>%</small></strong>
        </button>)}
      </div>
    </>}
  </section>;
}
