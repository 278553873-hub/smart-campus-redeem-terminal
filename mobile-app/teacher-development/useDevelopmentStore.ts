import { useEffect, useState } from 'react';
import { INDICATORS, INITIAL_RECORDS, PERIODS, TEACHERS, periodsForMode, type DevelopmentIndicator, type DevelopmentRecord, type EvaluationPeriodMode } from './data';
import { migrateRecordInput } from './recordInput';
import { withRecordFields } from './indicatorFields';
import { deletedRecordIds } from './recordActions';

const STORAGE_KEY = 'teacher-development-demo-v1';
interface StoredData { periodMode: EvaluationPeriodMode; defaultPeriodId: string; version: 1; records: DevelopmentRecord[]; indicators: DevelopmentIndicator[]; deletedRecordIds: string[]; }
const initialData = (): StoredData => ({ periodMode: 'semester', defaultPeriodId: PERIODS[0].id, version: 1, records: structuredClone(INITIAL_RECORDS), indicators: structuredClone(INDICATORS), deletedRecordIds: [] });
export const readDevelopmentData = (): StoredData => {
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (data?.version !== 1 || !Array.isArray(data.records) || !Array.isArray(data.indicators)) return initialData();
    if (data.indicators.length !== INDICATORS.length || data.indicators.some((i: DevelopmentIndicator) => !INDICATORS.some(item => item.id === i.id) || !Array.isArray(i.roles) || !i.roles.length || i.roles.some(role => !['teacher', 'manager'].includes(role)) || typeof i.requiresReview !== 'boolean')) return initialData();
    if (data.records.some((r: DevelopmentRecord) => !r.id || !TEACHERS.some(t => t.id === r.teacherId) || !INDICATORS.some(i => i.id === r.indicatorId) || !Array.isArray(r.history) || !Number.isFinite(r.delta))) return initialData();
    const deleted = Array.isArray(data.deletedRecordIds) ? data.deletedRecordIds.filter((id: unknown): id is string => typeof id === 'string') : [];
    // 规则与基础分来自版本化方案；演示控制持久化角色、审核及等级开关。
    const records: DevelopmentRecord[] = data.records.filter((record: DevelopmentRecord) => !deleted.includes(record.id)).map((r: DevelopmentRecord) => (r.status as string) === 'needs-info'
      ? { ...r, status: 'returned', delta: 0, note: '此前录入未完成事实核实，校验未通过；请核实后修改重提。', history: [...r.history, '旧版未完成校验记录迁移为未通过，未计分'] }
      : r).map(migrateRecordInput).map((r: DevelopmentRecord) => withRecordFields(r, INDICATORS.find(i => i.id === r.indicatorId)!));
    // 仅补齐新增预置示例；保留用户已有修改与全部记录。
    if (!records.some(r => r.id === 'r12') && !deleted.includes('r12')) records.push(structuredClone(INITIAL_RECORDS.find(r => r.id === 'r12')!));
    const periodMode: EvaluationPeriodMode = data.periodMode === 'academic-year' ? 'academic-year' : 'semester';
    const allowedPeriods = periodsForMode(periodMode);
    return { periodMode, defaultPeriodId: allowedPeriods.some(period => period.id === data.defaultPeriodId) ? data.defaultPeriodId : allowedPeriods[0].id, version: 1, records, deletedRecordIds: deleted, indicators: INDICATORS.map(i => {
      const saved = data.indicators.find((item: DevelopmentIndicator) => item.id === i.id);
      return { ...i, roles: saved.roles, requiresReview: saved.requiresReview, distinguishLevels: typeof saved.distinguishLevels === 'boolean' ? saved.distinguishLevels : i.distinguishLevels };
    }) };
  } catch { return initialData(); }
};
export function useDevelopmentStore() {
  const [data, setData] = useState<StoredData>(readDevelopmentData);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [data]);
  return {
    ...data, storageError,
    setRecords: (update: DevelopmentRecord[] | ((records: DevelopmentRecord[]) => DevelopmentRecord[])) => setData(prev => {
      const records = typeof update === 'function' ? update(prev.records) : update;
      return { ...prev, records, deletedRecordIds: deletedRecordIds(prev.records, records, prev.deletedRecordIds) };
    }),
    setIndicators: (indicators: DevelopmentIndicator[]) => setData(prev => ({ ...prev, indicators })),
    setPeriodSettings: (mode: EvaluationPeriodMode) => { const options = periodsForMode(mode); setData(prev => ({ ...prev, periodMode: mode, defaultPeriodId: options[0].id })); },
    reset: () => setData(initialData()),
  };
}
