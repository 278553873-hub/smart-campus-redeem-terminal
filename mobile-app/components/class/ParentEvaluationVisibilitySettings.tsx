import React from 'react';
import { Shield } from 'lucide-react';
import type {
  ParentEvaluationVisibility,
  ParentEvaluationVisibilitySettings as VisibilitySettings,
} from '../../types';
import { getParentEvaluationVisibilitySettings } from '../../domain/parentEvaluationVisibility';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';

interface ParentEvaluationVisibilitySettingsProps {
  settings?: Partial<VisibilitySettings>;
  onChange?: (settings: VisibilitySettings) => void;
  readOnly?: boolean;
  readOnlyNotice?: string;
  showPreview?: boolean;
}

export interface ParentEvaluationVisibilityPreviewProps {
  settings?: Partial<VisibilitySettings>;
  className?: string;
}

const VISIBILITY_OPTIONS: Array<{ value: ParentEvaluationVisibility; label: string }> = [
  { value: 'hidden', label: '不展示' },
  { value: 'summary', label: '仅统计' },
  { value: 'summaryAndDetails', label: '统计和明细' },
];

const PREVIEW_RECORDS = [
  {
    direction: 'positive' as const,
    content: '你在课堂上主动分享自己创造性的解题思路，帮助其他同学成长。',
    time: '09-06 10:20',
    teacher: '张三老师',
    score: '+3分',
  },
  {
    direction: 'negative' as const,
    content: '你在课间追逐打闹，经提醒后及时改正。',
    time: '09-05 15:40',
    teacher: '李敏老师',
    score: '-1分',
  },
];

