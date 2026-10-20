import React, { useEffect, useRef, useState } from 'react';
import type { Student } from '../../types';
import type { CoverStyle, ReportAppearance } from '../../domain/termReportAppearance';
import TermReportCover from './TermReportCover';
import ArtworkPlacementControl, { type ArtworkEditor } from './ArtworkPlacementControl';
/** 将真实手机/A4版式等比缩入预览，避免以缩小的容器宽度重新排版。 */
export default function CoverPreview({ config, style, grade, gender, mode = 'mobile', hideArtwork = false, fit = false, artworkEditor, overlay }: {
  config: ReportAppearance; style: CoverStyle; grade: string; gender: Student['gender']; mode?: 'mobile' | 'a4'; hideArtwork?: boolean; fit?: boolean; artworkEditor?: ArtworkEditor; overlay?: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 300, height: 720, availableHeight: 300 });
  const baseWidth = mode === 'a4' ? 210 * 96 / 25.4 : 393;
  useEffect(() => {
    const measure = () => {
      if (outer.current && inner.current) setSize({ width: outer.current.clientWidth, height: inner.current.offsetHeight, availableHeight: outer.current.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    if (inner.current) observer.observe(inner.current);
    return () => observer.disconnect();
  }, [mode, fit]);
  const scale = fit ? Math.min(size.width / baseWidth, size.availableHeight / Math.max(1, size.height)) : size.width / baseWidth;
  const student = { id: 'cover-preview', name: gender === 'male' ? '陈子涵' : '林沐晴', grade, gender, class: '1班' } as Student;
  return <div ref={outer} className={`relative w-full overflow-hidden ${fit ? 'h-full' : 'rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)]'}`} style={fit ? undefined : { height: size.height * scale }}>
    <div ref={inner} className={fit ? 'cover-preview__page' : undefined} style={{ '--cover-preview-scale': Math.max(scale, .01), width: baseWidth, transform: `scale(${scale})`, transformOrigin: 'top left', ...(fit ? { position: 'absolute', left: (size.width - baseWidth * scale) / 2, top: (size.availableHeight - size.height * scale) / 2, display: 'flow-root' } : {}) } as React.CSSProperties}>
      <TermReportCover student={student} mode={mode} appearance={config} coverStyle={style} hideArtwork={hideArtwork} artworkOverlay={artworkEditor && !hideArtwork ? <ArtworkPlacementControl style={style} editor={artworkEditor} /> : undefined} tags={['好奇善问', '认真专注', '乐于分享']} />
    </div>
    {overlay && <div className="cover-preview__overlay" style={{ top: (fit ? (size.availableHeight - size.height * scale) / 2 : 0) + size.height * scale * .8 }}>{overlay}</div>}
  </div>;
}
