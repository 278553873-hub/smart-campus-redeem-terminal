import React from 'react';
import { teacherBrandCssVariables } from '../../styles/teacherMobileTokens';
import MobileWheelPicker, { type MobileWheelColumn } from './MobileWheelPicker';
import { daysInCalendarMonth, isCalendarDate, localToday, replaceCalendarPart } from './mobileDatePickerModel';

interface Props {
  value: string;
  min?: string;
  max?: string;
  onSelect: (date: string) => void;
  onSettlingChange?: (settling: boolean) => void;
}

/** 日期边界及大小月联动；滚动、吸附和键盘行为复用公共滚轮。 */
export default function MobileDateWheel({ value, min, max, onSelect, onSettlingChange }: Props) {
  const lower = isCalendarDate(min ?? '') ? min! : '1900-01-01';
  const upper = isCalendarDate(max ?? '') ? max! : '2100-12-31';
  if (lower > upper) return <p role="status" className="py-6 text-center text-[var(--tm-text-secondary)]">暂无可选日期</p>;
  const candidate = isCalendarDate(value) ? value : localToday();
  const date = candidate < lower ? lower : candidate > upper ? upper : candidate;
  const [year, month, day] = date.split('-').map(Number);
  const options = (first: number, last: number, unit: string) => Array.from({ length: last - first + 1 }, (_, i) => ({ value: String(first + i), label: `${first + i}${unit}` }));
  const columns: MobileWheelColumn[] = [
    { key: 'year', ariaLabel: '年份', value: String(year), options: options(Number(lower.slice(0, 4)), Number(upper.slice(0, 4)), '年'), onChange: next => onSelect(replaceCalendarPart(date, 'year', Number(next), lower, upper)) },
    { key: 'month', ariaLabel: '月份', value: String(month), options: options(year === Number(lower.slice(0, 4)) ? Number(lower.slice(5, 7)) : 1, year === Number(upper.slice(0, 4)) ? Number(upper.slice(5, 7)) : 12, '月'), onChange: next => onSelect(replaceCalendarPart(date, 'month', Number(next), lower, upper)) },
    { key: 'day', ariaLabel: '日期', value: String(day), options: options(date.slice(0, 7) === lower.slice(0, 7) ? Number(lower.slice(8)) : 1, date.slice(0, 7) === upper.slice(0, 7) ? Number(upper.slice(8)) : daysInCalendarMonth(year, month), '日'), onChange: next => onSelect(replaceCalendarPart(date, 'day', Number(next), lower, upper)) },
  ];
  return <div className="px-[var(--tm-space-1)] [--tm-wheel-radius:var(--tm-date-control-radius)]">
    <MobileWheelPicker columns={columns} emphasis="subtle" itemHeight={Number.parseFloat(teacherBrandCssVariables['--tm-date-row-height'])} fadeEdges="gradual" onSettlingChange={onSettlingChange} />
  </div>;
}
