import StudentDetailOverview from '../components/student-detail/StudentDetailOverview';
import StudentDetailGrowthChart from '../components/student-detail/StudentDetailGrowthChart';
import StudentDetailTimeline from '../components/student-detail/StudentDetailTimeline';
import type { MedalSummary } from '../domain/medal';
import { getStudentDetailScores } from '../domain/studentDetailGrowth';
import { CURRENT_STUDENT_TERM, STUDENT_TERM_OPTIONS } from '../domain/studentTerms';
import { teacherIndicatorCatalogs } from '../data/teacherIndicatorCatalog';
import { studentDetailYellowVariables } from '../styles/teacherMobileYellowTheme';
import '../styles/teacherMobileGoldHeader.css';
import './DashboardView.css';
import '../components/student-detail/StudentDetailYellowTheme.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Student, ScoreItem, GrowthReportItem, CampusCoinDetail, ClassInfo } from '../types';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';
import {
    ChevronDownIcon, ChevronRightIcon,
    GrowthIcon
} from '../components/Icons';
import { BadgeCheck, ChevronDown, ChevronLeft, ClipboardList, FileText, Pencil, X } from 'lucide-react';
import { MOCK_BEHAVIOR_RECORDS } from '../constants';
import type { StudentCollectionHistoryItem } from '../../shared/questionnaireStore';
import StudentCollectionHistoryTab from './student-collection/StudentCollectionHistoryTab';
import StudentTermSelector, { type StudentTermOption } from '../components/student-detail/StudentTermSelector';
import { STUDENT_INITIAL_IMAGING_REPORT, isInitialImagingReportInPeriod } from '../data/studentInitialImagingReport';
import StudentEvaluationRecordsView, { type StudentEvaluationRecord } from './StudentEvaluationRecordsView';
import { EvaluationRecordDetailContent } from './student-evaluation/EvaluationRecordDetailView';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import {
    teacherBrandSemantic,
} from '../styles/teacherMobileTokens';

interface DashboardViewProps {
    student: Student;
    classInfo?: ClassInfo;
    currentSpace: TeacherSpaceOption;
    scores: ScoreItem[];
    growthReports: GrowthReportItem[];
    medals?: MedalSummary[];
    archiveCount?: number;
    onViewTermReport?: () => void; // New optional prop
    onViewInitialImagingReport?: () => void;
    onBack: () => void;
    onEditBasicInfo: () => void;
    onUpdateStudentStatus: (student: Student, status: Student['status']) => void;
    onViewCampusCoins: () => void;
    onViewMedals: () => void;
    campusCoinDetail: CampusCoinDetail;
    collectionHistory: StudentCollectionHistoryItem[];
    evaluationRecords: StudentEvaluationRecord[];
    currentTeacherId: string;
    currentTeacherName: string;
    canEditOtherTeachersEvaluationRecords: boolean;
    onDeleteEvaluationRecord?: (recordId: string) => void;
    onUpdateEvaluationRecord: (record: StudentEvaluationRecord) => void;
    onViewCollectionRecord: (item: StudentCollectionHistoryItem) => void;
    onOpenStudentArchive: () => void;
    initialSection?: 'evaluation' | 'report' | 'collection';
}

const SHOW_OVERVIEW_TERM_SELECTOR = false;

const TERM_SCORE_OFFSETS: Record<string, Record<string, number>> = {
    '2026-fall': {},
    '2025-spring': { moral: -4, intellectual: 3, physical: 5, aesthetic: -2, labor: 6 },
    '2025-fall': { moral: -8, intellectual: -2, physical: 2, aesthetic: 4, labor: -3 },
};

