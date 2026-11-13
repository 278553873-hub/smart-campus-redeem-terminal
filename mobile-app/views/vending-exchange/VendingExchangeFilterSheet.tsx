import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileCascadePicker from '../../components/ui/MobileCascadePicker';
import MobileClassCascadePicker from '../../components/ui/MobileClassCascadePicker';
import { MobileDropdownOptionList } from '../../components/ui/MobileFilterDropdown';
import PillSelectionControl from '../../components/ui/PillSelectionControl';
import { mobileSheetActionClass } from '../../components/ui/mobileSheetActionStyles';
import type { ClassInfo } from '../../types';
import { VENDING_EXCHANGE_STATUS_LABELS, type VendingExchangeFilter } from '../../domain/vendingExchange';

export type VendingMoreFilter = Pick<VendingExchangeFilter, 'terminalDeviceId' | 'status' | 'gradeName' | 'classId' | 'classIds' | 'categoryId' | 'productId' | 'productIds'>;
export const EMPTY_VENDING_MORE_FILTER: VendingMoreFilter = { terminalDeviceId: '', status: '', gradeName: '', classId: '', classIds: [], categoryId: '', productId: '', productIds: [] };
const moreFilterDraft = (value: VendingMoreFilter): VendingMoreFilter => ({
  terminalDeviceId: value.terminalDeviceId, status: value.status,
  gradeName: value.gradeName, classId: value.classId, categoryId: value.categoryId, productId: value.productId,
  classIds: [...(value.classIds ?? [])],
  productIds: [...(value.productIds ?? [])],
});

interface Props {
  open: boolean;
  value: VendingMoreFilter;
  terminals: readonly { value: string; label: string }[];
  classes: readonly ClassInfo[];
  categories: readonly { value: string; label: string; options: readonly { value: string; label: string }[] }[];
  onClose: () => void;
  onConfirm: (filter: VendingMoreFilter) => void;
}

type FilterPage = 'filters' | 'terminal' | 'product' | 'class';
type ChoicePage = Exclude<FilterPage, 'filters'>;
const titles: Record<FilterPage, string> = { filters: '筛选兑换记录', terminal: '选择货柜机', product: '选择商品', class: '选择班级' };
const statusOptions: { value: VendingMoreFilter['status']; label: string }[] = [
  { value: '', label: '全部状态' },
  ...Object.entries(VENDING_EXCHANGE_STATUS_LABELS).map(([value, label]) => ({ value: value as VendingMoreFilter['status'], label })),
];

function FilterEntry({ label, value, disabled, buttonRef, onClick }: {
  label: string; value: string; disabled?: boolean; buttonRef: (element: HTMLButtonElement | null) => void; onClick: () => void;
}) {
  return <button ref={buttonRef} type="button" disabled={disabled} onClick={onClick} aria-label={`${label}，${value}`} className="flex min-h-[var(--tm-size-touch)] w-full items-center gap-[var(--tm-space-3)] border-b border-[var(--tm-border-subtle)] py-[var(--tm-space-3)] text-left text-[length:var(--tm-font-size-body)] tm-font-regular text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] disabled:text-[var(--tm-text-secondary)]">
    <span className="shrink-0 text-[length:var(--tm-font-size-compact)] tm-font-regular text-[var(--tm-text-secondary)]">{label}</span>
    <span className="ml-auto min-w-0 break-words text-pretty text-right text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">{value}</span>
    <ChevronRight aria-hidden="true" className="h-[var(--tm-space-4)] w-[var(--tm-space-4)] shrink-0 text-[var(--tm-text-tertiary)]" />
  </button>;
}

