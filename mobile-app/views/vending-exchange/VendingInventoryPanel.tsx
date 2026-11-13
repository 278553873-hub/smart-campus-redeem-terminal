import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MobileFilterDropdown, { MobileDropdownOptionList } from '../../components/ui/MobileFilterDropdown';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import { mobileFilterButtonClass, mobileFilterChevronClass } from '../../components/ui/mobileFilterStyles';
import { ASSETS } from '../../assets/images';
import { filterVendingInventory, type VendingCabinetInventory, type VendingInventoryStockFilter } from '../../domain/vendingInventory';
import VendingInventoryProductCard from './VendingInventoryProductCard';

const stockOptions: { value: VendingInventoryStockFilter; label: string }[] = [
  { value: 'all', label: '全部库存' },
  { value: 'available', label: '有库存' },
  { value: 'zero', label: '无库存' },
];

export default function VendingInventoryPanel({ cabinets, active = true }: { cabinets: readonly VendingCabinetInventory[]; active?: boolean }) {
  const [cabinetId, setCabinetId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockFilter, setStockFilter] = useState<VendingInventoryStockFilter>('all');
  const [dropdown, setDropdown] = useState<'cabinet' | 'category' | 'stock' | null>(null);
  const cabinetRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef<HTMLButtonElement>(null);
  const stockRef = useRef<HTMLButtonElement>(null);
  const dropdownId = useId();
  useEffect(() => { if (!active) setDropdown(null); }, [active]);
  const cabinet = cabinets.find(item => item.id === cabinetId) ?? cabinets[0];
  const categories = useMemo(() => [...new Map((cabinet?.products ?? []).map(item => [item.categoryId, { value: item.categoryId, label: item.categoryName }])).values()], [cabinet]);
  const products = filterVendingInventory(cabinet?.products ?? [], categoryId, stockFilter);
  const categoryLabel = categories.find(item => item.value === categoryId)?.label ?? '全部分类';
  const stockLabel = stockOptions.find(item => item.value === stockFilter)!.label;

  return <div className="flex min-h-0 flex-1 flex-col">
    <div role="group" aria-label="货柜与分类筛选" className="relative z-20 flex shrink-0 items-center gap-[var(--tm-space-3)] bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)]">
      <button ref={cabinetRef} type="button" onClick={() => setDropdown(current => current === 'cabinet' ? null : 'cabinet')} disabled={!cabinets.length} aria-label={`选择货柜，当前${cabinet?.name ?? '暂无货柜'}`} aria-haspopup="dialog" aria-controls={`${dropdownId}-cabinet`} aria-expanded={dropdown === 'cabinet'} className={`${mobileFilterButtonClass} flex-1 max-w-[var(--tm-filter-primary-width)]`}>
        <span className="min-w-0 truncate text-left">{cabinet?.name ?? '暂无货柜'}</span>
        <ChevronDown aria-hidden="true" className={mobileFilterChevronClass} />
      </button>
      <button ref={categoryRef} type="button" onClick={() => setDropdown(current => current === 'category' ? null : 'category')} disabled={!categories.length} aria-label={`商品分类，${categoryLabel}`} aria-haspopup="dialog" aria-controls={`${dropdownId}-category`} aria-expanded={dropdown === 'category'} className={`${mobileFilterButtonClass} flex-1 max-w-[var(--tm-filter-secondary-width)]`}>
        <span className="min-w-0 truncate text-left">{categoryLabel}</span><ChevronDown aria-hidden="true" className={mobileFilterChevronClass} />
      </button>
      <button ref={stockRef} type="button" onClick={() => setDropdown(current => current === 'stock' ? null : 'stock')} disabled={!cabinet} aria-label={`库存筛选，${stockLabel}`} aria-haspopup="dialog" aria-controls={`${dropdownId}-stock`} aria-expanded={dropdown === 'stock'} className={`${mobileFilterButtonClass} flex-1 max-w-[var(--tm-filter-secondary-width)]`}>
        <span className="min-w-0 truncate text-left">{stockLabel}</span><ChevronDown aria-hidden="true" className={mobileFilterChevronClass} />
      </button>
    </div>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div inert={Boolean(dropdown) || undefined} aria-hidden={Boolean(dropdown) || undefined} className="flex min-h-0 flex-1 flex-col px-[var(--tm-space-4)]">
        <div data-view-scroll-root={active ? '' : undefined} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[var(--tm-space-6)] no-scrollbar">
          {products.length ? <ul aria-label="货柜商品库存" className="space-y-[var(--tm-layout-list-gap-compact)]">
            {products.map(product => <li key={product.productId}><VendingInventoryProductCard product={product} /></li>)}
          </ul> : <div className="py-[var(--tm-space-8)]"><MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title={!cabinet ? '暂无货柜' : stockFilter !== 'all' ? '暂无符合条件的商品' : categoryId ? '该分类暂无商品' : '该货柜暂无商品'} /></div>}
        </div>
      </div>
      <MobileFilterDropdown open={dropdown !== null && active} id={`${dropdownId}-${dropdown}`} label={dropdown === 'cabinet' ? '选择货柜' : dropdown === 'stock' ? '库存筛选' : '商品分类'} triggerRef={dropdown === 'cabinet' ? cabinetRef : dropdown === 'stock' ? stockRef : categoryRef} onClose={() => setDropdown(null)}>
        {dropdown === 'cabinet' ? <MobileDropdownOptionList value={cabinet?.id ?? ''} options={cabinets.map(item => ({ value: item.id, label: item.name }))} onChange={id => { setCabinetId(id); setCategoryId(''); setDropdown(null); }} />
          : dropdown === 'stock' ? <MobileDropdownOptionList value={stockFilter} options={stockOptions} onChange={value => { setStockFilter(value as VendingInventoryStockFilter); setDropdown(null); }} />
          : <MobileDropdownOptionList value={categoryId} options={[{ value: '', label: '全部分类' }, ...categories]} onChange={id => { setCategoryId(id); setDropdown(null); }} />}
      </MobileFilterDropdown>
    </div>
  </div>;
}
