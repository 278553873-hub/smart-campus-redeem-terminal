import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  getArchiveSelectedOptions,
  formatArchiveAnswer,
  isArchiveAnswerFilled,
  isArchiveChoiceAnswer,
  type ArchiveAnswer,
  type ArchiveField,
  type ArchiveGrowthFieldConfig,
  type ArchiveTemplateSnapshot,
} from '../../../shared/studentArchiveStore';
import { inputClass, readonlyFieldClass, sectionSurface } from './archivePagePrimitives';
import { normalizeFormFieldSettings } from '../../../shared/formDefinition';

interface ArchiveFormRendererBaseProps {
  definition: Pick<ArchiveTemplateSnapshot, 'layoutMode' | 'sections' | 'fields' | 'growthFields'>;
  renderGrowthField?: (field: ArchiveGrowthFieldConfig, number: number) => React.ReactNode;
  isGrowthFieldFilled?: (field: ArchiveGrowthFieldConfig) => boolean;
}

type ArchiveFormRendererProps = ArchiveFormRendererBaseProps & (
  | {
    mode: 'preview';
    answers?: never;
    onAnswersChange?: never;
  }
  | {
    mode?: 'fill';
    answers: Record<string, ArchiveAnswer>;
    onAnswersChange: (answers: Record<string, ArchiveAnswer>) => void;
  }
  | {
    mode: 'readonly';
    answers: Record<string, ArchiveAnswer>;
    onAnswersChange?: never;
  }
);

