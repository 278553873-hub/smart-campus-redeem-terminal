import React, { useId, type ReactNode } from 'react';
import type { LeaderReportSnapshot, LeaderReportFiveEducationStat, LeaderReportGradeCoverage, LeaderReportTeacherUsage } from '../../mobile-app/services/leaderReportService';
import type { MoralEducationCockpitSnapshot } from '../../mobile-app/services/moralEducationCockpitService';
import { percentage, type ScreenEvaluation, type ScreenPeriod } from './studentEvaluationScreenModel';
import { ScreenIcon } from './ScreenIcon';

export const formatScreenNumber = (value: number) => value.toLocaleString('zh-CN');
export const formatScreenTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });
const signed = (value: number) => `${value > 0 ? '+' : ''}${formatScreenNumber(value)}`;

export const ScreenPanel = ({ title, detail, children, className = '' }: {
  title: string; detail?: ReactNode; children: ReactNode; className?: string;
}) => {
  const titleId = useId();
  return <section className={`evaluation-screen-panel ${className}`} aria-labelledby={titleId}>
    <div className="evaluation-screen-panel-heading"><h2 id={titleId}>{title}</h2>{detail && <span className="evaluation-screen-panel-detail">{detail}</span>}</div>
    {children}
  </section>;
};

export function CoverageRing({ value, label, count, tone }: { value: number; label: string; count: string; tone: 'cyan' | 'violet' }) {
  const gradient = `coverage-${useId().replace(/:/g, '')}`;
  const circumference = 2 * Math.PI * 54;
  return <div className={`evaluation-screen-coverage-ring ${tone}`}>
    <svg viewBox="0 0 144 144" role="img" aria-label={`${label}${value}%，${count}`}>
      <defs><linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor={tone === 'cyan' ? '#079deb' : '#7658ed'} /><stop offset="1" stopColor={tone === 'cyan' ? '#35edee' : '#d1b1ff'} />
      </linearGradient></defs>
      <circle cx="72" cy="72" r="54" fill="none" stroke={tone === 'cyan' ? '#194d83' : '#383262'} strokeWidth="14" />
      <circle cx="72" cy="72" r="54" fill="none" stroke={`url(#${gradient})`} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${circumference * Math.min(100, Math.max(0, value)) / 100} ${circumference}`} transform="rotate(-90 72 72)" />
      <text x="72" y="71" textAnchor="middle" className="coverage-value">{value}<tspan fontSize="24">%</tspan></text>
      <text x="72" y="94" textAnchor="middle" className="coverage-label">{label}</text>
    </svg>
    <p>{count}</p>
  </div>;
}

export function CoverageSummary({ summary }: { summary: LeaderReportSnapshot['summary'] }) {
  return <ScreenPanel title="育人覆盖">
    <div className="evaluation-screen-coverage-rings">
      <CoverageRing value={summary.studentPercent} label="学生覆盖率" count={`${formatScreenNumber(summary.totalCoveredStudents)} / ${formatScreenNumber(summary.totalStudents)} 人`} tone="cyan" />
      <CoverageRing value={summary.teacherPercent} label="教师参与率" count={`${summary.activeTeachers} / ${summary.totalTeachers} 人`} tone="violet" />
    </div>
  </ScreenPanel>;
}

const educationStyles = {
  virtue: { color: '#55b6ff', light: '#8ad7ff', label: [502, 42], dock: [480, 47] },
  wisdom: { color: '#9765fa', light: '#d5acff', label: [560, 141], dock: [542, 146] },
  fitness: { color: '#00cbee', light: '#32edf5', label: [62, 236], dock: [219, 243] },
  aesthetic: { color: '#41df87', light: '#8df3af', label: [56, 112], dock: [216, 119] },
  labor: { color: '#efb03e', light: '#ffd270', label: [151, 35], dock: [288, 42] },
} as const;

export const FiveEducationDistribution = ({ dimensions }: { dimensions: LeaderReportFiveEducationStat[] }) => {
  const id = useId().replace(/:/g, '');
  const total = dimensions.reduce((sum, item) => sum + item.eventCount, 0);
  const positive = dimensions.reduce((sum, item) => sum + item.positiveEventCount, 0);
  const negative = dimensions.reduce((sum, item) => sum + item.negativeEventCount, 0);
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;
  const segments = dimensions.map(dimension => {
    const ratio = total ? dimension.eventCount / total : 0;
    const start = cursor;
    cursor += ratio;
    const angle = (start + ratio / 2) * Math.PI * 2 - Math.PI / 2;
    return { ...dimension, ratio, offset: start * circumference, point: [360 + 124 * Math.cos(angle), 141 + 124 * Math.sin(angle)] };
  });
  return <div className="evaluation-screen-five-education">
    <svg className="evaluation-screen-donut" viewBox="0 0 720 280" role="img" aria-label={`五育事件${total}件。${dimensions.map(d => `${d.name}${d.eventCount}件`).join('，')}`}>
      <defs>{segments.map(segment => <linearGradient key={segment.key} id={`education-${id}-${segment.key}`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor={educationStyles[segment.key].color} /><stop offset="1" stopColor={educationStyles[segment.key].light} />
      </linearGradient>)}</defs>
      <circle cx="360" cy="141" r={radius} fill="none" stroke="#1c3558" strokeWidth="46" />
      {segments.map(segment => {
        const style = educationStyles[segment.key];
        return <g key={segment.key}>
          <circle cx="360" cy="141" r={radius} fill="none" stroke={`url(#education-${id}-${segment.key})`} strokeWidth="46"
            strokeDasharray={`${Math.max(0, segment.ratio * circumference - 1.5)} ${circumference}`}
            strokeDashoffset={-segment.offset} transform="rotate(-90 360 141)" />
          {segment.ratio > 0 && <g stroke={style.light} fill="none" strokeWidth="1.5">
            <path d={`M ${segment.point[0]} ${segment.point[1]} Q ${(segment.point[0] + style.dock[0]) / 2} ${style.dock[1]} ${style.dock[0]} ${style.dock[1]}`} />
            <circle cx={segment.point[0]} cy={segment.point[1]} r="3" fill="#ecf7ff" stroke="none" />
          </g>}
          <g transform={`translate(${style.label[0]} ${style.label[1] - 17})`}>
            <ScreenIcon name={segment.key} size={30} color={style.light} />
            <text x="41" y="16" className="education-label">{segment.name}</text>
            <text x="41" y="45" className="education-value">{formatScreenNumber(segment.eventCount)}<tspan fontSize="16" fontWeight="400"> 件</tspan></text>
          </g>
        </g>;
      })}
      <text x="360" y="145" textAnchor="middle" className="education-total">{formatScreenNumber(total)}</text>
      <text x="360" y="175" textAnchor="middle" className="education-total-label">{total ? '五育事件' : '暂无评价事件'}</text>
    </svg>
    <div className="evaluation-screen-event-summary"><span>正向 <b>{formatScreenNumber(positive)}</b> 件</span><i /><span>待改进 <b>{formatScreenNumber(negative)}</b> 件</span></div>
  </div>;
};

