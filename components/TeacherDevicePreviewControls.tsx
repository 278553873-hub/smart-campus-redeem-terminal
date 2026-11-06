import React from 'react';
import PreviewSegmentTrack from './PreviewSegmentTrack';

interface TeacherDevicePreviewControlsProps {
  value: 'phone' | 'tablet';
  onChange: (value: 'phone' | 'tablet') => void;
}

const options = [
  { value: 'phone', label: '手机' },
  { value: 'tablet', label: '平板' },
] as const;

/** 手机壳外的桌面演示工具，沿用家长端和货柜机的单行预览规格。 */
export default function TeacherDevicePreviewControls({ value, onChange }: TeacherDevicePreviewControlsProps) {
  return (
    <section className="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]" aria-label="真机模拟设备配置">
      <h2 className="mb-3 text-[13px] font-bold text-slate-900">设备类型</h2>
      <PreviewSegmentTrack
        index={options.findIndex(option => option.value === value)}
        count={options.length}
        gap={0}
        role="group"
        aria-label="模拟设备"
        className="grid grid-cols-2 rounded-lg bg-slate-100 p-1"
      >
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`min-h-9 min-w-0 whitespace-nowrap rounded-md px-1 text-[11px] font-semibold leading-tight transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${value === option.value ? 'text-rose-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {option.label}
          </button>
        ))}
      </PreviewSegmentTrack>
    </section>
  );
}
