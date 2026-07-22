import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  GripVertical,
  Hash,
  ListChecks,
  MessageSquareText,
  Minus,
  MoreHorizontal,
  Plus,
  Settings2,
  Star,
  TextCursorInput,
  Trash2,
  X,
} from 'lucide-react';
import {
  createFormSectionId,
  type ConfigurableFormField,
  type FormLayoutMode,
  type FormSection,
} from '../../../shared/formDefinition';

type FieldIcon = React.ComponentType<{ className?: string }>;

export interface FormFieldTypeOption<TType extends string> {
  value: TType;
  label: string;
  icon?: FieldIcon;
  choice?: boolean;
  rating?: boolean;
  primary?: boolean;
}

interface FormBuilderValue<TType extends string> {
  layoutMode: FormLayoutMode;
  sections: FormSection[];
  fields: Array<ConfigurableFormField<TType>>;
}

interface FormBuilderProps<TType extends string> extends FormBuilderValue<TType> {
  onChange: (value: FormBuilderValue<TType>) => void;
  fieldTypes: Array<FormFieldTypeOption<TType>>;
  createField: (type: TType, sectionId?: string) => ConfigurableFormField<TType>;
  itemLabel: '题目' | '字段';
  readOnly?: boolean;
  allowCustomAnswer?: boolean;
  minRatingLevels?: number;
  maxRatingLevels?: number;
  fieldErrors?: Record<string, { label?: string; options?: string }>;
  listError?: string;
  validationAttempt?: number;
  focusInvalidField?: boolean;
}

const defaultIconMap: Record<string, FieldIcon> = {
  single: CircleDot,
  'single-select': CircleDot,
  multiple: ListChecks,
  'multiple-select': ListChecks,
  rating: Star,
  text: MessageSquareText,
  short_text: TextCursorInput,
  number: Hash,
  date: CalendarDays,
};

const inputClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)] outline-none transition placeholder:text-[var(--tm-text-tertiary)] focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]';

const AutoResizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ value, onChange, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = '44px';
    const nextHeight = Math.min(textarea.scrollHeight, 84);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 84 ? 'auto' : 'hidden';
  }, [value]);

  return <textarea ref={textareaRef} rows={1} value={value} onChange={onChange} {...props} />;
};

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({ label, className = '', children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] disabled:opacity-30 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const BottomSheet: React.FC<{ open: boolean; label: string; onDismiss: () => void; children: React.ReactNode }> = ({ open, label, onDismiss, children }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" onClick={onDismiss}>
      <section
        className="max-h-[88%] w-full overflow-y-auto rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[var(--tm-shadow-sheet)]"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--tm-border-subtle)]" />
        {children}
      </section>
    </div>
  );
};