const getFiveEducationTone = (category: string) => {
    switch (category) {
        case 'moral': return { main: 'var(--tm-chart-edu-virtue)', soft: 'var(--tm-brand-primary-soft)', strong: 'var(--tm-edu-virtue)' };
        case 'intellectual': return { main: 'var(--tm-chart-edu-wisdom)', soft: 'var(--tm-brand-secondary-soft)', strong: 'var(--tm-edu-wisdom)' };
        case 'physical': return { main: 'var(--tm-chart-edu-fitness)', soft: 'var(--tm-status-positive-soft)', strong: 'var(--tm-edu-fitness)' };
        case 'aesthetic': return { main: 'var(--tm-chart-edu-aesthetic)', soft: 'var(--tm-tag-jade-soft)', strong: 'var(--tm-edu-aesthetic)' };
        case 'labor': return { main: 'var(--tm-chart-edu-labor)', soft: 'var(--tm-brand-reward-soft)', strong: 'var(--tm-edu-labor)' };
        default: return { main: teacherBrandSemantic.textSecondary, soft: teacherBrandSemantic.surfaceSoft, strong: teacherBrandSemantic.textPrimary };
    }
};

type StudentDetailSection = 'overview' | 'evaluation' | 'report' | 'collection';

const StudentDetailHeader = ({ title, onBack, titleRef }: {
    title: string;
    onBack: () => void;
    titleRef: React.Ref<HTMLHeadingElement>;
}) => (
    <header className="student-detail-header shrink-0 bg-[var(--tm-page-plain-header-bg)] pt-[var(--mini-program-status-bar-height,0px)]">
        <div className="relative flex h-[var(--tm-size-touch)] items-center pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
            <button
                type="button"
                onClick={onBack}
                aria-label="返回"
                className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]" ref={titleRef} tabIndex={-1}>
                {title}
            </h1>
        </div>
    </header>
);

