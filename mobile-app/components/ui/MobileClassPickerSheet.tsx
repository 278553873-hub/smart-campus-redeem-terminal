import React, { useEffect, useMemo, useState } from 'react';
import type { ClassInfo } from '../../types';
import MobileBottomSheet from './MobileBottomSheet';
import MobileClassCascadePicker, { type MobileClassCascadeGroup } from './MobileClassCascadePicker';

export interface MobileClassSubjectOption {
  value: string;
  label: string;
}

export interface MobileClassPickerSingleValue {
  gradeValue: string;
  classId: string;
}

interface MobileClassPickerSheetBaseProps {
  open: boolean;
  groups: MobileClassCascadeGroup[];
  onClose: () => void;
  title?: string;
  getClassLabel?: (classInfo: ClassInfo) => string;
  getClassMeta?: (classInfo: ClassInfo) => React.ReactNode;
  showGradeSelectAll?: boolean;
  showClearButton?: boolean;
  clearLabel?: string;
  confirmLabel?: string;
  requireSelection?: boolean;
  subjectOptions?: ReadonlyArray<MobileClassSubjectOption>;
  subjectValue?: string;
  subjectLabel?: string;
  subjectRequired?: boolean;
  onSubjectSelectionChange?: (value: string) => void;
  onClear?: () => void;
  ariaLabel?: string;
}

interface MobileClassPickerSheetSingleProps extends MobileClassPickerSheetBaseProps {
  selectionMode?: 'single';
  value: MobileClassPickerSingleValue;
  commitMode?: 'immediate' | 'confirm';
  showAllClassesOption?: boolean;
  allClassesLabel?: string;
  onChange: (value: MobileClassPickerSingleValue, subjectValue?: string) => void;
}

interface MobileClassPickerSheetMultipleProps extends MobileClassPickerSheetBaseProps {
  selectionMode: 'multiple';
  values: ReadonlyArray<string>;
  onSelectionChange?: (values: string[]) => void;
  onConfirm: (values: string[], subjectValue?: string) => void;
}

export type MobileClassPickerSheetProps = MobileClassPickerSheetSingleProps | MobileClassPickerSheetMultipleProps;

