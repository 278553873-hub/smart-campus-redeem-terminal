import React, { useEffect, useRef, useState } from 'react';
import { Button, Popover } from '@arco-design/web-react';
import { ClassGradeDetails, ClassPerformance, CompactActivity, CompactBars, CoverageSummary, FiveEducationDistribution, FiveEducationScores, GradeCoverage, IndicatorUsage, ScreenPanel, StudentClassCoverage, TeacherEvaluationFootprints, formatScreenNumber } from './StudentEvaluationCharts';
import { SCREEN_PERIODS, type EvaluationScreenSnapshot, type ScreenPeriod } from './studentEvaluationScreenModel';
import { useStudentEvaluationScreen } from './useStudentEvaluationScreen';
import { ScreenIcon, type ScreenIconName } from './ScreenIcon';
import './studentEvaluationDataScreen.css';

const sections = [
  { key: 'overview', label: '育人总览' },
  { key: 'students', label: '学生成长' },
  { key: 'classes', label: '班级风貌' },
] as const;
export type EvaluationScreenSection = typeof sections[number]['key'];

function ScreenRibbons() {
  return <svg className="evaluation-screen-ribbons" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="screen-ribbon-blue"><stop stopColor="#7553fa" stopOpacity=".38" /><stop offset=".65" stopColor="#0bafff" stopOpacity=".65" /><stop offset="1" stopColor="#116df0" stopOpacity="0" /></linearGradient>
      <linearGradient id="screen-ribbon-fill" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#1059a9" stopOpacity=".26" /><stop offset="1" stopColor="#173b8c" stopOpacity="0" /></linearGradient>
    </defs>
    <path d="M0 42 C200 216 285 -35 620 139 L620 0 L0 0Z" fill="url(#screen-ribbon-fill)" />
    <path d="M0 42 C200 216 285 -35 620 139" fill="none" stroke="url(#screen-ribbon-blue)" strokeWidth="2" />
    <path d="M1260 0 C1478 102 1514 -28 1685 -10" fill="none" stroke="url(#screen-ribbon-blue)" strokeWidth="2" />
    <path d="M1422 132 C1619 -30 1674 150 1920 104" fill="none" stroke="url(#screen-ribbon-blue)" strokeWidth="1.5" />
  </svg>;
}

export function EvaluationScreenContent({ snapshot, gradePage = 0, onGradePageChange = () => {}, playing, section = 'overview', selectedGrade = '', onSelectGrade = () => {}, selectedClassGrade = '', onSelectClassGrade = () => {} }: {
  snapshot: EvaluationScreenSnapshot; gradePage?: number; onGradePageChange?: (page: number) => void; playing: boolean;
  section?: EvaluationScreenSection; selectedGrade?: string; onSelectGrade?: (id: string) => void; selectedClassGrade?: string; onSelectClassGrade?: (id: string) => void;
}) {
  const { report, classReport } = snapshot;
  const { summary } = report;
  const grade = report.gradeCoverages.find(item => item.id === selectedGrade) ?? report.gradeCoverages[0];
  const metrics: { label: string; value: number; unit: string; icon: ScreenIconName; decimal?: boolean }[] = section === 'classes' && classReport ? [
    { label: '班级平均分', value: classReport.summary.averageScore, unit: '分', icon: 'evaluation', decimal: true },
    { label: '参评班级', value: classReport.classRanking.length, unit: '个', icon: 'book' },
    { label: '问题记录', value: classReport.summary.issueCount, unit: '条', icon: 'records' },
    { label: '累计扣分', value: classReport.summary.cumulativeDeduction, unit: '分', icon: 'evaluation' },
  ] : [
    { label: '成长记录', value: summary.totalEvaluationCount, unit: '条', icon: 'records' },
    { label: '评价次数', value: summary.totalRecords, unit: '次', icon: 'evaluation' },
    { label: '覆盖学生', value: summary.totalCoveredStudents, unit: '人', icon: 'students' },
    { label: '参与教师', value: summary.activeTeachers, unit: '人', icon: 'teacher' },
  ];
  return <>
    <section className="evaluation-screen-metrics" aria-label={section === 'classes' ? '班级评价概况' : '学生评价概况'}>
      {metrics.map(metric => <div className="evaluation-screen-metric" key={metric.label}>
        <ScreenIcon name={metric.icon} size={38} />
        <div><div className="evaluation-screen-metric-label">{metric.label}</div><div className="evaluation-screen-metric-value"><strong>{metric.decimal ? metric.value.toFixed(1) : formatScreenNumber(metric.value)}</strong><span>{metric.unit}</span></div></div>
      </div>)}
    </section>
    <main className={`evaluation-screen-grid section-${section}`} role="tabpanel" id="evaluation-screen-content" aria-labelledby={`screen-tab-${section}`}>
      {section !== 'classes' ? <>
        <div className="evaluation-screen-column">
          <CoverageSummary summary={summary} />
          <GradeCoverage grades={report.gradeCoverages} page={gradePage} onPageChange={onGradePageChange}
            selectedGrade={grade?.id} onSelect={section === 'students' ? onSelectGrade : undefined} />
        </div>
        {section === 'overview' ? <ScreenPanel title="五育评价全景" className="evaluation-screen-main-panel">
          <FiveEducationDistribution dimensions={report.fiveEducationStats} />
          <div className="evaluation-screen-main-bottom">
            <ScreenPanel title="教师评价活跃度" detail="单位：次数" className="evaluation-screen-compact-panel"><TeacherEvaluationFootprints teachers={report.teachers} /></ScreenPanel>
            <IndicatorUsage report={report} period={snapshot.period} />
          </div>
        </ScreenPanel> : <StudentClassCoverage grade={grade} />}
        <div className="evaluation-screen-column">
          {section === 'overview' ? <ClassPerformance report={classReport} /> : <ScreenPanel title="教师评价活跃度" detail="全校 · 评价次数"><TeacherEvaluationFootprints teachers={report.teachers} /></ScreenPanel>}
          <ScreenPanel title="五育积分明细"><FiveEducationScores dimensions={report.fiveEducationStats} /></ScreenPanel>
        </div>
      </> : <>
        <div className="evaluation-screen-column">
          <ClassPerformance report={classReport} />
          <ScreenPanel title="年级常规表现" detail="班级平均分">
            <CompactBars rows={classReport?.grades.map(item => ({ id: item.id, name: item.name, value: Math.round(item.classes.reduce((sum, classroom) => sum + classroom.score, 0) / Math.max(1, item.classes.length) * 10) / 10 })) ?? []} unit="分" />
          </ScreenPanel>
        </div>
        <ClassGradeDetails report={classReport} selectedGrade={selectedClassGrade} onSelect={onSelectClassGrade} />
      </>}
    </main>
    <CompactActivity events={snapshot.recentEvaluations} playing={playing} />
  </>;
}

