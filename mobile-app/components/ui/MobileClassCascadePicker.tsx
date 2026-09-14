import React, { useMemo } from 'react';
import { Check, Minus } from 'lucide-react';
import { inferEducationStage } from '../../domain/classInfo';
import type { ClassInfo } from '../../types';

export interface MobileClassCascadeGroup {
  gradeLabel: string;
  displayLabel?: string;
  classes: ClassInfo[];
}

interface MobileClassCascadePickerBaseProps {
  groups: MobileClassCascadeGroup[];
  activeGrade: string;
  onActiveGradeChange: (grade: string) => void;
  getClassMeta?: (classInfo: ClassInfo) => React.ReactNode;
  getClassLabel?: (classInfo: ClassInfo) => string;
  showEducationStagePrefix?: boolean;
  ariaLabel?: string;
  hideGradeRailWhenSingleGroup?: boolean;
}

interface MobileClassCascadeMultipleProps extends MobileClassCascadePickerBaseProps {
  selectionMode?: 'multiple';
  selectedClassIds: ReadonlySet<string>;
  onToggleClass: (classId: string) => void;
  onToggleGrade?: (classIds: string[]) => void;
  showAllClassesOption?: boolean;
  allClassesLabel?: string;
  allClassesSelected?: boolean;
  allClassesMixed?: boolean;
  onToggleAllClasses?: () => void;
}

interface MobileClassCascadeSingleProps extends MobileClassCascadePickerBaseProps {
  selectionMode: 'single';
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
}

export type MobileClassCascadePickerProps = MobileClassCascadeMultipleProps | MobileClassCascadeSingleProps;

const optionFocusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]';
const educationStagePrefix: Record<ReturnType<typeof inferEducationStage>, string> = {
  primary: '小',
  middle: '初',
  high: '高',
};
const classSelectionOptionClass = (selected: boolean) => selected
  ? 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] font-semibold text-[var(--tm-brand-primary)]'
  : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] font-medium text-[var(--tm-text-primary)]';

