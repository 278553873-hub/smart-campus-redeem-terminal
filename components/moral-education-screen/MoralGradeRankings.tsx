import React, { useMemo } from 'react';
import type { MoralScreenSnapshot } from './moralEducationScreenModel';
import { buildMoralGradePages, type MoralGradePage } from './moralEducationScreenGrades';
import { MoralScreenPanel as Panel } from './MoralScreenPanel';
import { MoralRankingRows } from './MoralRankingRows';
import { useMoralGradePlayback } from './useMoralGradePlayback';

function GradeRankingPage({ current }: { current?: MoralGradePage }) {
  return <div className="moral-grade-rankings-page">{current?.grades.map(grade => <article key={grade.id} aria-label={`${grade.name}班级排行榜`}>
    <div className="moral-grade-heading"><h3>{grade.name}</h3></div>
    {!grade.rows.length ? <p className="moral-empty">暂无班级评价数据</p> : <MoralRankingRows rows={grade.rows} />}
  </article>)}</div>;
}

export function MoralGradeRankingPage({ grades, page = 0 }: { grades: MoralScreenSnapshot['grades']; page?: number }) {
  const pages = buildMoralGradePages(grades);
  return <GradeRankingPage current={pages[Math.max(0, page) % Math.max(1, pages.length)]} />;
}

export function MoralGradeRankings({ snapshot, active = true }: { snapshot: MoralScreenSnapshot; active?: boolean }) {
  const pages = useMemo(() => buildMoralGradePages(snapshot.grades), [snapshot.grades]);
  const playback = useMoralGradePlayback(pages.length, active);
  return <Panel title="年级排行榜" className="moral-grade-rankings" action={playback.pages > 1 && <span className="moral-panel-detail" aria-label={`第${playback.page + 1}屏，共${playback.pages}屏`}>{playback.page + 1} / {playback.pages}</span>}>
    {!snapshot.grades.length ? <p className="moral-empty">暂无班级评价数据</p> : <GradeRankingPage current={pages[playback.page]} />}
  </Panel>;
}
