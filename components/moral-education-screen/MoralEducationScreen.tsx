import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@arco-design/web-react';
import { RefreshCw } from 'lucide-react';
import { ScreenPanoramaHeader } from '../screen-navigation/ScreenPanoramaHeader';
import { ScreenThemeToggle, type ScreenTheme } from '../screen-navigation/ScreenThemeToggle';
import { useScreenCanvasLayout } from '../screen-navigation/useScreenCanvasLayout';
import { ScreenParticleBackground } from '../screen-effects/ScreenParticleBackground';
import { loadMoralScreenDataset, selectMoralScreen, type MoralScreenDataset, type MoralScreenSnapshot } from './moralEducationScreenModel';
import { MoralOverview, MoralRanking, MoralProblems } from './MoralEducationPanels';
import { MoralGradeProblems } from './MoralGradeProblems';
import { MoralProblemChanges } from './MoralProblemChanges';
import { MoralTrend } from './MoralTrend';
import { MoralGradeRankings } from './MoralGradeRankings';
import { MoralProblemDistribution } from './MoralProblemDistribution';
import '../screen-navigation/screenVisualTokens.css';
import './moralEducationScreen.css';

export function MoralEducationContent({ snapshot, active = true }: {
  snapshot: MoralScreenSnapshot; active?: boolean;
}) {
  return <main className="moral-content">
    <MoralOverview snapshot={snapshot} />
    <div className="moral-workspace">
      <div className="moral-primary-grid">
        <MoralRanking snapshot={snapshot} />
        <MoralGradeRankings key={snapshot.period.id} snapshot={snapshot} active={active} />
        <MoralProblemDistribution snapshot={snapshot} />
      </div>
      <div className="moral-secondary-grid">
        <MoralProblems snapshot={snapshot} />
        <MoralGradeProblems key={snapshot.period.id} snapshot={snapshot} active={active} />
        <MoralProblemChanges snapshot={snapshot} />
        <MoralTrend key={snapshot.period.id} snapshot={snapshot} active={active} />
      </div>
    </div>
  </main>;
}

export default function MoralEducationScreen({ active = true, theme, onThemeChange }: { active?: boolean; theme: ScreenTheme; onThemeChange: (theme: ScreenTheme) => void }) {
  const { viewportRef, scale, canvasWidth, canvasHeight } = useScreenCanvasLayout();
  const [dataset, setDataset] = useState<MoralScreenDataset | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setError(false);
    loadMoralScreenDataset().then(next => {
      if (cancelled) return;
      setDataset(next);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [reload]);
  const snapshot = useMemo(() => dataset ? selectMoralScreen(dataset, dataset.periods.at(-1)?.id ?? '') : null, [dataset]);
  return <div ref={viewportRef} className="moral-viewport screen-visual-theme" data-theme={theme}>
    <div className="moral-screen" data-theme={theme} style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden' }}>
      {theme === 'dark' && <ScreenParticleBackground visible={active} />}
      <ScreenPanoramaHeader current="moral" schoolName="星河实验学校" active={active} actions={<ScreenThemeToggle theme={theme} onChange={onThemeChange} />} />
      {snapshot ? <MoralEducationContent snapshot={snapshot} active={active} /> : <main className="moral-loading" role="status">
        {error ? <><p>班级评价数据暂时未能加载</p><Button type="text" onClick={() => setReload(value => value + 1)} icon={<RefreshCw size={18} aria-hidden="true" />}>重新加载</Button></> : dataset ? <p>暂无可展示的班级评价报表</p> : <p>正在读取班级评价数据…</p>}
      </main>}
    </div>
  </div>;
}
