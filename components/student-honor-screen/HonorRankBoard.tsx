import React from 'react';
import { HonorAvatar, HonorPodium } from './HonorPodium';
import { formatHonorScore, getHonorStudentClassName, type HonorGradeBoard } from './studentHonorModel';
import './studentHonorScreen.css';

export function HonorRankBoard({ board }: { board: HonorGradeBoard }) {
  const otherStudents = board.rows.slice(3);
  return <article className="honor-grade-card" aria-labelledby={`honor-grade-${board.id}`}>
    <header className="honor-grade-heading"><h2 id={`honor-grade-${board.id}`}>{board.name}</h2></header>
    <div className="honor-grade-body">
      <HonorPodium rows={board.rows} gradeName={board.name} />
      <section className="honor-ranking-table" aria-label={`${board.name}其余上榜同学`}>
        {!otherStudents.length ? <p className="honor-empty">暂无更多上榜同学</p> : <ol className="honor-ranking-list" start={4}>{otherStudents.map(row => <li key={row.student.id} data-rank-tier={row.rank <= 3 ? row.rank : undefined}>
          <span className="honor-list-rank" aria-label={`${row.tied ? '并列' : ''}第${row.rank}名`}>{row.rank}</span>
          <HonorAvatar student={row.student} />
          <span className="honor-student-name" title={row.student.displayName}>{row.student.displayName}</span>
          <span className="honor-student-class" title={getHonorStudentClassName(row.student)}>{getHonorStudentClassName(row.student)}</span>
          <span className="honor-total"><span className="honor-student-score">{formatHonorScore(row.score)}</span><span className="honor-score-unit">分</span></span>
        </li>)}</ol>}
      </section>
    </div>
  </article>;
}
