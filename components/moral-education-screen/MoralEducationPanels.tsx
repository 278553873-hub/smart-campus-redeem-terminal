import React, { useId, useState } from 'react';
import { School, Gauge, MinusCircle, ClipboardList, MessageSquareText } from 'lucide-react';
import { rankMoralProblems, type MoralScreenSnapshot, type MoralProblemRankingMetric } from './moralEducationScreenModel';

import { MoralScreenPanel as Panel, formatMoralNumber as number, formatMoralRank } from './MoralScreenPanel';
import { MoralRankingRows } from './MoralRankingRows';
import { MoralPanelTabs } from './MoralPanelTabs';

const Empty = () => <p className="moral-empty">暂无班级评价数据</p>;
const problemRankingOptions = [{ id: 'recordCount', label: '按条数' }, { id: 'deduction', label: '按分数' }] as const;

export function MoralOverview({ snapshot }: { snapshot: MoralScreenSnapshot }) {
  const { summary } = snapshot;
  const metrics = [
    { label: '班级数量', value: summary.classCount, unit: '个', icon: School },
    { label: '评价次数', value: summary.evaluationCount, unit: '次', icon: MessageSquareText },
    { label: '班级平均得分', value: summary.averageScore, unit: '分', icon: Gauge },
    { label: '累计扣分', value: summary.deduction, unit: '分', icon: MinusCircle },
    { label: '待改进记录', value: summary.issueCount, unit: '条', icon: ClipboardList },
  ];
  return <section className="moral-overview" aria-label="班级评价概况">{metrics.map(metric => <div className="moral-metric" key={metric.label}>
    <div><span>{metric.label}</span><metric.icon size={20} aria-hidden="true" /></div>
    <strong>{number(metric.value)}<small>{metric.unit}</small></strong>
  </div>)}</section>;
}

export function MoralRanking({ snapshot }: { snapshot: MoralScreenSnapshot }) {
  return <Panel title="全校排行榜" top={10} className="moral-ranking">
    {!snapshot.classes.length ? <Empty /> : <MoralRankingRows rows={snapshot.classes.slice(0, 10)} />}
  </Panel>;
}

export function MoralProblemRankingList({ problems, metric }: { problems: MoralScreenSnapshot['problems']; metric: MoralProblemRankingMetric }) {
  const rows = rankMoralProblems(problems, metric).slice(0, 5);
  return !rows.length ? <p className="moral-empty">当前范围暂无待改进记录</p> : <ol>{rows.map((item, index) => <li key={item.id}>
    <span className="moral-problem-index">{formatMoralRank(index + 1)}</span>
    <span className="moral-problem-path">{item.name}</span>
    <strong className="moral-problem-value moral-data-number">{number(item[metric])}<small>{metric === 'recordCount' ? '条' : '分'}</small></strong>
  </li>)}</ol>;
}

export function MoralProblems({ snapshot }: { snapshot: MoralScreenSnapshot }) {
  const id = `moral-problems-${useId().replace(/:/g, '')}`;
  const [metric, setMetric] = useState<MoralProblemRankingMetric>('recordCount');
  return <Panel title="全校高频问题" top={5} className="moral-problems" action={<MoralPanelTabs id={id} ariaLabel="全校高频问题排序" items={problemRankingOptions} value={metric} onChange={setMetric} />}>
    <div id={`${id}-content`} className="moral-problems-content" role="tabpanel" aria-labelledby={`${id}-${metric}`}>
      <MoralProblemRankingList problems={snapshot.problems} metric={metric} />
    </div>
  </Panel>;
}
