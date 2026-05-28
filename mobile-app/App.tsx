import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
import LeaderReportView from './views/LeaderReportView';
import RewardVerificationView from './views/reward-verification/RewardVerificationView';
import FaceUpdateView from './views/face-update/FaceUpdateView';
import { BankPasswordView } from './views/bank-password/BankPasswordView';
import HomeworkEntryView from './views/HomeworkEntryView';
import TeacherProfileEditView from './views/TeacherProfileEditView';
import StudentBasicEditView from './views/StudentBasicEditView';
import StudentCoinDetailView from './views/StudentCoinDetailView';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import TeacherRecordAuroraBackground from './components/TeacherRecordAuroraBackground';
import { DeviceWrapper } from '../components/DeviceWrapper';
import PhoneMockup from '../components/PhoneMockup';
import { ASSETS } from './assets/images';
import {
    HomeIcon, UserIcon, ActivityIcon, CameraIcon, VolumeIcon,
    PlusIcon, FileIcon, CloseIcon, ChevronDownIcon, AlertCircleIcon,
    CheckCircleIcon, KeyboardIcon
} from './components/Icons';

import {
    HomeIcon as Home, UserIcon as User, ActivityIcon as Activity, CameraIcon as Camera, VolumeIcon as Volume,
    PlusIcon as Plus, FileIcon as File, CloseIcon as Close, ChevronDownIcon as ChevronDown, AlertCircleIcon as AlertCircle,
    CheckCircleIcon as CheckCircle
} from './components/Icons';

import {
    HomeIcon as HomeLucide, UserIcon as UserLucide, ActivityIcon as ActivityLucide, CameraIcon as CameraLucide, VolumeIcon as VolumeLucide,
    AlertCircleIcon as AlertCircleLucide, BarChartIcon as BarChartLucide, CheckIcon as CheckLucide,
    SearchIcon as SearchLucide, ClockIcon as ClockLucide, MapPinIcon as MapPinLucide, LogOutIcon as LogOutLucide,
    BellIcon as BellLucide, ActivityIcon as ActivityBaseLucide, Camera as CameraLucideComponent, History as HistoryLucide, ChevronLeft as ChevronLeftLucide, ShieldCheck as ShieldCheckLucide,
    Smartphone as SmartphoneLucide, FileText as FileTextLucide, BookOpen as BookOpenLucide, User as UserLucideComponent, MoreHorizontal as MoreHorizontalLucide, Activity as ActivityComponent
} from 'lucide-react';

import './styles/navigation.css';
import TeacherFluidGlassNav from './components/TeacherFluidGlassNav';

import {
    MOCK_CLASSES,
    MOCK_STUDENTS_CLASS_1,
    MOCK_SCORES,
    MOCK_SUBJECTS,
    MOCK_GROWTH_REPORTS,
    MOCK_PE_REPORT_DETAILS,
    GET_MOCK_STUDENTS_FOR_CLASS,
    GET_MOCK_CAMPUS_COIN_DETAIL,
} from './constants';
import { Student, TeacherDepartment, TeacherProfile } from './types';

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
const TEACHER_PROFILE_SUBJECTS = Array.from(new Set(MOCK_SUBJECTS.map(subject => subject.subject)));
const TEACHER_PROFILE_DEPARTMENTS: TeacherDepartment[] = [
    { id: 'student-development', name: '学发中心' },
    { id: 'moral-education', name: '德育处' },
    { id: 'academic-affairs', name: '教务处' },
    { id: 'physical-education', name: '艺体组' },
    { id: 'grade-office', name: '年级办公室' },
];

const createTeachingAssignments = (classIds: string[], subject: string) => (
    classIds.map(classId => ({ classId, subject }))
);

