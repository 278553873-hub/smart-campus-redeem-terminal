import React, { createContext, useContext } from 'react';
import './screenPanoramaNavigation.css';

export type Panorama = 'school' | 'moral';
export const PanoramaNavigationContext = createContext<((next: Panorama) => void) | null>(null);
const panoramas = [
  { key: 'school', label: '学校育人全景', app: 'data-screen' },
  { key: 'moral', label: '德育管理全景', app: 'moral-education-screen' },
] as const;

/** 两个独立大屏的共同导航，不共享各自的展示组件和数据状态。 */
export function ScreenPanoramaNavigation({ current }: { current: Panorama }) {
  const navigate = useContext(PanoramaNavigationContext);
  const href = (app: string) => {
    const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location?.search ?? '');
    params.set('app', app);
    return `?${params.toString()}`;
  };
  return <nav className="screen-panorama-navigation" aria-label="全景视图切换">
    {panoramas.map(item => <a key={item.key} href={href(item.app)}
      aria-current={current === item.key ? 'page' : undefined}
      onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (current === item.key || navigate) event.preventDefault();
        if (current !== item.key) navigate?.(item.key);
      }}>{item.label}</a>)}
  </nav>;
}
