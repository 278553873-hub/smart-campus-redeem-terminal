import React from 'react';
import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import { recordDistinguishesLevels, recordLevel, RECORD_LEVELS } from './recordLevels';

const levelColors: Record<string, string> = {
  个人: '--tm-record-level-personal',
  校级: '--tm-record-level-school',
  区级: '--tm-record-level-district',
  市级: '--tm-record-level-city',
  省级: '--tm-record-level-province',
  国家级: '--tm-record-level-national',
};
const badgeClass = 'inline-flex h-[var(--tm-record-level-size)] w-[var(--tm-record-level-size)] shrink-0 items-center justify-center rounded-[var(--tm-record-level-radius)] text-[length:var(--tm-record-level-font-size)] font-bold leading-none';

export default function RecordLevelBadge({ record, indicator, reserveSpace = false }: {
  record: DevelopmentRecord;
  indicator?: DevelopmentIndicator;
  reserveSpace?: boolean;
}) {
  const level = RECORD_LEVELS.find(item => item.name === recordLevel(record, indicator));
  // 不区分等级沿用“个”分类标记，不替代已开启但尚未识别的等级。
  const personal = !recordDistinguishesLevels(record, indicator);
  if (!level && !personal) return reserveSpace ? <span aria-hidden="true" className={badgeClass} /> : null;
  const label = personal ? '个人记录（不区分等级）' : level!.name;
  const color = personal ? '--tm-record-level-personal' : levelColors[level!.name];
  return <span role="img" title={label} aria-label={label} className={badgeClass} style={{ backgroundColor: `var(${color})`, color: `var(${color}-ink)` }}>{personal ? '个' : level!.short}</span>;
}
