import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChevronRightIcon } from '../components/Icons';
import ReportPeriodCalendar from '../components/report/ReportPeriodCalendar';
import ClassRankingList from '../components/ui/ClassRankingList';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import PillSelectionControl from '../components/ui/PillSelectionControl';
import { getTeacherClassDisplayName, getTeacherSchoolGradeOptions, type ClassLeaderboardSettlementCycle, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';
import type { ClassInfo } from '../types';

interface ClassLeaderboardViewProps {
    settlementCycle: ClassLeaderboardSettlementCycle;
    currentSpace: TeacherSpaceOption;
    classes: ClassInfo[];
    onOpenEvaluationRecords: () => void;
}

type Dimension = 'total' | '诗意中队' | '安全班级' | '健体班级' | '文雅班级' | '美净班级';

interface LeaderboardPeriodOption {
    id: string;
    type: ClassLeaderboardSettlementCycle;
    startDate: string;
    endDate: string;
    label: string;
    trendLabel: string;
}

type ClassRankingItem = {
    id: string;
    name: string;
    score: number;
};

const dimensions: Dimension[] = ['total', '诗意中队', '安全班级', '健体班级', '文雅班级', '美净班级'];
const recentRecords = [
    { id: 'r_1', classId: 'c_2025_1', className: '2025级1班', indicator: '安全班级 / 课间纪律 / 走廊奔跑', score: -2, time: '2分钟前' },
    { id: 'r_2', classId: 'c_2024_3', className: '2024级3班', indicator: '美净班级 / 卫生保持 / 地面清洁', score: 1, time: '8分钟前' },
    { id: 'r_3', classId: 'c_2023_5', className: '2023级5班', indicator: '诗意中队 / 少先队礼仪 / 佩戴规范', score: 2, time: '16分钟前' },
    { id: 'r_4', classId: 'c_2022_4', className: '2022级4班', indicator: '文雅班级 / 路队管理 / 文明放学', score: -1, time: '25分钟前' },
    { id: 'r_5', classId: 'c_2021_2', className: '2021级2班', indicator: '健体班级 / 早操体锻 / 队列姿态', score: 2, time: '36分钟前' },
] as const;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatShortDate = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;

const createSettlementPeriods = (
    settlementCycle: ClassLeaderboardSettlementCycle,
    today: Date,
): LeaderboardPeriodOption[] => {
    if (settlementCycle === 'month') {
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return Array.from({ length: 12 }, (_, index) => {
            const start = addMonths(currentMonth, index - 11);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            return {
                id: `month-${toDateKey(start)}`,
                type: 'month',
                startDate: toDateKey(start),
                endDate: toDateKey(end),
                label: `${start.getFullYear()}年${start.getMonth() + 1}月`,
                trendLabel: `${start.getMonth() + 1}月`,
            };
        });
    }

    const currentWeekStart = addDays(today, -((today.getDay() + 6) % 7));
    return Array.from({ length: 12 }, (_, index) => {
        const start = addDays(currentWeekStart, (index - 11) * 7);
        const end = addDays(start, 6);
        return {
            id: `week-${toDateKey(start)}`,
            type: 'week',
            startDate: toDateKey(start),
            endDate: toDateKey(end),
            label: `${formatShortDate(start)}-${formatShortDate(end)}`,
            trendLabel: `${start.getMonth() + 1}.${start.getDate()}-${end.getMonth() + 1}.${end.getDate()}`,
        };
    });
};

const hashText = (value: string) => Array.from(value).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
);

const getRankedClasses = (items: ClassRankingItem[]): Array<ClassRankingItem & { rank: number }> => {
    const sortedItems = [...items].sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'zh-Hans-CN'));
    let previousScore: number | null = null;
    let previousRank = 0;

    return sortedItems.map((item, index) => {
        const rank = previousScore === item.score ? previousRank : index + 1;
        previousScore = item.score;
        previousRank = rank;
        return { ...item, rank };
    });
};

