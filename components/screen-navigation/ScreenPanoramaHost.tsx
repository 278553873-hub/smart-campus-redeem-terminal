import React, { useEffect, useState } from 'react';
import SchoolPanorama from '../demo-data-screen/StudentEvaluationDataScreen';
import MoralPanorama from '../moral-education-screen/MoralEducationScreen';
import { PanoramaNavigationContext, type Panorama } from './ScreenPanoramaNavigation';
import type { ScreenTheme } from './ScreenThemeToggle';
import './screenPanoramaHost.css';

/** 仅手动切换两张全景；画面常驻以保留各自的筛选与样式选择。 */
export default function ScreenPanoramaHost({ initial }: { initial: Panorama }) {
  const [current, setCurrent] = useState(initial);
  const [visible, setVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const [theme, setTheme] = useState<ScreenTheme>('dark');
  const select = (next: Panorama) => {
    setFocused(false);
    setCurrent(next);
  };
  useEffect(() => { setCurrent(initial); setFocused(false); }, [initial]);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('app', current === 'school' ? 'data-screen' : 'moral-education-screen');
    window.history.replaceState(window.history.state, '', url);
  }, [current]);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    const onPop = () => {
      const app = new URLSearchParams(window.location.search).get('app');
      if (app === 'data-screen' || app === 'moral-education-screen' || app === 'student-growth-screen') {
        setFocused(false);
        setCurrent(app === 'data-screen' ? 'school' : 'moral');
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('popstate', onPop);
    return () => { document.removeEventListener('visibilitychange', sync); window.removeEventListener('popstate', onPop); };
  }, []);
  return <PanoramaNavigationContext.Provider value={select}>
    <div className="screen-panorama-host" onFocusCapture={event => { if (event.target.matches(':focus-visible')) setFocused(true); }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className={`screen-panorama-layer ${current === 'school' ? 'is-current' : ''}`} aria-hidden={current !== 'school'} inert={current !== 'school'}>
        <SchoolPanorama active={visible && !focused && current === 'school'} theme={theme} onThemeChange={setTheme} />
      </div>
      <div className={`screen-panorama-layer ${current === 'moral' ? 'is-current' : ''}`} aria-hidden={current !== 'moral'} inert={current !== 'moral'}>
        <MoralPanorama active={visible && current === 'moral'} theme={theme} onThemeChange={setTheme} />
      </div>
    </div>
  </PanoramaNavigationContext.Provider>;
}
