import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '@arco-design/web-react';
import GhostFibers from './backgrounds/ghost-fibers/GhostFibers';
import { selectGrowthSnapshot, type GrowthDataset, type GrowthSnapshot } from './studentGrowthModel';
import { useStudentGrowthPlayback } from './useStudentGrowthPlayback';
import { useStudentGrowthInteraction } from './useStudentGrowthInteraction';
import { loadStudentGrowth } from './studentGrowthService';
import { StudentGrowthBoards, defaultGrowthBoardSelection, type GrowthBoardSelection } from './StudentGrowthOverview';
import { StudentGrowthAccountDialog, type GrowthStudentAuthenticator } from './StudentGrowthAccountDialog';
import { GrowthGradeSelect } from './StudentGrowthControls';
export { StudentGrowthBoards } from './StudentGrowthOverview';
import { ScreenPanoramaHeader } from '../screen-navigation/ScreenPanoramaHeader';
import './studentGrowthScreen.css';

export function getStudentGrowthLayout(width: number, height: number) {
  const compact = width > 0 && width < 760 && height > width;
  const scale = compact ? 1 : Math.min(width / 1920, height / 1080) || 1;
  return { compact, scale, width: compact ? width : width ? width / scale : 1920, height: compact ? undefined : height ? height / scale : 1080 };
}

function useGrowthEnvironment() {
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncVisibility = () => setVisible(!document.hidden);
    const syncMotion = () => setReducedMotion(media.matches);
    syncVisibility(); syncMotion();
    document.addEventListener('visibilitychange', syncVisibility);
    media.addEventListener('change', syncMotion);
    return () => { document.removeEventListener('visibilitychange', syncVisibility); media.removeEventListener('change', syncMotion); };
  }, []);
  return { visible, reducedMotion };
}

export function StudentGrowthContent({ snapshot, visible = true, reducedMotion = false, cycleKey = 0, onCycleComplete, header, authenticate }: {
  snapshot: GrowthSnapshot; visible?: boolean; reducedMotion?: boolean; cycleKey?: number; onCycleComplete?: () => void; header?: ReactNode; compact?: boolean; authenticate?: GrowthStudentAuthenticator;
}) {
  const [state, setState] = useState<{ key: number; revision: number; selection: GrowthBoardSelection; account: boolean }>(() => ({ key: cycleKey, revision: 0, selection: defaultGrowthBoardSelection(), account: false }));
  const current = state.key === cycleKey ? state : { key: cycleKey, revision: 0, selection: defaultGrowthBoardSelection(), account: false };
  const resetSelection = useCallback(() => setState(previous => ({ key: cycleKey, revision: previous.revision + 1, selection: defaultGrowthBoardSelection(), account: false })), [cycleKey]);
  const { interacting, onActivity, playbackKey } = useStudentGrowthInteraction(visible, cycleKey, resetSelection);
  useStudentGrowthPlayback(visible && !reducedMotion && !interacting, playbackKey, onCycleComplete);
  const changeSelection = useCallback((patch: Partial<GrowthBoardSelection>) => setState(previous => ({ key: cycleKey, revision: previous.key === cycleKey ? previous.revision : 0, account: false, selection: { ...(previous.key === cycleKey ? previous.selection : defaultGrowthBoardSelection()), ...patch } })), [cycleKey]);
  const setAccount = (account: boolean) => setState({ ...current, account });
  return <div className="student-growth-content" onClickCapture={onActivity} onPointerDownCapture={onActivity} onPointerUpCapture={onActivity} onPointerCancelCapture={onActivity}
    onPointerMoveCapture={event => { if (event.buttons) onActivity(); }} onKeyDownCapture={onActivity} onWheelCapture={onActivity} onScrollCapture={onActivity}>
    {header}
    <div className="student-growth-toolbar">
      <div className="student-growth-overview-controls"><h2>校园成长风采</h2><GrowthGradeSelect key={`grade:${cycleKey}:${current.revision}`} snapshot={snapshot} value={current.selection.gradeId} label="学生荣誉榜年级" onChange={gradeId => changeSelection({ gradeId })} /></div>
      <Button className="student-growth-my-entry" onClick={() => setAccount(true)} aria-haspopup="dialog">我的成长</Button>
    </div>
    <StudentGrowthBoards key={`${cycleKey}:${current.revision}`} snapshot={snapshot} selection={current.selection} onChange={changeSelection} />
    {current.account && visible && <StudentGrowthAccountDialog onClose={() => setAccount(false)} authenticate={authenticate} />}
  </div>;
}

export default function StudentGrowthScreen({ active = true, onReady, cycleKey = 0, onCycleComplete, authenticate }: { active?: boolean; onReady?: () => void; cycleKey?: number; onCycleComplete?: () => void; authenticate?: GrowthStudentAuthenticator }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => getStudentGrowthLayout(0, 0));
  const [dataset, setDataset] = useState<GrowthDataset | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { visible: pageVisible, reducedMotion } = useGrowthEnvironment();
  const visible = pageVisible && active;
  const snapshot = useMemo(() => dataset ? selectGrowthSnapshot(dataset) : null, [dataset]);
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => { const bounds = viewport.getBoundingClientRect(); setLayout(getStudentGrowthLayout(bounds.width, bounds.height)); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    loadStudentGrowth().then(value => { if (!cancelled) setDataset(value); }).catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (snapshot) onReady?.(); }, [Boolean(snapshot), onReady]);
  const header = <ScreenPanoramaHeader current="student" heading="学生荣誉榜" schoolName={snapshot?.schoolName ?? '星河实验学校'} active={visible} />;
  return <div ref={viewportRef} className={`student-growth-viewport ${layout.compact ? 'is-compact' : ''}`}>
    <div className="student-growth-screen" style={{ width: layout.width, height: layout.height, zoom: layout.scale,
      '--growth-touch-target': `${Math.max(56, 56 / layout.scale)}px`, '--growth-action-target': `${Math.max(44, 44 / layout.scale)}px`,
    } as CSSProperties}>
      <div className="student-growth-background" aria-hidden="true"><GhostFibers glowColor="#ff791a" lineColor="#ffd08a" secondaryColor="#c04b35" gradient="along" fiberStyle="dots" speed={.18} flow={.12} scale={1.15} rotation={-16} rollSpeed={.08} layers={3} threads={84} density={.85} thickness={1.15} spread={1.4} volume={.9} waves={1.1} twist={1.2} depthOfField={.85} brightness={2.2} glow={2} particles={1.8} sparkle={.7} grain={.015} vignette={.3} mouseInteraction={false} hoverEffect="none" pulseOnClick={false} intro={false} paused={!visible || reducedMotion} dpr={.75} /></div>
      {snapshot ? <StudentGrowthContent snapshot={snapshot} visible={visible} reducedMotion={reducedMotion} cycleKey={cycleKey} onCycleComplete={onCycleComplete} header={header} compact={layout.compact} authenticate={authenticate} /> : <>{header}<div className="student-growth-loading" role="status">{loadError ? <>暂时无法读取成长数据<button type="button" onClick={() => { setLoadError(false); loadStudentGrowth().then(setDataset).catch(() => setLoadError(true)); }}>重新加载</button></> : '正在读取学生成长数据…'}</div></>}
    </div>
  </div>;
}
