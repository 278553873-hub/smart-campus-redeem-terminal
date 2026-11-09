import React, { useId } from 'react';

/** 标题装饰与真实标题分层，文字和控件不烘焙进图片。 */
export function ScreenHeaderArtwork() {
  const id = useId().replace(/:/g, '');
  return <svg className="evaluation-screen-header-art" viewBox="0 0 1920 92" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9f713c" stopOpacity=".35" /><stop offset=".45" stopColor="#16120e" stopOpacity=".5" /><stop offset="1" stopColor="#322319" stopOpacity=".15" /></linearGradient>
      <linearGradient id={`${id}-line`}><stop stopColor="#6f3b13" stopOpacity="0" /><stop offset=".23" stopColor="#bd7e34" /><stop offset=".5" stopColor="#ffe0a6" /><stop offset=".77" stopColor="#bd7e34" /><stop offset="1" stopColor="#6f3b13" stopOpacity="0" /></linearGradient>
      <filter id={`${id}-glow`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <path d="M394 0H548L610 62H1310L1372 0H1526L1468 44H1396L1355 79H565L524 44H452Z" fill={`url(#${id}-metal)`} stroke="#d39b514d" />
    <path d="M16 67H557L574 79H1346L1363 67H1904 M354 2H542L607 66H1313L1378 2H1566" fill="none" stroke={`url(#${id}-line)`} strokeWidth="2" filter={`url(#${id}-glow)`} />
    <path d="M16 67H557L574 79H1346L1363 67H1904 M354 2H542L607 66H1313L1378 2H1566" fill="none" stroke={`url(#${id}-line)`} strokeWidth="1.2" />
    <path d="M368 15H510L551 55H578 M1552 15H1410L1369 55H1342 M448 0L482 34H515 M1472 0L1438 34H1405" stroke="#e6b77066" fill="none" />
    <path d="M270 53H452 M1468 53H1650" stroke="#d9984f" strokeDasharray="2 6" opacity=".65" />
    <path d="M835 79H1085" stroke="#ffdf9e" strokeWidth="2.5" filter={`url(#${id}-glow)`} />
    <path d="M886 79H1034" stroke="#ffe8be" strokeWidth="1.7" />
  </svg>;
}
