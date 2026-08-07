import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ClipboardCheck,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Ruler,
} from 'lucide-react';
import {
  calculateBmi,
  saveStudentGrowthDataRecord,
  type StudentGrowthDataInput,
  type StudentGrowthDataRecord,
  type StudentGrowthFieldValue,
} from '../../../shared/studentGrowthStore';
import {
  formatGrowthFieldValue,
  getGrowthFieldDefinition,
  type GrowthFieldDefinition,
  type GrowthInputFieldKey,
} from '../../../shared/studentGrowthFieldCatalog';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import {
  BottomAction,
  PageHeader,
  inputClass,
  primaryButton,
  secondaryButton,
  sectionSurface,
} from '../archive-design/archivePagePrimitives';

type PageMode = 'list' | 'detail' | 'form';

interface StudentBodyMeasurementsViewProps {
  studentId: string;
  studentName: string;
  records: StudentGrowthDataRecord[];
  canEdit: boolean;
  operator: string;
  onBack: () => void;
  onSaved: () => void;
}

type GrowthDataErrors = Partial<Record<'recordedAt' | 'values', string>> & Partial<Record<GrowthInputFieldKey, string>>;

const today = () => {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyInput = (): StudentGrowthDataInput => ({
  recordedAt: today(),
  values: {},
  sourceRecordId: `mobile-growth-${Date.now()}`,
  sourceLabel: '教师手机端新增',
  sourceType: 'mobile-entry',
});

const recordToInput = (record: StudentGrowthDataRecord): StudentGrowthDataInput => ({
  recordedAt: record.recordedAt,
  values: { ...record.values },
  sourceRecordId: record.sourceRecordId,
  sourceLabel: record.sourceLabel,
  sourceType: record.sourceType,
});

const fieldLabelClass = 'mb-2 block text-[13px] font-semibold text-[var(--tm-text-secondary)]';
const metricIconClass = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]';
const BODY_GROWTH_FIELD_KEYS: GrowthInputFieldKey[] = ['height_cm', 'weight_kg'];
const bodyGrowthFields = BODY_GROWTH_FIELD_KEYS
  .map(key => getGrowthFieldDefinition(key))
  .filter((item): item is GrowthFieldDefinition => Boolean(item));

const sourceIcon = (sourceType: StudentGrowthDataRecord['sourceType']) => {
  if (sourceType === 'growth-collection') return <ClipboardCheck className="h-4.5 w-4.5" />;
  if (sourceType === 'health-exam' || sourceType === 'pc-import') return <History className="h-4.5 w-4.5" />;
  return <Plus className="h-4.5 w-4.5" />;
};

const getRecordDefinitions = (record: StudentGrowthDataRecord) => (
  BODY_GROWTH_FIELD_KEYS
    .filter(key => record.values[key] !== undefined && record.values[key] !== '')
    .map(key => getGrowthFieldDefinition(key))
    .filter((item): item is GrowthFieldDefinition => Boolean(item))
);

const recordSummary = (record: StudentGrowthDataRecord) => {
  const values = getRecordDefinitions(record).flatMap(definition => {
    const value = record.values[definition.key];
    return value === undefined ? [] : [`${definition.label} ${formatGrowthFieldValue(definition, value)}`];
  });
  const bmi = calculateBmi(Number(record.values.height_cm), Number(record.values.weight_kg));
  return [...values, ...(bmi === undefined ? [] : [`BMI ${bmi}`])].join(' · ');
};

