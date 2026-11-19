import React, { useMemo, type CSSProperties } from 'react';
import { DashboardDonutChart } from '../charts/DashboardDonutChart';
import type { MoralScreenSnapshot } from './moralEducationScreenModel';
import { MoralScreenPanel as Panel, formatMoralNumber as number } from './MoralScreenPanel';

export function MoralProblemDistribution({ snapshot }: { snapshot: MoralScreenSnapshot }) {
  const items = snapshot.problemDistribution;
  const total = items.reduce((sum, item) => sum + item.recordCount, 0);
  const data = useMemo(() => items.map((item, index) => ({
    name: item.name, value: item.recordCount, color: `var(--moral-indicator-${index % 5 + 1})`,
    gradient: { from: `var(--moral-chart-${index % 5 + 1}-from)`, to: `var(--moral-chart-${index % 5 + 1}-to)` },
  })), [items]);
  const describe = (item: typeof items[number]) => `${item.name}，${number(item.percentage)}%，${number(item.recordCount)}条`;
  return <Panel title="问题分布" className="moral-problem-distribution">
    {!total ? <p className="moral-empty">暂无待改进记录</p> : <div className="moral-problem-distribution-content">
      <DashboardDonutChart data={data} ariaLabel={`全校问题分布：${items.map(describe).join('；')}`}>
        <span className="moral-problem-total-label">待改进记录</span>
        <strong className="moral-problem-total">{number(total)}<small>条</small></strong>
      </DashboardDonutChart>
      <ul aria-label="全校一级指标问题分布">{items.map((item, index) => <li key={item.id} data-problem-dimension={item.id} style={{
        '--moral-dimension-from': `var(--moral-chart-${index % 5 + 1}-from)`,
        '--moral-dimension-to': `var(--moral-chart-${index % 5 + 1}-to)`,
      } as CSSProperties}>
        <span className="moral-problem-dimension-name"><i aria-hidden="true" />{item.name}</span>
        <strong>{number(item.percentage)}<small>%</small></strong><span className="moral-problem-dimension-count">{number(item.recordCount)}<small>条</small></span>
      </li>)}</ul>
    </div>}
  </Panel>;
}
