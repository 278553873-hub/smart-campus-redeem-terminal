import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';

export interface EvaluationIndicatorOption {
  label: string;
  count: number;
  children: EvaluationIndicatorOption[];
}

interface EvaluationIndicatorFilterSheetProps {
  open: boolean;
  value: string[];
  options: EvaluationIndicatorOption[];
  totalCount: number;
  onClose: () => void;
  onSelect: (path: string[]) => void;
}

const levelLabels = ['一级指标', '二级指标', '三级指标'];

const getLevelOptions = (options: EvaluationIndicatorOption[], path: string[], depth: number) => {
  if (depth === 0) return options;
  const firstLevel = options.find(option => option.label === path[0]);
  if (depth === 1) return firstLevel?.children ?? [];
  return firstLevel?.children.find(option => option.label === path[1])?.children ?? [];
};

const EvaluationIndicatorFilterSheet: React.FC<EvaluationIndicatorFilterSheetProps> = ({
  open,
  value,
  options,
  totalCount,
  onClose,
  onSelect,
}) => {
  const [draftPath, setDraftPath] = useState<string[]>(value);
  const [activeDepth, setActiveDepth] = useState(0);

  useEffect(() => {
    if (!open) return;
    setDraftPath(value);
    setActiveDepth(Math.min(value.length, 2));
  }, [open, value]);

  const visibleOptions = useMemo(
    () => getLevelOptions(options, draftPath, activeDepth),
    [activeDepth, draftPath, options],
  );

  const chooseOption = (option: EvaluationIndicatorOption) => {
    const nextPath = [...draftPath.slice(0, activeDepth), option.label];
    setDraftPath(nextPath);
    if (option.children.length > 0 && activeDepth < 2) setActiveDepth(activeDepth + 1);
  };

  const applyPath = (path: string[]) => {
    onSelect(path);
    onClose();
  };

  const selectedLabel = draftPath[draftPath.length - 1];

  return (
    <MobileBottomSheet
      open={open}
      title="选择指标"
      onClose={onClose}
      footer={draftPath.length > 0 && (
        <button
          type="button"
          onClick={() => applyPath(draftPath)}
          className="mb-3 min-h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[14px] font-semibold text-[var(--tm-text-inverse)] active:scale-[0.98]"
        >
          按“{selectedLabel}”筛选
        </button>
      )}
    >
      <div className="pb-2">
        <button
          type="button"
          onClick={() => applyPath([])}
          className={`flex min-h-[var(--tm-size-touch)] w-full items-center justify-between rounded-[var(--tm-radius-control)] px-3 text-left transition-colors ${value.length === 0
            ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
            : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
        >
          <span className="text-[13px] font-medium">全部指标</span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-[12px] text-[var(--tm-text-tertiary)]">{totalCount}条</span>
            {value.length === 0 && <Check className="h-4 w-4" />}
          </span>
        </button>

        <div className="mt-3 flex min-h-8 items-center gap-1 overflow-hidden px-1 text-[12px] text-[var(--tm-text-tertiary)]">
          {activeDepth === 0 ? (
            <span className="font-medium">一级指标</span>
          ) : (
            <>
              <button type="button" onClick={() => setActiveDepth(0)} className="shrink-0 font-medium text-[var(--tm-brand-primary-strong)]">一级指标</button>
              {draftPath.slice(0, activeDepth).map((label, index) => (
                <React.Fragment key={`${index}-${label}`}>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  <button
                    type="button"
                    onClick={() => setActiveDepth(index + 1)}
                    className="min-w-0 truncate font-medium text-[var(--tm-brand-primary-strong)]"
                  >
                    {label}
                  </button>
                </React.Fragment>
              ))}
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">{levelLabels[activeDepth]}</span>
            </>
          )}
        </div>

        <div className="mt-1 space-y-1">
          {visibleOptions.map(option => {
            const selected = draftPath[activeDepth] === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => chooseOption(option)}
                aria-label={`选择${levelLabels[activeDepth]}${option.label}，${option.count}条评价`}
                className={`flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-3 rounded-[var(--tm-radius-control)] px-3 text-left transition-colors ${selected
                  ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
                  : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
              >
                <span className="min-w-0 truncate text-[13px] font-medium">{option.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] text-[var(--tm-text-tertiary)]">{option.count}条</span>
                  {option.children.length > 0 ? <ChevronRight className="h-4 w-4" /> : selected ? <Check className="h-4 w-4" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </MobileBottomSheet>
  );
};

export default EvaluationIndicatorFilterSheet;
