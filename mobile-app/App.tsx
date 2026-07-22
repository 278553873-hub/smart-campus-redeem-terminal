import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ClassListView from './views/ClassListView';
import ClassDetailView from './views/ClassDetailView';
import RecordInputView from './views/RecordInputView';
import ClassReportView from './views/ClassReportView';
import ClassRecordLogView from './views/ClassRecordLogView';
import MeView, { ClassSourceSheet, type TeacherSpaceOption } from './views/MeView';
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
import StudentCollectionRecordDetailView from './views/student-collection/StudentCollectionRecordDetailView';
import AiHeadteacherAssistantView from './views/AiHeadteacherAssistantView';
import WeeklyActionAdviceView from './views/WeeklyActionAdviceView';
import WeeklyActionAdviceHistoryView from './views/WeeklyActionAdviceHistoryView';
import TeacherEvaluationReviewView from './views/TeacherEvaluationReviewView';
import TeacherEvaluationReviewHistoryView from './views/TeacherEvaluationReviewHistoryView';
import AiPrincipalAssistantView from './views/AiPrincipalAssistantView';
import PrincipalPeriodicReportView from './views/PrincipalPeriodicReportView';
import PrincipalReportHistoryView from './views/PrincipalReportHistoryView';
import PrincipalTermReportView from './views/PrincipalTermReportView';
import QuestionnaireManagementView from './views/questionnaire/QuestionnaireManagementView';
import ArchiveDesignView from './views/archive-design/ArchiveDesignView';
import StudentArchiveView from './views/archive-design/StudentArchiveView';
import {
    CoinIssuanceView,
    DeleteConfirmSheet,
    DepartmentManagementView,
    MineSettingsView,
    SubjectManagementView,
    SuggestionFeedbackView,
    TextEditSheet,
    type CoinIssuanceConfig,
    type SchoolDepartmentItem,
    type SchoolSubjectItem,
} from './views/MeFeatureViews';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import TeacherMobileScreenBackground from './components/TeacherMobileScreenBackground';
import { teacherBrandCssVariables } from './styles/teacherMobileTokens';
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
import {
    QUESTIONNAIRE_STORE_EVENT,
    getCompletedStudentCollectionHistory,
    getPendingAssignedStudentCollections,
    readQuestionnaires,
    type StudentCollectionHistoryItem,
} from '../shared/questionnaireStore';
import {
    CURRENT_WEEKLY_ACTION_ADVICE,
    WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS,
} from './data/weeklyActionAdvice';
import {
    CURRENT_TEACHER_EVALUATION_REVIEW,
    TEACHER_EVALUATION_REVIEW_CURRENT_BY_CLASS,
} from './data/teacherEvaluationReview';
import { CURRENT_PRINCIPAL_TERM } from './data/principalTermReport';
import { canTeacherSpaceRecordClass } from './domain/teacherSpaceAccess';

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

const CLASS_RECORD_ENABLED_SPACE_IDS = new Set(['school-qizhong', 'school-star']);
const TEACHER_SPACE_OPTIONS: TeacherSpaceOption[] = [
    { id: 'personal', title: '我创建的班级', type: 'personal', role: 'owner' },
    { id: 'collab-li', title: '李明老师的班级', type: 'collaboration', role: 'collaborator' },
    { id: 'school-qizhong', title: '成都七中初中附属小学', type: 'school', role: 'homeroomTeacher' },
    { id: 'school-star', title: '星河实验小学', type: 'school', role: 'leader' },
    { id: 'school-qinghe', title: '青禾实验小学', type: 'school', role: 'teacher' },
].map(space => ({
    ...space,
    classRecordEnabled: CLASS_RECORD_ENABLED_SPACE_IDS.has(space.id),
}));
const DEFAULT_TEACHER_SPACE_ID = 'school-star';
const DEFAULT_WEEKLY_ADVICE_CLASS_ID = 'c_2025_4';
const CLASS_MEMBERSHIP_BY_SPACE: Record<string, Record<string, 'created' | 'joined'>> = {
    personal: {
        c_2025_1: 'created',
    },
    'collab-li': {
        c_2025_2: 'joined',
    },
};

const INITIAL_SCHOOL_SUBJECTS: SchoolSubjectItem[] = [
    { id: 'subject-cn', name: '语文' },
    { id: 'subject-math', name: '数学' },
    { id: 'subject-en', name: '英语' },
    { id: 'subject-pe', name: '体育' },
    { id: 'subject-calligraphy', name: '书法' },
];

const INITIAL_SCHOOL_DEPARTMENTS: SchoolDepartmentItem[] = [
    { id: 'department-student-development', name: '学发中心' },
    { id: 'department-moral', name: '德育处' },
    { id: 'department-academic', name: '教务处' },
    { id: 'department-art', name: '艺体组' },
];

const DEFAULT_COIN_ISSUANCE_CONFIG: CoinIssuanceConfig = {
    enabled: false,
    period: 'weekly',
    classBudget: 500,
    sunshineRatio: 60,
};

const createTeachingAssignments = (classIds: string[], subject: string) => (
    classIds.map(classId => ({ classId, subject }))
);

const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
    name: '刘飞',
    avatar: ASSETS.AVATAR.TEACHER_LIU,
    schoolName: '星河实验小学',
    departmentId: 'student-development',
    departmentName: '学发中心',
    teachingAssignments: [
        ...createTeachingAssignments(['c_2025_1', 'c_2025_2', 'c_2025_3', 'c_2025_4', 'c_2025_5', 'c_2025_6', 'c_2025_7'], '体育'),
        ...createTeachingAssignments(['c_2024_1', 'c_2024_2', 'c_2024_3', 'c_2024_4', 'c_2024_5', 'c_2024_6', 'c_2024_7', 'c_2024_8', 'c_2024_9', 'c_2024_10'], '体育'),
    ],
    homeroomClassIds: ['c_2025_4', 'c_2025_1', 'c_2024_2', 'c_2025_7'],
    gradeLeaderGrades: ['2025级'],
};

