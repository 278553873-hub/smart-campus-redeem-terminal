import React from 'react';
import PreviewSegmentTrack from './PreviewSegmentTrack';

export default function ParentRecordDataPreviewControls({ value, onChange }: {
  value: 'records' | 'empty';
  onChange: (value: 'records' | 'empty') => void;
}) {
  return <section className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]" aria-label="家长记录数据预览配置">
    <h2 className="mb-3 text-[13px] font-bold text-slate-900">家长记录数据</h2>
    <PreviewSegmentTrack index={value === 'records' ? 0 : 1} count={2} gap={0} className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="家长记录数据状态">
      {([{ value: 'records', label: '有家长记录' }, { value: 'empty', label: '无家长记录' }] as const).map(option => <button
        key={option.value} type="button" onClick={() => onChange(option.value)} aria-pressed={value === option.value}
        className={`min-h-9 rounded-md px-2 text-[12px] font-semibold transition-[background-color,color,box-shadow] duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${value === option.value ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
      >{option.label}</button>)}
    </PreviewSegmentTrack>
  </section>;
}
