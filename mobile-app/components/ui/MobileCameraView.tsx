import React, { useState } from 'react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

interface MobileCameraViewProps {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  onCapture: () => void;
  busy?: boolean;
  guidance?: string;
}

/** 只承载相机操作与取景布局，预览画面和识别业务由调用方提供。 */
const MobileCameraView: React.FC<MobileCameraViewProps> = ({
  title, children, onBack, onCapture, busy = false,
  guidance = '请将名单完整放入框内，保持文字清晰',
}) => {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-camera-bg)] text-[var(--tm-camera-text)]">
      <header className="relative flex h-[var(--mini-program-title-bar-height,44px)] shrink-0 items-center pl-3 [padding-right:max(12px,var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} aria-label="返回学生选择" className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <h2 className="pointer-events-none absolute left-14 right-[max(56px,var(--mini-program-capsule-right-inset,0px))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold">{title}</h2>
      </header>

      <div className="relative isolate min-h-0 flex-1 overflow-hidden bg-[var(--tm-camera-preview-bg)]" aria-label="相机取景画面">
        <div className="absolute inset-0 origin-center transition-transform duration-200 motion-reduce:transition-none" style={{ transform: `scale(${zoom})` }}>
          {children}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] bottom-[24%] top-[10%] rounded-[24px] [box-shadow:var(--tm-camera-viewfinder-shadow)]">
          <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-[24px] border-l-[3px] border-t-[3px] border-current" />
          <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-[24px] border-r-[3px] border-t-[3px] border-current" />
          <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-[24px] border-b-[3px] border-l-[3px] border-current" />
          <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-[24px] border-b-[3px] border-r-[3px] border-current" />
        </div>
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--tm-camera-control-bg)]" role="status">
            <div className="flex items-center gap-2 rounded-full bg-[var(--tm-camera-control-bg)] px-4 py-3 text-[length:var(--tm-font-size-body)]">
              <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />正在识别名单…
            </div>
          </div>
        )}
        <div className="absolute inset-x-4 bottom-4 flex flex-col items-center gap-3">
          <p className="max-w-full rounded-full bg-[var(--tm-camera-control-bg)] px-3 py-2 text-center text-[length:var(--tm-font-size-compact)] font-medium">{guidance}</p>
          <div className="flex items-center gap-1 rounded-full bg-[var(--tm-camera-control-bg)] p-1" role="group" aria-label="取景缩放">
            {[1, 2].map(value => (
              <button key={value} type="button" aria-label={`${value}倍取景`} aria-pressed={zoom === value} disabled={busy} onClick={() => setZoom(value)} className={`flex h-11 w-11 items-center justify-center rounded-full text-[length:var(--tm-font-size-body)] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${zoom === value ? 'bg-[var(--tm-camera-control-bg)] text-[var(--tm-camera-zoom-active)]' : ''}`}>{value}×</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-4">
        <button type="button" onClick={onCapture} disabled={busy} aria-label="拍照识别" className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-[var(--tm-camera-text)] p-1 transition-transform duration-150 active:scale-95 disabled:opacity-50 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <span className="h-full w-full rounded-full bg-[var(--tm-camera-text)]" aria-hidden="true" />
        </button>
        <span className="text-[length:var(--tm-font-size-meta)]">{busy ? '识别中' : '拍照识别'}</span>
      </div>
    </div>
  );
};

export default MobileCameraView;
