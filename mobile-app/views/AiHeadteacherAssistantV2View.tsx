import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    ListChecks,
    LoaderCircle,
    Sparkles,
    X,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import {
    CLASS_EVALUATION_WEEKS,
    DEFAULT_CLASS_EVALUATION_WEEK_ID,
    getClassEvaluationRecords,
    getClassEvaluationSnapshot,
    getClassEvaluationWeek,
    type ClassEvaluationDimensionRanking,
    type ClassEvaluationWeek,
} from '../data/classEvaluationAssistantV2';
import {
    CLASS_EVALUATION_FIXED_QUESTIONS,
    askClassEvaluationQuestion,
    getRecordsFromAnswer,
    type ClassEvaluationAssistantAnswer,
    type ClassEvaluationRecord,
    type ClassEvaluationSnapshot,
} from '../domain/classEvaluationAssistantV2';
import type { ClassInfo } from '../types';

interface AiHeadteacherAssistantV2ViewProps {
    onBack: () => void;
    homeroomClasses: ClassInfo[];
    activeClassId: string;
    onClassChange: (classId: string) => void;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    answer?: ClassEvaluationAssistantAnswer;
}

const formatScore = (score: number) => score.toFixed(1);
const formatCompactScore = (score: number) => Number.isInteger(score) ? String(score) : score.toFixed(1);

const formatRecordDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${Number(month)}月${Number(day)}日`;
};

const getAssistantIntro = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好';
    return `${greeting}，我将为您提供数据分析和指导建议。`;
};

const getTypeDelay = (char: string) => {
    if (char === '，') return 150;
    if (char === '。') return 220;
    return 56;
};

const ClassSwitchButton: React.FC<{
    className?: string;
    activeClass?: ClassInfo;
    onClick: () => void;
}> = ({ className = '', activeClass, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex min-h-11 max-w-[190px] min-w-0 items-center justify-center gap-1 rounded-full pl-3 pr-2.5 text-[14px] font-semibold text-[var(--tm-text-primary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] ${className}`}
        aria-label={'切换班级，当前' + (activeClass?.name ?? '未选择')}
    >
        <span className="truncate">{activeClass?.name ?? '选择班级'}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" strokeWidth={2.2} aria-hidden="true" />
    </button>
);

const FixedQuestionList: React.FC<{
    disabled?: boolean;
    onSelect: (question: string) => void;
}> = ({ disabled = false, onSelect }) => (
    <div className="headteacher-agent-glass space-y-1 overflow-hidden rounded-[var(--tm-radius-card)] p-1" aria-label="固定问题">
        {CLASS_EVALUATION_FIXED_QUESTIONS.map(question => (
            <button
                key={question.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(question.label)}
                className="flex min-h-11 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface-strong)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
            >
                <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[var(--tm-text-primary)]">{question.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 translate-x-px text-[var(--tm-text-disabled)]" aria-hidden="true" />
            </button>
        ))}
    </div>
);

