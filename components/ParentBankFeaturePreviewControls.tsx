import React from 'react';

interface ParentBankFeaturePreviewControlsProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ParentBankFeaturePreviewControls: React.FC<ParentBankFeaturePreviewControlsProps> = ({
  enabled,
  onChange,
}) => (
  <section
    className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]"
    aria-label="积分银行功能开放预览配置"
  >
    <h2 className="mb-3 text-[13px] font-bold text-slate-900">积分银行功能开放</h2>
    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="积分银行功能开放状态">
      {[
        { value: true, label: '开放' },
        { value: false, label: '未开放' },
      ].map(option => {
        const selected = enabled === option.value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`min-h-9 rounded-md px-2 text-[12px] font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${selected ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </section>
);

export default ParentBankFeaturePreviewControls;