const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
    avatar: ASSETS.AVATAR.TEACHER_LIU,
    departmentId: 'student-development',
    departmentName: '学发中心',
    teachingAssignments: [
        ...createTeachingAssignments(['c_2025_1', 'c_2025_2', 'c_2025_3', 'c_2025_4', 'c_2025_5', 'c_2025_6', 'c_2025_7'], '体育'),
        ...createTeachingAssignments(['c_2024_1', 'c_2024_2', 'c_2024_3', 'c_2024_4', 'c_2024_5', 'c_2024_6', 'c_2024_7', 'c_2024_8', 'c_2024_9', 'c_2024_10'], '体育'),
    ],
    homeroomClassIds: ['c_2025_1'],
    gradeLeaderGrades: ['2025级'],
};

const describeGradeScope = (grade: string) => grade === DEFAULT_GRADE_SCOPE ? '全校学生' : `${grade}学生`;
const describeSubjectScope = (subject: string) => subject === DEFAULT_SUBJECT_SCOPE ? '全部学科' : `${subject}学科`;

// App View States (Removed 'record_result')
type ViewState = 'home_log' | 'class_list' | 'class_detail' | 'class_report' | 'student_detail' | 'student_basic_edit' | 'student_coin_detail' | 'term_report' | 'record_input' | 'me' | 'my_files' | 'teacher_profile_edit' | 'class_leaderboard' | 'leader_report' | 'reward_verification' | 'face_update' | 'bank_password' | 'homework_entry';

interface MobileAppProps {
    showPhoneShell?: boolean;
}

