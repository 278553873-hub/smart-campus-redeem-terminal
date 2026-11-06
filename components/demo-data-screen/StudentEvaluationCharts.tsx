import React, { useId, type CSSProperties, type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LeaderReportFiveEducationStat, LeaderReportGradeCoverage, LeaderReportTeacherUsage } from '../../mobile-app/services/leaderReportService';
import { percentage, type ScreenEvaluation } from './studentEvaluationScreenModel';

export const formatScreenNumber = (value: number) => value.toLocaleString('zh-CN');
export const formatScreenTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });

export const ScreenPanel = ({ title, detail, action, children, className = '' }: {
  title: string; detail?: ReactNode; action?: ReactNode; children: ReactNode; className?: string;
}) => {
  const titleId = useId();
  return (
    <section className={`demo-evaluation-screen-panel ${className}`} aria-labelledby={titleId}>
      <div className="demo-evaluation-screen-panel-heading">
        <h2 id={titleId}>{title}</h2>
        {action && <div className="demo-evaluation-screen-panel-action">{action}</div>}
        {detail && <span className="demo-evaluation-screen-panel-detail">{detail}</span>}
      </div>
      {children}
    </section>
  );
};

export const FiveEducationDistribution = ({ dimensions }: { dimensions: LeaderReportFiveEducationStat[] }) => {
  const total = dimensions.reduce((sum, item) => sum + item.eventCount, 0);
  const circumference = 2 * Math.PI * 77;
  let cursor = 0;
  return (
    <div className="demo-evaluation-screen-distribution">
      <svg viewBox="0 0 220 220" role="img" aria-label={`已归类五育行为共${total}条`}>
        <circle className="demo-evaluation-screen-ring-track" cx="110" cy="110" r="77" />
        {dimensions.map(dimension => {
          const length = total ? dimension.eventCount / total * circumference : 0;
          const offset = -cursor;
          cursor += length;
          return <circle key={dimension.key} className={`demo-evaluation-screen-ring education-${dimension.key}`} cx="110" cy="110" r="77"
            strokeDasharray={`${Math.max(0, length - Math.min(4, length))} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90 110 110)" />;
        })}
        <text x="110" y="110" className="demo-evaluation-screen-ring-value" textAnchor="middle">{formatScreenNumber(total)}</text>
        <text x="110" y="137" className="demo-evaluation-screen-ring-label" textAnchor="middle">五育行为 / 条</text>
      </svg>
      <ul className="demo-evaluation-screen-dimension-legend">
        {dimensions.map(dimension => <li key={dimension.key} className={`education-${dimension.key}`}>
          <span className="demo-evaluation-screen-color-dot" aria-hidden="true" />
          <span>{dimension.name}</span>
          <strong>{formatScreenNumber(dimension.eventCount)}<small>条</small></strong>
          <span className="demo-evaluation-screen-secondary">{percentage(dimension.eventCount, total)}%</span>
        </li>)}
      </ul>
    </div>
  );
};

export const FiveEducationScores = ({ dimensions }: { dimensions: LeaderReportFiveEducationStat[] }) => {
  const maximum = Math.max(1, ...dimensions.flatMap(dimension => [dimension.plusScore, dimension.minusScore]));
  return (
    <div className="demo-evaluation-screen-scores">
      <div className="demo-evaluation-screen-score-legend"><span className="is-negative">− 减分</span><span className="is-positive">+ 加分</span></div>
      <div className="demo-evaluation-screen-score-bars">
        {dimensions.map(dimension => <div className="demo-evaluation-screen-score-row" key={dimension.key} aria-label={`${dimension.name}，加分${dimension.plusScore}分，减分${dimension.minusScore}分`}>
          <span className="demo-evaluation-screen-score-name">{dimension.name}</span>
          <div className="demo-evaluation-screen-score-half is-negative">
            <span>−{formatScreenNumber(dimension.minusScore)}</span>
            <div className="demo-evaluation-screen-score-bar-track"><i style={{ '--bar-width': `${dimension.minusScore / maximum * 100}%` } as CSSProperties} /></div>
          </div>
          <div className="demo-evaluation-screen-score-half is-positive">
            <div className="demo-evaluation-screen-score-bar-track"><i style={{ '--bar-width': `${dimension.plusScore / maximum * 100}%` } as CSSProperties} /></div>
            <span>+{formatScreenNumber(dimension.plusScore)}</span>
          </div>
        </div>)}
      </div>
      <div className="demo-evaluation-screen-chart-footnote">累计分值<span>同一刻度 · 单位：分</span></div>
    </div>
  );
};

export const GradeCoverage = ({ grades, page, onPageChange }: {
  grades: LeaderReportGradeCoverage[]; page: number; onPageChange: (page: number) => void;
}) => {
  const pages = Math.max(1, Math.ceil(grades.length / 6));
  const currentPage = page % pages;
  return (
    <ScreenPanel title="每个年级，都被关注" action={pages > 1 && <div className="demo-evaluation-screen-pagination">
      <button type="button" aria-label="上一组年级" onClick={() => onPageChange((currentPage + pages - 1) % pages)}><ChevronLeft size={18} /></button>
      <span>{currentPage + 1}<small> / {pages}</small></span>
      <button type="button" aria-label="下一组年级" onClick={() => onPageChange((currentPage + 1) % pages)}><ChevronRight size={18} /></button>
    </div>}>
      <div className="demo-evaluation-screen-coverage-label"><span>学生评价覆盖率</span><span>已覆盖 / 学生数</span></div>
      <ul className="demo-evaluation-screen-grade-list" key={currentPage}>
        {grades.slice(currentPage * 6, currentPage * 6 + 6).map(grade => {
          const percent = percentage(grade.covered, grade.total);
          return <li key={grade.id}>
            <span className="demo-evaluation-screen-grade-name">{grade.name}</span>
            <div className="demo-evaluation-screen-coverage-track" role="meter" aria-label={`${grade.name}学生评价覆盖率`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <strong>{percent}<small>%</small></strong>
            <span className="demo-evaluation-screen-grade-count">{grade.covered} / {grade.total}</span>
          </li>;
        })}
      </ul>
    </ScreenPanel>
  );
};

export const TeacherEvaluationFootprints = ({ teachers }: { teachers: LeaderReportTeacherUsage[] }) => {
  const top = [...teachers].sort((a, b) => b.records - a.records).slice(0, 4);
  const maximum = Math.max(1, ...top.map(teacher => teacher.records));
  return (
    <ol className="demo-evaluation-screen-teacher-list">
      {!top.length && <li className="demo-evaluation-screen-empty">暂时没有教师评价记录</li>}
      {top.map((teacher, index) => <li key={teacher.id}>
        <span className="demo-evaluation-screen-rank">{String(index + 1).padStart(2, '0')}</span>
        <span className="demo-evaluation-screen-teacher-name">{teacher.name}</span>
        <div className="demo-evaluation-screen-teacher-track"><span style={{ width: `${teacher.records / maximum * 100}%` }} /></div>
        <strong>{formatScreenNumber(teacher.records)}<small>次</small></strong>
      </li>)}
    </ol>
  );
};

export const LiveEvaluationFeed = ({ events }: { events: ScreenEvaluation[] }) => (
  <div className="demo-evaluation-screen-feed-window" aria-label="滚动评价记录" aria-live="off">
    {!events.length && <p className="demo-evaluation-screen-empty">暂时没有评价记录</p>}
    <ol className="demo-evaluation-screen-feed-track" key={events[0]?.id}>
      {events.slice(0, 7).map(event => {
        const delta = event.students[0]?.delta ?? 0;
        const negative = delta < 0;
        return <li key={event.id} className={negative ? 'is-negative' : 'is-positive'}>
          <span className="demo-evaluation-screen-feed-mark" aria-hidden="true">{negative ? <ArrowDownRight size={19} /> : <ArrowUpRight size={19} />}</span>
          <div className="demo-evaluation-screen-feed-content">
            <div className="demo-evaluation-screen-feed-line"><strong>{event.teacherName}</strong><time dateTime={new Date(event.occurredAt).toISOString()}>{formatScreenTime(event.occurredAt)}</time></div>
            <p>{event.className}<span> · </span>{event.students.length > 1 ? `${event.students.length}名同学` : event.students[0]?.displayName}</p>
            <div className="demo-evaluation-screen-feed-description"><span className={`demo-evaluation-screen-education-tag education-${event.dimension}`}>{event.dimensionName}</span><span>{event.indicator}</span></div>
          </div>
          <div className="demo-evaluation-screen-feed-delta"><strong>{delta > 0 ? '+' : '−'}{Math.abs(delta)}</strong><small>{event.students.length > 1 ? `分 × ${event.students.length}人` : '分'}</small></div>
        </li>;
      })}
    </ol>
  </div>
);

export const StudentScoreChanges = ({ events }: { events: ScreenEvaluation[] }) => {
  const unique = new Set<string>();
  const changes = events.flatMap(event => event.students.map(student => ({ ...student, event }))).filter(student => {
    if (unique.has(student.studentId)) return false;
    unique.add(student.studentId);
    return true;
  }).slice(0, 3);
  return (
    <div className="demo-evaluation-screen-student-changes" aria-live="off">
      {!changes.length && <p className="demo-evaluation-screen-empty">新的评价发生后，积分变化将在这里呈现</p>}
      {changes.map(student => <article key={`${student.event.id}-${student.studentId}`} className={student.delta < 0 ? 'is-negative' : 'is-positive'} aria-label={`${student.event.className}${student.displayName}，净得分从${student.beforeScore}分变为${student.afterScore}分`}>
        <div className="demo-evaluation-screen-student-change-heading"><strong>{student.displayName}</strong><span>{student.event.className}</span><b>{student.delta > 0 ? '+' : '−'}{Math.abs(student.delta)}<small>分</small></b></div>
        <div className="demo-evaluation-screen-student-score"><span>{student.beforeScore}<small>分</small></span><span className="demo-evaluation-screen-score-journey"><i /><ChevronRight size={16} aria-hidden="true" /></span><strong>{student.afterScore}<small>分</small></strong></div>
      </article>)}
    </div>
  );
};
