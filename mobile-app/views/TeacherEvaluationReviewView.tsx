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
    adaptTeacherEvaluationReview,
    resolveAssistantReportDocument,
} from '../domain/assistantReportAdapters';
import {
    CURRENT_TEACHER_EVALUATION_REVIEW,
    TEACHER_EVALUATION_REVIEW_SAMPLE,
    type TeacherEvaluationReviewInsufficient,
    type TeacherEvaluationReviewPageData,
    type TeacherEvaluationReviewReport,
} from '../data/teacherEvaluationReview';
import type { ClassInfo } from '../types';

const REVIEW_ANALYSIS_STEPS = [
    '正在整理上月评价记录',
    '正在分析关注对象',
    '正在核对指标与表达',
    '正在生成评价复盘',
];

const ReviewAnalysisProgress: React.FC<{ visibleStepCount: number }> = ({ visibleStepCount }) => (
    <div className="mx-auto mt-8 min-h-[190px] max-w-[280px]" role="status" aria-live="polite" aria-label="正在生成我的评价复盘">
        <div className="space-y-4">
            {REVIEW_ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                    <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                        <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[var(--tm-assistant-role-primary)]' : 'bg-[var(--tm-border-subtle)]'}`} aria-hidden="true" />
                        <p className={`text-[length:var(--tm-font-size-meta)] leading-5 ${active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-tertiary)]'}`}>{step}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const InsufficientReview: React.FC<{
    data: TeacherEvaluationReviewInsufficient;
    onViewSample: () => void;
}> = ({ data, onViewSample }) => {
    const gap = Math.max(0, data.targetRecords - data.overview.records);

    return (
        <div className="mt-5">
            <h2 className="text-center text-[20px] font-bold leading-8 text-[var(--tm-text-primary)]">
                <span className="block">上月记录不足，</span>
                <span className="block">暂时无法生成评价复盘。</span>
            </h2>

            <section className="mt-6 rounded-[var(--tm-radius-card)] border border-[var(--tm-assistant-role-border)] bg-[var(--tm-bg-surface-glass)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]">
                <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">上月记录</h2>
                <div className="mt-1 flex min-h-14 items-center gap-3 py-2.5">
                    <span className="w-[72px] shrink-0 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">记录条数</span>
                    <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-card-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">
                        {data.overview.records}<span className="mx-1 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">/</span>{data.targetRecords}
                    </span>
                    <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-status-negative-strong)]">还差{gap}条</span>
                </div>
            </section>

            <p className="mt-5 px-2 text-[length:var(--tm-font-size-meta)] leading-6 text-[var(--tm-text-secondary)]">本月记录将用于下个月的评价复盘。</p>
            <button
                type="button"
                onClick={onViewSample}
                className="mt-2 flex h-11 w-full items-center justify-between px-2 text-left text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)] transition active:text-[var(--tm-assistant-role-text)]"
                aria-label="查看评价复盘示例"
            >
                <span>查看报告示例</span>
                <ChevronRight className="h-4 w-4 text-[var(--tm-text-tertiary)]" strokeWidth={2} />
            </button>
        </div>
    );
};

interface TeacherEvaluationReviewViewProps {
    onBack: () => void;
    onOpenHistory?: () => void;
    homeroomClasses?: ClassInfo[];
    activeClassId?: string;
    onClassChange?: (classId: string) => void;
    data?: TeacherEvaluationReviewPageData;
    report?: TeacherEvaluationReviewReport;
    reportPayload?: unknown;
    onRetry?: () => void;
    simulateLoading?: boolean;
}

