import React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import {
  getArchiveGrowthMissingPolicy,
  type ArchiveGrowthFieldConfig,
  type ArchiveGrowthFieldKey,
  type ArchiveGrowthModuleSnapshot,
} from '../../../shared/studentArchiveStore';
import { getGrowthFieldDefinition } from '../../../shared/studentGrowthFieldCatalog';
import { sectionSurface, StatusPill } from './archivePagePrimitives';

interface ArchiveGrowthDataRendererProps {
  values: ArchiveGrowthModuleSnapshot[];
  fieldConfigs: ArchiveGrowthFieldConfig[];
  allowSupplement?: boolean;
  onSupplement?: (key: ArchiveGrowthFieldKey) => void;
}

const ArchiveGrowthDataRenderer: React.FC<ArchiveGrowthDataRendererProps> = ({
  values,
  fieldConfigs,
  allowSupplement = false,
  onSupplement,
}) => {
  if (values.length === 0) return null;
  const configByKey = new Map(fieldConfigs.map(config => [config.key, config]));

  return (
    <section className="space-y-2.5">
      {values.map(value => (
        <article key={value.key} className={`${sectionSurface} overflow-hidden`}>
          <div className="flex min-h-[58px] items-center gap-3 px-4 py-2">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${value.status === 'available' ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]'}`}>
              <Activity className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-[var(--tm-text-primary)]">{value.label}</span>
              <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">
                {value.items.some(item => item.value) ? `已保存 ${value.items.filter(item => item.value).length} 项` : '待采集'}
              </span>
            </span>
          </div>
          {value.items.length > 0 && (
            <div className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] px-4">
              {value.items.map((item, index) => {
                const config = item.key ? configByKey.get(item.key) : undefined;
                const missingPolicy = config ? getArchiveGrowthMissingPolicy(config) : 'omit';
                const canSupplement = Boolean(
                  allowSupplement
                  && onSupplement
                  && item.key
                  && !item.value
                  && missingPolicy !== 'omit'
                  && getGrowthFieldDefinition(item.key as Parameters<typeof getGrowthFieldDefinition>[0]),
                );
                return (
                  <div key={`${item.label}-${index}`} className="flex min-h-[52px] items-start justify-between gap-4 py-2.5">
                    <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{item.label}</span>
                    <span className="min-w-0 text-right">
                      <span className="flex items-center justify-end gap-2">
                        {item.value ? (
                          <span className="text-[13px] font-semibold leading-5 text-[var(--tm-text-primary)]">{item.value}</span>
                        ) : canSupplement && item.key ? (
                          <button type="button" onClick={() => onSupplement(item.key!)} className="flex min-h-10 items-center gap-1 text-[13px] font-semibold">
                            <span className="text-[var(--tm-brand-primary)]">填写</span>
                            <ChevronRight className="h-4 w-4 text-[var(--tm-brand-primary)]" />
                          </button>
                        ) : (
                          <span className="text-[13px] font-medium text-[var(--tm-text-tertiary)]">未填写</span>
                        )}
                        {missingPolicy === 'required' && <StatusPill className="shrink-0 bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">必填</StatusPill>}
                      </span>
                      {item.value && item.recordedAt && <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">{item.recordedAt} · {item.sourceLabel}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      ))}
    </section>
  );
};

export default ArchiveGrowthDataRenderer;
