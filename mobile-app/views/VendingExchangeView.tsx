import React, { useMemo, useState } from 'react';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import type { ClassInfo } from '../types';
import type { VendingExchangeRecord } from '../domain/vendingExchange';
import type { VendingCabinetInventory } from '../domain/vendingInventory';
import VendingInventoryPanel from './vending-exchange/VendingInventoryPanel';
import VendingExchangeRecordsPanel from './vending-exchange/VendingExchangeRecordsPanel';

interface Props {
  schoolId: string;
  authorizedClasses: readonly ClassInfo[];
  cabinets?: readonly VendingCabinetInventory[];
  records: readonly VendingExchangeRecord[];
  onBack: () => void;
  today?: string;
}

const tabs = [{ value: 'inventory', label: '商品库存' }, { value: 'records', label: '兑换记录' }] as const;

export default function VendingExchangeView({ schoolId, authorizedClasses, cabinets = [], records, onBack, today }: Props) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'records'>('inventory');
  const schoolCabinets = useMemo(() => cabinets.filter(item => item.schoolId === schoolId), [cabinets, schoolId]);
  return <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
    <MobilePageHeader title="货柜兑换明细" onBack={onBack} />
    <ReportDateRangeTabs value={activeTab} items={tabs} onChange={setActiveTab} ariaLabel="货柜兑换内容" semantics="tabs" className="shrink-0" />
    <div role="tabpanel" aria-label="商品库存" hidden={activeTab !== 'inventory'} className={activeTab === 'inventory' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
      <VendingInventoryPanel key={schoolId} cabinets={schoolCabinets} active={activeTab === 'inventory'} />
    </div>
    <div role="tabpanel" aria-label="兑换记录" hidden={activeTab !== 'records'} className={activeTab === 'records' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
      <VendingExchangeRecordsPanel key={schoolId} schoolId={schoolId} authorizedClasses={authorizedClasses} cabinets={schoolCabinets} records={records} today={today} active={activeTab === 'records'} />
    </div>
  </div>;
}
