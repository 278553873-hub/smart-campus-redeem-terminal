import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';

interface GalleryProps {
  images: string[];
  label?: string;
  onSelect: (index: number) => void;
  className?: string;
}

const GalleryImage: React.FC<{ src: string; alt: string; preview?: boolean }> = ({ src, alt, preview = false }) => {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (failed) return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-sm" role="status">
      <ImageOff className="h-6 w-6" aria-hidden="true" />
      <span>图片加载失败</span>
      {preview && <button type="button" className="min-h-11 rounded-xl px-4 underline focus-visible:outline focus-visible:outline-2" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>重新加载</button>}
    </span>
  );
  return <img key={attempt} src={src} alt={alt} loading={preview ? 'eager' : 'lazy'} draggable={false} onError={() => setFailed(true)} className={`h-full w-full ${preview ? 'object-contain' : 'object-cover'}`} />;
};

/** 通用图片网格只负责媒体展示，不处理评价类型或可见性规则。 */
export const ImageGallery: React.FC<GalleryProps> = ({ images, label = '图片', onSelect, className = '' }) => {
  if (!images.length) return null;
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`} role="group" aria-label={label}>
      {images.map((src, index) => (
        <button key={`${index}-${src}`} type="button" onClick={() => onSelect(index)} aria-label={`查看${label}第 ${index + 1} 张，共 ${images.length} 张`} aria-haspopup="dialog" className="aspect-square min-h-11 min-w-11 overflow-hidden rounded-[var(--media-radius,12px)] bg-black/5 text-inherit active:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <GalleryImage key={src} src={src} alt={`${label}第 ${index + 1} 张`} />
        </button>
      ))}
    </div>
  );
};

interface ImagePreviewProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  label?: string;
}

/** 挂在手机容器根部，避免随记录列表滚动或被卡片裁切。 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, initialIndex, onClose, label = '图片预览' }) => {
  const [index, setIndex] = useState(() => Math.max(0, Math.min(initialIndex, images.length - 1)));
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const currentIndex = Math.min(index, images.length - 1);
  const move = (delta: number) => setIndex(value => Math.max(0, Math.min(value + delta, images.length - 1)));

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);

  if (!images.length) return null;
  const controlClass = 'flex h-11 min-w-11 items-center justify-center rounded-full bg-white/10 px-3 text-white active:bg-white/20 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label} className="absolute inset-0 z-[150] flex flex-col overscroll-contain bg-neutral-950 text-white" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'Tab') {
        const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <header className="flex shrink-0 items-center justify-between gap-3 p-3">
        <span className="px-2 text-sm tabular-nums" aria-live="polite" aria-atomic="true">{currentIndex + 1} / {images.length}</span>
        <button ref={closeRef} type="button" onClick={onClose} className={controlClass} aria-label="关闭图片预览"><X className="h-5 w-5" /></button>
      </header>
      <div className="min-h-0 flex-1 touch-pan-y overflow-hidden" onTouchStart={event => {
        touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      }} onTouchCancel={() => { touchStart.current = null; }} onTouchEnd={event => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || !event.changedTouches[0]) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}>
        <GalleryImage key={`${currentIndex}-${images[currentIndex]}`} src={images[currentIndex]} alt={`${label}第 ${currentIndex + 1} 张`} preview />
      </div>
      {images.length > 1 && <footer className="flex shrink-0 justify-center gap-8 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <button type="button" className={controlClass} disabled={currentIndex === 0} onClick={() => move(-1)} aria-label="上一张图片"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" className={controlClass} disabled={currentIndex === images.length - 1} onClick={() => move(1)} aria-label="下一张图片"><ChevronRight className="h-5 w-5" /></button>
      </footer>}
    </div>
  );
};
