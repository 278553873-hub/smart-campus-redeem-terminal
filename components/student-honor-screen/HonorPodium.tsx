import React, { type CSSProperties } from 'react';
import type { GrowthRankingRow } from '../student-growth-screen/studentGrowthRankingModel';
import { getHonorStudentAvatar } from './studentHonorAvatars';
import { formatHonorScore, getHonorStudentClassName } from './studentHonorModel';

const PODIUM_HEIGHT_RATIOS = [1, 0.8, 0.6] as const;
const PODIUM_INFO_STEP = 9.5;

export function HonorAvatar({ student }: { student: GrowthRankingRow['student'] }) {
  return <span className="honor-avatar">
    <span aria-hidden="true">{student.displayName.slice(-2)}</span>
    <img src={getHonorStudentAvatar(student)} alt="" decoding="async" onError={event => { event.currentTarget.style.opacity = '0'; }} />
  </span>;
}

export function HonorPodium({ rows, gradeName }: { rows: GrowthRankingRow[]; gradeName: string }) {
  const finalists = rows.slice(0, 3);
  // 最低一档的文字贴近名单，其余文字按名次逐档抬高。
  const lowestVisibleRank = finalists.at(-1)?.rank ?? 3;

  return <section className="honor-podium-section" aria-label={`${gradeName}前三名`}>
    {!finalists.length ? <div className="honor-empty">这个年级还没有上榜同学</div> : <div className="honor-podium-stage">
      {finalists.map((row, index) => <article key={row.student.id}
        className={`honor-finalist honor-place-${index}`}
        data-rank={row.rank}
        style={{
          '--honor-podium-height-ratio': PODIUM_HEIGHT_RATIOS[row.rank - 1],
          '--honor-podium-lift': `${(lowestVisibleRank - row.rank) * PODIUM_INFO_STEP}%`,
        } as CSSProperties}
        aria-label={`${row.student.displayName}，${getHonorStudentClassName(row.student)}，${row.tied ? '并列' : ''}第${row.rank}名，${formatHonorScore(row.score)}分`}>
        <div className="honor-podium-face">
          <HonorAvatar student={row.student} />
          <img className="honor-avatar-frame" src={`/assets/student-honor/avatar-frame-${row.rank}.png`} alt="" decoding="async" />
        </div>
        <div className="honor-podium-info">
          <h3 className="honor-student-name" title={row.student.displayName}>{row.student.displayName}</h3>
          <span className="honor-student-class" title={getHonorStudentClassName(row.student)}>{getHonorStudentClassName(row.student)}</span>
          <span className="honor-student-score">{formatHonorScore(row.score)}</span>
        </div>
      </article>)}
    </div>}
  </section>;
}
