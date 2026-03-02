import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ClassListView from './views/ClassListView';
import ClassDetailView from './views/ClassDetailView';
import RecordInputView from './views/RecordInputView';
import ClassReportView from './views/ClassReportView';
import ClassRecordLogView from './views/ClassRecordLogView';
import MeView from './views/MeView';
import MyFilesView from './views/MyFilesView';
import TermReportView from './views/TermReportView';
import ClassLeaderboardView from './views/ClassLeaderboardView';
import RewardVerificationView from './views/reward-verification/RewardVerificationView';
import FaceUpdateView from './views/face-update/FaceUpdateView';
import {
    HomeIcon, UserIcon, ActivityIcon, CameraIcon, VolumeIcon,
    PlusIcon, FileIcon, CloseIcon, ChevronDownIcon, AlertCircleIcon,
    CheckCircleIcon
} from './components/Icons';

import {
    MOCK_CLASSES,
    MOCK_STUDENTS_CLASS_1,
    MOCK_SCORES,
    MOCK_SUBJECTS,
    MOCK_GROWTH_REPORTS,
    MOCK_PE_REPORT_DETAILS,
    GET_MOCK_STUDENTS_FOR_CLASS,
} from './constants';
import { Student } from './types';

const TERMS = [
    "2025-2026学年 上学期",
    "2024-2025学年 下学期",
    "2024-2025学年 上学期",
    "2023-2024学年 下学期"
];

const GRADE_SCOPES = [
    '全年级',
    '一年级',
    '二年级',
    '三年级',
    '四年级',
    '五年级',
    '六年级'
];

const SUBJECT_SCOPES = [
    '全学科',
    ...Array.from(new Set(MOCK_SUBJECTS.map(subject => subject.subject)))
];

const DEFAULT_TERM = TERMS[0];
const DEFAULT_GRADE_SCOPE = GRADE_SCOPES[0];
const DEFAULT_SUBJECT_SCOPE = SUBJECT_SCOPES[0];

const describeGradeScope = (grade: string) => grade === DEFAULT_GRADE_SCOPE ? '全校学生' : `${grade}学生`;
const describeSubjectScope = (subject: string) => subject === DEFAULT_SUBJECT_SCOPE ? '全部学科' : `${subject}学科`;

// App View States (Removed 'record_result')
type ViewState = 'home_log' | 'class_list' | 'class_detail' | 'class_report' | 'student_detail' | 'term_report' | 'record_input' | 'me' | 'my_files' | 'class_leaderboard' | 'reward_verification' | 'face_update';

