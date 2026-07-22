import React, { useState, useMemo } from 'react';
import { Student, ScoreItem, GrowthReportItem, CampusCoinDetail } from '../types';
import { ASSETS } from '../assets/images';
import {
    MaleIcon, FemaleIcon, ChevronDownIcon, ChevronRightIcon,
    AwardIcon, GrowthIcon
} from '../components/Icons';
import { AlertTriangle, BadgeCheck, BookOpenCheck, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, School } from 'lucide-react';
import { MOCK_BEHAVIOR_RECORDS } from '../constants';
import { formatCoinAmount } from '../utils/coinFormat';
import type { StudentCollectionHistoryItem } from '../../shared/questionnaireStore';
import StudentCollectionHistoryTab from './student-collection/StudentCollectionHistoryTab';
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
    onViewCollectionRecord: (item: StudentCollectionHistoryItem) => void;
    onOpenStudentArchive: () => void;
    initialTab?: 'growth' | 'evaluation' | 'collection';
}

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

    const getCategoryTone = (cat: string) => {
        switch (cat) {
            case 'moral': return { main: teacherFiveEducationSemantic.virtue, soft: teacherBrandPalette.red[50], strong: teacherBrandPalette.red[700] };
            case 'intellectual': return { main: teacherFiveEducationSemantic.wisdom, soft: teacherBrandPalette.orange[50], strong: teacherBrandPalette.orange[700] };
            case 'physical': return { main: teacherFiveEducationSemantic.fitness, soft: teacherBrandPalette.green[50], strong: teacherBrandPalette.green[700] };
            case 'aesthetic': return { main: teacherFiveEducationSemantic.aesthetic, soft: teacherBrandPalette.jade[50], strong: teacherBrandPalette.jade[700] };
            case 'labor': return { main: teacherFiveEducationSemantic.labor, soft: teacherBrandPalette.gold[50], strong: teacherBrandPalette.gold[700] };
            default: return { main: teacherBrandSemantic.textSecondary, soft: teacherBrandSemantic.surfaceSoft, strong: teacherBrandSemantic.textPrimary };
        }
    };

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
                                const tone = getCategoryTone(s.category);

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
                    className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${showCurrent ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'bg-white text-[var(--tm-text-secondary)] ring-1 ring-[var(--tm-border-subtle)]'}`}
                    aria-pressed={showCurrent}
                >
                    <div className={`h-3 w-3 rounded-full border-2 ${showCurrent ? 'border-[var(--tm-brand-primary)] bg-white' : 'border-[var(--tm-border-subtle)] bg-white'}`}></div>
                    当前
                </button>

                <button
                    type="button"
                    onClick={onToggleClassAvg}
                    className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${showClassAvg ? 'bg-white text-[var(--tm-text-secondary)] ring-1 ring-[var(--tm-border-subtle)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]'}`}
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
    onViewCollectionRecord,
    onOpenStudentArchive,
    initialTab = 'growth',
}) => {
    const [activeTab, setActiveTab] = useState<'growth' | 'evaluation' | 'collection'>(initialTab);

    // UI States
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['subject_reports']));
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

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

    const validScores = scores.filter(s => s.category !== 'creativity');
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

    const renderRecordTab = () => renderEvaluationTab();

    // --- Sub-renderers ---

    const renderGrowthTab = () => (
        <div className="space-y-3 pb-24 animate-in fade-in duration-300">
            {/* C. Term Selector */}
            <div className="flex items-center gap-3">
                <button className="flex min-h-11 items-center gap-1.5 rounded-[var(--tm-radius-control)] bg-white px-3 text-sm font-medium text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)] transition-all active:opacity-60">
                    <span>2025-2026学年 上学期</span>
                    <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--tm-text-tertiary)]" />
                </button>
            </div>

            <button
                type="button"
                onClick={onOpenStudentArchive}
                className="flex min-h-[60px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-white px-4 text-left shadow-[var(--tm-shadow-card)] transition active:bg-[var(--tm-bg-surface-soft)]"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]">
                    <BookOpenCheck className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--tm-text-primary)]">学生成长档案</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
            </button>

            {/* D. Radar Chart Card */}
            <div className="relative overflow-hidden rounded-[var(--tm-radius-card)] bg-white shadow-[var(--tm-shadow-card)]">
                <div className="relative z-10 flex items-center justify-between px-5 pb-2 pt-4">
                    <h3 className="flex items-center gap-2 text-[var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">
                        <AwardIcon className="h-4 w-4 text-[var(--tm-brand-reward)]" />
                        五育能力模型
                    </h3>
                </div>
                <div className="relative z-0 flex w-full justify-center px-2 pb-4">
                    <FiveEducationRadar scores={validScores} showCurrent={showCurrent} showClassAvg={showClassAvg} onToggleCurrent={() => setShowCurrent(prev => !prev)} onToggleClassAvg={() => setShowClassAvg(prev => !prev)} />
                </div>
            </div>

            <section className="overflow-hidden rounded-[var(--tm-radius-card)] bg-white shadow-[var(--tm-shadow-card)]">
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
                        <span className="text-xs text-[var(--tm-text-secondary)]">2025-2026学年 上学期</span>
                        <button onClick={onViewTermReport} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-3 text-xs font-semibold text-[var(--tm-brand-primary-strong)] active:scale-95">查看</button>
                    </div>
                )}
                {growthReports.map((report) => (
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
                ))}
            </section>
        </div>
    );

    const renderEvaluationTab = () => (
        <div className="space-y-3 pb-24 pt-2 animate-in fade-in duration-300">
            {(MOCK_BEHAVIOR_RECORDS as any[]).map((rec) => {
                const resultSurfaceClass = rec.isBad
                    ? 'border-[var(--tm-record-negative-border)] bg-[var(--tm-record-negative-bg)]'
                    : 'border-[var(--tm-record-positive-border)] bg-[var(--tm-record-positive-bg)]';
                const resultTextClass = rec.isBad
                    ? 'text-[var(--tm-record-negative-text)]'
                    : 'text-[var(--tm-record-positive-text)]';
                const isExpanded = expandedRecordId === rec.id;

                return (
                    <article key={rec.id} className={`rounded-[var(--tm-radius-inner)] border p-4 shadow-[var(--tm-shadow-card)] ${resultSurfaceClass}`}>
                        <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-[var(--tm-text-secondary)]">
                            <span>{rec.evaluation_date} · {rec.teacherName}</span>
                            <span className={`shrink-0 text-lg font-bold tabular-nums ${resultTextClass}`}>
                                {rec.scoreChange > 0 ? `+${rec.scoreChange}` : rec.scoreChange}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                            <img src={ASSETS.MANAGEMENT.AI_BOT} alt="" className="h-6 w-6 object-contain" />
                            <span className="text-sm font-semibold text-[var(--tm-text-primary)]">AI 智能解读</span>
                        </div>

                        <p className="mt-2 text-[14px] leading-relaxed text-[var(--tm-text-primary)]">
                            {rec.aiComment}
                        </p>

                        <div className="mt-3 flex items-start justify-between gap-3 border-t border-black/5 pt-3">
                            <span className="min-w-0 text-xs leading-relaxed text-[var(--tm-text-secondary)]">
                                {rec.indicatorPath.join(' / ')}
                            </span>
                            <span className={`shrink-0 text-[13px] font-bold tabular-nums ${resultTextClass}`}>
                                {rec.scoreChange > 0 ? `+${rec.scoreChange}` : rec.scoreChange}
                            </span>
                        </div>

                        <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                            className="mt-1 flex min-h-11 w-full items-center justify-between text-left text-xs font-medium text-[var(--tm-text-secondary)]"
                        >
                            <span>原始记录</span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isExpanded && (
                            <div className="border-t border-black/5 pt-3 text-xs leading-relaxed text-[var(--tm-text-secondary)] animate-in slide-in-from-top-1">
                                <p>{rec.description}</p>
                                {rec.auditReason && (
                                    <p className="mt-2">
                                        <span className="font-semibold text-[var(--tm-text-primary)]">判定依据：</span>
                                        {rec.auditReason}
                                    </p>
                                )}
                            </div>
                        )}
                    </article>
                );
            })}
            <div className="py-6 text-center text-xs text-[var(--tm-text-tertiary)]">
                仅展示最近一年的记录
            </div>
        </div>
    );

    return (
        <div className="relative h-full min-h-0 overflow-hidden bg-transparent font-sans">
            <div className="h-full overflow-y-auto pb-safe no-scrollbar">

            {/* A. Student Profile Card */}
            <div className="relative w-full overflow-hidden rounded-b-[var(--tm-radius-card)] bg-[linear-gradient(135deg,var(--tm-bg-surface)_0%,var(--tm-brand-primary-soft)_100%)] px-4 pb-4 pt-2 shadow-[var(--tm-shadow-card)]">
                <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--tm-brand-primary)_14%,transparent),transparent_70%)]" aria-hidden="true" />
                <div className="relative">
                    <div className="mb-3 flex h-11 items-center justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="返回"
                            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={onEditBasicInfo}
                                aria-label="编辑基础信息"
                                className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowStatusActionSheet(true)}
                                aria-label="管理学籍状态"
                                className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-[var(--tm-brand-primary-soft-strong)] bg-white p-1 shadow-[var(--tm-shadow-avatar)]">
                                <img
                                    src={student.avatar || (student.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.GENERIC_GIRL)}
                                    alt={`${student.name}头像`}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--tm-text-primary)]">
                                <span className="truncate">{student.name}</span>
                                {student.gender === 'male'
                                    ? <MaleIcon className="h-4 w-4 shrink-0 text-[var(--tm-gender-male)]" />
                                    : <FemaleIcon className="h-4 w-4 shrink-0 text-[var(--tm-gender-female)]" />}
                            </h2>
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
                </div>
            </div>

            {/* 2. Scrollable Content */}
            <div className="space-y-4 p-4">
                {/* B. Assets Card */}
                <div className="rounded-[var(--tm-radius-inner)] bg-white px-3 py-2 shadow-[var(--tm-shadow-card)]">
                    <div className="flex min-h-[56px] items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)]">
                                <img src="/assets/coin.png" className="h-5 w-5" alt="" />
                            </span>
                            <div className="min-w-0">
                                <div className="text-[11px] font-medium text-[var(--tm-text-secondary)]">钱包</div>
                                <span className="block truncate text-base font-bold tabular-nums text-[var(--tm-brand-reward-strong)]">
                                    {formatCoinAmount(campusCoinDetail.balance)}
                                </span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)]">
                                <img src="/assets/coin.png" className="h-5 w-5" alt="" />
                            </span>
                            <div className="min-w-0">
                                <div className="text-[11px] font-medium text-[var(--tm-text-secondary)]">存款</div>
                                <span className="block truncate text-base font-bold tabular-nums text-[var(--tm-brand-reward-strong)]">
                                    {formatCoinAmount(campusCoinDetail.bankDeposit)}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onViewCampusCoins}
                            aria-label="查看校园币明细"
                            className="flex h-11 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-secondary)]"
                        >
                            查看明细 <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* C. Tabs */}
                <div className="sticky top-0 z-30 bg-[var(--tm-bg-page)] py-2">
                    <div className="grid h-11 grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] p-1" role="tablist" aria-label="学生详情内容">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'growth'}
                            onClick={() => setActiveTab('growth')}
                            className={`rounded-lg px-1 text-[13px] font-semibold transition-all ${activeTab === 'growth' ? 'bg-white text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-brand-primary-strong)]'}`}
                        >
                            成长报告
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'evaluation'}
                            onClick={() => setActiveTab('evaluation')}
                            className={`rounded-lg px-1 text-[13px] font-semibold transition-all ${activeTab === 'evaluation' ? 'bg-white text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-brand-primary-strong)]'}`}
                        >
                            评价记录
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'collection'}
                            onClick={() => setActiveTab('collection')}
                            className={`rounded-lg px-1 text-[13px] font-semibold transition-all ${activeTab === 'collection' ? 'bg-white text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-brand-primary-strong)]'}`}
                        >
                            采集记录
                        </button>
                    </div>
                </div>

                {/* D. Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'growth' && renderGrowthTab()}
                    {activeTab === 'evaluation' && renderRecordTab()}
                    {activeTab === 'collection' && <StudentCollectionHistoryTab items={collectionHistory} onOpen={onViewCollectionRecord} />}
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
                    <div className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
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
                    <div className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
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
                                className="h-12 rounded-[var(--tm-radius-inner)] bg-[var(--tm-status-negative)] text-sm font-semibold text-white active:scale-[0.98]"
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
