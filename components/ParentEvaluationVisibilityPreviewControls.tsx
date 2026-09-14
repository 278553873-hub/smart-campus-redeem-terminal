import React from 'react';
import type {
  ParentEvaluationVisibility,
  ParentEvaluationVisibilitySettings,
} from '../shared/parentEvaluationVisibility';

interface ParentEvaluationVisibilityPreviewControlsProps {
  settings: ParentEvaluationVisibilitySettings;
  onChange: (settings: ParentEvaluationVisibilitySettings) => void;
}

const OPTIONS: Array<{ value: ParentEvaluationVisibility; label: string }> = [
  { value: 'hidden', label: '不展示' },
  { value: 'summary', label: '仅统计' },
  { value: 'summaryAndDetails', label: '统计和明细' },
];

const ParentEvaluationVisibilityPreviewControls: React.FC<ParentEvaluationVisibilityPreviewControlsProps> = ({
  settings,
  onChange,
}) => {
  const renderDirection = (
    direction: keyof ParentEvaluationVisibilitySettings,
    label: string,
  ) => (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-[12px] font-semibold text-slate-700">{label}</legend>
      <div className="grid grid-cols-3 rounded-lg bg-slate-100 p-1" role="group" aria-label={`${label}展示方案`}>
        {OPTIONS.map(option => {
          const selected = settings[direction] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...settings, [direction]: option.value })}
              aria-pressed={selected}
              className={`min-h-9 min-w-0 rounded-md px-1 text-[11px] font-semibold leading-tight transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${selected ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <section
      className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]"
      aria-label="家长端评价展示预览配置"
    >
      <h2 className="mb-3 text-[13px] font-bold text-slate-900">家长端评价展示</h2>
      <div className="space-y-3">
        {renderDirection('positive', '表扬')}
        {renderDirection('negative', '待改进')}
      </div>
    </section>
  );
};

export default ParentEvaluationVisibilityPreviewControls;
