import React, { useEffect, useState } from 'react';
import MobileBottomSheet from './MobileBottomSheet';

export interface MobileGradePickerOption {
  value: string;
  label: React.ReactNode;
  stage?: MobileGradeStage;
}

export type MobileGradeStage = '小学' | '初中' | '高中';

interface MobileGradePickerSheetBaseProps {
  open: boolean;
  title?: string;
  options: ReadonlyArray<MobileGradePickerOption>;
  onClose: () => void;
  showStageName?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  ariaLabel?: string;
}

interface MobileGradePickerSheetSingleProps extends MobileGradePickerSheetBaseProps {
  selectionMode?: 'single';
  value: string;
  onChange: (value: string) => void;
}

interface MobileGradePickerSheetMultipleProps extends MobileGradePickerSheetBaseProps {
  selectionMode: 'multiple';
  values: ReadonlyArray<string>;
  onSelectionChange?: (values: string[]) => void;
  onConfirm: (values: string[]) => void;
  confirmLabel?: string;
}

export type MobileGradePickerSheetProps =
  | MobileGradePickerSheetSingleProps
  | MobileGradePickerSheetMultipleProps;

const optionButtonClass = 'flex h-[var(--tm-choice-pill-touch-height)] w-full items-center justify-center rounded-[var(--tm-choice-pill-radius)] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';

const MobileGradePickerSheet: React.FC<MobileGradePickerSheetProps> = props => {
  const {
    open,
    title = '选择年级',
    options,
    onClose,
    showStageName = false,
    showClearButton = false,
    ariaLabel = title,
  } = props;
  const multipleProps = props.selectionMode === 'multiple' ? props : null;
  const singleProps = props.selectionMode === 'multiple' ? null : props;
  const [draftValues, setDraftValues] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && multipleProps) setDraftValues(new Set(multipleProps.values));
  }, [multipleProps?.values, open]);

  const selectedValues = multipleProps ? draftValues : new Set([singleProps?.value ?? '']);
  const selectedCount = options.filter(option => selectedValues.has(option.value)).length;

  const optionGroups = showStageName
    ? (['小学', '初中', '高中'] as MobileGradeStage[])
        .map(stage => ({ stage, options: options.filter(option => option.stage === stage) }))
        .filter(group => group.options.length > 0)
        .concat([{ stage: undefined, options: options.filter(option => !option.stage) }])
        .filter(group => group.options.length > 0)
    : [{ stage: undefined, options: [...options] }];

  const handleSelect = (value: string) => {
    if (singleProps) {
      singleProps.onChange(value);
      onClose();
      return;
    }

    const next = new Set(draftValues);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setDraftValues(next);
    multipleProps.onSelectionChange?.(Array.from(next));
  };

  const handleConfirm = () => {
    if (!multipleProps) return;
    multipleProps.onConfirm(options.map(option => option.value).filter(value => draftValues.has(value)));
    onClose();
  };

  const handleClear = () => {
    if (selectedCount === 0) return;
    if (multipleProps) setDraftValues(new Set());
    props.onClear?.();
    onClose();
  };

  return (
    <MobileBottomSheet
      open={open}
      title={title}
      onClose={onClose}
      size="content"
      contentInset="none"
      footerDivider={false}
      showHandle={false}
      footer={multipleProps || showClearButton ? (
        <div className="space-y-2">
          {multipleProps && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
            >
              {multipleProps.confirmLabel ?? '完成'}
            </button>
          )}
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              disabled={selectedCount === 0}
              className="flex h-11 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:cursor-not-allowed disabled:text-[var(--tm-text-disabled)]"
            >
              {props.clearLabel ?? '清空'}
            </button>
          )}
        </div>
      ) : undefined}
    >
      <div className="space-y-[var(--tm-space-1)] px-[var(--tm-space-4)] pb-[var(--tm-space-4)]" role="group" aria-label={ariaLabel}>
        {optionGroups.map(group => (
          <section key={group.stage ?? 'ungrouped'} className="space-y-[var(--tm-space-2)]">
            {showStageName && group.stage && (
              <h3 className="px-[var(--tm-space-1)] pt-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">{group.stage}</h3>
            )}
            <div className="grid grid-cols-3 gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-1)]">
              {group.options.map(option => {
                const selected = selectedValues.has(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSelect(option.value)}
                    className={optionButtonClass}
                  >
                    <span className={`flex h-[var(--tm-choice-pill-visible-height)] w-full min-w-0 items-center justify-center rounded-[var(--tm-choice-pill-radius)] border px-[var(--tm-space-3)] text-center text-[length:var(--tm-font-size-body)] transition-[background-color,border-color,color] [transition-duration:var(--tm-duration-fast)] ${selected
                      ? 'border-[var(--tm-choice-pill-selected-border)] bg-[var(--tm-choice-pill-selected-bg)] font-semibold text-[var(--tm-choice-pill-selected-text)]'
                      : 'border-[var(--tm-choice-pill-default-border)] bg-[var(--tm-choice-pill-default-bg)] font-medium text-[var(--tm-choice-pill-default-text)]'}`}
                    >
                      <span className="min-w-0 truncate text-center">{option.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </MobileBottomSheet>
  );
};

export default MobileGradePickerSheet;
