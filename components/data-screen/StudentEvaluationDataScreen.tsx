import React, { useEffect, useState } from 'react';
import { Button } from '@arco-design/web-react';
import { FiveEducationScores, GradeCoverage, GradeEvaluationRecords, IndicatorUsage, LiveEvaluationFeed, ScreenPanel, StudentScoreChanges, TeacherEvaluationFootprints, formatScreenNumber, formatScreenTime } from './StudentEvaluationCharts';
import { FiveEducationHero } from './FiveEducationHero';
import { ScreenBackground } from './ScreenBackground';
import { ScreenHeaderArtwork } from './ScreenHeaderArtwork';
import { screenScoreTotals, type EvaluationScreenSnapshot } from './studentEvaluationScreenModel';
import { useStudentEvaluationScreen } from './useStudentEvaluationScreen';
import { useScreenCanvasLayout } from './useScreenCanvasLayout';
import { ScreenIcon, type ScreenIconName } from './ScreenIcon';
import './studentEvaluationDataScreen.css';

export function EvaluationScreenContent({ snapshot, liveSnapshot = snapshot, gradePage = 0, onGradePageChange = () => {}, visible = true, reducedMotion = false }: {
  snapshot: EvaluationScreenSnapshot; liveSnapshot?: EvaluationScreenSnapshot; gradePage?: number; onGradePageChange?: (page: number) => void; visible?: boolean; reducedMotion?: boolean;
}) {
  const { report } = snapshot;
  const { summary } = report;
  const totals = screenScoreTotals(snapshot);
  const metrics: { label: string; value: number; unit: string; detail?: string; icon: ScreenIconName; primary?: boolean }[] = [
    { label: '评价次数', value: summary.totalRecords, unit: '次', icon: 'notebook', primary: true },
    { label: '成长记录条数', value: summary.totalEvaluationCount, unit: '条', icon: 'checklist' },
    { label: '学生覆盖率', value: summary.studentPercent, unit: '%', detail: `${formatScreenNumber(summary.totalCoveredStudents)} / ${formatScreenNumber(summary.totalStudents)}人`, icon: 'students' },
    { label: '教师参与率', value: summary.teacherPercent, unit: '%', detail: `${summary.activeTeachers} / ${summary.totalTeachers}位教师`, icon: 'participation' },
  ];
  return <main className="evaluation-screen-workspace">
    <aside className="evaluation-screen-side evaluation-screen-left" aria-label="评价概况与教师排行">
      <section className="evaluation-screen-metrics" aria-label="学校评价概况">
        {metrics.map(metric => <div className="evaluation-screen-metric" data-emphasis={metric.primary ? 'primary' : 'neutral'} key={metric.label}>
          <div className="evaluation-screen-metric-label"><ScreenIcon name={metric.icon} size={22} /><span>{metric.label}</span></div>
          <div className="evaluation-screen-metric-value"><strong>{formatScreenNumber(metric.value)}</strong><span>{metric.unit}</span></div>
          {metric.detail && <div className="evaluation-screen-metric-detail">{metric.detail}</div>}
        </div>)}
      </section>
      <ScreenPanel title="教师评价排行"><TeacherEvaluationFootprints teachers={report.teachers} /></ScreenPanel>
    </aside>
    <FiveEducationHero dimensions={report.fiveEducationStats} visible={visible} reducedMotion={reducedMotion} />
    <aside className="evaluation-screen-side evaluation-screen-right" aria-label="年级评价统计">
      <GradeEvaluationRecords grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} />
      <GradeCoverage grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange} />
    </aside>
    <div className="evaluation-screen-bottom">
      <IndicatorUsage groups={report.indicatorUsage} period={snapshot.period} />
      <ScreenPanel title="最新评价" className="evaluation-screen-feed-panel"><LiveEvaluationFeed events={liveSnapshot.recentEvaluations} /></ScreenPanel>
      <ScreenPanel title="学生积分变化"><StudentScoreChanges events={liveSnapshot.recentEvaluations} /></ScreenPanel>
      <ScreenPanel title="五育加减分" action={report.fiveEducationStats.some(item => item.eventCount > 0) && <div className="evaluation-screen-score-totals"><span className="is-positive">+{formatScreenNumber(totals.plus)}<small>分</small></span><span className="is-negative">−{formatScreenNumber(totals.minus)}<small>分</small></span></div>}>
        <FiveEducationScores dimensions={report.fiveEducationStats} />
      </ScreenPanel>
    </div>
  </main>;
}

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
    } catch { setNotice('未能进入全屏，请重试或使用浏览器的全屏功能。'); }
  };
  return <div ref={screenRef} className="evaluation-screen-viewport">
    <div className={`student-evaluation-data-screen ${!visible ? 'is-paused' : ''} ${reducedMotion ? 'has-reduced-motion' : ''}`} style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden' }}>
      <ScreenBackground visible={visible} reducedMotion={reducedMotion} />
      <header className="evaluation-screen-header">
        <ScreenHeaderArtwork />
        <div className="evaluation-screen-school"><ScreenIcon name="school" size={28} /><span>{snapshot?.schoolName ?? '星河实验学校'}</span></div>
        <h1>AI素养评价系统</h1>
        <div className="evaluation-screen-header-right">
          <div className="evaluation-screen-updated"><span>数据更新时间</span><time dateTime={snapshot ? new Date(snapshot.updatedAt).toISOString() : undefined}>{snapshot ? `${new Date(snapshot.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${formatScreenTime(snapshot.updatedAt)}` : '—'}</time></div>
          <Button type="text" className="evaluation-screen-fullscreen" onClick={toggleFullscreen} icon={<ScreenIcon name={fullscreen ? 'minimize' : 'maximize'} size={20} />} aria-label={fullscreen ? '退出全屏' : '进入全屏'} title={fullscreen ? '退出全屏' : '进入全屏'} />
        </div>
      </header>
      {snapshot ? <EvaluationScreenContent snapshot={snapshot} liveSnapshot={periods?.week} gradePage={gradePage} onGradePageChange={setGradePage} visible={visible} reducedMotion={reducedMotion} /> : <main className="evaluation-screen-loading" role="status">
        {error ? <><p>评价数据暂时未能加载</p><Button type="primary" onClick={retry} icon={<ScreenIcon name="refresh" size={18} />}>重新加载</Button></> : <><span className="evaluation-screen-loading-dot" /><p>正在汇聚校园成长数据</p></>}
      </main>}
    </div>
    <div className="evaluation-screen-notice" role="status">{notice}</div>
  </div>;
};
export default StudentEvaluationDataScreen;
