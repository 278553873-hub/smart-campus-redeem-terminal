import React, { useId } from 'react';

/** 标题背后保持完整留白，折线统一位于文字下方，不用固定宽度边框包围长校名。 */
export function ScreenHeaderArtwork() {
  const id = useId().replace(/:/g, '');
  return <svg className="screen-panorama-header-art" viewBox="0 0 1920 92" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-surface`} cx="50%" cy="20%" r="65%"><stop stopColor="#44321f" stopOpacity=".3" /><stop offset="1" stopColor="#0a0807" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#44321f" stopOpacity=".25" /><stop offset="1" stopColor="#322319" stopOpacity=".05" /></linearGradient>
      <linearGradient id={`${id}-line`}><stop stopColor="#6f3b13" stopOpacity="0" /><stop offset=".23" stopColor="#bd7e34" stopOpacity=".5" /><stop offset=".5" stopColor="#ffe0a6" stopOpacity=".75" /><stop offset=".77" stopColor="#bd7e34" stopOpacity=".5" /><stop offset="1" stopColor="#6f3b13" stopOpacity="0" /></linearGradient>
      <filter id={`${id}-glow`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <rect width="1920" height="76" fill={`url(#${id}-surface)`} />
    <path d="M264 74H1656L1640 84H280Z" fill={`url(#${id}-metal)`} />
    <path d="M16 74H264L280 84H1640L1656 74H1904" fill="none" stroke={`url(#${id}-line)`} strokeWidth="2" opacity=".5" filter={`url(#${id}-glow)`} />
    <path d="M16 74H264L280 84H1640L1656 74H1904" fill="none" stroke={`url(#${id}-line)`} strokeWidth="1.2" />
    <path d="M32 82H236 M1684 82H1888" stroke="#d9984f" strokeDasharray="2 6" opacity=".3" />
    <path d="M800 84H1120" stroke="#ffdf9e" strokeWidth="3" filter={`url(#${id}-glow)`} />
    <path d="M870 84H1050" stroke="#fff0ce" strokeWidth="2" />
  </svg>;
}
