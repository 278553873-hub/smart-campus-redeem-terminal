import { useEffect, useState } from 'react';
import { INDICATORS, INITIAL_RECORDS, TEACHERS, type DevelopmentIndicator, type DevelopmentRecord } from './data';
import { migrateRecordInput } from './recordInput';

const STORAGE_KEY = 'teacher-development-demo-v1';
interface StoredData { version: 1; records: DevelopmentRecord[]; indicators: DevelopmentIndicator[]; }
const initialData = (): StoredData => ({ version: 1, records: structuredClone(INITIAL_RECORDS), indicators: structuredClone(INDICATORS) });
const readData = (): StoredData => {
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (data?.version !== 1 || !Array.isArray(data.records) || !Array.isArray(data.indicators)) return initialData();
    if (data.indicators.length !== INDICATORS.length || data.indicators.some((i: DevelopmentIndicator) => !INDICATORS.some(item => item.id === i.id) || !Array.isArray(i.roles) || !i.roles.length || i.roles.some(role => !['teacher', 'manager'].includes(role)) || typeof i.requiresReview !== 'boolean')) return initialData();
    if (data.records.some((r: DevelopmentRecord) => !r.id || !TEACHERS.some(t => t.id === r.teacherId) || !INDICATORS.some(i => i.id === r.indicatorId) || !Array.isArray(r.history) || !Number.isFinite(r.delta))) return initialData();
    // 规则与基础分来自版本化方案；演示控制只持久化角色和审核配置。
    const records: DevelopmentRecord[] = data.records.map((r: DevelopmentRecord) => (r.status as string) === 'needs-info'
      ? { ...r, status: 'returned', delta: 0, note: '此前录入未完成事实核实，校验未通过；请核实后修改重提。', history: [...r.history, '旧版未完成校验记录迁移为未通过，未计分'] }
      : r).map(migrateRecordInput);
    // 仅补齐新增预置示例；保留用户已有修改与全部记录。
    if (!records.some(r => r.id === 'r12')) records.push(structuredClone(INITIAL_RECORDS.find(r => r.id === 'r12')!));
    return { version: 1, records, indicators: INDICATORS.map(i => ({ ...i, roles: data.indicators.find((item: DevelopmentIndicator) => item.id === i.id).roles, requiresReview: data.indicators.find((item: DevelopmentIndicator) => item.id === i.id).requiresReview })) };
  } catch { return initialData(); }
};
export function useDevelopmentStore() {
  const [data, setData] = useState<StoredData>(readData);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [data]);
  return {
    ...data, storageError,
    setRecords: (update: DevelopmentRecord[] | ((records: DevelopmentRecord[]) => DevelopmentRecord[])) => setData(prev => ({ ...prev, records: typeof update === 'function' ? update(prev.records) : update })),
    setIndicators: (indicators: DevelopmentIndicator[]) => setData(prev => ({ ...prev, indicators })),
    reset: () => setData(initialData()),
  };
}
