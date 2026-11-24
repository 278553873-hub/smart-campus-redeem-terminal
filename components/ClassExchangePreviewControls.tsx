import React from 'react';
import PreviewSegmentTrack from './PreviewSegmentTrack';

const options = [
  { hasCabinet: true, label: '有货柜机' },
  { hasCabinet: false, label: '无货柜机' },
] as const;

export default function ClassExchangePreviewControls({ hasCabinet, onChange }: {
  hasCabinet: boolean;
  onChange: (hasCabinet: boolean) => void;
}) {
  return <section className="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]" aria-label="兑换记录预览">
    <h2 className="mb-3 text-[13px] font-bold text-slate-900">兑换记录预览</h2>
    <PreviewSegmentTrack index={hasCabinet ? 0 : 1} count={options.length} className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="学校货柜机状态">
      {options.map(option => (
        <button
          key={option.label}
          type="button"
          aria-pressed={hasCabinet === option.hasCabinet}
          onClick={() => onChange(option.hasCabinet)}
          className={`min-h-9 rounded-md px-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${hasCabinet === option.hasCabinet ? 'text-rose-700' : 'text-slate-500 hover:text-slate-800'}`}
        >{option.label}</button>
      ))}
    </PreviewSegmentTrack>
  </section>;
}
