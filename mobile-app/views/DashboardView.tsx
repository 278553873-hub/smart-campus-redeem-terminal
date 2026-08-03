import React, { useState, useMemo } from 'react';
import { Student, ScoreItem, GrowthReportItem, CampusCoinDetail } from '../types';
import { ASSETS } from '../assets/images';
import {
    MaleIcon, FemaleIcon, ChevronDownIcon, ChevronRightIcon,
    AwardIcon, GrowthIcon
} from '../components/Icons';
import { AlertTriangle, BadgeCheck, Camera, ChevronLeft, ChevronRight, FolderOpen, HeartPulse, Ruler, School } from 'lucide-react';
import { MOCK_BEHAVIOR_RECORDS } from '../constants';
import { formatCoinAmount } from '../utils/coinFormat';
import type { StudentCollectionHistoryItem } from '../../shared/questionnaireStore';
import type { StudentGrowthProfile } from '../../shared/studentGrowthStore';
import StudentCollectionHistoryTab from './student-collection/StudentCollectionHistoryTab';
import StudentTermSelector, { type StudentTermOption } from '../components/student-detail/StudentTermSelector';
import StudentEvaluationRecordsView, { type StudentEvaluationRecord } from './StudentEvaluationRecordsView';
import {
    teacherBrandPalette,
    teacherBrandSemantic,
    teacherFiveEducationSemantic,
} from '../styles/teacherMobileTokens';

