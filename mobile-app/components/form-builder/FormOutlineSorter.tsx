import React, { useMemo } from 'react';
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
import { Folder, GripVertical } from 'lucide-react';
import type { ConfigurableFormField, FormLayoutMode, FormSection } from '../../../shared/formDefinition';

export interface FormOutlineValue<TType extends string> {
  layoutMode: FormLayoutMode;
  sections: FormSection[];
  fields: Array<ConfigurableFormField<TType>>;
}

interface FormOutlineSorterProps<TType extends string> extends FormOutlineValue<TType> {
  onChange: (value: FormOutlineValue<TType>) => void;
  itemLabel: '题目' | '字段';
}

const sectionSortId = (sectionId: string) => `outline-section-sort:${sectionId}`;
const sectionDropId = (sectionId: string) => `outline-section-drop:${sectionId}`;
const getSectionId = (id: string) => id.replace(/^outline-section-(?:sort|drop):/, '');

const orderFieldsBySections = <TType extends string>(
  sections: FormSection[],
  fields: Array<ConfigurableFormField<TType>>,
) => {
  const assignedIds = new Set<string>();
  const grouped = sections.flatMap(section => fields.filter(field => {
    if (field.sectionId !== section.id) return false;
    assignedIds.add(field.id);
    return true;
  }));
  return [...grouped, ...fields.filter(field => !assignedIds.has(field.id))];
};

