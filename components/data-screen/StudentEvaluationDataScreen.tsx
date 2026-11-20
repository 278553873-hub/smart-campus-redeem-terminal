import React, { useEffect, useState } from 'react';
import { GraduationCap, Maximize, Minimize, RefreshCw, Users, UserCheck, NotebookPen, ListChecks } from 'lucide-react';
import { GradeCoverage, GradeEvaluationRecords, IndicatorUsage, LiveEvaluationFeed, ScreenPanel, StudentScoreChanges, TeacherEvaluationFootprints, formatScreenNumber, formatScreenUpdatedAt, formatScreenWeekday } from './StudentEvaluationCharts';
import { GrowthTrend } from './GrowthTrend';
import { FiveEducationHero } from './FiveEducationHero';
import { ScreenBackground } from './ScreenBackground';
import { ScreenHeaderArtwork } from './ScreenHeaderArtwork';
import { SCREEN_PERIODS, screenFiveEducationStats, type EvaluationScreenSnapshot } from './studentEvaluationScreenModel';
import { useStudentEvaluationScreen } from './useStudentEvaluationScreen';
import { useScreenCanvasLayout } from './useScreenCanvasLayout';
import './studentEvaluationDataScreen.css';

export const EvaluationScreenContent = ({ snapshot, liveSnapshot = snapshot, gradePage, onGradePageChange, visible = true, reducedMotion = false }: {
  snapshot: EvaluationScreenSnapshot; liveSnapshot?: EvaluationScreenSnapshot; gradePage: number; onGradePageChange: (page: number) => void; visible?: boolean; reducedMotion?: boolean;
}) => {
  const { report } = snapshot;
  const { summary } = report;
  const periodLabel = SCREEN_PERIODS.find(option => option.key === snapshot.period)?.label ?? '';
  const metrics = [
    { label: '评价次数', value: summary.totalRecords, unit: '次', detail: '', icon: NotebookPen },
    { label: '记录条数', value: summary.totalEvaluationCount, unit: '条', detail: '', icon: ListChecks },
    { label: '学生覆盖率', value: summary.studentPercent, unit: '%', detail: `${formatScreenNumber(summary.totalCoveredStudents)} / ${formatScreenNumber(summary.totalStudents)}人`, icon: Users },
    { label: '教师参与率', value: summary.teacherPercent, unit: '%', detail: `${summary.activeTeachers} / ${summary.totalTeachers}位教师`, icon: UserCheck },
  ];
  return <main className="school-pc-evaluation-screen-workspace">
    <aside className="school-pc-evaluation-screen-side school-pc-evaluation-screen-left" aria-label="评价概况与教师排行">
      <section className="school-pc-evaluation-screen-metrics" aria-label={`${periodLabel}学校学生评价概况`}>
        {metrics.map(metric => <div className="school-pc-evaluation-screen-metric" key={metric.label}>
          <div className="school-pc-evaluation-screen-metric-label"><span>{metric.label}</span><metric.icon size={18} strokeWidth={1.6} aria-hidden="true" /></div>
          <div className="school-pc-evaluation-screen-metric-value"><strong>{formatScreenNumber(metric.value)}</strong><span>{metric.unit}</span></div>
          {metric.detail && <div className="school-pc-evaluation-screen-metric-detail">{metric.detail}</div>}
        </div>)}
      </section>
      <ScreenPanel title="教师使用TOP10">
        <TeacherEvaluationFootprints teachers={report.teachers} />
      </ScreenPanel>
    </aside>
    <FiveEducationHero dimensions={screenFiveEducationStats(snapshot)} visible={visible} reducedMotion={reducedMotion} />
    <aside className="school-pc-evaluation-screen-side school-pc-evaluation-screen-right" aria-label="年级评价统计">
      <GradeEvaluationRecords grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} />
      <GradeCoverage grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} />
    </aside>
    <div className="school-pc-evaluation-screen-bottom">
      <ScreenPanel title="最新评价" className="school-pc-evaluation-screen-feed-panel">
        <LiveEvaluationFeed events={liveSnapshot.recentEvaluations} />
      </ScreenPanel>
      <div className="school-pc-evaluation-screen-bottom-center">
        <GrowthTrend weeks={liveSnapshot.growthTrend} />
        <IndicatorUsage groups={report.indicatorUsage} period={snapshot.period} />
      </div>
      <ScreenPanel title="学生积分变化">
        <StudentScoreChanges events={liveSnapshot.recentEvaluations} />
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
    <div ref={screenRef} className="school-pc-evaluation-screen-viewport">
    <div className={`school-pc-student-evaluation-data-screen ${reducedMotion ? 'has-reduced-motion' : ''}`} style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden' }}>
      <ScreenBackground visible={visible} reducedMotion={reducedMotion} />
      <header className="school-pc-evaluation-screen-header">
        <ScreenHeaderArtwork />
        <div className="school-pc-evaluation-screen-school"><GraduationCap size={28} strokeWidth={1.65} aria-hidden="true" /><span>{snapshot?.schoolName ?? '星河实验学校'}</span></div>
        <h1 aria-label="AI素养评价系统"><span className="school-pc-evaluation-screen-title-ai">AI</span><span>素养评价系统</span></h1>
        <div className="school-pc-evaluation-screen-header-right">
          <time className="school-pc-evaluation-screen-updated" dateTime={snapshot ? new Date(snapshot.updatedAt).toISOString() : undefined}>
            <span>{snapshot ? formatScreenUpdatedAt(snapshot.updatedAt) : '—'}</span>
            {snapshot && <span className="school-pc-evaluation-screen-weekday">{formatScreenWeekday(snapshot.updatedAt)}</span>}
          </time>
          <button className="school-pc-evaluation-screen-fullscreen" type="button" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'} title={fullscreen ? '退出全屏' : '进入全屏'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
        </div>
      </header>
      {snapshot ? <EvaluationScreenContent snapshot={snapshot} liveSnapshot={periods?.week} gradePage={gradePage} onGradePageChange={setGradePage} visible={visible} reducedMotion={reducedMotion} /> : <main className="school-pc-evaluation-screen-loading" role="status">
        {error ? <><span>评价数据暂时未能加载</span><button type="button" onClick={retry}><RefreshCw size={18} />重新加载</button></> : <><span className="school-pc-evaluation-screen-loading-dot" />正在汇聚校园成长数据</>}
      </main>}
    </div>
      <div className="school-pc-evaluation-screen-notice" role="status">{notice}</div>
    </div>
  );
};

export default StudentEvaluationDataScreen;
