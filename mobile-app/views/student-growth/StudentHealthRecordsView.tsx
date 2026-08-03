import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ChevronRight,
  CircleAlert,
  Eye,
  HeartPulse,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Ruler,
  Scale,
} from 'lucide-react';
import type { HealthExamInput, HealthExamRecord } from '../../../shared/studentGrowthStore';
import {
  calculateBmi,
  saveHealthExamRecord,
  validateHealthExamInput,
} from '../../../shared/studentGrowthStore';
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

interface StudentHealthRecordsViewProps {
  studentId: string;
  studentName: string;
  records: HealthExamRecord[];
  canEdit: boolean;
  operator: string;
  onBack: () => void;
  onSaved: () => void;
}

const emptyInput = (): HealthExamInput => ({
  examDate: new Date().toISOString().slice(0, 10),
  heightCm: 0,
  weightKg: 0,
  nakedVisionLeft: '',
  nakedVisionRight: '',
  correctedVisionLeft: '',
  correctedVisionRight: '',
  glassesType: '不戴镜',
  conclusion: '',
});

const recordToInput = (record: HealthExamRecord): HealthExamInput => ({
  id: record.id,
  examDate: record.examDate,
  heightCm: record.heightCm,
  weightKg: record.weightKg,
  nakedVisionLeft: record.nakedVisionLeft,
  nakedVisionRight: record.nakedVisionRight,
  correctedVisionLeft: record.correctedVisionLeft,
  correctedVisionRight: record.correctedVisionRight,
  glassesType: record.glassesType,
  conclusion: record.conclusion,
});

const fieldLabelClass = 'mb-2 block text-[13px] font-semibold text-[var(--tm-text-secondary)]';
const metricIconClass = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]';