const TeacherEvaluationReviewView: React.FC<TeacherEvaluationReviewViewProps> = ({
    onBack,
    onOpenHistory,
    homeroomClasses = [],
    activeClassId,
    onClassChange,
    data,
    report,
    reportPayload,
    onRetry,
    simulateLoading = true,
}) => {
    const pageData = data ?? report ?? CURRENT_TEACHER_EVALUATION_REVIEW;
    const [viewingExample, setViewingExample] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const activeClass = homeroomClasses.find(classInfo => classInfo.id === activeClassId);
    const activeReport = viewingExample
        ? TEACHER_EVALUATION_REVIEW_SAMPLE
        : pageData.status === 'generated' ? pageData : null;
    const shouldSimulateLoading = Boolean(activeReport && !viewingExample && simulateLoading);
    const [loading, setLoading] = useState(shouldSimulateLoading);
    const [visibleStepCount, setVisibleStepCount] = useState(shouldSimulateLoading ? 1 : REVIEW_ANALYSIS_STEPS.length);
    const reportResolution = useMemo(() => activeReport
        ? resolveAssistantReportDocument(
            viewingExample ? undefined : reportPayload,
            adaptTeacherEvaluationReview(activeReport),
        )
        : { document: null, issues: [] as string[] }, [activeReport, reportPayload, viewingExample]);

    useEffect(() => {
        if (!shouldSimulateLoading) {
            setLoading(false);
            setVisibleStepCount(REVIEW_ANALYSIS_STEPS.length);
            return;
        }

        setLoading(true);
        setVisibleStepCount(1);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stepDelay = 720;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleStepCount(REVIEW_ANALYSIS_STEPS.length);
        } else {
            REVIEW_ANALYSIS_STEPS.slice(1).forEach((_, index) => {
                timers.push(window.setTimeout(() => setVisibleStepCount(index + 2), (index + 1) * stepDelay));
            });
        }

        timers.push(window.setTimeout(
            () => setLoading(false),
            reduceMotion ? 600 : REVIEW_ANALYSIS_STEPS.length * stepDelay + 360,
        ));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [pageData.id, shouldSimulateLoading]);

    useEffect(() => {
        setViewingExample(false);
    }, [activeClassId]);

    const title = viewingExample ? TEACHER_EVALUATION_REVIEW_SAMPLE.title : pageData.title;
    const className = viewingExample ? TEACHER_EVALUATION_REVIEW_SAMPLE.className : pageData.className;
    const dataRange = viewingExample ? TEACHER_EVALUATION_REVIEW_SAMPLE.dataRange : pageData.dataRange;
    const showHeaderTitle = title !== '我的评价复盘';

    return (
        <div className="ai-assistant-theme-headteacher relative min-h-full overflow-hidden bg-transparent font-sans text-[var(--tm-text-primary)]">
            <AssistantSubpageHeader
                title={activeClass && !viewingExample ? undefined : showHeaderTitle ? title : className}
                centerContent={activeClass && !viewingExample ? (
                    <AssistantClassSwitchButton
                        activeClass={activeClass}
                        onClick={homeroomClasses.length > 1 ? () => setShowClassPicker(true) : undefined}
                    />
                ) : undefined}
                onBack={viewingExample ? () => setViewingExample(false) : onBack}
                backLabel={viewingExample ? '返回我的评价复盘' : '返回'}
                surface="transparent"
            />

            <main className="relative z-10 px-5 pb-10">
                <section className="relative pb-1 text-center">
                    <div className="relative flex min-h-11 items-center justify-center">
                        {showHeaderTitle && (
                            <p className="min-w-0 truncate px-2 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{className}</p>
                        )}
                        {!viewingExample && onOpenHistory && (
                            <AssistantHistoryLink
                                label="往期复盘"
                                onClick={onOpenHistory}
                                className="absolute right-0 top-0"
                            />
                        )}
                    </div>
                    {!loading && activeReport && (
                        <p className="mt-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
                            {viewingExample ? '示例内容 · ' : ''}根据你在{dataRange}的评价记录生成
                        </p>
                    )}
                </section>

                {activeReport ? (
                    loading ? (
                        <ReviewAnalysisProgress visibleStepCount={visibleStepCount} />
                    ) : reportResolution.document ? (
                        <AssistantReportCards document={reportResolution.document} className="mt-[var(--tm-space-4)]" />
                    ) : (
                        <AssistantReportContractError onRetry={onRetry} />
                    )
                ) : (
                    <InsufficientReview
                        data={pageData as TeacherEvaluationReviewInsufficient}
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
                />
            )}
        </div>
    );
};

export default TeacherEvaluationReviewView;
