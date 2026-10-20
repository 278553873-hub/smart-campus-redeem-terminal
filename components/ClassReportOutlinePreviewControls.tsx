import React from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { CLASS_REPORT_SECTIONS, toggleClassReportSection, type ClassReportOutlineItem } from '../shared/classReportOutline';

const labels = new Map(CLASS_REPORT_SECTIONS.map(item => [item.id, item.label]));
const actionClass = 'flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500';
function OutlineRow({ item, onToggle }: {
  item: ClassReportOutlineItem;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const label = labels.get(item.id);
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 1 : undefined }}
      className={`flex min-h-10 items-center rounded-lg bg-white ${isDragging ? 'shadow-md' : ''}`}>
      <button type="button" {...attributes} {...listeners} aria-label={`拖动排序：${label}`} className={`${actionClass} touch-none cursor-grab`}>
        <GripVertical aria-hidden="true" className="h-4 w-4" />
      </button>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 text-[12px] text-slate-700">
        <input type="checkbox" checked={item.visible} onChange={onToggle} className="h-3.5 w-3.5 accent-slate-700" />
        <span className={item.visible ? '' : 'text-slate-400'}>{label}</span>
      </label>
    </li>
  );
}
export default function ClassReportOutlinePreviewControls({ value, onChange }: {
  value: ClassReportOutlineItem[]; onChange: (value: ClassReportOutlineItem[]) => void;
}) {
  const selected = value.filter(item => item.visible);
  const available = value.filter(item => !item.visible);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const move = (from: number, to: number) => {
    if (from < 0 || to < 0 || from >= selected.length || to >= selected.length || from === to) return;
    onChange([...arrayMove(selected, from, to), ...available]);
  };
  return (
    <>
      <h3 className="mb-2 pl-1 text-[11px] font-bold text-slate-500">班级报告大纲</h3>
      <div className="space-y-3">
        <section aria-label="已选板块">
          <h4 className="mb-1 pl-1 text-[11px] font-medium text-slate-500">已选板块（{selected.length}）</h4>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
            if (!over) return;
            move(selected.findIndex(item => item.id === active.id), selected.findIndex(item => item.id === over.id));
          }} accessibility={{ screenReaderInstructions: { draggable: '按空格键选中板块，使用上下方向键调整顺序，再按空格键确认，按 Escape 键取消。' } }}>
            <SortableContext items={selected.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <ol aria-label="已选板块顺序" className="space-y-0.5">
                {selected.map(item => <OutlineRow key={item.id} item={item}
                  onToggle={() => onChange(toggleClassReportSection(value, item.id))} />)}
              </ol>
            </SortableContext>
          </DndContext>
          {selected.length === 0 && <p className="px-1 py-2 text-[11px] text-slate-400">从下方勾选要展示的板块</p>}
        </section>
        <section aria-label="可选板块" className="border-t border-slate-100 pt-2">
          <h4 className="mb-1 pl-1 text-[11px] font-medium text-slate-500">可选板块（{available.length}）</h4>
          <ul className="space-y-0.5">
            {available.map(item => (
              <li key={item.id}>
                <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-[12px] text-slate-500 hover:bg-slate-50">
                  <input type="checkbox" checked={false} onChange={() => onChange(toggleClassReportSection(value, item.id))} className="h-3.5 w-3.5 accent-slate-700" />
                  <span>{labels.get(item.id)}</span>
                </label>
              </li>
            ))}
          </ul>
          {available.length === 0 && <p className="px-1 py-2 text-[11px] text-slate-400">全部板块已选</p>}
        </section>
      </div>
    </>
  );
}