export function GradeCoverage({ grades, page = 0, onPageChange, selectedGrade, onSelect }: {
  grades: LeaderReportGradeCoverage[]; page?: number; onPageChange?: (page: number) => void; selectedGrade?: string; onSelect?: (id: string) => void;
}) {
  const pages = Math.max(1, Math.ceil(grades.length / 12));
  const current = page % pages;
  const rows = grades.slice(current * 12, current * 12 + 12);
  return <ScreenPanel title="年级评价覆盖" detail={pages > 1 ? <button className="evaluation-screen-text-button" onClick={() => onPageChange?.((current + 1) % pages)}>下一组 {current + 1}/{pages}</button> : '单位：%'}>
    <div className="evaluation-screen-grade-list" style={{ gridTemplateRows: `repeat(${Math.max(1, Math.ceil(rows.length / 2))}, minmax(0, 1fr))` }}>
      {!rows.length && <p className="evaluation-screen-empty">暂无年级评价数据</p>}
      {rows.map(grade => {
        const value = percentage(grade.covered, grade.total);
        const content = <><span>{grade.name}</span><span className="evaluation-screen-progress-track"><i style={{ width: `${value}%` }} /></span><b>{value}%</b></>;
        const label = `${grade.name}，已覆盖${grade.covered}人，共${grade.total}人，覆盖率${value}%`;
        return onSelect ? <button key={grade.id} className="evaluation-screen-grade-row" aria-label={label} aria-pressed={grade.id === selectedGrade} onClick={() => onSelect(grade.id)}>{content}</button>
          : <div key={grade.id} className="evaluation-screen-grade-row" aria-label={label} title={label}>{content}</div>;
      })}
    </div>
  </ScreenPanel>;
}

