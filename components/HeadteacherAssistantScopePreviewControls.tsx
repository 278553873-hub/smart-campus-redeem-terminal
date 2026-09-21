import React from 'react';
import {
  HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS,
  type HeadteacherAssistantScopePreviewMode,
} from '../shared/headteacherAssistantScopePreview';

interface HeadteacherAssistantScopePreviewControlsProps {
  /** 当前档位；学校配置不可用时为空，此时滑块不选中任何一档 */
  value: HeadteacherAssistantScopePreviewMode | null;
  onChange: (value: HeadteacherAssistantScopePreviewMode) => void;
}

/** 教师手机端预览：现场对比班主任助理在三种评价能力组合下的板块差异，不影响线上权限。 */
const HeadteacherAssistantScopePreviewControls: React.FC<HeadteacherAssistantScopePreviewControlsProps> = ({
  value,
  onChange,
}) => (
  <div
    className="grid grid-cols-3 rounded-lg bg-slate-100 p-1"
    role="radiogroup"
    aria-label="班主任助理评价能力预览"
  >
    {HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS.map(option => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={option.fullLabel}
          title={option.fullLabel}
          onClick={() => onChange(option.value)}
          className={`min-h-9 min-w-0 whitespace-nowrap rounded-md px-1 text-[11px] font-semibold leading-tight transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${selected
            ? 'bg-white text-rose-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default HeadteacherAssistantScopePreviewControls;
