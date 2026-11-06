import React, { useState } from 'react';
import { FeaturePageBody, FeaturePanel, SwitchControl } from './MeFeatureViews';
import { readParentRecordingSettings, writeParentRecordingSettings, type ParentRecordingSettings } from '../../shared/parentRecordingSettings';

export default function ParentRecordingSettingsView({ schoolId }: { schoolId: string }) {
  const [config, setConfig] = useState(() => readParentRecordingSettings(schoolId));
  const [error, setError] = useState('');
  const save = (next: ParentRecordingSettings) => {
    try { writeParentRecordingSettings(schoolId, next); setConfig(next); setError(''); }
    catch { setError('保存失败，请重试'); }
  };
  const rowClass = 'flex min-h-[60px] items-center justify-between gap-3';
  const labelClass = 'text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]';
  return <FeaturePageBody spacing="compact">
    <FeaturePanel variant="form" className="px-4 py-2">
      <div className={rowClass}>
        <span className={labelClass}>允许家长记录表现</span>
        <SwitchControl label="允许家长记录表现" checked={config.enabled} onChange={enabled => save({ ...config, enabled })} />
      </div>
    </FeaturePanel>
    {config.enabled && <FeaturePanel variant="form" className="px-4 py-2">
      <div className={rowClass}>
        <span className={labelClass}>允许家长拍照录入</span>
        <SwitchControl label="允许家长拍照录入" checked={config.photoEnabled} onChange={photoEnabled => save({ ...config, photoEnabled })} />
      </div>
    </FeaturePanel>}
    {error && <p role="alert" className="text-[length:var(--tm-font-size-body)] text-[var(--tm-status-negative-strong)]">{error}</p>}
  </FeaturePageBody>;
}
