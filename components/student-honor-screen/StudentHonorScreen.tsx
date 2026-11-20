import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Maximize, Minimize, RefreshCw } from 'lucide-react';
import { loadStudentHonor } from './studentHonorService';
import { ScreenHeaderArtwork } from '../screen-navigation/ScreenHeaderArtwork';
import { useScreenCanvasLayout } from '../screen-navigation/useScreenCanvasLayout';
import { useSchoolBasicInfo } from '../useSchoolBasicInfo';
import { createHonorStagePages, formatHonorRank, formatHonorScore, getHonorGradeGrid, getHonorStudentClassName, type HonorGradeBoard, type HonorSnapshot } from './studentHonorModel';
import { HonorAvatar, HonorPodium } from './HonorPodium';
import './studentHonorScreen.css';

export function HonorGradeBoardContent({ board }: { board: HonorGradeBoard }) {
  const otherStudents = board.rows.slice(3);
  return <article className="honor-grade-card" aria-labelledby={`honor-grade-${board.id}`}>
    <header className="honor-grade-heading"><h2 id={`honor-grade-${board.id}`}>{board.name} <em>TOP10</em></h2></header>
    <div className="honor-grade-body">
      <HonorPodium rows={board.rows} gradeName={board.name} />
      <section className="honor-ranking-table" aria-label={`${board.name}其余上榜同学`}>
        {!otherStudents.length ? <p className="honor-empty">暂无更多上榜同学</p> : <ol className="honor-ranking-list" start={4}>{otherStudents.map(row => <li key={row.student.id} data-rank-tier={row.rank <= 3 ? row.rank : undefined}>
          <span className="honor-list-rank" aria-label={`${row.tied ? '并列' : ''}第${row.rank}名`}>{formatHonorRank(row.rank)}</span>
          <HonorAvatar student={row.student} />
          <span className="honor-student-name" title={row.student.displayName}>{row.student.displayName}</span>
          <span className="honor-student-class" title={getHonorStudentClassName(row.student)}>{getHonorStudentClassName(row.student)}</span>
          <span className="honor-total">总分 <strong className="honor-student-score">{formatHonorScore(row.score)}</strong></span>
        </li>)}</ol>}
      </section>
    </div>
  </article>;
}

export function StudentHonorContent({ snapshot }: { snapshot: HonorSnapshot }) {
  const pages = useMemo(() => createHonorStagePages(snapshot), [snapshot]);
  const [pageIndex, setPageIndex] = useState(0);
  const activeIndex = pageIndex % Math.max(pages.length, 1);
  const page = pages[activeIndex];
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (pages.length < 2) return;
    let timer: number | undefined;
    const sync = () => {
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(() => setPageIndex(index => (index + 1) % pages.length), 30_000);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [activeIndex, pages.length]);
  const boards = page?.boards ?? [];
  const { columns, rows, dense } = getHonorGradeGrid(boards.length);
  if (!boards.length) return <main className="honor-empty">暂无年级学生数据</main>;
  const canSwitch = pages.length > 1;
  return <div className="honor-board">
    <main className="honor-grade-grid" data-swipe={canSwitch || undefined}
      aria-label={page?.stage === 'secondary' ? '初高中学生总分榜' : '各年级学生总分榜'}
      data-grade-count={boards.length} data-density={dense ? 'dense' : 'comfortable'}
      style={{ '--honor-grade-columns': columns, '--honor-grade-rows': rows } as CSSProperties}
      onTouchStart={event => {
        const touch = event.touches[0];
        swipeStart.current = canSwitch && event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
      }}
      onTouchCancel={() => { swipeStart.current = null; }}
      onTouchEnd={event => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(touch.clientY - start.y) * 1.5) return;
        setPageIndex(index => (index + (dx < 0 ? 1 : -1) + pages.length) % pages.length);
      }}>
      {boards.map(board => <HonorGradeBoardContent key={board.id} board={board} />)}
    </main>
    {canSwitch && <nav className="honor-page-nav" aria-label="荣誉榜分页">
      {pages.map((item, index) => <button key={index} type="button"
        aria-label={`第${index + 1}屏，${item.boards.map(board => board.name).join('、')}`}
        aria-current={activeIndex === index ? 'page' : undefined}
        onClick={() => setPageIndex(index)}><span aria-hidden="true" /></button>)}
    </nav>}
  </div>;
}

const honorDate = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
const honorClock = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const honorWeekday = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long' });

function HonorHeader({ schoolName }: { schoolName: string }) {
  const school = useSchoolBasicInfo('school-star', schoolName);
  const [fullscreen, setFullscreen] = useState(false);
  const [failedLogo, setFailedLogo] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
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
  const date = honorDate.format(now).replaceAll('/', '-');
  return <header className="honor-header">
    <ScreenHeaderArtwork />
    <div className="honor-school">{school.logoUrl && failedLogo !== school.logoUrl && <img src={school.logoUrl} alt="" onError={() => setFailedLogo(school.logoUrl)} />}</div>
    <div className="honor-title"><h1 title={`${school.displayName}学生荣誉榜`}><span className="honor-school-name">{school.displayName}</span><span className="honor-title-name">学生荣誉榜</span></h1></div>
    <div className="honor-header-right">
      <time dateTime={new Date(now).toISOString()}><span>{date} {honorClock.format(now)}</span><span>{honorWeekday.format(now)}</span></time>
      <button className="honor-fullscreen" type="button" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'} title={fullscreen ? '退出全屏' : '进入全屏'}>{fullscreen ? <Minimize size={32} /> : <Maximize size={32} />}</button>
    </div>
    {notice && <p className="honor-notice" role="status">{notice}</p>}
  </header>;
}

export default function StudentHonorScreen() {
  const { viewportRef, scale, canvasWidth, canvasHeight } = useScreenCanvasLayout();
  const [snapshot, setSnapshot] = useState<HonorSnapshot | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setError(false);
    loadStudentHonor().then(value => { if (!cancelled) setSnapshot(value); }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [revision]);
  return <div ref={viewportRef} className="honor-viewport">
    <div className="honor-screen" style={{ width: canvasWidth, height: canvasHeight, zoom: scale || 1, visibility: scale > 0 ? 'visible' : 'hidden', '--honor-touch-target': `${Math.max(64, 56 / (scale || 1))}px` } as CSSProperties}>
      <HonorHeader schoolName={snapshot?.schoolName ?? '星河实验学校'} />
      {snapshot ? <StudentHonorContent snapshot={snapshot} /> : <main className="honor-loading" role="status">{error ? <><p>荣誉榜暂时未能加载</p><button type="button" onClick={() => setRevision(value => value + 1)}><RefreshCw size={22} />重新加载</button></> : <p>正在准备荣誉榜…</p>}</main>}
    </div>
  </div>;
}
