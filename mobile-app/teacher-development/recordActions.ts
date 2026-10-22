import type { DevelopmentRecord } from './data';

export const canManageRecord = (record: DevelopmentRecord, actorId: string) => record.authorId === actorId;
export type RecordRevision = '编辑记录' | '重新分析';

/** 更新同一事件而非追加；新识别需审核时重新送审，保留原提交人与录入时间。 */
export function replaceAnalyzedRecord(records: DevelopmentRecord[], next: DevelopmentRecord, id: string, actorId: string, action: RecordRevision) {
  const previous = records.find(record => record.id === id);
  if (!previous || !canManageRecord(previous, actorId) || next.authorId !== actorId) return records;
  return records.map(record => record.id !== id ? record : {
    ...next, id, authorId: previous.authorId, recordedAt: previous.recordedAt,
    inputContext: next.inputType === 'image' && next.imageSampleId === previous.imageSampleId ? previous.inputContext : next.inputContext,
    note: undefined, reviewerId: undefined,
    history: [...previous.history, action, ...next.history],
  });
}

export function deleteOwnRecord(records: DevelopmentRecord[], id: string, actorId: string) {
  return records.filter(record => record.id !== id || !canManageRecord(record, actorId));
}

/** 持久化删除标记，避免兼容逻辑在刷新时重新补回已删除的预置记录。 */
export function deletedRecordIds(previous: DevelopmentRecord[], next: DevelopmentRecord[], deleted: string[]) {
  const remaining = new Set(next.map(record => record.id));
  return [...new Set([...deleted, ...previous.filter(record => !remaining.has(record.id)).map(record => record.id)])];
}