const ArchiveFormRenderer: React.FC<ArchiveFormRendererProps> = props => {
  const { definition } = props;
  const previewMode = props.mode === 'preview';
  const readonlyMode = props.mode === 'readonly';
  const answers = previewMode ? {} : props.answers;
  const updateAnswers = (nextAnswers: Record<string, ArchiveAnswer>) => {
    if (props.mode !== 'preview' && props.mode !== 'readonly') props.onAnswersChange(nextAnswers);
  };

  const renderFieldInput = (field: ArchiveField) => {
    const settings = normalizeFormFieldSettings(field.type, field.settings, field.options);
    if (previewMode) {
      if (field.type === 'text') {
        return <div className={`${readonlyFieldClass} min-h-[92px] py-3 text-[var(--tm-input-readonly-text)]`}>请输入</div>;
      }
      if (field.type === 'date' || field.type === 'number') {
        const placeholder = field.type === 'date'
          ? settings.dateFormat === 'year' ? '年份' : settings.dateFormat === 'ym' ? '年-月' : '年-月-日'
          : settings.numberFormat === 'decimal-1' ? '请输入数字（1位小数）' : settings.numberFormat === 'decimal-2' ? '请输入数字（2位小数）' : '请输入整数';
        return (
          <div className={`${readonlyFieldClass} flex h-12 items-center text-[var(--tm-input-readonly-text)]`}>
            {placeholder}
          </div>
        );
      }
      return (
        <div className="space-y-2">
          {field.options.map((option, optionIndex) => (
            <div key={`${field.id}-${optionIndex}`} className="flex min-h-12 items-center gap-2.5 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
              <span className={`h-5 w-5 shrink-0 border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] ${field.type === 'single-select' ? 'rounded-full' : 'rounded-[5px]'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1">{option}</span>
              {field.customAnswerOptions?.includes(option) && (
                <span className="shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] px-2 py-0.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-text-tertiary)]">可填写</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    const answer = answers[field.semanticKey];
    if (readonlyMode) {
      return (
        <div className={`${readonlyFieldClass} min-h-12 py-3 leading-6 ${isArchiveAnswerFilled(answer) ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-input-readonly-text)]'}`}>
          {isArchiveAnswerFilled(answer) ? formatArchiveAnswer(answer) : '未填写'}
        </div>
      );
    }
    const value = typeof answer === 'string' ? answer : '';
    if (field.type === 'text') {
      return <textarea value={value} onChange={event => updateAnswers({ ...answers, [field.semanticKey]: event.target.value })} rows={3} placeholder="请输入" className={`${inputClass} min-h-[92px] py-3`} />;
    }
    if (field.type === 'date') {
      return <input type={settings.dateFormat === 'year' ? 'number' : settings.dateFormat === 'ym' ? 'month' : 'date'} inputMode={settings.dateFormat === 'year' ? 'numeric' : undefined} min={settings.dateFormat === 'year' ? 1900 : undefined} max={settings.dateFormat === 'year' ? 2100 : undefined} value={value} onInput={event => updateAnswers({ ...answers, [field.semanticKey]: event.currentTarget.value })} className={`${inputClass} h-12`} />;
    }
    if (field.type === 'number') {
      return <input type="number" inputMode="decimal" step={settings.numberFormat === 'decimal-1' ? 0.1 : settings.numberFormat === 'decimal-2' ? 0.01 : 1} value={value} onChange={event => updateAnswers({ ...answers, [field.semanticKey]: event.target.value })} placeholder="请输入数字" className={`${inputClass} h-12`} />;
    }

    const selectedOptions = getArchiveSelectedOptions(answer);
    const customText = isArchiveChoiceAnswer(answer) ? answer.customText : {};
    const toggleOption = (option: string) => {
      const nextSelected = field.type === 'multiple-select'
        ? selectedOptions.includes(option)
          ? selectedOptions.filter(item => item !== option)
          : selectedOptions.length >= (settings.maxSelections ?? field.options.length)
            ? selectedOptions
            : [...selectedOptions, option]
        : [option];
      const nextCustomText = Object.fromEntries(
        Object.entries(customText).filter(([key]) => nextSelected.includes(key)),
      );
      updateAnswers({
        ...answers,
        [field.semanticKey]: { selectedOptions: nextSelected, customText: nextCustomText },
      });
    };
    const updateCustomText = (option: string, nextValue: string) => updateAnswers({
      ...answers,
      [field.semanticKey]: {
        selectedOptions,
        customText: { ...customText, [option]: nextValue },
      },
    });

    return (
      <div className="space-y-2">
        {field.options.map((option, optionIndex) => {
          const selected = selectedOptions.includes(option);
          const showCustomInput = selected && field.customAnswerOptions?.includes(option);
          const maxReached = field.type === 'multiple-select' && !selected && selectedOptions.length >= (settings.maxSelections ?? field.options.length);
          return (
            <div key={`${field.id}-${optionIndex}`} className={`overflow-hidden rounded-[var(--tm-radius-control)] border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}>
              <button type="button" role={field.type === 'single-select' ? 'radio' : 'checkbox'} aria-checked={selected} disabled={maxReached} onClick={() => toggleOption(option)} className={`flex min-h-12 w-full items-center gap-2.5 px-3 text-left text-[length:var(--tm-font-size-compact)] font-medium disabled:opacity-45 ${selected ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-secondary)]'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${field.type === 'single-select' ? 'rounded-full' : 'rounded-[5px]'} ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-transparent'}`} aria-hidden="true">
                  {field.type === 'single-select' ? <span className="h-2 w-2 rounded-full bg-current" /> : <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
              </button>
              {showCustomInput && (
                <div className="px-3 pb-3">
                  <input
                    value={customText[option] ?? ''}
                    onChange={event => updateCustomText(option, event.target.value)}
                    maxLength={120}
                    placeholder="请补充填写"
                    aria-label={`${option}补充内容`}
                    className={`${inputClass} h-11 bg-[var(--tm-bg-surface)]`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFieldHeading = (field: ArchiveField, number: number) => {
    return (
      <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">
        <span>{number}. {field.label}{field.required && <span className="ml-1 text-[var(--tm-status-negative-strong)]">*</span>}</span>
      </div>
    );
  };

  type ArchiveContentItem =
    | { kind: 'field'; order: number; sectionId?: string; field: ArchiveField }
    | { kind: 'growth'; order: number; sectionId?: string; field: ArchiveGrowthFieldConfig };

  const contentItems: ArchiveContentItem[] = [
    ...definition.fields.map((field, index) => ({
      kind: 'field' as const,
      order: field.order ?? definition.growthFields.length + index,
      sectionId: field.sectionId,
      field,
    })),
    ...(props.renderGrowthField ? definition.growthFields.map((field, index) => ({
      kind: 'growth' as const,
      order: field.order ?? index,
      sectionId: field.sectionId,
      field,
    })) : []),
  ].sort((left, right) => left.order - right.order);

  const renderContentItem = (item: ArchiveContentItem, number: number) => item.kind === 'growth'
    ? props.renderGrowthField?.(item.field, number)
    : (
      <div>
        {renderFieldHeading(item.field, number)}
        {renderFieldInput(item.field)}
      </div>
    );

  const grouped = definition.layoutMode === 'grouped';
  const orderedItems = grouped
    ? definition.sections.flatMap(section => contentItems.filter(item => item.sectionId === section.id))
    : contentItems;
  const itemNumber = new Map(orderedItems.map((item, index) => [item.kind === 'growth' ? `growth:${item.field.key}` : `field:${item.field.id}`, index + 1]));
  if (!grouped) {
    return (
      <section className={`${sectionSurface} space-y-5 p-4`}>
        {contentItems.map((item, index) => (
          <React.Fragment key={item.kind === 'growth' ? `growth:${item.field.key}` : `field:${item.field.id}`}>
            {renderContentItem(item, index + 1)}
          </React.Fragment>
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {definition.sections.map(section => {
        const items = contentItems.filter(item => item.sectionId === section.id);
        const completed = previewMode ? 0 : items.filter(item => item.kind === 'growth'
          ? props.isGrowthFieldFilled?.(item.field)
          : isArchiveAnswerFilled(answers[item.field.semanticKey])).length;
        return (
          <details key={section.id} className={`${sectionSurface} overflow-hidden`} open>
            <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-4">
              <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{section.label}</span>
              <span className={`text-[length:var(--tm-font-size-meta)] font-bold tabular-nums ${!previewMode && completed === items.length ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
                {previewMode ? `${items.length}项` : `${completed}/${items.length}`}
              </span>
              <ChevronDown className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
            </summary>
            <div className="space-y-5 border-t border-[var(--tm-border-subtle)] px-4 py-4">
              {items.map(item => {
                const key = item.kind === 'growth' ? `growth:${item.field.key}` : `field:${item.field.id}`;
                return <React.Fragment key={key}>{renderContentItem(item, itemNumber.get(key) ?? 1)}</React.Fragment>;
              })}
            </div>
          </details>
        );
      })}
    </section>
  );
};

export default ArchiveFormRenderer;