const App: React.FC = () => {
    // Default view is now the Log (Stream)
    const [currentView, setCurrentView] = useState<ViewState>('home_log');
    const [history, setHistory] = useState<ViewState[]>([]);

    // Selection States
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<Student>(MOCK_STUDENTS_CLASS_1[0]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [batchStudentIds, setBatchStudentIds] = useState<string[]>([]);

    // Multi-Selection State for Class Detail
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [multiSelectIds, setMultiSelectIds] = useState<Set<string>>(new Set());

    // Data Passing State (Input -> Log)
    const [activeLogTab, setActiveLogTab] = useState<'student' | 'class'>('student');
    const [pendingRecordData, setPendingRecordData] = useState<any>(null);

    // UI States
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const plusMenuRef = useRef<HTMLDivElement>(null);

    // --- Modal States (Lifted from MeView) ---
    const [showGenModal, setShowGenModal] = useState(false);
    const [genModalType, setGenModalType] = useState<'subject' | 'term' | 'export_class'>('subject'); // Track which report type
    const [selectedTerm, setSelectedTerm] = useState(DEFAULT_TERM);
    const [selectedGradeScope, setSelectedGradeScope] = useState(DEFAULT_GRADE_SCOPE);
    const [selectedSubjectScope, setSelectedSubjectScope] = useState(DEFAULT_SUBJECT_SCOPE);
    const [showTermSelect, setShowTermSelect] = useState(false);
    const [showGradeSelect, setShowGradeSelect] = useState(false);
    const [showSubjectScopeSelect, setShowSubjectScopeSelect] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isOverlayActive, setIsOverlayActive] = useState(false);

    // Close plus menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
                setShowPlusMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to change view and push to history
    const navigateTo = (view: ViewState) => {
        setHistory(prev => [...prev, currentView]);
        setCurrentView(view);
        const mainContainer = document.getElementById('main-scroll-container');
        if (mainContainer) mainContainer.scrollTop = 0;

        // Reset multi-select when navigating away (optional, but good UX)
        if (view !== 'record_input') {
            setIsMultiSelectMode(false);
            setMultiSelectIds(new Set());
        }
    };

    const goBack = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory(prevHist => prevHist.slice(0, -1));
        setCurrentView(prev);

        // Reset multi-select when going back
        setIsMultiSelectMode(false);
        setMultiSelectIds(new Set());
    };

    const switchTab = (tab: ViewState) => {
        setHistory([]);
        setCurrentView(tab);
        const mainContainer = document.getElementById('main-scroll-container');
        if (mainContainer) mainContainer.scrollTop = 0;

        // Reset multi-select
        setIsMultiSelectMode(false);
        setMultiSelectIds(new Set());
    };

    const handleSelectClass = (classId: string) => {
        setSelectedClassId(classId);
        navigateTo('class_detail');
    };

    const handleViewClassReport = (classId: string) => {
        setSelectedClassId(classId);
        navigateTo('class_report');
    };

    const handleViewLeaderboard = () => {
        navigateTo('class_leaderboard');
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        navigateTo('student_detail');
    };

    const handleViewTermReport = () => {
        navigateTo('term_report');
    };

    const handleViewRewardVerification = (classId: string) => {
        setSelectedClassId(classId);
        navigateTo('reward_verification');
    };

    const handleViewFaceUpdate = (classId: string) => {
        setSelectedClassId(classId);
        navigateTo('face_update');
    };

    const handleStartRecord = (studentIds: string[]) => {
        setBatchStudentIds(studentIds);
        navigateTo('record_input');
        setShowPlusMenu(false);

        // Reset selection mode after starting record
        setIsMultiSelectMode(false);
        setMultiSelectIds(new Set());
    };

    const handleAnalysisComplete = (result: any) => {
        setPendingRecordData(result);
        setHistory([]);
        setCurrentView('home_log');
    };

    const handleImportWeChat = () => {
        setShowPlusMenu(false);
        alert("即将打开微信文件选择器...");
    };

    const closeAllSelectDropdowns = () => {
        setShowTermSelect(false);
        setShowGradeSelect(false);
        setShowSubjectScopeSelect(false);
    };

    const resetScopeSelections = () => {
        setSelectedTerm(DEFAULT_TERM);
        setSelectedGradeScope(DEFAULT_GRADE_SCOPE);
        setSelectedSubjectScope(DEFAULT_SUBJECT_SCOPE);
    };

    const handleCloseGenModal = () => {
        setShowGenModal(false);
        closeAllSelectDropdowns();
    };

    const handleToggleTermSelect = () => {
        setShowTermSelect(prev => !prev);
        setShowGradeSelect(false);
        setShowSubjectScopeSelect(false);
    };

    const handleToggleGradeSelect = () => {
        setShowGradeSelect(prev => !prev);
        setShowTermSelect(false);
        setShowSubjectScopeSelect(false);
    };

    const handleToggleSubjectScopeSelect = () => {
        setShowSubjectScopeSelect(prev => !prev);
        setShowTermSelect(false);
        setShowGradeSelect(false);
    };

    const renderModalScopeMessage = () => {
        if (genModalType === 'subject') {
            const gradeText = describeGradeScope(selectedGradeScope);
            const subjectText = describeSubjectScope(selectedSubjectScope);
            return (
                <>
                    系统将基于 <span className="font-bold underline decoration-orange-300">{selectedTerm}</span> 数据，为
                    <span className="font-bold underline decoration-orange-300 ml-1 mr-1">{gradeText}</span>
                    的
                    <span className="font-bold underline decoration-orange-300 ml-1">{subjectText}</span>
                    生成学科报告。请确保相关任课老师已完成数据录入。
                </>
            );
        }
        if (genModalType === 'term') {
            const gradeText = describeGradeScope(selectedGradeScope);
            return (
                <>
                    系统将基于 <span className="font-bold underline decoration-orange-300">{selectedTerm}</span> 数据，为
                    <span className="font-bold underline decoration-orange-300 ml-1">{gradeText}</span>
                    生成期末综合素质报告。请确保全学科指标均已完成录入。
                </>
            );
        }
        return (
            <>
                是否导出<span className="font-bold underline decoration-orange-300">全班的学期报告</span>？<br />文件生成后将自动下载到您的手机。
            </>
        );
    };

    const handleConfirmGenerate = () => {
        setShowGenModal(false);
        closeAllSelectDropdowns();
        setShowSuccessToast(true);
        // Removed setTimeout to allow manual close
    };

    const handleToggleMultiSelect = () => {
        if (isMultiSelectMode) {
            setIsMultiSelectMode(false);
            setMultiSelectIds(new Set());
        } else {
            setIsMultiSelectMode(true);
        }
    };

    const handleMultiSelectionChange = (ids: Set<string>) => {
        setMultiSelectIds(ids);
    };

    // Modal Handlers
    const handleOpenSubjectGenModal = () => {
        resetScopeSelections();
        closeAllSelectDropdowns();
        setGenModalType('subject');
        setShowGenModal(true);
    };

    const handleOpenTermGenModal = () => {
        resetScopeSelections();
        closeAllSelectDropdowns();
        setGenModalType('term');
        setShowGenModal(true);
    };

    const handleOpenExportClassModal = () => {
        closeAllSelectDropdowns();
        setGenModalType('export_class');
        setShowGenModal(true);
    };

    const getHeaderTitle = () => {
        switch (currentView) {
            case 'home_log': return '老师记录';
            case 'class_list': return '我的班级';
            case 'class_detail': return MOCK_CLASSES.find(c => c.id === selectedClassId)?.name || '班级详情';
            case 'class_report': return '班级报告';
            case 'student_detail': return '学生详情';
            case 'report_detail': return `${selectedSubject}报告`;
            case 'term_report': return '';
            case 'me': return '';
            case 'my_files': return '我的文件';
            case 'class_leaderboard': return '排行榜';
            default: return '';
        }
    };

    const getActiveStudentNames = () => {
        return MOCK_STUDENTS_CLASS_1
            .filter(s => batchStudentIds.includes(s.id))
            .map(s => s.name)
            .join('、');
    };

    // Floating Input Bar Component - AI Tech Style
    const GlobalInputBar = () => {
        const inputPlaceholder = isMultiSelectMode
            ? `已选${multiSelectIds.size}人，发消息或按住说话...`
            : "发消息或按住说话...";

        // Determine target IDs based on mode
        const targetIds: string[] = isMultiSelectMode ? Array.from(multiSelectIds) : [];

        // Disable file upload as requested
        const showPlusButton = false;

        return (
            <div className="absolute bottom-[90px] left-0 right-0 px-6 z-40 pointer-events-none max-w-md mx-auto">

                {/* Plus Menu Popup - Refined Glass */}
                {showPlusMenu && showPlusButton && (
                    <div ref={plusMenuRef} className="pointer-events-auto absolute bottom-[80px] right-6 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/60 p-2 w-64 animate-in slide-in-from-bottom-4 fade-in duration-300 origin-bottom-right">
                        <button
                            onClick={handleImportWeChat}
                            className="w-full flex items-center gap-3 p-4 active:bg-indigo-50/50 rounded-2xl text-slate-700 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-active:scale-90 transition-transform">
                                <FileIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold">从微信聊天记录导入</span>
                        </button>
                    </div>
                )}

                <div className={`ai-card p-2 pointer-events-auto flex items-center gap-3 ring-1 ring-white/60 bg-white/60 transition-colors duration-500 ${activeLogTab === 'class' ? 'shadow-[0_8px_30px_rgba(20,184,166,0.1)]' : 'shadow-[0_8px_30px_rgba(79,70,229,0.1)]'}`}>
                    <button
                        onClick={() => handleStartRecord(targetIds)}
                        className={`transition-colors p-2.5 rounded-full ${activeLogTab === 'class' ? 'text-teal-400 active:text-teal-600 active:bg-teal-50' : 'text-slate-400 active:text-indigo-600 active:bg-indigo-50'}`}
                    >
                        <CameraIcon className="w-6 h-6" />
                    </button>

                    <div
                        onClick={() => handleStartRecord(targetIds)}
                        className={`flex-1 transition-all rounded-2xl h-[46px] px-4 flex items-center cursor-text border border-white/40 
                            ${activeLogTab === 'class'
                                ? 'bg-teal-50/30 hover:bg-teal-50/50 hover:border-teal-200/50'
                                : 'bg-white/40 hover:bg-white/60 hover:border-indigo-200/50'} 
                            ${isMultiSelectMode ? (activeLogTab === 'class' ? 'ring-2 ring-teal-400 bg-teal-50/40' : 'ring-2 ring-indigo-400 bg-indigo-50/30') : ''}`}
                    >
                        <span className={`text-[13px] ${isMultiSelectMode ? (activeLogTab === 'class' ? 'text-teal-600 font-bold' : 'text-indigo-600 font-bold') : 'text-slate-400 font-medium'}`}>
                            {inputPlaceholder}
                        </span>
                    </div>

                    <button
                        onClick={() => handleStartRecord(targetIds)}
                        className={`transition-colors p-2.5 rounded-full w-[40px] h-[40px] flex items-center justify-center 
                            ${activeLogTab === 'class' ? 'text-teal-400 active:text-teal-600 active:bg-teal-50' : 'text-slate-400 active:text-indigo-600 active:bg-indigo-50'}`}
                    >
                        <VolumeIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };


    const showInputBar = ['home_log', 'class_list', 'class_detail'].includes(currentView);
    const showTabBar = ['home_log', 'class_list', 'me'].includes(currentView);
    const viewHandlesScroll = ['home_log', 'class_detail', 'report_detail'].includes(currentView);

    return (
        <div className="app-container">
            {/* Real App Mockup Frame */}
            <div className="phone-mockup">
                <div className="dynamic-island"></div>
                <div className="status-bar-mock">
                    <span>9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><path d="M1 10.5h1.5v-1.5h-1.5v1.5zm3.5 0h1.5v-3.5h-1.5v3.5zm3.5 0h1.5v-5.5h-1.5v5.5zm3.5 0h1.5v-8.5h-1.5v8.5zm3.5 0h1.5v-10.5h-1.5v10.5z" /></svg>
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor"><path d="M15.333 1.667H1.333A1.333 1.333 0 0 0 0 3v4a1.333 1.333 0 0 0 1.333 1.333h14A1.333 1.333 0 0 0 16.667 7V3a1.333 1.333 0 0 0-1.334-1.333z" /><path d="M17.333 3.333v3.334" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" /></svg>
                    </div>
                </div>

                <div className="flex-1 flex flex-col relative w-full h-full bg-white/40 overflow-hidden border-t border-white/60 backdrop-blur-3xl">

                    {/* Header Handling */}
                    {currentView !== 'record_input' && currentView !== 'home_log' && currentView !== 'report_detail' && currentView !== 'term_report' && currentView !== 'me' && currentView !== 'my_files' && (
                        <div className="pt-0">
                            <Header
                                title={getHeaderTitle()}
                                onBack={history.length > 0 ? goBack : undefined}
                            />
                        </div>
                    )}

                    {(currentView === 'home_log' || currentView === 'me' || currentView === 'my_files') && (
                        <div className="h-0 bg-transparent shrink-0"></div>
                    )}

                    {currentView === 'report_detail' && (
                        <button
                            onClick={goBack}
                            className="absolute top-4 left-4 z-50 p-2 bg-white/20 active:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors border border-white/20"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    )}


                    <main
                        key={currentView}
                        id="main-scroll-container"
                        className={`flex-1 relative animate-page-enter ${isOverlayActive ? 'z-[100]' : 'z-auto'} ${viewHandlesScroll ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar'}`}
                    >
                        {currentView === 'home_log' && (
                            <ClassRecordLogView
                                activeTab={activeLogTab}
                                onTabChange={setActiveLogTab}
                                onBack={goBack}
                                isMainView={true}
                                onStartRecord={() => handleStartRecord([])}
                                newRecordData={pendingRecordData}
                                onClearNewRecord={() => setPendingRecordData(null)}
                                onToggleModal={setIsOverlayActive}
                            />
                        )}

                        {currentView === 'class_list' && (
                            <ClassListView
                                classes={MOCK_CLASSES}
                                onSelectClass={handleSelectClass}
                                onViewClassReport={handleViewClassReport}
                                onOpenExportModal={handleOpenExportClassModal}
                                onViewLeaderboard={handleViewLeaderboard}
                                onViewRewardVerification={handleViewRewardVerification}
                                onViewFaceUpdate={handleViewFaceUpdate}
                            />
                        )}

                        {currentView === 'class_detail' && (
                            <ClassDetailView
                                classInfo={MOCK_CLASSES.find(c => c.id === selectedClassId)!}
                                students={GET_MOCK_STUDENTS_FOR_CLASS(selectedClassId)}
                                onSelectStudent={handleSelectStudent}
                                // Use lifted props
                                onStartRecord={handleStartRecord}
                                onViewRecords={() => setCurrentView('home_log')}
                                isSelectionMode={isMultiSelectMode}
                                onToggleSelectionMode={handleToggleMultiSelect}
                                selectedIds={multiSelectIds}
                                onSelectionChange={handleMultiSelectionChange}
                            />
                        )}

                        {currentView === 'class_report' && (
                            <ClassReportView
                                classInfo={MOCK_CLASSES.find(c => c.id === selectedClassId)!}
                                students={GET_MOCK_STUDENTS_FOR_CLASS(selectedClassId)}
                                onSelectStudent={handleSelectStudent}
                                onGoToClassDetail={() => handleSelectClass(selectedClassId)}
                            />
                        )}

                        {currentView === 'class_leaderboard' && (
                            <ClassLeaderboardView
                                onBack={goBack}
                            />
                        )}

                        {currentView === 'reward_verification' && (
                            <RewardVerificationView
                                classId={selectedClassId}
                                onBack={goBack}
                            />
                        )}

                        {currentView === 'face_update' && (
                            <FaceUpdateView
                                classId={selectedClassId}
                                onBack={goBack}
                            />
                        )}

                        {currentView === 'student_detail' && (
                            <DashboardView
                                student={selectedStudent}
                                scores={MOCK_SCORES}
                                subjects={MOCK_SUBJECTS}
                                growthReports={MOCK_GROWTH_REPORTS}
                                onViewTermReport={handleViewTermReport}
                            />
                        )}


                        {currentView === 'term_report' && (
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <TermReportView
                                    student={selectedStudent}
                                    onBack={goBack}
                                />
                            </div>
                        )}

                        {currentView === 'me' && (
                            <MeView
                                onNavigateToFiles={() => navigateTo('my_files')}
                                onOpenGenerateModal={handleOpenSubjectGenModal}
                                onOpenTermGenerateModal={handleOpenTermGenModal}
                            />
                        )}

                        {currentView === 'my_files' && (
                            <MyFilesView onBack={goBack} />
                        )}
                    </main>

                    {showInputBar && <GlobalInputBar />}

                    {currentView === 'record_input' && (
                        <div className="absolute inset-0 z-50 overflow-hidden">
                            <RecordInputView
                                initialStudentIds={batchStudentIds}
                                studentNameList={getActiveStudentNames()}
                                onClose={goBack}
                                onAnalysisComplete={handleAnalysisComplete}
                            />
                        </div>
                    )}

                    {/* AI Tech Tab Bar */}
                    {showTabBar && (
                        <div className="ai-tabbar flex justify-around items-end pb-4 h-[85px] safe-area-bottom sticky bottom-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
                            <button
                                onClick={() => switchTab('home_log')}
                                className={`flex flex-col items-center gap-1.5 mb-1 w-16 transition-all duration-300 ${currentView === 'home_log' ? 'text-indigo-600 scale-110' : 'text-slate-400 active:text-indigo-400'}`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${currentView === 'home_log' ? 'bg-indigo-50 shadow-inner' : ''}`}>
                                    <ActivityIcon className={`w-6 h-6 ${currentView === 'home_log' ? 'fill-indigo-200' : ''}`} />
                                </div>
                                <span className="text-[10px] font-bold tracking-wider">记录</span>
                            </button>

                            <button
                                onClick={() => switchTab('class_list')}
                                className={`flex flex-col items-center gap-1.5 mb-1 w-16 transition-all duration-300 ${currentView === 'class_list' ? 'text-indigo-600 scale-110' : 'text-slate-400 active:text-indigo-400'}`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${currentView === 'class_list' ? 'bg-indigo-50 shadow-inner' : ''}`}>
                                    <HomeIcon className={`w-6 h-6 ${currentView === 'class_list' ? 'fill-indigo-200' : ''}`} />
                                </div>
                                <span className="text-[10px] font-bold tracking-wider">班级</span>
                            </button>

                            <button
                                onClick={() => switchTab('me')}
                                className={`flex flex-col items-center gap-1.5 mb-1 w-16 transition-all duration-300 ${currentView === 'me' ? 'text-indigo-600 scale-110' : 'text-slate-400 active:text-indigo-400'}`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${currentView === 'me' ? 'bg-indigo-50 shadow-inner' : ''}`}>
                                    <UserIcon className={`w-6 h-6 ${currentView === 'me' ? 'fill-indigo-200' : ''}`} />
                                </div>
                                <span className="text-[10px] font-bold tracking-wider">我的</span>
                            </button>
                        </div>
                    )}


                    {/* ================= MODALS & OVERLAYS (GLASS) ================= */}

                    {showGenModal && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-200">
                            <div className="glass-dark w-full max-w-sm rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 relative animate-in zoom-in-95 duration-200 border border-white/50">

                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {genModalType === 'subject' ? '确认生成学科报告?' :
                                            genModalType === 'term' ? '确认生成期末报告?' :
                                                '确认导出全班报告?'}
                                    </h3>
                                    <button
                                        onClick={handleCloseGenModal}
                                        className="p-1 rounded-full text-slate-400 active:bg-slate-100"
                                    >
                                        <CloseIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-5 relative">
                                    <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">报告所属学期</label>
                                    <button
                                        onClick={handleToggleTermSelect}
                                        className="w-full flex items-center justify-between bg-white border border-slate-100 text-slate-800 text-sm font-bold px-4 py-3 rounded-xl shadow-sm active:bg-slate-50 transition-colors"
                                    >
                                        {selectedTerm}
                                        <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${showTermSelect ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showTermSelect && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-xl z-20 py-1 animate-in slide-in-from-top-2 duration-100 overflow-hidden">
                                            {TERMS.map(term => (
                                                <button
                                                    key={term}
                                                    onClick={() => {
                                                        setSelectedTerm(term);
                                                        setShowTermSelect(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium active:bg-slate-50 flex items-center justify-between ${term === selectedTerm ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                                >
                                                    {term}
                                                    {term === selectedTerm && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {(genModalType === 'subject' || genModalType === 'term') && (
                                    <div className="mb-5 relative">
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">生成年级范围</label>
                                        <button
                                            onClick={handleToggleGradeSelect}
                                            className="w-full flex items-center justify-between bg-white border border-slate-100 text-slate-800 text-sm font-bold px-4 py-3 rounded-xl shadow-sm active:bg-slate-50 transition-colors"
                                        >
                                            {selectedGradeScope}
                                            <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${showGradeSelect ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showGradeSelect && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-xl z-20 py-1 animate-in slide-in-from-top-2 duration-100 overflow-hidden">
                                                {GRADE_SCOPES.map(grade => (
                                                    <button
                                                        key={grade}
                                                        onClick={() => {
                                                            setSelectedGradeScope(grade);
                                                            setShowGradeSelect(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-sm font-medium active:bg-slate-50 flex items-center justify-between ${grade === selectedGradeScope ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                                    >
                                                        {grade}
                                                        {grade === selectedGradeScope && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {genModalType === 'subject' && (
                                    <div className="mb-5 relative">
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block ml-1">学科范围</label>
                                        <button
                                            onClick={handleToggleSubjectScopeSelect}
                                            className="w-full flex items-center justify-between bg-white border border-slate-100 text-slate-800 text-sm font-bold px-4 py-3 rounded-xl shadow-sm active:bg-slate-50 transition-colors"
                                        >
                                            {selectedSubjectScope}
                                            <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${showSubjectScopeSelect ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showSubjectScopeSelect && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-xl z-20 py-1 animate-in slide-in-from-top-2 duration-100 overflow-hidden">
                                                {SUBJECT_SCOPES.map(subject => (
                                                    <button
                                                        key={subject}
                                                        onClick={() => {
                                                            setSelectedSubjectScope(subject);
                                                            setShowSubjectScopeSelect(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-sm font-medium active:bg-slate-50 flex items-center justify-between ${subject === selectedSubjectScope ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                                    >
                                                        {subject}
                                                        {subject === selectedSubjectScope && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4 flex gap-3 mb-6">
                                    <div className="mt-0.5 shrink-0">
                                        <AlertCircleIcon className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div className="text-xs leading-relaxed text-orange-800 opacity-90">
                                        <span className="font-bold block mb-1 text-orange-900">操作提示</span>
                                        {renderModalScopeMessage()}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCloseGenModal}
                                        className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm active:bg-slate-50 transition-colors bg-white/50"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleConfirmGenerate}
                                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                                    >
                                        {genModalType === 'export_class' ? '确认导出' : '立即生成'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Success Toast Overlay */}
                    {showSuccessToast && (
                        <div className="absolute inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
                            <div className="bg-slate-800/95 backdrop-blur-xl text-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center text-center max-w-[280px] w-full animate-in zoom-in-95 duration-300 border border-white/10 relative overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 ring-2 ring-white/10">
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold mb-2">
                                    {genModalType === 'export_class' ? '正在导出...' : 'AI 生成中...'}
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                    {genModalType === 'export_class' ? (
                                        <>
                                            文件生成中...<br />
                                            完成后将自动下载
                                        </>
                                    ) : (
                                        <>
                                            数据量较大，稍后可以在<br />
                                            <span className="text-white font-medium">学生详情页</span> 进行查看
                                        </>
                                    )}
                                </p>
                                <button
                                    onClick={() => setShowSuccessToast(false)}
                                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold text-white transition-all active:scale-95 relative z-10"
                                >
                                    知道了
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default App;
