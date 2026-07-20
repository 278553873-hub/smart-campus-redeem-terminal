import React, { useState, useEffect, useRef } from 'react';
import {
    BackIcon, VolumeIcon, ActivityIcon,
    SwapIcon, FileIcon, DeleteIcon, RetryIcon, ChevronRightIcon,
    CloseIcon, WechatMoreIcon
} from '../components/Icons';
import { MOCK_STUDENTS_CLASS_1, MOCK_CLASS_RECORD_LOGS } from '../constants';
import { ASSETS } from '../assets/images';
import { Loader2, Sparkles } from 'lucide-react'; // Import directly if needed for icons not in components
import TeacherRecordAuroraBackground from '../components/TeacherRecordAuroraBackground';
import ClassSourceTrigger from '../components/ClassSourceTrigger';
import type { TeacherSpaceType } from '../domain/teacherSpaceAccess';

interface ClassRecordLogViewProps {
    classNameStr?: string;
    onBack: () => void;
    onStartRecord?: () => void;
    isMainView?: boolean;
    newRecordData?: any;
    onClearNewRecord?: () => void;
    onToggleModal?: (isOpen: boolean) => void;
    addDemoTopBreathingSpace?: boolean;
    activeTab: 'student' | 'class';
    onTabChange: (tab: 'student' | 'class') => void;
    classSourceName?: string;
    classSourceType?: TeacherSpaceType;
    showClassSourceSwitcher?: boolean;
    canRecordClass?: boolean;
    onOpenClassSourceSwitcher?: () => void;
}

// Data Models
type LogStatus = 'processing' | 'done';
type LogType = 'file' | 'voice' | 'camera' | 'text';

const recordSheetBackdropClass = 'fixed inset-0 z-[1000] flex items-end justify-center bg-[var(--tm-mask)] backdrop-blur-sm animate-in fade-in [animation-duration:var(--tm-duration-standard)]';
const recordSheetSurfaceClass = 'flex w-full max-w-md flex-col rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-sheet)] animate-in slide-in-from-bottom [animation-duration:var(--tm-duration-panel)]';

interface LogItem {
    id: string;
    type: LogType;
    status: LogStatus;
    time: string;
    content: string; // User input or file name
    // AI Analysis Data
    aiSummary?: string;
    students?: { id: string, name: string }[];
    score?: { label: string, value: number };
    scores?: { label: string, value: number }[];
    theme?: 'neutral' | 'negative' | 'positive';
    audioDuration?: string;
    rawDate?: string; // For the editable field
    scope: 'student' | 'class';
}

