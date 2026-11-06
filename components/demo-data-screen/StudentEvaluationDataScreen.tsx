import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, Maximize, Minimize, Pause, Play, Radio, RefreshCw, Users, UserCheck, NotebookPen, ListChecks } from 'lucide-react';
import { FiveEducationDistribution, FiveEducationScores, GradeCoverage, LiveEvaluationFeed, ScreenPanel, StudentScoreChanges, TeacherEvaluationFootprints, formatScreenNumber, formatScreenTime } from './StudentEvaluationCharts';
import { SCREEN_PERIODS, screenScoreTotals, type EvaluationScreenSnapshot, type ScreenPeriod } from './studentEvaluationScreenModel';
import { useStudentEvaluationScreen } from './useStudentEvaluationScreen';
import './studentEvaluationDataScreen.css';

export const EvaluationScreenContent = ({ snapshot, gradePage, onGradePageChange, playing }: {
  snapshot: EvaluationScreenSnapshot; gradePage: number; onGradePageChange: (page: number) => void; playing: boolean;
}) => {
  const { report } = snapshot;
  const { summary } = report;
  const totals = screenScoreTotals(snapshot);
  const metrics = [
    { label: '评价次数', value: summary.totalRecords, unit: '次', detail: '一次评价，一份关注', icon: NotebookPen, tone: 'blue' },
    { label: '成长记录条数', value: summary.totalEvaluationCount, unit: '条', detail: '记录每个孩子的成长', icon: ListChecks, tone: 'mint' },
    { label: '学生评价覆盖率', value: summary.studentPercent, unit: '%', detail: `${formatScreenNumber(summary.totalCoveredStudents)} / ${formatScreenNumber(summary.totalStudents)} 名学生`, icon: Users, tone: 'violet' },
    { label: '教师参与率', value: summary.teacherPercent, unit: '%', detail: `${summary.activeTeachers} / ${summary.totalTeachers} 位教师`, icon: UserCheck, tone: 'gold' },
  ];
  return <>
    <section className="demo-evaluation-screen-metrics" aria-label="学校学生评价概况">
      {metrics.map(metric => <div className={`demo-evaluation-screen-metric metric-${metric.tone}`} key={metric.label}>
        <div className="demo-evaluation-screen-metric-label"><span>{metric.label}</span><metric.icon size={22} strokeWidth={1.6} aria-hidden="true" /></div>
        <div className="demo-evaluation-screen-metric-value"><strong>{formatScreenNumber(metric.value)}</strong><span>{metric.unit}</span></div>
        <div className="demo-evaluation-screen-metric-detail">{metric.detail}</div>
      </div>)}
    </section>
    <main className="demo-evaluation-screen-grid">
      <div className="demo-evaluation-screen-column">
        <ScreenPanel title="五育并举，向阳生长" detail="已归类行为分布">
          <FiveEducationDistribution dimensions={report.fiveEducationStats} />
        </ScreenPanel>
        <ScreenPanel title="教师育人足迹" detail="按评价次数">
          <TeacherEvaluationFootprints teachers={report.teachers} />
          <div className="demo-evaluation-screen-panel-bottom"><span>每一次评价，都是教育的发生</span><span>{summary.activeTeachers}位教师参与</span></div>
        </ScreenPanel>
      </div>
      <div className="demo-evaluation-screen-column">
        <ScreenPanel title="五育加减分" detail="累计分值">
          <div className="demo-evaluation-screen-score-totals"><span className="is-positive">+{formatScreenNumber(totals.plus)}<small>分</small></span><span className="is-negative">−{formatScreenNumber(totals.minus)}<small>分</small></span></div>
          <FiveEducationScores dimensions={report.fiveEducationStats} />
        </ScreenPanel>
        <GradeCoverage grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} />
      </div>
      <div className="demo-evaluation-screen-column demo-evaluation-screen-live-column">
        <ScreenPanel title="校园评价正在发生" action={<span className={`demo-evaluation-screen-live-label ${playing ? '' : 'is-paused'}`}><span />{playing ? '实时播报' : '播报暂停'}</span>} className="demo-evaluation-screen-feed-panel">
          <LiveEvaluationFeed events={snapshot.recentEvaluations} />
        </ScreenPanel>
        <ScreenPanel title="学生积分变化" detail="本学期累计净得分">
          <StudentScoreChanges events={snapshot.recentEvaluations} />
        </ScreenPanel>
      </div>
    </main>
  </>;
};