const MobileClassCascadePicker: React.FC<MobileClassCascadePickerProps> = props => {
  const {
    groups,
    activeGrade,
    onActiveGradeChange,
    getClassMeta,
    getClassLabel = classInfo => classInfo.name,
    showEducationStagePrefix = false,
    ariaLabel = '班级级联选择',
    hideGradeRailWhenSingleGroup = true,
  } = props;
  const singleSelection = props.selectionMode === 'single';
  const multipleProps = props.selectionMode === 'single' ? null : props;
  const selectedClassIds = singleSelection
    ? new Set([props.selectedClassId])
    : props.selectedClassIds;
  const activeGroup = useMemo(
    () => groups.find(group => group.gradeLabel === activeGrade) ?? groups[0],
    [activeGrade, groups],
  );
  const activeClasses = activeGroup?.classes ?? [];
  const activeSelectedCount = activeClasses.filter(classInfo => selectedClassIds.has(classInfo.id)).length;
  const allActiveClassesSelected = activeClasses.length > 0 && activeSelectedCount === activeClasses.length;
  const hasActiveClassSelected = activeSelectedCount > 0;
  const showGradeRail = groups.length > 1 || !hideGradeRailWhenSingleGroup;
  const getDisplayClassLabel = (classInfo: ClassInfo) => {
    const label = getClassLabel(classInfo);
    if (!showEducationStagePrefix) return label;
    const prefix = educationStagePrefix[inferEducationStage(classInfo)];
    return label.startsWith(prefix) ? label : `${prefix}${label}`;
  };

  const renderSelectionMark = (selected: boolean, mixed = false) => singleSelection ? (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
        ? 'border-[var(--tm-brand-primary)]'
        : 'border-[var(--tm-border-subtle)]'}`}
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-[var(--tm-brand-primary)]" />}
    </span>
  ) : (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected || mixed
        ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]'
        : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}
    >
      {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : mixed ? <Minus className="h-3 w-3" strokeWidth={3} /> : null}
    </span>
  );

  return (
    <div className={`grid h-full min-h-0 ${showGradeRail ? 'grid-cols-[92px_1fr]' : 'grid-cols-1'}`} aria-label={ariaLabel}>
      {showGradeRail && (
        <div className="min-h-0 overflow-y-auto overscroll-contain border-r border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] py-1 no-scrollbar" aria-label="左侧先选年级">
          {groups.map(group => {
            const active = activeGroup?.gradeLabel === group.gradeLabel;
            return (
              <button
                key={group.gradeLabel}
                type="button"
                onClick={() => onActiveGradeChange(group.gradeLabel)}
                aria-pressed={active}
                className={`relative mb-1 flex h-[var(--tm-choice-pill-touch-height)] w-full items-center justify-start rounded-none px-3 text-left text-[length:var(--tm-font-size-body)] font-medium ${optionFocusClass} ${active
                  ? 'font-semibold text-[var(--tm-brand-primary)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[var(--tm-brand-primary)]'
                  : 'text-[var(--tm-text-secondary)]'}`}
              >
                <span className="min-w-0 truncate">{group.displayLabel ?? group.gradeLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-col bg-[var(--tm-bg-surface)] px-4" aria-label="右侧再选该年级下的班级">
        {!singleSelection && (
          <div className="flex min-h-[60px] shrink-0 items-center justify-between gap-2 border-b border-[var(--tm-border-subtle)]">
            <div className="min-w-0">
              <h3 className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{activeGroup?.displayLabel ?? activeGroup?.gradeLabel ?? '选择年级'}</h3>
              <p className="mt-0.5 text-[length:var(--tm-font-size-badge)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">已选 {activeSelectedCount} / {activeClasses.length} 个班</p>
            </div>
            {props.onToggleGrade && activeGroup && (
              <button
                type="button"
                role="checkbox"
                aria-checked={allActiveClassesSelected ? true : hasActiveClassSelected ? 'mixed' : false}
                onClick={() => props.onToggleGrade?.(activeClasses.map(classInfo => classInfo.id))}
                className={`flex h-[var(--tm-choice-pill-touch-height)] shrink-0 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] ${optionFocusClass}`}
              >
                {renderSelectionMark(allActiveClassesSelected, hasActiveClassSelected && !allActiveClassesSelected)}
                全选本年级
              </button>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          {multipleProps?.showAllClassesOption && (
            <button
              type="button"
              role="checkbox"
              aria-checked={multipleProps.allClassesSelected ? true : multipleProps.allClassesMixed ? 'mixed' : false}
              onClick={multipleProps.onToggleAllClasses}
              className={`flex min-h-[52px] w-full items-center gap-3 border-b text-left text-[length:var(--tm-font-size-body)] ${optionFocusClass} ${classSelectionOptionClass(Boolean(multipleProps.allClassesSelected))}`}
            >
              {renderSelectionMark(Boolean(multipleProps.allClassesSelected), Boolean(multipleProps.allClassesMixed))}
              <span className="min-w-0 flex-1 truncate">{multipleProps.allClassesLabel ?? '全部班级'}</span>
            </button>
          )}

          {activeClasses.map(classInfo => {
            const selected = selectedClassIds.has(classInfo.id);
            const meta = getClassMeta?.(classInfo);
            const classLabel = getDisplayClassLabel(classInfo);
            return (
              <button
                key={classInfo.id}
                type="button"
                onClick={() => singleSelection ? props.onSelectClass(classInfo.id) : props.onToggleClass(classInfo.id)}
                aria-pressed={selected}
                aria-label={`${selected && !singleSelection ? '取消选择' : '选择'}${classLabel}`}
                className={`flex min-h-[52px] w-full items-center gap-3 border-b text-left text-[length:var(--tm-font-size-body)] last:border-b-0 ${optionFocusClass} ${classSelectionOptionClass(selected)}`}
              >
                {renderSelectionMark(selected)}
                <span className="min-w-0 flex-1 truncate">{classLabel}</span>
                {meta != null && <span className="shrink-0 text-[length:var(--tm-font-size-meta)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">{meta}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileClassCascadePicker;
