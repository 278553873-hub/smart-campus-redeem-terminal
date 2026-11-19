import React from 'react';
import { formatScreenTime, ScreenPanel } from './StudentEvaluationCharts';
import { maskScreenStudentName, type ScreenEvaluation } from './studentEvaluationScreenModel';

/** 将同一条评价的教师、学生及变化合并呈现，姓名在可见文案和辅助阅读中统一脱敏。 */
export const GrowthActivityFeed = ({ events }: { events: ScreenEvaluation[] }) => {
  const seen = new Set<string>();
  const changes = events.flatMap(event => event.students.map(student => ({ ...student, event }))).filter(student => {
    if (seen.has(student.studentId)) return false;
    seen.add(student.studentId);
    return true;
  }).slice(0, 5);
  return <ScreenPanel title="成长动态" className="demo-growth-activity-panel">
    {!changes.length ? <p className="demo-evaluation-screen-empty">新的成长记录将在这里呈现</p> : <ol className="demo-growth-activity-list" aria-live="off">
      {changes.map(student => {
        const name = maskScreenStudentName(student.displayName);
        const teacher = student.event.teacherName.replace(/老师$/, '');
        const indicator = student.event.indicatorPath?.join('-') ?? student.event.indicator;
        const description = student.delta > 0 ? '表扬' : student.delta < 0 ? '待改进记录' : '成长记录';
        const delta = `${student.delta > 0 ? '+' : ''}${student.delta}分`;
        return <li key={`${student.event.id}-${student.studentId}`} className={`education-${student.event.dimension}`} aria-label={`${formatScreenTime(student.event.occurredAt)}，${teacher}老师记录了${name}同学在“${indicator}”方面的${description}， ${delta}。`}>
          <p className="demo-growth-activity-sentence"><time dateTime={new Date(student.event.occurredAt).toISOString()}>{formatScreenTime(student.event.occurredAt)}</time><strong>{teacher}老师</strong>记录了<strong>{name}同学</strong>在<span className="demo-growth-activity-indicator">“{indicator}”</span>方面的{description}， <b className={student.delta < 0 ? 'is-negative' : student.delta > 0 ? 'is-positive' : ''}>{delta}</b>。</p>
        </li>;
      })}
    </ol>}
  </ScreenPanel>;
};