const StudentEvaluationDataScreen: React.FC = () => {
  const [period, setPeriod] = useState<ScreenPeriod>('week');
  const [playing, setPlaying] = useState(true);
  const [gradePage, setGradePage] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const screenRef = useRef<HTMLDivElement>(null);
  const { periods, error, retry, visible, reducedMotion } = useStudentEvaluationScreen(playing);
  const snapshot = periods?.[period];
  const gradePages = Math.max(1, Math.ceil((snapshot?.report.gradeCoverages.length ?? 0) / 6));

  useEffect(() => {
    if (!visible) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (!playing || !visible || reducedMotion || gradePages < 2) return;
    const timer = window.setInterval(() => setGradePage(page => (page + 1) % gradePages), 15600);
    return () => window.clearInterval(timer);
  }, [playing, visible, reducedMotion, gradePages]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(document.fullscreenElement === screenRef.current);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (screenRef.current?.requestFullscreen) await screenRef.current.requestFullscreen();
      else setNotice('当前环境不支持页面全屏，可使用浏览器的全屏功能。');
    } catch {
      setNotice('未能进入全屏，请重试或使用浏览器的全屏功能。');
    }
  };

  return (
    <div ref={screenRef} className={`demo-student-evaluation-data-screen ${playing ? '' : 'is-paused'} ${reducedMotion ? 'has-reduced-motion' : ''}`}>
      <header className="demo-evaluation-screen-header">
        <div className="demo-evaluation-screen-brand"><span className="demo-evaluation-screen-school-mark"><GraduationCap aria-hidden="true" strokeWidth={1.5} /></span><div><div className="demo-evaluation-screen-school">{snapshot?.schoolName ?? '星河实验学校'}</div><h1>学生评价<span>成长全景</span></h1></div></div>
        <div className="demo-evaluation-screen-header-center"><span className="demo-evaluation-screen-motto-line" /><span>让每一份成长，都被看见</span><span className="demo-evaluation-screen-motto-line" /></div>
        <div className="demo-evaluation-screen-header-right">
          <div className="demo-evaluation-screen-clock"><time dateTime={new Date(now).toISOString()}>{formatScreenTime(now)}</time><span>{new Date(now).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span></div>
          <div className="demo-evaluation-screen-controls">
            <label className="demo-evaluation-screen-period"><span className="sr-only">统计周期</span><select value={period} onChange={event => setPeriod(event.target.value as ScreenPeriod)}>{SCREEN_PERIODS.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}</select></label>
            <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? '暂停播报' : '继续播报'} title={playing ? '暂停播报' : '继续播报'}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'} title={fullscreen ? '退出全屏' : '进入全屏'}>{fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}</button>
          </div>
        </div>
      </header>
      {snapshot ? <EvaluationScreenContent snapshot={snapshot} gradePage={gradePage} onGradePageChange={setGradePage} playing={playing} /> : <main className="demo-evaluation-screen-loading" role="status">
        {error ? <><span>评价数据暂时未能加载</span><button type="button" onClick={retry}><RefreshCw size={18} />重新加载</button></> : <><span className="demo-evaluation-screen-loading-dot" />正在汇聚校园成长数据</>}
      </main>}
      <footer className="demo-evaluation-screen-footer">
        <div><span className="demo-evaluation-screen-footer-brand">立德树人 · 五育并举</span><span className="demo-evaluation-screen-footer-divider" /><span>学生评价数据大屏</span></div>
        <div><span className="demo-evaluation-screen-demo-label">演示数据</span><Radio size={15} aria-hidden="true" /><span>{playing ? '实时演示' : '演示已暂停'}</span><span className="demo-evaluation-screen-footer-divider" /><span>数据更新 {snapshot ? formatScreenTime(snapshot.updatedAt) : '—'}</span></div>
      </footer>
      <div className="demo-evaluation-screen-notice" role="status">{notice}</div>
    </div>
  );
};

export default StudentEvaluationDataScreen;
