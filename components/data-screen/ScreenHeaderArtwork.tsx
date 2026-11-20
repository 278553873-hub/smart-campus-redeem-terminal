import React, { useId } from 'react';

/** 标题装饰与真实标题分层，文字和控件不烘焙进图片。 */
export function ScreenHeaderArtwork() {
  const id = useId().replace(/:/g, '');
  return <svg className="school-pc-evaluation-screen-header-art" viewBox="0 0 1920 92" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#44321f" stopOpacity=".35" /><stop offset=".45" stopColor="#0a0807" stopOpacity=".8" /><stop offset="1" stopColor="#322319" stopOpacity=".2" /></linearGradient>
      <linearGradient id={`${id}-line`}><stop stopColor="#6f3b13" stopOpacity="0" /><stop offset=".23" stopColor="#bd7e34" stopOpacity=".5" /><stop offset=".5" stopColor="#ffe0a6" stopOpacity=".75" /><stop offset=".77" stopColor="#bd7e34" stopOpacity=".5" /><stop offset="1" stopColor="#6f3b13" stopOpacity="0" /></linearGradient>
      <filter id={`${id}-glow`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <path d="M394 0H548L610 62H1310L1372 0H1526L1468 44H1396L1355 79H565L524 44H452Z" fill={`url(#${id}-metal)`} stroke="#d39b5133" />
    <path d="M16 67H557L574 79H1346L1363 67H1904 M354 2H542L607 66H1313L1378 2H1566" fill="none" stroke={`url(#${id}-line)`} strokeWidth="2" opacity=".5" filter={`url(#${id}-glow)`} />
    <path d="M16 67H557L574 79H1346L1363 67H1904 M354 2H542L607 66H1313L1378 2H1566" fill="none" stroke={`url(#${id}-line)`} strokeWidth="1.2" />
    <path d="M368 15H510L551 55H578 M1552 15H1410L1369 55H1342 M448 0L482 34H515 M1472 0L1438 34H1405" stroke="#e6b77033" fill="none" />
    <path d="M270 53H452 M1468 53H1650" stroke="#d9984f" strokeDasharray="2 6" opacity=".3" />
    <path d="M800 79H1120" stroke="#ffdf9e" strokeWidth="3" filter={`url(#${id}-glow)`} />
    <path d="M870 79H1050" stroke="#fff0ce" strokeWidth="2" />
  </svg>;
}