export const ParentEvaluationVisibilityPreview: React.FC<ParentEvaluationVisibilityPreviewProps> = ({
  settings,
  className = '',
}) => {
  const visibility = getParentEvaluationVisibilitySettings(settings);
  const showPositiveSummary = visibility.positive !== 'hidden';
  const showNegativeSummary = visibility.negative !== 'hidden';
  const showPositiveDetails = visibility.positive === 'summaryAndDetails';
  const showNegativeDetails = visibility.negative === 'summaryAndDetails';
  const summaryGridClass = showPositiveSummary && showNegativeSummary
    ? 'grid-cols-3'
    : showPositiveSummary || showNegativeSummary
      ? 'grid-cols-2'
      : 'grid-cols-1';
  const visiblePreviewRecords = PREVIEW_RECORDS.filter(record => (
    record.direction === 'positive' ? showPositiveDetails : showNegativeDetails
  ));

  return (
    <section
      aria-labelledby="parent-visibility-preview-title"
      aria-live="polite"
      className={className}
    >
      <h3 id="parent-visibility-preview-title" className="mb-[var(--tm-space-3)] text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">家长将看到</h3>
      <section className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]" aria-label="评价统计预览">
        <div className={`grid ${summaryGridClass} gap-[var(--tm-space-2)]`}>
          <div className="rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-data-default-soft)] px-[var(--tm-space-2)] py-[var(--tm-space-3)] text-center">
            <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-chart-data-default-text)]">总分</div>
            <div className="mt-[var(--tm-space-1)] tabular-nums text-[length:var(--tm-font-size-metric)] font-bold leading-none text-[var(--tm-chart-data-default-text)]">2<span className="ml-0.5 text-[length:var(--tm-font-size-meta)]">分</span></div>
          </div>
          {showPositiveSummary && (
            <div className="highlight-preview-backdrop rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-positive-soft)] px-[var(--tm-space-2)] py-[var(--tm-space-3)] text-center motion-reduce:animate-none">
              <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-chart-positive-text)]">表扬</div>
              <div className="mt-[var(--tm-space-1)] tabular-nums text-[length:var(--tm-font-size-metric)] font-bold leading-none text-[var(--tm-chart-positive-text)]">1<span className="ml-0.5 text-[length:var(--tm-font-size-meta)]">次</span></div>
            </div>
          )}
          {showNegativeSummary && (
            <div className="highlight-preview-backdrop rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-negative-soft)] px-[var(--tm-space-2)] py-[var(--tm-space-3)] text-center motion-reduce:animate-none">
              <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-chart-negative-text)]">待改进</div>
              <div className="mt-[var(--tm-space-1)] tabular-nums text-[length:var(--tm-font-size-metric)] font-bold leading-none text-[var(--tm-chart-negative-text)]">1<span className="ml-0.5 text-[length:var(--tm-font-size-meta)]">次</span></div>
            </div>
          )}
        </div>
      </section>

      {visiblePreviewRecords.length > 0 && (
        <section className="mt-[var(--tm-space-2)]" aria-label="评价明细预览">
          <div className="space-y-[var(--tm-space-2)]">
            {visiblePreviewRecords.map(record => {
              const positive = record.direction === 'positive';
              return (
                <article key={record.direction} className="highlight-preview-backdrop rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)] motion-reduce:animate-none">
                  <div className="flex items-start justify-between gap-[var(--tm-space-3)]">
                    <div className="min-w-0">
                      <p className="text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-primary)]">{record.content}</p>
                      <div className="mt-[var(--tm-space-2)] flex flex-wrap items-center gap-x-[var(--tm-space-2)] gap-y-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">
                        <span>{record.time}</span>
                        <span aria-hidden="true">·</span>
                        <span>{record.teacher}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 tabular-nums text-[length:var(--tm-font-size-card-title)] font-bold ${positive ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'}`}>{record.score}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
};

const ParentEvaluationVisibilitySettings: React.FC<ParentEvaluationVisibilitySettingsProps> = ({
  settings,
  onChange,
  readOnly = false,
  readOnlyNotice,
  showPreview = true,
}) => {
  const visibility = getParentEvaluationVisibilitySettings(settings);

  const updateVisibility = (
    direction: keyof VisibilitySettings,
    value: ParentEvaluationVisibility,
  ) => {
    if (readOnly) return;
    if (visibility[direction] === value) return;
    onChange?.({ ...visibility, [direction]: value });
  };

  return (
    <div>
      {readOnly && (
        <div
          role="status"
          className="mb-[var(--tm-space-4)] flex items-start gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]"
        >
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" aria-hidden="true" />
          <div className="leading-snug">
            {readOnlyNotice || '学校已开启全校统一管控，当前展示规则由学校统一设置，班主任仅可查看效果。'}
          </div>
        </div>
      )}

      <div className="space-y-[var(--tm-space-4)]">
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
            <span className="inline-flex items-center gap-[var(--tm-space-2)]">
              <span className="h-2 w-2 rounded-full bg-[var(--tm-chart-positive)]" aria-hidden="true" />
              表扬
            </span>
          </legend>
          <CompactSegmentedControl
            value={visibility.positive}
            items={VISIBILITY_OPTIONS}
            onChange={value => updateVisibility('positive', value)}
            ariaLabel="表扬家长端展示范围"
            fullWidth
            semantics="group"
            motion="sliding"
            disabled={readOnly}
          />
        </fieldset>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
            <span className="inline-flex items-center gap-[var(--tm-space-2)]">
              <span className="h-2 w-2 rounded-full bg-[var(--tm-chart-negative)]" aria-hidden="true" />
              待改进
            </span>
          </legend>
          <CompactSegmentedControl
            value={visibility.negative}
            items={VISIBILITY_OPTIONS}
            onChange={value => updateVisibility('negative', value)}
            ariaLabel="待改进家长端展示范围"
            fullWidth
            semantics="group"
            motion="sliding"
            disabled={readOnly}
          />
        </fieldset>
      </div>

      {showPreview && (
        <ParentEvaluationVisibilityPreview
          settings={visibility}
          className="-mx-[var(--tm-space-4)] -mb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] mt-[var(--tm-space-6)] border-y border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-4)]"
        />
      )}
    </div>
  );
};

export default ParentEvaluationVisibilitySettings;
