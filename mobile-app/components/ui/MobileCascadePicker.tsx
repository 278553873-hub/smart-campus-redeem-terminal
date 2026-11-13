import React, { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { mobileFilterCheckClass } from './mobileFilterStyles';

export interface MobileCascadeGroup {
  value: string;
  label: string;
  options: readonly { value: string; label: string }[];
}

interface BaseProps {
  groups: readonly MobileCascadeGroup[];
  allGroupsLabel?: string;
  allOptionsLabel?: string;
  allOptionsInGroupLabel?: string;
  showAllGroupsOption?: boolean;
  groupLabel?: string;
  optionLabel?: string;
}

interface SingleProps extends BaseProps {
  selectionMode?: 'single';
  value: { groupValue: string; optionValue: string };
  onChange: (value: { groupValue: string; optionValue: string }) => void;
}

interface MultipleProps extends BaseProps {
  selectionMode: 'multiple';
  initialGroupValue?: string;
  selectedValues: ReadonlySet<string>;
  onSelectionChange: (values: Set<string>) => void;
}

type Props = SingleProps | MultipleProps;

const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]';

/** 左栏只导航；单选回填，多选暂存，由浮层外壳负责完成与收起。 */
export default function MobileCascadePicker(props: Props) {
  const { groups, allGroupsLabel = '全部分类', allOptionsLabel = '全部选项', allOptionsInGroupLabel = allOptionsLabel, showAllGroupsOption = true, groupLabel = '分类', optionLabel = '选项' } = props;
  const value = props.selectionMode === 'multiple' ? { groupValue: props.initialGroupValue ?? '', optionValue: '' } : props.value;
  const [activeGroup, setActiveGroup] = useState(value.groupValue || (showAllGroupsOption ? '' : groups[0]?.value ?? ''));
  const group = groups.find(item => item.value === activeGroup) ?? (showAllGroupsOption ? undefined : groups[0]);
  const options = group?.options ?? [...new Map(groups.flatMap(item => item.options).map(item => [item.value, item])).values()];
  const select = (optionValue: string) => {
    const groupValue = optionValue ? groups.find(item => item.options.some(option => option.value === optionValue))?.value ?? '' : group?.value ?? '';
    if (props.selectionMode !== 'multiple') props.onChange({ groupValue, optionValue });
  };
  if (props.selectionMode === 'multiple') {
    const visibleOptions = group?.options ?? [];
    const scopeValues = (group ? group.options : options).map(item => item.value);
    const selectedCount = scopeValues.filter(item => props.selectedValues.has(item)).length;
    const allSelected = scopeValues.length > 0 && selectedCount === scopeValues.length;
    const toggle = (values: readonly string[]) => {
      const next = new Set(props.selectedValues);
      const selected = values.every(item => next.has(item));
      values.forEach(item => { if (selected) next.delete(item); else next.add(item); });
      props.onSelectionChange(next);
    };
    const option = (key: string, label: string, values: readonly string[], selected: boolean, mixed = false) => <button key={key} type="button" role="checkbox" aria-checked={mixed ? 'mixed' : selected} onClick={() => toggle(values)}
      className={`flex min-h-[48px] w-full items-center gap-3 px-2 text-left text-[length:var(--tm-font-size-body)] font-medium ${focusClass} ${selected ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-secondary)]'}`}>
      <span className="min-w-0 flex-1 break-words">{label}</span>
      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected || mixed ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}>
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : mixed ? <Minus className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>;
    return <div className="grid h-[var(--tm-cascade-content-height)] min-h-0 grid-cols-[110px_minmax(0,1fr)]">
      <div role="group" aria-label={`选择${groupLabel}`} className="min-h-0 overflow-y-auto overscroll-contain bg-[var(--tm-bg-surface-muted)] no-scrollbar">
        {[...(showAllGroupsOption ? [{ value: '', label: allGroupsLabel }] : []), ...groups].map(item => <button key={item.value} type="button" aria-pressed={(group?.value ?? '') === item.value} onClick={() => setActiveGroup(item.value)}
          className={`relative flex min-h-[48px] w-full items-center px-3 text-left text-[length:var(--tm-font-size-body)] font-medium ${focusClass} ${(group?.value ?? '') === item.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:bg-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}>
          <span className="min-w-0 break-words">{item.label}</span>
        </button>)}
      </div>
      <div role="group" aria-label={group ? `${group.label}下的${optionLabel}` : allOptionsLabel} className="min-h-0 overflow-y-auto overscroll-contain bg-[var(--tm-bg-surface)] px-4 no-scrollbar">
        {option('scope', group ? '全选' : allOptionsLabel, scopeValues, allSelected, selectedCount > 0 && !allSelected)}
        {visibleOptions.map(item => option(`option-${item.value}`, item.label, [item.value], props.selectedValues.has(item.value)))}
      </div>
    </div>;
  }
  return <div className="grid h-[var(--tm-cascade-content-height)] min-h-0 grid-cols-[var(--tm-cascade-navigation-width)_minmax(0,1fr)] text-[length:var(--tm-font-size-compact)] [font-weight:var(--tm-font-weight-semibold)]">
    <div role="group" aria-label={`选择${groupLabel}`} className="min-h-0 overflow-y-auto overscroll-contain bg-[var(--tm-bg-surface-muted)] no-scrollbar">
      {[...(showAllGroupsOption ? [{ value: '', label: allGroupsLabel }] : []), ...groups].map(item => <button key={item.value} type="button" aria-pressed={(group?.value ?? '') === item.value} onClick={() => setActiveGroup(item.value)}
        className={`relative flex min-h-[var(--tm-size-touch)] w-full items-center px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-left ${focusClass} ${(group?.value ?? '') === item.value ? 'text-[var(--tm-brand-primary)] before:absolute before:left-0 before:top-1/2 before:h-[var(--tm-space-5)] before:w-[calc(var(--tm-space-1)/2)] before:-translate-y-1/2 before:bg-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}>
        <span className="break-words">{item.label}</span>
      </button>)}
    </div>
    <div role="group" aria-label={group ? `${group.label}下的${optionLabel}` : allOptionsLabel} className="min-h-0 overflow-y-auto overscroll-contain px-[var(--tm-space-4)] no-scrollbar">
      {[{ value: '', label: group ? allOptionsInGroupLabel : allOptionsLabel }, ...options].map(item => {
        const selected = item.value === value.optionValue && (item.value !== '' || (group?.value ?? '') === value.groupValue);
        return <button key={item.value} type="button" aria-pressed={selected} data-dropdown-selected={selected || undefined} onClick={() => select(item.value)} className={`flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-[var(--tm-space-3)] border-b border-[var(--tm-filter-divider)] py-[var(--tm-space-2)] text-left last:border-b-0 ${selected ? 'text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-primary)]'} ${focusClass}`}>
          <span className="min-w-0 break-words">{item.label}</span>
          {selected && <Check aria-hidden="true" className={mobileFilterCheckClass} />}
        </button>;
      })}
    </div>
  </div>;
}
