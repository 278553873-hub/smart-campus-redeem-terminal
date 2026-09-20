import React from 'react';
import type { StudentLevelForm } from '../../types';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';
import MobileSettingsSwitchRow from '../ui/MobileSettingsSwitchRow';

const LEVEL_FORM_OPTIONS: Array<{ value: StudentLevelForm; label: string }> = [
  { value: 'icon', label: '图标' },
  { value: 'score', label: '分值' },
];

interface CardLevelDisplaySettingsProps {
  showLevel: boolean;
  levelForm: StudentLevelForm;
  onChange: (settings: { showLevel: boolean; levelForm: StudentLevelForm }) => void;
}

const CardLevelDisplaySettings: React.FC<CardLevelDisplaySettingsProps> = ({
  showLevel,
  levelForm,
  onChange,
}) => (
  <div role="group" aria-label="等级展示设置" className="space-y-[var(--tm-space-1)]">
    <MobileSettingsSwitchRow
      label="显示等级"
      checked={showLevel}
      onChange={nextShowLevel => onChange({ showLevel: nextShowLevel, levelForm })}
      surface="plain"
    />
    {showLevel && (
      <div className="grid min-h-[var(--tm-size-touch)] grid-cols-[minmax(72px,1fr)_auto] items-center gap-[var(--tm-space-3)] px-[var(--tm-space-1)]">
        <div className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
          等级形式
        </div>
        <CompactSegmentedControl
          value={levelForm}
          items={LEVEL_FORM_OPTIONS}
          onChange={nextLevelForm => onChange({ showLevel, levelForm: nextLevelForm })}
          ariaLabel="等级展示形式"
          semantics="group"
          variant="settings"
        />
      </div>
    )}
  </div>
);

export default CardLevelDisplaySettings;