const StudentEvaluationDataScreen: React.FC = () => {
  const [period, setPeriod] = useState<ScreenPeriod>('term');
  const [section, setSection] = useState<EvaluationScreenSection>('overview');
  const [playing, setPlaying] = useState(true);
  const [gradePage, setGradePage] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClassGrade, setSelectedClassGrade] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const screenRef = useRef<HTMLDivElement>(null);
  const { periods, error, retry, visible, reducedMotion } = useStudentEvaluationScreen(playing);
  const snapshot = periods?.[period];
  const gradePages = Math.max(1, Math.ceil((snapshot?.report.gradeCoverages.length ?? 0) / 12));

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
    } catch { setNotice('未能进入全屏，请重试或使用浏览器的全屏功能。'); }
  };
  const termLabel = snapshot?.classReport?.period.label ?? '本学期';
  const settings = <div className="evaluation-screen-settings">
    <label htmlFor="evaluation-screen-period">统计周期</label>
    <select id="evaluation-screen-period" value={period} onChange={event => { setPeriod(event.target.value as ScreenPeriod); setGradePage(0); }}>
      {SCREEN_PERIODS.filter(option => option.key !== 'today').map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
    </select>
    <Button type="text" icon={<ScreenIcon name={playing ? 'pause' : 'play'} size={18} />} onClick={() => setPlaying(value => !value)}>{playing ? '暂停动态播报' : '继续动态播报'}</Button>
    <Button type="text" icon={<ScreenIcon name={fullscreen ? 'minimize' : 'maximize'} size={18} />} onClick={toggleFullscreen}>{fullscreen ? '退出全屏' : '进入全屏'}</Button>
  </div>;
  return <div ref={screenRef} className={`student-evaluation-data-screen ${playing ? '' : 'is-paused'} ${reducedMotion ? 'has-reduced-motion' : ''}`}>
    <ScreenRibbons />
    <header className="evaluation-screen-header">
      <div className="evaluation-screen-brand"><ScreenIcon name="book" size={42} /><span>育人成果</span></div>
      <div className="evaluation-screen-header-center"><h1>{snapshot?.schoolName ?? '星河实验学校'} · 五育成长驾驶舱</h1>
        <nav className="evaluation-screen-tabs" role="tablist" aria-label="育人展示视图">
          {sections.map((item, index) => <button key={item.key} role="tab" id={`screen-tab-${item.key}`} aria-controls="evaluation-screen-content" aria-selected={section === item.key} tabIndex={section === item.key ? 0 : -1}
            onClick={() => setSection(item.key)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (index + 1) % sections.length : event.key === 'ArrowLeft' ? (index + sections.length - 1) % sections.length : event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : -1;
              if (next < 0) return;
              event.preventDefault(); setSection(sections[next].key);
              document.getElementById(`screen-tab-${sections[next].key}`)?.focus();
            }}>{item.label}</button>)}
        </nav>
      </div>
      <div className="evaluation-screen-header-right"><span className="evaluation-screen-term">{termLabel}</span>
        <div><span className="evaluation-screen-demo-label">演示数据</span>
          <Popover trigger="click" position="bottom" content={settings} getPopupContainer={() => screenRef.current ?? document.body} className="evaluation-screen-settings-popover">
            <Button type="text" className="evaluation-screen-settings-trigger" icon={<ScreenIcon name="settings" size={20} />} aria-label="大屏设置" title="大屏设置" />
          </Popover>
        </div>
      </div>
    </header>
    {snapshot ? <EvaluationScreenContent snapshot={snapshot} gradePage={gradePage} onGradePageChange={setGradePage} playing={playing} section={section}
      selectedGrade={selectedGrade} onSelectGrade={setSelectedGrade} selectedClassGrade={selectedClassGrade} onSelectClassGrade={setSelectedClassGrade} />
      : <main className="evaluation-screen-loading" role="status">
        {error ? <><p>评价数据暂时未能加载</p><Button type="primary" onClick={retry} icon={<ScreenIcon name="refresh" size={18} />}>重新加载</Button></> : <><span className="evaluation-screen-loading-dot" /><p>正在加载育人数据</p></>}
      </main>}
    <div className="evaluation-screen-notice" role="status">{notice}</div>
  </div>;
};
export default StudentEvaluationDataScreen;
