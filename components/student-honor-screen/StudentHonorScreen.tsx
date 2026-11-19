import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Maximize, Minimize, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { loadStudentGrowth } from '../student-growth-screen/studentGrowthService';
import { selectGrowthSnapshot, type GrowthDataset, type GrowthSnapshot } from '../student-growth-screen/studentGrowthModel';
import { useScreenCanvasLayout } from '../screen-navigation/useScreenCanvasLayout';
import { useSchoolBasicInfo } from '../useSchoolBasicInfo';
import { createHonorGradeBoards, formatHonorRank, formatHonorScore, getHonorGradeGrid, type HonorGradeBoard } from './studentHonorModel';
import { HonorPodium } from './HonorPodium';
import './studentHonorScreen.css';

export function HonorGradeBoardContent({ board }: { board: HonorGradeBoard }) {
  const otherStudents = board.rows.slice(3);
  return <article className="honor-grade-card" aria-labelledby={`honor-grade-${board.id}`}>
    <header className="honor-grade-heading"><div><Trophy size={24} aria-hidden="true" /><h2 id={`honor-grade-${board.id}`}>{board.name}</h2></div><span>总分 TOP10</span></header>
    <div className="honor-grade-body">
      <HonorPodium rows={board.rows} gradeName={board.name} />
      <section className="honor-ranking-table" aria-label={`${board.name}其余上榜同学`}>
        <div className="honor-ranking-columns" aria-hidden="true"><span>名次</span><span>同学</span><span>总分</span></div>
        {!otherStudents.length ? <p className="honor-empty">暂无更多上榜同学</p> : <ol className="honor-ranking-list" start={4}>{otherStudents.map(row => <li key={row.student.id}>
          <span className="honor-list-rank" aria-label={`${row.tied ? '并列' : ''}第${row.rank}名`}>{formatHonorRank(row.rank)}</span>
          <span className="honor-list-name" title={`${row.student.displayName} · ${row.student.className}`}>{row.student.displayName}</span>
          <strong className="honor-list-score">{formatHonorScore(row.score)}</strong>
        </li>)}</ol>}
      </section>
    </div>
  </article>;
}

export function StudentHonorContent({ snapshot }: { snapshot: GrowthSnapshot }) {
  const boards = useMemo(() => createHonorGradeBoards(snapshot), [snapshot]);
  const { columns, rows, dense } = getHonorGradeGrid(boards.length);
  if (!boards.length) return <main className="honor-empty">暂无年级学生数据</main>;
  return <main className="honor-grade-grid" aria-label="全部年级学生总分榜" data-density={dense ? 'dense' : 'comfortable'}
    style={{ '--honor-grade-columns': columns, '--honor-grade-rows': rows } as CSSProperties}>
    {boards.map(board => <HonorGradeBoardContent key={board.id} board={board} />)}
  </main>;
}

function HonorHeader({ schoolName }: { schoolName: string }) {
  const school = useSchoolBasicInfo('school-star', schoolName);
  const [fullscreen, setFullscreen] = useState(false);
  const [failedLogo, setFailedLogo] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const previous = document.title;
    document.title = `${school.displayName}学生荣誉榜`;
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    sync(); document.addEventListener('fullscreenchange', sync);
    return () => { document.title = previous; document.removeEventListener('fullscreenchange', sync); };
  }, [school.displayName]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('当前环境不支持全屏，请使用浏览器的全屏功能。');
    } catch { setNotice('暂时无法进入全屏，请重试。'); }
  };
  return <header className="honor-header">
    <div className="honor-school">{school.logoUrl && failedLogo !== school.logoUrl && <img src={school.logoUrl} alt="" onError={() => setFailedLogo(school.logoUrl)} />}<span>{school.displayName}</span></div>
    <div className="honor-title"><h1>学生<span>荣誉榜</span></h1><p><Sparkles size={20} aria-hidden="true" />为每一份努力喝彩</p></div>
    <button className="honor-fullscreen" type="button" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'}>{fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}<span>{fullscreen ? '退出全屏' : '全屏展示'}</span></button>
    {notice && <p className="honor-notice" role="status">{notice}</p>}
  </header>;
}

export default function StudentHonorScreen() {
  const { viewportRef, scale, canvasWidth, canvasHeight } = useScreenCanvasLayout();
  const [dataset, setDataset] = useState<GrowthDataset | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setError(false);
    loadStudentGrowth().then(value => { if (!cancelled) setDataset(value); }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [revision]);
  const snapshot = useMemo(() => dataset ? selectGrowthSnapshot(dataset) : null, [dataset]);
  return <div ref={viewportRef} className="honor-viewport">
    <div className="honor-screen" style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden', '--honor-touch-target': `${Math.max(64, 56 / (scale || 1))}px` } as CSSProperties}>
      <HonorHeader schoolName={snapshot?.schoolName ?? '星河实验学校'} />
      {snapshot ? <StudentHonorContent snapshot={snapshot} /> : <main className="honor-loading" role="status">{error ? <><p>荣誉榜暂时未能加载</p><button type="button" onClick={() => setRevision(value => value + 1)}><RefreshCw size={22} />重新加载</button></> : <p>正在准备荣誉榜…</p>}</main>}
    </div>
  </div>;
}