const getRankings = (grade: string, periodId: string, activeDimension: Dimension, classes: ClassInfo[], currentSpace: TeacherSpaceOption) => {
    const baseScore = activeDimension === 'total' ? 100 : 20;
    const seed = hashText(`${grade}-${periodId}-${activeDimension}`);
    const scopedClasses = grade === '全部年级' ? classes : classes.filter(classInfo => classInfo.gradeLevel === grade);

    const rankings = scopedClasses.map((classInfo, index) => {
        const deductionStep = activeDimension === 'total' ? 1.5 : 0.5;
        const deduction = Math.floor(index * deductionStep) + ((seed + index * 7) % 2);
        return {
            id: classInfo.id,
            name: getTeacherClassDisplayName(classInfo, currentSpace),
            score: Math.max(0, baseScore - deduction),
        };
    });

    return getRankedClasses(rankings);
};

const ClassLeaderboardView: React.FC<ClassLeaderboardViewProps> = ({ settlementCycle, currentSpace, classes, onOpenEvaluationRecords }) => {
    const today = useMemo(() => startOfDay(new Date()), []);
    const periods = useMemo(() => createSettlementPeriods(settlementCycle, today), [settlementCycle, today]);
    const [selectedPeriodId, setSelectedPeriodId] = useState(() => periods[periods.length - 1]?.id ?? '');
    const [isPeriodSheetOpen, setIsPeriodSheetOpen] = useState(false);
    const [activeGrade, setActiveGrade] = useState('全部年级');
    const [activeDimension, setActiveDimension] = useState<Dimension>('total');
    const [showFullRanking, setShowFullRanking] = useState(false);

    const selectedPeriod = periods.find(period => period.id === selectedPeriodId) ?? periods[periods.length - 1];
    const selectedPeriodIndex = periods.findIndex(period => period.id === selectedPeriod?.id);
    const currentPeriod = periods[periods.length - 1];
    const rankings = useMemo(
        () => getRankings(activeGrade, selectedPeriod?.id ?? '', activeDimension, classes, currentSpace),
        [activeDimension, activeGrade, classes, currentSpace, selectedPeriod?.id],
    );
    const currentPeriodPrefix = settlementCycle === 'week' ? '本周' : '本月';
    const selectedPeriodLabel = selectedPeriod?.id === currentPeriod?.id
        ? `${currentPeriodPrefix} ${selectedPeriod.label}`
        : selectedPeriod?.label ?? '';
    const periodUnitLabel = settlementCycle === 'week' ? '周' : '月';
    const periodPickerTitle = settlementCycle === 'week' ? '选择周' : '选择月份';
    const gradeOptions = ['全部年级', ...(getTeacherSchoolGradeOptions(currentSpace) ?? Array.from(new Set(classes.map(classInfo => classInfo.gradeLevel))))];
    const displayRecentRecords = recentRecords.map(record => ({
        ...record,
        className: classes.find(classInfo => classInfo.id === record.classId)
            ? getTeacherClassDisplayName(classes.find(classInfo => classInfo.id === record.classId)!, currentSpace)
            : record.className,
    }));

    const changePeriod = (offset: number) => {
        const targetPeriod = periods[selectedPeriodIndex + offset];
        if (targetPeriod) setSelectedPeriodId(targetPeriod.id);
    };

    useEffect(() => {
        setSelectedPeriodId(currentPeriod?.id ?? '');
    }, [currentPeriod?.id, settlementCycle]);

    return (
        <div className="flex min-h-full flex-col items-center bg-[var(--tm-page-plain-content-bg)]">
            <div className="relative flex min-h-full w-full max-w-md flex-col">
                <section className="sticky top-0 z-20 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]" aria-label="排行榜周期切换">
                    <div className="grid h-[var(--tm-size-touch)] grid-cols-[44px_minmax(0,1fr)_44px] items-center px-[var(--tm-space-2)]">
                        <button
                            type="button"
                            disabled={selectedPeriodIndex <= 0}
                            onClick={() => changePeriod(-1)}
                            aria-label={`查看上一${periodUnitLabel}`}
                            className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                        >
                            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPeriodSheetOpen(true)}
                            aria-label={`打开${settlementCycle === 'week' ? '周历' : '月份'}选择，当前${selectedPeriodLabel}`}
                            className="flex h-[var(--tm-size-touch)] min-w-0 items-center justify-center gap-1.5 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                        >
                            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />
                            <span className="truncate">{selectedPeriodLabel}</span>
                        </button>
                        <button
                            type="button"
                            disabled={selectedPeriodIndex < 0 || selectedPeriodIndex >= periods.length - 1}
                            onClick={() => changePeriod(1)}
                            aria-label={`查看下一${periodUnitLabel}`}
                            className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                        >
                            <ChevronRight aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </div>
                </section>

                <div className="flex-1 space-y-4 p-4">
                    <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]">
                        <div className="flex min-h-11 items-center justify-between gap-3">
                            <h3 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">班级排行榜</h3>
                            <label className="relative -mr-2 flex min-h-[var(--tm-size-touch)] min-w-0 items-center">
                                <span className="sr-only">班级排行榜年级筛选</span>
                                <select
                                    value={activeGrade}
                                    onChange={event => setActiveGrade(event.target.value)}
                                    aria-label="班级排行榜年级筛选"
                                    className="h-[var(--tm-size-touch)] max-w-[128px] appearance-none bg-transparent pl-2 pr-7 text-right text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] outline-none focus-visible:text-[var(--tm-text-primary)]"
                                >
                                    {gradeOptions.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                                </select>
                                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 h-4 w-4 text-[var(--tm-text-tertiary)]" />
                            </label>
                        </div>

                        <PillSelectionControl
                            value={activeDimension}
                            items={dimensions.map(dimension => ({ value: dimension, label: dimension === 'total' ? '综合评价' : dimension }))}
                            onChange={setActiveDimension}
                            ariaLabel="班级排行榜维度"
                            className="mb-2"
                        />

                        <ClassRankingList
                            items={rankings.slice(0, 5)}
                            ariaLabel="班级排行榜前五名"
                            onViewAll={rankings.length > 5 ? () => setShowFullRanking(true) : undefined}
                            actionLabel="查看完整排名"
                        />
                    </section>

                    <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]">
                        <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-11 items-center justify-between">
                            <h3 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">评价记录</h3>
                            <button
                                type="button"
                                onClick={onOpenEvaluationRecords}
                                aria-label="查看全部评价记录"
                                className="-my-2 flex min-h-[var(--tm-size-touch)] items-center gap-0.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
                            >
                                更多 <ChevronRightIcon className="h-3 w-3" />
                            </button>
                        </div>

                        <div role="list" aria-label="全校最新评价记录">
                            {displayRecentRecords.map(record => (
                                <div key={record.id} role="listitem" className="flex min-h-[58px] items-start gap-3 border-b border-[var(--tm-border-subtle)] py-3 last:border-0">
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${record.score > 0 ? 'bg-[var(--tm-chart-positive)]' : 'bg-[var(--tm-chart-negative)]'}`} aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{record.className}</span>
                                            <span className="shrink-0 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{record.time}</span>
                                        </div>
                                        <div className="mt-1 flex items-start justify-between gap-3">
                                            <span className="min-w-0 text-[length:var(--tm-font-size-meta)] leading-5 text-[var(--tm-text-secondary)]">{record.indicator}</span>
                                            <strong className={`shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums ${record.score > 0 ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                                                {record.score > 0 ? '+' : ''}{record.score}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <MobileBottomSheet
                    open={isPeriodSheetOpen}
                    title={periodPickerTitle}
                    onClose={() => setIsPeriodSheetOpen(false)}
                    headerAction={settlementCycle === 'week' && currentPeriod ? {
                        label: '本周',
                        onClick: () => {
                            setSelectedPeriodId(currentPeriod.id);
                            setIsPeriodSheetOpen(false);
                        },
                    } : undefined}
                >
                    <ReportPeriodCalendar
                        periods={periods}
                        selectedPeriodId={selectedPeriod?.id ?? ''}
                        onSelect={periodId => {
                            setSelectedPeriodId(periodId);
                            setIsPeriodSheetOpen(false);
                        }}
                    />
                </MobileBottomSheet>

                <MobileBottomSheet open={showFullRanking} title={`${activeGrade}完整排名`} onClose={() => setShowFullRanking(false)}>
                    <PillSelectionControl
                        value={activeDimension}
                        items={dimensions.map(dimension => ({ value: dimension, label: dimension === 'total' ? '综合评价' : dimension }))}
                        onChange={setActiveDimension}
                        ariaLabel="完整排名评价维度"
                        className="-mt-1 mb-1"
                    />
                    <ClassRankingList items={rankings} ariaLabel="全部班级排名" />
                </MobileBottomSheet>
            </div>
        </div>
    );
};

export default ClassLeaderboardView;
