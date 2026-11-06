import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import { mobileSheetActionClass } from '../../components/ui/mobileSheetActionStyles';
import type { ClassInfo } from '../../types';
import { VENDING_EXCHANGE_STATUS_LABELS, type VendingExchangeFilter } from '../../domain/vendingExchange';

export type VendingMoreFilter = Pick<VendingExchangeFilter, 'gradeName' | 'classId' | 'terminalDeviceId' | 'status'>;
export const EMPTY_VENDING_MORE_FILTER: VendingMoreFilter = { gradeName: '', classId: '', terminalDeviceId: '', status: '' };

interface Props {
  open: boolean;
  value: VendingMoreFilter;
  classes: readonly ClassInfo[];
  terminals: { value: string; label: string }[];
  onClose: () => void;
  onConfirm: (filter: VendingMoreFilter) => void;
}

const FilterField = ({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void;
}) => (
  <label className="flex min-h-12 items-center gap-4 border-b border-[var(--tm-border-subtle)] py-2 text-[length:var(--tm-font-size-body)] font-medium">
    <span className="shrink-0 text-[var(--tm-text-secondary)]">{label}</span>
    <span className="relative ml-auto min-w-0 flex-1">
      <select value={value} onChange={event => onChange(event.target.value)} className="min-h-[var(--tm-size-touch)] w-full appearance-none bg-transparent pl-2 pr-6 text-right text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
    </span>
  </label>
);

export default function VendingExchangeFilterSheet({ open, value, classes, terminals, onClose, onConfirm }: Props) {
  const [draft, setDraft] = useState<VendingMoreFilter>(value);
  useEffect(() => {
    if (open) setDraft({ ...value });
    // 打开时读取已生效条件；面板内修改先暂存，关闭不提交。
  }, [open]);
  const grades = [...new Set(classes.map(item => item.gradeLevel))];
  const availableClasses = classes.filter(item => !draft.gradeName || item.gradeLevel === draft.gradeName);
  return (
    <MobileBottomSheet open={open} title="筛选兑换记录" onClose={onClose} footer={
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <button type="button" onClick={() => setDraft({ ...EMPTY_VENDING_MORE_FILTER })} className={`${mobileSheetActionClass} bg-[var(--tm-bg-surface-soft)] font-medium text-[var(--tm-text-secondary)]`}>重置</button>
        <button type="button" onClick={() => { onConfirm(draft); onClose(); }} className={`${mobileSheetActionClass} bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)]`}>查看结果</button>
      </div>
    }>
      <div className="pb-4">
        <FilterField label="年级" value={draft.gradeName} options={[{ value: '', label: '全部年级' }, ...grades.map(grade => ({ value: grade, label: grade }))]} onChange={gradeName => setDraft(current => ({ ...current, gradeName, classId: '' }))} />
        <FilterField label="班级" value={draft.classId} options={[{ value: '', label: '全部班级' }, ...availableClasses.map(item => ({ value: item.id, label: `${item.gradeLevel} · ${item.name}` }))]} onChange={classId => setDraft(current => ({ ...current, classId, gradeName: classes.find(item => item.id === classId)?.gradeLevel ?? current.gradeName }))} />
        <FilterField label="终端设备名称" value={draft.terminalDeviceId} options={[{ value: '', label: '全部终端设备' }, ...terminals]} onChange={terminalDeviceId => setDraft(current => ({ ...current, terminalDeviceId }))} />
        <FilterField label="兑换状态" value={draft.status} options={[{ value: '', label: '全部状态' }, ...Object.entries(VENDING_EXCHANGE_STATUS_LABELS).map(([value, label]) => ({ value, label }))]} onChange={status => setDraft(current => ({ ...current, status: status as VendingMoreFilter['status'] }))} />
      </div>
    </MobileBottomSheet>
  );
}