export function CompactBars({ rows, tone = 'cyan', unit = '次' }: { rows: { id: string; name: string; value: number }[]; tone?: 'cyan' | 'violet'; unit?: string }) {
  const maximum = Math.max(1, ...rows.map(row => row.value));
  return <ol className={`evaluation-screen-bars tone-${tone}`}>
    {!rows.length && <li className="evaluation-screen-empty">暂无评价记录</li>}
    {rows.map(row => <li key={row.id} aria-label={`${row.name}${row.value}${unit}`}>
      <span className="evaluation-screen-bar-name" title={row.name}>{row.name}</span>
      <span className="evaluation-screen-progress-track"><i style={{ width: `${row.value / maximum * 100}%` }} /></span>
      <b>{formatScreenNumber(row.value)}</b>
    </li>)}
  </ol>;
}

export function TeacherEvaluationFootprints({ teachers }: { teachers: LeaderReportTeacherUsage[] }) {
  return <CompactBars rows={[...teachers].sort((a, b) => b.records - a.records).slice(0, 6).map(teacher => ({ id: teacher.id, name: teacher.name, value: teacher.records }))} />;
}

export function IndicatorUsage({ report, period }: { report: LeaderReportSnapshot; period: ScreenPeriod }) {
  const field = period === 'term' ? 'termCount' : period === 'month' ? 'monthCount' : 'weekCount';
  const rows = report.indicatorUsage.flatMap(group => group.children.flatMap(category => category.children));
  const active = rows.filter(row => row[field] > 0).length;
  return <ScreenPanel title="高频行为指标" detail={`已用 ${active}/${rows.length} 项`} className="evaluation-screen-compact-panel">
    <CompactBars rows={[...rows].sort((a, b) => b[field] - a[field]).slice(0, 6).map(row => ({ id: row.id, name: row.name, value: row[field] }))} tone="violet" />
  </ScreenPanel>;
}

export const FiveEducationScores = ({ dimensions }: { dimensions: LeaderReportFiveEducationStat[] }) => {
  const plus = dimensions.reduce((sum, d) => sum + d.plusScore, 0);
  const minus = dimensions.reduce((sum, d) => sum + d.minusScore, 0);
  return <div className="evaluation-screen-scores">
    <table><caption className="sr-only">五育加分、扣分和净分明细，单位分</caption>
      <thead><tr><th scope="col">维度</th><th scope="col">加分</th><th scope="col">扣分</th><th scope="col">净分</th></tr></thead>
      <tbody>{dimensions.map(d => <tr key={d.key}><th scope="row">{d.name}</th><td className="is-positive">+{formatScreenNumber(d.plusScore)}</td><td className="is-negative">{d.minusScore ? '-' : ''}{formatScreenNumber(d.minusScore)}</td><td className={d.netScore < 0 ? 'is-negative' : d.netScore > 0 ? 'is-positive' : ''}>{signed(d.netScore)}</td></tr>)}</tbody>
    </table>
    <div className="evaluation-screen-score-summary"><span>加分 {formatScreenNumber(plus)}</span><span>扣分 {formatScreenNumber(minus)}</span><span>净分 <b className={plus >= minus ? 'is-positive' : 'is-negative'}>{signed(plus - minus)}</b></span></div>
  </div>;
};

export const classScope = (report: MoralEducationCockpitSnapshot) => `${report.grades.every(grade => /^[一二三四五六]年级$/.test(grade.name)) ? '小学部' : '参评班级'} · ${report.classRanking.length}个班`;
export function ClassPerformance({ report }: { report?: MoralEducationCockpitSnapshot }) {
  const dimensions = report?.gradeReports.find(grade => grade.gradeId === 'all')?.dimensions ?? [];
  return <ScreenPanel title="班级常规表现" detail={report ? <>{classScope(report)}<br />截至 {report.period.endDate.slice(5).replace('-', '.')}</> : undefined}>
    {!report ? <p className="evaluation-screen-empty">暂无班级评价数据</p> : <>
      <div className="evaluation-screen-class-average"><span>班级均分</span><strong>{report.summary.averageScore.toFixed(1)}</strong><span>/ {report.summary.maxScore}</span></div>
      <ul className="evaluation-screen-class-dimensions">{dimensions.map(d => <li key={d.id}>
        <span>{d.name}</span><span className="evaluation-screen-progress-track"><i style={{ width: `${percentage(d.averageScore, d.maxScore)}%` }} /></span><b>{d.averageScore.toFixed(1)} <small>/ {d.maxScore}</small></b>
      </li>)}</ul>
    </>}
  </ScreenPanel>;
}

