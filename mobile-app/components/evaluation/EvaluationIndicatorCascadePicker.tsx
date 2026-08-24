import React from 'react';

interface EvaluationIndicatorCascadePickerProps {
  value: readonly [string, string, string];
  options: readonly [readonly string[], readonly string[], readonly string[]];
  onChange: (depth: number, value: string) => void;
}

const columnLabels = ['一级', '二级', '三级'] as const;

const EvaluationIndicatorCascadePicker: React.FC<EvaluationIndicatorCascadePickerProps> = ({
  value,
  options,
  onChange,
}) => (
  <div
    className="grid h-[264px] min-h-0 grid-cols-3 overflow-hidden rounded-[var(--tm-radius-control)] border border-[var(--tm-evaluation-indicator-editor-border)] bg-[var(--tm-bg-surface)]"
    aria-label="三级指标横向级联选择"
  >
    {columnLabels.map((label, depth) => (
      <div
        key={label}
        className={`flex min-h-0 min-w-0 flex-col ${depth < columnLabels.length - 1 ? 'border-r border-[var(--tm-evaluation-indicator-editor-border)]' : ''}`}
      >
        <div className="flex h-9 shrink-0 items-center justify-center bg-[var(--tm-evaluation-indicator-editor-header-bg)] text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">
          {label}
        </div>
        <div
          role="listbox"
          aria-label={`选择${label}指标`}
          className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-1.5 no-scrollbar"
        >
          {options[depth].length > 0 ? options[depth].map(option => {
            const selected = value[depth] === option;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onChange(depth, option)}
                className={`flex min-h-11 w-full items-center justify-center rounded-[var(--tm-radius-inner)] px-1.5 py-1 text-center text-[length:var(--tm-font-size-compact)] font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-evaluation-indicator-editor-focus-ring)] ${selected
                  ? 'bg-[var(--tm-evaluation-indicator-editor-selected-bg)] text-[var(--tm-evaluation-indicator-editor-selected-text)]'
                  : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-evaluation-indicator-editor-active-bg)]'
                }`}
              >
                <span className="line-clamp-2 break-words">{option}</span>
              </button>
            );
          }) : (
            <div className="flex min-h-11 items-center justify-center text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-disabled)]" aria-hidden="true">—</div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default EvaluationIndicatorCascadePicker;
