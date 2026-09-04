import React, { useMemo } from 'react';
import { Check, Minus } from 'lucide-react';
import type { ClassInfo } from '../../types';
import { phoneText } from '../../styles/teacherMobileTokens';

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
  ariaLabel?: string;
}

interface MobileClassCascadeMultipleProps extends MobileClassCascadePickerBaseProps {
  selectionMode?: 'multiple';
  selectedClassIds: ReadonlySet<string>;
  onToggleClass: (classId: string) => void;
  onToggleGrade?: (classIds: string[]) => void;
}

interface MobileClassCascadeSingleProps extends MobileClassCascadePickerBaseProps {
  selectionMode: 'single';
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  allClassesLabel?: string;
}

type MobileClassCascadePickerProps = MobileClassCascadeMultipleProps | MobileClassCascadeSingleProps;

const classSelectionOptionClass = (selected: boolean) => selected
  ? 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)]'
  : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]';

const MobileClassCascadePicker: React.FC<MobileClassCascadePickerProps> = props => {
  const {
    groups,
    activeGrade,
    onActiveGradeChange,
    getClassMeta,
    getClassLabel = classInfo => classInfo.name,
    ariaLabel = '班级级联选择',
  } = props;
  const singleSelection = props.selectionMode === 'single';
  const selectedClassIds = singleSelection
    ? new Set(props.selectedClassId === 'all' ? [] : [props.selectedClassId])
    : props.selectedClassIds;
  const activeGroup = useMemo(
    () => groups.find(group => group.gradeLabel === activeGrade) ?? groups[0],
    [activeGrade, groups],
  );
  const activeClasses = activeGroup?.classes ?? [];
  const activeSelectedCount = activeClasses.filter(classInfo => selectedClassIds.has(classInfo.id)).length;
  const allActiveClassesSelected = activeClasses.length > 0 && activeSelectedCount === activeClasses.length;
  const hasActiveClassSelected = activeSelectedCount > 0;

  return (
    <div className="grid h-full min-h-0 grid-cols-[92px_1fr]" aria-label={ariaLabel}>
      <div className="min-h-0 overflow-y-auto overscroll-contain border-r border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-2 no-scrollbar" aria-label="左侧先选年级">
        {groups.map(group => {
          const selectedCount = group.classes.filter(classInfo => selectedClassIds.has(classInfo.id)).length;
          const active = activeGroup?.gradeLabel === group.gradeLabel;
          return (
            <button
              key={group.gradeLabel}
              type="button"
              onClick={() => onActiveGradeChange(group.gradeLabel)}
              aria-pressed={active}
              className={`mb-2 flex min-h-11 w-full flex-col items-center justify-center rounded-[var(--tm-radius-control)] text-xs font-extrabold transition-all last:mb-0 active:scale-95 ${active ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-icon)]' : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-brand-primary-soft)] active:text-[var(--tm-brand-primary-pressed)]'}`}
            >
              <span>{group.displayLabel ?? group.gradeLabel}</span>
              {!singleSelection && selectedCount > 0 && (
                <span className={`mt-0.5 text-[length:var(--tm-font-size-badge)] ${active ? 'text-[var(--tm-text-inverse)]/80' : 'text-[var(--tm-brand-primary-pressed)]'}`}>
                  {selectedCount}个
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 min-w-0 flex-col p-3" aria-label="右侧再选该年级下的班级">
        {!singleSelection && (
          <div className="mb-3 min-w-0 shrink-0">
            <div className="flex min-h-11 items-center justify-between gap-2">
              <h3 className={`${phoneText.sectionTitle} min-w-0 truncate text-[var(--tm-text-primary)]`}>{activeGroup?.displayLabel ?? activeGroup?.gradeLabel ?? '选择年级'}</h3>
              {props.onToggleGrade && activeGroup && (
              <button
                type="button"
                role="checkbox"
                aria-checked={allActiveClassesSelected ? true : hasActiveClassSelected ? 'mixed' : false}
                onClick={() => props.onToggleGrade?.(activeClasses.map(classInfo => classInfo.id))}
                className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-[6px] border ${allActiveClassesSelected || hasActiveClassSelected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`} aria-hidden="true">
                  {allActiveClassesSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : hasActiveClassSelected ? <Minus className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                全选本年级
              </button>
              )}
            </div>
            <p className="text-[length:var(--tm-font-size-badge)] text-[var(--tm-text-tertiary)]">已选 {activeSelectedCount} / {activeClasses.length} 个班</p>
          </div>
        )}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 no-scrollbar">
          {singleSelection && (
            <button
              type="button"
              onClick={() => props.onSelectClass('all')}
              aria-pressed={props.selectedClassId === 'all'}
              className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] border px-3 text-left text-[length:var(--tm-font-size-compact)] font-bold transition-all active:scale-[0.99] ${classSelectionOptionClass(props.selectedClassId === 'all')}`}
            >
              <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${props.selectedClassId === 'all' ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] text-transparent'}`}>
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1 truncate">{props.allClassesLabel ?? '全部班级'}</span>
            </button>
          )}
          {activeClasses.map(classInfo => {
            const selected = selectedClassIds.has(classInfo.id);
            const meta = getClassMeta?.(classInfo);
            const classLabel = getClassLabel(classInfo);
            return (
              <button
                key={classInfo.id}
                type="button"
                onClick={() => singleSelection ? props.onSelectClass(classInfo.id) : props.onToggleClass(classInfo.id)}
                aria-pressed={selected}
                aria-label={`${selected && !singleSelection ? '取消选择' : '选择'}${classLabel}`}
                className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] border px-3 text-left text-[length:var(--tm-font-size-compact)] font-bold transition-all active:scale-[0.99] ${classSelectionOptionClass(selected)}`}
              >
                <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] text-transparent'}`}>
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
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