const INITIAL_TEACHER_PROFILES_BY_SPACE: Record<string, TeacherProfile> = {
    personal: {
        ...DEFAULT_TEACHER_PROFILE,
        name: '大飞',
        avatar: ASSETS.AVATAR.TEACHER_DA_FEI,
        schoolName: '个人空间',
        departmentId: '',
        departmentName: '',
        teachingAssignments: createTeachingAssignments(['c_2025_1'], '语文'),
        homeroomClassIds: ['c_2025_1'],
        gradeLeaderGrades: [],
    },
    'collab-li': {
        ...DEFAULT_TEACHER_PROFILE,
        schoolName: '李明老师的班级',
        departmentId: '',
        departmentName: '',
        teachingAssignments: createTeachingAssignments(['c_2025_2'], '体育'),
        homeroomClassIds: [],
        gradeLeaderGrades: [],
    },
    'school-qizhong': {
        ...DEFAULT_TEACHER_PROFILE,
        schoolName: '成都七中初中附属小学',
        departmentId: 'physical-education',
        departmentName: '艺体组',
        teachingAssignments: createTeachingAssignments(['c_2025_4'], '体育'),
        homeroomClassIds: ['c_2025_4'],
        gradeLeaderGrades: [],
    },
    'school-star': DEFAULT_TEACHER_PROFILE,
    'school-qinghe': {
        ...DEFAULT_TEACHER_PROFILE,
        schoolName: '青禾实验小学',
        departmentId: 'physical-education',
        departmentName: '艺体组',
        teachingAssignments: createTeachingAssignments(['c_2025_3', 'c_2025_6'], '体育'),
        homeroomClassIds: [],
        gradeLeaderGrades: [],
    },
};

const describeGradeScope = (grade: string) => grade === DEFAULT_GRADE_SCOPE ? '全校学生' : `${grade}学生`;
const describeSubjectScope = (subject: string) => subject === DEFAULT_SUBJECT_SCOPE ? '全部学科' : `${subject}学科`;

// App View States (Removed 'record_result')
type ViewState = 'home_log' | 'class_list' | 'class_detail' | 'class_report' | 'student_detail' | 'student_archive' | 'student_collection_detail' | 'student_basic_edit' | 'student_coin_detail' | 'term_report' | 'record_input' | 'me' | 'my_files' | 'teacher_profile_edit' | 'mine_settings' | 'subject_management' | 'department_management' | 'coin_issuance' | 'suggestion_feedback' | 'questionnaire' | 'archive_design' | 'ai_headteacher_assistant' | 'weekly_action_advice' | 'weekly_action_history' | 'teacher_evaluation_review' | 'teacher_evaluation_review_history' | 'ai_principal_assistant' | 'principal_weekly_report' | 'principal_weekly_history' | 'principal_monthly_report' | 'principal_monthly_history' | 'principal_term_report' | 'principal_term_history' | 'class_leaderboard' | 'leader_report' | 'reward_verification' | 'face_update' | 'bank_password' | 'homework_entry';

interface MobileAppProps {
    showPhoneShell?: boolean;
}

