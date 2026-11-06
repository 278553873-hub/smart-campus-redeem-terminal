import React, { useEffect, useState } from 'react';
import PreviewSegmentTrack from './PreviewSegmentTrack';
import {
  PARENT_RECORDING_UPDATED,
  readParentRecordingSettings,
  writeParentRecordingSettings,
} from '../shared/parentRecordingSettings';

export default function ParentEvaluationFeaturePreviewControls({ schoolCode }: { schoolCode: string }) {
  const [settings, setSettings] = useState(() => readParentRecordingSettings(schoolCode));
  const [error, setError] = useState('');

  useEffect(() => {
    const refresh = () => setSettings(readParentRecordingSettings(schoolCode));
    refresh();
    setError('');
    window.addEventListener(PARENT_RECORDING_UPDATED, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PARENT_RECORDING_UPDATED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [schoolCode]);

  const updateEnabled = (enabled: boolean) => {
    try {
      const next = { ...readParentRecordingSettings(schoolCode), enabled };
      writeParentRecordingSettings(schoolCode, next);
      setSettings(next);
      setError('');
    } catch {
      setError('保存失败，请重试');
    }
  };

  return (
    <section className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]" aria-label="家长评价功能预览配置">
      <h2 className="mb-3 text-[13px] font-bold text-slate-900">是否开启家长评价</h2>
      <PreviewSegmentTrack index={settings.enabled ? 0 : 1} count={2} gap={0} className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="是否开启家长评价">
        {[
          { value: true, label: '开启' },
          { value: false, label: '关闭' },
        ].map(option => (
          <button
            key={option.label}
            type="button"
            onClick={() => updateEnabled(option.value)}
            aria-pressed={settings.enabled === option.value}
            className={`min-h-9 rounded-md px-2 text-[12px] font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${settings.enabled === option.value ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {option.label}
          </button>
        ))}
      </PreviewSegmentTrack>
      {error && <p role="alert" className="mt-2 text-[12px] font-medium text-red-700">{error}</p>}
    </section>
  );
}
