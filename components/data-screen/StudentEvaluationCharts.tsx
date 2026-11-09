import React, { useId, type CSSProperties, type ReactNode } from 'react';
import { ScreenIcon } from './ScreenIcon';
import type { LeaderReportFiveEducationStat, LeaderReportGradeCoverage, LeaderReportTeacherUsage, LeaderReportIndicatorGroupUsage } from '../../mobile-app/services/leaderReportService';
import { maskScreenStudentName, screenIndicatorCoverage, percentage, type ScreenPeriod, type ScreenEvaluation } from './studentEvaluationScreenModel';

export const formatScreenNumber = (value: number) => value.toLocaleString('zh-CN');
export const formatScreenTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });

const ScreenEmptyState = ({ children }: { children: ReactNode }) => <p className="evaluation-screen-empty">{children}</p>;

export const ScreenPanel = ({ title, detail, action, children, className = '' }: {
  title: string; detail?: ReactNode; action?: ReactNode; children: ReactNode; className?: string;
}) => {
  const titleId = useId();
  return (
    <section className={`evaluation-screen-panel ${className}`} aria-labelledby={titleId}>
      <div className="evaluation-screen-panel-heading">
        <h2 id={titleId}>{title}</h2>
        {action && <div className="evaluation-screen-panel-action">{action}</div>}
        {detail && <span className="evaluation-screen-panel-detail">{detail}</span>}
      </div>
      {children}
    </section>
  );
};

export const FiveEducationScores = ({ dimensions }: { dimensions: LeaderReportFiveEducationStat[] }) => {
  if (!dimensions.some(item => item.eventCount > 0)) return <ScreenEmptyState>本周期暂无五育加减分记录</ScreenEmptyState>;
  const maximum = Math.max(1, ...dimensions.flatMap(dimension => [dimension.plusScore, dimension.minusScore]));
  return (
    <div className="evaluation-screen-scores">
      <div className="evaluation-screen-score-legend"><span className="is-negative">− 减分</span><span className="is-positive">+ 加分</span></div>
      <div className="evaluation-screen-score-bars">
        {dimensions.map(dimension => <div className="evaluation-screen-score-row" key={dimension.key} aria-label={`${dimension.name}，加分${dimension.plusScore}分，减分${dimension.minusScore}分`}>
          <span className="evaluation-screen-score-name">{dimension.name}</span>
          <div className="evaluation-screen-score-half is-negative">
            <span>−{formatScreenNumber(dimension.minusScore)}</span>
            <div className="evaluation-screen-score-bar-track"><i style={{ '--bar-width': `${dimension.minusScore / maximum * 100}%` } as CSSProperties} /></div>
          </div>
          <div className="evaluation-screen-score-half is-positive">
            <div className="evaluation-screen-score-bar-track"><i style={{ '--bar-width': `${dimension.plusScore / maximum * 100}%` } as CSSProperties} /></div>
            <span>+{formatScreenNumber(dimension.plusScore)}</span>
          </div>
        </div>)}
      </div>
    </div>
  );
};

