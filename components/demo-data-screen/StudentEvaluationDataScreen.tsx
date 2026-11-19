import React, { useEffect } from 'react';
import { RefreshCw, Users, UserCheck, NotebookPen, ListChecks } from 'lucide-react';
import { IndicatorUsage, ScreenPanel, TeacherEvaluationFootprints, formatScreenNumber } from './StudentEvaluationCharts';
import { GrowthTrend } from './GrowthTrend';
import { GradeEvaluationTimes } from './GradeEvaluationTimes';
import { GrowthActivityFeed } from './GrowthActivityFeed';
import { AiEducationInsights } from './AiEducationInsights';
import { buildScreenInsightDigest, type ScreenInsightDigest } from './studentEvaluationScreenInsights';
import { useScreenInsightDigest, useScreenInsightPlayback } from './useScreenInsightPlayback';
import { FiveEducationHero } from './FiveEducationHero';
import { ScreenBackground } from './ScreenBackground';
import { ScreenPanoramaHeader } from '../screen-navigation/ScreenPanoramaHeader';
import { ScreenThemeToggle, type ScreenTheme } from '../screen-navigation/ScreenThemeToggle';
import { SCREEN_PERIODS, screenFiveEducationStats, type EvaluationScreenSnapshot } from './studentEvaluationScreenModel';
import { useStudentEvaluationScreen } from './useStudentEvaluationScreen';
import { useScreenCanvasLayout } from './useScreenCanvasLayout';
import '../screen-navigation/screenVisualTokens.css';
import './studentEvaluationDataScreen.css';
import './studentEvaluationScreenTheme.css';

export const EvaluationScreenContent = ({ snapshot, liveSnapshot = snapshot, insightDigest, activeInsight = 0, insightPage = 0, onInsightChange, onInsightFocusChange, visible = true, reducedMotion = false }: {
  snapshot: EvaluationScreenSnapshot; liveSnapshot?: EvaluationScreenSnapshot; insightDigest?: ScreenInsightDigest;
  activeInsight?: number; insightPage?: number; onInsightChange?: (index: number) => void; onInsightFocusChange?: (focused: boolean) => void;
  visible?: boolean; reducedMotion?: boolean;
}) => {
  const { report } = snapshot;
  const { summary } = report;
  const periodLabel = SCREEN_PERIODS.find(option => option.key === snapshot.period)?.label ?? '';
  const digest = insightDigest ?? buildScreenInsightDigest(liveSnapshot);
  const focusDimension = digest.insights[activeInsight % Math.max(1, digest.insights.length)]?.focusDimension;
  const metrics = [
    { label: '评价次数', value: summary.totalRecords, unit: '次', detail: '', icon: NotebookPen },
    { label: '记录条数', value: summary.totalEvaluationCount, unit: '条', detail: '', icon: ListChecks },
    { label: '学生覆盖率', value: summary.studentPercent, unit: '%', detail: `${formatScreenNumber(summary.totalCoveredStudents)} / ${formatScreenNumber(summary.totalStudents)}人`, icon: Users },
    { label: '教师参与率', value: summary.teacherPercent, unit: '%', detail: `${summary.activeTeachers} / ${summary.totalTeachers}位教师`, icon: UserCheck },
  ];
  return <main className="demo-evaluation-screen-workspace">
    <aside className="demo-evaluation-screen-side demo-evaluation-screen-left" aria-label="评价概况与教师排行">
      <section className="demo-evaluation-screen-metrics" aria-label={`${periodLabel}学校学生评价概况`}>
        {metrics.map(metric => <div className="demo-evaluation-screen-metric" key={metric.label}>
          <div className="demo-evaluation-screen-metric-label"><span>{metric.label}</span><metric.icon size={18} strokeWidth={1.6} aria-hidden="true" /></div>
          <div className="demo-evaluation-screen-metric-value"><strong>{formatScreenNumber(metric.value)}</strong><span>{metric.unit}</span></div>
          {metric.detail && <div className="demo-evaluation-screen-metric-detail">{metric.detail}</div>}
        </div>)}
      </section>
      <ScreenPanel title="教师使用TOP10">
        <TeacherEvaluationFootprints teachers={report.teachers} />
      </ScreenPanel>
    </aside>
    <FiveEducationHero dimensions={screenFiveEducationStats(snapshot)} focusDimension={focusDimension} visible={visible} reducedMotion={reducedMotion} />
    <div className="demo-evaluation-screen-right-column">
      <GradeEvaluationTimes grades={snapshot.gradeEvaluationCounts} visible={visible} reducedMotion={reducedMotion} />
      <AiEducationInsights digest={digest} active={activeInsight} page={insightPage} onSelect={onInsightChange} onFocusChange={onInsightFocusChange} />
    </div>
    <GrowthActivityFeed events={liveSnapshot.recentEvaluations} />
    <div className="demo-evaluation-screen-bottom-center">
      <GrowthTrend weeks={liveSnapshot.growthTrend} />
      <IndicatorUsage groups={report.indicatorUsage} period={snapshot.period} />
    </div>
  </main>;
};

const StudentEvaluationDataScreen = ({ active = true, onReady, theme, onThemeChange }: { active?: boolean; onReady?: () => void; theme: ScreenTheme; onThemeChange: (theme: ScreenTheme) => void }) => {
  const { viewportRef: screenRef, scale, canvasWidth, canvasHeight } = useScreenCanvasLayout();
  const { periods, error, retry, visible: pageVisible, reducedMotion } = useStudentEvaluationScreen(active);
  const visible = pageVisible && active;
  const snapshot = periods?.term;
  const insightDigest = useScreenInsightDigest(periods?.week);
  const playback = useScreenInsightPlayback(insightDigest?.insights.length ?? 0, visible, reducedMotion);
  useEffect(() => { if (snapshot) onReady?.(); }, [Boolean(snapshot), onReady]);

  return (
    <div ref={screenRef} className="demo-evaluation-screen-viewport" data-theme={theme}>
    <div className={`demo-student-evaluation-data-screen screen-visual-theme ${reducedMotion ? 'has-reduced-motion' : ''}`} data-theme={theme} style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden' }}>
      <ScreenBackground visible={visible && theme === 'dark'} reducedMotion={reducedMotion} />
      <ScreenPanoramaHeader current="school" schoolName={snapshot?.schoolName ?? '星河实验学校'} active={visible} actions={<ScreenThemeToggle theme={theme} onChange={onThemeChange} />} />
      {snapshot ? <EvaluationScreenContent snapshot={snapshot} liveSnapshot={periods?.week} insightDigest={insightDigest} activeInsight={playback.active} insightPage={playback.page} onInsightChange={playback.setActive} onInsightFocusChange={playback.setFocused} visible={visible} reducedMotion={reducedMotion} /> : <main className="demo-evaluation-screen-loading" role="status">
        {error ? <><span>评价数据暂时未能加载</span><button type="button" onClick={retry}><RefreshCw size={18} />重新加载</button></> : <><span className="demo-evaluation-screen-loading-dot" />正在汇聚校园成长数据</>}
      </main>}
    </div>
    </div>
  );
};

export default StudentEvaluationDataScreen;
