import React from 'react';
import PreviewSegmentTrack from './PreviewSegmentTrack';
import type { ParentGrowthCoinFeatureSettings } from '../shared/parentGrowthCoinFeature';

interface Props {
  settings: ParentGrowthCoinFeatureSettings;
  onChange: (settings: ParentGrowthCoinFeatureSettings) => void;
}

const FeatureOptions = ({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (enabled: boolean) => void }) => (
  <PreviewSegmentTrack index={enabled ? 0 : 1} count={2} gap={0} className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label={label}>
    {[
      { value: true, label: '开放' },
      { value: false, label: '未开放' },
    ].map(option => {
      const selected = enabled === option.value;
      return <button key={option.label} type="button" onClick={() => onChange(option.value)} aria-pressed={selected}
        className={`min-h-9 rounded-md px-2 text-[12px] font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${selected ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}>
        {option.label}
      </button>;
    })}
  </PreviewSegmentTrack>
);

export default function ParentGrowthCoinFeaturePreviewControls({ settings, onChange }: Props) {
  return <section className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]" aria-label="成长币功能开放预览配置">
    <h2 className="mb-3 text-[13px] font-bold text-slate-900">成长币功能开放</h2>
    <FeatureOptions label="成长币功能开放状态" enabled={settings.enabled} onChange={enabled => onChange({ ...settings, enabled })} />
    {settings.enabled && <div className="mt-3 border-t border-slate-100 pt-3">
      <h3 className="mb-2 text-[12px] font-semibold text-slate-700">银行功能开放</h3>
      <FeatureOptions label="银行功能开放状态" enabled={settings.bankEnabled} onChange={bankEnabled => onChange({ ...settings, bankEnabled })} />
    </div>}
  </section>;
}