const MobileClassPickerSheet: React.FC<MobileClassPickerSheetProps> = props => {
  const {
    open,
    groups,
    onClose,
    title = '选择班级',
    getClassLabel,
    getClassMeta,
    showGradeSelectAll = false,
    showClearButton = false,
    clearLabel = '清空已选',
    confirmLabel = '完成',
    requireSelection = false,
    subjectOptions = [],
    subjectValue = '',
    subjectLabel = '任教学科',
    subjectRequired = false,
    onSubjectSelectionChange,
    ariaLabel = '班级级联选择',
  } = props;
  const multipleProps = props.selectionMode === 'multiple' ? props : null;
  const singleProps = props.selectionMode === 'multiple' ? null : props;
  const initialValues = multipleProps?.values ?? (singleProps?.value.classId ? [singleProps.value.classId] : []);
  const initialSelectedGroup = groups.find(group => group.classes.some(classInfo => initialValues.includes(classInfo.id)));
  const [activeGrade, setActiveGrade] = useState(singleProps?.value.gradeValue ?? initialSelectedGroup?.gradeLabel ?? groups[0]?.gradeLabel ?? '');
  const [draftClassIds, setDraftClassIds] = useState<Set<string>>(new Set(initialValues));
  const [draftSingleClassId, setDraftSingleClassId] = useState(singleProps?.value.classId ?? '');
  const [draftSubjectValue, setDraftSubjectValue] = useState(subjectValue);

  useEffect(() => {
    if (!open) return;
    const nextValues = props.selectionMode === 'multiple' ? props.values : props.value.classId ? [props.value.classId] : [];
    setDraftClassIds(new Set(nextValues));
    setDraftSingleClassId(props.selectionMode === 'multiple' ? '' : props.value.classId);
    setDraftSubjectValue(subjectValue);
    const selectedGroup = groups.find(group => group.classes.some(classInfo => nextValues.includes(classInfo.id)));
    setActiveGrade(props.selectionMode === 'multiple' ? selectedGroup?.gradeLabel ?? groups[0]?.gradeLabel ?? '' : props.value.gradeValue ?? groups[0]?.gradeLabel ?? '');
  }, [groups, open, props.selectionMode, multipleProps?.values, singleProps?.value, subjectValue]);

  const orderedDraftValues = useMemo(() => {
    const optionOrder = groups.flatMap(group => group.classes.map(classInfo => classInfo.id));
    return optionOrder.filter(classId => draftClassIds.has(classId));
  }, [draftClassIds, groups]);
  const hasSubjectPicker = subjectOptions.length > 0;
  const requiresConfirm = Boolean(multipleProps || singleProps?.commitMode === 'confirm' || hasSubjectPicker);
  const selectedClassCount = multipleProps ? draftClassIds.size : draftSingleClassId ? 1 : 0;
  const confirmDisabled = (requireSelection && selectedClassCount === 0)
    || (subjectRequired && hasSubjectPicker && !draftSubjectValue);
  const clearDisabled = selectedClassCount === 0 && !draftSubjectValue;

  const updateMultipleSelection = (next: Set<string>) => {
    setDraftClassIds(next);
    const orderedValues = groups
      .flatMap(group => group.classes.map(classInfo => classInfo.id))
      .filter(classId => next.has(classId));
    multipleProps?.onSelectionChange?.(orderedValues);
  };

  const handleSingleSelect = (classId: string) => {
    setDraftSingleClassId(classId);
    setDraftClassIds(new Set([classId]));
    if (singleProps?.commitMode !== 'confirm' && !hasSubjectPicker) {
      singleProps?.onChange({ gradeValue: activeGrade, classId });
      onClose();
    }
  };

  const handleToggleClass = (classId: string) => {
    const next = new Set(draftClassIds);
    if (next.has(classId)) next.delete(classId);
    else next.add(classId);
    updateMultipleSelection(next);
  };

  const handleToggleGrade = (classIds: string[]) => {
    const next = new Set(draftClassIds);
    const allSelected = classIds.length > 0 && classIds.every(classId => next.has(classId));
    classIds.forEach(classId => allSelected ? next.delete(classId) : next.add(classId));
    updateMultipleSelection(next);
  };

  const handleSubjectChange = (value: string) => {
    setDraftSubjectValue(value);
    onSubjectSelectionChange?.(value);
  };

  const handleConfirm = () => {
    if (confirmDisabled) return;
    if (multipleProps) multipleProps.onConfirm(orderedDraftValues, draftSubjectValue || undefined);
    else if (singleProps) singleProps.onChange({ gradeValue: activeGrade, classId: draftSingleClassId }, draftSubjectValue || undefined);
    onClose();
  };

  const handleClear = () => {
    if (clearDisabled) return;
    setDraftClassIds(new Set());
    setDraftSingleClassId('');
    setDraftSubjectValue('');
    multipleProps?.onSelectionChange?.([]);
    onSubjectSelectionChange?.('');
    props.onClear?.();
    onClose();
  };

  return (
    <MobileBottomSheet
      open={open}
      title={title}
      onClose={onClose}
      contentInset="none"
      footerDivider={false}
      showHandle={false}
      footer={requiresConfirm || showClearButton ? (
        <div className="space-y-2">
          {requiresConfirm && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmDisabled}
              className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]"
            >
              {confirmLabel}
            </button>
          )}
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearDisabled}
              className="flex h-11 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:cursor-not-allowed disabled:text-[var(--tm-text-disabled)]"
            >
              {clearLabel}
            </button>
          )}
        </div>
      ) : undefined}
    >
      <div className="flex min-h-0 flex-col">
        <div className={`${hasSubjectPicker ? 'h-[280px]' : 'h-[min(420px,56dvh)]'} shrink-0 border-y border-[var(--tm-border-subtle)]`}>
          {multipleProps ? (
            <MobileClassCascadePicker
              groups={groups}
              activeGrade={activeGrade}
              onActiveGradeChange={setActiveGrade}
              selectedClassIds={draftClassIds}
              onToggleClass={handleToggleClass}
              onToggleGrade={showGradeSelectAll ? handleToggleGrade : undefined}
              getClassLabel={getClassLabel}
              getClassMeta={getClassMeta}
              ariaLabel={ariaLabel}
            />
          ) : (
            <MobileClassCascadePicker
              selectionMode="single"
              groups={groups}
              activeGrade={activeGrade}
              onActiveGradeChange={setActiveGrade}
              selectedClassId={draftSingleClassId}
              onSelectClass={handleSingleSelect}
              showAllClassesOption={singleProps?.showAllClassesOption}
              allClassesLabel={singleProps?.allClassesLabel}
              getClassLabel={getClassLabel}
              getClassMeta={getClassMeta}
              ariaLabel={ariaLabel}
            />
          )}
        </div>

        {hasSubjectPicker && (
          <section className="shrink-0 px-4 pb-1 pt-4" aria-labelledby="mobile-class-picker-subject-label">
            <div className="flex items-center justify-between gap-3">
              <h3 id="mobile-class-picker-subject-label" className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{subjectLabel}</h3>
              {subjectRequired && <span className="text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">必选</span>}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {subjectOptions.map(option => {
                const selected = draftSubjectValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSubjectChange(option.value)}
                    className={`flex h-[var(--tm-choice-pill-visible-height)] min-w-0 items-center justify-center rounded-[var(--tm-choice-pill-radius)] border px-[var(--tm-space-3)] text-center text-[length:var(--tm-font-size-body)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] ${selected
                      ? 'border-[var(--tm-choice-pill-selected-border)] bg-[var(--tm-choice-pill-selected-bg)] font-semibold text-[var(--tm-choice-pill-selected-text)]'
                      : 'border-[var(--tm-choice-pill-default-border)] bg-[var(--tm-choice-pill-default-bg)] font-medium text-[var(--tm-choice-pill-default-text)]'}`}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </MobileBottomSheet>
  );
};

export default MobileClassPickerSheet;