export const GradeCoverage = ({ grades, page, onPageChange }: {
  grades: LeaderReportGradeCoverage[]; page: number; onPageChange: (page: number) => void;
}) => {
  const pages = Math.max(1, Math.ceil(grades.length / 6));
  const currentPage = page % pages;
  const topGradeIds = new Set([...grades].filter(grade => grade.total > 0 && grade.covered > 0)
    .sort((a, b) => b.covered / b.total - a.covered / a.total).slice(0, 3).map(grade => grade.id));
  return (
    <ScreenPanel title="年级评价覆盖率" action={pages > 1 && <div className="evaluation-screen-pagination">
      <button type="button" aria-label="上一组年级" onClick={() => onPageChange((currentPage + pages - 1) % pages)}><ScreenIcon name="previous" size={18} /></button>
      <span>{currentPage + 1}<small> / {pages}</small></span>
      <button type="button" aria-label="下一组年级" onClick={() => onPageChange((currentPage + 1) % pages)}><ScreenIcon name="next" size={18} /></button>
    </div>}>
      {!grades.length ? <ScreenEmptyState>暂无年级学生数据，请在学校后台完善</ScreenEmptyState> : <>
      <ul className="evaluation-screen-grade-list" key={currentPage}>
        {grades.slice(currentPage * 6, currentPage * 6 + 6).map(grade => {
          const percent = percentage(grade.covered, grade.total);
          return <li key={grade.id} className={topGradeIds.has(grade.id) ? 'is-top-grade' : undefined}>
            <span className="evaluation-screen-grade-name">{grade.name}</span>
            <div className="evaluation-screen-coverage-track" role="meter" aria-label={`${grade.name}学生评价覆盖率`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <strong>{grade.total ? <>{percent}<small>%</small></> : '—'}</strong>
          </li>;
        })}
      </ul>
      </>}
    </ScreenPanel>
  );
};

export const TeacherEvaluationFootprints = ({ teachers }: { teachers: LeaderReportTeacherUsage[] }) => {
  const top = teachers.filter(teacher => teacher.records > 0).sort((a, b) => b.records - a.records).slice(0, 10);
  const maximum = Math.max(1, ...top.map(teacher => teacher.records));
  if (!top.length) return <ScreenEmptyState>本周期暂无教师评价记录</ScreenEmptyState>;
  return (
    <ol className="evaluation-screen-teacher-list">
      {top.map((teacher, index) => <li key={teacher.id}>
        <span className="evaluation-screen-rank">{String(index + 1).padStart(2, '0')}</span>
        <span className="evaluation-screen-teacher-name">{teacher.name}</span>
        <div className="evaluation-screen-teacher-track"><span style={{ width: `${teacher.records / maximum * 100}%` }} /></div>
        <strong>{formatScreenNumber(teacher.records)}<small>次</small></strong>
      </li>)}
    </ol>
  );
};

const formatDelta = (delta: number) => `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta)}分`;
const indicatorPathLabel = (event: ScreenEvaluation) => event.indicatorPath?.join('-') ?? event.indicator;

export const LiveEvaluationFeed = ({ events }: { events: ScreenEvaluation[] }) => {
  const visibleEvents = events.slice(0, 5);
  return <div className="evaluation-screen-feed-window" aria-label="最新评价记录" aria-live="off">
    {!events.length ? <ScreenEmptyState>新的评价发生后将在这里播报</ScreenEmptyState> :
    <ol className="evaluation-screen-feed-track" key={events[0]?.id} style={{ gridTemplateRows: `repeat(${visibleEvents.length}, minmax(0, 1fr))` }}>
      {visibleEvents.map(event => {
        const delta = event.students[0]?.delta ?? 0;
        const path = indicatorPathLabel(event);
        return <li key={event.id} className={delta < 0 ? 'is-negative' : 'is-positive'} aria-label={`${formatScreenTime(event.occurredAt)}，${event.teacherName}，${path}，每人${formatDelta(delta)}`}>
          <time dateTime={new Date(event.occurredAt).toISOString()}>{formatScreenTime(event.occurredAt)}</time>
          <strong className="evaluation-screen-feed-teacher" title={event.teacherName}>{event.teacherName}</strong>
          <span className="evaluation-screen-feed-indicator" title={path}>{path}</span>
          <strong className="evaluation-screen-feed-delta">{formatDelta(delta)}</strong>
        </li>;
      })}
    </ol>}
  </div>;
};

export const StudentScoreChanges = ({ events }: { events: ScreenEvaluation[] }) => {
  const unique = new Set<string>();
  const changes = events.flatMap(event => event.students.map(student => ({ ...student, event }))).filter(student => {
    if (unique.has(student.studentId)) return false;
    unique.add(student.studentId);
    return true;
  }).slice(0, 5);
  return <div className="evaluation-screen-student-changes" aria-live="off">
    {!changes.length && <ScreenEmptyState>新的评价发生后，积分变化将在这里呈现</ScreenEmptyState>}
    {changes.map(student => {
      const name = maskScreenStudentName(student.displayName);
      const indicator = student.event.indicatorPath?.[0] ?? student.event.dimensionName;
      return <article key={`${student.event.id}-${student.studentId}`} className={student.delta < 0 ? 'is-negative' : 'is-positive'} aria-label={`${formatScreenTime(student.event.occurredAt)}，${name}，${indicator}，${formatDelta(student.delta)}`}>
        <time dateTime={new Date(student.event.occurredAt).toISOString()}>{formatScreenTime(student.event.occurredAt)}</time>
        <strong className="evaluation-screen-student-name">{name}</strong>
        <span className={`evaluation-screen-education-tag education-${student.event.dimension}`}>{indicator}</span>
        <b className="evaluation-screen-student-delta">{formatDelta(student.delta)}</b>
      </article>;
    })}
  </div>;
};

const IndicatorCoverageGauge = ({ label, covered, total, percent, accent }: {
  label: string; covered: number; total: number; percent: number; accent: boolean;
}) => {
  const id = useId().replace(/:/g, '');
  const arc = 'M41.816,116.184 A54,54 0 1,1 118.184,116.184';
  return <div className={`evaluation-screen-indicator-gauge ${accent ? 'is-accent' : ''}`}>
    <div className="evaluation-screen-indicator-label">{label}</div>
    <svg viewBox="0 0 160 146" role="img" aria-label={`${label}，${total ? `${percent}%` : '暂无指标'}，已使用${covered}，总指标${total}`}>
      <defs>
        <radialGradient id={`${id}-disc`}><stop offset="0" stopColor="#171514" /><stop offset="1" stopColor="#050504" /></radialGradient>
        <pattern id={`${id}-lines`} width="4" height="3" patternUnits="userSpaceOnUse"><path d="M0 1H4" stroke="#f3f0ea" strokeOpacity=".07" strokeWidth=".6" /></pattern>
      </defs>
      <circle cx="80" cy="78" r="52" fill={`url(#${id}-disc)`} />
      <circle cx="80" cy="78" r="52" fill={`url(#${id}-lines)`} />
      <path d={arc} className="evaluation-screen-gauge-track" />
      {percent > 0 && <path d={arc} className="evaluation-screen-gauge-value" pathLength="100" strokeDasharray={`${percent} 100`} />}
      <path d="M76 22H84L80 29Z M80 29V40" className="evaluation-screen-gauge-tick" />
      <text x="80" y="86" textAnchor="middle" className="evaluation-screen-gauge-percent">{total ? percent : '—'}{total > 0 && <tspan>%</tspan>}</text>
    </svg>
  </div>;
};

export const IndicatorUsage = ({ groups, period }: { groups: LeaderReportIndicatorGroupUsage[]; period: ScreenPeriod }) => {
  const coverage = screenIndicatorCoverage(groups, period);
  return <ScreenPanel title="指标使用情况">
    {!coverage.second.total && !coverage.third.total ? <ScreenEmptyState>暂无指标数据</ScreenEmptyState> :
    <div className="evaluation-screen-indicator-usage">
      <IndicatorCoverageGauge label="二级指标" {...coverage.second} accent={false} />
      <IndicatorCoverageGauge label="三级指标" {...coverage.third} accent />
    </div>}
  </ScreenPanel>;
};

export const GradeEvaluationRecords = ({ grades, page, onPageChange }: {
  grades: LeaderReportGradeCoverage[]; page: number; onPageChange: (page: number) => void;
}) => {
  const pages = Math.max(1, Math.ceil(grades.length / 6));
  const currentPage = page % pages;
  const maximum = Math.max(1, ...grades.map(grade => grade.evaluationRecords));
  const topGradeIds = new Set([...grades].sort((a, b) => b.evaluationRecords - a.evaluationRecords).filter(grade => grade.evaluationRecords > 0).slice(0, 3).map(grade => grade.id));
  return <ScreenPanel title="年级评价数" detail="记录条数" action={pages > 1 && <div className="evaluation-screen-pagination">
    <button type="button" aria-label="上一组年级评价数" onClick={() => onPageChange((currentPage + pages - 1) % pages)}><ScreenIcon name="previous" size={18} /></button>
    <span>{currentPage + 1}<small> / {pages}</small></span>
    <button type="button" aria-label="下一组年级评价数" onClick={() => onPageChange((currentPage + 1) % pages)}><ScreenIcon name="next" size={18} /></button>
  </div>}>
    {!grades.length ? <ScreenEmptyState>暂无年级评价记录</ScreenEmptyState> :
    <ul className="evaluation-screen-grade-records" key={currentPage}>
      {grades.slice(currentPage * 6, currentPage * 6 + 6).map(grade => <li key={grade.id} className={topGradeIds.has(grade.id) ? 'is-top-grade' : undefined} aria-label={`${grade.name}，${grade.evaluationRecords}条成长记录`}>
        <span>{grade.name}</span>
        <div className="evaluation-screen-coverage-track"><span style={{ width: `${grade.evaluationRecords / maximum * 100}%` }} /></div>
        <strong>{formatScreenNumber(grade.evaluationRecords)}<small>条</small></strong>
      </li>)}
    </ul>}
  </ScreenPanel>;
};
