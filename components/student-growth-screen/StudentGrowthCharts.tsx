import React, { type ReactNode } from 'react';

export const formatGrowthNumber = (value: number) => value.toLocaleString('zh-CN');
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' });
export const growthDate = (value: number) => dateFormatter.format(value).replace('/', '.');

export function GrowthPanel({ title, extra, badge, className = '', children }: { title: string; extra?: ReactNode; badge?: string; className?: string; children: ReactNode }) {
  return <section className={`student-growth-panel ${className}`} aria-label={title}>
    <div className="student-growth-panel-heading"><div className="student-growth-panel-title"><h2 title={title}>{title}</h2>{badge && <span className="student-growth-panel-badge">{badge}</span>}</div>{extra}</div>
    {children}
  </section>;
}
