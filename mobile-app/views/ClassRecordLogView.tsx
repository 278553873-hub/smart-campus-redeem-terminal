import React, { useState, useEffect } from 'react';
import {
    BackIcon, VolumeIcon, ActivityIcon,
    SwapIcon, FileIcon, DeleteIcon, RetryIcon, ChevronRightIcon,
    CloseIcon, WechatMoreIcon
} from '../components/Icons';
import { MOCK_STUDENTS_CLASS_1, MOCK_CLASS_RECORD_LOGS } from '../constants';
import { ASSETS } from '../assets/images';
import { Loader2, Sparkles } from 'lucide-react'; // Import directly if needed for icons not in components
import TeacherRecordAuroraBackground from '../components/TeacherRecordAuroraBackground';

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
}

// Data Models
type LogStatus = 'processing' | 'done';
type LogType = 'file' | 'voice' | 'camera' | 'text';

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
    addDemoTopBreathingSpace = false, activeTab, onTabChange
}) => {
    // State
    const [logs, setLogs] = useState<LogItem[]>(INITIAL_LOGS);

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
            const newId = `new_${Date.now()}`;
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
        <div className="mb-3.5 flex items-center justify-between relative z-20">
            <span className="text-[15px] font-bold text-slate-400 tracking-tight">{time}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveCardMenu(activeCardMenu === id ? null : id);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors active:bg-slate-100 active:text-slate-600 ${activeCardMenu === id ? 'bg-slate-100 text-slate-500' : ''}`}
                aria-label="更多操作"
            >
                <WechatMoreIcon className="w-4.5 h-4.5" />
            </button>

            {activeCardMenu === id && (
                <div className="absolute top-9 right-0 bg-white shadow-lg border border-slate-100 rounded-xl p-1 w-32 animate-in fade-in zoom-in duration-200 origin-top-right ring-1 ring-black/5 z-30">
                    <button className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2 active:bg-slate-50 rounded-lg w-full text-left" onClick={() => setActiveCardMenu(null)}>
                        <RetryIcon className="w-3.5 h-3.5" /> 重新识别
                    </button>
                    <div className="h-[1px] bg-slate-50 mx-2"></div>
                    <button className="flex items-center gap-2 text-xs font-medium text-red-500 p-2 active:bg-red-50 rounded-lg w-full text-left" onClick={() => { setLogs(l => l.filter(i => i.id !== id)); setActiveCardMenu(null); }}>
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
            className={`mb-3 inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold transition active:scale-95 ${active === 'class' ? 'border-[#EEE2FF] bg-[#FDFCFF] text-[#7C3AED]' : 'border-[#D4F4F8] bg-[#FAFEFF] text-[#128698]'}`}
            aria-label="播放原始语音"
        >
            <span className="h-0 w-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-current" aria-hidden="true" />
            <span>原始语音</span>
            <span className="flex items-center gap-0.5" aria-hidden="true">
                {[8, 14, 10, 16, 7].map((height, index) => (
                    <i key={index} className="w-0.5 rounded-full bg-current opacity-70" style={{ height }} />
                ))}
            </span>
            <span className="ml-1 text-slate-500">{duration || '10s'}</span>
        </button>
    );

    const FieldLabel = ({ text }: { text: string }) => (
        <div className="pt-1.5 text-[13px] font-bold text-slate-500">{text}</div>
    );

    const formatScoreValue = (value: number) => value > 0 ? `+${value}` : `${value}`;

    // --- Render Log Item Logic ---
    // --- Render Log Item Logic ---
    const renderLogItem = (log: LogItem) => {
        // 1. PROCESSING STATE - Candy Shimmer
        if (log.status === 'processing') {
            return (
                <div key={log.id} className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg shadow-blue-100/50 border border-white relative overflow-hidden animate-in fade-in slide-in-from-top-5 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="flex items-center gap-2.5 text-blue-600">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 rounded-full blur animate-ping opacity-20"></div>
                                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">AI 正在思考中...</span>
                        </div>
                        <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full">{log.time.split(' ')[1]}</span>
                    </div>
                    <div className="space-y-3 opacity-60 relative z-10">
                        <div className="h-4 bg-slate-100/80 rounded-full w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-slate-100/80 rounded-full w-1/2 animate-pulse"></div>
                    </div>
                </div>
            );
        }

        // 2. DONE STATE - FILE (Clean Glass)
        if (log.type === 'file') {
            return (
                <div key={log.id} className="bg-white rounded-3xl p-5 shadow-sm border border-white relative">
                    <TeacherRecordHeader id={log.id} time={log.time} />
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-50 shrink-0">
                            <FileIcon className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <div className="text-sm font-bold text-slate-700 truncate">{log.content}</div>
                            <div className="text-[11px] text-slate-400 font-bold mt-1 bg-slate-100 inline-block px-1.5 rounded">PDF DOCUMENT</div>
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
        const aiBlockClass = isNegative
            ? 'border-[#F7BCC8] bg-gradient-to-b from-[#FFF7F9] to-white shadow-[0_8px_20px_rgba(224,82,104,0.045)]'
            : 'border-[#9BEAF1] bg-gradient-to-b from-[#F7FEFF] to-white shadow-[0_8px_20px_rgba(18,184,203,0.045)]';
        const modeTextClass = isClass ? 'text-[#7C3AED] border-[#EAD8FF] bg-[#FDFCFF]' : 'text-[#128698] border-[#D4F4F8] bg-[#FAFEFF]';
        const totalClass = scoreTone === 'negative'
            ? 'border-[var(--tm-record-negative-border)] bg-[var(--tm-record-negative-bg)] text-[var(--tm-record-negative-text)]'
            : 'border-[var(--tm-record-positive-border)] bg-[var(--tm-record-positive-bg)] text-[var(--tm-record-positive-text)]';

        return (
            <div key={log.id} className="relative overflow-hidden rounded-[26px] border border-[#EDF3F7] bg-white p-4 shadow-[0_10px_26px_rgba(48,76,105,0.045)] animate-in fade-in duration-500">
                <TeacherRecordHeader id={log.id} time={log.time} />

                {log.type === 'voice' && <VoicePlayback active={log.scope} duration={log.audioDuration} />}

                <p className="mb-3.5 text-[15px] font-bold leading-[1.45] text-slate-900">
                    {log.content}
                </p>

                <button
                    type="button"
                    onClick={() => { setEditingLog(log); setShowScoreEdit(true); }}
                    className={`block w-full rounded-[24px] border-[1.5px] p-3.5 text-left transition active:scale-[0.995] ${aiBlockClass}`}
                    aria-label="编辑 AI 智能解读结果"
                >
                    <div className="mb-3 grid grid-cols-[28px_auto_1fr_auto] items-center gap-2">
                        <img
                            src={ASSETS.MANAGEMENT.AI_BOT}
                            alt="AI Bot"
                            className="h-[28px] w-[28px] object-contain"
                        />
                        <span className="text-[15px] font-extrabold text-slate-900">AI 智能解读</span>
                        <span className={`h-1 w-8 rounded-full opacity-55 ${isClass ? 'bg-gradient-to-r from-[#D8B4FE] to-[#F0ABFC]' : 'bg-gradient-to-r from-[#7DDDE7] to-[#B8C4FF]'}`} />
                        {scoreItems.length > 0 && (
                            <div className={`grid h-[43px] min-w-[78px] grid-cols-[auto_auto] items-center justify-center gap-1 rounded-[16px] border px-2.5 ${totalClass}`}>
                                <span className="text-[26px] font-black leading-none">{formatScoreValue(totalScore)}</span>
                                <span className="text-[11px] font-bold leading-none text-slate-500">总分</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[38px_minmax(0,1fr)] gap-x-2 gap-y-2">
                        <FieldLabel text="时间" />
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="inline-flex min-h-[30px] items-center rounded-full border border-[#EAF1F6] bg-white px-3 text-[14px] font-bold text-slate-800 shadow-[0_2px_8px_rgba(48,76,105,0.018)]">
                                {log.rawDate || log.time.split(' ')[0]}
                            </span>
                        </div>

                        <FieldLabel text="对象" />
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            {(log.students || []).slice(0, 1).map(stu => (
                                <span key={stu.id} className={`inline-flex min-h-[30px] max-w-full items-center rounded-full border px-2.5 text-[12px] font-extrabold ${modeTextClass}`}>
                                    {stu.name.replace(/ /g, '')}
                                </span>
                            ))}
                            {log.students && log.students.length > 1 && (
                                <span className={`inline-flex min-h-[30px] items-center rounded-full border px-2.5 text-[12px] font-extrabold ${modeTextClass}`}>+{log.students.length - 1}人</span>
                            )}
                        </div>

                        <FieldLabel text="指标" />
                        <div className="min-w-0 space-y-1.5">
                            {scoreItems.map((item, index) => (
                                <div key={`${item.label}-${index}`} className={`grid min-h-[29px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[11px] border bg-white/90 px-2.5 text-[11.5px] font-bold ${isNegative ? 'border-[#F9D8DF] text-slate-700' : 'border-[#E5EFF4] text-slate-700'}`}>
                                    <span className="min-w-0 truncate">{item.label}</span>
                                    <span className={`text-[13px] font-black ${item.value < 0 ? 'text-[#E05268]' : 'text-[#0F8F83]'}`}>{formatScoreValue(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {log.aiSummary && (
                        <div className="mt-3 rounded-[18px] bg-white/74 px-3.5 py-3 text-[14px] font-bold leading-[1.48] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]">
                            {log.aiSummary}
                        </div>
                    )}
                </button>
            </div>
        );
    };


    // --- Main Render ---
    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden">
            {/* Multi-color tech aurora background for the record page. */}
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

                    <div className="pr-[116px]">
                        <div className="flex rounded-[23px] border border-white/95 bg-white/82 p-1 shadow-[0_8px_20px_rgba(60,85,120,0.055)] ring-1 ring-[#EAF1F6]/80">
                            <button
                                onClick={() => onTabChange('student')}
                                className={`flex-1 py-3 text-[15px] font-extrabold rounded-[19px] transition-all duration-300 ${activeTab === 'student' ? 'bg-gradient-to-r from-[#19B8C8] to-[#6679F2] text-white shadow-[0_8px_16px_rgba(18,184,203,0.16)]' : 'text-[#66768A]'}`}
                            >
                                记录学生
                            </button>
                            <button
                                onClick={() => onTabChange('class')}
                                className={`flex-1 py-3 text-[15px] font-extrabold rounded-[19px] transition-all duration-300 ${activeTab === 'class' ? 'bg-gradient-to-r from-[#7C3AED] to-[#B832D2] text-white shadow-[0_8px_16px_rgba(124,58,237,0.15)]' : 'text-[#66768A]'}`}
                            >
                                记录班级
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-4 pt-2">
                    <button className="text-left text-[#7B8796] active:scale-[0.99] transition">
                        <div className="flex items-center gap-1 text-[15px] font-bold">
                            <span>查看指标</span>
                            <ChevronRightIcon className="w-4 h-4 opacity-60" />
                        </div>
                        <div className="mt-0.5 text-[12px] font-bold text-[#9AA8B8]">内容由 AI 生成</div>
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-0 space-y-4 pb-44 no-scrollbar relative z-10">
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
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDatePicker(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-lg flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">选择日期</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowDatePicker(false)} className="text-sm font-bold text-slate-400">取消</button>
                                <button onClick={() => setShowDatePicker(false)} className="text-sm font-bold text-cyan-700">完成</button>
                            </div>
                        </div>
                        <div className="h-64 overflow-hidden relative flex items-center justify-center p-6">
                            <div className="absolute inset-x-0 h-12 bg-slate-50 border-y border-slate-100 pointer-events-none"></div>
                            <div className="flex-1 h-full flex items-center justify-center gap-8 z-10">
                                {/* Simulated Wheels */}
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-tighter">Year</div>
                                    <div className="text-xl font-semibold text-slate-800">2025</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-tighter">Month</div>
                                    <div className="text-xl font-semibold text-slate-800">11</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-tighter">Day</div>
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
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowClassSelect(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-lg h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">选择班级</h3>
                                <button onClick={() => setShowClassSelect(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><CloseIcon className="w-5 h-5" /></button>
                            </div>
                            {/* Grade Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {['全部', '一年级', '二年级', '三年级', '四年级'].map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGradeFilter(grade)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                                            ${selectedGradeFilter === grade
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
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
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
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
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowScoreEdit(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-lg h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">修改得分项</h3>
                            <button onClick={() => setShowScoreEdit(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><CloseIcon className="w-5 h-5" /></button>
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
                                            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${editingLog.score?.label === label ? 'bg-indigo-50 border-indigo-200 text-cyan-700' : 'bg-white border-slate-100 text-slate-600'}`}
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
                                            className={`flex-1 h-12 rounded-xl font-mono font-semibold flex items-center justify-center transition-all ${editingLog.score?.value === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-white text-slate-400'}`}
                                        >
                                            {v > 0 ? `+${v}` : v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 safe-area-bottom">
                            <button onClick={() => setShowScoreEdit(false)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-xl shadow-indigo-100 active:scale-95 transition-all">确认修改</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Student List Modal (Reused) */}
            {showStudentListModal && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowStudentListModal(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-lg h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">涉及学生</h3>
                            <button onClick={() => setShowStudentListModal(false)} className="p-2 bg-slate-50 rounded-full active:bg-slate-100 text-slate-400  transition-colors"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {MOCK_STUDENTS_CLASS_1.slice(0, 15).map((student, idx) => (
                                <div key={student.id} className="flex items-center justify-between p-3.5 bg-slate-50/50  rounded-2xl border border-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center text-xs font-semibold text-blue-600 shadow-inner">{idx + 1}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">{student.id}</div>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-white bg-blue-500  px-4 py-2 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">替换</button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 safe-area-bottom bg-white border-t border-slate-50">
                            <button onClick={() => setShowStudentListModal(false)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold text-base shadow-lg shadow-blue-200 active:scale-[0.98] transition-all">
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