const INITIAL_LOGS: LogItem[] = [
    ...MOCK_CLASS_RECORD_LOGS as LogItem[],
    {
        id: 'rec_s1',
        type: 'voice',
        status: 'done',
        time: '2026-06-03 14:55',
        content: '2025级4班全体同学积极参加大扫除。',
        aiSummary: '全体同学积极参与劳动，体现出良好的集体意识和责任感。',
        theme: 'positive',
        students: [
            { id: 's2', name: '林小杰 (2025级1班)' },
            { id: 's3', name: '赵小美 (2025级1班)' },
            { id: 's4', name: '王一鸣 (2025级1班)' },
            { id: 's5', name: '周雨晴 (2025级1班)' },
            { id: 's6', name: '陈子涵 (2025级1班)' },
            { id: 's7', name: '刘浩然 (2025级1班)' },
            { id: 's8', name: '黄思思 (2025级1班)' },
            { id: 's9', name: '何嘉乐 (2025级1班)' },
            { id: 's10', name: '唐心怡 (2025级1班)' },
            { id: 's11', name: '马宇航 (2025级1班)' },
            { id: 's12', name: '宋佳宁 (2025级1班)' },
            { id: 's13', name: '冯子墨 (2025级1班)' },
            { id: 's14', name: '罗诗涵 (2025级1班)' },
            { id: 's15', name: '邓博文 (2025级1班)' },
            { id: 's16', name: '高若曦 (2025级1班)' },
            { id: 's17', name: '谢一诺 (2025级1班)' },
            { id: 's18', name: '蒋明轩 (2025级1班)' },
            { id: 's19', name: '曹艺菲 (2025级1班)' },
            { id: 's20', name: '彭俊熙 (2025级1班)' },
            { id: 's21', name: '叶梓萱 (2025级1班)' },
            { id: 's22', name: '余昊天 (2025级1班)' },
            { id: 's23', name: '潘思源 (2025级1班)' },
            { id: 's24', name: '钟雅琪 (2025级1班)' },
            { id: 's25', name: '戴睿哲 (2025级1班)' },
            { id: 's26', name: '袁欣怡 (2025级1班)' },
            { id: 's27', name: '夏知远 (2025级1班)' },
            { id: 's28', name: '许梦瑶 (2025级1班)' },
            { id: 's29', name: '邱泽宇 (2025级1班)' },
            { id: 's30', name: '魏思齐 (2025级1班)' },
            { id: 's31', name: '曾沐阳 (2025级1班)' },
            { id: 's32', name: '苏语桐 (2025级1班)' },
            { id: 's33', name: '卢嘉懿 (2025级1班)' },
            { id: 's34', name: '丁睿轩 (2025级1班)' },
            { id: 's35', name: '乔芷晴 (2025级1班)' },
            { id: 's36', name: '韩子昂 (2025级1班)' },
            { id: 's37', name: '程若琳 (2025级1班)' },
            { id: 's38', name: '田宇辰 (2025级1班)' },
            { id: 's39', name: '傅安然 (2025级1班)' },
            { id: 's40', name: '顾星辰 (2025级1班)' },
        ],
        score: { label: '德育-责任担当-集体劳动', value: 3 },
        scores: [
            { label: '德育-责任担当-集体劳动', value: 2 },
            { label: '劳育-劳动习惯-环境维护', value: 1 }
        ],
        audioDuration: '12s',
        rawDate: '2026-06-02',
        scope: 'student'
    },
    {
        id: 'rec_s2',
        type: 'text',
        status: 'done',
        time: '2026-06-03 10:12',
        content: '张子轩获得四川省青少年编程竞赛图形化编程组二等奖。',
        aiSummary: '张子轩在科技创新活动中表现突出，体现出较强的问题解决能力。',
        theme: 'positive',
        students: [{ id: 's3', name: '张子轩 (2025级一班)' }],
        score: { label: '智育-专注有序-课堂专注', value: 2 },
        rawDate: '2026-06-03',
        scope: 'student'
    },
    {
        id: 'rec_f1',
        type: 'file',
        status: 'done',
        time: '2026-01-11 13:59',
        content: '体育综合素质评价表三年级体育.xlsx',
        aiSummary: '这份文档是“2025-2026学年上学期”的“体育”学科的“期末成绩”。涉及三年级5个班共计200名学生，成绩包括“学习态度、课后锻炼、健康知识、专项运动技能和体能”等维度。',
        theme: 'neutral',
        scope: 'class'
    }
];

