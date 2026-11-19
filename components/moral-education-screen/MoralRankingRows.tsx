import React from 'react';
import type { MoralScreenSnapshot } from './moralEducationScreenModel';
import { formatMoralNumber as number, formatMoralRank } from './MoralScreenPanel';

export function MoralRankingRows({ rows }: { rows: MoralScreenSnapshot['classes'] }) {
  return <>
    <div className="moral-ranking-head"><span>名次</span><span>班级</span><span>得分</span></div>
    <ol className="moral-ranking-list">{rows.map(item => <li key={item.id} className={item.rank <= 3 ? 'is-top' : undefined}>
      <span className="moral-rank" aria-label={`${item.tied ? '并列' : ''}第${item.rank}名`}>{formatMoralRank(item.rank)}</span>
      <span className="moral-class-name"><strong>{item.name}</strong></span>
      <strong className="moral-ranking-score">{number(item.score)}</strong>
    </li>)}</ol>
  </>;
}
