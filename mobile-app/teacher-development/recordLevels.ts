import type { DevelopmentIndicator, DevelopmentRecord } from './data';

/** 统一六档；个人与行政级别并列，县级、旧区县级作为区级别名。 */
export const RECORD_LEVELS = [
  { name: '个人', short: '个', aliases: [] },
  { name: '校级', short: '校', aliases: [] },
  { name: '区级', short: '区', aliases: ['县级', '区县级'] },
  { name: '市级', short: '市', aliases: [] },
  { name: '省级', short: '省', aliases: [] },
  { name: '国家级', short: '国', aliases: [] },
];
export const normalizeRecordLevel = (value: unknown) => RECORD_LEVELS.find(level => level.name === value || level.aliases.some(alias => alias === value))?.name;

export function recordDistinguishesLevels(record: DevelopmentRecord, indicator?: DevelopmentIndicator) {
  return record.distinguishLevels ?? record.fieldSnapshot?.fields.some(field => field.key === 'level') ?? indicator?.distinguishLevels ?? !!record.level;
}

export function recordLevel(record: DevelopmentRecord, indicator?: DevelopmentIndicator) {
  if (!recordDistinguishesLevels(record, indicator)) return undefined;
  return normalizeRecordLevel(record.fieldSnapshot ? record.fieldSnapshot.values.level : record.level);
}

export const recordLevelGroup = (record: DevelopmentRecord, indicator?: DevelopmentIndicator) => recordLevel(record, indicator) ?? (recordDistinguishesLevels(record, indicator) ? '未识别等级' : '不区分等级');

export const ruleUsesLevels = (rule: string) => RECORD_LEVELS.some(level => [level.name, ...level.aliases].some(name => rule.includes(name)));
