import React, { type CSSProperties } from 'react';
import type { GrowthRankingRow } from '../student-growth-screen/studentGrowthRankingModel';
import { getHonorStudentAvatar } from './studentHonorAvatars';
import { formatHonorRank, formatHonorScore, getHonorStudentClassName } from './studentHonorModel';

export function HonorAvatar({ student }: { student: GrowthRankingRow['student'] }) {
  return <span className="honor-avatar">
    <span aria-hidden="true">{student.displayName.slice(-2)}</span>
    <img src={getHonorStudentAvatar(student)} alt="" decoding="async" onError={event => { event.currentTarget.style.opacity = '0'; }} />
  </span>;
}

export function HonorPodium({ rows, gradeName }: { rows: GrowthRankingRow[]; gradeName: string }) {
  const finalists = rows.slice(0, 3);
  const scores = [...new Set(finalists.map(row => row.score))].sort((a, b) => a - b);
  // 同分共用柱高；分数接近时仍保留足够的视觉高度差。
  const heights = new Map(scores.map((score, index) => [score, scores.length === 1 ? 100
    : 72 + 16 * index / (scores.length - 1) + 12 * (score - scores[0]) / (scores[scores.length - 1] - scores[0])]));

  return <section className="honor-podium-section" aria-label={`${gradeName}前三名`}>
    {!finalists.length ? <div className="honor-empty">这个年级还没有上榜同学</div> : <div className="honor-podium-stage">
      {finalists.map((row, index) => <article key={row.student.id}
        className={`honor-finalist honor-place-${index}`}
        style={{ '--honor-podium-height': `${heights.get(row.score)}%` } as CSSProperties}
        aria-label={`${row.student.displayName}，${getHonorStudentClassName(row.student)}，${row.tied ? '并列' : ''}第${row.rank}名，${formatHonorScore(row.score)}分`}>
        <span className="honor-podium-rank" aria-hidden="true">{formatHonorRank(row.rank)}</span>
        <div className="honor-podium-face">
          <HonorAvatar student={row.student} />
          <img className={row.rank === 1 ? 'honor-crown' : 'honor-crown honor-crown-accent'} src="/assets/student-honor/crown.png" alt="" decoding="async" />
        </div>
        <h3 className="honor-student-name" title={row.student.displayName}>{row.student.displayName}</h3>
        <span className="honor-student-class" title={getHonorStudentClassName(row.student)}>{getHonorStudentClassName(row.student)}</span>
        <span className="honor-total">总分 <strong className="honor-student-score">{formatHonorScore(row.score)}</strong></span>
      </article>)}
    </div>}
  </section>;
}