/** 筛选与选择页共用一个弹窗；浏览分组不改草稿，点选范围或具体项后才回填。 */
export default function VendingExchangeFilterSheet({ open, value, terminals, classes, categories, onClose, onConfirm }: Props) {
  const [draft, setDraft] = useState<VendingMoreFilter>(() => moreFilterDraft(value));
  const [page, setPage] = useState<FilterPage>('filters');
  const [browsedGrade, setBrowsedGrade] = useState('');
  const [classSelection, setClassSelection] = useState<Set<string>>(() => new Set());
  const [productSelection, setProductSelection] = useState<Set<string>>(() => new Set());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const entryRefs = useRef<Partial<Record<ChoicePage, HTMLButtonElement | null>>>({});
  const previousPage = useRef<FilterPage>('filters');
  useEffect(() => {
    if (!open) return;
    setDraft(moreFilterDraft(value));
    setPage('filters');
    // 打开时读取已生效条件；选择页内仅暂存，关闭整个弹窗不提交。
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (page === 'filters' && previousPage.current !== 'filters') entryRefs.current[previousPage.current]?.focus({ preventScroll: true });
    else if (page !== 'filters') headingRef.current?.focus({ preventScroll: true });
    previousPage.current = page;
  }, [open, page]);

  const classGroups = useMemo(() => [...new Set(classes.map(item => item.gradeLevel))].map(grade => ({
    gradeLabel: grade, classes: classes.filter(item => item.gradeLevel === grade),
  })), [classes]);
  const products = useMemo(() => [...new Map(categories.flatMap(item => item.options).map(item => [item.value, item])).values()], [categories]);
  const selectedProducts = products.filter(item => draft.productIds.length ? draft.productIds.includes(item.value)
    : draft.productId ? item.value === draft.productId : draft.categoryId ? categories.find(group => group.value === draft.categoryId)?.options.some(option => option.value === item.value) : false);
  const selectedClasses = classes.filter(item => draft.classIds.length ? draft.classIds.includes(item.id)
    : draft.classId ? item.id === draft.classId : draft.gradeName ? item.gradeLevel === draft.gradeName : false);
  const productLabel = !selectedProducts.length || selectedProducts.length === products.length ? '全部商品'
    : selectedProducts.length === 1 ? selectedProducts[0].label : `已选${selectedProducts.length}件商品`;
  const classLabel = !selectedClasses.length || selectedClasses.length === classes.length ? '全部班级'
    : selectedClasses.length === 1 ? `${selectedClasses[0].gradeLevel} · ${selectedClasses[0].name}` : `已选${selectedClasses.length}个班级`;
  const select = (changes: Partial<VendingMoreFilter>) => {
    setDraft(current => ({ ...current, ...changes }));
    setPage('filters');
  };
  const title = titles[page];

  return <MobileBottomSheet open={open} title={title} onClose={onClose} contentInset="none" contentLayout={page === 'filters' ? 'scroll' : 'fill'} titleContent={page === 'filters' ? undefined : (
    <div className="-ml-[var(--tm-space-2)] flex h-full min-w-0 items-center">
      <button type="button" onClick={() => setPage('filters')} aria-label="返回筛选" className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"><ChevronLeft aria-hidden="true" className="h-[var(--tm-space-5)] w-[var(--tm-space-5)]" /></button>
      <h2 ref={headingRef} tabIndex={-1} className="min-w-0 truncate text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)] outline-none">{title}</h2>
    </div>
  )} footer={page === 'filters' ? (
    <div className="grid grid-cols-[1fr_2fr] gap-[var(--tm-space-3)]">
      <button type="button" onClick={() => { onConfirm(moreFilterDraft({ ...EMPTY_VENDING_MORE_FILTER, terminalDeviceId: terminals[0]?.value ?? '' })); onClose(); }} className={`${mobileSheetActionClass} bg-[var(--tm-bg-surface-soft)] tm-font-regular text-[var(--tm-text-secondary)]`}>重置</button>
      <button type="button" onClick={() => { onConfirm(moreFilterDraft(draft)); onClose(); }} className={`${mobileSheetActionClass} bg-[var(--tm-brand-primary)] [font-weight:var(--tm-font-weight-semibold)] text-[var(--tm-text-inverse)]`}>查看结果</button>
    </div>
  ) : page === 'class' || page === 'product' ? <button type="button" onClick={() => page === 'class'
    ? select({ gradeName: '', classId: '', classIds: classes.filter(item => classSelection.has(item.id)).map(item => item.id) })
    : select({ categoryId: '', productId: '', productIds: products.filter(item => productSelection.has(item.value)).map(item => item.value) })} className={`${mobileSheetActionClass} w-full bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)]`}>完成</button> : undefined}>
    {page === 'filters' ? <div className="px-[var(--tm-space-4)]">
      <FilterEntry label="货柜机" value={terminals.find(item => item.value === draft.terminalDeviceId)?.label ?? '暂无货柜机'} disabled={!terminals.length} buttonRef={element => { entryRefs.current.terminal = element; }} onClick={() => setPage('terminal')} />
      <div className="border-b border-[var(--tm-border-subtle)] py-[var(--tm-space-3)]">
        <p className="mb-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] tm-font-regular text-[var(--tm-text-secondary)]">兑换状态</p>
        <PillSelectionControl value={draft.status} items={statusOptions} onChange={status => setDraft(current => ({ ...current, status }))} ariaLabel="兑换状态" fullWidth />
      </div>
      <FilterEntry label="商品" value={productLabel} disabled={!categories.length} buttonRef={element => { entryRefs.current.product = element; }} onClick={() => { setProductSelection(new Set(selectedProducts.map(item => item.value))); setPage('product'); }} />
      <FilterEntry label="班级" value={classLabel} disabled={!classes.length} buttonRef={element => { entryRefs.current.class = element; }} onClick={() => { setBrowsedGrade(selectedClasses[0]?.gradeLevel || classGroups[0]?.gradeLabel || ''); setClassSelection(new Set(selectedClasses.map(item => item.id))); setPage('class'); }} />
    </div> : page === 'terminal' ? <div className="min-h-0 overflow-y-auto overscroll-contain no-scrollbar"><MobileDropdownOptionList value={draft.terminalDeviceId} options={terminals} onChange={terminalDeviceId => select({ terminalDeviceId })} /></div>
      : page === 'product' ? <div className="flex min-h-0 flex-col">
        <MobileCascadePicker selectionMode="multiple" groups={categories} initialGroupValue={categories.find(item => item.options.some(option => option.value === selectedProducts[0]?.value))?.value ?? ''} selectedValues={productSelection} onSelectionChange={setProductSelection} allGroupsLabel="全部" allOptionsLabel="全部商品" groupLabel="商品分类" optionLabel="商品" />
      </div> : <div className="flex min-h-0 flex-col">
        <div className="h-[var(--tm-cascade-content-height)] min-h-0">
          <MobileClassCascadePicker selectionMode="multiple" groups={[{ gradeLabel: '', displayLabel: '全部', classes: [] }, ...classGroups]} activeGrade={browsedGrade} onActiveGradeChange={setBrowsedGrade}
          showAllClassesOption allClassesGroupValue="" allClassesSelected={classes.length > 0 && classes.every(item => classSelection.has(item.id))}
          allClassesMixed={classSelection.size > 0 && !classes.every(item => classSelection.has(item.id))}
          onToggleAllClasses={() => setClassSelection(current => classes.every(item => current.has(item.id)) ? new Set() : new Set(classes.map(item => item.id)))}
          selectedClassIds={classSelection} onToggleClass={classId => setClassSelection(current => {
            const next = new Set(current);
            if (next.has(classId)) next.delete(classId); else next.add(classId);
            return next;
          })} onToggleGrade={classIds => setClassSelection(current => {
            const next = new Set(current);
            const allSelected = classIds.every(id => next.has(id));
            classIds.forEach(id => { if (allSelected) next.delete(id); else next.add(id); });
            return next;
          })} showEducationStagePrefix ariaLabel="筛选兑换记录的班级" />
        </div>
      </div>}
  </MobileBottomSheet>;
}
