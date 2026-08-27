import React, { useState, useMemo } from 'react';
import { Student, ScoreItem, GrowthReportItem, CampusCoinDetail } from '../types';
import { ASSETS } from '../assets/images';
import {
    MaleIcon, FemaleIcon, ChevronDownIcon, ChevronRightIcon,
    GrowthIcon
} from '../components/Icons';
import { AlertTriangle, BadgeCheck, Camera, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Ellipsis, FolderOpen, Pencil, X } from 'lucide-react';
import { MOCK_BEHAVIOR_RECORDS } from '../constants';
import { formatCoinAmount } from '../utils/coinFormat';
import type { StudentCollectionHistoryItem } from '../../shared/questionnaireStore';
import { GROWTH_COIN_TERMS } from '../../shared/growthCoinTerminology';
import StudentCollectionHistoryTab from './student-collection/StudentCollectionHistoryTab';
import StudentTermSelector, { type StudentTermOption } from '../components/student-detail/StudentTermSelector';
import StudentEvaluationRecordsView, { type StudentEvaluationRecord } from './StudentEvaluationRecordsView';
import { EvaluationRecordDetailContent } from './student-evaluation/EvaluationRecordDetailView';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import {
    teacherBrandSemantic,
} from '../styles/teacherMobileTokens';

interface DashboardViewProps {
    student: Student;
    scores: ScoreItem[];
    growthReports: GrowthReportItem[];
    onViewTermReport?: () => void; // New optional prop
    onBack: () => void;
    onEditBasicInfo: () => void;
    onUpdateStudentStatus: (student: Student, status: Student['status']) => void;
    onViewCampusCoins: () => void;
    campusCoinDetail: CampusCoinDetail;
    collectionHistory: StudentCollectionHistoryItem[];
    evaluationRecords: StudentEvaluationRecord[];
    currentTeacherId: string;
    currentTeacherName: string;
    canEditOtherTeachersEvaluationRecords: boolean;
    onUpdateEvaluationRecord: (record: StudentEvaluationRecord) => void;
    onViewCollectionRecord: (item: StudentCollectionHistoryItem) => void;
    onOpenStudentArchive: () => void;
    initialSection?: 'evaluation' | 'report' | 'collection';
}

const STUDENT_TERM_OPTIONS: StudentTermOption[] = [
    { value: '2025-spring', label: '2025-2026学年 下学期', startDate: '2026-03-01', endDate: '2026-08-31', isCurrent: true },
    { value: '2025-fall', label: '2025-2026学年 上学期', startDate: '2025-09-01', endDate: '2026-02-28' },
    { value: '2024-spring', label: '2024-2025学年 下学期', startDate: '2025-03-01', endDate: '2025-08-31' },
];

const TERM_SCORE_OFFSETS: Record<string, Record<string, number>> = {
    '2025-spring': {},
    '2025-fall': { moral: -4, intellectual: 3, physical: 5, aesthetic: -2, labor: 6 },
    '2024-spring': { moral: -8, intellectual: -2, physical: 2, aesthetic: 4, labor: -3 },
};

const FIVE_EDUCATION_CATEGORY_BY_LABEL: Record<string, string> = {
    德育: 'moral',
    智育: 'intellectual',
    体育: 'physical',
    美育: 'aesthetic',
    劳育: 'labor',
};

const getTermValueForEvaluationDate = (value: string) => (
    STUDENT_TERM_OPTIONS.find(option => value >= option.startDate && value <= option.endDate)?.value
);

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

const StudentDetailHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <header className="shrink-0 bg-[var(--tm-page-plain-header-bg)] pt-[var(--mini-program-status-bar-height,0px)]">
        <div className="relative flex h-[var(--tm-size-touch)] items-center pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
            <button
                type="button"
                onClick={onBack}
                aria-label="返回"
                className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">
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
            return item ? { ...item, value: Math.max(item.score, 20) } : null;
        }).filter(Boolean) as (ScoreItem & { value: number })[];
    }, [scores]);

    const classAvgData = useMemo(() => {
        return activeData.map(item => {
            const val = { moral: 78, intellectual: 76, physical: 66, aesthetic: 72, labor: 70 }[item.category] || 70;
            return { ...item, score: val, value: Math.max(val, 20) };
        });
    }, [activeData]);

    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const generatePoints = (data: { value: number }[]) => data.map((s, i) => {
        const coords = getCoordinates(s.value, i, data.length);
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
                                const coords = getCoordinates(s.value, i, classAvgData.length);
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
                                const coords = getCoordinates(s.value, i, activeData.length);
                                const valueY = coords.y - 17;
                                const tone = getFiveEducationTone(s.category);

                                return (
                                    <g key={i}>
                                        <circle cx={coords.x} cy={coords.y} r="5" fill="white" stroke={tone.main} strokeWidth="2.5" />
                                        <rect
                                            x={coords.x - 14}
                                            y={valueY - 14}
                                            width="28"
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
    scores,
    growthReports,
    onViewTermReport,
    onBack,
    onEditBasicInfo,
    onUpdateStudentStatus,
    onViewCampusCoins,
    campusCoinDetail,
    collectionHistory,
    evaluationRecords,
    currentTeacherId,
    currentTeacherName,
    canEditOtherTeachersEvaluationRecords,
    onUpdateEvaluationRecord,
    onViewCollectionRecord,
    onOpenStudentArchive,
    initialSection = 'evaluation',
}) => {
    const [activeTab, setActiveTab] = useState<'evaluation' | 'report'>(initialSection === 'report' ? 'report' : 'evaluation');

    // UI States
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedTerm, setSelectedTerm] = useState(STUDENT_TERM_OPTIONS[0].value);
    const [activeEvaluationRecordId, setActiveEvaluationRecordId] = useState<string | null>(null);
    const [showEvaluationRecordEditor, setShowEvaluationRecordEditor] = useState(false);
    const [showAbilityModel, setShowAbilityModel] = useState(false);
    const [showCurrent, setShowCurrent] = useState(true);
    const [showClassAvg, setShowClassAvg] = useState(true);
    const [showMoreActionsSheet, setShowMoreActionsSheet] = useState(false);
    const [showCollectionHistory, setShowCollectionHistory] = useState(initialSection === 'collection');
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const toggleSection = (id: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedSections(newSet);
    };

    const currentTermOption = STUDENT_TERM_OPTIONS.find(option => option.isCurrent) ?? STUDENT_TERM_OPTIONS[0];
    const selectedTermOption = STUDENT_TERM_OPTIONS.find(option => option.value === selectedTerm) ?? currentTermOption;
    const activeEvaluationRecord = evaluationRecords.find(record => record.id === activeEvaluationRecordId) ?? null;
    const canEditActiveEvaluationRecord = Boolean(activeEvaluationRecord && (
        activeEvaluationRecord.teacherId === currentTeacherId || canEditOtherTeachersEvaluationRecords
    ));
    const evaluationScoreDeltas = useMemo(() => {
        const deltas: Record<string, Record<string, number>> = {};
        const applyRecord = (record: StudentEvaluationRecord, factor: number) => {
            const termValue = getTermValueForEvaluationDate(record.evaluation_date);
            const category = FIVE_EDUCATION_CATEGORY_BY_LABEL[record.indicatorPath[0]];
            if (!termValue || !category) return;
            deltas[termValue] ??= {};
            deltas[termValue][category] = (deltas[termValue][category] ?? 0) + record.scoreChange * factor;
        };
        (MOCK_BEHAVIOR_RECORDS as StudentEvaluationRecord[]).forEach(record => applyRecord(record, -1));
        evaluationRecords.forEach(record => applyRecord(record, 1));
        return deltas;
    }, [evaluationRecords]);
    const currentScores = useMemo(() => {
        const offsets = TERM_SCORE_OFFSETS[selectedTermOption.value] ?? {};
        const recordDeltas = evaluationScoreDeltas[selectedTermOption.value] ?? {};
        return scores
            .filter(score => score.category !== 'creativity')
            .map(score => ({ ...score, score: Math.max(0, Math.min(100, score.score + (offsets[score.category] ?? 0) + (recordDeltas[score.category] ?? 0))) }));
    }, [evaluationScoreDeltas, scores, selectedTermOption.value]);
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

    // --- Sub-renderers ---

    const renderEvaluationTab = () => (
        <div className="space-y-3 pb-24 animate-in fade-in duration-300">
            <StudentTermSelector value={selectedTerm} options={STUDENT_TERM_OPTIONS} onChange={setSelectedTerm} ariaLabel="选择评价记录学期" />

            {/* C. Compact Selected-Term Five-Education Summary */}
            <section className="relative overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                <button
                    type="button"
                    onClick={() => setShowAbilityModel(current => !current)}
                    aria-expanded={showAbilityModel}
                    className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-3 px-4 text-left active:bg-[var(--tm-bg-surface-soft)]"
                >
                    <h3 className="flex items-center gap-2 text-[var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">
                        {selectedTermOption.isCurrent ? '本学期' : '该学期'}五育积分
                    </h3>
                    <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[var(--tm-text-tertiary)]">
                        {showAbilityModel ? '收起' : '能力模型'}
                        <ChevronDown className={`h-4 w-4 transition-transform ${showAbilityModel ? 'rotate-180' : ''}`} />
                    </span>
                </button>

                <div className="grid grid-cols-5 px-2 pb-3">
                    {currentScores.map(score => {
                        const tone = getFiveEducationTone(score.category);
                        return (
                            <div key={score.category} className="flex min-w-0 flex-col items-center px-1">
                                <span className="text-[11px] font-medium text-[var(--tm-text-secondary)]">{score.label}</span>
                                <span className="mt-1 text-lg font-bold leading-none tabular-nums" style={{ color: tone.strong }}>{score.score}</span>
                            </div>
                        );
                    })}
                </div>

                {showAbilityModel && (
                    <div className="border-t border-[var(--tm-border-subtle)] px-2 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
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
                onUpdateRecord={onUpdateEvaluationRecord}
                onBack={() => undefined}
                onSelectRecord={(record) => {
                    setShowEvaluationRecordEditor(false);
                    setActiveEvaluationRecordId(record.id);
                }}
            />
        </div>
    );

    const renderReportTab = () => (
        <div className="space-y-3 pb-24 animate-in fade-in duration-300">
            <StudentTermSelector value={selectedTerm} options={STUDENT_TERM_OPTIONS} onChange={setSelectedTerm} ariaLabel="选择成长报告学期" />

            <section className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                <button
                    onClick={() => toggleSection('term_report')}
                    className="flex min-h-[60px] w-full items-center justify-between px-4 text-sm font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">
                            <FileTextIcon className="h-4 w-4" />
                        </div>
                        <span>期末综合素质报告</span>
                    </div>
                    {expandedSections.has('term_report') ? <ChevronDownIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" /> : <ChevronRightIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" />}
                </button>
                {expandedSections.has('term_report') && (
                    <div className="flex items-center justify-between border-t border-[var(--tm-border-subtle)] px-4 py-3 pl-[4.25rem]">
                        <span className="text-xs text-[var(--tm-text-secondary)]">{selectedTermOption.label}</span>
                        <button onClick={onViewTermReport} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-3 text-xs font-semibold text-[var(--tm-brand-primary-strong)] active:scale-95">查看</button>
                    </div>
                )}
                {selectedTermOption.isCurrent ? growthReports.map((report) => (
                    <div key={report.id} className="border-t border-[var(--tm-border-subtle)]">
                    <button
                        onClick={() => toggleSection(`growth_${report.id}`)}
                        className="flex min-h-[60px] w-full items-center justify-between px-4 text-sm font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]">
                                <GrowthIcon />
                            </div>
                            <span>{report.title}</span>
                        </div>
                        {expandedSections.has(`growth_${report.id}`) ? <ChevronDownIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" /> : <ChevronRightIcon className="h-4 w-4 text-[var(--tm-text-tertiary)]" />}
                    </button>
                    {expandedSections.has(`growth_${report.id}`) && (
                        <div className="border-t border-[var(--tm-border-subtle)] px-4 pb-4 pt-3 pl-[4.25rem] text-xs leading-relaxed text-[var(--tm-text-secondary)]">
                            <p className="line-clamp-2">本月在德育方面表现优异，积极参与班级事务，乐于助人...</p>
                            <button className="mt-2 flex min-h-11 items-center gap-1 text-[11px] font-semibold text-[var(--tm-brand-primary-strong)]">查看完整报告 <ChevronRightIcon className="h-3 w-3" /></button>
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
                onUpdateRecord={onUpdateEvaluationRecord}
                onBack={() => setShowEvaluationRecordEditor(false)}
                initialRecordId={activeEvaluationRecordId}
                initialRecordPage="edit"
            />
        );
    }

    if (showCollectionHistory) {
        return (
            <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent font-sans">
                <StudentDetailHeader title="采集记录" onBack={() => setShowCollectionHistory(false)} />
                <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-safe pt-4 no-scrollbar">
                    <StudentCollectionHistoryTab
                        items={collectionHistory}
                        termOptions={STUDENT_TERM_OPTIONS}
                        selectedTerm={selectedTerm}
                        onSelectedTermChange={setSelectedTerm}
                        onOpen={onViewCollectionRecord}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent font-sans">
            {/* Student Detail Navigation */}
            <StudentDetailHeader title="学生详情" onBack={onBack} />

            <div className="min-h-0 flex-1 overflow-y-auto pb-safe no-scrollbar">
            {/* A. Student Profile Card */}
            <section className="mx-4 mt-4 overflow-hidden rounded-[var(--tm-radius-card)] [background:var(--tm-student-detail-profile-bg)] [box-shadow:var(--tm-shadow-card)]">
                <div className="p-4">
                    <div className="flex min-w-0 items-start gap-4">
                        <button
                            type="button"
                            onClick={onEditBasicInfo}
                            aria-label="编辑基础信息"
                            className="relative shrink-0 rounded-full text-left transition-transform active:scale-95"
                        >
                            <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-bg-surface)] p-1 [box-shadow:var(--tm-shadow-avatar)]">
                                <img
                                    src={student.avatar || (student.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.STUDENT_GIRL_DEFAULT)}
                                    alt={`${student.name}头像`}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-icon)]" aria-hidden="true">
                                <Camera className="h-4 w-4" strokeWidth={2.3} />
                            </span>
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                                <h2 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-[var(--tm-text-primary)]">
                                    <span className="truncate">{student.name}</span>
                                    {student.gender === 'male'
                                        ? <MaleIcon className="h-4 w-4 shrink-0 text-[var(--tm-gender-male)]" />
                                        : <FemaleIcon className="h-4 w-4 shrink-0 text-[var(--tm-gender-female)]" />}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowMoreActionsSheet(true)}
                                    aria-label="更多学生操作"
                                    className="-mr-2 -mt-2 flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                                >
                                    <Ellipsis className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md bg-[var(--tm-bg-surface-soft)] px-2 py-1 text-[11px] font-medium text-[var(--tm-text-secondary)]">{formatCompactClassName(student.class)}</span>
                                <span className="rounded-md bg-[var(--tm-bg-surface-soft)] px-2 py-1 text-[11px] font-medium text-[var(--tm-text-secondary)]">ID: {student.id}</span>
                                <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${student.status === 'left' ? 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' : 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]'}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                                    {studentStatusLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Student Assets Band */}
                <button
                    type="button"
                    onClick={onViewCampusCoins}
                    aria-label={`查看${GROWTH_COIN_TERMS.details}，${GROWTH_COIN_TERMS.available}${formatCoinAmount(campusCoinDetail.balance)}，${GROWTH_COIN_TERMS.saved}${formatCoinAmount(campusCoinDetail.bankDeposit)}`}
                    className="grid h-[var(--tm-student-detail-asset-height)] w-full grid-cols-[var(--tm-student-detail-asset-label-width)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_var(--tm-student-detail-asset-chevron-space)] items-center border-t border-[var(--tm-student-detail-asset-border)] bg-[var(--tm-student-detail-asset-bg)] text-left active:bg-[var(--tm-bg-surface-soft)]"
                >
                    <span className="flex min-w-0 items-center justify-center gap-1.5 px-2">
                        <img src="/assets/coin.png" className="h-4 w-4 shrink-0" alt="" />
                        <span className="shrink-0 text-[11px] font-semibold text-[var(--tm-text-primary)]">{GROWTH_COIN_TERMS.name}</span>
                    </span>
                    <span className="h-5 bg-[var(--tm-student-detail-asset-border)]" aria-hidden="true" />
                    <span className="flex min-w-0 items-center justify-center gap-2 px-2">
                        <span className="shrink-0 text-[11px] font-medium text-[var(--tm-text-secondary)]">{GROWTH_COIN_TERMS.available}</span>
                        <span className="min-w-0 truncate text-sm font-semibold tabular-nums text-[var(--tm-text-primary)]">
                            {formatCoinAmount(campusCoinDetail.balance)}
                        </span>
                    </span>
                    <span className="h-5 bg-[var(--tm-student-detail-asset-border)]" aria-hidden="true" />
                    <span className="flex min-w-0 items-center justify-center gap-2 px-2">
                        <span className="shrink-0 text-[11px] font-medium text-[var(--tm-text-secondary)]">{GROWTH_COIN_TERMS.saved}</span>
                        <span className="min-w-0 truncate text-sm font-semibold tabular-nums text-[var(--tm-text-primary)]">
                            {formatCoinAmount(campusCoinDetail.bankDeposit)}
                        </span>
                    </span>
                    <span className="flex h-full items-center justify-center" aria-hidden="true">
                        <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
                    </span>
                </button>
            </section>

            {/* 2. Scrollable Content */}
            <div className="space-y-4 p-4">
                {/* C. Tabs */}
                <div className="sticky top-0 z-30 bg-[var(--tm-page-plain-content-bg)] py-2">
                    <div className="grid h-11 grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)]" role="tablist" aria-label="学生详情内容">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'evaluation'}
                            onClick={() => setActiveTab('evaluation')}
                            className="flex min-h-11 items-center p-1 text-[13px] font-semibold"
                        >
                            <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all ${activeTab === 'evaluation' ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>评价记录</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'report'}
                            onClick={() => setActiveTab('report')}
                            className="flex min-h-11 items-center p-1 text-[13px] font-semibold"
                        >
                            <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all ${activeTab === 'report' ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>成长报告</span>
                        </button>
                    </div>
                </div>

                {/* D. Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'evaluation' && renderEvaluationTab()}
                    {activeTab === 'report' && renderReportTab()}
                </div>
            </div>
            </div>

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
                                className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]"
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
                title="更多操作"
                onClose={() => setShowMoreActionsSheet(false)}
            >
                <div className="space-y-5">
                    <section aria-labelledby="student-resources-heading">
                        <h3 id="student-resources-heading" className="pb-1 text-xs font-medium text-[var(--tm-text-tertiary)]">学生资料</h3>
                        <div className="divide-y divide-[var(--tm-border-subtle)]">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMoreActionsSheet(false);
                                    onOpenStudentArchive();
                                }}
                                className="flex min-h-[60px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]">
                                    <FolderOpen className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--tm-text-primary)]">成长档案</span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMoreActionsSheet(false);
                                    setShowCollectionHistory(true);
                                }}
                                className="flex min-h-[60px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-audience-student-soft)] text-[var(--tm-audience-student-strong)]">
                                    <ClipboardList className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--tm-text-primary)]">采集记录</span>
                                <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--tm-text-tertiary)]">{collectionHistory.length}条</span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                            </button>
                        </div>
                    </section>

                    <section aria-labelledby="student-enrollment-heading">
                        <h3 id="student-enrollment-heading" className="pb-1 text-xs font-medium text-[var(--tm-text-tertiary)]">学籍状态</h3>
                        <div className="flex min-h-[60px] items-center gap-3">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${student.status === 'left' ? 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]' : 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]'}`}>
                                {student.status === 'left' ? <AlertTriangle className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
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
                    </section>
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
                                className="h-12 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] text-sm font-semibold text-[var(--tm-text-secondary)] active:scale-[0.98]"
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
                                className="h-12 rounded-[var(--tm-radius-inner)] bg-[var(--tm-status-negative)] text-sm font-semibold text-[var(--tm-text-inverse)] active:scale-[0.98]"
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

// --- Helper Components (Moved to top level) ---
const Clock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
);

export default DashboardView;