const ClassRecordLogView: React.FC<ClassRecordLogViewProps> = ({
    classNameStr, onBack, onStartRecord, isMainView = false, newRecordData, onClearNewRecord, onToggleModal,
    addDemoTopBreathingSpace = false, activeTab, onTabChange, classSourceName = '',
    classSourceType = 'personal', showClassSourceSwitcher = false, canRecordClass = false,
    onOpenClassSourceSwitcher
}) => {
    // State
    const [logs, setLogs] = useState<LogItem[]>(INITIAL_LOGS);
    const processedRecordIdsRef = useRef<Set<string>>(new Set());

    // UI Interaction State
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
    const [showStudentListModal, setShowStudentListModal] = useState(false);
    const [editingDateId, setEditingDateId] = useState<string | null>(null);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editingLog, setEditingLog] = useState<LogItem | null>(null);
    const [showClassSelect, setShowClassSelect] = useState(false);
    const [showScoreEdit, setShowScoreEdit] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('全部');

    // Sync modal state to parent
    useEffect(() => {
        const isAnyOpen = showStudentListModal || showClassSelect || showScoreEdit || showDatePicker;
        onToggleModal?.(isAnyOpen);
    }, [showStudentListModal, showClassSelect, showScoreEdit, showDatePicker, onToggleModal]);

    // Effect: Handle New Record Injection
    useEffect(() => {
        if (newRecordData) {
            const recordRequestId = newRecordData.requestId ?? `${newRecordData.type ?? 'record'}:${newRecordData.text ?? ''}`;
            if (processedRecordIdsRef.current.has(recordRequestId)) return;
            processedRecordIdsRef.current.add(recordRequestId);

            const newId = `new_${recordRequestId}`;
            const now = new Date();
            const timeString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            // 1. Add Processing Card
            const processingLog: LogItem = {
                id: newId,
                type: newRecordData.type || 'voice',
                status: 'processing',
                time: timeString,
                content: newRecordData.text || '录音处理中...',
                scope: activeTab
            };

            setLogs(prev => [processingLog, ...prev]);
            if (onClearNewRecord) onClearNewRecord();

            // 2. Simulate AI Processing (using service if possible, or simulated with real-like data)
            const analyze = async () => {
                // In a real app we'd call: 
                // const result = await analyzeBehaviorRecord(newRecordData.text, MOCK_INDICATORS);

                // For this demo, we simulate a very realistic response based on the prompt's logic
                setTimeout(() => {
                    setLogs(prev => prev.map(log => {
                        if (log.id === newId) {
                            return {
                                ...log,
                                status: 'done',
                                aiSummary: '在课堂上表现非常主动，能够积极举手回答问题，展现了良好的学习热情。',
                                theme: 'positive',
                                students: [
                                    { id: 's1', name: '林小杰 (2025级1班)' }
                                ],
                                score: { label: '智育-专注有序-课堂专注', value: 2 },
                                scores: [{ label: '智育-专注有序-课堂专注', value: 2 }],
                                audioDuration: '8s',
                                rawDate: now.toISOString().split('T')[0],
                                scope: 'student'
                            };
                        }
                        return log;
                    }));
                }, 2000);
            };

            analyze();
        }
    }, [newRecordData, onClearNewRecord]);

    // --- Helpers ---
    const handleUpdateLogDate = (id: string, newDate: string) => {
        setLogs(prev => prev.map(log => log.id === id ? { ...log, rawDate: newDate } : log));
    };

    const handleUpdateLogObject = (id: string, name: string) => {
        setLogs(prev => prev.map(log => log.id === id ? { ...log, students: [{ id: 'class_id', name }] } : log));
        setShowClassSelect(false);
    };

    const handleUpdateLogScore = (id: string, label: string, value: number) => {
        setLogs(prev => prev.map(log => log.id === id ? { ...log, score: { label, value } } : log));
        setShowScoreEdit(false);
    };

    // --- Components ---

    const TeacherRecordHeader = ({ id, time }: { id: string, time: string }) => (
        <div className="relative z-20 mb-3 flex items-center justify-between">
            <span className="text-[13px] font-medium text-[var(--tm-text-disabled)]">{time}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardMenu(activeCardMenu === id ? null : id);
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-tertiary)] transition-colors active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-secondary)] ${activeCardMenu === id ? 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]' : ''}`}
                aria-label="更多操作"
            >
                <WechatMoreIcon className="w-4.5 h-4.5" />
            </button>

            {activeCardMenu === id && (
                <div className="absolute right-0 top-11 z-30 w-32 origin-top-right animate-in rounded-[var(--tm-radius-control)] bg-white p-1 shadow-[var(--tm-shadow-floating)] ring-1 ring-[var(--tm-border-subtle)] fade-in zoom-in duration-200">
                    <button className="flex min-h-11 w-full items-center gap-2 rounded-[8px] px-2 text-left text-xs font-medium text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]" onClick={() => setActiveCardMenu(null)}>
                        <RetryIcon className="w-3.5 h-3.5" /> 重新识别
                    </button>
                    <div className="mx-2 h-px bg-[var(--tm-bg-surface-muted)]"></div>
                    <button className="flex min-h-11 w-full items-center gap-2 rounded-[8px] px-2 text-left text-xs font-medium text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]" onClick={() => { setLogs(l => l.filter(i => i.id !== id)); setActiveCardMenu(null); }}>
                        <DeleteIcon className="w-3.5 h-3.5" /> 删除记录
                    </button>
                </div>
            )}
            {activeCardMenu === id && <div className="fixed inset-0 z-10" onClick={() => setActiveCardMenu(null)}></div>}
        </div>
    );

    const VoicePlayback = ({ active, duration }: { active: 'student' | 'class'; duration?: string }) => (
        <button
            type="button"
            className={`mb-3 inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition active:scale-95 ${active === 'class' ? 'bg-[var(--tm-record-class-soft)] text-[var(--tm-record-class-text)]' : 'bg-[var(--tm-record-student-soft)] text-[var(--tm-record-student-text)]'}`}
            aria-label="播放原始语音"
        >
            <span className="h-0 w-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-current" aria-hidden="true" />
            <span>原始语音</span>
            <span className="flex items-center gap-0.5" aria-hidden="true">
                {[8, 14, 10, 16, 7].map((height, index) => (
                    <i key={index} className="w-0.5 rounded-full bg-current opacity-70" style={{ height }} />
                ))}
            </span>
            <span className="ml-1 text-[var(--tm-text-secondary)]">{duration || '10s'}</span>
        </button>
    );

    const FieldLabel = ({ text }: { text: string }) => (
        <div className="pt-1 text-[12px] font-medium text-[var(--tm-text-secondary)]">{text}</div>
    );

    const formatScoreValue = (value: number) => value > 0 ? `+${value}` : `${value}`;
    const modeTextTone = activeTab === 'class'
        ? 'text-[var(--tm-record-class-text)]'
        : 'text-[var(--tm-record-student-text)]';
    const modeSolidTone = activeTab === 'class'
        ? 'bg-[var(--tm-record-class-primary)] text-white'
        : 'bg-[var(--tm-record-student-primary)] text-white';
    const modeSoftTone = activeTab === 'class'
        ? 'bg-[var(--tm-record-class-soft)] text-[var(--tm-record-class-text)]'
        : 'bg-[var(--tm-record-student-soft)] text-[var(--tm-record-student-text)]';

    // --- Render Log Item Logic ---
    // --- Render Log Item Logic ---
    const renderLogItem = (log: LogItem) => {
        // 1. PROCESSING STATE
        if (log.status === 'processing') {
            const processingTone = activeTab === 'class'
                ? 'text-[var(--tm-record-class-text)]'
                : 'text-[var(--tm-record-student-text)]';
            return (
                <div key={log.id} className="relative overflow-hidden rounded-[var(--tm-radius-card)] bg-white p-4 shadow-[var(--tm-shadow-card)] animate-in fade-in slide-in-from-top-5 duration-500">
                    <div className="relative z-10 mb-4 flex items-center justify-between">
                        <div className={`flex items-center gap-2.5 ${processingTone}`}>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-semibold">AI 正在识别</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--tm-text-disabled)]">{log.time.split(' ')[1]}</span>
                    </div>
                    <div className="relative z-10 space-y-3 opacity-70">
                        <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-[var(--tm-bg-surface-muted)]"></div>
                        <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-[var(--tm-bg-surface-muted)]"></div>
                    </div>
                </div>
            );
        }

        // 2. DONE STATE - FILE
        if (log.type === 'file') {
            return (
                <div key={log.id} className="relative rounded-[var(--tm-radius-card)] bg-white p-4 shadow-[var(--tm-shadow-card)]">
                    <TeacherRecordHeader id={log.id} time={log.time} />
                    <div className="mb-1 flex items-center gap-3 rounded-2xl bg-[var(--tm-bg-surface-soft)] p-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--tm-brand-primary)]">
                            <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <div className="truncate text-sm font-semibold text-[var(--tm-text-primary)]">{log.content}</div>
                            <div className="mt-1 text-[11px] font-medium text-[var(--tm-text-disabled)]">文件记录</div>
                        </div>
                    </div>
                </div>
            );
        }

        // 3. DONE STATE - INTERACTIVE (Voice/Text/Camera)
        const isNegative = log.theme === 'negative' || (log.score?.value ?? 0) < 0;
        const isClass = log.scope === 'class';
        const scoreItems = log.scores && log.scores.length > 0 ? log.scores : (log.score ? [log.score] : []);
        const totalScore = scoreItems.reduce((sum, item) => sum + item.value, 0);
        const scoreTone = isNegative ? 'negative' : 'positive';
        const modeTextClass = isClass
            ? 'bg-[var(--tm-record-class-soft)] text-[var(--tm-record-class-text)]'
            : 'bg-[var(--tm-record-student-soft)] text-[var(--tm-record-student-text)]';
        const modeAccentClass = isClass
            ? 'bg-[var(--tm-record-class-primary)]'
            : 'bg-[var(--tm-record-student-primary)]';
        const totalClass = scoreTone === 'negative'
            ? 'bg-[var(--tm-record-negative-bg)] text-[var(--tm-record-negative-text)]'
            : 'bg-[var(--tm-record-positive-bg)] text-[var(--tm-record-positive-text)]';

        return (
            <div key={log.id} className="relative overflow-hidden rounded-[var(--tm-radius-card)] bg-white p-4 shadow-[var(--tm-shadow-card)] animate-in fade-in duration-500">
                <TeacherRecordHeader id={log.id} time={log.time} />

                {log.type === 'voice' && <VoicePlayback active={log.scope} duration={log.audioDuration} />}

                <p className="mb-3.5 text-[14px] font-medium leading-[1.55] text-[var(--tm-text-primary)]">
                    {log.content}
                </p>

                <button
                    type="button"
                    onClick={() => { setEditingLog(log); setShowScoreEdit(true); }}
                    className="block w-full rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-3.5 text-left transition active:scale-[0.995]"
                    aria-label="编辑 AI 智能解读结果"
                >
                    <div className="mb-3 grid grid-cols-[26px_auto_1fr_auto] items-center gap-2">
                        <img
                            src={ASSETS.MANAGEMENT.AI_BOT}
                            alt="AI Bot"
                            className="h-[26px] w-[26px] object-contain"
                        />
                        <span className="text-[14px] font-semibold text-[var(--tm-text-primary)]">AI 智能解读</span>
                        <span className={`h-1 w-6 rounded-full opacity-70 ${modeAccentClass}`} />
                        {scoreItems.length > 0 && (
                            <div className={`grid h-10 min-w-[68px] grid-cols-[auto_auto] items-center justify-center gap-1 rounded-[var(--tm-radius-control)] px-2.5 ${totalClass}`}>
                                <span className="text-[22px] font-bold leading-none">{formatScoreValue(totalScore)}</span>
                                <span className="text-[10px] font-medium leading-none text-[var(--tm-text-secondary)]">总分</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[38px_minmax(0,1fr)] gap-x-2 gap-y-2">
                        <FieldLabel text="时间" />
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="inline-flex min-h-[28px] items-center text-[13px] font-medium text-[var(--tm-text-primary)]">
                                {log.rawDate || log.time.split(' ')[0]}
                            </span>
                        </div>

                        <FieldLabel text="对象" />
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            {(log.students || []).slice(0, 1).map(stu => (
                                <span key={stu.id} className={`inline-flex min-h-[28px] max-w-full items-center rounded-full px-2.5 text-[12px] font-semibold ${modeTextClass}`}>
                                    {stu.name.replace(/ /g, '')}
                                </span>
                            ))}
                            {log.students && log.students.length > 1 && (
                                <span className={`inline-flex min-h-[28px] items-center rounded-full px-2.5 text-[12px] font-semibold ${modeTextClass}`}>+{log.students.length - 1}人</span>
                            )}
                        </div>

                        <FieldLabel text="指标" />
                        <div className="min-w-0 space-y-1.5">
                            {scoreItems.map((item, index) => (
                                <div key={`${item.label}-${index}`} className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-[var(--tm-border-subtle)] px-0.5 text-[12px] font-medium text-[var(--tm-text-primary)] last:border-b-0">
                                    <span className="min-w-0 truncate">{item.label}</span>
                                    <span className={`text-[13px] font-bold ${item.value < 0 ? 'text-[var(--tm-record-negative-text)]' : 'text-[var(--tm-record-positive-text)]'}`}>{formatScoreValue(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {log.aiSummary && (
                        <div className="mt-3 border-t border-[var(--tm-border-subtle)] pt-3 text-[13px] font-medium leading-[1.55] text-[var(--tm-text-primary)]">
                            {log.aiSummary}
                        </div>
                    )}
                </button>
            </div>
        );
    };


    // --- Main Render ---
    return (
        <div className="relative flex h-full flex-col overflow-hidden bg-transparent">
            {/* Brand-tinted atmosphere stays subtle so content remains visually neutral. */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <TeacherRecordAuroraBackground activeTab={activeTab} />
            </div>

            {/* Header (Top-most Integration) */}
            <div className={`sticky top-0 z-30 ${addDemoTopBreathingSpace ? 'pt-2' : ''}`}>
                <div className="px-5 pt-3">
                    {/* Left: Back (if needed) */}
                    {!isMainView && (
                        <div className="mb-2 w-10 shrink-0">
                            <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-black/5 text-slate-700 transition-colors">
                                <BackIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className={`flex min-h-11 items-center gap-3 ${canRecordClass ? '' : 'justify-between'}`}>
                        {showClassSourceSwitcher && classSourceName && (
                            <ClassSourceTrigger
                                name={classSourceName}
                                type={classSourceType}
                                onClick={onOpenClassSourceSwitcher}
                                variant="quiet"
                            />
                        )}
                        {!canRecordClass && (
                            <button
                                type="button"
                                className="ml-auto flex min-h-11 shrink-0 items-center gap-0.5 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-medium text-[var(--tm-text-secondary)] transition-colors duration-200 active:bg-[var(--tm-bg-surface-muted)] active:text-[var(--tm-text-primary)]"
                                aria-label="查看学生指标"
                            >
                                <span>学生指标</span>
                                <ChevronRightIcon className="h-3.5 w-3.5 opacity-60" />
                            </button>
                        )}
                    </div>
                </div>

                {canRecordClass && (
                    <div className="grid grid-cols-[224px_minmax(0,1fr)] items-end gap-3 px-5 pb-3 pt-1.5">
                        <div className="w-full">
                            <div className="flex h-full rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-glass)] p-1 shadow-[var(--tm-shadow-control)]">
                                <button
                                    onClick={() => onTabChange('student')}
                                    className={`min-h-11 flex-1 rounded-[var(--tm-radius-control)] px-2 text-[14px] font-semibold transition-[background-color,color] [transition-duration:var(--tm-duration-standard)] ${activeTab === 'student' ? 'bg-[var(--tm-record-student-soft)] text-[var(--tm-record-student-text)]' : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                                    aria-pressed={activeTab === 'student'}
                                >
                                    记录学生
                                </button>
                                <button
                                    onClick={() => onTabChange('class')}
                                    className={`min-h-11 flex-1 rounded-[var(--tm-radius-control)] px-2 text-[14px] font-semibold transition-[background-color,color] [transition-duration:var(--tm-duration-standard)] ${activeTab === 'class' ? 'bg-[var(--tm-record-class-soft)] text-[var(--tm-record-class-text)]' : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                                    aria-pressed={activeTab === 'class'}
                                >
                                    记录班级
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="flex min-h-11 shrink-0 items-center justify-self-end gap-0.5 rounded-[var(--tm-radius-control)] pl-3 pr-2.5 text-[13px] font-medium text-[var(--tm-text-secondary)] transition-[background-color,color,transform] duration-200 active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)] active:text-[var(--tm-text-primary)]"
                            aria-label={`查看${activeTab === 'student' ? '学生' : '班级'}指标`}
                        >
                            <span>{activeTab === 'student' ? '学生指标' : '班级指标'}</span>
                            <ChevronRightIcon className="h-3.5 w-3.5 opacity-60" />
                        </button>
                    </div>
                )}
            </div>

            {/* List Content */}
            <div className="relative z-10 flex-1 min-h-0 space-y-3.5 overflow-y-auto px-5 pb-44 pt-0 no-scrollbar">
                {logs
                    .filter(log => log.scope === activeTab)
                    .map(log => renderLogItem(log))}
                {logs.filter(log => log.scope === activeTab).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">暂无{activeTab === 'student' ? '学生' : '班级'}记录</p>
                    </div>
                )}
            </div>


            {/* Mobile Style Date Picker */}
            {showDatePicker && editingLog && (
                <div className={recordSheetBackdropClass} onClick={() => setShowDatePicker(false)}>
                    <div className={recordSheetSurfaceClass} onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">选择日期</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowDatePicker(false)} className="min-h-11 px-2 text-sm font-bold text-[var(--tm-text-disabled)]">取消</button>
                                <button onClick={() => setShowDatePicker(false)} className={`min-h-11 px-2 text-sm font-semibold ${modeTextTone}`}>完成</button>
                            </div>
                        </div>
                        <div className="h-64 overflow-hidden relative flex items-center justify-center p-6">
                            <div className="absolute inset-x-0 h-12 bg-slate-50 border-y border-slate-100 pointer-events-none"></div>
                            <div className="flex-1 h-full flex items-center justify-center gap-8 z-10">
                                {/* Simulated Wheels */}
                                <div className="text-center">
                                    <div className="mb-1 text-[11px] font-medium text-slate-300">年</div>
                                    <div className="text-xl font-semibold text-slate-800">2025</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-1 text-[11px] font-medium text-slate-300">月</div>
                                    <div className="text-xl font-semibold text-slate-800">11</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-1 text-[11px] font-medium text-slate-300">日</div>
                                    <div className="text-xl font-semibold text-slate-700 opacity-40">11</div>
                                    <div className="text-xl font-semibold text-slate-800 py-2">12</div>
                                    <div className="text-xl font-semibold text-slate-700 opacity-40">13</div>
                                </div>
                            </div>
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                value={editingLog.rawDate || '2025-11-12'}
                                onChange={(e) => {
                                    handleUpdateLogDate(editingLog.id, e.target.value);
                                    setTimeout(() => setShowDatePicker(false), 300);
                                }}
                            />
                        </div>
                        <div className="p-4 safe-area-bottom">
                            <button onClick={() => setShowDatePicker(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold">确认日期</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Class Select Modal with Grade Filter */}
            {showClassSelect && editingLog && (
                <div className={recordSheetBackdropClass} onClick={() => setShowClassSelect(false)}>
                    <div className={`${recordSheetSurfaceClass} h-[75vh]`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">选择班级</h3>
                                <button onClick={() => setShowClassSelect(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-disabled)]"><CloseIcon className="w-5 h-5" /></button>
                            </div>
                            {/* Grade Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {['全部', '一年级', '二年级', '三年级', '四年级'].map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGradeFilter(grade)}
                                        className={`min-h-11 whitespace-nowrap rounded-xl border px-4 text-xs font-bold transition-all
                                            ${selectedGradeFilter === grade
                                                ? 'border-transparent bg-[var(--tm-record-class-primary)] text-white'
                                                : 'bg-slate-50 border-transparent text-slate-500 '}`}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {[
                                { g: '一年级', n: '2025级1班' },
                                { g: '一年级', n: '2025级2班' },
                                { g: '二年级', n: '2024级1班' },
                                { g: '二年级', n: '2024级2班' },
                                { g: '二年级', n: '2024级3班' },
                                { g: '三年级', n: '2023级1班' },
                                { g: '四年级', n: '2022级1班' },
                            ]
                                .filter(item => selectedGradeFilter === '全部' || item.g === selectedGradeFilter)
                                .map(cls => (
                                    <button
                                        key={cls.n}
                                        onClick={() => handleUpdateLogObject(editingLog.id, cls.n)}
                                        className="w-full text-left p-4 rounded-2xl bg-slate-50   font-bold text-sm transition-colors border border-transparent  flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--tm-record-class-primary)]"></div>
                                            <span>{cls.n}</span>
                                            <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded-md group- group-">{cls.g}</span>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 opacity-0 group- transition-opacity" />
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Score Edit Modal */}
            {showScoreEdit && editingLog && (
                <div className={recordSheetBackdropClass} onClick={() => setShowScoreEdit(false)}>
                    <div className={`${recordSheetSurfaceClass} h-[70vh]`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">修改得分项</h3>
                            <button onClick={() => setShowScoreEdit(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-disabled)]"><CloseIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">选择指标</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(activeTab === 'class'
                                        ? ['健体班级-早操体锻-做操规范', '诗意中队-少先队礼仪-佩戴规范', '美净班级-环境卫生-午间清洁', '文雅班级-路队管理-文明放学', '安全班级-班级安全教育-安全班会']
                                        : ['品德之星-遵纪守法-遵守纪律', '品德之星-礼仪之星-文明礼貌', '智慧之星-学习态度-勤学好问', '劳动之星-生活自理-内务整洁']
                                    ).map(label => (
                                        <button
                                            key={label}
                                            onClick={() => handleUpdateLogScore(editingLog.id, label, editingLog.score?.value || 0)}
                                            className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition-all ${editingLog.score?.label === label ? `border-transparent ${modeSoftTone}` : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-text-secondary)]'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">分值调整</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                    {[-2, -1, 1, 2, 3, 5].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => handleUpdateLogScore(editingLog.id, editingLog.score?.label || '', v)}
                                            className={`flex h-12 flex-1 items-center justify-center rounded-xl font-mono font-semibold transition-all ${editingLog.score?.value === v ? `${v < 0 ? 'bg-[var(--tm-status-negative)]' : 'bg-[var(--tm-status-positive)]'} scale-105 text-white` : `${v < 0 ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-status-positive)]'} bg-white`}`}
                                        >
                                            {v > 0 ? `+${v}` : v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 safe-area-bottom">
                            <button onClick={() => setShowScoreEdit(false)} className={`w-full rounded-2xl py-4 font-semibold transition-all active:scale-95 ${modeSolidTone}`}>确认修改</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Student List Modal (Reused) */}
            {showStudentListModal && (
                <div className={recordSheetBackdropClass} onClick={() => setShowStudentListModal(false)}>
                    <div className={`${recordSheetSurfaceClass} h-[85vh]`} onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">涉及学生</h3>
                            <button onClick={() => setShowStudentListModal(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-disabled)] transition-colors active:bg-[var(--tm-bg-surface-muted)]"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {MOCK_STUDENTS_CLASS_1.slice(0, 15).map((student, idx) => (
                                <div key={student.id} className="flex items-center justify-between p-3.5 bg-slate-50/50  rounded-2xl border border-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tm-record-student-soft)] text-xs font-semibold text-[var(--tm-record-student-text)]">{idx + 1}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">{student.id}</div>
                                        </div>
                                    </div>
                                    <button className="min-h-11 rounded-xl bg-[var(--tm-record-student-soft)] px-4 text-xs font-semibold text-[var(--tm-record-student-text)] transition-all active:scale-95">替换</button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 safe-area-bottom bg-white border-t border-slate-50">
                            <button onClick={() => setShowStudentListModal(false)} className="w-full rounded-2xl bg-[var(--tm-record-student-primary)] py-4 text-base font-semibold text-white transition-all active:scale-[0.98]">
                                确认列表
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassRecordLogView;
