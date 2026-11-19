import React, { useEffect, useState, type ReactNode } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useSchoolBasicInfo } from '../useSchoolBasicInfo';
import { ScreenPanoramaNavigation, type Panorama } from './ScreenPanoramaNavigation';
import { ScreenHeaderArtwork } from './ScreenHeaderArtwork';
import './screenPanoramaHeader.css';

const clock = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const weekday = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long' });

export function ScreenPanoramaHeader({ current, schoolName, active = true, actions, heading = '学生成长全景驾驶舱' }: { current: Panorama | 'student'; schoolName: string; active?: boolean; actions?: ReactNode; heading?: string }) {
  const school = useSchoolBasicInfo('school-star', schoolName);
  const title = `${school.displayName}${heading}`;
  const [failedLogo, setFailedLogo] = useState('');
  const [now, setNow] = useState(Date.now);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!active) return;
    const previous = document.title;
    document.title = title;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(timer); document.title = previous; };
  }, [active, title]);
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('当前环境不支持页面全屏，可使用浏览器的全屏功能。');
    } catch { setNotice('未能进入全屏，请重试或使用浏览器的全屏功能。'); }
  };
  return <header className="screen-panorama-header">
    <ScreenHeaderArtwork />
    <div className="screen-panorama-header-left">
      {school.logoUrl && school.logoUrl !== failedLogo && <img className="screen-panorama-logo" src={school.logoUrl} alt="" onError={() => setFailedLogo(school.logoUrl)} />}
      {current !== 'student' && <ScreenPanoramaNavigation current={current} />}
    </div>
    <h1 title={title} aria-label={title}><span className="screen-panorama-school-name">{school.displayName}</span><span>{heading}</span></h1>
    <div className="screen-panorama-header-right">
      <time dateTime={new Date(now).toISOString()}><span>{clock.format(now).replaceAll('/', '-')}</span><span className="screen-panorama-weekday">{weekday.format(now)}</span></time>
      {actions}
      <button className="screen-panorama-fullscreen" type="button" onClick={toggleFullscreen} aria-label={fullscreen ? '退出全屏' : '进入全屏'} title={fullscreen ? '退出全屏' : '进入全屏'}>{fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
    </div>
    {notice && <p className="screen-panorama-notice" role="status">{notice}</p>}
  </header>;
}
