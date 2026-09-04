import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import AssistantClassSwitchButton from '../components/AssistantClassSwitchButton';
import AssistantHistoryLink from '../components/AssistantHistoryLink';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import AssistantReportCards from '../components/assistant-report/AssistantReportCards';
import AssistantReportContractError from '../components/assistant-report/AssistantReportContractError';
import AssistantReportFooter from '../components/assistant-report/AssistantReportFooter';
import {
    adaptWeeklyActionAdviceReport,
    resolveAssistantReportDocument,
} from '../domain/assistantReportAdapters';
import {
    CURRENT_WEEKLY_ACTION_ADVICE,
    WEEKLY_ACTION_ADVICE_SAMPLE_REPORT,
    getWeeklyAdviceTarget,
    type WeeklyActionAdviceInsufficient,
    type WeeklyActionAdvicePageData,
    type WeeklyActionAdviceReport,
} from '../data/weeklyActionAdvice';
import type { ClassInfo } from '../types';

const ANALYSIS_STEPS = [
    '正在整理上周评价记录',
    '正在分析评价详情',
    '正在归纳班级重点',
    '正在生成本周行动建议',
];

const AnalysisProgress: React.FC<{ visibleStepCount: number }> = ({ visibleStepCount }) => (
    <div className="mx-auto mt-8 min-h-[190px] max-w-[280px]" role="status" aria-live="polite" aria-label="正在生成本周行动建议">
        <div className="space-y-4">
            {ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                    <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                        <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[var(--tm-assistant-role-primary)]' : 'bg-[var(--tm-border-subtle)]'}`} aria-hidden="true" />
                        <p className={`text-[length:var(--tm-font-size-meta)] tm-font-regular leading-5 ${active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-tertiary)]'}`}>{step}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const RequirementRow: React.FC<{
    label: string;
    current: number;
    target: number;
    unit: string;
}> = ({ label, current, target, unit }) => {
    const gap = Math.max(0, target - current);

    return (
        <div className="flex min-h-14 items-center gap-3 py-2.5">
            <span className="w-[72px] shrink-0 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{label}</span>
            <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-card-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">
                {current}<span className="mx-1 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">/</span>{target}
            </span>
            <span className={`shrink-0 text-[length:var(--tm-font-size-compact)] font-medium ${gap === 0 ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-status-negative-strong)]'}`}>
                {gap === 0 ? '已达标' : `还差${gap}${unit}`}
            </span>
        </div>
    );
};

const INSUFFICIENT_MESSAGE_FIRST_LINE = '上周数据不足，';
const INSUFFICIENT_MESSAGE_SECOND_LINE = '暂时无法生成本周行动建议。';
const INSUFFICIENT_MESSAGE = `${INSUFFICIENT_MESSAGE_FIRST_LINE}${INSUFFICIENT_MESSAGE_SECOND_LINE}`;

const InsufficientContent: React.FC<{
    data: WeeklyActionAdviceInsufficient;
    onViewSample: () => void;
}> = ({ data, onViewSample }) => {
    const previousTarget = getWeeklyAdviceTarget(data.previousWeek.total);
    const currentTarget = getWeeklyAdviceTarget(data.currentWeek.total);
    const readyForNextWeek = data.currentWeek.records >= currentTarget.records
        && data.currentWeek.covered >= currentTarget.covered;
    const [visibleMessageLength, setVisibleMessageLength] = useState(0);
    const [visibleRequirementCount, setVisibleRequirementCount] = useState(0);
    const visibleFirstLine = INSUFFICIENT_MESSAGE_FIRST_LINE.slice(0, visibleMessageLength);
    const visibleSecondLine = INSUFFICIENT_MESSAGE_SECOND_LINE.slice(
        0,
        Math.max(0, visibleMessageLength - INSUFFICIENT_MESSAGE_FIRST_LINE.length),
    );

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleMessageLength(INSUFFICIENT_MESSAGE.length);
            setVisibleRequirementCount(2);
            return;
        }

        setVisibleMessageLength(0);
        setVisibleRequirementCount(0);

        INSUFFICIENT_MESSAGE.split('').forEach((_, index) => {
            timers.push(window.setTimeout(() => setVisibleMessageLength(index + 1), 240 + index * 48));
        });

        const messageCompletedAt = 240 + INSUFFICIENT_MESSAGE.length * 48;
        timers.push(window.setTimeout(() => setVisibleRequirementCount(1), messageCompletedAt + 280));
        timers.push(window.setTimeout(() => setVisibleRequirementCount(2), messageCompletedAt + 640));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [data.id]);

    return (
        <div className="mt-5">
            <section className="px-2 text-center">
                <h2 className="mx-auto min-h-[60px] max-w-[300px] text-[20px] font-bold leading-[30px] text-[var(--tm-text-primary)]">
                    <span aria-hidden="true">
                        <span className="block">
                            {visibleFirstLine}
                            {visibleMessageLength < INSUFFICIENT_MESSAGE_FIRST_LINE.length && (
                                <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-[var(--tm-assistant-role-primary)] align-[-3px]" />
                            )}
                        </span>
                        <span className="block">
                            {visibleSecondLine}
                            {visibleMessageLength >= INSUFFICIENT_MESSAGE_FIRST_LINE.length
                                && visibleMessageLength < INSUFFICIENT_MESSAGE.length && (
                                <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-[var(--tm-assistant-role-primary)] align-[-3px]" />
                            )}
                        </span>
                    </span>
                    <span className="sr-only">{INSUFFICIENT_MESSAGE}</span>
                </h2>
            </section>

            {visibleRequirementCount > 0 && (
                <section className="waa-card-enter mt-6 rounded-[var(--tm-radius-card)] border border-[var(--tm-assistant-role-border)] bg-[var(--tm-bg-surface-glass)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]">
                    <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">上周数据</h2>
                    <div className="mt-1 divide-y divide-slate-100">
                        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <RequirementRow label="记录条数" current={data.previousWeek.records} target={previousTarget.records} unit="条" />
                        </div>
                        {visibleRequirementCount > 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <RequirementRow label="覆盖同学" current={data.previousWeek.covered} target={previousTarget.covered} unit="人" />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {visibleRequirementCount === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <p className="mt-5 px-2 text-[length:var(--tm-font-size-meta)] leading-6 text-[var(--tm-text-secondary)]">
                        {readyForNextWeek
                            ? '本周已达到以上条件，下周进入班主任助理即可生成。'
                            : '本周达到以上条件后，下周进入班主任助理即可生成。'}
                    </p>

                    <button
                        type="button"
                        onClick={onViewSample}
                        className="mt-2 flex h-11 w-full items-center justify-between px-2 text-left text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)] transition active:text-[var(--tm-assistant-role-text)]"
                        aria-label="查看报告示例"
                    >
                        <span>查看报告示例</span>
                        <ChevronRight className="h-4 w-4 text-[var(--tm-text-tertiary)]" strokeWidth={2} />
                    </button>
                </div>
            )}
        </div>
    );
};

interface WeeklyActionAdviceViewProps {
    onBack: () => void;
    onOpenHistory?: () => void;
    homeroomClasses?: ClassInfo[];
    activeClassId?: string;
    onClassChange?: (classId: string) => void;
    getClassLabel?: (classInfo: ClassInfo) => string;
    data?: WeeklyActionAdvicePageData;
    report?: WeeklyActionAdviceReport;
    reportPayload?: unknown;
    onRetry?: () => void;
    simulateLoading?: boolean;
}

const WeeklyActionAdviceView: React.FC<WeeklyActionAdviceViewProps> = ({
    onBack,
    onOpenHistory,
    homeroomClasses = [],
    activeClassId,
    onClassChange,
    getClassLabel = classInfo => classInfo.name,
    data,
    report,
    reportPayload,
    onRetry,
    simulateLoading = true,
}) => {
    const pageData = data ?? report ?? CURRENT_WEEKLY_ACTION_ADVICE;
    const [viewingExample, setViewingExample] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const activeClass = homeroomClasses.find(classInfo => classInfo.id === activeClassId);
    const activeReport = viewingExample
        ? WEEKLY_ACTION_ADVICE_SAMPLE_REPORT
        : pageData.status === 'generated' ? pageData : null;
    const shouldSimulateLoading = Boolean(activeReport && !viewingExample && simulateLoading);
    const [loading, setLoading] = useState(shouldSimulateLoading);
    const [visibleStepCount, setVisibleStepCount] = useState(shouldSimulateLoading ? 1 : ANALYSIS_STEPS.length);
    const reportResolution = useMemo(() => activeReport
        ? resolveAssistantReportDocument(
            viewingExample ? undefined : reportPayload,
            adaptWeeklyActionAdviceReport(activeReport),
        )
        : { document: null, issues: [] as string[] }, [activeReport, reportPayload, viewingExample]);

    useEffect(() => {
        if (!shouldSimulateLoading) {
            setLoading(false);
            setVisibleStepCount(ANALYSIS_STEPS.length);
            return;
        }

        setLoading(true);
        setVisibleStepCount(1);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stepDelay = 720;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleStepCount(ANALYSIS_STEPS.length);
        } else {
            ANALYSIS_STEPS.slice(1).forEach((_, index) => {
                timers.push(window.setTimeout(() => setVisibleStepCount(index + 2), (index + 1) * stepDelay));
            });
        }

        timers.push(window.setTimeout(
            () => setLoading(false),
            reduceMotion ? 600 : ANALYSIS_STEPS.length * stepDelay + 360,
        ));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [pageData.id, shouldSimulateLoading]);

    useEffect(() => {
        setViewingExample(false);
    }, [activeClassId]);

    const title = viewingExample ? WEEKLY_ACTION_ADVICE_SAMPLE_REPORT.title : pageData.title;
    const className = viewingExample ? WEEKLY_ACTION_ADVICE_SAMPLE_REPORT.className : activeClass ? getClassLabel(activeClass) : pageData.className;
    const showHeaderTitle = title !== '本周行动建议';

    return (
        <div className="ai-assistant-theme-headteacher relative min-h-full overflow-hidden bg-transparent font-sans text-[var(--tm-text-primary)]">
            <AssistantSubpageHeader
                title={activeClass && !viewingExample ? undefined : showHeaderTitle ? title : className}
                centerContent={activeClass && !viewingExample ? (
                    <AssistantClassSwitchButton
                        activeClass={activeClass}
                        classLabel={activeClass ? getClassLabel(activeClass) : undefined}
                        onClick={homeroomClasses.length > 1 ? () => setShowClassPicker(true) : undefined}
                    />
                ) : undefined}
                onBack={viewingExample ? () => setViewingExample(false) : onBack}
                backLabel={viewingExample ? '返回本周行动建议' : '返回'}
                surface="transparent"
            />

            <main className="relative z-10 px-5 pb-10">
                <section className="relative pb-1 text-center">
                    <div className="relative flex min-h-11 items-center justify-center">
                        {showHeaderTitle && (
                            <p className={`min-w-0 truncate px-2 ${activeReport ? 'text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]' : 'text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]'}`}>{className}</p>
                        )}
                        {!viewingExample && onOpenHistory && (
                            <AssistantHistoryLink
                                label="往期建议"
                                onClick={onOpenHistory}
                                className="absolute right-0 top-0"
                            />
                        )}
                    </div>
                    {!loading && activeReport && (
                        <p className="mt-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
                            {viewingExample ? '示例内容 · ' : ''}根据{activeReport.dataRange}评价记录生成
                        </p>
                    )}
                </section>

                {activeReport ? (
                    loading ? (
                        <AnalysisProgress visibleStepCount={visibleStepCount} />
                    ) : reportResolution.document ? (
                        <AssistantReportCards document={reportResolution.document} className="mt-[var(--tm-space-4)]" />
                    ) : (
                        <AssistantReportContractError onRetry={onRetry} />
                    )
                ) : (
                    <InsufficientContent
                        data={pageData as WeeklyActionAdviceInsufficient}
                        onViewSample={() => setViewingExample(true)}
                    />
                )}

                {!loading && activeReport && reportResolution.document && (
                    <AssistantReportFooter document={reportResolution.document} example={viewingExample} className="mx-0" />
                )}
            </main>

            {showClassPicker && onClassChange && (
                <HomeroomClassPickerSheet
                    classes={homeroomClasses}
                    selectedClassId={activeClassId}
                    onClose={() => setShowClassPicker(false)}
                    onSelect={(classId) => {
                        onClassChange(classId);
                        setShowClassPicker(false);
                    }}
                    getClassLabel={getClassLabel}
                />
            )}
        </div>
    );
};

export default WeeklyActionAdviceView;
