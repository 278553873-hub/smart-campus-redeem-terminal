import React, { useEffect, useId, useRef, useState } from 'react';
import { ScreenPanel, formatScreenNumber } from './StudentEvaluationCharts';
import { formatGrowthWeek, type ScreenGrowthWeek } from './studentEvaluationScreenGrowth';

export const getGrowthTrendScale = (maximum: number) => {
  const target = Math.max(1, maximum * 1.15) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = Math.max(1, Math.ceil(([1, 2, 2.5, 5, 10].find(value => value * magnitude >= target) ?? 10) * magnitude));
  return { maximum: Math.ceil(Math.max(1, maximum * 1.15) / step) * step, step };
};

export const GrowthTrend = ({ weeks }: { weeks: ScreenGrowthWeek[] }) => {
  const gradientId = `demo-growth-${useId().replace(/:/g, '')}`;
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 424, height: 216 });
  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const data = weeks.slice(-7);
  const { maximum, step } = getGrowthTrendScale(Math.max(0, ...data.map(week => week.recordedStudentIds.length)));
  const left = 52;
  const right = size.width - 22;
  const top = 14;
  const bottom = size.height - 32;
  const x = (index: number) => left + index / Math.max(1, data.length - 1) * (right - left);
  const y = (value: number) => bottom - value / maximum * (bottom - top);
  const line = (field: 'recordedStudentIds' | 'praisedStudentIds') => data.map((week, index) => `${index ? 'L' : 'M'}${x(index)},${y(week[field].length)}`).join(' ');
  const description = data.map(week => `${formatGrowthWeek(week.weekStart)}当周，获表扬${formatScreenNumber(week.praisedStudentIds.length)}人，被记录${formatScreenNumber(week.recordedStudentIds.length)}人`).join('；');

  return <ScreenPanel title="成长趋势" className="demo-evaluation-screen-growth-panel">
    <div className="demo-evaluation-screen-growth-legend" aria-hidden="true">
      <span><i className="is-praised" />获表扬人数</span><span><i className="is-recorded" />被记录人数</span>
    </div>
    <div ref={plotRef} className="demo-evaluation-screen-growth-plot">
      <svg viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`最近7周成长趋势，按周去重人数。${description}`}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--es-accent)" stopOpacity=".24" /><stop offset="1" stopColor="var(--es-accent)" stopOpacity="0" /></linearGradient></defs>
        {Array.from({ length: Math.round(maximum / step) + 1 }, (_, index) => index * step).map(value => <g key={value} aria-hidden="true">
          <line className="demo-evaluation-screen-growth-grid" x1={left} x2={right} y1={y(value)} y2={y(value)} />
          <text className="demo-evaluation-screen-growth-axis" x={left - 10} y={y(value)} textAnchor="end" dominantBaseline="middle">{formatScreenNumber(value)}</text>
        </g>)}
        {data.length > 0 && <>
          <path d={`${line('praisedStudentIds')} L${x(data.length - 1)},${bottom} L${left},${bottom} Z`} fill={`url(#${gradientId})`} />
          <path d={line('recordedStudentIds')} className="demo-evaluation-screen-growth-line is-recorded" />
          <path d={line('praisedStudentIds')} className="demo-evaluation-screen-growth-line is-praised" />
        </>}
        {data.map((week, index) => <g key={week.weekStart}>
          <title>{`${formatGrowthWeek(week.weekStart)}当周：获表扬${formatScreenNumber(week.praisedStudentIds.length)}人，被记录${formatScreenNumber(week.recordedStudentIds.length)}人`}</title>
          <rect x={x(index) - (right - left) / 14} y={top} width={(right - left) / 7} height={bottom - top} fill="transparent" />
          <circle className="demo-evaluation-screen-growth-dot" cx={x(index)} cy={y(week.praisedStudentIds.length)} r="4" />
          <text className="demo-evaluation-screen-growth-axis" x={x(index)} y={size.height - 6} textAnchor="middle">{formatGrowthWeek(week.weekStart)}</text>
        </g>)}
      </svg>
    </div>
  </ScreenPanel>;
};
