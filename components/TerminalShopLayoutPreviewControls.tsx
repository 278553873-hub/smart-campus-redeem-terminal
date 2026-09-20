import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  TERMINAL_SHOP_LAYOUT_PRESETS,
  getTerminalShopLayoutPreset,
  getTerminalShopPerScreenCount,
  type TerminalShopLayoutPresetId,
} from '../shared/terminalShopLayout';

interface TerminalShopLayoutPreviewControlsProps {
  value: TerminalShopLayoutPresetId;
  onChange: (value: TerminalShopLayoutPresetId) => void;
}

/** 给领导汇报时现场切换货柜机一屏商品数，控件在机器画面之外，不影响终端界面本身 */
const TerminalShopLayoutPreviewControls: React.FC<TerminalShopLayoutPreviewControlsProps> = ({
  value,
  onChange,
}) => {
  const [compactOpen, setCompactOpen] = useState(false);
  const currentPreset = getTerminalShopLayoutPreset(value);

  const options = (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="商品展示方式预览">
      {TERMINAL_SHOP_LAYOUT_PRESETS.map(preset => {
        const selected = preset.id === value;
        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => {
              onChange(preset.id);
              setCompactOpen(false);
            }}
            className={`min-h-11 min-w-0 rounded-md px-1 py-1 text-center transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${selected
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="block whitespace-nowrap text-[12px] font-bold leading-tight">{preset.label}</span>
            <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium leading-tight opacity-80">
              一屏 {getTerminalShopPerScreenCount(preset)} 个
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <section
        className="w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] max-[1050px]:hidden"
        aria-label="商品展示方式预览配置"
      >
        <h2 className="mb-3 text-[13px] font-bold text-slate-900">商品展示方式</h2>
        {options}
      </section>

      <div className="relative hidden max-[1050px]:block">
        <button
          type="button"
          aria-expanded={compactOpen}
          onClick={() => setCompactOpen(open => !open)}
          className="flex min-h-11 w-[126px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>{currentPreset.label}</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${compactOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {compactOpen && (
          <section
            className="absolute right-0 top-[52px] w-[272px] rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]"
            aria-label="商品展示方式预览配置"
          >
            <h2 className="mb-3 text-[13px] font-bold text-slate-900">商品展示方式</h2>
            {options}
          </section>
        )}
      </div>
    </>
  );
};

export default TerminalShopLayoutPreviewControls;