const OutlineFieldRow = <TType extends string>({
  field,
  number,
  itemLabel,
}: {
  field: ConfigurableFormField<TType>;
  number: number;
  itemLabel: '题目' | '字段';
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={`flex min-h-[52px] items-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] ${isDragging ? 'opacity-[0.85] [box-shadow:var(--tm-shadow-sheet)]' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`拖动排序${itemLabel}：${field.label || `未命名${itemLabel}`}`}
        className="flex h-[52px] w-11 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--tm-text-tertiary)] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)]"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="mr-2 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-1 text-[length:var(--tm-font-size-badge)] font-bold tabular-nums text-[var(--tm-brand-primary-strong)]">
        {number}
      </span>
      <span className="min-w-0 flex-1 break-words py-3 pr-3 text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-primary)]">
        {field.label || `未命名${itemLabel}`}
        {field.required && <span className="ml-1 text-[var(--tm-status-negative-strong)]">*</span>}
      </span>
    </div>
  );
};

const OutlineSection = ({ section, children }: { section: FormSection; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionSortId(section.id) });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: sectionDropId(section.id) });
  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={`border-b border-[var(--tm-border-subtle)] pb-4 last:border-b-0 ${isDragging ? 'opacity-[0.85]' : ''}`}
    >
      <div className="flex min-h-[52px] items-center">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`拖动排序分组：${section.label}`}
          className="flex h-[52px] w-11 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--tm-text-tertiary)] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)]"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <Folder className="mr-2 h-4.5 w-4.5 shrink-0 text-[var(--tm-brand-primary-strong)]" />
        <h3 className="min-w-0 flex-1 truncate pr-3 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">{section.label}</h3>
      </div>
      <div ref={setDropRef} className={`ml-5 min-h-3 space-y-2 rounded-[var(--tm-radius-control)] pl-3 transition-colors ${isOver ? 'bg-[var(--tm-brand-primary-soft)]' : ''}`}>
        {children}
      </div>
    </section>
  );
};

const FormOutlineSorter = <TType extends string>({
  layoutMode,
  sections,
  fields,
  onChange,
  itemLabel,
}: FormOutlineSorterProps<TType>) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const orderedFields = useMemo(
    () => layoutMode === 'grouped' ? orderFieldsBySections(sections, fields) : fields,
    [fields, layoutMode, sections],
  );
  const fieldNumberById = useMemo(
    () => new Map(orderedFields.map((field, index) => [field.id, index + 1])),
    [orderedFields],
  );
  const outlineAccessibility = {
    screenReaderInstructions: {
      draggable: `按空格键开始拖动${itemLabel}或分组，使用方向键调整位置，再按空格键完成。`,
    },
    announcements: {
      onDragStart: ({ active }: { active: { id: string | number } }) => {
        const activeId = String(active.id);
        const section = activeId.startsWith('outline-section-sort:')
          ? sections.find(item => item.id === getSectionId(activeId))
          : undefined;
        const field = fields.find(item => item.id === active.id);
        return `已选中${section ? `分组${section.label}` : field?.label || `未命名${itemLabel}`}。`;
      },
      onDragOver: ({ over }: { over: { id: string | number } | null }) => {
        if (!over) return undefined;
        const overId = String(over.id);
        const section = overId.startsWith('outline-section-')
          ? sections.find(item => item.id === getSectionId(overId))
          : undefined;
        const field = fields.find(item => item.id === over.id);
        return section ? `当前位于分组${section.label}。` : field ? `当前位于${field.label || `未命名${itemLabel}`}。` : undefined;
      },
      onDragEnd: ({ active, over }: DragEndEvent) => {
        if (!over) return '排序未改变。';
        const activeId = String(active.id);
        const section = activeId.startsWith('outline-section-sort:')
          ? sections.find(item => item.id === getSectionId(activeId))
          : undefined;
        const field = fields.find(item => item.id === active.id);
        return `${section ? `分组${section.label}` : field?.label || `未命名${itemLabel}`}已移动。`;
      },
      onDragCancel: () => '已取消移动。',
    },
  };

  const reorderFlatFields = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const sourceIndex = fields.findIndex(field => field.id === active.id);
    const targetIndex = fields.findIndex(field => field.id === over.id);
    if (sourceIndex < 0 || targetIndex < 0) return;
    onChange({ layoutMode, sections, fields: arrayMove(fields, sourceIndex, targetIndex) });
  };

  const reorderGroupedOutline = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId.startsWith('outline-section-sort:')) {
      const activeSectionId = getSectionId(activeId);
      const targetSectionId = overId.startsWith('outline-section-')
        ? getSectionId(overId)
        : orderedFields.find(field => field.id === over.id)?.sectionId;
      const sourceIndex = sections.findIndex(section => section.id === activeSectionId);
      const targetIndex = sections.findIndex(section => section.id === targetSectionId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
      const nextSections = arrayMove(sections, sourceIndex, targetIndex);
      onChange({ layoutMode, sections: nextSections, fields: orderFieldsBySections(nextSections, orderedFields) });
      return;
    }

    const sourceIndex = orderedFields.findIndex(field => field.id === active.id);
    if (sourceIndex < 0) return;
    const targetField = orderedFields.find(field => field.id === over.id);
    const targetSectionId = targetField?.sectionId
      ?? (overId.startsWith('outline-section-') ? getSectionId(overId) : undefined);
    if (!targetSectionId || !sections.some(section => section.id === targetSectionId)) return;

    if (targetField) {
      const targetIndex = orderedFields.findIndex(field => field.id === targetField.id);
      const reordered = active.id === over.id ? orderedFields : arrayMove(orderedFields, sourceIndex, targetIndex);
      onChange({
        layoutMode,
        sections,
        fields: reordered.map(field => field.id === active.id ? { ...field, sectionId: targetSectionId } : field),
      });
      return;
    }

    const activeField = orderedFields[sourceIndex];
    const withoutActive = orderedFields.filter(field => field.id !== active.id);
    const lastTargetIndex = withoutActive.reduce((last, field, index) => field.sectionId === targetSectionId ? index : last, -1);
    const nextFields = [...withoutActive];
    nextFields.splice(lastTargetIndex + 1, 0, { ...activeField, sectionId: targetSectionId });
    onChange({ layoutMode, sections, fields: nextFields });
  };

  if (layoutMode === 'flat') {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderFlatFields} accessibility={outlineAccessibility}>
        <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field, index) => <OutlineFieldRow key={field.id} field={field} number={index + 1} itemLabel={itemLabel} />)}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderGroupedOutline} accessibility={outlineAccessibility}>
      <SortableContext items={sections.map(section => sectionSortId(section.id))} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sections.map(section => {
            const sectionFields = orderedFields.filter(field => field.sectionId === section.id);
            return (
              <OutlineSection key={section.id} section={section}>
                <SortableContext items={sectionFields.map(field => field.id)} strategy={verticalListSortingStrategy}>
                  {sectionFields.map(field => (
                    <OutlineFieldRow
                      key={field.id}
                      field={field}
                      number={fieldNumberById.get(field.id) ?? 1}
                      itemLabel={itemLabel}
                    />
                  ))}
                </SortableContext>
              </OutlineSection>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default FormOutlineSorter;
