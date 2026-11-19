import React from 'react';
import type { MoralScreenSnapshot } from './moralEducationScreenModel';
import { MoralScreenPanel as Panel, formatMoralNumber as number, formatMoralRank } from './MoralScreenPanel';
import { useMoralGradePlayback } from './useMoralGradePlayback';

const MORAL_PROBLEM_GRADE_GROUP_SIZE = 3;

export function MoralGradeProblemPage({ grades, page = 0 }: { grades: MoralScreenSnapshot['grades']; page?: number }) {
  const pages = Math.ceil(grades.length / MORAL_PROBLEM_GRADE_GROUP_SIZE);
  const start = Math.max(0, page) % Math.max(1, pages) * MORAL_PROBLEM_GRADE_GROUP_SIZE;
  if (!grades.length) return <p className="moral-empty">暂无年级评价数据</p>;
  return <div className="moral-grade-problems-page">{grades.slice(start, start + MORAL_PROBLEM_GRADE_GROUP_SIZE).map(grade => <article key={grade.id} aria-label={`${grade.name}高频问题前三项`}>
    <div className="moral-grade-heading"><h3>{grade.name}</h3><span className="moral-grade-problem-total">总<strong>{number(grade.issueCount)}</strong>条</span></div>
    {!grade.topProblems.length ? <p className="moral-empty">暂无待改进记录</p> : <ol>{grade.topProblems.map((item, index) => <li key={item.id} title={item.path.join(' / ')}>
      <span className="moral-problem-index">{formatMoralRank(index + 1)}</span>
      <span className="moral-grade-problem-name">{item.name}</span>
      <strong className="moral-data-number" aria-label={`${number(item.recordCount)}条`}>{number(item.recordCount)}</strong>
    </li>)}</ol>}
  </article>)}</div>;
}

export function MoralGradeProblems({ snapshot, active = true }: { snapshot: MoralScreenSnapshot; active?: boolean }) {
  const playback = useMoralGradePlayback(Math.ceil(snapshot.grades.length / MORAL_PROBLEM_GRADE_GROUP_SIZE), active);
  return <Panel title="年级高频问题" top={3} className="moral-grade-problems" action={playback.pages > 1 && <span className="moral-panel-detail" aria-label={`第${playback.page + 1}屏，共${playback.pages}屏`}>{playback.page + 1} / {playback.pages}</span>}>
    <MoralGradeProblemPage grades={snapshot.grades} page={playback.page} />
  </Panel>;
}
