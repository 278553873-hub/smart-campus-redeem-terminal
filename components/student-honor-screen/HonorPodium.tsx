import React from 'react';
import type { GrowthRankingRow } from '../student-growth-screen/studentGrowthRankingModel';
import { getHonorStudentAvatar } from './studentHonorAvatars';
import { formatHonorRank, formatHonorScore } from './studentHonorModel';

export function HonorAvatar({ student }: { student: GrowthRankingRow['student'] }) {
  return <span className="honor-avatar">
    <span aria-hidden="true">{student.displayName.slice(-2)}</span>
    <img src={getHonorStudentAvatar(student)} alt="" decoding="async" onError={event => { event.currentTarget.style.opacity = '0'; }} />
  </span>;
}

export function HonorPodium({ rows, gradeName }: { rows: GrowthRankingRow[]; gradeName: string }) {
  const finalists = rows.slice(0, 3);
  return <section className="honor-podium-section" aria-label={`${gradeName}前三名`}>
    {!finalists.length ? <div className="honor-empty">这个年级还没有上榜同学</div> : <div className="honor-podium-stage">
      <img className="honor-podium-art" src="/assets/student-honor/podium.png" alt="" decoding="async" />
      {finalists.map((row, index) => <React.Fragment key={row.student.id}>
        <article className={`honor-finalist honor-place-${index}`} aria-label={`${row.student.displayName}，${row.tied ? '并列' : ''}第${row.rank}名，${formatHonorScore(row.score)}分`}>
          {row.rank === 1 && <img className="honor-crown" src="/assets/student-honor/crown.png" alt="" decoding="async" />}
          <HonorAvatar student={row.student} />
          <h3 title={`${row.student.displayName} · ${row.student.className}`}>{row.student.displayName}</h3>
          <strong className="honor-finalist-score">{formatHonorScore(row.score)}<small>分</small></strong>
        </article>
        <span className={`honor-podium-rank honor-podium-rank-${index}`} aria-hidden="true">{formatHonorRank(row.rank)}</span>
      </React.Fragment>)}
    </div>}
  </section>;
}
