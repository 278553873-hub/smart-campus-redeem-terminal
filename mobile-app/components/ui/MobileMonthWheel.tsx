import React from 'react';
import { teacherBrandCssVariables } from '../../styles/teacherMobileTokens';
import MobileWheelPicker, { type MobileWheelColumn } from './MobileWheelPicker';

interface Props {
  value: string;
  months: ReadonlyArray<string>;
  onSelect: (month: string) => void;
  onSettlingChange?: (settling: boolean) => void;
}

/** 只展示调用方提供的年月，滚动、吸附与键盘操作复用公共滚轮。 */
export default function MobileMonthWheel({ value, months, onSelect, onSettlingChange }: Props) {
  const available = [...new Set(months)].sort();
  if (!available.length) return <p role="status" className="px-[var(--tm-sheet-inline)] py-6 text-center text-[var(--tm-text-secondary)]">暂无可选月份</p>;
  const selected = available.includes(value) ? value : available[0];
  const year = selected.slice(0, 4);
  const columns: MobileWheelColumn[] = [
    {
      key: 'month-year', ariaLabel: '年份', value: year,
      options: [...new Set(available.map(month => month.slice(0, 4)))].map(value => ({ value, label: `${value}年` })),
      onChange: nextYear => {
        const options = available.filter(month => month.startsWith(`${nextYear}-`));
        const candidate = `${nextYear}-${selected.slice(5, 7)}`;
        onSelect(options.includes(candidate) ? candidate : candidate < options[0] ? options[0] : options[options.length - 1]);
      },
    },
    {
      key: 'month-value', ariaLabel: '月份', value: selected,
      options: available.filter(month => month.startsWith(`${year}-`)).map(value => ({ value, label: `${Number(value.slice(5, 7))}月` })),
      onChange: onSelect,
    },
  ];
  return <div className="px-[var(--tm-space-1)] [--tm-wheel-radius:var(--tm-date-control-radius)]">
    <MobileWheelPicker columns={columns} emphasis="subtle" itemHeight={Number.parseFloat(teacherBrandCssVariables['--tm-date-row-height'])} fadeEdges="gradual" onSettlingChange={onSettlingChange} />
  </div>;
}