const StudentBodyMeasurementsView: React.FC<StudentBodyMeasurementsViewProps> = ({
  studentId,
  studentName,
  records,
  canEdit,
  operator,
  onBack,
  onSaved,
}) => {
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [localRecords, setLocalRecords] = useState(records);
  const [activeRecordId, setActiveRecordId] = useState(records[0]?.id ?? '');
  const [formValue, setFormValue] = useState<StudentGrowthDataInput>(emptyInput);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<GrowthInputFieldKey[]>([]);
  const [errors, setErrors] = useState<GrowthDataErrors>({});
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showRecordMenu, setShowRecordMenu] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLocalRecords(records);
    if (!activeRecordId && records[0]) setActiveRecordId(records[0].id);
  }, [activeRecordId, records]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const sortedRecords = useMemo(() => (
    [...localRecords]
      .filter(record => getRecordDefinitions(record).length > 0)
      .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))
  ), [localRecords]);
  const activeRecord = sortedRecords.find(record => record.id === activeRecordId) ?? sortedRecords[0];
  const latestMetrics: Array<{ key: string; label: string; formattedValue: string; recordedAt: string }> = bodyGrowthFields.flatMap(definition => {
    const record = sortedRecords.find(item => item.values[definition.key] !== undefined && item.values[definition.key] !== '');
    const value = record?.values[definition.key];
    return value === undefined ? [] : [{ key: definition.key, label: definition.label, formattedValue: formatGrowthFieldValue(definition, value), recordedAt: record.recordedAt }];
  });
  const latestBmiRecord = sortedRecords.find(record => calculateBmi(Number(record.values.height_cm), Number(record.values.weight_kg)) !== undefined);
  const latestBmi = latestBmiRecord ? calculateBmi(Number(latestBmiRecord.values.height_cm), Number(latestBmiRecord.values.weight_kg)) : undefined;
  if (latestBmiRecord && latestBmi !== undefined) {
    latestMetrics.push({ key: 'bmi', label: 'BMI', formattedValue: String(latestBmi), recordedAt: latestBmiRecord.recordedAt });
  }
  const selectedDefinitions = selectedFieldKeys
    .map(key => getGrowthFieldDefinition(key))
    .filter((item): item is GrowthFieldDefinition => Boolean(item));

  const openCreate = () => {
    setFormValue(emptyInput());
    setSelectedFieldKeys(BODY_GROWTH_FIELD_KEYS);
    setErrors({});
    setShowCreateSheet(true);
  };

  const openEdit = () => {
    if (!activeRecord) return;
    setFormValue(recordToInput(activeRecord));
    setSelectedFieldKeys(getRecordDefinitions(activeRecord).map(item => item.key));
    setErrors({});
    setShowRecordMenu(false);
    setPageMode('form');
  };

  const updateValue = (key: GrowthInputFieldKey, value: StudentGrowthFieldValue | '') => {
    setFormValue(current => ({
      ...current,
      values: { ...current.values, [key]: value },
    }));
    setErrors(current => ({ ...current, [key]: undefined, values: undefined }));
  };

  const saveRecord = () => {
    const nextErrors: GrowthDataErrors = {};
    if (!formValue.recordedAt) nextErrors.recordedAt = '请选择记录日期';
    const filledValues = selectedDefinitions.filter(definition => {
      const value = formValue.values[definition.key];
      return value !== undefined && value !== '';
    });
    if (filledValues.length === 0) nextErrors.values = '请至少填写一项成长数据';
    selectedDefinitions.forEach(definition => {
      const value = formValue.values[definition.key];
      if (value === undefined || value === '' || definition.valueType !== 'number') return;
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue)) nextErrors[definition.key] = '请输入有效数值';
      else if (definition.minValue !== undefined && numberValue < definition.minValue || definition.maxValue !== undefined && numberValue > definition.maxValue) {
        nextErrors[definition.key] = `请输入${definition.minValue ?? ''}至${definition.maxValue ?? ''}${definition.unit ?? ''}`;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const existingRecord = localRecords.find(record => record.sourceRecordId === formValue.sourceRecordId);
    const isEditing = Boolean(existingRecord);
    const preservedValues = Object.fromEntries(
      Object.entries(existingRecord?.values ?? {}).filter(([key]) => !BODY_GROWTH_FIELD_KEYS.includes(key as GrowthInputFieldKey)),
    );
    const saved = saveStudentGrowthDataRecord(studentId, {
      ...formValue,
      values: {
        ...preservedValues,
        ...Object.fromEntries(selectedFieldKeys.flatMap(key => {
          const value = formValue.values[key];
          return value === undefined || value === '' ? [] : [[key, value]];
        })),
      },
    }, operator);
    setLocalRecords(current => [saved, ...current.filter(record => record.id !== saved.id)]);
    setActiveRecordId(saved.id);
    if (isEditing) setPageMode('detail');
    else {
      setShowCreateSheet(false);
      setPageMode('list');
    }
    setToast(isEditing ? '本次记录已修正' : '成长数据已保存');
    onSaved();
  };

  const renderFieldInput = (definition: GrowthFieldDefinition) => {
    const value = formValue.values[definition.key] ?? '';
    if (definition.valueType === 'single-select') {
      return (
        <select value={String(value)} onChange={event => updateValue(definition.key, event.target.value)} className={`${inputClass} h-[52px]`}>
          <option value="">请选择</option>
          {definition.options?.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    if (definition.valueType === 'text') {
      return <textarea value={String(value)} onChange={event => updateValue(definition.key, event.target.value)} className={`${inputClass} min-h-[88px] resize-none py-3`} placeholder="请输入" />;
    }
    return <input type="number" inputMode="decimal" step={definition.decimalPlaces === 2 ? '0.01' : definition.decimalPlaces === 1 ? '0.1' : '1'} value={value} onChange={event => updateValue(definition.key, event.target.value === '' ? '' : Number(event.target.value))} className={`${inputClass} h-[52px]`} placeholder="请输入" />;
  };

  const currentHeight = formValue.values.height_cm === undefined || formValue.values.height_cm === '' ? undefined : Number(formValue.values.height_cm);
  const currentWeight = formValue.values.weight_kg === undefined || formValue.values.weight_kg === '' ? undefined : Number(formValue.values.weight_kg);
  const currentBmi = calculateBmi(currentHeight, currentWeight);
  const hasGrowthValue = currentHeight !== undefined || currentWeight !== undefined;
  const canSave = Boolean(formValue.recordedAt && hasGrowthValue);
  const renderGrowthFormFields = () => (
    <div className="space-y-5">
      <label>
        <span className={fieldLabelClass}>记录日期</span>
        <input type="date" value={formValue.recordedAt} onChange={event => { setFormValue(current => ({ ...current, recordedAt: event.target.value })); setErrors(current => ({ ...current, recordedAt: undefined })); }} className={`${inputClass} h-[52px]`} />
        {errors.recordedAt && <span className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{errors.recordedAt}</span>}
      </label>
      {selectedDefinitions.map(definition => (
        <label key={definition.key}>
          <span className={fieldLabelClass}>{definition.label}{definition.unit ? `（${definition.unit}）` : ''}</span>
          {renderFieldInput(definition)}
          {errors[definition.key] && <span className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{errors[definition.key]}</span>}
        </label>
      ))}
      {errors.values && <p className="text-xs font-medium text-[var(--tm-status-negative-strong)]">{errors.values}</p>}
      {currentBmi !== undefined && (
        <div className="flex min-h-[52px] items-center justify-between border-t border-[var(--tm-border-subtle)] pt-4">
          <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">BMI</span>
          <span className="text-[18px] font-bold tabular-nums text-[var(--tm-text-primary)]">{currentBmi}</span>
        </div>
      )}
    </div>
  );

  if (pageMode === 'form') {
    const isEditing = localRecords.some(record => record.sourceRecordId === formValue.sourceRecordId);
    return (
      <div className="relative flex h-full min-h-0 flex-col bg-transparent">
        <PageHeader title={isEditing ? '修正成长数据' : '新增成长数据'} onBack={() => setPageMode(isEditing ? 'detail' : 'list')} />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-3 no-scrollbar">
          <section className={`${sectionSurface} p-4`}>{renderGrowthFormFields()}</section>
        </div>
        <BottomAction>
          <div className="grid grid-cols-[112px_1fr] gap-2">
            <button type="button" className={secondaryButton} onClick={() => setPageMode(isEditing ? 'detail' : 'list')}>取消</button>
            <button type="button" className={primaryButton} onClick={saveRecord}>{isEditing ? '保存修正' : '保存记录'}</button>
          </div>
        </BottomAction>
      </div>
    );
  }

  if (pageMode === 'detail' && activeRecord) {
    return (
      <div className="relative flex h-full min-h-0 flex-col bg-transparent">
        <PageHeader title="成长数据详情" onBack={() => setPageMode('list')} />
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-3 no-scrollbar">
          <section className={`${sectionSurface} overflow-hidden`}>
            <div className="flex items-start justify-between px-4 pb-3 pt-4">
              <div><h2 className="text-[17px] font-bold text-[var(--tm-text-primary)]">{activeRecord.recordedAt}</h2><p className="mt-1 text-xs font-medium text-[var(--tm-text-tertiary)]">{activeRecord.sourceLabel}</p></div>
              {canEdit && <button type="button" onClick={() => setShowRecordMenu(true)} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="成长数据操作"><MoreHorizontal className="h-5 w-5" /></button>}
            </div>
            <div className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] px-4">
              {getRecordDefinitions(activeRecord).map(definition => {
                const value = activeRecord.values[definition.key];
                if (value === undefined) return null;
                return <div key={definition.key} className="flex min-h-[52px] items-center justify-between gap-4"><span className="text-[13px] text-[var(--tm-text-secondary)]">{definition.label}</span><span className="text-right text-[14px] font-semibold text-[var(--tm-text-primary)]">{formatGrowthFieldValue(definition, value)}</span></div>;
              })}
              {calculateBmi(Number(activeRecord.values.height_cm), Number(activeRecord.values.weight_kg)) !== undefined && <div className="flex min-h-[52px] items-center justify-between gap-4"><span className="text-[13px] text-[var(--tm-text-secondary)]">BMI</span><span className="text-right text-[14px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{calculateBmi(Number(activeRecord.values.height_cm), Number(activeRecord.values.weight_kg))}</span></div>}
            </div>
          </section>
          <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
            <div className="flex min-h-[52px] items-center justify-between"><span className="text-[13px] text-[var(--tm-text-secondary)]">数据来源</span><span className="text-[13px] font-medium text-[var(--tm-text-primary)]">{activeRecord.sourceLabel}</span></div>
            <div className="flex min-h-[52px] items-center justify-between"><span className="text-[13px] text-[var(--tm-text-secondary)]">当前版本</span><span className="text-[13px] font-medium text-[var(--tm-text-primary)]">第{activeRecord.version}版</span></div>
          </section>
        </div>
        <MobileBottomSheet open={showRecordMenu} title="成长数据操作" onClose={() => setShowRecordMenu(false)}>
          <button type="button" onClick={openEdit} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-sm font-semibold text-[var(--tm-text-primary)]"><Pencil className="h-5 w-5 text-[var(--tm-text-tertiary)]" />修正本次记录</button>
          <button type="button" onClick={() => setShowRecordMenu(false)} className={`${secondaryButton} mt-4 w-full`}>取消</button>
        </MobileBottomSheet>
        {toast && <div className="pointer-events-none absolute inset-x-5 bottom-6 z-[70] rounded-[var(--tm-radius-inner)] bg-[var(--tm-text-primary)] px-4 py-3 text-center text-[13px] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-transparent">
      <PageHeader title="成长数据" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-3 no-scrollbar">
        {sortedRecords.length > 0 ? (
          <>
            <section className={`${sectionSurface} overflow-hidden`}>
              <div className="flex items-center justify-between px-4 pb-3 pt-4"><div><h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">最近数据</h2><p className="mt-1 text-xs text-[var(--tm-text-tertiary)]">{studentName}</p></div><Ruler className="h-5 w-5 text-[var(--tm-status-positive)]" /></div>
              <div className={`grid border-t border-[var(--tm-border-subtle)] px-3 py-4 text-center ${latestMetrics.length === 1 ? 'grid-cols-1' : latestMetrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {latestMetrics.map(item => <div key={item.key} className="min-w-0 px-1"><div className="truncate text-[19px] font-bold tabular-nums text-[var(--tm-text-primary)]">{item.formattedValue}</div><div className="mt-1 truncate text-xs text-[var(--tm-text-secondary)]">{item.label}</div><div className="mt-1 text-[10px] text-[var(--tm-text-tertiary)]">{item.recordedAt.slice(5)}</div></div>)}
              </div>
            </section>
            <div className="mb-2 mt-5 flex min-h-11 items-center justify-between"><h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">历史记录</h2>{canEdit && <button type="button" onClick={openCreate} className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]"><Plus className="h-4 w-4" />新增记录</button>}</div>
            <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
              {sortedRecords.map(record => <button key={record.id} type="button" onClick={() => { setActiveRecordId(record.id); setPageMode('detail'); }} className="flex min-h-[76px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]"><span className={metricIconClass}>{sourceIcon(record.sourceType)}</span><span className="min-w-0 flex-1"><span className="block text-[14px] font-bold text-[var(--tm-text-primary)]">{record.recordedAt}</span><span className="mt-1 block truncate text-xs font-medium text-[var(--tm-text-secondary)]">{recordSummary(record)}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" /></button>)}
            </section>
          </>
        ) : (
          <section className={`${sectionSurface} px-5 py-10 text-center`}><Ruler className="mx-auto h-8 w-8 text-[var(--tm-text-tertiary)]" /><h2 className="mt-3 text-[16px] font-bold text-[var(--tm-text-primary)]">暂无成长数据</h2>{canEdit && <button type="button" className={`${primaryButton} mt-5`} onClick={openCreate}><Plus className="h-4 w-4" />新增记录</button>}</section>
        )}
      </div>

      <MobileBottomSheet
        open={showCreateSheet}
        title="新增成长数据"
        onClose={() => { setShowCreateSheet(false); setErrors({}); }}
        footer={<button type="button" disabled={!canSave} onClick={saveRecord} className={`${primaryButton} w-full disabled:opacity-40`}>保存记录</button>}
      >
        {renderGrowthFormFields()}
      </MobileBottomSheet>
      {toast && <div className="pointer-events-none absolute inset-x-5 bottom-6 z-[70] rounded-[var(--tm-radius-inner)] bg-[var(--tm-text-primary)] px-4 py-3 text-center text-[13px] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]">{toast}</div>}
    </div>
  );
};

export default StudentBodyMeasurementsView;
