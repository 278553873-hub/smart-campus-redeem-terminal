import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useDroppable,
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
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDot,
  Copy,
  FolderPlus,
  GripVertical,
  Hash,
  ListPlus,
  ListChecks,
  MessageSquareText,
  Minus,
  MoreHorizontal,
  Plus,
  Pencil,
  Star,
  TextCursorInput,
  Trash2,
  X,
} from 'lucide-react';
import {
  createFormSectionId,
  createFormSubFieldId,
  normalizeFormFieldSettings,
  type ConfigurableFormField,
  type FormDateFormat,
  type FormFieldSettings,
  type FormLayoutMode,
  type FormNumberFormat,
  type FormSection,
} from '../../../shared/formDefinition';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';

type FieldIcon = React.ComponentType<{ className?: string }>;

export interface FormFieldTypeOption<TType extends string> {
  value: TType;
  label: string;
  icon?: FieldIcon;
  choice?: boolean;
  rating?: boolean;
  subFields?: boolean;
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
  showItemLabel?: boolean;
  readOnly?: boolean;
  allowCustomAnswer?: boolean;
  maxRatingLevels?: number;
  fieldErrors?: Record<string, { label?: string; options?: string; subFields?: string }>;
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
  multi_fill: ListPlus,
  number: Hash,
  date: CalendarDays,
};

const inputClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)] outline-none transition placeholder:text-[var(--tm-text-tertiary)] focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';
const sectionDropId = (sectionId: string) => `form-section:${sectionId}`;
const sectionSortId = (sectionId: string) => `form-section-sort:${sectionId}`;

const orderFieldsBySections = <TType extends string>(
  sections: FormSection[],
  fields: Array<ConfigurableFormField<TType>>,
) => {
  const assignedIds = new Set<string>();
  const groupedFields = sections.flatMap(section => fields.filter(field => {
    if (field.sectionId !== section.id) return false;
    assignedIds.add(field.id);
    return true;
  }));
  return [...groupedFields, ...fields.filter(field => !assignedIds.has(field.id))];
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

const BottomSheet: React.FC<{ open: boolean; label: string; onDismiss: () => void; children: React.ReactNode }> = ({ open, label, onDismiss, children }) => (
  <MobileBottomSheet open={open} title={label} onClose={onDismiss}>{children}</MobileBottomSheet>
);

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
  fieldNumber: number;
  required: boolean;
  readOnly: boolean;
  itemLabel: '题目' | '字段';
  className: string;
  header: React.ReactNode;
  children?: React.ReactNode;
}> = ({ fieldId, fieldLabel, fieldNumber, required, readOnly, itemLabel, className, header, children }) => {
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
      data-form-field-editor={fieldId}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={`${className} relative ${isDragging ? 'opacity-[0.85] shadow-[var(--tm-shadow-sheet)]' : ''}`}
    >
      <div className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)] items-stretch">
        {!readOnly ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`拖动排序${itemLabel}：${fieldLabel}`}
            title={`拖动排序${itemLabel}`}
            className={`relative flex min-h-[76px] w-12 touch-none cursor-grab items-start justify-center pt-4 text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums text-[var(--tm-brand-primary-strong)] transition-colors active:cursor-grabbing active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)] ${children ? 'row-span-2' : ''}`}
          >
            {fieldNumber}
            {required && <span className="ml-0.5 text-[var(--tm-status-negative-strong)]" aria-hidden="true">*</span>}
            <GripVertical className="absolute top-10 h-3.5 w-3.5 text-[var(--tm-text-disabled)]" aria-hidden="true" />
          </button>
        ) : <div className="relative flex min-h-[76px] w-12 items-start justify-center pt-4 text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums text-[var(--tm-brand-primary-strong)]">{fieldNumber}{required && <span className="ml-0.5 text-[var(--tm-status-negative-strong)]">*</span>}</div>}
        <div className="min-w-0 flex-1">{header}</div>
        {children && <div className="col-start-2 min-w-0">{children}</div>}
      </div>
    </article>
  );
};

