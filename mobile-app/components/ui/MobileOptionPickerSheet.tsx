import React, { useEffect, useState } from 'react';
import MobileBottomSheet from './MobileBottomSheet';
import { mobileSheetActionClass } from './mobileSheetActionStyles';

export interface MobilePickerOption {
  value: string;
  label: React.ReactNode;
}

export interface MobilePickerOptionGroup {
  id: string;
  label?: React.ReactNode;
  options: ReadonlyArray<MobilePickerOption>;
}

interface MobileOptionPickerSheetBaseProps {
  open: boolean;
  title: string;
  options: ReadonlyArray<MobilePickerOption>;
  groups?: ReadonlyArray<MobilePickerOptionGroup>;
  exclusiveValue?: string;
  onClose: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  ariaLabel?: string;
}

interface MobileOptionPickerSheetSingleProps extends MobileOptionPickerSheetBaseProps {
  selectionMode?: 'single';
  value: string;
  onChange: (value: string) => void;
}

interface MobileOptionPickerSheetMultipleProps extends MobileOptionPickerSheetBaseProps {
  selectionMode: 'multiple';
  values: ReadonlyArray<string>;
  onSelectionChange?: (values: string[]) => void;
  onConfirm: (values: string[]) => void;
  confirmLabel?: string;
}

export type MobileOptionPickerSheetProps = MobileOptionPickerSheetSingleProps | MobileOptionPickerSheetMultipleProps;

const optionButtonClass = 'flex h-[var(--tm-choice-pill-touch-height)] w-full items-center justify-center rounded-[var(--tm-choice-pill-radius)] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';

const MobileOptionPickerSheet: React.FC<MobileOptionPickerSheetProps> = props => {
  const { open, title, options, groups, exclusiveValue, onClose, showClearButton = false, ariaLabel = title } = props;
  const multipleProps = props.selectionMode === 'multiple' ? props : null;
  const singleProps = props.selectionMode === 'multiple' ? null : props;
  const [draftValues, setDraftValues] = useState<Set<string>>(() => new Set(multipleProps?.values));

  useEffect(() => {
    if (open && multipleProps) setDraftValues(new Set(multipleProps.values));
  }, [multipleProps?.values, open]);

  const selectedValues = multipleProps ? draftValues : new Set([singleProps?.value ?? '']);
  const selectedCount = options.filter(option => selectedValues.has(option.value)).length;
  const optionGroups = groups ?? [{ id: 'options', options }];
  const hasFooter = Boolean(multipleProps || showClearButton);

  const handleSelect = (value: string) => {
    if (singleProps) {
      singleProps.onChange(value);
      onClose();
      return;
    }

    const next = new Set(draftValues);
    if (exclusiveValue !== undefined && value === exclusiveValue) {
      if (next.has(exclusiveValue)) next.delete(exclusiveValue);
      else {
        next.clear();
        next.add(exclusiveValue);
      }
    } else {
      if (exclusiveValue !== undefined) next.delete(exclusiveValue);
      if (next.has(value)) next.delete(value);
      else next.add(value);
    }
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
      flushContentBottom={hasFooter}
      footerSpacing="section"
      footerDivider={false}
      showHandle={false}
      footer={hasFooter ? (
        <div className="space-y-2">
          {multipleProps && (
            <button
              type="button"
              onClick={handleConfirm}
              className={`${mobileSheetActionClass} flex w-full items-center justify-center bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]`}
            >
              {multipleProps.confirmLabel ?? '完成'}
            </button>
          )}
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              disabled={selectedCount === 0}
              className={`${mobileSheetActionClass} flex w-full items-center justify-center font-medium text-[var(--tm-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:cursor-not-allowed disabled:text-[var(--tm-text-disabled)]`}
            >
              {props.clearLabel ?? '清空'}
            </button>
          )}
        </div>
      ) : undefined}
    >
      <div className="space-y-[var(--tm-space-1)] px-[var(--tm-space-4)] pt-[var(--tm-sheet-content-gap)]" role="group" aria-label={ariaLabel}>
        {optionGroups.map(group => (
          <section key={group.id} className="space-y-[var(--tm-space-2)]">
            {group.label && (
              <h3 className="px-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">{group.label}</h3>
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

export default MobileOptionPickerSheet;