// Helper: Radar Chart Component
const FiveEducationRadar = ({
    scores,
    showCurrent,
    showClassAvg,
    onToggleCurrent,
    onToggleClassAvg
}: {
    scores: ScoreItem[],
    showCurrent: boolean,
    showClassAvg: boolean,
    onToggleCurrent: () => void,
    onToggleClassAvg: () => void
}) => {
    const size = 360;
    const center = size / 2;
    const radius = 118;
    const levels = 4;
    const ORDER = ['moral', 'intellectual', 'physical', 'aesthetic', 'labor'];

    const activeData = useMemo(() => {
        return ORDER.map(cat => {
            const item = scores.find(s => s.category === cat);
            return item ? { ...item, value: item.score } : null;
        }).filter(Boolean) as (ScoreItem & { value: number })[];
    }, [scores]);

    const classAvgData = useMemo(() => {
        return activeData.map(item => {
            const val = { moral: 78, intellectual: 76, physical: 66, aesthetic: 72, labor: 70 }[item.category] || 70;
            return { ...item, score: val, value: val };
        });
    }, [activeData]);

    const scaleMin = Math.min(0, ...activeData.map(item => item.value), ...classAvgData.map(item => item.value));
    const scaleMax = Math.max(1, ...activeData.map(item => item.value), ...classAvgData.map(item => item.value));

    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const getScoreCoordinates = (value: number, index: number, total: number) =>
        getCoordinates(((value - scaleMin) / (scaleMax - scaleMin)) * 100, index, total);

    const generatePoints = (data: { value: number }[]) => data.map((s, i) => {
        const coords = getScoreCoordinates(s.value, i, data.length);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    const studentPoints = generatePoints(activeData);
    const classAvgPoints = generatePoints(classAvgData);

    return (
        <div className="relative flex flex-col items-center justify-center py-2">
            <div className="relative aspect-square w-full max-w-[340px]">
                <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible">
                    {[...Array(levels)].map((_, i) => (
                        <polygon
                            key={i}
                            points={activeData.map((_, idx) => {
                                const val = 100 * ((levels - i) / levels);
                                const c = getCoordinates(val, idx, activeData.length);
                                return `${c.x},${c.y}`;
                            }).join(' ')}
                            fill={i === 0 ? teacherBrandSemantic.surfaceSoft : "transparent"}
                            stroke={teacherBrandSemantic.gridLine}
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {activeData.map((_, i) => {
                        const end = getCoordinates(100, i, activeData.length);
                        return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke={teacherBrandSemantic.gridLine} strokeWidth="1" />;
                    })}

                    {activeData.map((s, i) => {
                        const labelCoords = getCoordinates(112, i, activeData.length);
                        return (
                            <text key={`label-${s.category}`} x={labelCoords.x} y={labelCoords.y} textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium" fill={teacherBrandSemantic.textSecondary}>
                                {s.label}
                            </text>
                        );
                    })}

                    {showClassAvg && (
                        <g className="animate-in fade-in duration-500">
                            <polygon
                                points={classAvgPoints}
                                fill={teacherBrandSemantic.textDisabled}
                                fillOpacity="0.04"
                                stroke={teacherBrandSemantic.textDisabled}
                                strokeWidth="1.8"
                            />
                            {classAvgData.map((s, i) => {
                                const coords = getScoreCoordinates(s.value, i, classAvgData.length);
                                const valueY = coords.y + 18;
                                return (
                                    <g key={`class-${s.category}`}>
                                        <circle cx={coords.x} cy={coords.y} r="3.5" fill="white" stroke={teacherBrandSemantic.textDisabled} strokeWidth="1.5" />
                                        <text
                                            x={coords.x}
                                            y={valueY + 1}
                                            textAnchor="middle"
                                            className="text-[12px] font-medium"
                                            fill={teacherBrandSemantic.textTertiary}
                                        >
                                            {s.score}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    )}

                    {showCurrent && (
                        <g>
                            <polygon
                                points={studentPoints}
                                fill={teacherBrandSemantic.primary}
                                fillOpacity="0.10"
                                stroke={teacherBrandSemantic.primary}
                                strokeWidth="2.4"
                            />
                            {activeData.map((s, i) => {
                                const coords = getScoreCoordinates(s.value, i, activeData.length);
                                const valueY = coords.y - 17;
                                const tone = getFiveEducationTone(s.category);

                                return (
                                    <g key={i}>
                                        <circle cx={coords.x} cy={coords.y} r="5" fill="white" stroke={tone.main} strokeWidth="2.5" />
                                        <rect
                                            x={coords.x - Math.max(28, String(s.score).length * 8 + 12) / 2}
                                            y={valueY - 14}
                                            width={Math.max(28, String(s.score).length * 8 + 12)}
                                            height="21"
                                            rx="10.5"
                                            fill={tone.soft}
                                        />
                                        <text
                                            x={coords.x}
                                            y={valueY + 1}
                                            textAnchor="middle"
                                            className="text-[12px] font-medium"
                                            fill={tone.strong}
                                        >
                                            {s.score}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    )}
                </svg>
            </div>

            <p className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
                刻度：中心 {scaleMin} 分 · 外圈 {scaleMax} 分
            </p>
            <div className="mt-1 flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleCurrent}
                    className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${showCurrent ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] ring-1 ring-[var(--tm-border-subtle)]'}`}
                    aria-pressed={showCurrent}
                >
                    <div className={`h-3 w-3 rounded-full border-2 bg-[var(--tm-bg-surface)] ${showCurrent ? 'border-[var(--tm-brand-primary)]' : 'border-[var(--tm-border-subtle)]'}`}></div>
                    当前
                </button>

                <button
                    type="button"
                    onClick={onToggleClassAvg}
                    className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${showClassAvg ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] ring-1 ring-[var(--tm-border-subtle)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]'}`}
                    aria-pressed={showClassAvg}
                >
                    <div className={`h-0 w-6 border-t-2 ${showClassAvg ? 'border-[var(--tm-text-disabled)]' : 'border-[var(--tm-border-subtle)]'}`}></div>
                    班级平均
                </button>
            </div>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({
    student,
    classInfo,
    currentSpace,
    scores,
    growthReports,
    medals = [],
    archiveCount = 0,
    onViewTermReport,
    onViewInitialImagingReport,
    onBack,
    onEditBasicInfo,
    onUpdateStudentStatus,
    onViewCampusCoins,
    onViewMedals,
    campusCoinDetail,
    collectionHistory,
    evaluationRecords,
    currentTeacherId,
    currentTeacherName,
    canEditOtherTeachersEvaluationRecords,
    onUpdateEvaluationRecord,
    onDeleteEvaluationRecord,
    onViewCollectionRecord,
    onOpenStudentArchive,
    initialSection = 'evaluation',
}) => {
    const [section, setSection] = useState<StudentDetailSection>(
        initialSection === 'evaluation' ? 'overview' : initialSection,
    );
    const [selectedTerm, setSelectedTerm] = useState(CURRENT_STUDENT_TERM.value);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const focusSectionTitle = useRef(false);

    useEffect(() => {
        if (!focusSectionTitle.current) return;
        focusSectionTitle.current = false;
        titleRef.current?.focus({ preventScroll: true });
    }, [section]);

    const openSection = (nextSection: StudentDetailSection) => {
        if (nextSection === 'overview' && !SHOW_OVERVIEW_TERM_SELECTOR) {
            setSelectedTerm(CURRENT_STUDENT_TERM.value);
        }
        focusSectionTitle.current = true;
        setSection(nextSection);
    };

    // UI States
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [activeEvaluationRecordId, setActiveEvaluationRecordId] = useState<string | null>(null);
    const [showEvaluationRecordEditor, setShowEvaluationRecordEditor] = useState(false);
    const [showAbilityModel, setShowAbilityModel] = useState(false);
    const [showCurrent, setShowCurrent] = useState(true);
    const [showClassAvg, setShowClassAvg] = useState(true);
    const [showMoreActionsSheet, setShowMoreActionsSheet] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const toggleSection = (id: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedSections(newSet);
    };

    const selectedTermOption = STUDENT_TERM_OPTIONS.find(option => option.value === selectedTerm) ?? CURRENT_STUDENT_TERM;
    const activeEvaluationRecord = evaluationRecords.find(record => record.id === activeEvaluationRecordId) ?? null;
    const canEditActiveEvaluationRecord = Boolean(activeEvaluationRecord && activeEvaluationRecord.source !== 'parent' && (
        activeEvaluationRecord.teacherId === currentTeacherId || canEditOtherTeachersEvaluationRecords
    ));
    const currentScores = useMemo(() => getStudentDetailScores({
        scores: scores.filter(score => score.category !== 'creativity'),
        records: evaluationRecords,
        originalRecords: MOCK_BEHAVIOR_RECORDS as StudentEvaluationRecord[],
        terms: STUDENT_TERM_OPTIONS,
        selectedTerm: selectedTermOption.value,
        offsets: TERM_SCORE_OFFSETS[selectedTermOption.value] ?? {},
    }), [evaluationRecords, scores, selectedTermOption.value]);
    const totalScore = currentScores.reduce((total, item) => total + item.score, 0);
    const selectedReports = growthReports.filter(report => report.date.slice(0, 7) >= selectedTermOption.startDate.slice(0, 7)
        && report.date.slice(0, 7) <= selectedTermOption.endDate.slice(0, 7));
    const openTermReport = selectedTermOption.isCurrent ? onViewTermReport : undefined;
    const reportCount = selectedReports.length + Number(Boolean(openTermReport)) + Number(Boolean(onViewInitialImagingReport)
        && isInitialImagingReportInPeriod(selectedTermOption.startDate, selectedTermOption.endDate));
    const medalCount = medals.reduce((total, medal) => total + medal.quantity, 0);
    const openEvaluationRecord = (record: StudentEvaluationRecord) => {
        setShowEvaluationRecordEditor(false);
        setActiveEvaluationRecordId(record.id);
    };
    const studentStatusLabel = student.status === 'left' ? '离校' : '在校';
    const formatCompactClassName = (className: string) => {
        const match = className.match(/^(\d{4}级)(.+)$/);
        const classNumberMap: Record<string, string> = {
            一: '1',
            二: '2',
            三: '3',
            四: '4',
            五: '5',
            六: '6',
            七: '7',
            八: '8',
            九: '9',
            十: '10',
        };
        if (!match) return className;
        const classText = match[2].replace('班', '');
        return `${match[1]}${classNumberMap[classText] ?? classText}班`;
    };
    const displayStudentClassName = classInfo
        ? getTeacherClassDisplayName(classInfo, currentSpace)
        : formatCompactClassName(student.class);

    // --- Sub-renderers ---

    const renderEvaluationTab = () => (
        <div className="space-y-[var(--tm-layout-card-gap)] pb-24 animate-in fade-in duration-300">
            <StudentTermSelector value={selectedTerm} options={STUDENT_TERM_OPTIONS} onChange={setSelectedTerm} ariaLabel="选择评价记录学期" />

            {/* C. Compact Selected-Term Five-Education Summary */}
            <section className="relative overflow-hidden rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                <h3 className="px-4 pt-4 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">
                    {selectedTermOption.isCurrent ? '本学期' : '该学期'}五育积分
                </h3>
                <div className="flex items-center justify-between gap-3 px-4 py-2">
                    <p className="flex min-w-0 flex-wrap items-baseline gap-2 text-[var(--tm-text-primary)]">
                        <span className="text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)]">总分</span>
                        <span className="break-all text-[length:var(--tm-font-size-metric)] font-semibold tabular-nums">{totalScore}</span>
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowAbilityModel(current => !current)}
                        aria-expanded={showAbilityModel}
                        aria-controls="student-five-education-model"
                        className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center gap-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]"
                    >
                        {showAbilityModel ? '收起' : '能力模型'}
                        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${showAbilityModel ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-5 px-2 pb-3">
                    {currentScores.map(score => {
                        const tone = getFiveEducationTone(score.category);
                        return (
                            <div key={score.category} className="flex min-w-0 flex-col items-center px-1">
                                <span className="text-[11px] font-medium text-[var(--tm-text-secondary)]">{score.label}</span>
                                <span className="mt-1 max-w-full break-all text-lg font-bold leading-none tabular-nums" style={{ color: tone.strong }}>{score.score}</span>
                            </div>
                        );
                    })}
                </div>

                {showAbilityModel && (
                    <div id="student-five-education-model" className="border-t border-[var(--tm-border-subtle)] px-2 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <FiveEducationRadar scores={currentScores} showCurrent={showCurrent} showClassAvg={showClassAvg} onToggleCurrent={() => setShowCurrent(prev => !prev)} onToggleClassAvg={() => setShowClassAvg(prev => !prev)} />
                    </div>
                )}
            </section>

            <StudentEvaluationRecordsView
                embedded
                records={evaluationRecords}
                selectedTerm={selectedTerm}
                termOptions={STUDENT_TERM_OPTIONS}
                currentTeacherId={currentTeacherId}
                currentTeacherName={currentTeacherName}
                canEditOtherTeachersRecords={canEditOtherTeachersEvaluationRecords}
                onSelectedTermChange={setSelectedTerm}
                onDeleteRecord={onDeleteEvaluationRecord}
                onUpdateRecord={onUpdateEvaluationRecord}
                onBack={() => undefined}
                onSelectRecord={openEvaluationRecord}
            />
        </div>
    );

    const renderReportTab = () => (
        <div className="space-y-[var(--tm-layout-card-gap)] pb-24 animate-in fade-in duration-300">
            <StudentTermSelector value={selectedTerm} options={STUDENT_TERM_OPTIONS} onChange={setSelectedTerm} ariaLabel="选择成长报告学期" />

            <section className="overflow-hidden rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                {onViewInitialImagingReport && isInitialImagingReportInPeriod(selectedTermOption.startDate, selectedTermOption.endDate) && <button
                    type="button"
                    onClick={onViewInitialImagingReport}
                    className="flex min-h-[60px] w-full items-center justify-between gap-3 border-b border-[var(--tm-border-subtle)] px-4 py-3 text-left text-sm font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                >
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]"><ClipboardList size={18} aria-hidden="true" /></span>
                        <span>{STUDENT_INITIAL_IMAGING_REPORT.title}</span>
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                </button>}
                {openTermReport && <button
                    type="button"
                    aria-expanded={expandedSections.has('term_report')}
                    onClick={() => toggleSection('term_report')}
                    className="flex min-h-[60px] w-full items-center justify-between px-4 text-sm font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">
                            <FileText className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span>期末综合素质报告</span>
                    </div>
                    {expandedSections.has('term_report') ? <ChevronDownIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" /> : <ChevronRightIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" />}
                </button>}
                {openTermReport && expandedSections.has('term_report') && (
                    <div className="flex items-center justify-between border-t border-[var(--tm-border-subtle)] px-4 py-3 pl-[4.25rem]">
                        <span className="text-xs text-[var(--tm-text-secondary)]">{selectedTermOption.label}</span>
                        <button onClick={openTermReport} className="min-h-11 rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary-soft)] px-3 text-xs font-semibold text-[var(--tm-brand-primary-strong)] active:scale-95">查看</button>
                    </div>
                )}
                {selectedReports.length > 0 ? selectedReports.map((report) => (
                    <div key={report.id} className="border-t border-[var(--tm-border-subtle)]">
                    <button
                        type="button"
                        aria-expanded={expandedSections.has(`growth_${report.id}`)}
                        onClick={() => toggleSection(`growth_${report.id}`)}
                        className="flex min-h-[60px] w-full items-center justify-between px-4 text-sm font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]">
                                <GrowthIcon />
                            </div>
                            <span>{report.title}</span>
                        </div>
                        {expandedSections.has(`growth_${report.id}`) ? <ChevronDownIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" /> : <ChevronRightIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" />}
                    </button>
                    {expandedSections.has(`growth_${report.id}`) && (
                        <div className="border-t border-[var(--tm-border-subtle)] px-4 pb-4 pt-3 pl-[4.25rem] text-xs leading-relaxed text-[var(--tm-text-secondary)]">
                            <p className="line-clamp-2">本月在德育方面表现优异，积极参与班级事务，乐于助人...</p>
                        </div>
                    )}
                </div>
                )) : (
                    <div className="border-t border-[var(--tm-border-subtle)] px-4 py-8 text-center text-[13px] font-medium text-[var(--tm-text-tertiary)]">该学期暂无月度成长报告</div>
                )}
            </section>
        </div>
    );

    if (showEvaluationRecordEditor && activeEvaluationRecordId) {
        return (
            <StudentEvaluationRecordsView
                records={evaluationRecords}
                selectedTerm={selectedTerm}
                termOptions={STUDENT_TERM_OPTIONS}
                currentTeacherId={currentTeacherId}
                currentTeacherName={currentTeacherName}
                canEditOtherTeachersRecords={canEditOtherTeachersEvaluationRecords}
                onSelectedTermChange={() => undefined}
                onDeleteRecord={onDeleteEvaluationRecord}
                onUpdateRecord={onUpdateEvaluationRecord}
                onBack={() => setShowEvaluationRecordEditor(false)}
                initialRecordId={activeEvaluationRecordId}
                initialRecordPage="edit"
            />
        );
    }

    const sectionTitles = { evaluation: '评价记录', report: '成长报告', collection: '问卷采集记录' };
    const isOverview = section === 'overview';

    return (
        <div
            className={`student-detail-page relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent font-sans ${isOverview ? "tm-gold-header-screen" : ""}`}
            data-overview={isOverview || undefined}
            data-color-theme={isOverview ? 'yellow' : undefined}
            style={isOverview ? studentDetailYellowVariables as React.CSSProperties : undefined}
        >
            {!isOverview && (
                <StudentDetailHeader title={sectionTitles[section]} titleRef={titleRef} onBack={() => openSection('overview')} />
            )}

            <main key={section} data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto pb-safe no-scrollbar">
                {isOverview ? (
                    <div className="student-detail-content">
                        <StudentDetailOverview
                            student={student}
                            titleRef={titleRef}
                            termSelector={SHOW_OVERVIEW_TERM_SELECTOR && (
                                <StudentTermSelector
                                    value={selectedTerm}
                                    options={STUDENT_TERM_OPTIONS}
                                    onChange={setSelectedTerm}
                                    variant="glass"
                                    ariaLabel="选择学生详情学期"
                                />
                            )}
                            className={displayStudentClassName}
                            medalCount={medalCount}
                            archiveCount={archiveCount}
                            questionnaireCount={collectionHistory.length}
                            reportCount={reportCount}
                            campusCoinDetail={campusCoinDetail}
                            onBack={onBack}
                            onEdit={onEditBasicInfo}
                            onOpenMedals={onViewMedals}
                            onOpenArchive={onOpenStudentArchive}
                            onOpenQuestionnaires={() => openSection('collection')}
                            onOpenCoins={onViewCampusCoins}
                            onOpenReports={() => openSection('report')}
                            onOpenStudentActions={() => setShowMoreActionsSheet(true)}
                        />
                        <StudentDetailGrowthChart
                            indicators={teacherIndicatorCatalogs.student.levels}
                            scores={currentScores}
                            records={evaluationRecords}
                            term={selectedTermOption}
                            totalScore={totalScore}
                        />
                        <StudentDetailTimeline
                            records={evaluationRecords}
                            term={selectedTermOption}
                            onOpenRecord={openEvaluationRecord}
                            onViewAll={() => openSection('evaluation')}
                        />
                    </div>
                ) : (
                    <div className="px-4 pb-5 pt-4">
                        {section === 'evaluation' && renderEvaluationTab()}
                        {section === 'report' && renderReportTab()}
                        {section === 'collection' && (
                            <StudentCollectionHistoryTab
                                items={collectionHistory}
                                termOptions={STUDENT_TERM_OPTIONS}
                                selectedTerm={selectedTerm}
                                onSelectedTermChange={setSelectedTerm}
                                onOpen={onViewCollectionRecord}
                            />
                        )}
                    </div>
                )}
            </main>

            <MobileBottomSheet
                open={Boolean(activeEvaluationRecord)}
                title="评价详情"
                onClose={() => setActiveEvaluationRecordId(null)}
                header={(
                    <header className="flex h-14 shrink-0 items-center gap-1 px-4">
                        <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">评价详情</h2>
                        {canEditActiveEvaluationRecord && (
                            <button
                                type="button"
                                onClick={() => setShowEvaluationRecordEditor(true)}
                                className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--student-detail-action-text,var(--tm-brand-primary))] active:bg-[var(--tm-brand-primary-soft)]"
                                aria-label="修改评价"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setActiveEvaluationRecordId(null)}
                            className="-mr-2 flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                            aria-label="关闭评价详情"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </header>
                )}
            >
                {activeEvaluationRecord && <EvaluationRecordDetailContent record={activeEvaluationRecord} />}
            </MobileBottomSheet>

            <MobileBottomSheet
                open={showMoreActionsSheet}
                title="学籍状态"
                onClose={() => setShowMoreActionsSheet(false)}
            >
                <div className="flex min-h-[60px] items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] ${student.status === 'left' ? 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]' : 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]'}`}>
                        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--tm-text-primary)]">{studentStatusLabel}</span>
                    {student.status !== 'left' && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowMoreActionsSheet(false);
                                setShowLeaveConfirm(true);
                            }}
                            className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center px-1 text-sm font-semibold text-[var(--tm-status-negative-strong)] active:opacity-60"
                        >
                            办理离校
                        </button>
                    )}
                </div>
            </MobileBottomSheet>

            {showLeaveConfirm && (
                <div
                    className="absolute inset-0 z-[140] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]"
                    onClick={() => setShowLeaveConfirm(false)}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="leave-student-confirm-title"
                    aria-describedby="leave-student-confirm-description"
                >
                    <div className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
                        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" />
                        <div className="py-1">
                            <h3 id="leave-student-confirm-title" className="text-[17px] font-semibold text-[var(--tm-text-primary)]">确认设为离校？</h3>
                            <p id="leave-student-confirm-description" className="mt-2 text-sm leading-relaxed text-[var(--tm-text-secondary)]">
                                设置离校后，该学生将不在学生列表展示。可在班级卡片更多操作中恢复。
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLeaveConfirm(false)}
                                className="h-12 rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] text-sm font-semibold text-[var(--tm-text-secondary)] active:scale-[0.98]"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onUpdateStudentStatus(student, 'left');
                                    setShowLeaveConfirm(false);
                                    onBack?.();
                                }}
                                className="h-12 rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-status-negative)] text-sm font-semibold text-[var(--tm-text-inverse)] active:scale-[0.98]"
                            >
                                确认离校
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
