import React, { useState, useEffect } from 'react';
import {
    BackIcon, VolumeIcon, ActivityIcon,
    SwapIcon, FileIcon, DeleteIcon, RetryIcon, ChevronRightIcon,
    CloseIcon, WechatMoreIcon, WechatCloseIcon
} from '../components/Icons';
import { MOCK_STUDENTS_CLASS_1, MOCK_CLASS_RECORD_LOGS } from '../constants';
import { ASSETS } from '../assets/images';
import { Loader2, Sparkles } from 'lucide-react'; // Import directly if needed for icons not in components

interface ClassRecordLogViewProps {
    classNameStr?: string;
    onBack: () => void;
    onStartRecord?: () => void;
    isMainView?: boolean;
    newRecordData?: any;
    onClearNewRecord?: () => void;
    onToggleModal?: (isOpen: boolean) => void;
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
    theme?: 'neutral' | 'negative' | 'positive';
    rawDate?: string; // For the editable field
    scope: 'student' | 'class';
}

const INITIAL_LOGS: LogItem[] = [
    ...MOCK_CLASS_RECORD_LOGS as LogItem[],
    {
        id: 'rec_s1',
        type: 'voice',
        status: 'done',
        time: '2026-02-05 10:20',
        content: '林大辉在操场上主动帮助低年级同学搬器材。',
        aiSummary: '林大辉表现出了极强的集体荣誉感和助人为乐的精神。',
        theme: 'positive',
        students: [{ id: 's2', name: '林大辉 (2025级一班)' }],
        score: { label: '德育-文明礼貌-助人为乐', value: 3 },
        rawDate: '2026-02-05',
        scope: 'student'
    },
    {
        id: 'rec_s2',
        type: 'text',
        status: 'done',
        time: '2026-02-05 14:00',
        content: '张子轩今天课堂小测全对，表现非常专注。',
        aiSummary: '张子轩在课堂测试中展现了扎实的基础和高度的专注力。',
        theme: 'positive',
        students: [{ id: 's3', name: '张子轩 (2025级一班)' }],
        score: { label: '智育-专注有序-课堂专注', value: 2 },
        rawDate: '2026-02-05',
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
    activeTab, onTabChange
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

    const TeacherRecordHeader = ({ id, time, isAudio = false }: { id: string, time: string, isAudio?: boolean }) => (
        <div className="flex justify-between items-center mb-3 relative z-20">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">老师记录</span>
                {isAudio && (
                    <div className="bg-slate-500 text-white rounded px-1.5 py-0.5 flex items-center justify-center h-5 w-6">
                        <VolumeIcon className="w-3 h-3" />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium font-mono">{time}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardMenu(activeCardMenu === id ? null : id);
                    }}
                    className={`text-slate-300 active:text-slate-500 p-1 -mr-1 rounded-full transition-colors ${activeCardMenu === id ? 'bg-slate-100 text-slate-500' : ''}`}
                >
                    <WechatMoreIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Menu Dropdown */}
            {activeCardMenu === id && (
                <div className="absolute top-8 right-0 bg-white shadow-xl border border-slate-100 rounded-xl p-1 w-32 animate-in fade-in zoom-in duration-200 origin-top-right ring-1 ring-black/5 z-30">
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

    const Label = ({ text }: { text: string }) => (
        <span className="text-xs font-bold text-slate-900 w-16 pt-1.5 flex-shrink-0">{text}</span>
    );

    const SwapButton = ({ onClick, isActive }: { onClick?: () => void, isActive?: boolean }) => (
        <button
            onClick={onClick}
            className={`p-1 rounded transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'active:bg-black/5 text-slate-400 active:text-slate-600'}`}
        >
            <SwapIcon className="w-4 h-4" />
        </button>
    );

    // --- Render Log Item Logic ---
    // --- Render Log Item Logic ---
    const renderLogItem = (log: LogItem) => {
        // 1. PROCESSING STATE - Candy Shimmer
        if (log.status === 'processing') {
            return (
                <div key={log.id} className="bg-white/80 backdrop-blur-md rounded-[20px] p-5 shadow-lg shadow-blue-100/50 border border-white relative overflow-hidden animate-in fade-in slide-in-from-top-5 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="flex items-center gap-2.5 text-blue-600">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 rounded-full blur animate-ping opacity-20"></div>
                                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                            </div>
                            <span className="text-sm font-black tracking-wide">AI 正在思考中...</span>
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
                <div key={log.id} className="bg-white rounded-[24px] p-5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] border border-white relative">
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

        // 3. DONE STATE - INTERACTIVE (Voice/Text/Camera) - THE MAIN CANDY CARD
        const isNegative = log.theme === 'negative';

        // Base Container - Floating White Card
        const containerClass = "bg-white rounded-[24px] shadow-[0_10px_30px_-10px_rgba(14,165,233,0.15)] border border-white/60 relative group animate-in fade-in duration-500 overflow-hidden";

        // AI Result Background - Scope based distinctions
        const isClass = log.scope === 'class';

        let resultBg = isNegative
            ? "bg-gradient-to-br from-[#FFF0F0] via-[#FFF5F5] to-white"
            : "bg-gradient-to-br from-[#E0F7FA] via-[#E3F2FD] to-[#F0F4FF]"; // Cyan -> Blue -> Soft Indigo

        if (isClass && !isNegative) {
            resultBg = "bg-gradient-to-br from-[#F0FDFA] via-[#CCFBF1] to-[#F0FDFA]"; // Teal/Aqua
        }

        const resultBorder = isNegative ? "border-rose-100" : (isClass ? "border-teal-100/50" : "border-white/50");
        const accentColor = isNegative ? "text-rose-500" : (isClass ? "text-teal-600" : "text-cyan-600");
        const buttonBaseClass = "backdrop-blur-sm border shadow-sm transition-all active:scale-95 text-[12px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5";

        return (
            <div key={log.id} className={containerClass}>
                {/* Top Section: User Input */}
                <div className="p-5 pb-3 bg-white relative z-20">
                    <TeacherRecordHeader id={log.id} time={log.time} isAudio={log.type === 'voice'} />
                    <p className="text-[16px] text-slate-700 font-medium leading-relaxed tracking-wide mb-1">
                        {log.content}
                    </p>
                </div>

                {/* Bottom Section: AI Result (The Candy Part) */}
                <div className={`${resultBg} p-5 pt-6 pb-6 relative z-10 border-t ${resultBorder}`}>

                    {/* Decorative Background Blobs */}
                    {!isNegative && (
                        <>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${isClass ? 'bg-purple-200/30' : 'bg-cyan-200/30'} rounded-full blur-[40px] pointer-events-none`}></div>
                            <div className={`absolute bottom-0 left-0 w-32 h-32 ${isClass ? 'bg-pink-200/30' : 'bg-blue-200/30'} rounded-full blur-[40px] pointer-events-none`}></div>
                        </>
                    )}

                    {/* AI Header Line */}
                    <div className="flex items-center gap-2 mb-4">
                        <img
                            src={ASSETS.MANAGEMENT.AI_BOT}
                            alt="AI Bot"
                            className="w-10 h-10 object-contain"
                        />
                        <span className={`text-sm font-black tracking-tight ${isNegative ? 'text-rose-600' : 'text-slate-700'}`}>AI 智能分析</span>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-16 text-xs font-bold text-slate-400 pl-1">时间</div>
                            <div className="flex-1 flex gap-2">
                                <button
                                    onClick={() => { setEditingLog(log); setShowDatePicker(true); }}
                                    className={`${buttonBaseClass} ${isNegative ? 'bg-white/60 border-rose-100 text-rose-600' : (isClass ? 'bg-white/60 border-purple-100 text-purple-600' : 'bg-white/60 border-white/60 text-slate-600 hover:bg-white hover:border-indigo-200')} active:scale-95 transition-all`}
                                >
                                    {log.rawDate || '2025-09-10'}
                                </button>
                            </div>
                        </div>

                        {/* 2. Students / Classes */}
                        <div className="flex items-center gap-3">
                            <div className="w-16 text-xs font-bold text-slate-400 pl-1">对象</div>
                            <div className="flex-1 flex flex-wrap gap-2">
                                {log.students?.map(stu => (
                                    <button
                                        key={stu.id}
                                        onClick={() => { setEditingLog(log); setShowClassSelect(true); }}
                                        className={`bg-white border text-slate-700 text-[12px] px-3 py-1.5 rounded-xl font-bold shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-1.5 active:scale-95 transition-all
                                            ${isClass ? 'border-teal-100/50 hover:border-teal-300' : 'border-blue-50/50 hover:border-indigo-200'}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isClass ? 'bg-teal-400' : 'bg-cyan-400'}`}></div>
                                        {stu.name}
                                    </button>
                                ))}
                                {log.students && log.students.length > 5 && (
                                    <button
                                        onClick={() => setShowStudentListModal(true)}
                                        className={`text-white text-[12px] px-3 py-1.5 rounded-xl font-bold shadow-lg flex items-center gap-1 active:scale-95 transition-transform
                                            ${isClass ? 'bg-teal-500 shadow-teal-200' : 'bg-blue-500 shadow-blue-200'}`}
                                    >
                                        +{log.students.length - 1} 人
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 3. Score (Jelly Button Style) */}
                        {log.score && (
                            <div className="flex items-center gap-3">
                                <div className="w-16 text-xs font-bold text-slate-400 pl-1">得分</div>
                                <button
                                    onClick={() => { setEditingLog(log); setShowScoreEdit(true); }}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm backdrop-blur-md transition-all active:scale-95 hover:border-indigo-300
                                    ${isNegative
                                            ? 'bg-rose-50/50 border-rose-100'
                                            : (isClass
                                                ? 'bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border-teal-100/60'
                                                : 'bg-gradient-to-r from-cyan-50/80 to-blue-50/80 border-white/60')}
                                 `}>
                                    <span className={`text-xs font-bold ${isNegative ? 'text-rose-600' : (isClass ? 'text-teal-600' : 'text-slate-600')}`}>{log.score.label}</span>
                                    <div className="w-[1px] h-3 bg-slate-300/50"></div>
                                    <span className={`text-base font-black font-mono
                                        ${isNegative ? 'text-rose-500' : (isClass ? 'text-teal-600' : 'text-blue-600 drop-shadow-sm')}`}>
                                        {log.score.value > 0 ? `+${log.score.value}` : log.score.value}
                                    </span>
                                </button>
                            </div>
                        )}

                        {/* 4. Comment Box */}
                        <div className={`mt-2 p-4 rounded-2xl text-[13px] leading-relaxed text-slate-600 text-justify relative
                            ${isNegative ? 'bg-rose-50 border border-rose-100' : 'bg-white/70 border border-white shadow-sm'}
                         `}>
                            {/* Quote Icon Decoration */}
                            <div className={`absolute -top-2 -left-1 text-4xl font-serif opacity-20 ${isNegative ? 'text-rose-300' : (isClass ? 'text-teal-300' : 'text-blue-300')}`}>“</div>
                            {log.aiSummary}
                        </div>
                    </div>
                </div>
            </div >
        );
    };


    // --- Main Render ---
    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden">
            {/* 1. Global Aurora Background (Fixed) */}
            <div className={`absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#A5F3FC] via-[#DBEAFE] to-[#FAFAFA] z-0 pointer-events-none transition-all duration-700
                ${activeTab === 'class' ? 'opacity-100 hue-rotate-[60deg] grayscale-[0.1]' : 'opacity-90'}`}></div>

            {/* 2. Floating Orbs for "Atmosphere" */}
            <div className={`absolute top-10 left-10 w-32 h-32 ${activeTab === 'class' ? 'bg-teal-300' : 'bg-cyan-300'} rounded-full blur-[60px] opacity-40 animate-pulse z-0 transition-colors duration-700`}></div>
            <div className={`absolute top-20 right-10 w-40 h-40 ${activeTab === 'class' ? 'bg-emerald-300' : 'bg-purple-300'} rounded-full blur-[60px] opacity-40 animate-pulse delay-700 z-0 transition-colors duration-700`}></div>

            {/* Header (Top-most Integration) */}
            <div className="sticky top-0 z-30 bg-white/10 backdrop-blur-xl border-b border-white/20">
                <div className="px-4 h-[50px] flex items-center justify-between">
                    {/* Left: Back (if needed) */}
                    <div className="w-10">
                        {!isMainView && (
                            <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-black/5 text-slate-700 transition-colors">
                                <BackIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Middle: Integrated Tabs (Moved Up) */}
                    <div className="flex-1 max-w-[240px]">
                        <div className="flex bg-slate-200/40 p-1 rounded-full border border-white/50 shadow-sm ring-1 ring-black/5">
                            <button
                                onClick={() => onTabChange('student')}
                                className={`flex-1 py-1.5 text-[13px] font-bold rounded-full transition-all duration-300 ${activeTab === 'student' ? 'bg-white text-indigo-600 shadow-sm scale-[1.05]' : 'text-slate-500'}`}
                            >
                                记录学生
                            </button>
                            <button
                                onClick={() => onTabChange('class')}
                                className={`flex-1 py-1.5 text-[13px] font-bold rounded-full transition-all duration-300 ${activeTab === 'class' ? 'bg-white text-teal-600 shadow-sm scale-[1.05]' : 'text-slate-500'}`}
                            >
                                记录班级
                            </button>
                        </div>
                    </div>

                    {/* Right: Capsule */}
                    <div className="w-24 flex justify-end relative">
                        <div className="flex items-center bg-white/40 backdrop-blur-md border border-white/60 rounded-full px-3 h-[32px] gap-3 shadow-sm">
                            <button
                                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                                className="w-5 h-5 flex items-center justify-center text-slate-800 active:opacity-50"
                            >
                                <WechatMoreIcon className="w-5 h-5" />
                            </button>
                            <div className="w-[1px] h-3.5 bg-slate-400/30"></div>
                            <div className="w-5 h-5 flex items-center justify-center text-slate-800"><WechatCloseIcon className="w-4 h-4" /></div>
                        </div>

                        {showHeaderMenu && (
                            <div className="absolute top-11 right-0 bg-white shadow-2xl border border-slate-100 rounded-2xl p-1.5 w-36 z-40 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <button className="flex items-center gap-2 text-xs font-bold text-slate-600 p-2.5 hover:bg-slate-50 rounded-xl w-full text-left transition-colors">
                                    <FileIcon className="w-3.5 h-3.5 text-cyan-500" /> 导出记录
                                </button>
                            </div>
                        )}
                        {showHeaderMenu && <div className="fixed inset-0 z-30" onClick={() => setShowHeaderMenu(false)}></div>}
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40 no-scrollbar relative z-10">
                {/* "View Metrics" button relocated here (above cards) */}
                <div className="flex justify-start px-2 -mb-2">
                    <button className={`bg-white/80 backdrop-blur-md border border-white/60 text-[12px] px-4 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 border-indigo-100/30
                        ${activeTab === 'class' ? 'text-teal-600 hover:bg-teal-50' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                        <ActivityIcon className="w-3.5 h-3.5" />
                        <span>查看指标</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 opacity-60" />
                    </button>
                </div>
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
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800">选择日期</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowDatePicker(false)} className="text-sm font-bold text-slate-400">取消</button>
                                <button onClick={() => setShowDatePicker(false)} className="text-sm font-bold text-indigo-600">完成</button>
                            </div>
                        </div>
                        <div className="h-64 overflow-hidden relative flex items-center justify-center p-6">
                            <div className="absolute inset-x-0 h-12 bg-slate-50 border-y border-slate-100 pointer-events-none"></div>
                            <div className="flex-1 h-full flex items-center justify-center gap-8 z-10">
                                {/* Simulated Wheels */}
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-tighter">Year</div>
                                    <div className="text-xl font-black text-slate-800">2025</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-tighter">Month</div>
                                    <div className="text-xl font-black text-slate-800">11</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-tighter">Day</div>
                                    <div className="text-xl font-black text-slate-700 opacity-40">11</div>
                                    <div className="text-xl font-black text-slate-800 py-2">12</div>
                                    <div className="text-xl font-black text-slate-700 opacity-40">13</div>
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
                            <button onClick={() => setShowDatePicker(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">确认日期</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Class Select Modal with Grade Filter */}
            {showClassSelect && editingLog && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowClassSelect(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-2xl h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-800">选择班级</h3>
                                <button onClick={() => setShowClassSelect(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><CloseIcon className="w-5 h-5" /></button>
                            </div>
                            {/* Grade Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {['全部', '一年级', '二年级', '三年级', '四年级'].map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGradeFilter(grade)}
                                        className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all border
                                            ${selectedGradeFilter === grade
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
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
                                        className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-bold text-sm transition-colors border border-transparent hover:border-indigo-100 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                            <span>{cls.n}</span>
                                            <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded-md group-hover:bg-indigo-200 group-hover:text-indigo-700">{cls.g}</span>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Score Edit Modal */}
            {showScoreEdit && editingLog && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowScoreEdit(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-2xl h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800">修改得分项</h3>
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
                                            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${editingLog.score?.label === label ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-600'}`}
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
                                            className={`flex-1 h-12 rounded-xl font-mono font-black flex items-center justify-center transition-all ${editingLog.score?.value === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-white text-slate-400'}`}
                                        >
                                            {v > 0 ? `+${v}` : v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 safe-area-bottom">
                            <button onClick={() => setShowScoreEdit(false)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all">确认修改</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Student List Modal (Reused) */}
            {showStudentListModal && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowStudentListModal(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800">涉及学生</h3>
                            <button onClick={() => setShowStudentListModal(false)} className="p-2 bg-slate-50 rounded-full active:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {MOCK_STUDENTS_CLASS_1.slice(0, 15).map((student, idx) => (
                                <div key={student.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center text-xs font-black text-blue-600 shadow-inner">{idx + 1}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">{student.id}</div>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">替换</button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 safe-area-bottom bg-white border-t border-slate-50">
                            <button onClick={() => setShowStudentListModal(false)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-200 active:scale-[0.98] transition-all">
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