const App: React.FC<MobileAppProps> = ({ showPhoneShell = true }) => {
    // Default view is now the Log (Stream)
    const [currentView, setCurrentView] = useState<ViewState>('home_log');
    const [history, setHistory] = useState<ViewState[]>([]);

    const getActiveTabIndex = (view: ViewState): number => {
        if (view === 'home_log' || view === 'record_input') return 0;
        if (view === 'class_list' || view === 'class_detail' || view === 'class_report' || view === 'student_detail' || view === 'student_archive' || view === 'student_collection_detail' || view === 'student_basic_edit' || view === 'student_coin_detail' || view === 'class_leaderboard' || view === 'leader_report' || view === 'reward_verification' || view === 'face_update' || view === 'bank_password' || view === 'homework_entry') return 1;
        if (view === 'me' || view === 'my_files' || view === 'teacher_profile_edit' || view === 'mine_settings' || view === 'subject_management' || view === 'department_management' || view === 'coin_issuance' || view === 'suggestion_feedback' || view === 'questionnaire' || view === 'archive_design' || view === 'ai_headteacher_assistant' || view === 'weekly_action_advice' || view === 'weekly_action_history' || view === 'teacher_evaluation_review' || view === 'teacher_evaluation_review_history' || view === 'ai_principal_assistant' || view === 'principal_weekly_report' || view === 'principal_weekly_history' || view === 'principal_monthly_report' || view === 'principal_monthly_history' || view === 'principal_term_report' || view === 'principal_term_history') return 2;
        return 0;
    };
    const activeIndex = getActiveTabIndex(currentView);

    // Selection States
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<Student>(MOCK_STUDENTS_CLASS_1[0]);
    const [studentDetailInitialTab, setStudentDetailInitialTab] = useState<'growth' | 'evaluation' | 'collection'>('growth');
    const [activeStudentCollectionRecord, setActiveStudentCollectionRecord] = useState<StudentCollectionHistoryItem | null>(null);
    const [studentOverrides, setStudentOverrides] = useState<Record<string, Student>>({});
    const activeStudent = studentOverrides[selectedStudent.id] ?? selectedStudent;
    const activeCampusCoinDetail = GET_MOCK_CAMPUS_COIN_DETAIL(activeStudent);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [batchStudentIds, setBatchStudentIds] = useState<string[]>([]);
    const [teacherProfilesBySpace, setTeacherProfilesBySpace] = useState<Record<string, TeacherProfile>>(INITIAL_TEACHER_PROFILES_BY_SPACE);
    const [weeklyAdviceClassId, setWeeklyAdviceClassId] = useState(DEFAULT_WEEKLY_ADVICE_CLASS_ID);
    const [principalWeeklyReportGenerated, setPrincipalWeeklyReportGenerated] = useState(false);
    const [principalMonthlyReportGenerated, setPrincipalMonthlyReportGenerated] = useState(false);
    const [principalTermReportGenerated, setPrincipalTermReportGenerated] = useState(false);
    const [currentTeacherSpaceId, setCurrentTeacherSpaceId] = useState(DEFAULT_TEACHER_SPACE_ID);
    const activeTeacherSpace = TEACHER_SPACE_OPTIONS.find(space => space.id === currentTeacherSpaceId) ?? TEACHER_SPACE_OPTIONS[0];
    const hasMultipleTeacherSpaces = TEACHER_SPACE_OPTIONS.length > 1;
    const canRecordClassForActiveSpace = canTeacherSpaceRecordClass(activeTeacherSpace);
    const teacherProfile = teacherProfilesBySpace[activeTeacherSpace.id] ?? DEFAULT_TEACHER_PROFILE;
    const activeClassMembershipById = CLASS_MEMBERSHIP_BY_SPACE[activeTeacherSpace.id] ?? {};
    const activeSpaceClasses = activeTeacherSpace.type === 'school'
        ? MOCK_CLASSES
        : MOCK_CLASSES.filter(classInfo => activeClassMembershipById[classInfo.id]);
    const activeTeacherId = `${activeTeacherSpace.id}:${teacherProfile.name}`;
    const [questionnaireEntryMode, setQuestionnaireEntryMode] = useState<'owned' | 'assigned'>('owned');
    const [pendingCollectionCount, setPendingCollectionCount] = useState(0);
    const [showTeacherSpaceSheet, setShowTeacherSpaceSheet] = useState(false);
    const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubjectItem[]>(INITIAL_SCHOOL_SUBJECTS);
    const [schoolDepartments, setSchoolDepartments] = useState<SchoolDepartmentItem[]>(INITIAL_SCHOOL_DEPARTMENTS);
    const [draggingSubjectId, setDraggingSubjectId] = useState<string | null>(null);
    const [activeNameEditor, setActiveNameEditor] = useState<'subject' | 'department' | null>(null);
    const [subjectDraftTarget, setSubjectDraftTarget] = useState<SchoolSubjectItem | null>(null);
    const [departmentDraftTarget, setDepartmentDraftTarget] = useState<SchoolDepartmentItem | null>(null);
    const [nameDraft, setNameDraft] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'subject' | 'department'; id: string; name: string } | null>(null);
    const [coinIssuanceConfig, setCoinIssuanceConfig] = useState<CoinIssuanceConfig>(DEFAULT_COIN_ISSUANCE_CONFIG);
    const [suggestionText, setSuggestionText] = useState('');
    const [suggestionImages, setSuggestionImages] = useState<string[]>([]);

    useEffect(() => {
        const refreshPendingCollections = () => {
            setPendingCollectionCount(getPendingAssignedStudentCollections(
                readQuestionnaires(),
                activeTeacherId,
                teacherProfile.name,
                activeTeacherSpace.id,
            ).length);
        };
        refreshPendingCollections();
        window.addEventListener(QUESTIONNAIRE_STORE_EVENT, refreshPendingCollections);
        window.addEventListener('storage', refreshPendingCollections);
        return () => {
            window.removeEventListener(QUESTIONNAIRE_STORE_EVENT, refreshPendingCollections);
            window.removeEventListener('storage', refreshPendingCollections);
        };
    }, [activeTeacherId, activeTeacherSpace.id, teacherProfile.name]);

    // Multi-Selection State for Class Detail
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [multiSelectIds, setMultiSelectIds] = useState<Set<string>>(new Set());

    const [activeLogTab, setActiveLogTab] = useState<'student' | 'class'>('student');
    const [recordContextToast, setRecordContextToast] = useState('');
    const [pendingRecordData, setPendingRecordData] = useState<any>(null);
    const [recordMode, setRecordMode] = useState<'voice' | 'camera' | 'text'>('voice');

    useEffect(() => {
        if (!recordContextToast) return;
        const timer = window.setTimeout(() => setRecordContextToast(''), 1800);
        return () => window.clearTimeout(timer);
    }, [recordContextToast]);

    const handleSelectTeacherSpace = (spaceId: string) => {
        const nextSpace = TEACHER_SPACE_OPTIONS.find(space => space.id === spaceId);
        if (!nextSpace) return;

        const shouldReturnToStudent = activeLogTab === 'class' && !canTeacherSpaceRecordClass(nextSpace);
        setCurrentTeacherSpaceId(spaceId);
        if (shouldReturnToStudent) {
            setActiveLogTab('student');
            if (currentView === 'home_log') {
                setRecordContextToast(`已切换至${nextSpace.title}，当前为记录学生`);
            }
        }
        setShowTeacherSpaceSheet(false);
    };

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
    const [successToastMessage, setSuccessToastMessage] = useState({
        title: 'AI 生成中...',
        body: '数据量较大，稍后可以在学生详情页进行查看',
    });
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
        setShowTeacherSpaceSheet(false);
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
        setShowTeacherSpaceSheet(false);
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
        setStudentDetailInitialTab('growth');
        navigateTo('student_detail');
    };

    const getMergedStudentsForClass = (classId: string) => (
        GET_MOCK_STUDENTS_FOR_CLASS(classId).map(student => studentOverrides[student.id] ?? student)
    );

    const handleSaveStudentBasicInfo = (student: Student) => {
        setStudentOverrides(prev => ({ ...prev, [student.id]: student }));
        setSelectedStudent(student);
        goBack();
    };

    const handleUpdateStudentFromArchive = (student: Student) => {
        setStudentOverrides(prev => ({ ...prev, [student.id]: student }));
        setSelectedStudent(student);
    };

    const handleRestoreStudentStatus = (student: Student) => {
        const nextStudent = { ...student, status: 'active' as const };
        setStudentOverrides(prev => ({ ...prev, [student.id]: nextStudent }));
        setSelectedStudent(prev => prev.id === student.id ? nextStudent : prev);
    };

    const handleUpdateStudentStatus = (student: Student, status: Student['status']) => {
        const nextStudent = { ...student, status };
        setStudentOverrides(prev => ({ ...prev, [student.id]: nextStudent }));
        setSelectedStudent(nextStudent);
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

    const handleInviteTeacher = (classId: string) => {
        const className = MOCK_CLASSES.find(c => c.id === classId)?.name || '当前班级';
        alert(`已生成${className}老师邀请链接`);
    };

    const handleInviteParent = (classId: string) => {
        const className = MOCK_CLASSES.find(c => c.id === classId)?.name || '当前班级';
        alert(`已生成${className}家长邀请链接`);
    };

    const handleCreateClass = () => {
        alert('创建班级流程演示中');
    };

    const handleJoinClass = () => {
        alert('加入班级流程演示中');
    };

    const handleEditClassInfo = (classId: string) => {
        const className = MOCK_CLASSES.find(c => c.id === classId)?.name || '当前班级';
        alert(`${className}班级信息编辑功能演示中`);
    };

    const openSubjectEditor = (item?: SchoolSubjectItem) => {
        setActiveNameEditor('subject');
        setSubjectDraftTarget(item ?? null);
        setNameDraft(item?.name ?? '');
    };

    const openDepartmentEditor = (item?: SchoolDepartmentItem) => {
        setActiveNameEditor('department');
        setDepartmentDraftTarget(item ?? null);
        setNameDraft(item?.name ?? '');
    };

    const closeNameEditor = () => {
        setActiveNameEditor(null);
        setSubjectDraftTarget(null);
        setDepartmentDraftTarget(null);
        setNameDraft('');
    };

    const saveNameEditor = () => {
        const nextName = nameDraft.trim();
        if (!nextName) return;

        if (activeNameEditor === 'subject') {
            setSchoolSubjects(prev => subjectDraftTarget
                ? prev.map(item => item.id === subjectDraftTarget.id ? { ...item, name: nextName } : item)
                : [...prev, { id: `subject-${Date.now()}`, name: nextName }]
            );
        }

        if (activeNameEditor === 'department') {
            setSchoolDepartments(prev => departmentDraftTarget
                ? prev.map(item => item.id === departmentDraftTarget.id ? { ...item, name: nextName } : item)
                : [...prev, { id: `department-${Date.now()}`, name: nextName }]
            );
        }

        closeNameEditor();
    };

    const moveSubjectItem = (dragId: string, targetId: string) => {
        if (dragId === targetId) return;
        setSchoolSubjects(prev => {
            const fromIndex = prev.findIndex(item => item.id === dragId);
            const toIndex = prev.findIndex(item => item.id === targetId);
            if (fromIndex < 0 || toIndex < 0) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const confirmDeleteMineFeatureItem = () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === 'subject') {
            setSchoolSubjects(prev => prev.filter(item => item.id !== deleteTarget.id));
        } else {
            setSchoolDepartments(prev => prev.filter(item => item.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
    };

    const addSuggestionImage = () => {
        setSuggestionImages(prev => prev.length >= 5 ? prev : [...prev, `图片${prev.length + 1}`]);
    };

    const submitSuggestion = () => {
        if (!suggestionText.trim()) return;
        setSuggestionText('');
        setSuggestionImages([]);
        setSuccessToastMessage({
            title: '反馈已提交',
            body: '运营端会收到这条建议反馈',
        });
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 1800);
        navigateTo('me');
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
        setPendingRecordData({
            ...result,
            requestId: typeof crypto?.randomUUID === 'function'
                ? crypto.randomUUID()
                : `record_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        });
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
        setSuccessToastMessage({
            title: 'AI 生成中...',
            body: '数据量较大，稍后可以在学生详情页进行查看',
        });
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
            case 'student_archive': return '学生成长档案';
            case 'student_collection_detail': return '采集详情';
            case 'student_basic_edit': return '基础信息编辑';
            case 'student_coin_detail': return '校园币详情';
            case 'report_detail': return `${selectedSubject}报告`;
            case 'term_report': return '';
            case 'me': return '';
            case 'my_files': return '我的文件';
            case 'teacher_profile_edit': return '编辑教师信息';
            case 'mine_settings': return '设置';
            case 'subject_management': return '科目管理';
            case 'department_management': return '部门管理';
            case 'coin_issuance': return '货币发放';
            case 'suggestion_feedback': return '建议反馈';
            case 'questionnaire': return '问卷采集';
            case 'archive_design': return '档案设计';
            case 'ai_headteacher_assistant': return 'AI班主任助理';
            case 'weekly_action_advice': return '本周行动建议';
            case 'weekly_action_history': return '往期建议';
            case 'teacher_evaluation_review': return '我的评价复盘';
            case 'teacher_evaluation_review_history': return '往期复盘';
            case 'ai_principal_assistant': return 'AI校长助理';
            case 'principal_weekly_report': return '本周管理建议';
            case 'principal_weekly_history': return '往期管理建议';
            case 'principal_monthly_report': return '上月学校复盘';
            case 'principal_monthly_history': return '往期学校复盘';
            case 'principal_term_report': return '学期学校报告';
            case 'principal_term_history': return '往期学期报告';
            case 'class_leaderboard': return '排行榜';
            case 'leader_report': return '学校数据报表';
            case 'reward_verification': return '班级奖励兑换';
            case 'face_update': return '更新人脸数据';
            case 'bank_password': return '设置兑换密码';
            case 'homework_entry': return MOCK_CLASSES.find(c => c.id === selectedClassId)?.name || '作业录入';
            default: return '';
        }
    };

    const homeroomClasses = MOCK_CLASSES.filter(classInfo => teacherProfile.homeroomClassIds.includes(classInfo.id));
    const activeWeeklyAdvice = WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS[weeklyAdviceClassId] ?? CURRENT_WEEKLY_ACTION_ADVICE;
    const activeEvaluationReview = TEACHER_EVALUATION_REVIEW_CURRENT_BY_CLASS[weeklyAdviceClassId]
        ?? CURRENT_TEACHER_EVALUATION_REVIEW;

    const getActiveStudentNames = () => {
        return MOCK_STUDENTS_CLASS_1
            .filter(s => batchStudentIds.includes(s.id))
            .map(s => s.name)
            .join('、');
    };

    // Shared record input: a quiet white action surface above the bottom navigation.
    const GlobalInputBar = () => {
        const targetIds: string[] = isMultiSelectMode ? Array.from(multiSelectIds) : [];

        if (showKeyboard) {
            return (
                <div className="pointer-events-none absolute bottom-[292px] left-0 right-0 z-[85] mx-auto max-w-md px-4">
                    <div className="pointer-events-auto mx-auto grid h-16 max-w-[350px] grid-cols-[minmax(0,1fr)_48px] items-center gap-1 rounded-[var(--tm-radius-card)] bg-white px-2.5 [box-shadow:var(--tm-shadow-floating)]">
                        <div
                            role="textbox"
                            aria-label="记录内容"
                            aria-readonly="true"
                            className={`min-w-0 truncate px-3 text-[15px] font-medium ${inputText ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-disabled)]'}`}
                        >
                            {inputText || '输入记录内容'}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowKeyboard(false)}
                            aria-label="切换到语音记录"
                            className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-inner)] text-[var(--tm-text-primary)] transition active:scale-95 active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)]"
                        >
                            <VolumeIcon className="h-[22px] w-[22px]" />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className={`pointer-events-none absolute ${showTabBar ? 'bottom-[82px]' : 'bottom-4'} left-0 right-0 z-[60] mx-auto max-w-md px-4 transition-all duration-300`}>
                <div className="pointer-events-auto mx-auto grid h-16 max-w-[350px] grid-cols-[48px_minmax(0,1fr)_48px] items-center rounded-[var(--tm-radius-card)] bg-white px-2.5 [box-shadow:var(--tm-shadow-floating)]">
                    <button
                        onClick={() => handleStartRecord(targetIds, 'camera')}
                        aria-label="拍照记录"
                        className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-inner)] text-[var(--tm-text-primary)] transition active:scale-95 active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)]"
                    >
                        <CameraIcon className="h-[22px] w-[22px]" />
                    </button>

                    <button
                        onClick={() => handleStartRecord(targetIds, 'voice')}
                        aria-label="语音记录"
                        className="flex h-11 min-w-0 items-center justify-center rounded-[var(--tm-radius-inner)] px-4 text-[15px] font-semibold text-[var(--tm-text-primary)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        <span>按住说话</span>
                    </button>

                    <button
                        onClick={() => setShowKeyboard(true)}
                        aria-label={isMultiSelectMode ? `已选${multiSelectIds.size}人，文字记录` : '文字记录'}
                        className="relative flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-inner)] text-[var(--tm-text-primary)] transition active:scale-95 active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)]"
                    >
                        <KeyboardIcon className="h-[22px] w-[22px]" />
                    </button>
                </div>
            </div>
        );
    };

    const showInputBar = ['home_log', 'class_detail'].includes(currentView);
    const showTabBar = ['home_log', 'class_list', 'me'].includes(currentView);
    const primaryTabViewKey = showTabBar ? 'teacher-primary-tabs' : currentView;
    const pageTransitionClass = showTabBar ? '' : 'animate-page-enter';
    const viewHandlesScroll = ['home_log', 'class_list', 'class_detail', 'student_detail', 'student_archive', 'student_collection_detail', 'student_basic_edit', 'student_coin_detail', 'report_detail', 'questionnaire', 'archive_design'].includes(currentView);
    const hasScreenLevelBackground = ['home_log', 'class_list', 'class_detail', 'class_report', 'student_detail', 'student_archive', 'me', 'mine_settings', 'subject_management', 'department_management', 'coin_issuance', 'suggestion_feedback', 'questionnaire', 'archive_design'].includes(currentView);
    const getBottomNavTone = (index: number) => activeIndex === index
        ? 'text-[var(--tm-brand-primary)]'
        : 'text-[var(--tm-nav-item-default)]';

    const getPhoneScreenBackground = () => {
        if (currentView === 'home_log') {
            return <TeacherMobileScreenBackground variant="record" recordMode={activeLogTab} />;
        }

        if (['class_list', 'class_detail', 'class_report', 'student_detail', 'student_archive', 'me', 'mine_settings', 'subject_management', 'department_management', 'coin_issuance', 'suggestion_feedback', 'questionnaire', 'archive_design'].includes(currentView)) {
            return <TeacherMobileScreenBackground />;
        }

        return undefined;
    };

    // Local Header component to replace the imported one's styling for specific views
    const LocalHeader = ({ title, onBack }: { title: string; onBack?: () => void }) => (
        <div className={`h-11 flex items-center justify-between px-4 sticky top-0 z-[45] backdrop-blur-md ${hasScreenLevelBackground ? 'bg-white/38' : 'bg-[var(--tm-bg-page-glass)]'}`}>
            {onBack && (
                <button onClick={onBack} className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
                    <ChevronLeftLucide className="w-5 h-5" />
                </button>
            )}
            <h2 className={`text-[17px] font-bold text-[var(--tm-text-primary)] tracking-tight ${!onBack ? 'mx-auto' : ''}`}>{title}</h2>
            {onBack && <div className="w-10" aria-hidden="true"></div>}
        </div>
    );

    return (
        <div
            className="flex h-[100dvh] w-screen items-center justify-center bg-[var(--tm-bg-page)] p-4"
            style={teacherBrandCssVariables as React.CSSProperties}
        >
            <PhoneMockup
                showDeviceFrame={showPhoneShell}
                contentTopInsetMode="status-bar"
                screenBackground={getPhoneScreenBackground()}
            >

                    <div className={`flex-1 flex flex-col relative overflow-hidden ${hasScreenLevelBackground ? 'bg-transparent' : 'bg-white'}`}>
                        {/* Only show LocalHeader for views that need it and are not handled by PhoneMockup's internal header */}
                        {currentView !== 'record_input' && currentView !== 'home_log' && currentView !== 'class_list' && currentView !== 'class_detail' && currentView !== 'student_detail' && currentView !== 'student_archive' && currentView !== 'student_collection_detail' && currentView !== 'student_basic_edit' && currentView !== 'student_coin_detail' && currentView !== 'report_detail' && currentView !== 'term_report' && currentView !== 'me' && currentView !== 'my_files' && currentView !== 'teacher_profile_edit' && currentView !== 'leader_report' && currentView !== 'face_update' && currentView !== 'bank_password' && currentView !== 'questionnaire' && currentView !== 'archive_design' && currentView !== 'ai_headteacher_assistant' && currentView !== 'weekly_action_advice' && currentView !== 'weekly_action_history' && currentView !== 'teacher_evaluation_review' && currentView !== 'teacher_evaluation_review_history' && currentView !== 'ai_principal_assistant' && currentView !== 'principal_weekly_report' && currentView !== 'principal_weekly_history' && currentView !== 'principal_monthly_report' && currentView !== 'principal_monthly_history' && currentView !== 'principal_term_report' && currentView !== 'principal_term_history' && (
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
                            key={primaryTabViewKey}
                            id="main-scroll-container"
                            className={`min-h-0 flex-1 relative ${pageTransitionClass} ${showTabBar && !viewHandlesScroll ? 'has-floating-tabbar' : ''} ${isOverlayActive ? 'z-[100]' : 'z-auto'} ${viewHandlesScroll ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar'}`}
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
                                    classSourceName={activeTeacherSpace.title}
                                    classSourceType={activeTeacherSpace.type}
                                    showClassSourceSwitcher={hasMultipleTeacherSpaces}
                                    canRecordClass={canRecordClassForActiveSpace}
                                    onOpenClassSourceSwitcher={() => setShowTeacherSpaceSheet(true)}
                                />
                            )}

                            {currentView === 'class_list' && (
                                <ClassListView
                                    classes={activeSpaceClasses}
                                    teacherProfile={teacherProfile}
                                    currentSpace={activeTeacherSpace}
                                    classMembershipById={activeClassMembershipById}
                                    addDemoTopBreathingSpace={!showPhoneShell}
                                    showClassSourceSwitcher={hasMultipleTeacherSpaces}
                                    isSpaceSheetOpen={showTeacherSpaceSheet}
                                    onOpenClassSourceSwitcher={() => setShowTeacherSpaceSheet(true)}
                                    onCreateClass={handleCreateClass}
                                    onJoinClass={handleJoinClass}
                                    onSelectClass={handleSelectClass}
                                    getStudentsForClass={getMergedStudentsForClass}
                                    onRestoreStudentStatus={handleRestoreStudentStatus}
                                    onViewClassReport={handleViewClassReport}
                                    onViewLeaderboard={handleViewLeaderboard}
                                    onViewRewardVerification={handleViewRewardVerification}
                                    onViewFaceUpdate={handleViewFaceUpdate}
                                    onViewBankPassword={handleViewBankPassword}
                                    onViewHomeworkEntry={handleViewHomeworkEntry}
                                    onInviteTeacher={handleInviteTeacher}
                                    onInviteParent={handleInviteParent}
                                    onEditClassInfo={handleEditClassInfo}
                                />
                            )}

                            {currentView === 'class_detail' && (
                                <ClassDetailView
                                    classInfo={MOCK_CLASSES.find(c => c.id === selectedClassId)!}
                                    students={getMergedStudentsForClass(selectedClassId)}
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
                                    students={getMergedStudentsForClass(selectedClassId).filter(student => (student.status ?? 'active') === 'active')}
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
                                    students={getMergedStudentsForClass(selectedClassId).filter(student => (student.status ?? 'active') === 'active')}
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
                                    onUpdateStudentStatus={handleUpdateStudentStatus}
                                    onViewCampusCoins={() => navigateTo('student_coin_detail')}
                                    campusCoinDetail={activeCampusCoinDetail}
                                    initialTab={studentDetailInitialTab}
                                    collectionHistory={getCompletedStudentCollectionHistory(
                                        readQuestionnaires(),
                                        activeStudent.studentNo ?? activeStudent.id,
                                        activeTeacherId,
                                        teacherProfile.name,
                                        activeTeacherSpace.id,
                                    )}
                                    onViewCollectionRecord={(item) => {
                                        setActiveStudentCollectionRecord(item);
                                        setStudentDetailInitialTab('collection');
                                        navigateTo('student_collection_detail');
                                    }}
                                    onOpenStudentArchive={() => navigateTo('student_archive')}
                                />
                            )}

                            {currentView === 'student_archive' && (
                                <StudentArchiveView
                                    onBack={goBack}
                                    student={activeStudent}
                                    classInfo={MOCK_CLASSES.find(item => item.id === selectedClassId) ?? MOCK_CLASSES.find(item => item.name === activeStudent.class) ?? MOCK_CLASSES[0]}
                                    teacherProfile={teacherProfile}
                                    spaceId={activeTeacherSpace.id}
                                    classes={activeSpaceClasses}
                                    getStudentsForClass={getMergedStudentsForClass}
                                    onUpdateStudent={handleUpdateStudentFromArchive}
                                />
                            )}

                            {currentView === 'student_collection_detail' && activeStudentCollectionRecord && (
                                <StudentCollectionRecordDetailView item={activeStudentCollectionRecord} onBack={goBack} />
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
                                    currentSpace={activeTeacherSpace}
                                    isSpaceSheetOpen={showTeacherSpaceSheet}
                                    onNavigateToFiles={() => navigateTo('my_files')}
                                    onEditTeacherProfile={() => navigateTo('teacher_profile_edit')}
                                    onOpenTermGenerateModal={handleOpenTermGenModal}
                                    onViewLeaderReport={handleViewLeaderReport}
                                    onOpenSettings={() => navigateTo('mine_settings')}
                                    onOpenSubjectManagement={() => navigateTo('subject_management')}
                                    onOpenDepartmentManagement={() => navigateTo('department_management')}
                                    onOpenCoinIssuance={() => navigateTo('coin_issuance')}
                                    onOpenSuggestionFeedback={() => navigateTo('suggestion_feedback')}
                                    onOpenQuestionnaire={() => { setQuestionnaireEntryMode('owned'); navigateTo('questionnaire'); }}
                                    pendingCollectionCount={pendingCollectionCount}
                                    onOpenAssignedCollections={() => { setQuestionnaireEntryMode('assigned'); navigateTo('questionnaire'); }}
                                    onOpenArchiveDesign={() => navigateTo('archive_design')}
                                    onOpenAiHeadteacherAssistant={() => navigateTo('ai_headteacher_assistant')}
                                    onOpenAiPrincipalAssistant={() => navigateTo('ai_principal_assistant')}
                                    onToggleSpaceSheet={() => setShowTeacherSpaceSheet(prev => !prev)}
                                />
                            )}

                            {currentView === 'teacher_profile_edit' && (
                                <TeacherProfileEditView
                                    profile={teacherProfile}
                                    classes={MOCK_CLASSES}
                                    subjects={TEACHER_PROFILE_SUBJECTS}
                                    departments={TEACHER_PROFILE_DEPARTMENTS}
                                    currentSpace={activeTeacherSpace}
                                    onBack={goBack}
                                    onChange={(nextProfile) => {
                                        setTeacherProfilesBySpace(prev => ({
                                            ...prev,
                                            [activeTeacherSpace.id]: nextProfile,
                                        }));
                                    }}
                                />
                            )}

                            {currentView === 'my_files' && (
                                <MyFilesView onBack={goBack} />
                            )}

                            {currentView === 'mine_settings' && (
                                <MineSettingsView onLogout={() => alert('退出登录功能演示中')} />
                            )}

                            {currentView === 'subject_management' && (
                                <SubjectManagementView
                                    subjects={schoolSubjects}
                                    draggingSubjectId={draggingSubjectId}
                                    onAdd={() => openSubjectEditor()}
                                    onEdit={openSubjectEditor}
                                    onDelete={(item) => setDeleteTarget({ type: 'subject', id: item.id, name: item.name })}
                                    onDragStart={setDraggingSubjectId}
                                    onDragOver={(targetId) => draggingSubjectId && moveSubjectItem(draggingSubjectId, targetId)}
                                    onDragEnd={() => setDraggingSubjectId(null)}
                                />
                            )}

                            {currentView === 'department_management' && (
                                <DepartmentManagementView
                                    departments={schoolDepartments}
                                    onAdd={() => openDepartmentEditor()}
                                    onEdit={openDepartmentEditor}
                                    onDelete={(item) => setDeleteTarget({ type: 'department', id: item.id, name: item.name })}
                                />
                            )}

                            {currentView === 'coin_issuance' && (
                                <CoinIssuanceView
                                    config={coinIssuanceConfig}
                                    onChange={setCoinIssuanceConfig}
                                    onSave={() => {
                                        setSuccessToastMessage({
                                            title: '配置已保存',
                                            body: '货币发放规则已在当前演示会话中更新',
                                        });
                                        setShowSuccessToast(true);
                                        setTimeout(() => setShowSuccessToast(false), 1800);
                                    }}
                                />
                            )}

                            {currentView === 'suggestion_feedback' && (
                                <SuggestionFeedbackView
                                    text={suggestionText}
                                    images={suggestionImages}
                                    onTextChange={setSuggestionText}
                                    onAddImage={addSuggestionImage}
                                    onRemoveImage={(index) => setSuggestionImages(prev => prev.filter((_, imageIndex) => imageIndex !== index))}
                                    onSubmit={submitSuggestion}
                                />
                            )}

                            {currentView === 'questionnaire' && (
                                <QuestionnaireManagementView
                                    key={`${activeTeacherId}-${questionnaireEntryMode}`}
                                    onBack={goBack}
                                    teacherId={activeTeacherId}
                                    teacherName={teacherProfile.name}
                                    spaceId={activeTeacherSpace.id}
                                    homeroomClassIds={teacherProfile.homeroomClassIds}
                                    initialMode={questionnaireEntryMode}
                                    classes={MOCK_CLASSES.filter(classInfo => (
                                        teacherProfile.homeroomClassIds.includes(classInfo.id)
                                        || teacherProfile.teachingAssignments.some(item => item.classId === classInfo.id)
                                    ))}
                                    getStudentsForClass={getMergedStudentsForClass}
                                />
                            )}

                            {currentView === 'archive_design' && (
                                <ArchiveDesignView
                                    onBack={goBack}
                                    teacherProfile={teacherProfile}
                                    spaceId={activeTeacherSpace.id}
                                    classes={MOCK_CLASSES.filter(classInfo => (
                                        teacherProfile.homeroomClassIds.includes(classInfo.id)
                                        || teacherProfile.teachingAssignments.some(item => item.classId === classInfo.id)
                                    ))}
                                    getStudentsForClass={getMergedStudentsForClass}
                                />
                            )}

                            {currentView === 'ai_headteacher_assistant' && (
                                <AiHeadteacherAssistantView
                                    onBack={goBack}
                                    homeroomClasses={homeroomClasses}
                                    activeClassId={weeklyAdviceClassId}
                                    onOpenWeeklyActionAdvice={(classId) => {
                                        setWeeklyAdviceClassId(classId);
                                        navigateTo('weekly_action_advice');
                                    }}
                                    onOpenEvaluationReview={(classId) => {
                                        setWeeklyAdviceClassId(classId);
                                        navigateTo('teacher_evaluation_review');
                                    }}
                                />
                            )}

                            {currentView === 'weekly_action_advice' && (
                                <WeeklyActionAdviceView
                                    data={activeWeeklyAdvice}
                                    onBack={goBack}
                                    onOpenHistory={() => navigateTo('weekly_action_history')}
                                />
                            )}

                            {currentView === 'weekly_action_history' && (
                                <WeeklyActionAdviceHistoryView
                                    onBack={goBack}
                                    classes={homeroomClasses}
                                    initialClassId={weeklyAdviceClassId}
                                />
                            )}

                            {currentView === 'teacher_evaluation_review' && (
                                <TeacherEvaluationReviewView
                                    data={activeEvaluationReview}
                                    onBack={goBack}
                                    onOpenHistory={() => navigateTo('teacher_evaluation_review_history')}
                                />
                            )}

                            {currentView === 'teacher_evaluation_review_history' && (
                                <TeacherEvaluationReviewHistoryView
                                    onBack={goBack}
                                    classes={homeroomClasses}
                                    initialClassId={weeklyAdviceClassId}
                                />
                            )}

                            {currentView === 'ai_principal_assistant' && (
                                <AiPrincipalAssistantView
                                    onBack={goBack}
                                    termConfig={CURRENT_PRINCIPAL_TERM}
                                    hasGeneratedTermReport={principalTermReportGenerated}
                                    onOpenWeeklyReport={() => navigateTo('principal_weekly_report')}
                                    onOpenMonthlyReport={() => navigateTo('principal_monthly_report')}
                                    onOpenTermReport={() => navigateTo('principal_term_report')}
                                />
                            )}

                            {currentView === 'principal_weekly_report' && (
                                <PrincipalPeriodicReportView
                                    kind="weekly"
                                    schoolName={teacherProfile.schoolName}
                                    generated={principalWeeklyReportGenerated}
                                    onGenerated={() => setPrincipalWeeklyReportGenerated(true)}
                                    onOpenHistory={() => navigateTo('principal_weekly_history')}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'principal_weekly_history' && (
                                <PrincipalReportHistoryView
                                    kind="weekly"
                                    schoolName={teacherProfile.schoolName}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'principal_monthly_report' && (
                                <PrincipalPeriodicReportView
                                    kind="monthly"
                                    schoolName={teacherProfile.schoolName}
                                    generated={principalMonthlyReportGenerated}
                                    onGenerated={() => setPrincipalMonthlyReportGenerated(true)}
                                    onOpenHistory={() => navigateTo('principal_monthly_history')}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'principal_monthly_history' && (
                                <PrincipalReportHistoryView
                                    kind="monthly"
                                    schoolName={teacherProfile.schoolName}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'principal_term_report' && (
                                <PrincipalTermReportView
                                    schoolName={teacherProfile.schoolName}
                                    term={CURRENT_PRINCIPAL_TERM}
                                    generated={principalTermReportGenerated}
                                    onGenerated={() => setPrincipalTermReportGenerated(true)}
                                    onOpenHistory={() => navigateTo('principal_term_history')}
                                    onBack={goBack}
                                />
                            )}

                            {currentView === 'principal_term_history' && (
                                <PrincipalReportHistoryView
                                    kind="term"
                                    schoolName={teacherProfile.schoolName}
                                    onBack={goBack}
                                />
                            )}
                        </main>

                        {showInputBar && <GlobalInputBar />}

                        {activeNameEditor === 'subject' && (
                            <TextEditSheet
                                title={subjectDraftTarget ? '修改科目' : '新增科目'}
                                value={nameDraft}
                                placeholder="请输入科目名称"
                                onChange={setNameDraft}
                                onCancel={closeNameEditor}
                                onConfirm={saveNameEditor}
                            />
                        )}

                        {activeNameEditor === 'department' && (
                            <TextEditSheet
                                title={departmentDraftTarget ? '修改部门' : '新增部门'}
                                value={nameDraft}
                                placeholder="请输入部门名称"
                                onChange={setNameDraft}
                                onCancel={closeNameEditor}
                                onConfirm={saveNameEditor}
                            />
                        )}

                        {deleteTarget && (
                            <DeleteConfirmSheet
                                title={`删除${deleteTarget.name}`}
                                onCancel={() => setDeleteTarget(null)}
                                onConfirm={confirmDeleteMineFeatureItem}
                            />
                        )}

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
                                <div className="absolute inset-0 z-[70] bg-black/5" onClick={() => setShowKeyboard(false)}></div>
                                <VirtualKeyboard
                                    onClose={() => setShowKeyboard(false)}
                                    onKeyPress={(key) => setInputText(prev => prev + (key === 'space' ? ' ' : key))}
                                    onDelete={() => setInputText(prev => prev.slice(0, -1))}
                                    onSubmit={() => {
                                        if (!inputText.trim()) return;
                                        handleAnalysisComplete({ type: 'text', text: inputText, mockStudents: isMultiSelectMode ? Array.from(multiSelectIds) : [] });
                                    }}
                                />
                            </>
                        )}

                        {/* Teacher mobile bottom navigation - solid icons and brand red active state. */}
                        {showTabBar && (
                            <nav className="absolute bottom-0 left-0 right-0 z-50 h-16 border-0 bg-white/95 [box-shadow:var(--tm-shadow-navigation)] backdrop-blur-xl">
                                <div className="grid h-full grid-cols-3 items-center text-center">
                                    <button onClick={() => switchTab('home_log')} className="flex h-full min-w-0 flex-col items-center justify-center gap-1 transition active:scale-95">
                                        <ActivityIcon className={`h-[21px] w-[21px] ${getBottomNavTone(0)}`} fill="currentColor" />
                                        <span className={`text-xs font-semibold ${getBottomNavTone(0)}`}>记录</span>
                                    </button>
                                    <button onClick={() => switchTab('class_list')} className="flex h-full min-w-0 flex-col items-center justify-center gap-1 transition active:scale-95">
                                        <HomeIcon className={`h-[21px] w-[21px] ${getBottomNavTone(1)}`} fill="currentColor" />
                                        <span className={`text-xs font-semibold ${getBottomNavTone(1)}`}>班级</span>
                                    </button>
                                    <button onClick={() => switchTab('me')} className="flex h-full min-w-0 flex-col items-center justify-center gap-1 transition active:scale-95">
                                        <span className="relative">
                                            <UserIcon className={`h-[21px] w-[21px] ${getBottomNavTone(2)}`} fill="currentColor" />
                                            {pendingCollectionCount > 0 && <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--tm-status-negative)] px-1 text-[9px] font-bold leading-none tabular-nums text-white">{pendingCollectionCount > 9 ? '9+' : pendingCollectionCount}</span>}
                                        </span>
                                        <span className={`text-xs font-semibold ${getBottomNavTone(2)}`}>我的</span>
                                    </button>
                                </div>
                            </nav>
                        )}

                        {(currentView === 'me' || currentView === 'home_log' || currentView === 'class_list') && showTeacherSpaceSheet && (
                            <ClassSourceSheet
                                currentSpace={activeTeacherSpace}
                                spaceOptions={TEACHER_SPACE_OPTIONS}
                                onClose={() => setShowTeacherSpaceSheet(false)}
                                onSelectSpace={handleSelectTeacherSpace}
                            />
                        )}

                        {currentView === 'home_log' && recordContextToast && (
                            <div
                                className="pointer-events-none absolute inset-x-5 bottom-[150px] z-[65] flex justify-center"
                                role="status"
                                aria-live="polite"
                            >
                                <div className="max-w-full rounded-full bg-[var(--tm-text-primary)] px-4 py-2 text-center text-[12px] font-medium text-white shadow-[0_4px_8px_rgba(44,37,34,0.18)]">
                                    {recordContextToast}
                                </div>
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
                                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium active:bg-[var(--tm-bg-surface-soft)] ${term === selectedTerm ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                                                    >
                                                        {term}
                                                        {term === selectedTerm && <div className="h-2 w-2 rounded-full bg-[var(--tm-brand-primary)]"></div>}
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
                                                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium active:bg-[var(--tm-bg-surface-soft)] ${grade === selectedGradeScope ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                                                        >
                                                            {grade}
                                                            {grade === selectedGradeScope && <div className="h-2 w-2 rounded-full bg-[var(--tm-brand-primary)]"></div>}
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
                                                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium active:bg-[var(--tm-bg-surface-soft)] ${subject === selectedSubjectScope ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                                                        >
                                                            {subject}
                                                            {subject === selectedSubjectScope && <div className="h-2 w-2 rounded-full bg-[var(--tm-brand-primary)]"></div>}
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
                                            className="flex-1 rounded-xl bg-[var(--tm-brand-primary)] py-3.5 text-sm font-bold text-white shadow-[var(--tm-shadow-control)] transition-all active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)]"
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

                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-icon)] ring-2 ring-white/10">
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">
                                        {successToastMessage.title}
                                    </h3>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                        {successToastMessage.body}
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