interface DashboardViewProps {
    student: Student;
    scores: ScoreItem[];
    growthReports: GrowthReportItem[];
    onViewTermReport?: () => void; // New optional prop
    onBack?: () => void;
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
    growthProfile: StudentGrowthProfile;
    onViewBodyMeasurements: () => void;
    onViewHealthRecords: () => void;
    initialTab?: 'overview' | 'report' | 'collection';
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
        case 'moral': return { main: teacherFiveEducationSemantic.virtue, soft: teacherBrandPalette.red[50], strong: teacherBrandPalette.red[700] };
        case 'intellectual': return { main: teacherFiveEducationSemantic.wisdom, soft: teacherBrandPalette.orange[50], strong: teacherBrandPalette.orange[700] };
        case 'physical': return { main: teacherFiveEducationSemantic.fitness, soft: teacherBrandPalette.green[50], strong: teacherBrandPalette.green[700] };
        case 'aesthetic': return { main: teacherFiveEducationSemantic.aesthetic, soft: teacherBrandPalette.jade[50], strong: teacherBrandPalette.jade[700] };
        case 'labor': return { main: teacherFiveEducationSemantic.labor, soft: teacherBrandPalette.gold[50], strong: teacherBrandPalette.gold[700] };
        default: return { main: teacherBrandSemantic.textSecondary, soft: teacherBrandSemantic.surfaceSoft, strong: teacherBrandSemantic.textPrimary };
    }
};

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
    growthProfile,
    onViewBodyMeasurements,
    onViewHealthRecords,
    initialTab = 'overview',
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'collection'>(initialTab);

    // UI States
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedTerm, setSelectedTerm] = useState(STUDENT_TERM_OPTIONS[0].value);
    const [showEvaluationRecords, setShowEvaluationRecords] = useState(false);
    const [showCurrent, setShowCurrent] = useState(true);
    const [showClassAvg, setShowClassAvg] = useState(true);
    const [showStatusActionSheet, setShowStatusActionSheet] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const toggleSection = (id: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedSections(newSet);
    };

    const currentTermOption = STUDENT_TERM_OPTIONS.find(option => option.isCurrent) ?? STUDENT_TERM_OPTIONS[0];
    const selectedTermOption = STUDENT_TERM_OPTIONS.find(option => option.value === selectedTerm) ?? currentTermOption;
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
        const offsets = TERM_SCORE_OFFSETS[currentTermOption.value] ?? {};
        const recordDeltas = evaluationScoreDeltas[currentTermOption.value] ?? {};
        return scores
            .filter(score => score.category !== 'creativity')
            .map(score => ({ ...score, score: Math.max(0, Math.min(100, score.score + (offsets[score.category] ?? 0) + (recordDeltas[score.category] ?? 0))) }));
    }, [currentTermOption.value, evaluationScoreDeltas, scores]);
    const currentTermEvaluationRecords = useMemo(() => evaluationRecords.filter(record => (
        record.evaluation_date >= currentTermOption.startDate && record.evaluation_date <= currentTermOption.endDate
    )).sort((left, right) => right.evaluation_date.localeCompare(left.evaluation_date)), [currentTermOption.endDate, currentTermOption.startDate, evaluationRecords]);
    const latestMeasurement = growthProfile.bodyMeasurements[0];
    const latestHeightMeasurement = growthProfile.bodyMeasurements.find(record => record.heightCm !== undefined);
    const latestWeightMeasurement = growthProfile.bodyMeasurements.find(record => record.weightKg !== undefined);
    const latestBmiMeasurement = growthProfile.bodyMeasurements.find(record => record.bmi !== undefined);
    const latestHealthRecord = growthProfile.healthExamRecords[0];
    const latestHeightIndex = latestHeightMeasurement ? growthProfile.bodyMeasurements.indexOf(latestHeightMeasurement) : -1;
    const previousHeightMeasurement = latestHeightIndex >= 0
        ? growthProfile.bodyMeasurements.slice(latestHeightIndex + 1).find(record => record.heightCm !== undefined)
        : undefined;
    const heightDelta = latestHeightMeasurement?.heightCm !== undefined && previousHeightMeasurement?.heightCm !== undefined
        ? Number((latestHeightMeasurement.heightCm - previousHeightMeasurement.heightCm).toFixed(1))
        : null;
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

    const renderOverviewTab = () => (
        <div className="space-y-3 pb-24 animate-in fade-in duration-300">
            {/* C. Current Semester Five-Education Summary */}
            <div className="relative overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                <div className="relative z-10 flex items-center justify-between px-4 pb-3 pt-4">
                    <h3 className="flex items-center gap-2 text-[var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">
                        <AwardIcon className="h-4 w-4 text-[var(--tm-brand-reward)]" />
                        本学期五育积分
                    </h3>
                    <span className="rounded-full bg-[var(--tm-status-positive-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--tm-status-positive-strong)]">实时</span>
                </div>

                <div className="grid grid-cols-5 px-2 pb-4">
                    {currentScores.map(score => {
                        const tone = getFiveEducationTone(score.category);
                        return (
                            <div key={score.category} className="flex min-w-0 flex-col items-center px-1">
                                <span className="text-[12px] font-medium text-[var(--tm-text-secondary)]">{score.label}</span>
                                <span className="mt-1 text-[22px] font-bold leading-none tabular-nums" style={{ color: tone.strong }}>{score.score}</span>
                                <span className="mt-2 h-1 w-5 rounded-full" style={{ backgroundColor: tone.main }} aria-hidden="true" />
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-[var(--tm-border-subtle)] px-2 pb-3">
                    <FiveEducationRadar scores={currentScores} showCurrent={showCurrent} showClassAvg={showClassAvg} onToggleCurrent={() => setShowCurrent(prev => !prev)} onToggleClassAvg={() => setShowClassAvg(prev => !prev)} />
                </div>

                <div className="border-t border-[var(--tm-border-subtle)] px-4">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTerm(currentTermOption.value);
                            setShowEvaluationRecords(true);
                        }}
                        className="mx-auto flex min-h-[var(--tm-size-touch)] items-center gap-1.5 text-[13px] font-medium text-[var(--tm-brand-primary-strong)]"
                    >
                        评价记录 {currentTermEvaluationRecords.length}条
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <button type="button" onClick={onViewBodyMeasurements} className="w-full overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-left [box-shadow:var(--tm-shadow-card)] transition active:scale-[0.985]">
                <div className="flex min-h-[58px] items-center justify-between px-4">
                    <h3 className="flex items-center gap-2 text-[var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]"><Ruler className="h-4.5 w-4.5 text-[var(--tm-status-positive)]" />成长数据</h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--tm-text-tertiary)]">{latestMeasurement?.measuredAt ?? '待补充'}<ChevronRight className="h-4 w-4" /></span>
                </div>
                {latestMeasurement ? (
                    <div className="grid grid-cols-3 border-t border-[var(--tm-border-subtle)] px-3 py-4 text-center">
                        <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{latestHeightMeasurement?.heightCm ?? '--'}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">身高（厘米）</div>{heightDelta !== null && <div className="mt-1 text-[11px] font-semibold text-[var(--tm-status-positive-strong)]">较上次 {heightDelta >= 0 ? '+' : ''}{heightDelta}</div>}</div>
                        <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{latestWeightMeasurement?.weightKg ?? '--'}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">体重（千克）</div></div>
                        <div><div className="text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{latestBmiMeasurement?.bmi ?? '--'}</div><div className="mt-1 text-xs text-[var(--tm-text-secondary)]">身体质量指数</div></div>
                    </div>
                ) : <div className="border-t border-[var(--tm-border-subtle)] px-4 py-4 text-sm text-[var(--tm-text-secondary)]">暂无测量记录</div>}
            </button>

            <button type="button" onClick={onViewHealthRecords} className="flex min-h-[88px] w-full items-center gap-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 text-left [box-shadow:var(--tm-shadow-card)] transition active:scale-[0.985]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]"><HeartPulse className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">健康检查</span><span className="mt-1 block truncate text-xs font-medium text-[var(--tm-text-secondary)]">{latestHealthRecord ? `裸眼视力 左${latestHealthRecord.nakedVisionLeft || '--'} · 右${latestHealthRecord.nakedVisionRight || '--'} · ${latestHealthRecord.glassesType}` : '暂无体检记录'}</span>{latestHealthRecord?.conclusionTags.length ? <span className="mt-1 block truncate text-[11px] font-semibold text-[var(--tm-brand-reward-strong)]">{latestHealthRecord.conclusionTags.join('、')}</span> : null}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
            </button>
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

    if (showEvaluationRecords) {
        return (
            <StudentEvaluationRecordsView
                records={evaluationRecords}
                selectedTerm={selectedTerm}
                termOptions={STUDENT_TERM_OPTIONS}
                currentTeacherId={currentTeacherId}
                currentTeacherName={currentTeacherName}
                canEditOtherTeachersRecords={canEditOtherTeachersEvaluationRecords}
                onSelectedTermChange={setSelectedTerm}
                onUpdateRecord={onUpdateEvaluationRecord}
                onBack={() => setShowEvaluationRecords(false)}
            />
        );
    }

    return (
        <div className="relative h-full min-h-0 overflow-hidden bg-transparent font-sans">
            <div className="h-full overflow-y-auto pb-safe no-scrollbar">

            {/* Student Detail Navigation */}
            <header className="px-4 pt-[var(--mini-program-status-bar-height,0px)]">
                <div className="flex h-11 items-center">
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label="返回"
                        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* A. Student Profile Card */}
            <section className="mx-4 overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-glass)] p-4 [box-shadow:var(--tm-shadow-card)] backdrop-blur-xl">
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
                            <div className="flex min-w-0 items-center justify-between gap-2">
                                <h2 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-[var(--tm-text-primary)]">
                                    <span className="truncate">{student.name}</span>
                                    {student.gender === 'male'
                                        ? <MaleIcon className="h-4 w-4 shrink-0 text-[var(--tm-gender-male)]" />
                                        : <FemaleIcon className="h-4 w-4 shrink-0 text-[var(--tm-gender-female)]" />}
                                </h2>
                                <div className="flex shrink-0 items-center">
                                    <button
                                        type="button"
                                        onClick={onOpenStudentArchive}
                                        aria-label="查看学生成长档案"
                                        className="flex h-11 items-center justify-center gap-1 rounded-full px-1.5 text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                                    >
                                        <FolderOpen className="h-4 w-4 shrink-0" />
                                        <span className="whitespace-nowrap text-xs font-medium">档案</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowStatusActionSheet(true)}
                                        aria-label="管理学籍状态"
                                        className="flex h-11 items-center justify-center gap-1 rounded-full px-1.5 text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                                    >
                                        {student.status === 'left'
                                            ? <AlertTriangle className="h-4 w-4 shrink-0" />
                                            : <BadgeCheck className="h-4 w-4 shrink-0" />}
                                        <span className="whitespace-nowrap text-xs font-medium">学籍</span>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="flex items-center gap-1 rounded-md bg-[var(--tm-bg-surface-soft)] px-2 py-1 text-[11px] font-medium text-[var(--tm-text-secondary)]"><School className="h-3 w-3" />{formatCompactClassName(student.class)}</span>
                                <span className="rounded-md bg-[var(--tm-bg-surface-soft)] px-2 py-1 text-[11px] font-medium text-[var(--tm-text-secondary)]">ID: {student.id}</span>
                                <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${student.status === 'left' ? 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' : 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]'}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                                    {studentStatusLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex min-h-[var(--tm-size-touch)] items-center border-t border-[var(--tm-border-subtle)]">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
                            <img src="/assets/coin.png" className="h-4 w-4 shrink-0" alt="" />
                            <span className="text-[11px] font-medium text-[var(--tm-text-secondary)]">钱包</span>
                            <span className="truncate text-sm font-bold tabular-nums text-[var(--tm-brand-reward-strong)]">
                                {formatCoinAmount(campusCoinDetail.balance)}
                            </span>
                        </div>
                        <div className="h-5 w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                        <div className="flex min-w-0 flex-1 items-center gap-1.5 px-2">
                            <img src="/assets/coin.png" className="h-4 w-4 shrink-0" alt="" />
                            <span className="text-[11px] font-medium text-[var(--tm-text-secondary)]">存款</span>
                            <span className="truncate text-sm font-bold tabular-nums text-[var(--tm-brand-reward-strong)]">
                                {formatCoinAmount(campusCoinDetail.bankDeposit)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onViewCampusCoins}
                            aria-label="查看校园币明细"
                            className="flex h-11 shrink-0 items-center gap-0.5 rounded-full px-2 text-[11px] font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-secondary)]"
                        >
                            明细 <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                    </div>
            </section>

            {/* 2. Scrollable Content */}
            <div className="space-y-4 p-4">
                {/* C. Tabs */}
                <div className="sticky top-0 z-30 bg-[var(--tm-bg-page)] py-2">
                    <div className="grid h-11 grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)]" role="tablist" aria-label="学生详情内容">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                            className="flex min-h-11 items-center p-1 text-[13px] font-semibold"
                        >
                            <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all ${activeTab === 'overview' ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>成长概览</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'report'}
                            onClick={() => setActiveTab('report')}
                            className="flex min-h-11 items-center p-1 text-[13px] font-semibold"
                        >
                            <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all ${activeTab === 'report' ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>成长报告</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'collection'}
                            onClick={() => setActiveTab('collection')}
                            className="flex min-h-11 items-center p-1 text-[13px] font-semibold"
                        >
                            <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all ${activeTab === 'collection' ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>采集记录</span>
                        </button>
                    </div>
                </div>

                {/* D. Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'report' && renderReportTab()}
                    {activeTab === 'collection' && <StudentCollectionHistoryTab items={collectionHistory} termOptions={STUDENT_TERM_OPTIONS} selectedTerm={selectedTerm} onSelectedTermChange={setSelectedTerm} onOpen={onViewCollectionRecord} />}
                </div>
            </div>
            </div>

            {showStatusActionSheet && (
                <div
                    className="absolute inset-0 z-[120] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]"
                    onClick={() => setShowStatusActionSheet(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="管理学籍状态"
                >
                    <div className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
                        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" />
                        <div className="mb-4 flex items-center gap-3">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] ${student.status === 'left' ? 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]' : 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]'}`}>
                                {student.status === 'left' ? <AlertTriangle className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
                            </span>
                            <div>
                                <h3 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">学籍状态</h3>
                                <p className="mt-0.5 text-xs font-medium text-[var(--tm-text-secondary)]">当前：{studentStatusLabel}</p>
                            </div>
                        </div>
                        {student.status !== 'left' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowStatusActionSheet(false);
                                    setShowLeaveConfirm(true);
                                }}
                                className="h-12 w-full rounded-[var(--tm-radius-inner)] border border-[var(--tm-record-negative-border)] bg-[var(--tm-record-negative-bg)] text-sm font-semibold text-[var(--tm-record-negative-text)] active:scale-[0.98]"
                            >
                                设为离校
                            </button>
                        )}
                    </div>
                </div>
            )}

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
                                    setShowStatusActionSheet(false);
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
