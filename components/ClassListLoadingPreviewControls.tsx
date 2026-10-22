import React from 'react';
import type { ClassListLoadingPreview } from '../shared/classListLoadingPreview';

interface ClassListLoadingPreviewControlsProps {
  value: ClassListLoadingPreview;
  onChange: (value: ClassListLoadingPreview) => void;
}

/** 调试入口放在手机外，避免进入真实用户页面。 */
const ClassListLoadingPreviewControls: React.FC<ClassListLoadingPreviewControlsProps> = ({ value, onChange }) => (
  <section aria-label="列表加载演示" className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
    <h2 className="text-[12px] font-semibold text-slate-700">列表加载演示</h2>
    <label className="mt-1 flex min-h-11 items-center gap-2">
      <span className="shrink-0 text-[11px] font-medium text-slate-500">模拟等待</span>
      <select
        aria-label="列表模拟加载等待时间"
        value={value.durationMs}
        onChange={event => onChange({ durationMs: Number(event.target.value), replayKey: value.replayKey + 1, mode: 'timed' })}
        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-[12px] font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <option value={1800}>1.8 秒</option>
        <option value={4500}>4.5 秒</option>
        <option value={8000}>8 秒</option>
      </select>
    </label>
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => onChange({ ...value, mode: 'timed', replayKey: value.replayKey + 1 })} className="min-h-11 rounded-lg bg-slate-800 px-1 text-[12px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">重播加载</button>
      <button type="button" aria-pressed={value.mode === 'hold'} onClick={() => onChange({ ...value, mode: value.mode === 'hold' ? 'ready' : 'hold' })} className={`min-h-11 rounded-lg px-1 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${value.mode === 'hold' ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-700'}`}>{value.mode === 'hold' ? '显示内容' : '保持骨架'}</button>
    </div>
  </section>
);

export default ClassListLoadingPreviewControls;
