import React, { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';

export type EvaluationTimeFilter = 'all' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

export interface EvaluationTimeFilterValue {
  type: EvaluationTimeFilter;
  customStart: string;
  customEnd: string;
}

interface EvaluationTimeFilterSheetProps {
  open: boolean;
  value: EvaluationTimeFilterValue;
  termStartDate: string;
  termEndDate: string;
  referenceDate: Date;
  onClose: () => void;
  onSelect: (value: EvaluationTimeFilterValue) => void;
}

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => new Date(`${value}T12:00:00`);

const clampRange = (startDate: string, endDate: string, termStartDate: string, termEndDate: string) => ({
  startDate: startDate < termStartDate ? termStartDate : startDate,
  endDate: endDate > termEndDate ? termEndDate : endDate,
});

const getWeekRange = (referenceDate: Date, offset: number) => {
  const day = referenceDate.getDay() || 7;
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - day + 1 + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toDateValue(start), endDate: toDateValue(end) };
};

const getMonthRange = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map(Number);
  return {
    startDate: `${monthValue}-01`,
    endDate: toDateValue(new Date(year, month, 0)),
  };
};

export const getEvaluationDateRange = (
  value: EvaluationTimeFilterValue,
  termStartDate: string,
  termEndDate: string,
  referenceDate: Date,
) => {
  if (value.type === 'custom') {
    return clampRange(value.customStart, value.customEnd, termStartDate, termEndDate);
  }
  if (value.type === 'this-week') {
    const range = getWeekRange(referenceDate, 0);
    return clampRange(range.startDate, range.endDate, termStartDate, termEndDate);
  }
  if (value.type === 'last-week') {
    const range = getWeekRange(referenceDate, -1);
    return clampRange(range.startDate, range.endDate, termStartDate, termEndDate);
  }
  if (value.type === 'this-month') {
    const range = getMonthRange(toDateValue(referenceDate).slice(0, 7));
    return clampRange(range.startDate, range.endDate, termStartDate, termEndDate);
  }
  if (value.type === 'last-month') {
    const previousMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
    const range = getMonthRange(toDateValue(previousMonth).slice(0, 7));
    return clampRange(range.startDate, range.endDate, termStartDate, termEndDate);
  }
  return { startDate: termStartDate, endDate: termEndDate };
};

const formatShortRange = (startDate: string, endDate: string) => {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);
  const startText = `${start.getMonth() + 1}.${String(start.getDate()).padStart(2, '0')}`;
  const endText = `${end.getMonth() + 1}.${String(end.getDate()).padStart(2, '0')}`;
  return `${startText}-${endText}`;
};

export const getEvaluationTimeFilterLabel = (
  value: EvaluationTimeFilterValue,
  termStartDate: string,
  termEndDate: string,
  referenceDate: Date,
) => {
  if (value.type === 'all') return '全学期';
  const range = getEvaluationDateRange(value, termStartDate, termEndDate, referenceDate);
  const rangeText = formatShortRange(range.startDate, range.endDate);
  if (value.type === 'this-week') return `本周 ${rangeText}`;
  if (value.type === 'last-week') return `上周 ${rangeText}`;
  if (value.type === 'this-month') return `本月 ${rangeText}`;
  if (value.type === 'last-month') return `上月 ${rangeText}`;
  return rangeText;
};

const EMPTY_CUSTOM_RANGE: EvaluationTimeFilterValue = {
  type: 'custom',
  customStart: '',
  customEnd: '',
};

const EvaluationTimeFilterSheet: React.FC<EvaluationTimeFilterSheetProps> = ({
  open,
  value,
  termStartDate,
  termEndDate,
  referenceDate,
  onClose,
  onSelect,
}) => {
  const [customRange, setCustomRange] = useState(EMPTY_CUSTOM_RANGE);
  const [showCustomRange, setShowCustomRange] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowCustomRange(value.type === 'custom');
    setCustomRange(value.type === 'custom' ? value : EMPTY_CUSTOM_RANGE);
  }, [open, value]);

  const relativeOptions = useMemo(() => (
    [
      { value: 'this-week' as const, label: '本周' },
      { value: 'last-week' as const, label: '上周' },
      { value: 'this-month' as const, label: '本月' },
      { value: 'last-month' as const, label: '上月' },
    ].map(option => {
      const filterValue: EvaluationTimeFilterValue = { type: option.value, customStart: '', customEnd: '' };
      const range = getEvaluationDateRange(filterValue, termStartDate, termEndDate, referenceDate);
      return { ...option, range: formatShortRange(range.startDate, range.endDate) };
    })
  ), [referenceDate, termEndDate, termStartDate]);

  const customRangeInvalid = !customRange.customStart
    || !customRange.customEnd
    || customRange.customStart > customRange.customEnd
    || customRange.customStart < termStartDate
    || customRange.customEnd > termEndDate;

  const selectClass = (selected: boolean) => `flex min-h-[var(--tm-size-touch)] w-full items-center justify-between rounded-[var(--tm-radius-control)] px-3 text-left transition-colors ${selected
    ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
    : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`;

  const selectImmediately = (type: EvaluationTimeFilter) => {
    onSelect({ type, customStart: '', customEnd: '' });
    onClose();
  };

  return (
    <MobileBottomSheet open={open} title="选择记录时间" onClose={onClose}>
      <div className="space-y-5 pb-2">
        <section>
          <div className="space-y-1">
            <button type="button" onClick={() => selectImmediately('all')} className={selectClass(value.type === 'all')}>
              <span className="text-[13px] font-medium">全学期</span>
              {value.type === 'all' && <Check className="h-4 w-4" />}
            </button>
            {relativeOptions.map(option => (
              <button key={option.value} type="button" onClick={() => selectImmediately(option.value)} className={selectClass(value.type === option.value)}>
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="text-[13px] font-medium">{option.label}</span>
                  <span className="text-[12px] text-[var(--tm-text-tertiary)]">{option.range}</span>
                </span>
                {value.type === option.value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowCustomRange(current => !current)}
            aria-expanded={showCustomRange}
            className={selectClass(value.type === 'custom')}
          >
            <span className="text-[13px] font-medium">自定义</span>
            {value.type === 'custom' && <Check className="h-4 w-4" />}
          </button>
          {showCustomRange && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[12px] font-medium text-[var(--tm-text-secondary)]">
                  开始日期
                  <input
                    type="date"
                    min={termStartDate}
                    max={customRange.customEnd || termEndDate}
                    value={customRange.customStart}
                    onChange={event => setCustomRange(current => ({ ...current, customStart: event.target.value }))}
                    className="mt-1.5 h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-2 text-[12px] text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                  />
                </label>
                <label className="text-[12px] font-medium text-[var(--tm-text-secondary)]">
                  结束日期
                  <input
                    type="date"
                    min={customRange.customStart || termStartDate}
                    max={termEndDate}
                    value={customRange.customEnd}
                    onChange={event => setCustomRange(current => ({ ...current, customEnd: event.target.value }))}
                    className="mt-1.5 h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-2 text-[12px] text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={customRangeInvalid}
                onClick={() => {
                  onSelect(customRange);
                  onClose();
                }}
                className="min-h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[14px] font-semibold text-[var(--tm-text-inverse)] active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
              >
                应用日期
              </button>
            </div>
          )}
        </section>
      </div>
    </MobileBottomSheet>
  );
};

export default EvaluationTimeFilterSheet;
