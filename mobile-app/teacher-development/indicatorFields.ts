import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import { normalizeRecordLevel, recordDistinguishesLevels, RECORD_LEVELS } from './recordLevels';

interface FieldBase {
  key: string;
  label: string;
  required: boolean;
  hint: string;
}
export type IndicatorField = FieldBase & (
  | { type: 'enum'; options: { value: string; aliases?: string[] }[] }
  | { type: 'number'; unit: string; min?: number; max?: number }
  | { type: 'text'; aliases?: string[] }
);
export type FieldValues = Record<string, string | number>;
export interface RecordFieldSnapshot {
  version: number;
  fields: IndicatorField[];
  values: FieldValues;
}

const levelField = (label: string): IndicatorField => ({
  key: 'level', label, type: 'enum', required: false,
  hint: '提取本次活动或成果的认定级别，不以举办地点、主办单位或参与者身份推定级别。',
  options: RECORD_LEVELS.map(level => ({ value: level.name, aliases: level.aliases })),
});

/** 平台内置常用明细，学校无需逐项配置字段类型、选项或提取说明。 */
export const INDICATOR_FIELD_PRESETS: Record<string, IndicatorField[]> = {
  C07: [
    levelField('活动级别'),
    { key: 'hours', label: '学习学时', type: 'number', unit: '学时', min: 0, required: false, hint: '仅提取材料明确记载的学时，不将天数或小时自行换算为学时。' },
    { key: 'organizer', label: '主办单位', type: 'text', required: false, hint: '提取本次研修的主办单位，不用教师任职学校代替。' },
  ],
  C09: [
    { key: 'category', label: '成果类别', type: 'enum', required: false, hint: '区分课题研究与论文专著。', options: [{ value: '课题研究', aliases: ['课题'] }, { value: '论文专著', aliases: ['论文', '专著'] }] },
    levelField('成果级别'),
    { key: 'stage', label: '成果阶段', type: 'enum', required: false, hint: '提取材料明确确认的当前阶段；计划结题不等于已结题。', options: [{ value: '立项' }, { value: '结题' }] },
    { key: 'contribution', label: '本人分工', type: 'enum', required: false, hint: '只认定被评价教师在本项成果中的分工，不识别为系统角色。', options: [{ value: '主持人', aliases: ['主持'] }, { value: '参与人', aliases: ['参与'] }] },
  ],
  C12: [
    levelField('活动级别'),
    { key: 'contribution', label: '本人分工', type: 'enum', required: false, hint: '提取本次活动中被评价教师的实际分工。', options: [{ value: '执教人', aliases: ['执教'] }, { value: '主讲人', aliases: ['主讲'] }] },
  ],
};

export function indicatorFields(indicator: DevelopmentIndicator): IndicatorField[] {
  const details = indicator.fields.filter(field => field.key !== 'level');
  if (!indicator.distinguishLevels) return details;
  const configuredLevel = indicator.fields.find(field => field.key === 'level');
  return [{ ...levelField(configuredLevel?.label ?? '事件等级'), required: configuredLevel?.required ?? false }, ...details];
}

export function validFieldValue(field: IndicatorField, value: unknown): value is string | number {
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value) && (field.min === undefined || value >= field.min) && (field.max === undefined || value <= field.max);
  if (typeof value !== 'string' || !value.trim()) return false;
  return field.type === 'text' || field.options.some(option => option.value === value);
}

const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 仅用于 Demo 的确定性提取；正式 AI 适配器应返回相同字段结构及原文依据。 */
export function extractIndicatorFields(text: string, fields: IndicatorField[]): FieldValues {
  const values: FieldValues = {};
  for (const field of fields) {
    let candidates: (string | number)[] = [];
    if (field.type === 'enum') {
      candidates = field.options.filter(option => [option.value, ...(option.aliases ?? [])].some(term => {
        const matches = text.matchAll(new RegExp(escapePattern(term), 'g'));
        return [...matches].some(match => !/(?:未|尚未|并非|不是|计划|准备|拟)(?:完成|担任)?$/.test(text.slice(Math.max(0, match.index! - 8), match.index)));
      })).map(option => option.value);
    } else if (field.type === 'number') {
      candidates = [...text.matchAll(new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*${escapePattern(field.unit)}`, 'g'))].map(match => Number(match[1]));
    } else {
      const labels = [field.label, ...(field.aliases ?? [])].map(escapePattern).join('|');
      candidates = [...text.matchAll(new RegExp(`(?:${labels})[：:]\\s*([^，。；;\\n]+)`, 'g'))].map(match => match[1].trim());
    }
    const distinct = [...new Set(candidates)];
    // 多个不一致的值不任取其一；缺失或非法值不编造为默认值。
    if (distinct.length === 1 && validFieldValue(field, distinct[0])) values[field.key] = distinct[0];
  }
  return values;
}

export function makeFieldSnapshot(indicator: DevelopmentIndicator, values: FieldValues): RecordFieldSnapshot {
  const fields = indicatorFields(indicator);
  const normalized = { ...values, ...(values.level !== undefined ? { level: normalizeRecordLevel(values.level) } : {}) };
  return { version: indicator.fieldVersion, fields: structuredClone(fields), values: Object.fromEntries(fields.filter(field => validFieldValue(field, normalized[field.key])).map(field => [field.key, normalized[field.key] as string | number])) };
}

/** 旧版记录只接纳已有字段，不重新识别原话、不改历史分数或审核状态。 */
export function withRecordFields(record: DevelopmentRecord, indicator: DevelopmentIndicator): DevelopmentRecord {
  if (record.fieldSnapshot) return record.distinguishLevels === undefined ? { ...record, distinguishLevels: recordDistinguishesLevels(record, indicator) } : record;
  const legacy: FieldValues = {};
  for (const key of ['category', 'level', 'stage', 'contribution'] as const) {
    if (record[key]) legacy[key] = record[key]!;
  }
  return { ...record, distinguishLevels: record.distinguishLevels ?? indicator.distinguishLevels, fieldSnapshot: makeFieldSnapshot(indicator, legacy) };
}

export function recordFieldRows(record: DevelopmentRecord, indicator?: DevelopmentIndicator) {
  const snapshot = record.fieldSnapshot ?? (indicator ? withRecordFields(record, indicator).fieldSnapshot : undefined);
  return (snapshot?.fields ?? []).flatMap(field => {
    const value = snapshot!.values[field.key];
    if (field.key === 'level') {
      const level = recordDistinguishesLevels(record, indicator) ? normalizeRecordLevel(value) : undefined;
      return level ? [{ key: field.key, label: field.label, value: level, display: level }] : [];
    }
    return validFieldValue(field, value) ? [{ key: field.key, label: field.label, value, display: field.type === 'number' ? `${value} ${field.unit}` : String(value) }] : [];
  });
}
