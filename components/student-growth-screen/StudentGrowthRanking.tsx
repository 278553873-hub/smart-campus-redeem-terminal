import React, { type ReactNode } from 'react';
import type { GrowthStudent } from './studentGrowthModel';
import { GROWTH_RANK_SIZE, type GrowthRankingRow } from './studentGrowthRankingModel';

/** 部分服务已返回完整班名，避免重复拼接年级。 */
export function growthStudentClassName(student: Pick<GrowthStudent, 'gradeName' | 'className'>) {
  const grade = student.gradeName.trim(), className = student.className.trim();
  return !grade || className.startsWith(grade) ? className : `${grade}${className}`;
}

interface GrowthRankingColumn<Row> { key: string; label: string; render: (row: Row) => ReactNode }
/** 学生与班级榜共用列对齐、十行、并列名次和空状态；统计口径由业务选择器负责。 */
export function GrowthRankingTable<Row extends { rank: number; tied?: boolean }>({ title, rows, rowKey, columns, className = '', emptyText = '暂无上榜学生', limit = GROWTH_RANK_SIZE }: {
  title: string; rows: Row[]; rowKey: (row: Row) => string; columns: GrowthRankingColumn<Row>[]; className?: string; emptyText?: string; limit?: number;
}) {
  const displayedRows = rows.slice(0, limit);
  return <div className={`student-growth-ranking-table ${className}`}>
    <div className="student-growth-ranking-row student-growth-ranking-labels" aria-hidden="true"><span>名次</span>{columns.map(column => <span key={column.key}>{column.label}</span>)}</div>
    <ol aria-label={`${title}前${limit}名`}>
      {displayedRows.map(row => <li key={rowKey(row)} className={`student-growth-ranking-row ${row.rank <= 3 ? 'is-top-three' : ''}`}>
        <span className="student-growth-rank-position" aria-label={`${row.tied ? '并列' : ''}第${row.rank}名`} title={row.tied ? `并列第${row.rank}名` : undefined}>{String(row.rank).padStart(2, '0')}</span>
        {columns.map(column => <div className={`student-growth-rank-cell student-growth-rank-cell-${column.key}`} key={column.key}>{column.render(row)}</div>)}
      </li>)}
    </ol>
    {!displayedRows.length && <div className="student-growth-empty">{emptyText}</div>}
  </div>;
}

export function GrowthRankingList({ title, rows, limit = GROWTH_RANK_SIZE }: { title: string; rows: GrowthRankingRow[]; limit?: number }) {
  return <GrowthRankingTable title={title} rows={rows} rowKey={row => row.student.id} limit={limit} className="student-growth-student-table" columns={[
    { key: 'student', label: '姓名', render: row => <strong className="student-growth-rank-student" title={row.student.displayName}>{row.student.displayName}</strong> },
    { key: 'class', label: '班级', render: row => <span className="student-growth-rank-class" title={growthStudentClassName(row.student)}>{growthStudentClassName(row.student)}</span> },
    { key: 'score', label: '积分', render: row => <b className="student-growth-rank-score">{row.score.toLocaleString('zh-CN')}</b> },
  ]} />;
}