export function CompactActivity({ events, playing }: { events: ScreenEvaluation[]; playing: boolean }) {
  const students = events.flatMap(event => event.students.map(student => ({ ...student, event }))).slice(0, 2);
  return <footer className={`evaluation-screen-activity ${playing ? '' : 'is-paused'}`} aria-label="评价动态演示" aria-live="off">
    <section><div className="evaluation-screen-activity-heading"><ScreenIcon name="records" /><div><h2>教师评价动态</h2><span>{playing ? '动态示例' : '播报已暂停'}</span></div></div>
      <div className="evaluation-screen-feed-window"><ol key={events[0]?.id}>{!events.length && <li>暂无评价记录</li>}{events.slice(0, 2).map(event => <li key={event.id}>
        <time dateTime={new Date(event.occurredAt).toISOString()}>{formatScreenTime(event.occurredAt)}</time><strong>{event.teacherName}</strong><span>{event.className}</span><span className="evaluation-screen-feed-indicator" title={event.indicator}>{event.indicator}</span><b>{event.students.length}人</b>
      </li>)}</ol></div>
    </section>
    <section><div className="evaluation-screen-activity-heading"><ScreenIcon name="students" /><div><h2>学生得分动态</h2><span>{playing ? '动态示例' : '播报已暂停'}</span></div></div>
      <div className="evaluation-screen-feed-window"><ol key={students[0]?.event.id}>{!students.length && <li>暂无得分记录</li>}{students.map(student => <li key={`${student.event.id}-${student.studentId}`}>
        <time dateTime={new Date(student.event.occurredAt).toISOString()}>{formatScreenTime(student.event.occurredAt)}</time><strong>{student.displayName}</strong><span>{student.event.className}</span><span className="evaluation-screen-feed-indicator" title={student.event.indicator}>{student.event.indicator}</span><b className={student.delta < 0 ? 'is-negative' : 'is-positive'}>{signed(student.delta)}分</b>
      </li>)}</ol></div>
    </section>
  </footer>;
}

export function StudentClassCoverage({ grade }: { grade?: LeaderReportGradeCoverage }) {
  return <ScreenPanel title={grade ? `${grade.name} · 班级评价覆盖` : '班级评价覆盖'} detail="成长记录按学生计条" className="evaluation-screen-class-coverage">
    {!grade ? <p className="evaluation-screen-empty">暂无班级评价数据</p> : <>
      <div className="evaluation-screen-detail-summary"><span>已覆盖 <b>{grade.covered}</b> / {grade.total} 人</span><span>覆盖率 <b>{percentage(grade.covered, grade.total)}%</b></span></div>
      <table className="evaluation-screen-detail-table"><thead><tr><th>班级</th><th>学生覆盖</th><th>覆盖率</th><th>成长记录</th></tr></thead>
        <tbody>{grade.classes.map(item => <tr key={item.id}><th scope="row">{item.name}</th><td>{item.covered} / {item.total} 人</td><td><span className="evaluation-screen-inline-meter"><i style={{ width: `${percentage(item.covered, item.total)}%` }} /></span>{percentage(item.covered, item.total)}%</td><td>{formatScreenNumber(item.evaluationRecords)} 条</td></tr>)}</tbody>
      </table>
    </>}
  </ScreenPanel>;
}

export function ClassGradeDetails({ report, selectedGrade, onSelect }: { report?: MoralEducationCockpitSnapshot; selectedGrade: string; onSelect: (id: string) => void }) {
  const grade = report?.grades.find(item => item.id === selectedGrade) ?? report?.grades[0];
  const detail = report?.gradeReports.find(item => item.gradeId === grade?.id);
  const problems = detail?.problemDimensions.flatMap(d => d.categories).sort((a, b) => b.recordCount - a.recordCount).slice(0, 6) ?? [];
  return <ScreenPanel title="班级评价明细" detail={report?.period.label} className="evaluation-screen-class-detail">
    {!report ? <p className="evaluation-screen-empty">暂无班级评价数据</p> : <>
      <div className="evaluation-screen-grade-filters" aria-label="选择班级评价年级">{report.grades.map(item => <button key={item.id} aria-pressed={grade?.id === item.id} onClick={() => onSelect(item.id)}>{item.name}</button>)}</div>
      <table className="evaluation-screen-detail-table"><thead><tr><th>班级</th><th>班级得分</th><th>累计扣分</th><th>问题记录</th></tr></thead><tbody>{grade?.classes.map(item => <tr key={item.id}><th scope="row">{item.name}</th><td>{item.score.toFixed(1)} / {item.maxScore}</td><td>{item.deduction.toFixed(1)} 分</td><td>{item.issueCount} 条</td></tr>)}</tbody></table>
      <div className="evaluation-screen-class-problems"><h3>常规关注事项 <span>问题记录条数</span></h3><CompactBars rows={problems.map(item => ({ id: item.id, name: item.name, value: item.recordCount }))} tone="violet" unit="条" /></div>
    </>}
  </ScreenPanel>;
}