const SectionDropZone: React.FC<{ sectionId: string; children: React.ReactNode }> = ({ sectionId, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id: sectionDropId(sectionId) });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-[var(--tm-radius-inner)] transition-colors ${isOver ? 'bg-[var(--tm-brand-primary-soft)]' : ''}`}
    >
      {children}
    </div>
  );
};

const SortableSectionRow: React.FC<{ section: FormSection }> = ({ section }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionSortId(section.id) });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={`flex min-h-[56px] items-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] ${isDragging ? 'opacity-[0.85] shadow-[var(--tm-shadow-sheet)]' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`拖动排序分组：${section.label}`}
        title="拖动排序分组"
        className="flex h-14 w-12 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--tm-text-tertiary)] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)]"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="min-w-0 flex-1 truncate pr-4 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{section.label}</span>
    </div>
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
  showItemLabel = true,
  readOnly = false,
  allowCustomAnswer = false,
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
  const [activeSectionMenuId, setActiveSectionMenuId] = useState('');
  const [sectionDraft, setSectionDraft] = useState<FormSection | null>(null);
  const [showSectionSorter, setShowSectionSorter] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'field' | 'section'; id: string; label: string } | null>(null);
  const pendingFocusId = useRef('');
  const pendingOptionFocusId = useRef('');
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
  const orderedFields = useMemo(
    () => layoutMode === 'grouped' ? orderFieldsBySections(sections, fields) : fields,
    [fields, layoutMode, sections],
  );
  const fieldNumberById = useMemo(
    () => new Map(orderedFields.map((field, index) => [field.id, index + 1])),
    [orderedFields],
  );

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
    if (!pendingOptionFocusId.current) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(pendingOptionFocusId.current)?.focus({ preventScroll: true });
      pendingOptionFocusId.current = '';
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fields]);

  useEffect(() => {
    if (!expandedFieldId) return;
    const closeFieldEditor = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element) {
        const fieldEditor = target.closest('[data-form-field-editor]');
        if (fieldEditor instanceof HTMLElement && fieldEditor.dataset.formFieldEditor === expandedFieldId) return;
      }
      setExpandedFieldId(current => current === expandedFieldId ? '' : current);
    };
    const listenerFrame = window.requestAnimationFrame(() => {
      document.addEventListener('click', closeFieldEditor);
    });
    return () => {
      window.cancelAnimationFrame(listenerFrame);
      document.removeEventListener('click', closeFieldEditor);
    };
  }, [expandedFieldId]);

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
    const createdField = createField(type, sectionId);
    const field = {
      ...createdField,
      settings: normalizeFormFieldSettings(type, createdField.settings, createdField.options),
    };
    emit({ fields: [...fields, field] });
    pendingFocusId.current = field.id;
    setExpandedFieldId(field.id);
    setTypeSheetSectionId(null);
    setShowMoreTypes(false);
  };

  const updateField = (id: string, patch: Partial<ConfigurableFormField<TType>>) => {
    emit({ fields: fields.map(field => {
      if (field.id !== id) return field;
      const next = { ...field, ...patch };
      return {
        ...next,
        settings: normalizeFormFieldSettings(next.type, next.settings, next.options),
      };
    }) });
  };

  const copyField = (field: ConfigurableFormField<TType>) => {
    const sourceIndex = fields.findIndex(item => item.id === field.id);
    if (sourceIndex < 0) return;
    const copy = {
      ...field,
      id: `form-field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      options: [...field.options],
      customAnswerOptions: [...(field.customAnswerOptions ?? [])],
      subFields: field.subFields?.map(subField => ({ ...subField, id: createFormSubFieldId() })),
      settings: normalizeFormFieldSettings(field.type, field.settings, field.options),
    };
    const nextFields = [...fields];
    nextFields.splice(sourceIndex + 1, 0, copy);
    emit({ fields: nextFields });
    pendingFocusId.current = copy.id;
    setExpandedFieldId(copy.id);
    setActiveFieldMenuId('');
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

  const reorderGroupedFields = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const sourceIndex = orderedFields.findIndex(field => field.id === active.id);
    if (sourceIndex < 0) return;
    const targetField = orderedFields.find(field => field.id === over.id);
    const targetSectionId = targetField?.sectionId
      ?? (String(over.id).startsWith('form-section:') ? String(over.id).slice('form-section:'.length) : '');
    if (!targetSectionId || !sections.some(section => section.id === targetSectionId)) return;

    if (targetField) {
      const targetIndex = orderedFields.findIndex(field => field.id === targetField.id);
      const reordered = active.id === over.id
        ? orderedFields
        : arrayMove(orderedFields, sourceIndex, targetIndex);
      emit({
        fields: reordered.map(field => field.id === active.id ? { ...field, sectionId: targetSectionId } : field),
      });
      return;
    }

    const activeField = orderedFields[sourceIndex];
    const withoutActive = orderedFields.filter(field => field.id !== active.id);
    const lastTargetIndex = withoutActive.reduce((last, field, index) => field.sectionId === targetSectionId ? index : last, -1);
    const nextFields = [...withoutActive];
    nextFields.splice(lastTargetIndex + 1, 0, { ...activeField, sectionId: targetSectionId });
    emit({ fields: nextFields });
  };

  const reorderSections = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeSectionId = String(active.id).replace('form-section-sort:', '');
    const overSectionId = String(over.id).replace('form-section-sort:', '');
    const sourceIndex = sections.findIndex(section => section.id === activeSectionId);
    const targetIndex = sections.findIndex(section => section.id === overSectionId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const nextSections = arrayMove(sections, sourceIndex, targetIndex);
    emit({
      sections: nextSections,
      fields: orderFieldsBySections(nextSections, fields),
    });
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

  const addOption = (field: ConfigurableFormField<TType>) => {
    const optionIndex = field.options.length;
    pendingOptionFocusId.current = `form-field-${field.id}-option-${optionIndex}`;
    updateField(field.id, { options: [...field.options, ''] });
  };

  const addSubField = (field: ConfigurableFormField<TType>) => {
    const subFields = field.subFields ?? [];
    if (subFields.length >= 6) return;
    const subFieldIndex = subFields.length;
    pendingOptionFocusId.current = `form-field-${field.id}-sub-field-${subFieldIndex}`;
    updateField(field.id, {
      subFields: [...subFields, { id: createFormSubFieldId(), label: '', required: true }],
      required: true,
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

  const renderFieldPreview = (field: ConfigurableFormField<TType>, choice: boolean, rating: boolean, usesSubFields: boolean) => {
    const settings = normalizeFormFieldSettings(field.type, field.settings, field.options);
    const isMultiple = field.type === 'multiple' || field.type === 'multiple-select';
    if (choice) {
      return (
        <div className="mt-3 space-y-2.5" aria-hidden="true">
          {field.options.map((option, optionIndex) => (
            <div key={`${field.id}-preview-${optionIndex}`} className="flex min-h-8 items-center gap-2.5 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
              <span className={`h-5 w-5 shrink-0 border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] ${isMultiple ? 'rounded-[5px]' : 'rounded-full'}`} />
              <span className="min-w-0 flex-1 break-words">{option || `选项${optionIndex + 1}`}</span>
            </div>
          ))}
        </div>
      );
    }
    if (rating) {
      const min = settings.ratingMin ?? 1;
      const max = settings.ratingMax ?? 5;
      return (
        <div className="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">
          {Array.from({ length: max - min + 1 }, (_, offset) => min + offset).map(value => (
            <span key={value} className="flex h-9 items-center justify-center rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-text-secondary)]">{value}</span>
          ))}
        </div>
      );
    }
    if (usesSubFields) {
      return (
        <div className="mt-3 space-y-2.5" aria-hidden="true">
          {(field.subFields ?? []).map((subField, subFieldIndex) => (
            <div key={subField.id} className="flex min-h-8 items-end gap-2.5">
              <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">{subField.label || `填空项${subFieldIndex + 1}`}</span>
              <span className="h-7 w-24 shrink-0 border-b border-[var(--tm-border-control)]" />
            </div>
          ))}
        </div>
      );
    }
    if (field.type === 'date') {
      const placeholder: Record<FormDateFormat, string> = { ymd: '年-月-日', ym: '年-月', year: '年份' };
      return <div className="mt-4 flex h-10 items-center justify-between border-b border-[var(--tm-border-control)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]" aria-hidden="true"><span>{placeholder[settings.dateFormat ?? 'ymd']}</span><CalendarDays className="h-4.5 w-4.5" /></div>;
    }
    if (field.type === 'number') {
      const placeholder: Record<FormNumberFormat, string> = { integer: '请输入整数', 'decimal-1': '请输入数字（1位小数）', 'decimal-2': '请输入数字（2位小数）' };
      return <div className="mt-4 flex h-10 items-center justify-between border-b border-[var(--tm-border-control)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]" aria-hidden="true"><span>{placeholder[settings.numberFormat ?? 'integer']}</span><Hash className="h-4.5 w-4.5" /></div>;
    }
    if (field.type === 'short_text') {
      return <div className="mt-4 h-10 border-b border-[var(--tm-border-control)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]" aria-hidden="true">请输入内容</div>;
    }
    return <div className="mt-3 min-h-[72px] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]" aria-hidden="true">请输入内容</div>;
  };

  const setRatingRange = (field: ConfigurableFormField<TType>, ratingMin: number, ratingMax: number) => {
    const nextMin = Math.max(1, Math.min(ratingMin, 9));
    const nextMax = Math.max(nextMin + 1, Math.min(ratingMax, maxRatingLevels));
    updateField(field.id, {
      settings: { ...field.settings, ratingMin: nextMin, ratingMax: nextMax },
      options: Array.from({ length: nextMax - nextMin + 1 }, (_, offset) => String(nextMin + offset)),
    });
  };

  const activeField = fields.find(field => field.id === activeFieldMenuId);
  const activeSection = sections.find(section => section.id === activeSectionMenuId);
  const activeFieldSettings = activeField
    ? normalizeFormFieldSettings(activeField.type, activeField.settings, activeField.options)
    : {};

  const toggleFieldEditor = (field: ConfigurableFormField<TType>) => {
    if (readOnly) return;
    if (expandedFieldId === field.id) {
      setExpandedFieldId('');
      return;
    }
    pendingFocusId.current = field.id;
    setExpandedFieldId(field.id);
  };

  const renderField = (field: ConfigurableFormField<TType>, index: number) => {
    const expanded = expandedFieldId === field.id;
    const meta = typeMeta.get(field.type);
    const TypeIcon = meta?.icon ?? defaultIconMap[field.type] ?? TextCursorInput;
    const choice = Boolean(meta?.choice);
    const rating = Boolean(meta?.rating);
    const usesSubFields = Boolean(meta?.subFields);
    const fieldError = fieldErrors[field.id];
    return (
      <SortableFieldCard
        key={field.id}
        fieldId={field.id}
        fieldLabel={field.label || `未命名${itemLabel}`}
        fieldNumber={index + 1}
        required={field.required}
        readOnly={readOnly}
        itemLabel={itemLabel}
        className={`overflow-hidden rounded-[var(--tm-radius-card)] border bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)] transition-colors ${fieldError ? 'border-[var(--tm-status-negative-strong)]' : expanded ? 'border-[var(--tm-brand-primary)]' : 'border-transparent'}`}
        header={<button
          type="button"
          disabled={readOnly}
          onClick={() => toggleFieldEditor(field)}
          aria-expanded={expanded}
          aria-label={`${expanded ? '收起' : readOnly ? '查看' : '编辑'}${itemLabel}详情：${field.label || `未命名${itemLabel}`}`}
          className={`flex w-full gap-3 px-3 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)] disabled:cursor-default ${expanded && !readOnly ? 'min-h-11 items-center py-2' : 'min-h-[76px] items-start py-3.5'}`}
        >
          {expanded && !readOnly ? (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]"><TypeIcon className="h-4 w-4 shrink-0" />{meta?.label ?? field.type}</span>
          ) : (
              <span className="min-w-0 flex-1 pb-1">
                <span className="block break-words text-[length:var(--tm-font-size-body)] font-semibold leading-5 text-[var(--tm-text-primary)]">{field.label || `未命名${itemLabel}`}</span>
                {renderFieldPreview(field, choice, rating, usesSubFields)}
              </span>
          )}
        </button>}
      >
        {expanded && !readOnly && (
          <div className="px-4 pb-4">
            <AutoResizeTextarea
              id={`form-field-${field.id}`}
              value={field.label}
              onChange={event => updateField(field.id, { label: event.target.value })}
              placeholder={itemLabel === '题目' ? '请输入题干' : '请输入字段名称'}
              aria-label={itemLabel === '题目' ? '题干' : '字段名称'}
              aria-invalid={Boolean(fieldError?.label)}
              aria-describedby={fieldError?.label ? `form-field-${field.id}-error` : undefined}
              className={`w-full min-h-11 max-h-[84px] resize-none border-0 border-b bg-transparent px-0 py-2 text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)] outline-none transition-[border-color,border-width] placeholder:text-[var(--tm-text-tertiary)] focus:border-b-2 focus:ring-0 ${fieldError?.label ? 'border-[var(--tm-status-negative-strong)] focus:border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-border-control)] focus:border-[var(--tm-brand-primary)]'}`}
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
                          id={`form-field-${field.id}-option-${optionIndex}`}
                          value={option}
                          onChange={event => updateField(field.id, {
                            options: field.options.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item),
                            customAnswerOptions: (field.customAnswerOptions ?? []).map(item => item === option ? event.target.value : item),
                          })}
                          aria-label={`选项${optionIndex + 1}`}
                          placeholder="请输入选项名称"
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
                  <button type="button" onClick={() => addOption(field)} className="flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]"><Plus className="h-4 w-4" />添加选项</button>
                  {allowCustomAnswer && !(field.customAnswerOptions?.length) && (
                    <button type="button" onClick={() => addCustomOption(field)} className="flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]"><MessageSquareText className="h-4 w-4" />添加“其他”选项</button>
                  )}
                </div>
              </div>
            )}

            {usesSubFields && (
              <div className="mt-4">
                <div className="px-0.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">填空项</div>
                <div className="mt-2 divide-y divide-[var(--tm-border-subtle)]">
                  {(field.subFields ?? []).map((subField, subFieldIndex) => (
                  <div key={subField.id} className="py-3 first:pt-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-badge)] font-bold text-[var(--tm-text-secondary)]">{subFieldIndex + 1}</span>
                      <input
                        id={`form-field-${field.id}-sub-field-${subFieldIndex}`}
                        value={subField.label}
                        onChange={event => updateField(field.id, {
                          subFields: (field.subFields ?? []).map(item => item.id === subField.id ? { ...item, label: event.target.value } : item),
                        })}
                        aria-label={`填空项${subFieldIndex + 1}`}
                        placeholder="请输入填空项名称"
                        aria-invalid={Boolean(fieldError?.subFields)}
                        aria-describedby={fieldError?.subFields ? `form-field-${field.id}-sub-fields-error` : undefined}
                        className={`${inputClass} h-11 min-w-0 flex-1`}
                      />
                      <IconButton
                        label={`删除填空项${subFieldIndex + 1}`}
                        disabled={(field.subFields?.length ?? 0) <= 2}
                        onClick={() => {
                          const nextSubFields = (field.subFields ?? []).filter(item => item.id !== subField.id);
                          updateField(field.id, { subFields: nextSubFields, required: nextSubFields.some(item => item.required) });
                        }}
                      ><X className="h-4 w-4" /></IconButton>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={subField.required}
                      onClick={() => {
                        const nextSubFields = (field.subFields ?? []).map(item => item.id === subField.id ? { ...item, required: !item.required } : item);
                        updateField(field.id, { subFields: nextSubFields, required: nextSubFields.some(item => item.required) });
                      }}
                      className="ml-8 mt-1 flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]"
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-[5px] border ${subField.required ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-transparent'}`}><Check className="h-3.5 w-3.5" /></span>
                      必填
                    </button>
                  </div>
                  ))}
                </div>
                {fieldError?.subFields && <p id={`form-field-${field.id}-sub-fields-error`} className="px-0.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{fieldError.subFields}</p>}
                <button type="button" disabled={(field.subFields?.length ?? 0) >= 6} onClick={() => addSubField(field)} className="flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] disabled:opacity-35"><Plus className="h-4 w-4" />添加填空项</button>
              </div>
            )}

            <div className="mt-2 flex min-h-11 items-center justify-between">
              {!usesSubFields ? <button type="button" onClick={() => updateField(field.id, { required: !field.required })} className="flex min-h-11 items-center gap-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]" aria-pressed={field.required}>
                <span className={`flex h-6 w-10 rounded-full p-0.5 transition ${field.required ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-control)]'}`}><span className={`h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-control)] transition ${field.required ? 'translate-x-4' : ''}`} /></span>
                必填
              </button> : <span />}
              <IconButton label={`${itemLabel}更多设置`} onClick={() => setActiveFieldMenuId(field.id)}><MoreHorizontal className="h-5 w-5" /></IconButton>
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

  const renderGroupedFieldList = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setExpandedFieldId('')}
      onDragEnd={reorderGroupedFields}
      accessibility={{
        screenReaderInstructions: { draggable: `按空格键开始拖动${itemLabel}，使用方向键调整位置或移动到其他分组，再按空格键完成。` },
      }}
    >
      <SortableContext items={orderedFields.map(field => field.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const sectionFields = orderedFields.filter(field => field.sectionId === section.id);
            return (
              <SectionDropZone key={section.id} sectionId={section.id}>
                <div className="mb-3 flex min-h-[var(--tm-size-touch)] items-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] px-3">
                  <span className="h-5 w-[3px] shrink-0 rounded-full bg-[var(--tm-brand-primary)]" aria-hidden="true" />
                  <h3 className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{section.label}</h3>
                  {!readOnly && <IconButton label={`分组更多操作：${section.label}`} onClick={() => setActiveSectionMenuId(section.id)}><MoreHorizontal className="h-5 w-5" /></IconButton>}
                </div>
                <div className="min-h-2 space-y-3">
                  {sectionFields.map(field => renderField(field, (fieldNumberById.get(field.id) ?? 1) - 1))}
                </div>
                {!readOnly && <button type="button" aria-label={`在${section.label}中添加${itemLabel}`} onClick={() => { setShowMoreTypes(false); setTypeSheetSectionId(section.id); }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] transition-colors active:bg-[var(--tm-brand-primary-soft-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"><Plus className="h-4 w-4" />添加{itemLabel}到本组</button>}
                {sectionIndex < sections.length - 1 && <div className="mt-2 h-px bg-[var(--tm-border-subtle)]" />}
              </SectionDropZone>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );

  return (
    <div>
      <section className={`flex min-h-[var(--tm-size-touch)] items-center gap-4 px-1 ${showItemLabel ? 'justify-between' : 'justify-end'}`}>
        {showItemLabel && <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{itemLabel}</h2>}
        {!readOnly && (
          <div className="flex items-center gap-1">
            <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">分组</span>
            <Toggle checked={layoutMode === 'grouped'} label="使用分组" disabled={readOnly} onChange={toggleGrouping} />
          </div>
        )}
      </section>

      {layoutMode === 'flat' ? (
        <section className="mt-2">
          {renderFieldList(fields)}
          {listError && <p id="form-builder-list-error" tabIndex={-1} className="mt-2 px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{listError}</p>}
          {!readOnly && <button type="button" onClick={() => { setShowMoreTypes(false); setTypeSheetSectionId(''); }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]"><Plus className="h-4 w-4" />添加{itemLabel}</button>}
        </section>
      ) : (
        <section className="mt-2">
          {renderGroupedFieldList()}
          {listError && <p id="form-builder-list-error" tabIndex={-1} className="mt-2 px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{listError}</p>}
          {!readOnly && <button type="button" onClick={() => setSectionDraft({ id: createFormSectionId(), label: '' })} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"><FolderPlus className="h-4 w-4" />添加分组</button>}
        </section>
      )}

      <BottomSheet open={typeSheetSectionId !== null} label={`选择${itemLabel}类型`} onDismiss={() => setTypeSheetSectionId(null)}>
        <div className="grid grid-cols-2 gap-3">
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

      <BottomSheet open={Boolean(activeField)} label={`${itemLabel}设置`} onDismiss={() => setActiveFieldMenuId('')}>
        {activeField && (
          <div className="space-y-4 pb-2">
            {(activeField.type === 'multiple' || activeField.type === 'multiple-select') && (
              <section className="divide-y divide-[var(--tm-border-subtle)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3">
                {([
                  ['minSelections', '最少选择', activeFieldSettings.minSelections ?? 1],
                  ['maxSelections', '最多选择', activeFieldSettings.maxSelections ?? activeField.options.length],
                ] as const).map(([key, label, value]) => (
                  <div key={key} className="flex min-h-[60px] items-center justify-between gap-3">
                    <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{label}</span>
                    <div className="flex items-center gap-1">
                      <IconButton label={`减少${label}`} disabled={value <= 1} onClick={() => updateField(activeField.id, { settings: { ...activeFieldSettings, [key]: value - 1 } })}><Minus className="h-4 w-4" /></IconButton>
                      <span className="w-8 text-center text-[length:var(--tm-font-size-body)] font-bold tabular-nums text-[var(--tm-text-primary)]">{value}</span>
                      <IconButton label={`增加${label}`} disabled={value >= activeField.options.length} onClick={() => updateField(activeField.id, { settings: { ...activeFieldSettings, [key]: value + 1 } })}><Plus className="h-4 w-4" /></IconButton>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {activeField.type === 'rating' && (
              <section className="divide-y divide-[var(--tm-border-subtle)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3">
                <div className="flex min-h-[60px] items-center justify-between gap-3">
                  <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">起始分</span>
                  <div className="flex items-center gap-1">
                    <IconButton label="减少起始分" disabled={(activeFieldSettings.ratingMin ?? 1) <= 1} onClick={() => setRatingRange(activeField, (activeFieldSettings.ratingMin ?? 1) - 1, activeFieldSettings.ratingMax ?? 5)}><Minus className="h-4 w-4" /></IconButton>
                    <span className="w-8 text-center text-[length:var(--tm-font-size-body)] font-bold tabular-nums text-[var(--tm-text-primary)]">{activeFieldSettings.ratingMin ?? 1}</span>
                    <IconButton label="增加起始分" disabled={(activeFieldSettings.ratingMin ?? 1) >= (activeFieldSettings.ratingMax ?? 5) - 1} onClick={() => setRatingRange(activeField, (activeFieldSettings.ratingMin ?? 1) + 1, activeFieldSettings.ratingMax ?? 5)}><Plus className="h-4 w-4" /></IconButton>
                  </div>
                </div>
                <div className="flex min-h-[60px] items-center justify-between gap-3">
                  <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">结束分</span>
                  <div className="flex items-center gap-1">
                    <IconButton label="减少结束分" disabled={(activeFieldSettings.ratingMax ?? 5) <= (activeFieldSettings.ratingMin ?? 1) + 1} onClick={() => setRatingRange(activeField, activeFieldSettings.ratingMin ?? 1, (activeFieldSettings.ratingMax ?? 5) - 1)}><Minus className="h-4 w-4" /></IconButton>
                    <span className="w-8 text-center text-[length:var(--tm-font-size-body)] font-bold tabular-nums text-[var(--tm-text-primary)]">{activeFieldSettings.ratingMax ?? 5}</span>
                    <IconButton label="增加结束分" disabled={(activeFieldSettings.ratingMax ?? 5) >= maxRatingLevels} onClick={() => setRatingRange(activeField, activeFieldSettings.ratingMin ?? 1, (activeFieldSettings.ratingMax ?? 5) + 1)}><Plus className="h-4 w-4" /></IconButton>
                  </div>
                </div>
              </section>
            )}

            {activeField.type === 'date' && (
              <section>
                <div className="mb-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">日期格式</div>
                <div className="grid grid-cols-3 gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1">
                  {([['ymd', '年-月-日'], ['ym', '年-月'], ['year', '年份']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={activeFieldSettings.dateFormat === value} onClick={() => updateField(activeField.id, { settings: { ...activeFieldSettings, dateFormat: value } })} className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold ${activeFieldSettings.dateFormat === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>)}
                </div>
              </section>
            )}

            {activeField.type === 'number' && (
              <section>
                <div className="mb-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">数字格式</div>
                <div className="grid grid-cols-3 gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1">
                  {([['integer', '整数'], ['decimal-1', '1位小数'], ['decimal-2', '2位小数']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={activeFieldSettings.numberFormat === value} onClick={() => updateField(activeField.id, { settings: { ...activeFieldSettings, numberFormat: value } })} className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold ${activeFieldSettings.numberFormat === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>)}
                </div>
              </section>
            )}

            <section className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] pt-1">
              <button type="button" onClick={() => copyField(activeField)} className="flex min-h-[52px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><Copy className="h-5 w-5 text-[var(--tm-text-secondary)]" />复制{itemLabel}</button>
              <button type="button" onClick={() => { setActiveFieldMenuId(''); setDeleteTarget({ type: 'field', id: activeField.id, label: activeField.label || `未命名${itemLabel}` }); }} className="flex min-h-[52px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)]"><Trash2 className="h-5 w-5" />删除{itemLabel}</button>
            </section>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={Boolean(activeSection)} label={activeSection?.label || '分组操作'} onDismiss={() => setActiveSectionMenuId('')}>
        {activeSection && (
          <div className="divide-y divide-[var(--tm-border-subtle)]">
            <button type="button" onClick={() => { setSectionDraft({ ...activeSection }); setActiveSectionMenuId(''); }} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><Pencil className="h-5 w-5 text-[var(--tm-text-secondary)]" />编辑分组</button>
            {sections.length > 1 && <button type="button" onClick={() => { setShowSectionSorter(true); setActiveSectionMenuId(''); }} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><ArrowUpDown className="h-5 w-5 text-[var(--tm-text-secondary)]" />分组排序</button>}
            <button type="button" disabled={sections.length <= 1} onClick={() => { setDeleteTarget({ type: 'section', id: activeSection.id, label: activeSection.label }); setActiveSectionMenuId(''); }} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)] disabled:opacity-35"><Trash2 className="h-5 w-5" />删除分组</button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={Boolean(sectionDraft)} label={sectionDraft && sections.some(section => section.id === sectionDraft.id) ? '编辑分组' : '添加分组'} onDismiss={() => setSectionDraft(null)}>
        {sectionDraft && (
          <>
            <label className="block text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">分组名称<input value={sectionDraft.label} onChange={event => setSectionDraft({ ...sectionDraft, label: event.target.value })} className={`${inputClass} mt-2 h-12`} /></label>
            <button type="button" disabled={!sectionDraft.label.trim()} onClick={saveSection} className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] disabled:opacity-45">完成</button>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={showSectionSorter} label="分组排序" onDismiss={() => setShowSectionSorter(false)}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderSections}>
          <SortableContext items={sections.map(section => sectionSortId(section.id))} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map(section => <SortableSectionRow key={section.id} section={section} />)}
            </div>
          </SortableContext>
        </DndContext>
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
