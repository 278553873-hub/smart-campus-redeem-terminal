import React, { type CSSProperties } from 'react';
import type { MoralScreenSnapshot } from './moralEducationScreenModel';
import { MoralScreenPanel as Panel, formatMoralNumber as number } from './MoralScreenPanel';
import { getMoralBarMaximum, getMoralBarRatio } from './moralChartScale';

function ComparisonColumn({ value, maximum, previous = false }: { value: number | null; maximum: number; previous?: boolean }) {
  const height = `${getMoralBarRatio(value ?? 0, maximum) * 100}%`;
  return <div className={`moral-change-column ${previous ? 'is-previous' : 'is-current'}`} aria-label={`${previous ? '上期' : '本期'}${value === null ? '暂无数据' : `${number(value)}条`}`}>
    <i style={{ height }} aria-hidden="true" />
    <span style={{ bottom: height }}>{value === null ? '—' : number(value)}</span>
  </div>;
}

export function MoralProblemChanges({ snapshot }: { snapshot: MoralScreenSnapshot }) {
  const maximum = getMoralBarMaximum(snapshot.problemChanges.flatMap(item => [item.currentCount, item.previousCount ?? 0]));
  return <Panel title="近期问题变化" className="moral-problem-changes" action={snapshot.problemChanges.length > 0 && <div className="moral-comparison-legend"><span><i className="is-previous" />上期</span><span><i className="is-current" />本期（条）</span></div>}>
    {!snapshot.problemChanges.length ? <p className="moral-empty">暂无问题变化数据</p> : <ul className="moral-change-chart" style={{ '--moral-change-columns': snapshot.problemChanges.length } as CSSProperties} aria-label="各一级指标本期与上期待改进条数纵向分组柱状图">
      {snapshot.problemChanges.map(item => <li key={item.id} aria-label={`${item.name}问题变化`}>
        <div className="moral-change-column-pair">
          <ComparisonColumn value={item.previousCount} maximum={maximum} previous />
          <ComparisonColumn value={item.currentCount} maximum={maximum} />
        </div>
        <span className="moral-change-name">{item.name}</span>
        <strong className={`moral-change-delta ${item.delta === null || item.delta === 0 ? '' : item.delta > 0 ? 'is-up' : 'is-down'}`} aria-label={`较上期${item.delta === null ? '暂无可比数据' : item.delta === 0 ? '持平' : `${item.delta > 0 ? '增加' : '减少'}${number(Math.abs(item.delta))}条`}`}>{item.delta === null ? '—' : item.delta === 0 ? '持平' : <>{item.delta > 0 ? '+' : ''}{number(item.delta)}<small>条</small></>}</strong>
      </li>)}
    </ul>}
  </Panel>;
}