const StudentHealthRecordsView: React.FC<StudentHealthRecordsViewProps> = ({
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
  const [formValue, setFormValue] = useState<HealthExamInput>(emptyInput);
  const [errors, setErrors] = useState<Partial<Record<keyof HealthExamInput, string>>>({});
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
    [...localRecords].sort((left, right) => right.examDate.localeCompare(left.examDate))
  ), [localRecords]);
  const activeRecord = sortedRecords.find(record => record.id === activeRecordId) ?? sortedRecords[0];
  const latestRecord = sortedRecords[0];
  const previousRecord = sortedRecords[1];
  const heightDelta = latestRecord && previousRecord ? Number((latestRecord.heightCm - previousRecord.heightCm).toFixed(1)) : null;
  const weightDelta = latestRecord && previousRecord ? Number((latestRecord.weightKg - previousRecord.weightKg).toFixed(1)) : null;
  const currentBmi = calculateBmi(Number(formValue.heightCm), Number(formValue.weightKg));

  const openRecord = (record: HealthExamRecord) => {
    setActiveRecordId(record.id);
    setPageMode('detail');
  };

  const openCreate = () => {
    setFormValue(emptyInput());
    setErrors({});
    setPageMode('form');
  };

  const openEdit = () => {
    if (!activeRecord) return;
    setFormValue(recordToInput(activeRecord));
    setErrors({});
    setShowRecordMenu(false);
    setPageMode('form');
  };

  const saveRecord = () => {
    const nextErrors = validateHealthExamInput(studentId, formValue, localRecords);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const saved = saveHealthExamRecord(studentId, formValue, operator);
    setLocalRecords(current => [saved, ...current.filter(record => record.id !== saved.id)]);
    setActiveRecordId(saved.id);
    setPageMode('detail');
    setToast(formValue.id ? '体检记录已修正' : '新测量已保存');
    onSaved();
  };

  const updateNumber = (field: 'heightCm' | 'weightKg', value: string) => {
    setFormValue(current => ({ ...current, [field]: value === '' ? 0 : Number(value) }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  if (pageMode === 'form') {
    const isEditing = Boolean(formValue.id);
    return (
      <div className="relative flex h-full min-h-0 flex-col bg-transparent">
        <PageHeader title={isEditing ? '修正体检记录' : '新增测量'} onBack={() => setPageMode(isEditing ? 'detail' : 'list')} />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-3 no-scrollbar">
          <section className={`${sectionSurface} space-y-5 p-4`}>
            <label>
              <span className={fieldLabelClass}>测量日期</span>
              <input type="date" value={formValue.examDate} onChange={event => { setFormValue(current => ({ ...current, examDate: event.target.value })); setErrors(current => ({ ...current, examDate: undefined })); }} className={`${inputClass} h-[52px]`} />
              {errors.examDate && <span className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{errors.examDate}</span>}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={fieldLabelClass}>身高（厘米）</span>
                <input type="number" inputMode="decimal" step="0.1" value={formValue.heightCm || ''} onChange={event => updateNumber('heightCm', event.target.value)} className={`${inputClass} h-[52px]`} placeholder="请输入" />
                {errors.heightCm && <span className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{errors.heightCm}</span>}
              </label>
              <label>
                <span className={fieldLabelClass}>体重（千克）</span>
                <input type="number" inputMode="decimal" step="0.1" value={formValue.weightKg || ''} onChange={event => updateNumber('weightKg', event.target.value)} className={`${inputClass} h-[52px]`} placeholder="请输入" />
                {errors.weightKg && <span className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{errors.weightKg}</span>}
              </label>
            </div>

            <div className="flex min-h-[52px] items-center justify-between rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3.5">
              <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">身体质量指数</span>
              <span className="text-[16px] font-bold tabular-nums text-[var(--tm-text-primary)]">{currentBmi || '--'}</span>
            </div>

            <div>
              <span className={fieldLabelClass}>裸眼视力</span>
              <div className="grid grid-cols-2 gap-3">
                <input aria-label="左眼裸眼视力" value={formValue.nakedVisionLeft} onChange={event => setFormValue(current => ({ ...current, nakedVisionLeft: event.target.value }))} className={`${inputClass} h-[52px]`} placeholder="左眼" />
                <input aria-label="右眼裸眼视力" value={formValue.nakedVisionRight} onChange={event => setFormValue(current => ({ ...current, nakedVisionRight: event.target.value }))} className={`${inputClass} h-[52px]`} placeholder="右眼" />
              </div>
            </div>

            <div>
              <span className={fieldLabelClass}>矫正视力</span>
              <div className="grid grid-cols-2 gap-3">
                <input aria-label="左眼矫正视力" value={formValue.correctedVisionLeft} onChange={event => setFormValue(current => ({ ...current, correctedVisionLeft: event.target.value }))} className={`${inputClass} h-[52px]`} placeholder="左眼" />
                <input aria-label="右眼矫正视力" value={formValue.correctedVisionRight} onChange={event => setFormValue(current => ({ ...current, correctedVisionRight: event.target.value }))} className={`${inputClass} h-[52px]`} placeholder="右眼" />
              </div>
            </div>

            <label>
              <span className={fieldLabelClass}>戴镜类型</span>
              <select value={formValue.glassesType} onChange={event => setFormValue(current => ({ ...current, glassesType: event.target.value as HealthExamInput['glassesType'] }))} className={`${inputClass} h-[52px] appearance-none`}>
                <option value="不戴镜">不戴镜</option>
                <option value="框架眼镜">框架眼镜</option>
                <option value="夜戴角膜塑形镜">夜戴角膜塑形镜</option>
              </select>
            </label>

            <label>
              <span className={fieldLabelClass}>体检结论</span>
              <textarea value={formValue.conclusion} onChange={event => setFormValue(current => ({ ...current, conclusion: event.target.value }))} className={`${inputClass} min-h-[112px] resize-none py-3 leading-6`} placeholder="请输入体检结论" />
            </label>
          </section>
        </div>
        <BottomAction>
          <div className="grid grid-cols-[112px_1fr] gap-2">
            <button type="button" className={secondaryButton} onClick={() => setPageMode(isEditing ? 'detail' : 'list')}>取消</button>
            <button type="button" className={primaryButton} onClick={saveRecord}>{isEditing ? '保存修正' : '保存新记录'}</button>
          </div>
        </BottomAction>
      </div>
    );
  }

  if (pageMode === 'detail' && activeRecord) {
    return (
      <div className="relative flex h-full min-h-0 flex-col bg-transparent">
        <PageHeader title="体检记录详情" onBack={() => setPageMode('list')} />
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-3 no-scrollbar">
          <section className={`${sectionSurface} overflow-hidden`}>
            <div className="flex items-start justify-between px-4 pb-3 pt-4">
              <div>
                <h2 className="text-[17px] font-bold text-[var(--tm-text-primary)]">{activeRecord.examDate}</h2>
                <p className="mt-1 text-xs font-medium text-[var(--tm-text-tertiary)]">{activeRecord.sourceLabel}</p>
              </div>
              {canEdit && (
                <button type="button" onClick={() => setShowRecordMenu(true)} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="体检记录操作">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 border-t border-[var(--tm-border-subtle)] px-3 py-4 text-center">
              <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{activeRecord.heightCm}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">身高（厘米）</div></div>
              <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{activeRecord.weightKg}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">体重（千克）</div></div>
              <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{activeRecord.bmi}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">身体质量指数</div></div>
            </div>
          </section>

          <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
            <div className="flex min-h-[58px] items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold text-[var(--tm-text-secondary)]"><Eye className="h-4 w-4" />裸眼视力</span><span className="text-sm font-bold text-[var(--tm-text-primary)]">左 {activeRecord.nakedVisionLeft || '--'} · 右 {activeRecord.nakedVisionRight || '--'}</span></div>
            <div className="flex min-h-[58px] items-center justify-between"><span className="text-sm font-semibold text-[var(--tm-text-secondary)]">矫正视力</span><span className="text-sm font-bold text-[var(--tm-text-primary)]">左 {activeRecord.correctedVisionLeft || '--'} · 右 {activeRecord.correctedVisionRight || '--'}</span></div>
            <div className="flex min-h-[58px] items-center justify-between"><span className="text-sm font-semibold text-[var(--tm-text-secondary)]">戴镜类型</span><span className="text-sm font-bold text-[var(--tm-text-primary)]">{activeRecord.glassesType}</span></div>
          </section>

          <section className={`${sectionSurface} p-4`}>
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-[var(--tm-text-primary)]"><HeartPulse className="h-4.5 w-4.5 text-[var(--tm-status-positive)]" />体检结论</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-[var(--tm-text-secondary)]">{activeRecord.conclusion || '未填写'}</p>
            {activeRecord.conclusionTags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{activeRecord.conclusionTags.map(tag => <span key={tag} className="rounded-full bg-[var(--tm-brand-reward-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--tm-brand-reward-strong)]">{tag}</span>)}</div>}
          </section>

          <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
            <div className="flex min-h-[52px] items-center justify-between"><span className="text-[13px] text-[var(--tm-text-secondary)]">最近更新</span><span className="text-[13px] font-medium text-[var(--tm-text-primary)]">{activeRecord.updatedAt}</span></div>
            <div className="flex min-h-[52px] items-center justify-between"><span className="text-[13px] text-[var(--tm-text-secondary)]">修正次数</span><span className="text-[13px] font-medium text-[var(--tm-text-primary)]">{activeRecord.corrections.length}次</span></div>
          </section>
        </div>

        <MobileBottomSheet open={showRecordMenu} title="体检记录操作" onClose={() => setShowRecordMenu(false)}>
          <button type="button" onClick={openEdit} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-sm font-semibold text-[var(--tm-text-primary)]">
            <Pencil className="h-5 w-5 text-[var(--tm-text-tertiary)]" />修正本次记录
          </button>
          <button type="button" onClick={() => setShowRecordMenu(false)} className={`${secondaryButton} mt-4 w-full`}>取消</button>
        </MobileBottomSheet>
        {toast && <div className="pointer-events-none absolute inset-x-5 bottom-6 z-[70] rounded-[var(--tm-radius-inner)] bg-[var(--tm-text-primary)] px-4 py-3 text-center text-[13px] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-transparent">
      <PageHeader title="体检记录" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-3 no-scrollbar">
        {latestRecord ? (
          <>
            <section className={`${sectionSurface} overflow-hidden`}>
              <div className="flex items-center justify-between px-4 pb-3 pt-4">
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">身体成长</h2>
                  <p className="mt-1 text-xs text-[var(--tm-text-tertiary)]">{studentName} · 最近测量 {latestRecord.examDate}</p>
                </div>
                <Activity className="h-5 w-5 text-[var(--tm-status-positive)]" />
              </div>
              <div className="grid grid-cols-3 border-t border-[var(--tm-border-subtle)] px-3 py-4 text-center">
                <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{latestRecord.heightCm}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">身高（厘米）</div>{heightDelta !== null && <div className="mt-1 text-[11px] font-semibold text-[var(--tm-status-positive-strong)]">较上次 {heightDelta >= 0 ? '+' : ''}{heightDelta}</div>}</div>
                <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{latestRecord.weightKg}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">体重（千克）</div>{weightDelta !== null && <div className="mt-1 text-[11px] font-semibold text-[var(--tm-status-positive-strong)]">较上次 {weightDelta >= 0 ? '+' : ''}{weightDelta}</div>}</div>
                <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{latestRecord.bmi}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">身体质量指数</div></div>
              </div>
            </section>

            <div className="mb-2 mt-5 flex min-h-11 items-center justify-between">
              <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">历史记录</h2>
              {canEdit && <button type="button" onClick={openCreate} className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]"><Plus className="h-4 w-4" />新增测量</button>}
            </div>
            <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
              {sortedRecords.map(record => (
                <button key={record.id} type="button" onClick={() => openRecord(record)} className="flex min-h-[76px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]">
                  <span className={metricIconClass}>{record.sourceType === 'pc-import' ? <History className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}</span>
                  <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold text-[var(--tm-text-primary)]">{record.examDate}</span><span className="mt-1 block truncate text-xs font-medium text-[var(--tm-text-secondary)]">{record.heightCm}厘米 · {record.weightKg}千克 · {record.glassesType}</span></span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                </button>
              ))}
            </section>
          </>
        ) : (
          <section className={`${sectionSurface} px-5 py-10 text-center`}>
            <CircleAlert className="mx-auto h-8 w-8 text-[var(--tm-text-tertiary)]" />
            <h2 className="mt-3 text-[16px] font-bold text-[var(--tm-text-primary)]">暂无体检记录</h2>
            {canEdit && <button type="button" className={`${primaryButton} mt-5`} onClick={openCreate}><Plus className="h-4 w-4" />新增测量</button>}
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentHealthRecordsView;