const App: React.FC<MobileAppProps> = ({ showPhoneShell = true }) => {
    // Default view is now the Log (Stream)
    const [currentView, setCurrentView] = useState<ViewState>('home_log');
    const [history, setHistory] = useState<ViewState[]>([]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
    // 交替状态用于触发底栏 CSS 抖动果冻动画的重新播放
    const [jellyToggle, setJellyToggle] = useState<'a' | 'b' | 'none'>('none');

    // 测量底栏物理尺寸以供滑块镜头克隆层完全对齐
    const tabbarRef = useRef<HTMLDivElement>(null);
    const [tabbarWidth, setTabbarWidth] = useState(320);

    useLayoutEffect(() => {
        if (tabbarRef.current) {
            setTabbarWidth(tabbarRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (tabbarRef.current) {
                setTabbarWidth(tabbarRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        const timer = setTimeout(() => {
            if (tabbarRef.current) {
                setTabbarWidth(tabbarRef.current.offsetWidth);
            }
        }, 50);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [currentView]);

    const getActiveTabIndex = (view: ViewState): number => {
        if (view === 'home_log' || view === 'record_input') return 0;
        if (view === 'class_list' || view === 'class_detail' || view === 'class_report' || view === 'student_detail' || view === 'student_basic_edit' || view === 'student_coin_detail' || view === 'class_leaderboard' || view === 'leader_report' || view === 'reward_verification' || view === 'face_update' || view === 'bank_password' || view === 'homework_entry') return 1;
        if (view === 'me' || view === 'my_files' || view === 'teacher_profile_edit') return 2;
        return 0;
    };

    useEffect(() => {
        const nextIndex = getActiveTabIndex(currentView);
        if (nextIndex !== activeIndex) {
            if (nextIndex > activeIndex) {
                setSlideDirection('right');
            } else if (nextIndex < activeIndex) {
                setSlideDirection('left');
            }
            setActiveIndex(nextIndex);
            
            // 每次点击切换 Tab 时，交替改变 jellyToggle 状态，强制浏览器重新渲染并播放 CSS 动画
            setJellyToggle(prev => {
                if (prev === 'none') return 'a';
                return prev === 'a' ? 'b' : 'a';
            });

            const timer = setTimeout(() => {
                setSlideDirection('none');
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [currentView, activeIndex]);

    // Selection States
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<Student>(MOCK_STUDENTS_CLASS_1[0]);
    const [studentOverrides, setStudentOverrides] = useState<Record<string, Student>>({});
    const activeStudent = studentOverrides[selectedStudent.id] ?? selectedStudent;
    const activeCampusCoinDetail = GET_MOCK_CAMPUS_COIN_DETAIL(activeStudent);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [batchStudentIds, setBatchStudentIds] = useState<string[]>([]);
    const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(DEFAULT_TEACHER_PROFILE);

    // Multi-Selection State for Class Detail
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [multiSelectIds, setMultiSelectIds] = useState<Set<string>>(new Set());

    const [activeLogTab, setActiveLogTab] = useState<'student' | 'class'>('student');
    const [pendingRecordData, setPendingRecordData] = useState<any>(null);
    const [recordMode, setRecordMode] = useState<'voice' | 'camera' | 'text'>('voice');

    // UI States
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const plusMenuRef = useRef<HTMLDivElement>(null);

    // --- Modal States (Lifted from MeView) ---
    const [showGenModal, setShowGenModal] = useState(false);
    const [genModalType, setGenModalType] = useState<'subject' | 'term'>('subject'); // Track which report type
    const [selectedTerm, setSelectedTerm] = useState(DEFAULT_TERM);
    const [selectedGradeScope, setSelectedGradeScope] = useState(DEFAULT_GRADE_SCOPE);
    const [selectedSubjectScope, setSelectedSubjectScope] = useState(DEFAULT_SUBJECT_SCOPE);
    const [showTermSelect, setShowTermSelect] = useState(false);
    const [showGradeSelect, setShowGradeSelect] = useState(false);
    const [showSubjectScopeSelect, setShowSubjectScopeSelect] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isOverlayActive, setIsOverlayActive] = useState(false);

    // Keyboard States
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [inputText, setInputText] = useState('');

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

    const handleViewLeaderReport = () => {
        navigateTo('leader_report');
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(studentOverrides[student.id] ?? student);
        navigateTo('student_detail');
    };

    const handleSaveStudentBasicInfo = (student: Student) => {
        setStudentOverrides(prev => ({ ...prev, [student.id]: student }));
        setSelectedStudent(student);
        goBack();
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

    const handleViewBankPassword = (classId: string) => {
        setSelectedClassId(classId);
        navigateTo('bank_password');
    };

    const handleViewHomeworkEntry = (classId: string) => {
        setSelectedClassId(classId);
        navigateTo('homework_entry');
    };

    const handleStartRecord = (studentIds: string[], mode: 'voice' | 'camera' | 'text' = 'voice') => {
        setBatchStudentIds(studentIds);
        setRecordMode(mode);
        navigateTo('record_input');
        setShowPlusMenu(false);

        // Reset selection mode after starting record
        setIsMultiSelectMode(false);
        setMultiSelectIds(new Set());
    };

    const handleAnalysisComplete = (result: any) => {
        setPendingRecordData(result);
        if (showKeyboard) {
            setShowKeyboard(false);
            setInputText('');
        }
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
        return null;
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

    const getHeaderTitle = () => {
        switch (currentView) {
            case 'home_log': return '老师记录';
            case 'class_list': return '我的班级';
            case 'class_report': return '班级报告';
            case 'student_detail': return '学生详情';
            case 'student_basic_edit': return '基础信息编辑';
            case 'student_coin_detail': return '校园币详情';
            case 'report_detail': return `${selectedSubject}报告`;
            case 'term_report': return '';
            case 'me': return '';
            case 'my_files': return '我的文件';
            case 'teacher_profile_edit': return '编辑教师信息';
            case 'class_leaderboard': return '排行榜';
            case 'leader_report': return '学校数据报表';
            case 'reward_verification': return '班级奖励兑换';
            case 'face_update': return '更新人脸数据';
            case 'bank_password': return '设置兑换密码';
            case 'homework_entry': return MOCK_CLASSES.find(c => c.id === selectedClassId)?.name || '作业录入';
            default: return '';
        }
    };

    const getActiveStudentNames = () => {
        return MOCK_STUDENTS_CLASS_1
            .filter(s => batchStudentIds.includes(s.id))
            .map(s => s.name)
            .join('、');
    };

    // Floating Input Bar Component - icon-first quick record actions.
    const GlobalInputBar = () => {
        // Determine target IDs based on mode
        const targetIds: string[] = isMultiSelectMode ? Array.from(multiSelectIds) : [];
        const theme = activeLogTab === 'class'
            ? {
                shell: 'from-teal-50/90 via-white/95 to-cyan-50/90 border-teal-100/80 shadow-[0_18px_48px_-22px_rgba(20,184,166,0.65)]',
                primary: 'from-[#00B19D] to-[#3B82F6] shadow-teal-500/25',
                soft: 'text-teal-600 bg-teal-50/95 border-teal-100',
                dot: 'bg-teal-500 shadow-teal-400/80',
            }
            : {
                shell: 'from-indigo-50/90 via-white/95 to-pink-50/90 border-indigo-100/80 shadow-[0_18px_48px_-22px_rgba(99,102,241,0.65)]',
                primary: 'from-[#7F56FF] to-[#E24CB0] shadow-indigo-500/25',
                soft: 'text-indigo-600 bg-indigo-50/95 border-indigo-100',
                dot: 'bg-indigo-500 shadow-indigo-400/80',
            };

        return (
            <div className={`absolute left-0 right-0 px-5 z-[60] pointer-events-none max-w-md mx-auto transition-all duration-300 ${showKeyboard ? 'bottom-[310px]' : 'bottom-[96px]'}`}>
                <div className={`pointer-events-auto relative mx-auto flex w-fit items-center gap-2 rounded-full border bg-gradient-to-r ${theme.shell} backdrop-blur-3xl px-2.5 py-2 transition-colors duration-500`}>
                    <div className={`absolute -top-1 right-5 h-2.5 w-2.5 rounded-full ${theme.dot} shadow-lg ring-4 ring-white/80`}></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleStartRecord(targetIds, 'camera')}
                            aria-label="拍照记录"
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all active:scale-95 ${theme.soft}`}
                        >
                            <CameraIcon className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => setShowKeyboard(true)}
                            aria-label={isMultiSelectMode ? `已选${multiSelectIds.size}人，文字记录` : '文字记录'}
                            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white/95 shadow-sm transition-all active:scale-95
                                ${isMultiSelectMode
                                    ? (activeLogTab === 'class' ? 'border-teal-300 ring-2 ring-teal-100 text-teal-600' : 'border-indigo-300 ring-2 ring-indigo-100 text-indigo-600')
                                    : 'border-white/80 text-slate-500'}`}
                        >
                            <KeyboardIcon className="h-5 w-5" />
                            {showKeyboard && (
                                <div className="absolute -bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-current"></div>
                            )}
                        </button>

                        <button
                            onClick={() => handleStartRecord(targetIds, 'voice')}
                            aria-label="语音记录"
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${theme.primary} text-white shadow-lg transition-all active:scale-95 active:shadow-none`}
                        >
                            <VolumeIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const TabItem = ({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) => {
        const Icon = icon === 'Activity' ? ActivityLucide : icon === 'Home' ? HomeLucide : UserLucide;
        return (
            <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-400 opacity-60'}`}>
                <Icon size={24} />
                <span className="text-xs font-medium">{label}</span>
            </button>
        );
    };

    const TabBar = ({ active, onChange }: { active: string; onChange: (v: string) => void }) => (
        <div className="absolute bottom-0 left-0 w-full h-[83px] pb-[34px] flex items-center justify-between px-10 bg-white/80 backdrop-blur-md border-t border-slate-100/50 z-50">
            <TabItem icon="Activity" label="记录" active={active === 'home_log'} onClick={() => onChange('home_log')} />
            <TabItem icon="Home" label="班级" active={active === 'class_list' || active === 'class_detail' || active === 'class_report'} onClick={() => onChange('class_list')} />
            <TabItem icon="User" label="我的" active={active === 'me' || active === 'my_files'} onClick={() => onChange('me')} />
        </div>
    );


    const showInputBar = ['home_log', 'class_detail'].includes(currentView);
    const showTabBar = ['home_log', 'class_list', 'me'].includes(currentView);
    const viewHandlesScroll = ['home_log', 'class_detail', 'student_basic_edit', 'student_coin_detail', 'report_detail'].includes(currentView);
    const hasScreenLevelBackground = ['home_log', 'class_list', 'class_detail', 'student_detail', 'me'].includes(currentView);

    const getPhoneScreenBackground = () => {
        if (currentView === 'home_log') {
            return <TeacherRecordAuroraBackground activeTab={activeLogTab} />;
        }

        if (currentView === 'class_list' || currentView === 'class_detail') {
            return <div className="h-full w-full teacher-mobile-phone-gradient" aria-hidden="true"></div>;
        }

        if (currentView === 'student_detail') {
            return (
                <div className="relative h-full w-full overflow-hidden bg-[#F7F9FC]" aria-hidden="true">
                    <div className="absolute inset-x-0 top-0 h-[245px] bg-[radial-gradient(circle_at_18%_18%,rgba(219,234,254,0.92),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(254,243,199,0.74),transparent_30%),radial-gradient(circle_at_58%_64%,rgba(220,252,231,0.64),transparent_34%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_62%,#F7F9FC_100%)]" />
                </div>
            );
        }

        if (currentView === 'me') {
            return (
                <div className="relative h-full w-full overflow-hidden bg-[#F4FCFF]" aria-hidden="true">
                    <div className="pointer-events-none absolute -left-24 -right-28 top-0 h-[420px] opacity-75 blur-[30px]">
                        <img
                            src={ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG}
                            alt=""
                            className="h-full w-full scale-125 object-cover object-right-top"
                        />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-[190px] h-[360px] opacity-60">
                        <img
                            src={ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG}
                            alt=""
                            className="h-full w-full scale-150 object-cover object-right-bottom blur-2xl"
                        />
                    </div>
                </div>
            );
        }

        return undefined;
    };

    // Local Header component to replace the imported one's styling for specific views
    const LocalHeader = ({ title, onBack }: { title: string; onBack?: () => void }) => (
        <div className={`h-11 flex items-center justify-between px-4 sticky top-0 z-[45] backdrop-blur-md ${hasScreenLevelBackground ? 'bg-white/38 border-b border-white/40' : 'bg-white/80 border-b border-slate-100/30'}`}>
            {onBack && (
                <button onClick={onBack} className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100">
                    <ChevronLeftLucide className="w-5 h-5" />
                </button>
            )}
            <h2 className={`text-[17px] font-bold text-slate-800 tracking-tight ${!onBack ? 'mx-auto' : ''}`}>{title}</h2>
            {onBack && <div className="w-10" aria-hidden="true"></div>}
        </div>
    );

    return (
        <div className="w-screen h-[100dvh] bg-[#f1f5f9] flex items-center justify-center p-4">
            <PhoneMockup
                showDeviceFrame={showPhoneShell}
                contentTopInsetMode="status-bar"
                screenBackground={getPhoneScreenBackground()}
            >

                    <div className={`flex-1 flex flex-col relative overflow-hidden ${hasScreenLevelBackground ? 'bg-transparent' : 'bg-white'}`}>
                        {/* Only show LocalHeader for views that need it and are not handled by PhoneMockup's internal header */}
                        {currentView !== 'record_input' && currentView !== 'home_log' && currentView !== 'class_list' && currentView !== 'class_detail' && currentView !== 'student_detail' && currentView !== 'student_basic_edit' && currentView !== 'student_coin_detail' && currentView !== 'report_detail' && currentView !== 'term_report' && currentView !== 'me' && currentView !== 'my_files' && currentView !== 'teacher_profile_edit' && currentView !== 'leader_report' && currentView !== 'face_update' && currentView !== 'bank_password' && (
                            <LocalHeader
                                title={getHeaderTitle()}
                                onBack={history.length > 0 ? goBack : undefined}
                            />
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
                            className={`flex-1 relative animate-page-enter ${showTabBar && !viewHandlesScroll ? 'has-floating-tabbar' : ''} ${isOverlayActive ? 'z-[100]' : 'z-auto'} ${viewHandlesScroll ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar'}`}
                        >
                            {currentView === 'home_log' && (
                                <ClassRecordLogView
                                    activeTab={activeLogTab}
                                    onTabChange={setActiveLogTab}
                                    onBack={goBack}
                                    isMainView={true}
                                    onStartRecord={() => handleStartRecord([], 'voice')}
                                    newRecordData={pendingRecordData}
                                    onClearNewRecord={() => setPendingRecordData(null)}
                                    onToggleModal={setIsOverlayActive}
                                    addDemoTopBreathingSpace={!showPhoneShell}
                                />
                            )}

                            {currentView === 'class_list' && (
                                <ClassListView
                                    classes={MOCK_CLASSES}
                                    teacherProfile={teacherProfile}
                                    onSelectClass={handleSelectClass}
                                    onViewClassReport={handleViewClassReport}
                                    onViewLeaderboard={handleViewLeaderboard}
                                    onViewRewardVerification={handleViewRewardVerification}
                                    onViewFaceUpdate={handleViewFaceUpdate}
                                    onViewBankPassword={handleViewBankPassword}
                                    onViewHomeworkEntry={handleViewHomeworkEntry}
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
                                    onBack={goBack}
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

                            {currentView === 'leader_report' && (
                                <LeaderReportView
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

                            {currentView === 'bank_password' && (
                                <BankPasswordView
                                    classId={selectedClassId}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'homework_entry' && selectedClassId && (
                                <HomeworkEntryView
                                    classInfo={MOCK_CLASSES.find(c => c.id === selectedClassId)!}
                                    students={GET_MOCK_STUDENTS_FOR_CLASS(selectedClassId)}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'student_detail' && (
                                <DashboardView
                                    student={activeStudent}
                                    scores={MOCK_SCORES}
                                    growthReports={MOCK_GROWTH_REPORTS}
                                    onViewTermReport={handleViewTermReport}
                                    onBack={goBack}
                                    onEditBasicInfo={() => navigateTo('student_basic_edit')}
                                    onViewCampusCoins={() => navigateTo('student_coin_detail')}
                                    campusCoinDetail={activeCampusCoinDetail}
                                />
                            )}

                            {currentView === 'student_basic_edit' && (
                                <StudentBasicEditView
                                    student={activeStudent}
                                    classes={MOCK_CLASSES}
                                    onBack={goBack}
                                    onSave={handleSaveStudentBasicInfo}
                                />
                            )}

                            {currentView === 'student_coin_detail' && (
                                <StudentCoinDetailView
                                    student={activeStudent}
                                    coinDetail={activeCampusCoinDetail}
                                    onBack={goBack}
                                />
                            )}


                            {currentView === 'term_report' && (
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    <TermReportView
                                        student={activeStudent}
                                        onBack={goBack}
                                    />
                                </div>
                            )}

                            {currentView === 'me' && (
                                <MeView
                                    teacherProfile={teacherProfile}
                                    onNavigateToFiles={() => navigateTo('my_files')}
                                    onEditTeacherProfile={() => navigateTo('teacher_profile_edit')}
                                    onOpenGenerateModal={handleOpenSubjectGenModal}
                                    onOpenTermGenerateModal={handleOpenTermGenModal}
                                    onViewLeaderReport={handleViewLeaderReport}
                                />
                            )}

                            {currentView === 'teacher_profile_edit' && (
                                <TeacherProfileEditView
                                    profile={teacherProfile}
                                    classes={MOCK_CLASSES}
                                    subjects={TEACHER_PROFILE_SUBJECTS}
                                    departments={TEACHER_PROFILE_DEPARTMENTS}
                                    onBack={goBack}
                                    onSave={(nextProfile) => {
                                        setTeacherProfile(nextProfile);
                                        goBack();
                                    }}
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
                                    initialMode={recordMode}
                                    onClose={goBack}
                                    onAnalysisComplete={handleAnalysisComplete}
                                />
                            </div>
                        )}

                        {/* Keyboard Overlay */}
                        {showKeyboard && (
                            <>
                                <div className="absolute inset-0 z-[55] bg-black/5" onClick={() => setShowKeyboard(false)}></div>
                                <VirtualKeyboard
                                    onClose={() => setShowKeyboard(false)}
                                    onKeyPress={(key) => setInputText(prev => prev + (key === 'space' ? ' ' : key))}
                                    onDelete={() => setInputText(prev => prev.slice(0, -1))}
                                    onSubmit={() => handleAnalysisComplete({ type: 'text', text: inputText, mockStudents: isMultiSelectMode ? Array.from(multiSelectIds) : [] })}
                                />
                            </>
                        )}

                        {/* AI Tech Tab Bar */}
                        {showTabBar && (
                            <div 
                                ref={tabbarRef}
                                className="ai-tabbar-container"
                            >
                                {/* 3D 物理液态玻璃渲染背景层 */}
                                <TeacherFluidGlassNav activeIndex={activeIndex} itemCount={3} jellyToggle={jellyToggle} tabbarWidth={tabbarWidth} />

                                {/* 顶层 HTML 按钮交互与极清字显层 (文字完全脱离 3D WebGL 折射以 100% 保障清晰度与 0 重影) */}
                                {/* Tab 0: 记录 (ActivityIcon) */}
                                <button
                                    onClick={() => switchTab('home_log')}
                                    className="tabbar-item-btn"
                                >
                                    <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 ${activeIndex === 0 ? 'text-indigo-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'}`}>
                                        <div className="tabbar-icon-wrap">
                                            <ActivityIcon className="w-5 h-5" fill="currentColor" />
                                        </div>
                                        <span className="tabbar-item-label">记录</span>
                                    </div>
                                </button>

                                {/* Tab 1: 班级 (HomeIcon) */}
                                <button
                                    onClick={() => switchTab('class_list')}
                                    className="tabbar-item-btn"
                                >
                                    <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 ${activeIndex === 1 ? 'text-indigo-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'}`}>
                                        <div className="tabbar-icon-wrap">
                                            <HomeIcon className="w-5 h-5" fill="currentColor" />
                                        </div>
                                        <span className="tabbar-item-label">班级</span>
                                    </div>
                                </button>

                                {/* Tab 2: 我的 (UserIcon) */}
                                <button
                                    onClick={() => switchTab('me')}
                                    className="tabbar-item-btn"
                                >
                                    <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 ${activeIndex === 2 ? 'text-indigo-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'}`}>
                                        <div className="tabbar-icon-wrap">
                                            <UserIcon className="w-5 h-5" fill="currentColor" />
                                        </div>
                                        <span className="tabbar-item-label">我的</span>
                                    </div>
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
                                                '确认生成期末报告?'}
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
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-lg z-20 py-1 animate-in slide-in-from-top-2 duration-100 overflow-hidden">
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
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-lg z-20 py-1 animate-in slide-in-from-top-2 duration-100 overflow-hidden">
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
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-xl shadow-lg z-20 py-1 animate-in slide-in-from-top-2 duration-100 overflow-hidden">
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
                                            立即生成
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
                                        AI 生成中...
                                    </h3>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                        数据量较大，稍后可以在<br />
                                        <span className="text-white font-medium">学生详情页</span> 进行查看
                                    </p>
                                    <button
                                        onClick={() => setShowSuccessToast(false)}
                                        className="w-full py-2.5 rounded-xl bg-white/10 /20 border border-white/10 text-sm font-bold text-white transition-all active:scale-95 relative z-10"
                                    >
                                        知道了
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
            </PhoneMockup>
        </div>
    );
};

export default App;