const AnswerContent: React.FC<{
    answer: ClassEvaluationAssistantAnswer;
    onOpenDetails: (answer: ClassEvaluationAssistantAnswer) => void;
}> = ({ answer, onOpenDetails }) => (
    <div>
        <p className="text-pretty whitespace-pre-line text-[15px] font-semibold leading-6 text-[var(--tm-text-primary)]">{answer.message}</p>

        <section className="mt-4" aria-labelledby="answer-data-overview">
            <h3 id="answer-data-overview" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                <ClipboardList className="h-4 w-4 text-[var(--tm-assistant-role-text)]" strokeWidth={2.1} aria-hidden="true" />
                数据概览
            </h3>

            {answer.metrics.length > 0 && (
                <dl className={'mt-3 grid gap-3 ' + (answer.metrics.length === 1 ? 'grid-cols-1' : answer.metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                    {answer.metrics.map(metric => (
                        <div key={metric.label} className="min-w-0">
                            <dt className="truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{metric.label}</dt>
                            <dd className={'mt-1 truncate text-[18px] font-bold tabular-nums ' + (metric.tone === 'negative' ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-assistant-role-text)]')}>{metric.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {answer.breakdown.length > 0 && (
                <div className="mt-3 space-y-0.5">
                    {answer.breakdown.map((item, index) => (
                        <div key={item.label + '-' + index} className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5">
                            <div className="min-w-0">
                                <div className="truncate text-[13px] font-semibold text-[var(--tm-text-primary)]">{item.label}</div>
                                <div className="mt-0.5 truncate text-[11px] text-[var(--tm-text-tertiary)]">{item.detail}</div>
                            </div>
                            <div className={'text-[13px] font-bold tabular-nums ' + (item.tone === 'negative' ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-text-primary)]')}>{item.value}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {answer.analysis.length > 0 && (
            <section className="mt-4" aria-labelledby="answer-ai-analysis">
                <h3 id="answer-ai-analysis" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                    <Sparkles className="h-4 w-4 text-[var(--tm-assistant-role-text)]" strokeWidth={2.1} aria-hidden="true" />
                    AI分析
                </h3>
                <div className="mt-2 space-y-2">
                    {answer.analysis.map(item => (
                        <p key={item.title} className="text-pretty text-[13px] leading-5 text-[var(--tm-text-secondary)]">
                            <span className="font-semibold text-[var(--tm-text-primary)]">{item.title}：</span>{item.body}
                        </p>
                    ))}
                </div>
            </section>
        )}

        {answer.suggestions.length > 0 && (
            <section className="mt-4" aria-labelledby="answer-ai-suggestions">
                <h3 id="answer-ai-suggestions" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                    <ListChecks className="h-4 w-4 text-[var(--tm-assistant-role-text)]" strokeWidth={2.1} aria-hidden="true" />
                    AI建议
                </h3>
                <div className="mt-2 space-y-2">
                    {answer.suggestions.map(item => (
                        <p key={item.title} className="text-pretty text-[13px] leading-5 text-[var(--tm-text-secondary)]">
                            <span className="font-semibold text-[var(--tm-text-primary)]">{item.title}：</span>{item.body}
                        </p>
                    ))}
                </div>
            </section>
        )}

        {answer.evidenceRefs.length > 0 && (
            <div className="mt-3 flex justify-end">
                <button
                    type="button"
                    onClick={() => onOpenDetails(answer)}
                    className="flex min-h-[var(--tm-size-touch)] items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    aria-label={'查看' + answer.evidenceRefs.length + '笔数据依据'}
                >
                    查看依据
                    <span className="font-medium tabular-nums text-[var(--tm-text-tertiary)]">{answer.evidenceRefs.length}笔</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        )}
    </div>
);

const RecordDetailList: React.FC<{
    records: ClassEvaluationRecord[];
    showDimension?: boolean;
}> = ({ records, showDimension = true }) => (
    <div className="divide-y divide-[var(--tm-border-subtle)]">
        {records.map(record => (
            <article key={record.id} className="py-4 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[var(--tm-text-primary)]">{record.indicator}</div>
                        <div className="mt-1 text-[12px] text-[var(--tm-text-tertiary)]">
                            {formatRecordDate(record.date)}{showDimension ? ` · ${record.dimension}` : ''}
                        </div>
                    </div>
                    <div className="shrink-0 text-[16px] font-bold tabular-nums text-[var(--tm-status-negative)]">-{record.deduction.toFixed(1)}分</div>
                </div>

                <p className="mt-3 text-[14px] leading-6 text-[var(--tm-text-primary)]">{record.finding}</p>

                <dl className="mt-3 text-[12px] leading-5">
                    <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-2">
                        <dt className="text-[var(--tm-text-tertiary)]">扣分依据</dt>
                        <dd className="text-[var(--tm-text-secondary)]">{record.rule}</dd>
                    </div>
                </dl>
            </article>
        ))}
    </div>
);

const DimensionScoreBullet: React.FC<{
    score: number;
    maxScore: number;
}> = ({ score, maxScore }) => {
    const percentage = maxScore > 0
        ? Math.min(100, Math.max(0, (score / maxScore) * 100))
        : 0;

    return (
        <span className="flex min-w-0 flex-col items-center gap-1" aria-hidden="true">
            <span className="text-[10px] font-semibold tabular-nums leading-none text-[var(--tm-text-primary)]">
                {formatCompactScore(score)}/{formatCompactScore(maxScore)}
            </span>
            <span className="relative h-1.5 w-full rounded-full bg-[var(--tm-assistant-role-soft-strong)]">
                <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--tm-assistant-role-primary)]"
                    style={{ width: `${percentage}%` }}
                />
                <span className="absolute -right-px -top-0.5 h-2.5 w-px rounded-full bg-[var(--tm-text-secondary)]" />
            </span>
        </span>
    );
};

const DimensionRankingTable: React.FC<{
    rankings: ClassEvaluationDimensionRanking[];
    onSelect: (dimension: string) => void;
    selectedDimension?: string;
}> = ({ rankings, onSelect, selectedDimension }) => (
    <div className="px-3 pb-2">
        <div className="grid min-h-8 grid-cols-[minmax(0,1fr)_88px_60px_60px] items-center rounded-[var(--tm-radius-control)] bg-[var(--tm-role-headteacher-glass-surface-strong)] px-2 text-[10px] font-medium text-[var(--tm-text-tertiary)]">
            <span>指标</span>
            <span className="text-center">分数/总分</span>
            <span className="text-center">年级排名</span>
            <span className="text-center">全校排名</span>
        </div>
        <div className="mt-0.5 space-y-0.5">
            {rankings.map(item => (
                <button
                    key={item.dimension}
                    type="button"
                    onClick={() => onSelect(item.dimension)}
                    className={'grid min-h-12 w-full grid-cols-[minmax(0,1fr)_88px_60px_60px] items-center rounded-[var(--tm-radius-control)] px-2 text-left transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:bg-[var(--tm-role-headteacher-glass-surface-strong)] focus-visible:outline-none ' + (selectedDimension === item.dimension ? 'bg-[var(--tm-role-headteacher-glass-surface-strong)]' : '')}
                    aria-label={`${item.dimension}，${formatCompactScore(item.score)}/${formatCompactScore(item.maxScore)}分，年级第${item.gradeRank}名，全校第${item.schoolRank}名，查看扣分情况`}
                    aria-pressed={selectedDimension === item.dimension || undefined}
                >
                    <span className="min-w-0 truncate pr-2 text-[12px] font-semibold text-[var(--tm-text-primary)]">{item.dimension}</span>
                    <DimensionScoreBullet score={item.score} maxScore={item.maxScore} />
                    <span className="text-center text-[12px] font-medium tabular-nums text-[var(--tm-text-secondary)]">第{item.gradeRank}</span>
                    <span className="text-center text-[12px] font-medium tabular-nums text-[var(--tm-text-secondary)]">第{item.schoolRank}</span>
                </button>
            ))}
        </div>
    </div>
);

const DimensionTabs: React.FC<{
    rankings: ClassEvaluationDimensionRanking[];
    selectedDimension: string;
    onSelect: (dimension: string) => void;
    className?: string;
}> = ({ rankings, selectedDimension, onSelect, className = '' }) => (
    <div className={`overflow-x-auto no-scrollbar ${className}`} role="tablist" aria-label="一级指标">
        <div className="flex min-w-max">
            {rankings.map(item => {
                const selected = item.dimension === selectedDimension;
                return (
                    <button
                        key={item.dimension}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onSelect(item.dimension)}
                        className={'relative min-h-11 shrink-0 px-3 text-[13px] font-semibold transition-[color,background-color] duration-150 ease-out after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (selected
                            ? 'text-[var(--tm-text-primary)] after:bg-[var(--tm-assistant-role-primary)]'
                            : 'text-[var(--tm-text-tertiary)] after:bg-transparent active:bg-[var(--tm-bg-surface-soft)]')}
                    >
                        {item.dimension}
                    </button>
                );
            })}
        </div>
    </div>
);

const WeekOverviewPanel: React.FC<{
    week: ClassEvaluationWeek;
    snapshot: ClassEvaluationSnapshot;
    expanded: boolean;
    onToggleExpanded: () => void;
    onOpenDimensionDetails: (dimension: string) => void;
    onOpenDetails: () => void;
    onOpenWeekDetail: () => void;
}> = ({
    week,
    snapshot,
    expanded,
    onToggleExpanded,
    onOpenDimensionDetails,
    onOpenDetails,
    onOpenWeekDetail,
}) => (
    <section className="headteacher-agent-glass relative z-10 mx-4 -mt-5 overflow-hidden rounded-[var(--tm-radius-card)]" aria-labelledby="week-data-title">
        <div className="px-4 pt-4">
            <div className="flex min-h-11 items-center justify-between gap-3">
                <h2 id="week-data-title" className="shrink-0 text-balance text-[17px] font-bold text-[var(--tm-text-primary)]">本周数据</h2>
                <button
                    type="button"
                    onClick={onOpenWeekDetail}
                    className="flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-control)] pl-2 pr-1.5 text-[11px] font-medium tabular-nums text-[var(--tm-text-tertiary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    aria-label={'打开周数据页面，当前' + week.dataRangeLabel}
                >
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} aria-hidden="true" />
                    <span className="truncate">{week.dataRangeLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>
            </div>

            <dl className="mt-1 grid grid-cols-2 gap-6 pb-2 pt-3">
                <div className="min-w-0">
                    <dt className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">本周总分</dt>
                    <dd className="mt-2 whitespace-nowrap text-[28px] font-bold tabular-nums text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                </div>
                <div className="min-w-0">
                    <dt className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">年级排名</dt>
                    <dd className="mt-2 whitespace-nowrap text-[28px] font-bold tabular-nums text-[var(--tm-text-primary)]">第{week.gradeRank}<span className="ml-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                </div>
            </dl>
        </div>

        <div className="flex min-h-[var(--tm-size-touch)] items-center justify-end px-4">
            <button
                type="button"
                onClick={onToggleExpanded}
                className={'relative flex items-center justify-center overflow-visible rounded-full bg-[var(--tm-bg-surface)] text-[13px] font-medium text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] after:absolute after:content-[\'\'] transition-[width,height,scale,background-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none ' + (expanded
                    ? 'h-[var(--tm-assistant-icon-control-visual-size)] w-[var(--tm-assistant-icon-control-visual-size)] after:-inset-1'
                    : 'h-[var(--tm-assistant-secondary-pill-height)] w-[var(--tm-assistant-category-pill-width)] after:-inset-y-[7px] after:inset-x-0')}
                aria-expanded={expanded}
                aria-controls="week-dimension-list"
                aria-label={expanded ? '收起分类数据' : '展开分类数据'}
            >
                <span className={'flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap transition-[max-width,opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ' + (expanded ? 'max-w-0 scale-[0.25] opacity-0 blur-[4px]' : 'max-w-20 scale-100 opacity-100 blur-0')} aria-hidden="true">
                    <span>分类数据</span>
                </span>
                <ChevronDown className={'h-[18px] w-[18px] shrink-0 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ' + (expanded ? 'rotate-180' : 'rotate-0')} strokeWidth={2.2} aria-hidden="true" />
            </button>
        </div>

        {expanded && (
            <div id="week-dimension-list">
                <DimensionRankingTable rankings={week.dimensionRankings} onSelect={onOpenDimensionDetails} />
                <div className="flex min-h-[var(--tm-size-touch)] items-center justify-center pb-1">
                    <button
                        type="button"
                        onClick={onOpenDetails}
                        className="flex min-h-11 items-center gap-1 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    >
                        展示明细
                        <ChevronRight className="h-4 w-4 translate-x-px" aria-hidden="true" />
                    </button>
                </div>
            </div>
        )}
    </section>
);

const DimensionDetailSheetHeader: React.FC<{
    rankings: ClassEvaluationDimensionRanking[];
    selectedDimension: string;
    onSelect: (dimension: string) => void;
    onClose: () => void;
}> = ({ rankings, selectedDimension, onSelect, onClose }) => (
    <div className="shrink-0">
        <header className="flex h-14 items-center justify-between px-4">
            <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">扣分明细</h2>
            <button
                type="button"
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                aria-label="关闭扣分明细"
            >
                <X className="h-5 w-5" aria-hidden="true" />
            </button>
        </header>
        <DimensionTabs
            rankings={rankings}
            selectedDimension={selectedDimension}
            onSelect={onSelect}
            className="px-3"
        />
    </div>
);

const WeekDataDetailPage: React.FC<{
    weekId: string;
    classId: string;
    activeClass?: ClassInfo;
    onBack: () => void;
    onClassPickerOpen: () => void;
    onWeekChange: (weekId: string) => void;
}> = ({ weekId, classId, activeClass, onBack, onClassPickerOpen, onWeekChange }) => {
    const weekIndex = CLASS_EVALUATION_WEEKS.findIndex(item => item.id === weekId);
    const week = getClassEvaluationWeek(weekId);
    const snapshot = getClassEvaluationSnapshot(classId, weekId);
    const records = getClassEvaluationRecords(classId, weekId);
    const olderWeek = CLASS_EVALUATION_WEEKS[weekIndex + 1];
    const newerWeek = CLASS_EVALUATION_WEEKS[weekIndex - 1];
    const defaultDimension = week.dimensionRankings.find(item => item.recordCount > 0)?.dimension
        ?? week.dimensionRankings[0]?.dimension
        ?? '';
    const [selectedDimension, setSelectedDimension] = useState(defaultDimension);
    const selectedRanking = week.dimensionRankings.find(item => item.dimension === selectedDimension)
        ?? week.dimensionRankings[0];
    const selectedRecords = records.filter(record => record.dimension === selectedRanking?.dimension);
    const selectedDeduction = selectedRecords.reduce((total, record) => total + record.deduction, 0);

    useEffect(() => {
        if (week.dimensionRankings.some(item => item.dimension === selectedDimension)) return;
        setSelectedDimension(defaultDimension);
    }, [defaultDimension, selectedDimension, week.dimensionRankings]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
            <AssistantSubpageHeader
                onBack={onBack}
                surface="transparent"
                centerContent={<ClassSwitchButton activeClass={activeClass} onClick={onClassPickerOpen} />}
            />

            <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))] no-scrollbar">
                <section className="pt-2" aria-label="周数据切换">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            disabled={!olderWeek}
                            onClick={() => olderWeek && onWeekChange(olderWeek.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label="查看上一周"
                        >
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <div className="min-w-0 flex-1 text-center">
                            <h1 className="truncate text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{week.label}</h1>
                            <p className="mt-1 text-[11px] text-[var(--tm-text-tertiary)]">{week.status === 'in_progress' ? week.snapshotLabel : '本周数据已结算'}</p>
                        </div>
                        <button
                            type="button"
                            disabled={!newerWeek}
                            onClick={() => newerWeek && onWeekChange(newerWeek.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label="查看下一周"
                        >
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </section>

                <section className="headteacher-agent-glass mt-4 rounded-[var(--tm-radius-card)] px-4 py-4" aria-label="周数据概览">
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-[12px] text-[var(--tm-text-tertiary)]">周总分</dt>
                            <dd className="mt-2 text-[26px] font-bold tabular-nums text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-1 text-[11px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                        </div>
                        <div>
                            <dt className="text-[12px] text-[var(--tm-text-tertiary)]">年级排名</dt>
                            <dd className="mt-2 text-[26px] font-bold tabular-nums text-[var(--tm-text-primary)]">第{week.gradeRank}<span className="ml-1 text-[11px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                        </div>
                    </dl>
                    <div className="mt-4 flex items-center justify-between rounded-[var(--tm-radius-control)] bg-[var(--tm-role-headteacher-glass-surface-strong)] px-3 py-2 text-[12px]">
                        <span className="text-[var(--tm-text-secondary)]">累计扣分</span>
                        <span className="font-bold tabular-nums text-[var(--tm-status-negative)]">{snapshot.deduction > 0 ? '-' : ''}{formatScore(snapshot.deduction)}分 · {snapshot.recordCount}笔</span>
                    </div>
                </section>

                <section className="mt-4" aria-labelledby="week-dimensions-title">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <h2 id="week-dimensions-title" className="text-[16px] font-bold text-[var(--tm-text-primary)]">分类数据</h2>
                        <span className="text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{week.dataRangeLabel}</span>
                    </div>
                    <div className="headteacher-agent-glass rounded-[var(--tm-radius-card)] pt-3">
                        <DimensionRankingTable
                            rankings={week.dimensionRankings}
                            selectedDimension={selectedRanking?.dimension}
                            onSelect={setSelectedDimension}
                        />
                    </div>
                </section>

                <section className="mt-4" aria-labelledby="week-records-title">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <h2 id="week-records-title" className="text-[16px] font-bold text-[var(--tm-text-primary)]">扣分明细</h2>
                        <span className="text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{selectedRecords.length}笔</span>
                    </div>
                    <div className="headteacher-agent-glass overflow-hidden rounded-[var(--tm-radius-card)]">
                        <DimensionTabs
                            rankings={week.dimensionRankings}
                            selectedDimension={selectedRanking?.dimension ?? ''}
                            onSelect={setSelectedDimension}
                            className="px-1"
                        />
                        <div className="px-4">
                            <div className="flex min-h-11 items-center justify-between gap-3 py-2 text-[12px]">
                                <span className="font-medium text-[var(--tm-text-secondary)]">{selectedRanking?.dimension}</span>
                                <span className="font-semibold tabular-nums text-[var(--tm-status-negative)]">
                                    {selectedDeduction > 0 ? '-' : ''}{formatScore(selectedDeduction)}分 · {selectedRecords.length}笔
                                </span>
                            </div>
                            {selectedRecords.length > 0 ? (
                                <RecordDetailList records={selectedRecords} showDimension={false} />
                            ) : (
                                <p className="py-12 text-center text-[13px] text-[var(--tm-text-tertiary)]">该周此指标暂无扣分</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const AiHeadteacherAssistantV2View: React.FC<AiHeadteacherAssistantV2ViewProps> = ({
    onBack,
    homeroomClasses,
    activeClassId,
    onClassChange,
}) => {
    const resolvedClassId = homeroomClasses.some(classInfo => classInfo.id === activeClassId)
        ? activeClassId
        : homeroomClasses[0]?.id ?? 'c_2025_4';
    const activeClass = homeroomClasses.find(classInfo => classInfo.id === resolvedClassId);
    const currentWeek = useMemo(() => getClassEvaluationWeek(DEFAULT_CLASS_EVALUATION_WEEK_ID), []);
    const snapshot = useMemo(() => getClassEvaluationSnapshot(resolvedClassId), [resolvedClassId]);
    const records = useMemo(() => getClassEvaluationRecords(resolvedClassId), [resolvedClassId]);
    const previousWeek = useMemo(() => {
        const week = CLASS_EVALUATION_WEEKS[1];
        if (!week) return undefined;
        const previousSnapshot = getClassEvaluationSnapshot(resolvedClassId, week.id);
        return {
            label: week.label,
            finalScore: previousSnapshot.finalScore,
            gradeRank: week.gradeRank,
            dimensionRankings: week.dimensionRankings,
        };
    }, [resolvedClassId]);
    const assistantIntro = useMemo(getAssistantIntro, []);
    const [typedIntro, setTypedIntro] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationOpen, setConversationOpen] = useState(false);
    const [overviewExpanded, setOverviewExpanded] = useState(false);
    const [detailDimension, setDetailDimension] = useState<string | null>(null);
    const [weekDetailOpen, setWeekDetailOpen] = useState(false);
    const [detailWeekId, setDetailWeekId] = useState(DEFAULT_CLASS_EVALUATION_WEEK_ID);
    const [isReplying, setIsReplying] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [detailRecords, setDetailRecords] = useState<ClassEvaluationRecord[] | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const replyTimerRef = useRef<number | null>(null);
    const previousClassIdRef = useRef(resolvedClassId);

    const clearConversation = () => {
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
        replyTimerRef.current = null;
        setMessages([]);
        setConversationOpen(false);
        setDetailRecords(null);
        setIsReplying(false);
    };

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            setTypedIntro(assistantIntro);
            return undefined;
        }

        let index = 0;
        let timer: number | undefined;
        const typeNext = () => {
            index += 1;
            setTypedIntro(assistantIntro.slice(0, index));
            if (index >= assistantIntro.length) return;
            timer = window.setTimeout(typeNext, getTypeDelay(assistantIntro[index - 1]));
        };
        timer = window.setTimeout(typeNext, 240);
        return () => {
            if (timer) window.clearTimeout(timer);
        };
    }, [assistantIntro]);

    useEffect(() => {
        if (previousClassIdRef.current === resolvedClassId) return;
        previousClassIdRef.current = resolvedClassId;
        clearConversation();
        setOverviewExpanded(false);
        setDetailDimension(null);
    }, [resolvedClassId]);

    useEffect(() => {
        if (!conversationOpen) return undefined;
        const frame = window.requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [conversationOpen, isReplying, messages]);

    useEffect(() => () => {
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    }, []);

    const submitQuestion = (rawQuestion: string) => {
        const question = rawQuestion.trim();
        if (!question || isReplying) return;

        setConversationOpen(true);
        const userMessage: ChatMessage = {
            id: 'user-' + Date.now(),
            role: 'user',
            content: question,
        };
        setMessages([userMessage]);
        setIsReplying(true);

        replyTimerRef.current = window.setTimeout(() => {
            const answer = askClassEvaluationQuestion({
                question,
                snapshot,
                records,
                gradeRank: currentWeek.gradeRank,
                rankings: currentWeek.dimensionRankings,
                previousWeek,
            });
            setMessages([userMessage, {
                id: 'assistant-' + Date.now(),
                role: 'assistant',
                answer,
            }]);
            setIsReplying(false);
            replyTimerRef.current = null;
        }, 420);
    };

    const dimensionDetailRecords = detailDimension
        ? records.filter(record => record.dimension === detailDimension)
        : [];
    const dimensionDeduction = dimensionDetailRecords.reduce((total, record) => total + record.deduction, 0);

    const handleClassSelect = (classId: string) => {
        onClassChange(classId);
        setShowClassPicker(false);
    };

    if (weekDetailOpen) {
        return (
            <div className="ai-assistant-theme-headteacher relative flex min-h-0 flex-1 overflow-hidden text-[var(--tm-text-primary)]">
                <WeekDataDetailPage
                    weekId={detailWeekId}
                    classId={resolvedClassId}
                    activeClass={activeClass}
                    onBack={() => setWeekDetailOpen(false)}
                    onClassPickerOpen={() => setShowClassPicker(true)}
                    onWeekChange={setDetailWeekId}
                />
                {showClassPicker && (
                    <HomeroomClassPickerSheet
                        classes={homeroomClasses}
                        selectedClassId={resolvedClassId}
                        onSelect={handleClassSelect}
                        onClose={() => setShowClassPicker(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="ai-assistant-theme-headteacher relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent text-[var(--tm-text-primary)]">
            <AssistantSubpageHeader
                onBack={onBack}
                surface="transparent"
                centerContent={<ClassSwitchButton activeClass={activeClass} onClick={() => setShowClassPicker(true)} />}
            />

            {conversationOpen ? (
                <>
                    <div className="headteacher-agent-glass mx-4 mt-2 flex min-h-16 shrink-0 items-center gap-2 rounded-[var(--tm-radius-inner)] px-3">
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt=""
                            className="h-14 w-14 shrink-0 object-contain object-bottom"
                        />
                        <div className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-bold text-[var(--tm-text-primary)]">班级评价分析</span>
                            <span className="mt-0.5 block truncate text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{currentWeek.dataRangeLabel}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConversationOpen(false)}
                            className="flex min-h-11 shrink-0 items-center gap-1 rounded-[var(--tm-radius-control)] px-2 text-[12px] font-semibold text-[var(--tm-assistant-role-text)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            返回概览
                        </button>
                    </div>

                    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4 no-scrollbar" aria-live="polite">
                        <div className="space-y-4">
                            {messages.map(message => (
                                <div key={message.id} className={'flex ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'user' ? (
                                        <div className="max-w-[82%] text-pretty rounded-[18px] rounded-br-[6px] bg-[var(--tm-assistant-role-primary)] px-4 py-2.5 text-[15px] font-medium leading-6 text-white [box-shadow:var(--tm-shadow-control)]">
                                            {message.content}
                                        </div>
                                    ) : message.answer ? (
                                        <div className="headteacher-agent-glass w-full rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 py-3.5">
                                            <AnswerContent
                                                answer={message.answer}
                                                onOpenDetails={answer => setDetailRecords(getRecordsFromAnswer(answer, records))}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            {isReplying && (
                                <div className="flex justify-start">
                                    <div className="headteacher-agent-glass flex h-11 items-center gap-2 rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 text-[13px] font-medium text-[var(--tm-text-secondary)]">
                                        <LoaderCircle className="h-4 w-4 animate-spin text-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                                        正在汇总数据并生成分析
                                    </div>
                                </div>
                            )}
                        </div>

                        <section className="mt-4" aria-labelledby="conversation-fixed-questions-title">
                            <h2 id="conversation-fixed-questions-title" className="mb-2 px-1 text-[13px] font-bold text-[var(--tm-text-primary)]">继续分析</h2>
                            <FixedQuestionList disabled={isReplying} onSelect={submitQuestion} />
                        </section>
                    </div>
                </>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto pb-5 no-scrollbar">
                    <section className="relative h-[148px] overflow-hidden px-5">
                        <div className="relative z-10 max-w-[59%] pt-3" aria-live="polite">
                            <p className="ai-assistant-typewriter-shine min-h-16 text-pretty text-[17px] font-bold leading-7">
                                {typedIntro}
                                {typedIntro.length < assistantIntro.length && (
                                    <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                                )}
                            </p>
                        </div>
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt="AI班主任助理形象"
                            className="pointer-events-none absolute -bottom-1 -right-1 h-[154px] w-[154px] select-none object-contain object-bottom drop-shadow-[0_20px_28px_var(--tm-role-headteacher-shadow)]"
                        />
                    </section>

                    <WeekOverviewPanel
                        week={currentWeek}
                        snapshot={snapshot}
                        expanded={overviewExpanded}
                        onToggleExpanded={() => {
                            setOverviewExpanded(current => !current);
                            if (overviewExpanded) setDetailDimension(null);
                        }}
                        onOpenDimensionDetails={setDetailDimension}
                        onOpenDetails={() => setDetailDimension(
                            currentWeek.dimensionRankings.find(item => item.recordCount > 0)?.dimension
                            ?? currentWeek.dimensionRankings[0]?.dimension
                            ?? null,
                        )}
                        onOpenWeekDetail={() => {
                            setDetailWeekId(DEFAULT_CLASS_EVALUATION_WEEK_ID);
                            setWeekDetailOpen(true);
                        }}
                    />

                    <section className="mx-4 mt-3" aria-labelledby="fixed-questions-title">
                        <h2 id="fixed-questions-title" className="mb-2 px-1 text-balance text-[14px] font-bold text-[var(--tm-text-primary)]">常用问题</h2>
                        <FixedQuestionList onSelect={submitQuestion} />
                    </section>
                </div>
            )}

            <p className="shrink-0 px-4 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 text-center text-[10px] leading-4 text-[var(--tm-text-disabled)]">内容由人工智能基于班级评价台账生成，请以学校复核记录为准</p>

            <MobileBottomSheet
                open={detailDimension !== null}
                title="扣分明细"
                onClose={() => setDetailDimension(null)}
                header={detailDimension ? (
                    <DimensionDetailSheetHeader
                        rankings={currentWeek.dimensionRankings}
                        selectedDimension={detailDimension}
                        onSelect={setDetailDimension}
                        onClose={() => setDetailDimension(null)}
                    />
                ) : undefined}
            >
                <div className="flex min-h-11 items-center justify-between gap-3 py-2 text-[12px]">
                    <span className="tabular-nums text-[var(--tm-text-tertiary)]">{currentWeek.dataRangeLabel}</span>
                    <span className="font-semibold tabular-nums text-[var(--tm-status-negative)]">
                        {dimensionDeduction > 0 ? '-' : ''}{formatScore(dimensionDeduction)}分 · {dimensionDetailRecords.length}笔
                    </span>
                </div>
                {dimensionDetailRecords.length > 0 ? (
                    <RecordDetailList records={dimensionDetailRecords} showDimension={false} />
                ) : (
                    <p className="py-12 text-center text-[13px] text-[var(--tm-text-tertiary)]">本周期该指标暂无扣分</p>
                )}
            </MobileBottomSheet>

            <MobileBottomSheet
                open={detailRecords !== null}
                title={'扣分明细' + (detailRecords?.length ? ' · ' + detailRecords.length + '笔' : '')}
                onClose={() => setDetailRecords(null)}
            >
                <RecordDetailList records={detailRecords ?? []} />
            </MobileBottomSheet>

            {showClassPicker && (
                <HomeroomClassPickerSheet
                    classes={homeroomClasses}
                    selectedClassId={resolvedClassId}
                    onSelect={handleClassSelect}
                    onClose={() => setShowClassPicker(false)}
                />
            )}
        </div>
    );
};

export default AiHeadteacherAssistantV2View;
