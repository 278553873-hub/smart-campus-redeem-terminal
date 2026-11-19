import type { MoralEducationPeriodOption } from '../../mobile-app/services/moralEducationCockpitService';

export interface MoralEvaluationEvent {
  id: string;
  occurredAt: string;
  classIds: string[];
  status: 'published' | 'draft' | 'voided';
}

const dateInChina = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });

/** 一次发起评价只计一次，不按班级数量或产生的记录条数扩增。 */
export function countMoralEvaluationEvents(events: MoralEvaluationEvent[], period: Pick<MoralEducationPeriodOption, 'startDate' | 'endDate'>) {
  const ids = new Set<string>();
  for (const event of events) {
    const time = new Date(event.occurredAt);
    if (!event.id || event.status !== 'published' || !event.classIds.length || !Number.isFinite(time.getTime())) continue;
    const date = dateInChina.format(time);
    if (date >= period.startDate && date <= period.endDate) ids.add(event.id);
  }
  return ids.size;
}

// 驾驶舱专用发起事件演示数据；独立于待改进记录与扣分，不修改手机端服务。
const demoEventCounts: Record<string, number> = {
  '2026-03-05': 64, '2026-04-23': 67, '2026-05-09': 68, '2026-06-06': 70,
  '2026-07-11': 72, '2026-08-08': 75, '2026-09-06': 74, '2026-09-13': 78,
  '2026-09-20': 83, '2026-09-27': 86, '2026-10-03': 89,
};

export function createMoralDemoEvaluationEvents(period: MoralEducationPeriodOption, classIds: string[]): MoralEvaluationEvent[] {
  if (!classIds.length) return [];
  return Array.from({ length: demoEventCounts[period.startDate] ?? 0 }, (_, index) => ({
    id: `${period.id}-evaluation-${index + 1}`,
    occurredAt: `${period.startDate}T08:${String(index % 60).padStart(2, '0')}:00+08:00`,
    classIds: Array.from({ length: Math.min(classIds.length, 5 + index % 3) }, (_, offset) => classIds[(index + offset) % classIds.length]),
    status: 'published',
  }));
}
