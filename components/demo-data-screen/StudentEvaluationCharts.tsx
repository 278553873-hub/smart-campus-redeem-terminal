import React, { useId, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LeaderReportGradeCoverage, LeaderReportTeacherUsage } from '../../mobile-app/services/leaderReportService';
import { maskScreenStudentName, screenIndicatorCoverage, percentage, type ScreenPeriod, type ScreenEvaluation, type ScreenIndicatorGroupUsage } from './studentEvaluationScreenModel';

export const formatScreenNumber = (value: number) => value.toLocaleString('zh-CN');
export const formatScreenTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });
export const formatScreenUpdatedAt = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${formatScreenTime(timestamp)}`;
};
export const formatScreenWeekday = (timestamp: number) => new Date(timestamp).toLocaleDateString('zh-CN', { weekday: 'long' });

const CoverageGradient = ({ id }: { id: string }) => <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
  <stop stopColor="var(--es-gold-light)" />
  <stop offset=".32" stopColor="var(--es-gold-highlight)" />
  <stop offset=".64" stopColor="var(--es-gold-main)" />
  <stop offset="1" stopColor="var(--es-gold-deep)" />
</linearGradient>;

const ScreenEmptyState = ({ children }: { children: ReactNode }) => <p className="demo-evaluation-screen-empty">{children}</p>;

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

export const GradeCoverage = ({ grades, page, onPageChange }: {
  grades: LeaderReportGradeCoverage[]; page: number; onPageChange: (page: number) => void;
}) => {
  const id = `demo-grade-coverage-${useId().replace(/:/g, '')}`;
  const pages = Math.max(1, Math.ceil(grades.length / 6));
  const currentPage = page % pages;
  return (
    <ScreenPanel title="学生覆盖率" action={pages > 1 && <div className="demo-evaluation-screen-pagination">
      <button type="button" aria-label="上一组年级" onClick={() => onPageChange((currentPage + pages - 1) % pages)}><ChevronLeft size={18} /></button>
      <span>{currentPage + 1}<small> / {pages}</small></span>
      <button type="button" aria-label="下一组年级" onClick={() => onPageChange((currentPage + 1) % pages)}><ChevronRight size={18} /></button>
    </div>}>
      {!grades.length ? <ScreenEmptyState>暂无年级学生数据，请在学校后台完善</ScreenEmptyState> : <>
      <ul className="demo-evaluation-screen-grade-coverage-grid" key={currentPage}>
        {grades.slice(currentPage * 6, currentPage * 6 + 6).map((grade, index) => {
          const percent = percentage(grade.covered, grade.total);
          const highCoverage = grade.total > 0 && percent >= 80;
          const gradientId = `${id}-${index}-gold`;
          return <li key={grade.id} className={highCoverage ? 'is-high-coverage' : undefined} style={{ '--es-coverage-color': highCoverage ? `url(#${gradientId})` : 'var(--es-text)' } as CSSProperties}>
            <div className="demo-evaluation-screen-grade-ring" role="meter" aria-label={`${grade.name}学生评价覆盖率`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-valuetext={grade.total ? `${percent}%` : '暂无学生数据'}>
              <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                <defs><CoverageGradient id={gradientId} /></defs>
                <circle className="demo-evaluation-screen-grade-ring-track" cx="50" cy="50" r="41" />
                {percent > 0 && <circle className="demo-evaluation-screen-grade-ring-value" cx="50" cy="50" r="41" pathLength="100" strokeDasharray={`${percent} 100`} transform="rotate(-90 50 50)" />}
                <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" className="demo-evaluation-screen-grade-ring-percent">{grade.total ? percent : '—'}{grade.total > 0 && <tspan>%</tspan>}</text>
              </svg>
            </div>
            <span className="demo-evaluation-screen-grade-name">{grade.name}</span>
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
  if (!top.length) return <ScreenEmptyState>本周期暂无教师使用记录</ScreenEmptyState>;
  return (
    <ol className="demo-evaluation-screen-teacher-list">
      {top.map((teacher, index) => <li key={teacher.id}>
        <span className="demo-evaluation-screen-rank">{String(index + 1).padStart(2, '0')}</span>
        <span className="demo-evaluation-screen-teacher-name">{teacher.name}</span>
        <div className="demo-evaluation-screen-teacher-track"><span style={{ width: `${teacher.records / maximum * 100}%` }} /></div>
        <strong>{formatScreenNumber(teacher.records)}<small>次</small></strong>
      </li>)}
    </ol>
  );
};

const formatDelta = (delta: number) => `${delta > 0 ? '+' : delta < 0 ? '-' : ''}${Math.abs(delta)}分`;
const indicatorPathLabel = (event: ScreenEvaluation) => event.indicatorPath?.join('-') ?? event.indicator;

export const LiveEvaluationFeed = ({ events }: { events: ScreenEvaluation[] }) => {
  const visibleEvents = events.slice(0, 5);
  return <div className="demo-evaluation-screen-feed-window" aria-label="最新评价记录" aria-live="off">
    {!events.length ? <ScreenEmptyState>新的评价发生后将在这里播报</ScreenEmptyState> :
    <ol className="demo-evaluation-screen-feed-track" key={events[0]?.id} style={{ gridTemplateRows: `repeat(${visibleEvents.length}, minmax(0, 1fr))` }}>
      {visibleEvents.map(event => {
        const path = indicatorPathLabel(event);
        const teacher = event.teacherName.endsWith('老师') ? event.teacherName : `${event.teacherName}老师`;
        return <li key={event.id} aria-label={`${formatScreenTime(event.occurredAt)} ${teacher}，对学生的“${path}”事件进行了记录。`}>
          <time dateTime={new Date(event.occurredAt).toISOString()}>{formatScreenTime(event.occurredAt)}</time>
          <p className="demo-evaluation-screen-record-sentence"><strong className="demo-evaluation-screen-feed-teacher">{teacher}</strong>，对学生的“<span className="demo-evaluation-screen-feed-indicator">{path}</span>”事件进行了记录。</p>
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
  return <div className="demo-evaluation-screen-student-changes" aria-live="off">
    {!changes.length && <ScreenEmptyState>新的评价发生后，积分变化将在这里呈现</ScreenEmptyState>}
    {changes.map(student => {
      const name = maskScreenStudentName(student.displayName);
      const indicator = student.event.indicatorPath?.[0] ?? student.event.dimensionName;
      const description = student.delta > 0 ? '获得表扬' : student.delta < 0 ? '有待改进的事件' : '有新的事件记录';
      return <article key={`${student.event.id}-${student.studentId}`} className={`education-${student.event.dimension}`} aria-label={`${formatScreenTime(student.event.occurredAt)} ${name}同学，在“${indicator}”上${description}，${formatDelta(student.delta)}。`}>
        <time dateTime={new Date(student.event.occurredAt).toISOString()}>{formatScreenTime(student.event.occurredAt)}</time>
        <p className="demo-evaluation-screen-record-sentence"><strong className="demo-evaluation-screen-student-name">{name}同学</strong>，在“<span className="demo-evaluation-screen-education-tag">{indicator}</span>”上{description}，<b className={`demo-evaluation-screen-student-delta ${student.delta < 0 ? 'is-negative' : student.delta > 0 ? 'is-positive' : ''}`}>{formatDelta(student.delta)}</b>。</p>
      </article>;
    })}
  </div>;
};

const IndicatorCoverageGauge = ({ label, covered, total, percent }: {
  label: string; covered: number; total: number; percent: number;
}) => {
  const id = useId().replace(/:/g, '');
  const arc = 'M41.816,116.184 A54,54 0 1,1 118.184,116.184';
  const highCoverage = total > 0 && percent >= 80;
  return <div className={`demo-evaluation-screen-indicator-gauge${highCoverage ? ' is-high-coverage' : ''}`} style={{ '--es-coverage-color': highCoverage ? `url(#${id}-gold)` : 'var(--es-text)' } as CSSProperties}>
    <div className="demo-evaluation-screen-indicator-label">{label}</div>
    <svg viewBox="20 14 120 124" role="img" aria-label={`${label}，${total ? `${percent}%` : '暂无指标'}，已使用${covered}，总指标${total}`}>
      <defs>
        <CoverageGradient id={`${id}-gold`} />
        <radialGradient id={`${id}-disc`}><stop offset="0" stopColor="var(--es-gauge-disc-inner, #171514)" /><stop offset="1" stopColor="var(--es-gauge-disc-outer, #050504)" /></radialGradient>
        <pattern id={`${id}-lines`} width="4" height="3" patternUnits="userSpaceOnUse"><path d="M0 1H4" stroke="var(--es-text)" strokeOpacity=".07" strokeWidth=".6" /></pattern>
      </defs>
      <circle cx="80" cy="78" r="52" fill={`url(#${id}-disc)`} />
      <circle cx="80" cy="78" r="52" fill={`url(#${id}-lines)`} />
      <path d={arc} className="demo-evaluation-screen-gauge-track" />
      {percent > 0 && <path d={arc} className="demo-evaluation-screen-gauge-value" pathLength="100" strokeDasharray={`${percent} 100`} />}
      <path d="M76 22H84L80 29Z M80 29V40" className="demo-evaluation-screen-gauge-tick" />
      <text x="80" y="86" textAnchor="middle" className="demo-evaluation-screen-gauge-percent">{total ? percent : '—'}{total > 0 && <tspan>%</tspan>}</text>
    </svg>
  </div>;
};

export const IndicatorUsage = ({ groups, period }: { groups: ScreenIndicatorGroupUsage[]; period: ScreenPeriod }) => {
  const coverage = screenIndicatorCoverage(groups, period);
  return <ScreenPanel title="指标使用情况">
    {!coverage.second.total && !coverage.third.total ? <ScreenEmptyState>暂无指标数据</ScreenEmptyState> :
    <div className="demo-evaluation-screen-indicator-usage">
      <IndicatorCoverageGauge label="二级指标" {...coverage.second} />
      <IndicatorCoverageGauge label="三级指标" {...coverage.third} />
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
  return <ScreenPanel title="年级记录数" action={pages > 1 && <div className="demo-evaluation-screen-pagination">
    <button type="button" aria-label="上一组年级记录数" onClick={() => onPageChange((currentPage + pages - 1) % pages)}><ChevronLeft size={18} /></button>
    <span>{currentPage + 1}<small> / {pages}</small></span>
    <button type="button" aria-label="下一组年级记录数" onClick={() => onPageChange((currentPage + 1) % pages)}><ChevronRight size={18} /></button>
  </div>}>
    {!grades.length ? <ScreenEmptyState>暂无年级记录</ScreenEmptyState> :
    <ul className="demo-evaluation-screen-grade-records" key={currentPage}>
      {grades.slice(currentPage * 6, currentPage * 6 + 6).map(grade => <li key={grade.id} className={topGradeIds.has(grade.id) ? 'is-top-grade' : undefined} aria-label={`${grade.name}，${grade.evaluationRecords}条成长记录`}>
        <div className="demo-evaluation-screen-grade-column-area" aria-hidden="true">
          <div className="demo-evaluation-screen-grade-column" style={{ height: `${grade.evaluationRecords / maximum * 100}%` }}>
            <strong>{formatScreenNumber(grade.evaluationRecords)}</strong>
          </div>
        </div>
        <span className="demo-evaluation-screen-grade-name">{grade.name}</span>
      </li>)}
    </ul>}
  </ScreenPanel>;
};
