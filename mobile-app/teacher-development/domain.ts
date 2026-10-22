import { ALL_PERIODS, DIMENSIONS, PERIODS, TEACHERS, type DevelopmentIndicator, type DevelopmentRecord, type EvaluationRole, type RecordInputType } from './data';
import { findImageSample, LEGACY_IMAGE_SAMPLES } from './imageSamples';
import { extractIndicatorFields, indicatorFields, makeFieldSnapshot, validFieldValue } from './indicatorFields';
import { ruleUsesLevels } from './recordLevels';
import { calculateRecordDelta } from './recordScoring';
export const inPeriod = (record: DevelopmentRecord, periodId: string) => {
  if (periodId === 'all') return true;
  const period = ALL_PERIODS.find(item => item.id === periodId);
  if (!period) return false;
  return record.date.length === 7
    ? record.date >= period.start.slice(0, 7) && record.date <= period.end.slice(0, 7)
    : record.date >= period.start && record.date <= period.end;
};
export const indicatorScore = (indicator: DevelopmentIndicator, records: DevelopmentRecord[], teacherId: string, periodId: string) => {
  const delta = records.filter(r => r.teacherId === teacherId && r.indicatorId === indicator.id && r.status === 'approved' && inPeriod(r, periodId)).reduce((sum, r) => sum + r.delta, 0);
  return Math.max(indicator.lower, Math.min(indicator.upper, indicator.base + delta));
};
export const teacherScore = (indicators: DevelopmentIndicator[], records: DevelopmentRecord[], teacherId: string, periodId: string) => indicators.reduce((sum, item) => sum + indicatorScore(item, records, teacherId, periodId), 0);
export const canReview = (record: DevelopmentRecord, actorId: string) => !!TEACHERS.find(t => t.id === actorId)?.manager && record.status === 'pending' && record.authorId !== actorId && record.teacherId !== actorId;
// 主操作入口独立于档案、报表的学期和查询条件，避免隐藏待办。
export const recordInbox = (records: DevelopmentRecord[], actorId: string) => records.filter(r => r.status !== 'withdrawn' && (r.authorId === actorId || r.teacherId === actorId));
export const reviewInbox = (records: DevelopmentRecord[], actorId: string, state: 'pending' | 'approved' | 'returned' = 'pending') => {
  if (!TEACHERS.find(t => t.id === actorId)?.manager) return [];
  return records.filter(r => state === 'pending' ? canReview(r, actorId) : r.reviewerId === actorId && r.status === state);
};
export const effectiveRecords = (records: DevelopmentRecord[], periodId: string, teacherId?: string) => records.filter(r => r.status === 'approved' && inPeriod(r, periodId) && (!teacherId || r.teacherId === teacherId));
export const dimensionCounts = (indicators: DevelopmentIndicator[], records: DevelopmentRecord[]) => DIMENSIONS.map(name => ({ name, count: records.filter(r => indicators.find(i => i.id === r.indicatorId)?.dimension === name).length }));
export interface RecognitionInput { text: string; actorId: string; role: EvaluationRole; targetId?: string; date: string; inputType?: RecordInputType; imageSampleId?: string; }
export type Recognition = { ok: true; record: DevelopmentRecord } | { ok: false; question: string };
// 演示适配器：只处理可解释的预置匹配，不冒充实时大模型或图片文字识别。
export function recognizeRecord(input: RecognitionInput, indicators: DevelopmentIndicator[], existing: DevelopmentRecord[]): Recognition {
  const actor = TEACHERS.find(t => t.id === input.actorId);
  if (!actor || (input.role === 'manager' && !actor.manager)) return { ok: false, question: '当前账号没有管理者权限。' };
  const inputType = input.inputType ?? 'text';
  if (!['text', 'voice', 'image'].includes(inputType)) return { ok: false, question: '请使用文字、语音或图片录入。' };
  const sample = inputType === 'image' ? findImageSample(input.imageSampleId) : undefined;
  if (inputType === 'image' && !sample && !LEGACY_IMAGE_SAMPLES.some(item => item.id === input.imageSampleId)) return { ok: false, question: '请选择清晰完整的图片后再提交。' };
  // 图片演示从固定材料提取，不按当前账号或日期改写材料中的姓名与事实。
  if (sample) input = { ...input, text: sample.text };
  const isSelf = /(?:^|[，。！？；,\n])\s*(?:今天[，,]?\s*)?我(?:与|和|已|完成|参加|主持|进行|开展|在|负责|提交)/.test(input.text);
  let teacherId = input.role === 'teacher' ? input.actorId : input.targetId;
  const namedTeachers = TEACHERS.filter(t => input.text.includes(t.name));
  if (input.role === 'manager' && isSelf) {
    if (teacherId && teacherId !== input.actorId) return { ok: false, question: '描述中的“我”与所选教师不一致，请核对评价对象。' };
    teacherId = input.actorId;
  }
  if (input.role === 'manager' && !teacherId) {
    if (namedTeachers.length !== 1) return { ok: false, question: '请选择本次评价的教师。' };
    teacherId = namedTeachers[0].id;
  }
  if (!TEACHERS.some(t => t.id === teacherId)) return { ok: false, question: '没有找到这位教师，请重新选择。' };
  if (sample && teacherId !== sample.teacherId) return { ok: false, question: '图片中的教师为张敏，请核对评价对象或更换图片，本次尚未提交。' };
  if (!isSelf && input.role === 'teacher' && namedTeachers.some(t => t.id !== input.actorId)) return { ok: false, question: '教师只能提交本人的记录，请核对记录归属。' };
  if (!isSelf && input.role === 'manager' && namedTeachers.some(t => t.id !== teacherId)) return { ok: false, question: '描述中的姓名与所选教师不一致，请核对评价对象。' };
  const candidates = indicators.filter(i => i.keywords.some(word => input.text.includes(word)));
  const indicator = sample ? indicators.find(i => i.id === sample.indicatorId) : candidates.find(i => ['C01', 'C02', 'C03', 'C09', 'C12', 'C11', 'C04', 'C05', 'C10'].includes(i.id)) ?? candidates[0];
  if (sample && !indicator) return { ok: false, question: '当前尚未配置专业荣誉的评价指标，请联系管理者配置后再提交。' };
  if (!indicator) return { ok: false, question: '请补充具体事件，例如完成了什么学习、教研或教学活动。' };
  const effectiveRole = teacherId === input.actorId ? 'teacher' : input.role;
  if (!indicator.roles.includes(effectiveRole)) return { ok: false, question: '该指标仅允许管理者评价其他教师，不能自行申报。' };
  let date = sample?.date ?? input.date;
  const parsedDate = input.text.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})日?/);
  if (parsedDate) date = `${parsedDate[1]}-${parsedDate[2].padStart(2, '0')}-${parsedDate[3].padStart(2, '0')}`;
  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const monthOnly = !!sample && /^20\d{2}-(0[1-9]|1[0-2])$/.test(date);
  if (!monthOnly && (!dateParts || !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date)) return { ok: false, question: '请选择有效的发生日期。' };
  if (!PERIODS.some(p => monthOnly ? date >= p.start.slice(0, 7) && date <= p.end.slice(0, 7) : date >= p.start && date <= p.end)) return { ok: false, question: '该日期不在已配置的考核周期内，请核对发生日期。' };
  const keyText = input.text.replace(/\s|[，。、“”]/g, '');
  if (existing.some(r => r.teacherId === teacherId && r.status !== 'withdrawn' && r.indicatorId === indicator.id && r.date === date && ((sample && r.imageSampleId === sample.id) || r.text.replace(/\s|[，。、“”]/g, '') === keyText))) return { ok: false, question: '这件事已经记录过，可到原记录补充材料。' };
  if (!indicator.distinguishLevels && ruleUsesLevels(indicator.rule)) return { ok: false, question: '该指标未区分等级，但评分标准包含等级条件。请联系管理者调整指标设置，本次尚未提交。' };
  const fields = indicatorFields(indicator);
  const details = extractIndicatorFields(input.text, fields);
  const missing = fields.filter(field => field.required && !validFieldValue(field, details[field.key]));
  if (missing.length) return { ok: false, question: `请补充或核对${missing.map(field => field.label).join('、')}，本次尚未提交。` };
  const level = typeof details.level === 'string' ? details.level : undefined;
  const delta = calculateRecordDelta(indicator, details, input.text, inputType);
  const unverified = delta < 0 && (!/已核实|经核实/.test(input.text) || /未核实|尚未核实|未经核实|并未核实/.test(input.text));
  if (unverified) return { ok: false, question: '请先核实事实，再填写核实依据。仅有投诉不能提交扣分评价，本次尚未提交。' };
  const id = `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return { ok: true, record: {
    id, teacherId: teacherId!, authorId: input.actorId, text: input.text.trim(), title: input.text.trim().replace(new RegExp(`^${TEACHERS.find(t => t.id === teacherId)!.name}(老师)?[，,：:]?`), '').slice(0, 40), indicatorId: indicator.id, date, recordedAt: new Date().toISOString(),
    category: sample?.category ?? (typeof details.category === 'string' ? details.category : indicator.fields.some(field => field.key === 'category') ? undefined : indicator.category),
    level, stage: typeof details.stage === 'string' ? details.stage : undefined,
    contribution: typeof details.contribution === 'string' ? details.contribution : undefined,
    fieldSnapshot: makeFieldSnapshot(indicator, details),
    distinguishLevels: indicator.distinguishLevels,
    delta, status: indicator.requiresReview ? 'pending' : 'approved', requiresReview: indicator.requiresReview,
    rule: delta === 0 ? '未命中已配置的计分条件，仅归档。' : indicator.rule,
    inputType, imageSampleId: inputType === 'image' ? input.imageSampleId : undefined,
    history: ['提交记录', `AI匹配${indicator.name}`, indicator.requiresReview ? '进入审核队列，尚未计分' : '按免审配置自动生效'],
  } };
}
export function reviewRecord(records: DevelopmentRecord[], id: string, actorId: string, approve: boolean, reason = '') {
  if (!approve && !reason.trim()) return records;
  return records.map(r => r.id !== id || !canReview(r, actorId) ? r : { ...r, status: approve ? 'approved' as const : 'returned' as const, reviewerId: actorId, note: approve ? undefined : reason.trim(), history: [...r.history, approve ? '管理者审核通过，系统计分入档' : `管理者审核未通过：${reason.trim()}`] });
}

// 未通过后修改保留同一个事件编号和修订链，不增加成长记录条数。
export function saveRecord(records: DevelopmentRecord[], next: DevelopmentRecord, actorId: string, replacesId: string | null = null): DevelopmentRecord[] {
  if (next.authorId !== actorId) return records;
  if (replacesId) return records.map(r => r.id === replacesId && r.authorId === actorId && r.status === 'returned' ? { ...next, id: r.id, history: [...r.history, '修改后重新提交', ...next.history] } : r);
  return records.some(r => r.id === next.id) ? records : [next, ...records];
}
