import React, { useEffect, useState } from 'react';
import { GraduationCap, Maximize, Minimize, RefreshCw, Users, UserCheck, NotebookPen, ListChecks } from 'lucide-react';
import { FiveEducationScores, GradeCoverage, GradeEvaluationRecords, IndicatorUsage, LiveEvaluationFeed, ScreenPanel, StudentScoreChanges, TeacherEvaluationFootprints, formatScreenNumber, formatScreenTime } from './StudentEvaluationCharts';
import { FiveEducationHero } from './FiveEducationHero';
import { ScreenBackground } from './ScreenBackground';
import { SCREEN_PERIODS, screenScoreTotals, type EvaluationScreenSnapshot } from './studentEvaluationScreenModel';
import { useStudentEvaluationScreen } from './useStudentEvaluationScreen';
import { useScreenCanvasLayout } from './useScreenCanvasLayout';
import './studentEvaluationDataScreen.css';

export const EvaluationScreenContent = ({ snapshot, liveSnapshot = snapshot, gradePage, onGradePageChange, visible = true, reducedMotion = false }: {
  snapshot: EvaluationScreenSnapshot; liveSnapshot?: EvaluationScreenSnapshot; gradePage: number; onGradePageChange: (page: number) => void; visible?: boolean; reducedMotion?: boolean;
}) => {
  const { report } = snapshot;
  const { summary } = report;
  const totals = screenScoreTotals(snapshot);
  const periodLabel = SCREEN_PERIODS.find(option => option.key === snapshot.period)?.label ?? '';
  const metrics = [
    { label: '评价次数', value: summary.totalRecords, unit: '次', detail: '', icon: NotebookPen, emphasis: 'primary' },
    { label: '成长记录条数', value: summary.totalEvaluationCount, unit: '条', detail: '', icon: ListChecks, emphasis: 'neutral' },
    { label: '学生覆盖率', value: summary.studentPercent, unit: '%', detail: `${formatScreenNumber(summary.totalCoveredStudents)} / ${formatScreenNumber(summary.totalStudents)}人`, icon: Users, emphasis: 'neutral' },
    { label: '教师参与率', value: summary.teacherPercent, unit: '%', detail: `${summary.activeTeachers} / ${summary.totalTeachers}位教师`, icon: UserCheck, emphasis: 'neutral' },
  ];
  return <main className="demo-evaluation-screen-workspace">
    <aside className="demo-evaluation-screen-side demo-evaluation-screen-left" aria-label="评价概况与教师排行">
      <section className="demo-evaluation-screen-metrics" aria-label={`${periodLabel}学校学生评价概况`}>
        {metrics.map(metric => <div className="demo-evaluation-screen-metric" data-emphasis={metric.emphasis} key={metric.label}>
          <div className="demo-evaluation-screen-metric-label"><span>{metric.label}</span><metric.icon size={18} strokeWidth={1.6} aria-hidden="true" /></div>
          <div className="demo-evaluation-screen-metric-value"><strong>{formatScreenNumber(metric.value)}</strong><span>{metric.unit}</span></div>
          {metric.detail && <div className="demo-evaluation-screen-metric-detail">{metric.detail}</div>}
        </div>)}
      </section>
      <ScreenPanel title="教师评价排行">
        <TeacherEvaluationFootprints teachers={report.teachers} />
      </ScreenPanel>
    </aside>
    <FiveEducationHero dimensions={report.fiveEducationStats} visible={visible} reducedMotion={reducedMotion} />
    <aside className="demo-evaluation-screen-side demo-evaluation-screen-right" aria-label="年级评价统计">
      <GradeEvaluationRecords grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} />
      <GradeCoverage grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} periodLabel={periodLabel} />
    </aside>
    <div className="demo-evaluation-screen-bottom">
      <IndicatorUsage groups={report.indicatorUsage} period={snapshot.period} />
      <ScreenPanel title="最新评价" className="demo-evaluation-screen-feed-panel">
        <LiveEvaluationFeed events={liveSnapshot.recentEvaluations} />
      </ScreenPanel>
      <ScreenPanel title="学生积分变化">
        <StudentScoreChanges events={liveSnapshot.recentEvaluations} />
      </ScreenPanel>
      <ScreenPanel title="五育加减分" action={report.fiveEducationStats.some(item => item.eventCount > 0) && <div className="demo-evaluation-screen-score-totals"><span className="is-positive">+{formatScreenNumber(totals.plus)}<small>分</small></span><span className="is-negative">−{formatScreenNumber(totals.minus)}<small>分</small></span></div>}>
        <FiveEducationScores dimensions={report.fiveEducationStats} />
      </ScreenPanel>
    </div>
  </main>;
};

const StudentEvaluationDataScreen: React.FC = () => {
  const [gradePage, setGradePage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const { viewportRef: screenRef, scale, canvasWidth, canvasHeight } = useScreenCanvasLayout();
  const { periods, error, retry, visible, reducedMotion } = useStudentEvaluationScreen(true);
  const snapshot = periods?.term;
  const gradePages = Math.max(1, Math.ceil((snapshot?.report.gradeCoverages.length ?? 0) / 6));

  useEffect(() => {
    if (!visible || reducedMotion || gradePages < 2) return;
    const timer = window.setInterval(() => setGradePage(page => (page + 1) % gradePages), 15600);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion, gradePages]);

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
    <div ref={screenRef} className="demo-evaluation-screen-viewport">
    <div className={`demo-student-evaluation-data-screen ${reducedMotion ? 'has-reduced-motion' : ''}`} style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden' }}>
      <ScreenBackground visible={visible} reducedMotion={reducedMotion} />
      <header className="demo-evaluation-screen-header">
        <div className="demo-evaluation-screen-school"><GraduationCap size={26} strokeWidth={1.5} aria-hidden="true" /><span>{snapshot?.schoolName ?? '星河实验学校'}</span></div>
        <div className="demo-evaluation-screen-title"><h1>AI素养评价系统</h1><span aria-hidden="true" /></div>
        <div className="demo-evaluation-screen-header-right">
          <div className="demo-evaluation-screen-updated"><span>数据更新时间</span><time dateTime={snapshot ? new Date(snapshot.updatedAt).toISOString() : undefined}>{snapshot ? `${new Date(snapshot.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${formatScreenTime(snapshot.updatedAt)}` : '—'}</time></div>
          <button className="demo-evaluation-screen-fullscreen" type="button" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'} title={fullscreen ? '退出全屏' : '进入全屏'}>{fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        </div>
      </header>
      {snapshot ? <EvaluationScreenContent snapshot={snapshot} liveSnapshot={periods?.week} gradePage={gradePage} onGradePageChange={setGradePage} visible={visible} reducedMotion={reducedMotion} /> : <main className="demo-evaluation-screen-loading" role="status">
        {error ? <><span>评价数据暂时未能加载</span><button type="button" onClick={retry}><RefreshCw size={18} />重新加载</button></> : <><span className="demo-evaluation-screen-loading-dot" />正在汇聚校园成长数据</>}
      </main>}
    </div>
      <div className="demo-evaluation-screen-notice" role="status">{notice}</div>
    </div>
  );
};

export default StudentEvaluationDataScreen;
