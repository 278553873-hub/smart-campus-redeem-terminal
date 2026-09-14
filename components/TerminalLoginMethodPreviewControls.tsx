import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type StudentLoginPreviewMode = 'face-only' | 'password-only' | 'both';

interface TerminalLoginMethodPreviewControlsProps {
  value: StudentLoginPreviewMode;
  onChange: (value: StudentLoginPreviewMode) => void;
}

const OPTIONS: Array<{ value: StudentLoginPreviewMode; label: string }> = [
  { value: 'face-only', label: '仅人脸' },
  { value: 'password-only', label: '仅密码' },
  { value: 'both', label: '两种方式' },
];

const TerminalLoginMethodPreviewControls: React.FC<TerminalLoginMethodPreviewControlsProps> = ({
  value,
  onChange,
}) => {
  const [compactOpen, setCompactOpen] = useState(false);
  const currentLabel = OPTIONS.find(option => option.value === value)?.label ?? OPTIONS[1].label;

  const options = (
    <div className="grid grid-cols-3 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="货柜机登录方式预览">
      {OPTIONS.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              onChange(option.value);
              setCompactOpen(false);
            }}
            className={`min-h-9 min-w-0 whitespace-nowrap rounded-md px-1 text-[11px] font-semibold leading-tight transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${selected
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <section
        className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] max-[1050px]:hidden"
        aria-label="登录方式预览配置"
      >
        <h2 className="mb-3 text-[13px] font-bold text-slate-900">登录方式预览</h2>
        {options}
      </section>

      <div className="relative hidden max-[1050px]:block">
        <button
          type="button"
          aria-expanded={compactOpen}
          onClick={() => setCompactOpen(open => !open)}
          className="flex min-h-11 w-[126px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>{currentLabel}</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${compactOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {compactOpen && (
          <section
            className="absolute right-0 top-[52px] w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]"
            aria-label="登录方式预览配置"
          >
            <h2 className="mb-3 text-[13px] font-bold text-slate-900">登录方式预览</h2>
            {options}
          </section>
        )}
      </div>
    </>
  );
};

export default TerminalLoginMethodPreviewControls;