const Toggle: React.FC<{ checked: boolean; label: string; onChange: () => void; disabled?: boolean }> = ({ checked, label, onChange, disabled }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={checked}
    disabled={disabled}
    onClick={onChange}
    className="flex h-11 w-14 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] disabled:opacity-50"
  >
    <span className={`flex h-7 w-12 rounded-full p-0.5 transition-colors ${checked ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-control)]'}`}>
      <span className={`h-6 w-6 rounded-full bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-control)] transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);

const SortableFieldCard: React.FC<{
  fieldId: string;
  fieldLabel: string;
  readOnly: boolean;
  itemLabel: '题目' | '字段';
  className: string;
  header: React.ReactNode;
  children?: React.ReactNode;
}> = ({ fieldId, fieldLabel, readOnly, itemLabel, className, header, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldId, disabled: readOnly });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={`${className} relative ${isDragging ? 'opacity-[0.85] shadow-[var(--tm-shadow-sheet)]' : ''}`}
    >
      <div className="flex min-w-0 items-stretch">
        {!readOnly && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`拖动排序${itemLabel}：${fieldLabel}`}
            title={`拖动排序${itemLabel}`}
            className="flex min-h-16 w-11 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--tm-text-tertiary)] transition-colors active:cursor-grabbing active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)]"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">{header}</div>
      </div>
      {children}
    </article>
  );
};

const FormBuilder = <TType extends string>({
  layoutMode,
  sections,
  fields,
  onChange,
  fieldTypes,
  createField,
  itemLabel,
  readOnly = false,
  allowCustomAnswer = false,
  minRatingLevels = 2,
  maxRatingLevels = 10,
  fieldErrors = {},
  listError = '',
  validationAttempt = 0,
  focusInvalidField = false,
}: FormBuilderProps<TType>) => {
  const [expandedFieldId, setExpandedFieldId] = useState('');
  const [typeSheetSectionId, setTypeSheetSectionId] = useState<string | null>(null);
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [activeFieldMenuId, setActiveFieldMenuId] = useState('');
  const [sectionDraft, setSectionDraft] = useState<FormSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'field' | 'section'; id: string; label: string } | null>(null);
  const pendingFocusId = useRef('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const typeMeta = useMemo(() => new Map(fieldTypes.map(item => [item.value, item])), [fieldTypes]);
  const visibleTypes = useMemo(() => {
    const hasSecondary = fieldTypes.some(item => item.primary === false);
    if (!hasSecondary) return fieldTypes;
    return showMoreTypes ? fieldTypes.filter(item => item.primary === false) : fieldTypes.filter(item => item.primary !== false);
  }, [fieldTypes, showMoreTypes]);
  const hasSecondaryTypes = fieldTypes.some(item => item.primary === false);

  useEffect(() => {
    if (!pendingFocusId.current || expandedFieldId !== pendingFocusId.current) return;
    const frame = window.requestAnimationFrame(() => {
      const input = document.getElementById(`form-field-${pendingFocusId.current}`);
      input?.focus({ preventScroll: true });
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pendingFocusId.current = '';
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expandedFieldId, fields.length]);

  useEffect(() => {
    if (!validationAttempt || !focusInvalidField) return;
    const invalidField = fields.find(field => fieldErrors[field.id]);
    if (!invalidField) return;
    const visibleInput = document.getElementById(`form-field-${invalidField.id}`);
    if (visibleInput) {
      visibleInput.focus({ preventScroll: true });
      visibleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    pendingFocusId.current = invalidField.id;
    setExpandedFieldId(invalidField.id);
  }, [validationAttempt, focusInvalidField]);

  const emit = (patch: Partial<FormBuilderValue<TType>>) => onChange({ layoutMode, sections, fields, ...patch });

  const toggleGrouping = () => {
    if (layoutMode === 'grouped') {
      const groupedFields = sections.flatMap(section => fields.filter(field => field.sectionId === section.id));
      const assignedIds = new Set(groupedFields.map(field => field.id));
      emit({ layoutMode: 'flat', fields: [...groupedFields, ...fields.filter(field => !assignedIds.has(field.id))] });
      return;
    }
    const fallbackId = sections[0]?.id;
    emit({
      layoutMode: 'grouped',
      fields: fields.map(field => field.sectionId && sections.some(section => section.id === field.sectionId)
        ? field
        : { ...field, sectionId: fallbackId }),
    });
  };

  const addField = (type: TType) => {
    const sectionId = layoutMode === 'grouped'
      ? typeSheetSectionId || sections[0]?.id
      : undefined;
    const field = createField(type, sectionId);
    emit({ fields: [...fields, field] });
    pendingFocusId.current = field.id;
    setExpandedFieldId(field.id);
    setTypeSheetSectionId(null);
    setShowMoreTypes(false);
  };

  const updateField = (id: string, patch: Partial<ConfigurableFormField<TType>>) => {
    emit({ fields: fields.map(field => field.id === id ? { ...field, ...patch } : field) });
  };

  const reorderFields = (event: DragEndEvent, peers: Array<ConfigurableFormField<TType>>) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sourceIndex = peers.findIndex(field => field.id === active.id);
    const targetIndex = peers.findIndex(field => field.id === over.id);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const reorderedPeers = arrayMove(peers, sourceIndex, targetIndex);
    const peerIds = new Set(peers.map(field => field.id));
    let nextPeerIndex = 0;
    emit({
      fields: fields.map(field => peerIds.has(field.id) ? reorderedPeers[nextPeerIndex++] : field),
    });
  };

  const moveFieldToSection = (fieldId: string, sectionId: string) => {
    const field = fields.find(item => item.id === fieldId);
    if (!field || field.sectionId === sectionId) return;
    const withoutField = fields.filter(item => item.id !== fieldId);
    const lastTargetIndex = withoutField.reduce((last, item, index) => item.sectionId === sectionId ? index : last, -1);
    const next = [...withoutField];
    next.splice(lastTargetIndex + 1, 0, { ...field, sectionId });
    emit({ fields: next });
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    const index = sections.findIndex(section => section.id === sectionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    emit({ sections: next });
  };

  const saveSection = () => {
    if (!sectionDraft?.label.trim()) return;
    const exists = sections.some(section => section.id === sectionDraft.id);
    const nextSection = { ...sectionDraft, label: sectionDraft.label.trim() };
    emit({
      sections: exists
        ? sections.map(section => section.id === sectionDraft.id ? nextSection : section)
        : [...sections, nextSection],
      fields: !exists && sections.length === 0
        ? fields.map(field => ({ ...field, sectionId: nextSection.id }))
        : fields,
    });
    setSectionDraft(null);
  };

  const addCustomOption = (field: ConfigurableFormField<TType>) => {
    let label = '其他（请填写）';
    let suffix = 2;
    while (field.options.includes(label)) {
      label = `其他${suffix}（请填写）`;
      suffix += 1;
    }
    updateField(field.id, {
      options: [...field.options, label],
      customAnswerOptions: [...(field.customAnswerOptions ?? []), label],
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'field') {
      emit({ fields: fields.filter(field => field.id !== deleteTarget.id) });
      if (expandedFieldId === deleteTarget.id) setExpandedFieldId('');
    } else {
      const remainingSections = sections.filter(section => section.id !== deleteTarget.id);
      const fallbackId = remainingSections[0]?.id;
      emit({
        sections: remainingSections,
        fields: fields.map(field => field.sectionId === deleteTarget.id ? { ...field, sectionId: fallbackId } : field),
      });
    }
    setDeleteTarget(null);
    setActiveFieldMenuId('');
  };

  const renderField = (field: ConfigurableFormField<TType>, index: number) => {
    const expanded = expandedFieldId === field.id;
    const meta = typeMeta.get(field.type);
    const TypeIcon = meta?.icon ?? defaultIconMap[field.type] ?? TextCursorInput;
    const choice = Boolean(meta?.choice);
    const rating = Boolean(meta?.rating);
    const fieldError = fieldErrors[field.id];
    return (
      <SortableFieldCard
        key={field.id}
        fieldId={field.id}
        fieldLabel={field.label || `未命名${itemLabel}`}
        readOnly={readOnly}
        itemLabel={itemLabel}
        className={`overflow-hidden rounded-[var(--tm-radius-card)] border bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)] transition-colors ${fieldError ? 'border-[var(--tm-status-negative-strong)]' : expanded ? 'border-[var(--tm-border-control)]' : 'border-[var(--tm-border-subtle)]'}`}
        header={<button
          type="button"
          disabled={readOnly}
          onClick={() => setExpandedFieldId(expanded ? '' : field.id)}
          className="flex min-h-16 w-full items-center gap-3 px-3 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)] disabled:cursor-default"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-secondary)]">{index + 1}</span>
          {expanded ? (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]"><TypeIcon className="h-4 w-4 shrink-0" />{meta?.label ?? field.type}</span>
          ) : (
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{field.label || `未命名${itemLabel}`}</span>
                {field.required && <span className="shrink-0 text-[length:var(--tm-font-size-badge)] font-bold text-[var(--tm-status-negative-strong)]">必填</span>}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]"><TypeIcon className="h-3.5 w-3.5" />{meta?.label ?? field.type}</span>
            </span>
          )}
          {!readOnly && (expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />)}
        </button>}
      >
        {expanded && !readOnly && (
          <div className="border-t border-[var(--tm-border-subtle)] px-4 pb-4 pt-3">
            <label htmlFor={`form-field-${field.id}`} className={`text-[length:var(--tm-font-size-meta)] font-semibold ${fieldError?.label ? 'text-[var(--tm-status-negative-strong)]' : 'text-[var(--tm-text-secondary)]'}`}>{itemLabel}名称</label>
            <AutoResizeTextarea
              id={`form-field-${field.id}`}
              value={field.label}
              onChange={event => updateField(field.id, { label: event.target.value })}
              placeholder={`请输入${itemLabel}名称`}
              aria-invalid={Boolean(fieldError?.label)}
              aria-describedby={fieldError?.label ? `form-field-${field.id}-error` : undefined}
              className={`${inputClass} mt-2 min-h-11 max-h-[84px] resize-none py-3 leading-5 ${fieldError?.label ? 'border-[var(--tm-status-negative-strong)]' : ''}`}
            />
            {fieldError?.label && <p id={`form-field-${field.id}-error`} className="mt-1.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{fieldError.label}</p>}

            {choice && (
              <div className="mt-4 space-y-2">
                <div className="px-0.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">选项</div>
                {field.options.map((option, optionIndex) => {
                  const custom = field.customAnswerOptions?.includes(option) ?? false;
                  return (
                    <div key={`${field.id}-${optionIndex}`}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-badge)] font-bold text-[var(--tm-text-secondary)]">{optionIndex + 1}</span>
                        <input
                          value={option}
                          onChange={event => updateField(field.id, {
                            options: field.options.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item),
                            customAnswerOptions: (field.customAnswerOptions ?? []).map(item => item === option ? event.target.value : item),
                          })}
                          aria-label={`选项${optionIndex + 1}`}
                          aria-invalid={Boolean(fieldError?.options)}
                          aria-describedby={fieldError?.options ? `form-field-${field.id}-options-error` : undefined}
                          className={`${inputClass} h-11 min-w-0 flex-1`}
                        />
                        <IconButton
                          label={`删除选项${optionIndex + 1}`}
                          disabled={field.options.length <= 2}
                          onClick={() => updateField(field.id, {
                            options: field.options.filter((_, itemIndex) => itemIndex !== optionIndex),
                            customAnswerOptions: (field.customAnswerOptions ?? []).filter(item => item !== option),
                          })}
                        ><X className="h-4 w-4" /></IconButton>
                      </div>
                      {custom && <div className="ml-8 mt-1 px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-brand-primary-strong)]">选中后需填写</div>}
                    </div>
                  );
                })}
                {fieldError?.options && <p id={`form-field-${field.id}-options-error`} className="px-0.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{fieldError.options}</p>}
                <div className="flex flex-wrap items-center gap-x-3">
                  <button type="button" onClick={() => updateField(field.id, { options: [...field.options, `选项${field.options.length + 1}`] })} className="flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]"><Plus className="h-4 w-4" />添加选项</button>
                  {allowCustomAnswer && !(field.customAnswerOptions?.length) && (
                    <button type="button" onClick={() => addCustomOption(field)} className="flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]"><MessageSquareText className="h-4 w-4" />添加可填写项</button>
                  )}
                </div>
              </div>
            )}

            {rating && (
              <div className="mt-4 flex min-h-[60px] items-center justify-between gap-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3">
                <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">量表级数</span>
                <div className="flex items-center gap-1">
                  <IconButton label="减少量表级数" disabled={field.options.length <= minRatingLevels} onClick={() => updateField(field.id, { options: field.options.slice(0, -1) })}><Minus className="h-4 w-4" /></IconButton>
                  <span className="min-w-12 text-center text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">{field.options.length}级</span>
                  <IconButton label="增加量表级数" disabled={field.options.length >= maxRatingLevels} onClick={() => updateField(field.id, { options: [...field.options, String(field.options.length + 1)] })}><Plus className="h-4 w-4" /></IconButton>
                </div>
              </div>
            )}

            <div className="mt-3 flex min-h-11 items-center justify-between border-t border-[var(--tm-border-subtle)] pt-3">
              <button type="button" onClick={() => updateField(field.id, { required: !field.required })} className="flex min-h-11 items-center gap-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]" aria-pressed={field.required}>
                <span className={`flex h-6 w-10 rounded-full p-0.5 transition ${field.required ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-control)]'}`}><span className={`h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-control)] transition ${field.required ? 'translate-x-4' : ''}`} /></span>
                必填
              </button>
              <div className="flex items-center">
                <IconButton label={`${itemLabel}更多操作`} onClick={() => setActiveFieldMenuId(field.id)}><MoreHorizontal className="h-4 w-4" /></IconButton>
              </div>
            </div>
          </div>
        )}
      </SortableFieldCard>
    );
  };

  const renderFieldList = (items: Array<ConfigurableFormField<TType>>) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setExpandedFieldId('')}
      onDragEnd={event => reorderFields(event, items)}
      accessibility={{
        screenReaderInstructions: { draggable: `按空格键开始拖动${itemLabel}，使用方向键调整位置，再按空格键完成。` },
        announcements: {
          onDragStart: ({ active }) => {
            const field = items.find(item => item.id === active.id);
            return `已选中${field?.label || `未命名${itemLabel}`}。`;
          },
          onDragOver: ({ over }) => {
            const targetIndex = items.findIndex(item => item.id === over?.id);
            return targetIndex >= 0 ? `当前位于第${targetIndex + 1}${itemLabel}。` : undefined;
          },
          onDragEnd: ({ active, over }) => {
            const field = items.find(item => item.id === active.id);
            const targetIndex = items.findIndex(item => item.id === over?.id);
            return targetIndex >= 0 ? `${field?.label || `未命名${itemLabel}`}已移动到第${targetIndex + 1}${itemLabel}。` : '排序未改变。';
          },
          onDragCancel: ({ active }) => {
            const field = items.find(item => item.id === active.id);
            return `已取消移动${field?.label || `未命名${itemLabel}`}。`;
          },
        },
      }}
    >
      <SortableContext items={items.map(field => field.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{items.map((field, index) => renderField(field, index))}</div>
      </SortableContext>
    </DndContext>
  );

  const activeField = fields.find(field => field.id === activeFieldMenuId);

  return (
    <div>
      <section className="overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]">
        <div className="flex min-h-[60px] items-center justify-between gap-4 px-4">
          <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">使用分组</span>
          <Toggle checked={layoutMode === 'grouped'} label="使用分组" disabled={readOnly} onChange={toggleGrouping} />
        </div>
      </section>

      {layoutMode === 'flat' ? (
        <section className="mt-4">
          <h2 className="mb-3 px-1 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{itemLabel}</h2>
          {renderFieldList(fields)}
          {listError && <p id="form-builder-list-error" tabIndex={-1} className="mt-2 px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{listError}</p>}
          {!readOnly && <button type="button" onClick={() => { setShowMoreTypes(false); setTypeSheetSectionId(''); }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]"><Plus className="h-4 w-4" />添加{itemLabel}</button>}
        </section>
      ) : (
        <section className="mt-4 space-y-4">
          {!readOnly && <div className="flex min-h-11 items-center justify-end px-1">
            <button type="button" onClick={() => setSectionDraft({ id: createFormSectionId(), label: '' })} className="flex min-h-11 items-center gap-2 rounded-[var(--tm-radius-control)] px-3 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]"><Plus className="h-4 w-4" />添加分组</button>
          </div>}
          {sections.map((section, sectionIndex) => {
            const sectionFields = fields.filter(field => field.sectionId === section.id);
            return (
              <div key={section.id}>
                <div className="mb-2 flex min-h-11 items-center gap-2 px-1">
                  <h3 className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">{section.label}</h3>
                  {!readOnly && <IconButton label={`编辑分组：${section.label}`} onClick={() => setSectionDraft({ ...section })}><Settings2 className="h-4 w-4" /></IconButton>}
                </div>
                {renderFieldList(sectionFields)}
                {!readOnly && <button type="button" onClick={() => { setShowMoreTypes(false); setTypeSheetSectionId(section.id); }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]"><Plus className="h-4 w-4" />添加{itemLabel}</button>}
                {sectionIndex < sections.length - 1 && <div className="mt-2 h-px bg-[var(--tm-border-subtle)]" />}
              </div>
            );
          })}
          {listError && <p id="form-builder-list-error" tabIndex={-1} className="px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{listError}</p>}
        </section>
      )}

      <BottomSheet open={typeSheetSectionId !== null} label={`选择${itemLabel}类型`} onDismiss={() => setTypeSheetSectionId(null)}>
        <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">选择{itemLabel}类型</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {visibleTypes.map(type => {
            const TypeIcon = type.icon ?? defaultIconMap[type.value] ?? TextCursorInput;
            return (
              <button key={type.value} type="button" onClick={() => addField(type.value)} className="flex min-h-[76px] items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left active:scale-[0.98] active:bg-[var(--tm-brand-primary-soft)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]"><TypeIcon className="h-5 w-5" /></span>
                <span className="text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">{type.label}</span>
              </button>
            );
          })}
        </div>
        {hasSecondaryTypes && <button type="button" onClick={() => setShowMoreTypes(value => !value)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]">{showMoreTypes ? '常用类型' : '更多类型'}<ChevronDown className={`h-4 w-4 transition-transform ${showMoreTypes ? 'rotate-180' : ''}`} /></button>}
      </BottomSheet>

      <BottomSheet open={Boolean(sectionDraft)} label={sectionDraft && sections.some(section => section.id === sectionDraft.id) ? '编辑分组' : '添加分组'} onDismiss={() => setSectionDraft(null)}>
        {sectionDraft && (
          <>
            <div className="flex min-h-11 items-center justify-between gap-3">
              <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{sections.some(section => section.id === sectionDraft.id) ? '编辑分组' : '添加分组'}</h2>
              <IconButton label="关闭" onClick={() => setSectionDraft(null)}><X className="h-5 w-5" /></IconButton>
            </div>
            <label className="mt-3 block text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">分组名称<input value={sectionDraft.label} onChange={event => setSectionDraft({ ...sectionDraft, label: event.target.value })} className={`${inputClass} mt-2 h-12`} autoFocus /></label>
            <button type="button" disabled={!sectionDraft.label.trim()} onClick={saveSection} className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] disabled:opacity-45">完成</button>
            {sections.some(section => section.id === sectionDraft.id) && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center">
                  <IconButton label="上移分组" disabled={sections[0]?.id === sectionDraft.id} onClick={() => moveSection(sectionDraft.id, -1)}><ChevronUp className="h-5 w-5" /></IconButton>
                  <IconButton label="下移分组" disabled={sections.at(-1)?.id === sectionDraft.id} onClick={() => moveSection(sectionDraft.id, 1)}><ChevronDown className="h-5 w-5" /></IconButton>
                </div>
                <button type="button" disabled={sections.length <= 1} onClick={() => { setDeleteTarget({ type: 'section', id: sectionDraft.id, label: sectionDraft.label }); setSectionDraft(null); }} className="flex min-h-11 items-center gap-2 px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-negative-strong)] disabled:opacity-35"><Trash2 className="h-4 w-4" />删除分组</button>
              </div>
            )}
          </>
        )}
      </BottomSheet>

      <BottomSheet open={Boolean(activeField)} label={`${itemLabel}操作`} onDismiss={() => setActiveFieldMenuId('')}>
        {activeField && (
          <>
            <div className="flex min-h-11 items-center justify-between gap-3">
              <h2 className="truncate text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{activeField.label || `未命名${itemLabel}`}</h2>
              <IconButton label="关闭" onClick={() => setActiveFieldMenuId('')}><X className="h-5 w-5" /></IconButton>
            </div>
            {layoutMode === 'grouped' && <label className="mt-4 block text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">所属分组<select value={activeField.sectionId} onChange={event => moveFieldToSection(activeField.id, event.target.value)} className={`${inputClass} mt-2 h-12`}>{sections.map(section => <option key={section.id} value={section.id}>{section.label}</option>)}</select></label>}
            <button type="button" onClick={() => { setDeleteTarget({ type: 'field', id: activeField.id, label: activeField.label || `未命名${itemLabel}` }); setActiveFieldMenuId(''); }} className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)] active:bg-[var(--tm-status-negative-soft)]"><Trash2 className="h-5 w-5" />删除{itemLabel}</button>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={Boolean(deleteTarget)} label={`删除${deleteTarget?.type === 'section' ? '分组' : itemLabel}`} onDismiss={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <>
            <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">删除“{deleteTarget.label}”？</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="min-h-[52px] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]">取消</button>
              <button type="button" onClick={confirmDelete} className="min-h-[52px] rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-strong)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)]">删除</button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
};

export default FormBuilder;
