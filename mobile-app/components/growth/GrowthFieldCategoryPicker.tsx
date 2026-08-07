import React, { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import {
  getGrowthFieldGroups,
  type GrowthFieldDefinition,
  type GrowthFieldGroupKey,
} from '../../../shared/studentGrowthFieldCatalog';

interface GrowthFieldCategoryPickerProps {
  fields: GrowthFieldDefinition[];
  isSelected: (field: GrowthFieldDefinition) => boolean;
  onToggle: (field: GrowthFieldDefinition) => void;
  isDisabled?: (field: GrowthFieldDefinition) => boolean;
  getFieldHint?: (field: GrowthFieldDefinition) => string | undefined;
  renderFieldAccessory?: (field: GrowthFieldDefinition) => ReactNode;
  emptyText?: string;
}

const GrowthFieldCategoryPicker: React.FC<GrowthFieldCategoryPickerProps> = ({
  fields,
  isSelected,
  onToggle,
  isDisabled = () => false,
  getFieldHint,
  renderFieldAccessory,
  emptyText = '学校暂未启用成长数据',
}) => {
  const groups = useMemo(() => getGrowthFieldGroups(fields), [fields]);
  const [activeGroupKey, setActiveGroupKey] = useState<GrowthFieldGroupKey | ''>('');
  const pickerId = useId().replace(/:/g, '');
  const activeGroup = groups.find(group => group.key === activeGroupKey) ?? groups[0];

  useEffect(() => {
    if (groups.length === 0) {
      setActiveGroupKey('');
      return;
    }
    if (!groups.some(group => group.key === activeGroupKey)) setActiveGroupKey(groups[0].key);
  }, [activeGroupKey, groups]);

  if (!activeGroup) {
    return <div className="py-10 text-center text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]">{emptyText}</div>;
  }

  return (
    <div>
      <div className="flex touch-pan-x gap-1 overflow-x-auto border-b border-[var(--tm-border-subtle)] no-scrollbar" role="tablist" aria-label="成长数据分类">
        {groups.map(group => {
          const selectedCount = group.fields.filter(isSelected).length;
          const selected = group.key === activeGroup.key;
          return (
            <button
              key={group.key}
              id={`${pickerId}-${group.key}-tab`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${pickerId}-${group.key}-panel`}
              aria-label={`${group.label}，已选${selectedCount}项，共${group.fields.length}项`}
              onClick={() => setActiveGroupKey(group.key)}
              className={`relative flex min-h-[var(--tm-size-touch)] shrink-0 items-center gap-1.5 px-3 text-[length:var(--tm-font-size-compact)] font-semibold ${selected ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-secondary)]'}`}
            >
              <span>{group.label}</span>
              <span className={`text-[length:var(--tm-font-size-badge)] tabular-nums ${selectedCount > 0 ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
                {selectedCount > 0 ? `${selectedCount}/${group.fields.length}` : `${group.fields.length}项`}
              </span>
              {selected && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--tm-brand-primary)]" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div
        id={`${pickerId}-${activeGroup.key}-panel`}
        role="tabpanel"
        aria-labelledby={`${pickerId}-${activeGroup.key}-tab`}
        className="mt-3 max-h-[46vh] overflow-y-auto rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] no-scrollbar"
      >
        {activeGroup.fields.map(field => {
          const selected = isSelected(field);
          const disabled = isDisabled(field);
          const hint = getFieldHint?.(field);
          return (
            <div key={field.key} className="flex min-h-[56px] items-center gap-2 border-b border-[var(--tm-border-subtle)] px-3 last:border-b-0">
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => onToggle(field)}
                className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-70"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-transparent'}`}>
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{field.label}</span>
                  {hint && <span className="mt-0.5 block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{hint}</span>}
                </span>
              </button>
              {renderFieldAccessory?.(field)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthFieldCategoryPicker;
