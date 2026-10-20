import React, { useRef } from 'react';
import { X, RotateCw, Expand } from 'lucide-react';
import { normalizeCoverRotation, constrainCoverPlacement, type CoverStyle } from '../../domain/termReportAppearance';

export interface ArtworkEditor {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onChange: (placement: Pick<CoverStyle, 'imageScale' | 'imageOffsetX' | 'imageOffsetY' | 'imageRotation'>) => void;
}
/** 图片可跨原始主图区域移动；操作框跟随图片变换，坐标仍以未变换的主图区域为基准。 */
export default function ArtworkPlacementControl({ style, editor }: { style: CoverStyle; editor: ArtworkEditor }) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<{ kind: 'rotate' | 'scale'; pointerId: number; x: number; y: number; angle: number; distance: number; rotation: number; scale: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const baseline = useRef({ x: 0, y: 0, distance: 0, angle: 0, rotation: 0, scale: 100, offsetX: 0, offsetY: 0 });
  const latest = useRef(style);
  latest.current = style;
  const geometry = () => {
    const points = [...pointers.current.values()];
    const a = points[0]; const b = points[1] ?? a;
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, distance: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  const reset = () => {
    if (!pointers.current.size) return;
    baseline.current = { ...geometry(), rotation: latest.current.imageRotation ?? 0, scale: latest.current.imageScale, offsetX: latest.current.imageOffsetX ?? 0, offsetY: latest.current.imageOffsetY ?? 0 };
  };
  const end = (event: React.PointerEvent<HTMLButtonElement>) => {
    pointers.current.delete(event.pointerId);
    reset();
  };
  const place = (scale: number, x = 0, y = 0) => {
    const placement = constrainCoverPlacement(scale, x, y);
    const art = root.current?.parentElement?.getBoundingClientRect();
    const cover = root.current?.closest('.term-report-cover')?.getBoundingClientRect();
    if (!art || !cover || !art.width || !art.height) return placement;
    // 图片中心可到达封面任意位置，避免整张图被拖出画布后无法取回。
    const centerX = art.left + art.width / 2; const centerY = art.top + art.height / 2;
    return { ...placement,
      imageOffsetX: Math.max((cover.left - centerX) / art.width * 100, Math.min((cover.right - centerX) / art.width * 100, placement.imageOffsetX)),
      imageOffsetY: Math.max((cover.top - centerY) / art.height * 100, Math.min((cover.bottom - centerY) / art.height * 100, placement.imageOffsetY)),
    };
  };
  const applyHandle = (kind: 'rotate' | 'scale', delta: number) => {
    if (kind === 'rotate') editor.onChange({ imageScale: style.imageScale, imageRotation: normalizeCoverRotation((style.imageRotation ?? 0) + delta) });
    else editor.onChange(place(style.imageScale + delta, style.imageOffsetX, style.imageOffsetY));
  };
  const handleProps = (kind: 'rotate' | 'scale') => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const rect = root.current?.getBoundingClientRect(); if (!rect) return;
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      handle.current = { kind, pointerId: event.pointerId, x, y, angle: Math.atan2(event.clientY - y, event.clientX - x), distance: Math.max(1, Math.hypot(event.clientX - x, event.clientY - y)), rotation: style.imageRotation ?? 0, scale: style.imageScale, moved: false };
      suppressClick.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => {
      const start = handle.current; if (!start || start.pointerId !== event.pointerId) return;
      const angle = Math.atan2(event.clientY - start.y, event.clientX - start.x);
      const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (Math.abs(distance - start.distance) < 3 && Math.abs(angle - start.angle) < .03 && !start.moved) return;
      start.moved = true;
      if (start.kind === 'rotate') editor.onChange({ imageScale: start.scale, imageRotation: normalizeCoverRotation(start.rotation + (angle - start.angle) * 180 / Math.PI) });
      else editor.onChange(place(start.scale * distance / start.distance, style.imageOffsetX, style.imageOffsetY));
    },
    onPointerUp: () => { suppressClick.current = Boolean(handle.current?.moved); handle.current = null; },
    onPointerCancel: () => { suppressClick.current = true; handle.current = null; },
    onLostPointerCapture: () => { handle.current = null; },
    onClick: () => { if (!suppressClick.current) applyHandle(kind, kind === 'rotate' ? 15 : 5); suppressClick.current = false; },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      applyHandle(kind, (['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 1) * (kind === 'rotate' ? 5 : 1));
    },
  });
  return <div ref={root} className="cover-artwork-editor"><button type="button" className="cover-artwork-control" aria-label="调整封面图，方向键移动，加减键缩放" aria-pressed={editor.selected} disabled={editor.disabled}
    onClick={editor.onSelect}
    onPointerDown={event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      editor.onSelect();
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      reset();
    }}
    onPointerMove={event => {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const next = geometry(); const start = baseline.current;
      const rect = root.current?.parentElement?.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      const placement = place(start.distance > 0 ? start.scale * next.distance / start.distance : start.scale, start.offsetX + (next.x - start.x) / rect.width * 100, start.offsetY + (next.y - start.y) / rect.height * 100);
      const transform = { ...placement, imageRotation: normalizeCoverRotation(start.rotation + (start.distance > 0 ? (next.angle - start.angle) * 180 / Math.PI : 0)) };
      latest.current = { ...latest.current, ...transform };
      editor.onChange(transform);
    }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
    onKeyDown={event => {
      const delta = { ArrowLeft: [-1, 0, 0], ArrowRight: [1, 0, 0], ArrowUp: [0, -1, 0], ArrowDown: [0, 1, 0], '+': [0, 0, 1], '=': [0, 0, 1], '-': [0, 0, -1] }[event.key];
      if (!delta) return;
      event.preventDefault(); editor.onSelect();
      editor.onChange(place(style.imageScale + delta[2], (style.imageOffsetX ?? 0) + delta[0], (style.imageOffsetY ?? 0) + delta[1]));
    }} />
    {editor.selected && <>
      <button type="button" className="cover-artwork-handle cover-artwork-handle--cancel" aria-label="取消选中封面图" disabled={editor.disabled} onClick={editor.onDeselect}><span><X aria-hidden="true" /></span></button>
      <button type="button" className="cover-artwork-handle cover-artwork-handle--rotate" aria-label="旋转封面图" disabled={editor.disabled} {...handleProps('rotate')}><span><RotateCw aria-hidden="true" /></span></button>
      <button type="button" className="cover-artwork-handle cover-artwork-handle--scale" aria-label="缩放封面图" disabled={editor.disabled} {...handleProps('scale')}><span><Expand aria-hidden="true" /></span></button>
    </>}
  </div>;
}
