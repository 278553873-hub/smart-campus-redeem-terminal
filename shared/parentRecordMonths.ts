import type { ParentBehaviorRecord } from './parentBehaviorRecords';

/** 按事件发生月份聚合，月份与组内记录均倒序，不生成无记录月份。 */
export function groupParentRecordsByMonth(records: ParentBehaviorRecord[]) {
  const groups = new Map<string, ParentBehaviorRecord[]>();
  const sorted = [...records].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt - a.createdAt);
  for (const record of sorted) {
    const month = record.occurredOn.slice(0, 7);
    const items = groups.get(month) ?? [];
    items.push(record); groups.set(month, items);
  }
  return [...groups].map(([month, records]) => ({ month, label: `${Number(month.slice(0, 4))}年${Number(month.slice(5))}月`, records }));
}
