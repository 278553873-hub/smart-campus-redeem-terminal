import React from 'react';
import type {
  ParentEvaluationVisibility,
  ParentEvaluationVisibilitySettings as VisibilitySettings,
} from '../../types';
import { getParentEvaluationVisibilitySettings } from '../../domain/parentEvaluationVisibility';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';

interface ParentEvaluationVisibilitySettingsProps {
  classDisplayName: string;
  settings?: Partial<VisibilitySettings>;
  onChange: (settings: VisibilitySettings) => void;
}

const VISIBILITY_OPTIONS: Array<{ value: ParentEvaluationVisibility; label: string }> = [
  { value: 'hidden', label: '不展示' },
  { value: 'summary', label: '仅统计' },
  { value: 'summaryAndDetails', label: '统计和明细' },
];

const ParentEvaluationVisibilitySettings: React.FC<ParentEvaluationVisibilitySettingsProps> = ({
  classDisplayName,
  settings,
  onChange,
}) => {
  const visibility = getParentEvaluationVisibilitySettings(settings);

  const updateVisibility = (
    direction: keyof VisibilitySettings,
    value: ParentEvaluationVisibility,
  ) => {
    if (visibility[direction] === value) return;
    onChange({ ...visibility, [direction]: value });
  };

  return (
    <div className="space-y-6 pb-2">
      <p className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
        {classDisplayName}
      </p>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-3 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">正向评价</legend>
        <CompactSegmentedControl
          value={visibility.positive}
          items={VISIBILITY_OPTIONS}
          onChange={value => updateVisibility('positive', value)}
          ariaLabel="正向评价家长端展示范围"
          fullWidth
          semantics="group"
          motion="sliding"
        />
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-3 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">负向评价</legend>
        <CompactSegmentedControl
          value={visibility.negative}
          items={VISIBILITY_OPTIONS}
          onChange={value => updateVisibility('negative', value)}
          ariaLabel="负向评价家长端展示范围"
          fullWidth
          semantics="group"
          motion="sliding"
        />
      </fieldset>
    </div>
  );
};

export default ParentEvaluationVisibilitySettings;
