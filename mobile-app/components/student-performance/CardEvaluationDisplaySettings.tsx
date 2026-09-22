import React from 'react';
import type { EvaluationCardDisplaySettings } from '../../types';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';
import MobileSettingsSwitchRow from '../ui/MobileSettingsSwitchRow';

type EvaluationContentMode = 'all' | 'praise' | 'criticism';

const CONTENT_MODE_OPTIONS: Array<{ value: EvaluationContentMode; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'praise', label: '表扬' },
  { value: 'criticism', label: '待改进' },
];

interface CardEvaluationDisplaySettingsProps {
  settings: EvaluationCardDisplaySettings;
  onChange: (settings: EvaluationCardDisplaySettings) => void;
}

const CardEvaluationDisplaySettings: React.FC<CardEvaluationDisplaySettingsProps> = ({
  settings,
  onChange,
}) => {
  const contentMode: EvaluationContentMode = settings.showPraise && settings.showCriticism
    ? 'all'
    : settings.showPraise
      ? 'praise'
      : settings.showCriticism
        ? 'criticism'
        : 'all';

  const handleContentModeChange = (nextMode: EvaluationContentMode) => {
    onChange({
      ...settings,
      showPraise: nextMode === 'all' || nextMode === 'praise',
      showCriticism: nextMode === 'all' || nextMode === 'criticism',
    });
  };

  return (
    <div role="group" aria-label="表扬/待改进展示设置" className="space-y-[var(--tm-space-1)]">
      <MobileSettingsSwitchRow
        label="显示表扬/待改进"
        checked={settings.showEvaluation}
        onChange={showEvaluation => onChange({ ...settings, showEvaluation })}
        surface="plain"
      />
      {settings.showEvaluation && (
        <div className="space-y-[var(--tm-space-2)]">
          <div className="grid min-h-[var(--tm-size-touch)] grid-cols-[minmax(72px,1fr)_auto] items-center gap-[var(--tm-space-3)] px-[var(--tm-space-1)]">
            <span className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
              显示内容
            </span>
            <CompactSegmentedControl
              value={contentMode}
              items={CONTENT_MODE_OPTIONS}
              onChange={handleContentModeChange}
              ariaLabel="表扬/待改进显示内容"
              semantics="group"
              variant="settings"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CardEvaluationDisplaySettings;
