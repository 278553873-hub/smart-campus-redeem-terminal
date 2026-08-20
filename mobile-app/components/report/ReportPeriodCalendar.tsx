import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MoralEducationPeriodOption, MoralEducationPeriodType } from '../../services/moralEducationCockpitService';

interface ReportPeriodCalendarProps {
    periods: MoralEducationPeriodOption[];
    selectedPeriodId: string;
    onSelect: (periodId: string) => void;
}

const parseDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const addMonths = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1);

const formatWeekRange = (period: MoralEducationPeriodOption) => {
    const start = parseDate(period.startDate);
    const end = parseDate(period.endDate);
    return `${start.getMonth() + 1}月${start.getDate()}日-${end.getMonth() + 1}月${end.getDate()}日`;
};

const getSchoolYearStart = (period: MoralEducationPeriodOption) => Number(period.id.match(/^(\d{4})/)?.[1] ?? parseDate(period.startDate).getFullYear());

const periodTypeLabels: Record<MoralEducationPeriodType, string> = {
    week: '周',
    month: '月份',
    term: '学期',
};

const pickerButtonClass = (selected: boolean, enabled: boolean) => (
    `relative flex min-h-[58px] items-center justify-center rounded-[var(--tm-radius-control)] px-[var(--tm-space-2)] text-[14px] font-semibold tabular-nums transition-[color,background-color,transform] [transition-duration:var(--tm-duration-fast)] ${selected
        ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]'
        : enabled
            ? 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-primary)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)]'
            : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-disabled)] opacity-60'}`
);

const PickerHeader = ({
    label,
    previousLabel,
    nextLabel,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
}: {
    label: string;
    previousLabel: string;
    nextLabel: string;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
}) => (
    <div className="mb-[var(--tm-space-3)] grid h-[var(--tm-size-touch)] grid-cols-[44px_minmax(0,1fr)_44px] items-center">
        <button type="button" onClick={onPrevious} disabled={!canGoPrevious} aria-label={previousLabel} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] disabled:opacity-25 active:bg-[var(--tm-bg-surface-soft)]">
            <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <strong className="truncate text-center text-[16px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{label}</strong>
        <button type="button" onClick={onNext} disabled={!canGoNext} aria-label={nextLabel} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] disabled:opacity-25 active:bg-[var(--tm-bg-surface-soft)]">
            <ChevronRight className="h-[18px] w-[18px]" />
        </button>
    </div>
);

const ReportPeriodCalendar: React.FC<ReportPeriodCalendarProps> = ({ periods, selectedPeriodId, onSelect }) => {
    const selectedPeriod = periods.find(period => period.id === selectedPeriodId) ?? periods[periods.length - 1];
    const periodType = selectedPeriod?.type ?? periods[0]?.type ?? 'week';
    const selectedEndDate = selectedPeriod ? parseDate(selectedPeriod.endDate) : new Date();
    const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), 1));
    const [visibleYear, setVisibleYear] = useState(selectedEndDate.getFullYear());
    const [visibleSchoolYear, setVisibleSchoolYear] = useState(() => selectedPeriod ? getSchoolYearStart(selectedPeriod) : selectedEndDate.getFullYear());

    useEffect(() => {
        if (!selectedPeriod) return;
        const endDate = parseDate(selectedPeriod.endDate);
        setVisibleMonth(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
        setVisibleYear(endDate.getFullYear());
        setVisibleSchoolYear(getSchoolYearStart(selectedPeriod));
    }, [selectedPeriod?.id]);

    const firstDate = periods[0] ? parseDate(periods[0].startDate) : visibleMonth;
    const lastDate = periods[periods.length - 1] ? parseDate(periods[periods.length - 1].endDate) : visibleMonth;
    const schoolYears = useMemo(() => periods.map(getSchoolYearStart), [periods]);

    if (periodType === 'week') {
        const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
        const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
        const visiblePeriods = periods.filter(period => parseDate(period.startDate) <= monthEnd && parseDate(period.endDate) >= monthStart);
        return (
            <div className="pb-[var(--tm-space-2)]">
                <PickerHeader
                    label={`${visibleMonth.getFullYear()}年 ${visibleMonth.getMonth() + 1}月`}
                    previousLabel="上个月"
                    nextLabel="下个月"
                    canGoPrevious={monthKey(visibleMonth) > monthKey(firstDate)}
                    canGoNext={monthKey(visibleMonth) < monthKey(lastDate)}
                    onPrevious={() => setVisibleMonth(current => addMonths(current, -1))}
                    onNext={() => setVisibleMonth(current => addMonths(current, 1))}
                />
                <div className="grid grid-cols-2 gap-[var(--tm-space-2)]" role="listbox" aria-label="周期范围">
                    {visiblePeriods.map(period => {
                        const selected = period.id === selectedPeriodId;
                        return <button key={period.id} type="button" role="option" aria-selected={selected} onClick={() => onSelect(period.id)} className={pickerButtonClass(selected, true)}>{formatWeekRange(period)}</button>;
                    })}
                </div>
            </div>
        );
    }

    if (periodType === 'month') {
        return (
            <div className="pb-[var(--tm-space-2)]">
                <PickerHeader
                    label={`${visibleYear}年`}
                    previousLabel="上一年"
                    nextLabel="下一年"
                    canGoPrevious={visibleYear > firstDate.getFullYear()}
                    canGoNext={visibleYear < lastDate.getFullYear()}
                    onPrevious={() => setVisibleYear(current => current - 1)}
                    onNext={() => setVisibleYear(current => current + 1)}
                />
                <div className="grid grid-cols-3 gap-[var(--tm-space-2)]" role="listbox" aria-label="月份">
                    {Array.from({ length: 12 }, (_, monthIndex) => {
                        const period = periods.find(item => parseDate(item.startDate).getFullYear() === visibleYear && parseDate(item.startDate).getMonth() === monthIndex);
                        const selected = period?.id === selectedPeriodId;
                        return (
                            <button key={monthIndex} type="button" role="option" disabled={!period} aria-selected={selected} onClick={() => period && onSelect(period.id)} className={pickerButtonClass(Boolean(selected), Boolean(period))}>
                                {monthIndex + 1}月
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const termPeriods = periods.filter(period => getSchoolYearStart(period) === visibleSchoolYear);
    return (
        <div className="pb-[var(--tm-space-2)]">
            <PickerHeader
                label={`${visibleSchoolYear}-${visibleSchoolYear + 1}学年`}
                previousLabel="上一学年"
                nextLabel="下一学年"
                canGoPrevious={visibleSchoolYear > Math.min(...schoolYears)}
                canGoNext={visibleSchoolYear < Math.max(...schoolYears)}
                onPrevious={() => setVisibleSchoolYear(current => current - 1)}
                onNext={() => setVisibleSchoolYear(current => current + 1)}
            />
            <div className="grid grid-cols-2 gap-[var(--tm-space-2)]" role="listbox" aria-label="学期">
                {['第一学期', '第二学期'].map((label, index) => {
                    const period = termPeriods.find(item => item.label.includes(label));
                    const selected = period?.id === selectedPeriodId;
                    return <button key={label} type="button" role="option" disabled={!period} aria-selected={selected} onClick={() => period && onSelect(period.id)} className={`${pickerButtonClass(Boolean(selected), Boolean(period))} min-h-[72px]`}>{label}</button>;
                })}
            </div>
        </div>
    );
};

export { periodTypeLabels };
export default ReportPeriodCalendar;
