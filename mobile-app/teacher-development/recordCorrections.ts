import { ALL_PERIODS, TEACHERS, type DevelopmentIndicator, type DevelopmentRecord } from './data';
import { extractIndicatorFields, indicatorFields, makeFieldSnapshot, validFieldValue, withRecordFields } from './indicatorFields';
import { normalizeRecordLevel, recordDistinguishesLevels, recordLevel } from './recordLevels';
import { calculateRecordDelta } from './recordScoring';
import { recordMatter } from './recordMatter';

export type RecognitionField = 'date' | 'teacher' | 'indicator' | 'level' | 'matter' | 'score';
export type RecordCorrection = { field: Exclude<RecognitionField, 'score'>; value: string } | { field: 'score'; value: number; reason: string };
export const recognitionFieldNames: Record<RecognitionField, string> = { date: '时间', teacher: '对象', indicator: '指标', level: '级别', matter: '事项', score: '分数' };

export function canCorrectRecord(record: DevelopmentRecord, actorId: string) {
  const actor = TEACHERS.find(teacher => teacher.id === actorId);
  return !!actor && record.status !== 'withdrawn' && (actor.manager || (record.teacherId === actorId && record.authorId === actorId));
}

type CorrectionResult = { ok: true; record: DevelopmentRecord } | { ok: false; error: string };
export function canUseRecordIndicator(indicator: DevelopmentIndicator, actorId: string, teacherId: string) {
  const actor = TEACHERS.find(teacher => teacher.id === actorId);
  return !!actor && (teacherId === actorId ? indicator.roles.includes('teacher') : !!actor.manager && indicator.roles.includes('manager'));
}
/** 人工校正独立于原始输入；同一事件同步更新审核与统计所用的数据。 */
export function correctRecord(record: DevelopmentRecord, indicator: DevelopmentIndicator, actorId: string, correction: RecordCorrection, existing: DevelopmentRecord[] = [], indicators: DevelopmentIndicator[] = [indicator]): CorrectionResult {
  const actor = TEACHERS.find(teacher => teacher.id === actorId);
  if (!actor || !canCorrectRecord(record, actorId)) return { ok: false, error: '当前账号不能修改这条记录。' };
  const next = structuredClone(withRecordFields(record, indicator));
  next.inputContext ??= { teacherId: record.teacherId, date: record.date };
  let targetIndicator = indicator;
  let previous: string | number;
  if (correction.field === 'date') {
    const date = correction.value;
    const validDay = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
    const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(date);
    if ((!validDay && !validMonth) || !ALL_PERIODS.some(period => validMonth ? date >= period.start.slice(0, 7) && date <= period.end.slice(0, 7) : date >= period.start && date <= period.end)) return { ok: false, error: '请选择考核周期内的有效日期。' };
    previous = record.date; next.date = date;
  } else if (correction.field === 'teacher') {
    if (!actor.manager) return { ok: false, error: '教师只能记录本人，不能修改评价对象。' };
    const teacher = TEACHERS.find(teacher => teacher.id === correction.value);
    if (!teacher) return { ok: false, error: '请选择有效的教师。' };
    if (teacher.id === actorId && !indicator.roles.includes('teacher')) return { ok: false, error: '该指标不能用于自评，请选择其他教师。' };
    previous = TEACHERS.find(teacher => teacher.id === record.teacherId)!.name;
    next.teacherId = teacher.id;
  } else if (correction.field === 'indicator') {
    const selected = indicators.find(item => item.id === correction.value);
    if (!selected || !canUseRecordIndicator(selected, actorId, record.teacherId)) return { ok: false, error: '请选择当前账号可评价的学校指标。' };
    if (selected.id === record.indicatorId) return { ok: true, record };
    targetIndicator = selected;
    previous = record.indicatorId;
    const level = recordLevel(record, indicator);
    const configured = { ...selected, distinguishLevels: recordDistinguishesLevels(record, indicator) || selected.distinguishLevels };
    const fields = indicatorFields(configured);
    const values = extractIndicatorFields(next.matter ?? next.text, fields);
    if (level) values.level = level;
    const missing = fields.filter(field => field.required && !validFieldValue(field, values[field.key]));
    if (missing.length) return { ok: false, error: `请先核对事项与级别，补充${missing.map(field => field.label).join('、')}后再修改指标。` };
    next.indicatorId = selected.id;
    next.fieldSnapshot = makeFieldSnapshot(configured, values);
    next.distinguishLevels = configured.distinguishLevels;
    next.level = typeof values.level === 'string' ? values.level : undefined;
    next.category = typeof values.category === 'string' ? values.category : selected.category;
    next.stage = typeof values.stage === 'string' ? values.stage : undefined;
    next.contribution = typeof values.contribution === 'string' ? values.contribution : undefined;
    // 原指标下的人工分数不能直接沿用到另一套计分规则。
    next.scoreAdjustment = undefined;
  } else if (correction.field === 'level') {
    const level = normalizeRecordLevel(correction.value);
    if (!level) return { ok: false, error: '请选择有效的级别。' };
    previous = recordLevel(record, indicator) ?? '未认定';
    next.level = level; next.distinguishLevels = true;
    const snapshot = next.fieldSnapshot!;
    if (!snapshot.fields.some(field => field.key === 'level')) snapshot.fields.unshift(indicatorFields({ ...indicator, distinguishLevels: true }).find(field => field.key === 'level')!);
    snapshot.values.level = level;
  } else if (correction.field === 'matter') {
    const value = correction.value.trim();
    if (!value) return { ok: false, error: '请填写事项内容。' };
    previous = recordMatter(record);
    next.matter = value; next.title = value.slice(0, 40);
    const snapshot = next.fieldSnapshot!;
    snapshot.values = { ...extractIndicatorFields(value, snapshot.fields), ...(snapshot.values.level !== undefined ? { level: snapshot.values.level } : {}) };
    next.stage = typeof snapshot.values.stage === 'string' ? snapshot.values.stage : undefined;
    next.contribution = typeof snapshot.values.contribution === 'string' ? snapshot.values.contribution : undefined;
    if (snapshot.fields.some(field => field.key === 'category')) next.category = typeof snapshot.values.category === 'string' ? snapshot.values.category : undefined;
  } else {
    if (!Number.isFinite(correction.value) || Math.abs(correction.value) > Number.MAX_SAFE_INTEGER || Math.abs(correction.value * 100 - Math.round(correction.value * 100)) > 1e-6) return { ok: false, error: '请输入有效分数，最多保留两位小数。' };
    previous = record.delta;
    next.delta = correction.value;
    next.scoreAdjustment = { value: correction.value, reason: correction.reason.trim() };
  }
  if (existing.some(item => item.id !== record.id && item.status !== 'withdrawn' && item.teacherId === next.teacherId && item.date === next.date && item.indicatorId === next.indicatorId && (next.imageSampleId ? item.imageSampleId === next.imageSampleId : item.text.trim() === next.text.trim()))) return { ok: false, error: '该教师在这一天已有同一事项，请核对原记录。' };
  const value = correction.field === 'teacher' ? TEACHERS.find(teacher => teacher.id === next.teacherId)!.name : correction.field === 'matter' ? next.matter! : correction.field === 'level' ? next.level! : correction.value;
  if (previous === value && (correction.field !== 'score' || (record.scoreAdjustment?.reason ?? '') === correction.reason.trim())) return { ok: true, record };
  if (correction.field === 'level' || correction.field === 'matter' || correction.field === 'indicator') {
    const text = next.matter ?? next.text;
    const delta = calculateRecordDelta(targetIndicator, next.fieldSnapshot!.values, text, next.inputType);
    if (correction.field === 'indicator' && delta < 0 && (!/已核实|经核实/.test(text) || /未核实|尚未核实|未经核实|并未核实/.test(text))) return { ok: false, error: '扣分评价须先核实事实，请在事项中补充核实依据。' };
    next.rule = delta === 0 ? '未命中已配置的计分条件，仅归档。' : targetIndicator.rule;
    if (!next.scoreAdjustment) next.delta = delta;
  }
  // 人工更正后的需审记录重新送审，不能借修改字段绕过审核或保留旧计分。
  next.requiresReview = targetIndicator.requiresReview;
  next.status = next.requiresReview ? 'pending' : 'approved';
  next.note = undefined; next.reviewerId = undefined;
  next.history.push('校正识别结果', `${actor.name}将${recognitionFieldNames[correction.field]}由“${correction.field === 'indicator' ? indicator.name : previous}”修改为“${correction.field === 'indicator' ? targetIndicator.name : value}”${correction.field === 'score' && correction.reason.trim() ? `，调整说明：${correction.reason.trim()}` : ''}`, next.requiresReview ? '校正后重新送审，原计分已撤销' : '校正后更新积分与档案');
  return { ok: true, record: next };
}
