import React, { useId, type ReactNode } from 'react';

export const formatMoralNumber = (value: number) => value.toLocaleString('zh-CN', { maximumFractionDigits: 1 });
export const formatMoralRank = (value: number) => String(value).padStart(2, '0');

export function MoralScreenPanel({ title, top, className = '', action, children }: { title: string; top?: number; className?: string; action?: ReactNode; children: ReactNode }) {
  const id = useId();
  return <section className={`moral-panel ${className}`} aria-labelledby={id}>
    <div className="moral-panel-heading"><h2 id={id}>{title}{top !== undefined && ` TOP${top}`}</h2>{action}</div>{children}
  </section>;
}
