import React, { useEffect, useState } from 'react';
import { Button, Cascader, DatePicker, Input, Select as ArcoSelect, Table, Popconfirm } from '@arco-design/web-react';
import {
    LayoutDashboard, FileText, ClipboardList, PenTool,
    Settings, Users, BookOpen, Database, Download,
    Menu, User, ChevronDown, ChevronRight, Package,
    Landmark, ArrowLeftRight, Coins, Monitor, AlertCircle,
    Info, Search, Plus, Sparkles,
    Check, Upload, KeyRound, Eye, Move
} from 'lucide-react';

interface TeacherDashboardProps {
    onNavigateBigScreen?: () => void;
    embedded?: boolean;
}

interface GradeExamRow {
    id: number;
    term: string;
    type: string;
    month?: string;
    subjects: string[];
    className: string;
    creator: string;
}

interface GradeExamAggregateRow {
    id: string;
    term: string;
    type: string;
    rows: GradeExamRow[];
}

interface GradeStudentRow {
    id: string;
    studentNo: string;
    name: string;
    scores: Record<string, string>;
}

interface ExamLevelOption {
    id: number;
    name: string;
    color: string;
}

interface TermReportModuleConfig {
    id: string;
    name: string;
    enabled: boolean;
    description: string;
}

const defaultExamLevelOptions: ExamLevelOption[] = [
    { id: 1, name: '优', color: '#00994C' },
    { id: 2, name: '良', color: '#2962FF' },
    { id: 3, name: '合格', color: '#CC8800' },
    { id: 4, name: '待合格', color: '#E64A19' },
    { id: 5, name: '缺考', color: '#666666' }
];

const defaultTermReportModules: TermReportModuleConfig[] = [
    { id: 'fiveEducationRadar', name: '五育雷达图', enabled: true, description: '展示德智体美劳综合发展画像。' },
    { id: 'subjectGradeDistribution', name: '学科成绩分布', enabled: true, description: '展示各学科等级或成绩分布情况。' },
    { id: 'highlightMoments', name: '高光时刻', enabled: false, description: '展示学生本学期代表性成长片段。' },
    { id: 'overallEvaluation', name: '总体评价', enabled: true, description: '汇总学生本学期综合表现。' },
    { id: 'growthSuggestions', name: '成长建议', enabled: true, description: '给出下一阶段可执行提升建议。' },
    { id: 'parentChildActivityGuide', name: '亲子活动指南', enabled: true, description: '提供家庭共育活动方向。' }
];

const buildExamLevelColorStyle = (color: string): React.CSSProperties => ({
    color,
    backgroundColor: `${color}14`
});

interface HomeworkStudentRow {
    id: string;
    studentNo: string;
    name: string;
    status: string;
}

interface HomeworkRecordRow {
    id: number;
    date: string;
    subject: string;
    name: string;
    className: string;
    creator: string;
    updatedAt: string;
    students: HomeworkStudentRow[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateBigScreen, embedded = false }) => {
    // 侧边栏菜单展开状态控制
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        '货柜机配置中心': true,
        '基础信息配置': false,
        '数据中心': true,
    });

    const [activeMenu, setActiveMenu] = useState('货币发放管理');

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const menus = [
        {
            title: '货柜机配置中心', icon: <Package size={18} />,
            children: ['货币发放管理', '货柜超市管理', '历次发币记录', '储蓄银行配置', '设备基础配置']
        },
        {
            title: '报表中心', icon: <FileText size={18} />,
            children: ['学校驾驶舱', '评价记录明细表', '学期报告']
        },
        {
            title: '播报中心', icon: <PenTool size={18} />,
            children: ['评价指标管理']
        },
        {
            title: '基础信息配置', icon: <Settings size={18} />,
            children: ['学期管理', '部门管理', '科目管理', '年级管理', '班级管理', '教师管理', '角色管理', '学生管理', '学生成绩管理', '考试等级管理', '期末报告配置']
        },
        {
            title: '报告配置', icon: <FileText size={18} />,
            children: ['学科指标']
        },
        {
            title: '数据中心', icon: <Database size={18} />,
            children: ['资料文件', '考试数据', '作业数据']
        }
    ];
    const activeMenuGroup = menus.find(menu => menu.children.includes(activeMenu))?.title || '货柜机配置中心';

    // 发币模型配置状态
    const [budgetPool, setBudgetPool] = useState(10000);
    const [issueCycle, setIssueCycle] = useState<'monthly' | 'weekly'>('monthly');
    const [guaranteedRate, setGuaranteedRate] = useState(30);
    const [competitiveRate, setCompetitiveRate] = useState(70);

    // 发币配置页面内部 Tab
    const [issuanceTab, setIssuanceTab] = useState<'auto' | 'manual'>('auto');

    // 手动发币状态
    const [manualClass, setManualClass] = useState('');
    const [manualPerStudent, setManualPerStudent] = useState(0);
    const [manualReason, setManualReason] = useState('流动红旗');
    const [customReason, setCustomReason] = useState('');

    // 模拟班级数据字典 (班级名称 -> 班级人数)
    const classData: Record<string, number> = {
        '1年级1班': 42,
        '1年级2班': 45,
        '2年级1班': 40,
        '2年级2班': 43,
        '3年级1班': 48,
    };
    const selectedClassStudentCount = classData[manualClass] || 0;
    const totalManualIssuance = selectedClassStudentCount * manualPerStudent;

    // 储蓄银行配置状态
    const [currentDailyRate, setCurrentDailyRate] = useState(0.03);
    const [bankProducts, setBankProducts] = useState([
        { id: 1, label: '定期存单-1周', days: 7, rate: 0.01, min: 1, desc: '满期固定利息1.0%', active: true },
        { id: 2, label: '定期存单-1月', days: 30, rate: 0.08, min: 1, desc: '满期固定利息8.0%', active: true },
        { id: 3, label: '定期存单-半年', days: 180, rate: 0.60, min: 1, desc: '满期固定利息60.0%', active: true },
        { id: 4, label: '定期存单-1年', days: 365, rate: 1.50, min: 1, desc: '满期固定利息150.0%', active: true }
    ]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // 设备基础配置状态
    const [terminalConfig, setTerminalConfig] = useState({
        mainTitle: '校园星光',
        subTitle: '货柜机',
        slogan: '点滴进步，成就未来',
        growthLabel: '成长足迹中心',
        growthDesc: '记录点滴进步，每月结算奖励',
        shopLabel: '文创星光超市',
        shopDesc: '把努力变成奖励，海量商品兑换',
        bankLabel: '博学储蓄银行',
        bankDesc: '将资产存入银行，赚取高额利息',
        coinIconUrl: '/assets/coin.png'
    });

    // 历次发币记录筛选状态
    const [recordFilterMonthStart, setRecordFilterMonthStart] = useState('');
    const [recordFilterMonthEnd, setRecordFilterMonthEnd] = useState('');
    const [recordFilterType, setRecordFilterType] = useState('全部类型');

    const allRecords = [
        {
            title: '2026年3月第2次', type: '自动发放', time: '2026-03-09',
            cycle: '按周考核（2026-03-02～2026-03-08）', targets: '所有班级',
            rateValue: '100', rateUnit: '班级', rateReason: '', total: 200000, operator: '系统'
        },
        {
            title: '2026年3月第1次', type: '手动发放', time: '2026-03-05',
            cycle: '-', targets: '2025级2班',
            rateValue: '10', rateUnit: '学生', rateReason: '流动红旗', total: 450, operator: '周峰'
        },
        {
            title: '2026年2月第1次', type: '自动发放', time: '2026-02-28',
            cycle: '按月考核（2026-02-01～2026-02-28）', targets: '所有班级',
            rateValue: '30', rateUnit: '班级', rateReason: '', total: 100000, operator: '系统'
        },
        {
            title: '2026年1月第1次', type: '手动发放', time: '2026-01-15',
            cycle: '-', targets: '2024级1班',
            rateValue: '5', rateUnit: '学生', rateReason: '运动会奖励', total: 250, operator: '李老师'
        }
    ];

    const filteredRecords = allRecords.filter(item => {
        if (recordFilterType !== '全部类型' && item.type !== recordFilterType) return false;
        if (recordFilterMonthStart || recordFilterMonthEnd) {
            const itemMonth = item.time.substring(0, 7); // Extract YYYY-MM
            if (recordFilterMonthStart && itemMonth < recordFilterMonthStart) return false;
            if (recordFilterMonthEnd && itemMonth > recordFilterMonthEnd) return false;
        }
        return true;
    });

    // 考试数据 demo 数据：仅用于前端静态展示，后续再接入真实考试与成绩流程。
    const currentGradeTerm = '2025-2026学年 下学期';
    const gradeTermOptions = ['2025-2026学年 下学期', '2025-2026学年 上学期', '2024-2025学年 下学期', '2024-2025学年 上学期'];
    const gradeExamTypeOptions = ['期中', '期末', '月考', '单元测评'];
    const gradeMonthOptions = Array.from({ length: 12 }, (_, index) => `${index + 1}月`);
    const gradeLevelOptions = ['2020级', '2021级', '2022级', '2023级', '2024级', '2025级'];
    const gradeLevelLabelMap: Record<string, string> = {
        '2020级': '2020级（六年级）',
        '2021级': '2021级（五年级）',
        '2022级': '2022级（四年级）',
        '2023级': '2023级（三年级）',
        '2024级': '2024级（二年级）',
        '2025级': '2025级（一年级）'
    };
    const formatGradeLevelLabel = (level: string) => gradeLevelLabelMap[level] || level;
    const gradeClassCountMap: Record<string, number> = { '2020级': 5, '2021级': 6, '2022级': 7, '2023级': 15, '2024级': 6, '2025级': 8 };
    const getClassOptionsByLevel = (level: string) => Array.from({ length: gradeClassCountMap[level] || 0 }, (_, index) => `${level}${index + 1}班`);
    const gradeSubjectOptions = ['语文', '数学', '英语', '科学', '道德与法治', '自然', '历史', '地理', '物理', '化学', '生物', '体育', '音乐', '美术', '信息科技', '劳动', '书法', '心理健康', '综合实践', '阅读', '口语表达', '项目学习', '班本课程', '社团课程'];
    const [examLevelOptions, setExamLevelOptions] = useState<ExamLevelOption[]>(defaultExamLevelOptions);
    const [examLevelModalOpen, setExamLevelModalOpen] = useState(false);
    const [editingExamLevel, setEditingExamLevel] = useState<ExamLevelOption | null>(null);
    const [examLevelForm, setExamLevelForm] = useState({ name: '', color: '#165DFF' });
    const gradeScoreSelectOptions = examLevelOptions.map(option => ({ label: option.name, value: option.name }));
    const getExamLevelColorStyle = (value: string): React.CSSProperties => {
        const level = examLevelOptions.find(option => option.name === value.trim());
        return level ? buildExamLevelColorStyle(level.color) : {};
    };
    const getGradeScoreColorClass = (value: string) => value.trim() ? '' : 'bg-transparent text-[#333333]';
    const createBlankGradeStudent = (subjects: string[], id = `manual-${Date.now()}`): GradeStudentRow => ({
        id,
        studentNo: '',
        name: '',
        scores: subjects.reduce<Record<string, string>>((scores, subject) => {
            scores[subject] = '';
            return scores;
        }, {})
    });
    const [gradeTermFilter, setGradeTermFilter] = useState('全部学期');
    const [gradeExamTypeFilter, setGradeExamTypeFilter] = useState('全部类型');
    const [gradeClassFilters, setGradeClassFilters] = useState<string[]>([]);
    const [gradeSubjectFilters, setGradeSubjectFilters] = useState<string[]>([]);
    const [gradeCreatorSearch, setGradeCreatorSearch] = useState('');
    const [gradeListViewMode, setGradeListViewMode] = useState<'class' | 'exam'>('class');
    const [gradePageMode, setGradePageMode] = useState<'list' | 'create' | 'view' | 'edit' | 'examView'>('list');
    const [selectedGradeExam, setSelectedGradeExam] = useState<GradeExamRow | null>(null);
    const [selectedGradeExamAggregate, setSelectedGradeExamAggregate] = useState<GradeExamAggregateRow | null>(null);
    const [activeAggregateClassByLevel, setActiveAggregateClassByLevel] = useState<Record<string, string>>({});
    const [newGradeTerm, setNewGradeTerm] = useState(currentGradeTerm);
    const [newGradeExamType, setNewGradeExamType] = useState('');
    const [newGradeExamMonth, setNewGradeExamMonth] = useState('');
    const [newGradeLevel, setNewGradeLevel] = useState('');
    const [newGradeClass, setNewGradeClass] = useState('');
    const [newGradeClasses, setNewGradeClasses] = useState<string[]>([]);
    const [activeGradeClassSheet, setActiveGradeClassSheet] = useState('');
    const [newGradeSubjects, setNewGradeSubjects] = useState<string[]>([]);
    const [newGradeStudents, setNewGradeStudents] = useState<GradeStudentRow[]>(() => [createBlankGradeStudent([], 'manual-1')]);
    const [gradeStudentsByClass, setGradeStudentsByClass] = useState<Record<string, GradeStudentRow[]>>({});
    const [gradeColumnFillValues, setGradeColumnFillValues] = useState<Record<string, string>>({});
    const [selectedGradeCells, setSelectedGradeCells] = useState<string[]>([]);
    const [gradeSelectionAnchor, setGradeSelectionAnchor] = useState<{ row: number; column: number } | null>(null);
    const [isDraggingGradeCells, setIsDraggingGradeCells] = useState(false);
    const [draggedGradeSubject, setDraggedGradeSubject] = useState<string | null>(null);
    const [termReportModules, setTermReportModules] = useState<TermReportModuleConfig[]>(defaultTermReportModules);
    const [draggedTermReportModuleId, setDraggedTermReportModuleId] = useState<string | null>(null);
    
    const demoGradeExamSubjects = ['语文', '数学', '英语', '科学', '道德与法治', '体育', '音乐', '美术', '信息科技', '劳动'];
    const demoGradeExamRows: GradeExamRow[] = gradeLevelOptions.flatMap((level, levelIndex) => (
        getClassOptionsByLevel(level).map((className, classIndex) => ({
            id: (levelIndex + 1) * 100 + classIndex + 1,
            term: '2025-2026学年 下学期',
            type: '期末',
            subjects: demoGradeExamSubjects,
            className,
            creator: '教务处'
        }))
    ));
    const [gradeExamRows, setGradeExamRows] = useState<GradeExamRow[]>(demoGradeExamRows);

    const [gradeExamScoresMap, setGradeExamScoresMap] = useState<Record<number, GradeStudentRow[]>>(() => {
        const initialMap: Record<number, GradeStudentRow[]> = {};
        const mockNames = ['林一诺', '周明轩', '陈雨桐', '李思远', '王若溪', '赵子涵', '吴昊然', '郑可欣', '孙嘉泽', '黄芷晴', '何宇航', '郭诗涵', '马梓豪', '罗语晨', '胡安琪', '高铭宇'];
        const presetScores = defaultExamLevelOptions.map(option => option.name);

        demoGradeExamRows.forEach(exam => {
            const levelNumber = exam.className.match(/^(\d+)级/)?.[1] || '2025';
            const classNumber = exam.className.match(/(\d+)班/)?.[1] || '1';
            initialMap[exam.id] = mockNames.map((name, index) => {
                const scores: Record<string, string> = {};
                exam.subjects.forEach((subject, subjectIndex) => {
                    const scoreIndex = (index + subjectIndex + exam.id) % presetScores.length;
                    scores[subject] = presetScores[scoreIndex];
                });
                return {
                    id: `${exam.className}-${index + 1}`,
                    studentNo: `${levelNumber}${classNumber.padStart(2, '0')}${(index + 1).toString().padStart(2, '0')}`,
                    name,
                    scores
                };
            });
        });
        return initialMap;
    });

    const gradeTerms = Array.from(new Set([...gradeTermOptions, ...gradeExamRows.map(row => row.term)]));
    const gradeExamTypes = Array.from(new Set([...gradeExamTypeOptions, ...gradeExamRows.map(row => row.type)]));
    const gradeFilterSubjects = Array.from(new Set([...gradeSubjectOptions, ...gradeExamRows.flatMap(row => row.subjects)]));
    const formatGradeExamTypeLabel = (row: Pick<GradeExamRow, 'type' | 'month'>) => (
        row.type === '月考' && row.month ? `${row.type}（${row.month}）` : row.type
    );
    const filteredGradeExamRows = gradeExamRows.filter(row => {
        if (gradeTermFilter !== '全部学期' && row.term !== gradeTermFilter) return false;
        if (gradeExamTypeFilter !== '全部类型' && row.type !== gradeExamTypeFilter) return false;
        if (gradeClassFilters.length > 0 && !gradeClassFilters.includes(row.className)) return false;
        if (gradeSubjectFilters.length > 0 && !gradeSubjectFilters.some(subject => row.subjects.includes(subject))) return false;
        const keyword = gradeCreatorSearch.trim();
        if (keyword && !row.creator.includes(keyword)) return false;
        return true;
    });
    const getGradeLevelFromClassName = (className: string) => className.match(/^(\d+级)/)?.[1] || '未分组年级';
    const gradeExamAggregateRows: GradeExamAggregateRow[] = Array.from(
        gradeExamRows.reduce<Map<string, GradeExamAggregateRow>>((map, row) => {
            if (gradeTermFilter !== '全部学期' && row.term !== gradeTermFilter) return map;
            if (gradeExamTypeFilter !== '全部类型' && row.type !== gradeExamTypeFilter) return map;
            const id = `${row.term}__${row.type}__${row.month || ''}`;
            const current = map.get(id);
            if (current) {
                current.rows.push(row);
            } else {
                map.set(id, { id, term: row.term, type: row.type, rows: [row] });
            }
            return map;
        }, new Map()).values()
    ).sort((a, b) => b.term.localeCompare(a.term, 'zh-Hans') || a.type.localeCompare(b.type, 'zh-Hans'));
    const selectedAggregateGradeGroups = selectedGradeExamAggregate
        ? Array.from(
            selectedGradeExamAggregate.rows.reduce<Map<string, GradeExamRow[]>>((map, row) => {
                const level = getGradeLevelFromClassName(row.className);
                map.set(level, [...(map.get(level) || []), row]);
                return map;
            }, new Map()).entries()
        ).sort(([levelA], [levelB]) => levelA.localeCompare(levelB, 'zh-Hans'))
        : [];

    const gradeClassTableColumns = [
        { title: '学年-学期', dataIndex: 'term', width: 170 },
        {
            title: '考试类型',
            dataIndex: 'type',
            width: 120,
            render: (_: string, row: GradeExamRow) => <span className="rounded bg-[#E8F3FF] px-2 py-0.5 text-xs font-normal text-[#165DFF]">{formatGradeExamTypeLabel(row)}</span>
        },
        {
            title: '科目',
            dataIndex: 'subjects',
            width: 240,
            render: (subjects: string[]) => (
                <div className="flex flex-wrap gap-1.5">
                    {subjects.map(subject => (
                        <span key={subject} className="flex h-6 items-center justify-center rounded-full border border-[#E5E6EB] bg-white px-3 text-xs font-normal text-[#4E5969]">
                            {subject}
                        </span>
                    ))}
                </div>
            )
        },
        { title: '班级', dataIndex: 'className', width: 140 },
        { title: '创建人', dataIndex: 'creator', width: 120 },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 176,
            align: 'right' as const,
            render: (_: unknown, row: GradeExamRow) => (
                <div className="flex justify-end gap-4">
                    <Button type="text" size="small" className="!px-0" onClick={() => handleViewGradeExam(row)}>查看</Button>
                    <Button type="text" size="small" className="!px-0" onClick={() => handleEditGradeExam(row)}>编辑</Button>
                    <Popconfirm
                        title="确认删除这条考试记录？"
                        content={`删除后将移除「${formatGradeExamLabel(row)}」及对应成绩明细。`}
                        okText="删除记录"
                        cancelText="取消"
                        okButtonProps={{ status: 'danger' }}
                        onOk={() => handleDeleteGradeExam(row)}
                    >
                        <Button type="text" status="danger" size="small" className="!px-0">删除</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];
    const gradeExamAggregateTableColumns = [
        { title: '学年-学期', dataIndex: 'term', width: 220 },
        {
            title: '考试类型',
            dataIndex: 'type',
            width: 160,
            render: (_: string, row: GradeExamAggregateRow) => <span className="rounded bg-[#E8F3FF] px-2 py-0.5 text-xs font-normal text-[#165DFF]">{formatGradeExamTypeLabel(row.rows[0] || row)}</span>
        },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 120,
            align: 'right' as const,
            render: (_: unknown, row: GradeExamAggregateRow) => (
                <div className="flex justify-end">
                    <Button type="text" size="small" className="!px-0" onClick={() => handleViewGradeExamAggregate(row)}>查看</Button>
                </div>
            )
        }
    ];

    const examLevelTableColumns = [
        {
            title: '等级名称',
            dataIndex: 'name',
            width: 240,
            render: (name: string, row: ExamLevelOption) => (
                <span className="inline-flex h-6 items-center rounded px-2 text-xs font-medium" style={buildExamLevelColorStyle(row.color)}>{name}</span>
            )
        },
        {
            title: '颜色',
            dataIndex: 'color',
            width: 220,
            render: (color: string) => (
                <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded border border-[#E5E6EB]" style={{ backgroundColor: color }} />
                    <span className="font-mono text-xs text-[#4E5969]">{color}</span>
                </div>
            )
        },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 140,
            align: 'right' as const,
            render: (_: unknown, row: ExamLevelOption) => (
                <div className="flex justify-end gap-4">
                    <Button type="text" size="small" className="!px-0" onClick={() => handleOpenExamLevelModal(row)}>编辑</Button>
                    <Button type="text" status="danger" size="small" className="!px-0" onClick={() => handleDeleteExamLevel(row)}>删除</Button>
                </div>
            )
        }
    ];

    const handleOpenExamLevelModal = (level: ExamLevelOption | null = null) => {
        setEditingExamLevel(level);
        setExamLevelForm(level ? { name: level.name, color: level.color } : { name: '', color: '#165DFF' });
        setExamLevelModalOpen(true);
    };

    const handleSaveExamLevel = () => {
        const name = examLevelForm.name.trim();
        if (!name) {
            window.alert('请输入等级名称。');
            return;
        }
        const hasSameName = examLevelOptions.some(option => option.name === name && option.id !== editingExamLevel?.id);
        if (hasSameName) {
            window.alert('等级名称不能重复。');
            return;
        }
        if (editingExamLevel) {
            setExamLevelOptions(options => options.map(option => (
                option.id === editingExamLevel.id ? { ...option, name, color: examLevelForm.color } : option
            )));
        } else {
            setExamLevelOptions(options => [
                ...options,
                { id: Date.now(), name, color: examLevelForm.color }
            ]);
        }
        setExamLevelModalOpen(false);
        setEditingExamLevel(null);
    };

    const handleDeleteExamLevel = (level: ExamLevelOption) => {
        if (!window.confirm(`确认删除考试等级“${level.name}”吗？`)) return;
        setExamLevelOptions(options => options.filter(option => option.id !== level.id));
        setGradeColumnFillValues(values => Object.fromEntries(
            Object.entries(values).map(([subject, value]) => [subject, value === level.name ? '' : value])
        ));
    };

    const handleToggleTermReportModule = (moduleId: string) => {
        setTermReportModules(modules => modules.map(module => (
            module.id === moduleId ? { ...module, enabled: !module.enabled } : module
        )));
    };

    const handleDropTermReportModule = (targetModuleId: string) => {
        if (!draggedTermReportModuleId || draggedTermReportModuleId === targetModuleId) return;
        setTermReportModules(modules => {
            const nextModules = [...modules];
            const fromIndex = nextModules.findIndex(module => module.id === draggedTermReportModuleId);
            const toIndex = nextModules.findIndex(module => module.id === targetModuleId);
            if (fromIndex < 0 || toIndex < 0) return modules;
            const [movedModule] = nextModules.splice(fromIndex, 1);
            nextModules.splice(toIndex, 0, movedModule);
            return nextModules;
        });
        setDraggedTermReportModuleId(null);
    };

    const handleViewGradeExam = (exam: GradeExamRow) => {
        setSelectedGradeExam(exam);
        setSelectedGradeExamAggregate(null);
        setNewGradeTerm(exam.term);
        setNewGradeExamType(exam.type);
        setNewGradeExamMonth(exam.month || '');
        const levelMatch = exam.className.match(/^(\d+级)/);
        const level = levelMatch ? levelMatch[1] : '';
        setNewGradeLevel(level);
        setNewGradeClass(exam.className);
        setNewGradeClasses([exam.className]);
        setActiveGradeClassSheet(exam.className);
        setNewGradeSubjects(exam.subjects);
        const examStudents = gradeExamScoresMap[exam.id] || buildEmptyGradeRowsForClass(exam.className);
        setNewGradeStudents(examStudents);
        setGradeStudentsByClass({ [exam.className]: examStudents });
        setGradePageMode('view');
    };

    const handleViewGradeExamAggregate = (aggregate: GradeExamAggregateRow) => {
        setSelectedGradeExam(null);
        setSelectedGradeExamAggregate(aggregate);
        setNewGradeTerm(aggregate.term);
        setNewGradeExamType(aggregate.type);
        setNewGradeExamMonth(aggregate.rows[0]?.month || '');
        const classMap = aggregate.rows.reduce<Record<string, GradeStudentRow[]>>((map, row) => {
            map[row.className] = gradeExamScoresMap[row.id] || buildEmptyGradeRowsForClass(row.className);
            return map;
        }, {});
        const activeClassMap = aggregate.rows.reduce<Record<string, string>>((map, row) => {
            const level = getGradeLevelFromClassName(row.className);
            if (!map[level]) map[level] = row.className;
            return map;
        }, {});
        setGradeStudentsByClass(classMap);
        setActiveAggregateClassByLevel(activeClassMap);
        setGradePageMode('examView');
    };

    const handleEditGradeExam = (exam: GradeExamRow) => {
        setSelectedGradeExam(exam);
        setSelectedGradeExamAggregate(null);
        setNewGradeTerm(exam.term);
        setNewGradeExamType(exam.type);
        setNewGradeExamMonth(exam.month || '');
        const levelMatch = exam.className.match(/^(\d+级)/);
        const level = levelMatch ? levelMatch[1] : '';
        setNewGradeLevel(level);
        setNewGradeClass(exam.className);
        setNewGradeClasses([exam.className]);
        setActiveGradeClassSheet(exam.className);
        setNewGradeSubjects(exam.subjects);
        const examStudents = gradeExamScoresMap[exam.id] || buildEmptyGradeRowsForClass(exam.className);
        setNewGradeStudents(examStudents);
        setGradeStudentsByClass({ [exam.className]: examStudents });
        setGradePageMode('edit');
    };

    const formatGradeExamLabel = (row: typeof gradeExamRows[number]) => `${row.term} ${row.type} ${row.className}`;
    const handleDeleteGradeExam = (exam: GradeExamRow) => {
        setGradeExamRows(prev => prev.filter(row => row.id !== exam.id));
        setGradeExamScoresMap(prev => {
            const nextMap = { ...prev };
            delete nextMap[exam.id];
            return nextMap;
        });
    };
    const resetGradeCreateForm = () => {
        setNewGradeTerm(currentGradeTerm);
        setNewGradeExamType('');
        setNewGradeExamMonth('');
        setNewGradeLevel('');
        setNewGradeClass('');
        setNewGradeClasses([]);
        setActiveGradeClassSheet('');
        setNewGradeSubjects([]);
        setNewGradeStudents([createBlankGradeStudent([], 'manual-1')]);
        setGradeStudentsByClass({});
        setGradeColumnFillValues({});
        setSelectedGradeCells([]);
        setGradeSelectionAnchor(null);
        setIsDraggingGradeCells(false);
    };
    const openGradeCreatePage = () => {
        resetGradeCreateForm();
        setSelectedGradeExam(null);
        setSelectedGradeExamAggregate(null);
        setGradePageMode('create');
    };
    const toggleNewGradeSubject = (subject: string) => {
        setNewGradeSubjects(prev => {
            const nextSubjects = prev.includes(subject) ? prev.filter(item => item !== subject) : [...prev, subject];
            const normalizeStudents = (students: GradeStudentRow[]) => students.map(student => {
                const nextScores = nextSubjects.reduce<Record<string, string>>((scores, item) => {
                    scores[item] = student.scores[item] || '';
                    return scores;
                }, {});
                return { ...student, scores: nextScores };
            });
            updateActiveGradeStudents(students => students.map(student => {
                const nextScores = nextSubjects.reduce<Record<string, string>>((scores, item) => {
                    scores[item] = student.scores[item] || '';
                    return scores;
                }, {});
                return { ...student, scores: nextScores };
            }));
            setGradeStudentsByClass(prevClassMap => {
                const nextClassMap = { ...prevClassMap };
                newGradeClasses.forEach(className => {
                    nextClassMap[className] = normalizeStudents(nextClassMap[className] || buildEmptyGradeRowsForClass(className));
                });
                return nextClassMap;
            });
            setGradeColumnFillValues(values => nextSubjects.reduce<Record<string, string>>((nextValues, item) => {
                nextValues[item] = values[item] || '';
                return nextValues;
            }, {}));
            return nextSubjects;
        });
    };
    const buildMockStudentsForClass = (className: string): GradeStudentRow[] => {
        const names = ['林一诺', '周明轩', '陈雨桐', '李思远', '王若溪', '赵子涵', '吴昊然', '郑可欣', '孙嘉泽', '黄芷晴', '何宇航', '郭诗涵', '马梓豪', '罗语晨', '胡安琪', '高铭宇'];
        const classNumber = className.match(/(\d+)班/)?.[1] || '1';
        return names.map((name, index) => ({
            id: `${className}-${index + 1}`,
            studentNo: `2025${classNumber.padStart(2, '0')}${(index + 1).toString().padStart(2, '0')}`,
            name,
            scores: newGradeSubjects.reduce<Record<string, string>>((scores, subject) => {
                scores[subject] = '';
                return scores;
            }, {})
        })).sort((a, b) => a.studentNo.localeCompare(b.studentNo));
    };
    const buildEmptyGradeRowsForClass = (className: string): GradeStudentRow[] => (
        buildMockStudentsForClass(className).map(student => ({
            ...student,
            studentNo: '',
            name: ''
        }))
    );
    const resetGradeTableSelection = () => {
        setSelectedGradeCells([]);
        setGradeSelectionAnchor(null);
        setIsDraggingGradeCells(false);
    };
    const syncActiveGradeStudents = (className: string, students: GradeStudentRow[]) => {
        setNewGradeStudents(students);
        if (!className) return;
        setGradeStudentsByClass(prev => ({ ...prev, [className]: students }));
    };
    const updateActiveGradeStudents = (updater: (students: GradeStudentRow[]) => GradeStudentRow[]) => {
        setNewGradeStudents(prevStudents => {
            const nextStudents = updater(prevStudents);
            if (activeGradeClassSheet) {
                setGradeStudentsByClass(prev => ({ ...prev, [activeGradeClassSheet]: nextStudents }));
            }
            return nextStudents;
        });
    };
    const handleSwitchGradeClassSheet = (className: string) => {
        setNewGradeClass(className);
        setActiveGradeClassSheet(className);
        setNewGradeStudents(gradeStudentsByClass[className] || buildEmptyGradeRowsForClass(className));
        resetGradeTableSelection();
    };
    const handleToggleGradeClass = (className: string) => {
        if (!className) return;
        setNewGradeClasses(prevClasses => {
            if (prevClasses.includes(className)) {
                const nextClasses = prevClasses.filter(item => item !== className);
                setGradeStudentsByClass(prevMap => {
                    const nextMap = { ...prevMap };
                    delete nextMap[className];
                    return nextMap;
                });
                if (activeGradeClassSheet === className) {
                    const nextActiveClass = nextClasses[0] || '';
                    setActiveGradeClassSheet(nextActiveClass);
                    setNewGradeClass(nextActiveClass);
                    setNewGradeStudents(nextActiveClass ? (gradeStudentsByClass[nextActiveClass] || buildEmptyGradeRowsForClass(nextActiveClass)) : [createBlankGradeStudent(newGradeSubjects, 'manual-1')]);
                    resetGradeTableSelection();
                }
                return nextClasses;
            }

            const nextClasses = [...prevClasses, className];
            const classStudents = gradeStudentsByClass[className] || buildEmptyGradeRowsForClass(className);
            setGradeStudentsByClass(prevMap => ({ ...prevMap, [className]: prevMap[className] || classStudents }));
            if (!activeGradeClassSheet) {
                setActiveGradeClassSheet(nextClasses[0]);
                setNewGradeClass(nextClasses[0]);
                setNewGradeStudents(classStudents);
                resetGradeTableSelection();
            }
            return nextClasses;
        });
    };
    const handleFillGradeStudents = () => {
        if (!activeGradeClassSheet) {
            window.alert('请先选择班级。');
            return;
        }
        syncActiveGradeStudents(activeGradeClassSheet, buildMockStudentsForClass(activeGradeClassSheet));
        resetGradeTableSelection();
    };
    const handleChangeStudentIdentity = (studentId: string, field: 'name', value: string) => {
        updateActiveGradeStudents(students => students.map(student => (
            student.id === studentId ? { ...student, [field]: value } : student
        )));
    };
    const handleChangeStudentGrade = (studentId: string, subject: string, value: string) => {
        updateActiveGradeStudents(students => students.map(student => (
            student.id === studentId
                ? { ...student, scores: { ...student.scores, [subject]: value } }
                : student
        )));
    };
    const getGradeCellKey = (rowIndex: number, columnIndex: number) => `${rowIndex}-${columnIndex}`;
    const selectedGradeCellSet = new Set(selectedGradeCells);
    const getGradeCellValue = (student: GradeStudentRow, columnIndex: number) => {
        if (columnIndex === 0) return student.name;
        const subject = newGradeSubjects[columnIndex - 1];
        return subject ? (student.scores[subject] || '') : '';
    };
    const pasteGradeCellsAt = (studentIndex: number, columnIndex: number, cells: string[][]) => {
        updateActiveGradeStudents(students => {
            const nextStudents = [...students];
            const requiredRows = studentIndex + cells.length;
            while (nextStudents.length < requiredRows) {
                nextStudents.push(createBlankGradeStudent(newGradeSubjects, `manual-${Date.now()}-${nextStudents.length}`));
            }
            cells.forEach((rowCells, rowOffset) => {
                const rowIndex = studentIndex + rowOffset;
                const student = nextStudents[rowIndex];
                if (!student) return;
                const nextStudent: GradeStudentRow = { ...student, scores: { ...student.scores } };
                rowCells.forEach((cellValue, cellOffset) => {
                    const targetColumn = columnIndex + cellOffset;
                    const value = cellValue.trim();
                    if (targetColumn === 0) nextStudent.name = value;
                    if (targetColumn >= 1) {
                        const subject = newGradeSubjects[targetColumn - 1];
                        if (subject) nextStudent.scores[subject] = value;
                    }
                });
                nextStudents[rowIndex] = nextStudent;
            });
            return nextStudents;
        });
    };
    const parseGradeClipboard = (text: string) => text
        .replace(/\r/g, '')
        .split('\n')
        .filter((row, index, list) => row !== '' || index < list.length - 1)
        .map(row => row.split('\t'));
    const getGradeRangeCellKeys = (start: { row: number; column: number }, end: { row: number; column: number }) => {
        const rowStart = Math.min(start.row, end.row);
        const rowEnd = Math.max(start.row, end.row);
        const columnStart = Math.min(start.column, end.column);
        const columnEnd = Math.max(start.column, end.column);
        const rangeKeys: string[] = [];
        for (let row = rowStart; row <= rowEnd; row += 1) {
            for (let column = columnStart; column <= columnEnd; column += 1) {
                rangeKeys.push(getGradeCellKey(row, column));
            }
        }
        return rangeKeys;
    };
    const handleGradeCellMouseDown = (rowIndex: number, columnIndex: number, event: React.MouseEvent<HTMLInputElement>) => {
        event.currentTarget.focus();
        event.currentTarget.select();
        const key = getGradeCellKey(rowIndex, columnIndex);
        if (event.shiftKey && gradeSelectionAnchor) {
            setSelectedGradeCells(getGradeRangeCellKeys(gradeSelectionAnchor, { row: rowIndex, column: columnIndex }));
            setIsDraggingGradeCells(false);
            return;
        }
        if (event.metaKey || event.ctrlKey) {
            setSelectedGradeCells(prev => prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]);
            setGradeSelectionAnchor({ row: rowIndex, column: columnIndex });
            setIsDraggingGradeCells(false);
            return;
        }
        const anchor = { row: rowIndex, column: columnIndex };
        setGradeSelectionAnchor(anchor);
        setSelectedGradeCells([key]);
        setIsDraggingGradeCells(true);
    };
    const handleGradeCellMouseEnter = (rowIndex: number, columnIndex: number) => {
        if (!isDraggingGradeCells || !gradeSelectionAnchor) return;
        setSelectedGradeCells(getGradeRangeCellKeys(gradeSelectionAnchor, { row: rowIndex, column: columnIndex }));
    };
    const stopGradeCellDrag = () => {
        setIsDraggingGradeCells(false);
    };
    const handleClearSelectedGradeCells = () => {
        if (selectedGradeCells.length === 0) return;
        updateActiveGradeStudents(students => students.map((student, rowIndex) => {
            const nextStudent: GradeStudentRow = { ...student, scores: { ...student.scores } };
            selectedGradeCells.forEach(cellKey => {
                const [selectedRow, selectedColumn] = cellKey.split('-').map(Number);
                if (selectedRow !== rowIndex) return;
                if (selectedColumn === 0) nextStudent.name = '';
                if (selectedColumn >= 1) {
                    const subject = newGradeSubjects[selectedColumn - 1];
                    if (subject) nextStudent.scores[subject] = '';
                }
            });
            return nextStudent;
        }));
        setSelectedGradeCells([]);
        setGradeSelectionAnchor(null);
        setIsDraggingGradeCells(false);
    };
    useEffect(() => {
        if (gradePageMode !== 'create' || selectedGradeCells.length === 0) return;
        const handleDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Backspace' && event.key !== 'Delete') return;
            event.preventDefault();
            handleClearSelectedGradeCells();
        };
        document.addEventListener('keydown', handleDocumentKeyDown);
        return () => document.removeEventListener('keydown', handleDocumentKeyDown);
    }, [gradePageMode, selectedGradeCells, newGradeSubjects]);

    useEffect(() => {
        if (gradePageMode !== 'create' || selectedGradeCells.length === 0) return;
        const handleDocumentCopy = (event: ClipboardEvent) => {
            const positions = selectedGradeCells.map(cellKey => {
                const [row, column] = cellKey.split('-').map(Number);
                return { row, column };
            });
            const rowStart = Math.min(...positions.map(item => item.row));
            const rowEnd = Math.max(...positions.map(item => item.row));
            const columnStart = Math.min(...positions.map(item => item.column));
            const columnEnd = Math.max(...positions.map(item => item.column));
            const copiedRows: string[] = [];
            for (let row = rowStart; row <= rowEnd; row += 1) {
                const copiedCells: string[] = [];
                for (let column = columnStart; column <= columnEnd; column += 1) {
                    copiedCells.push(selectedGradeCellSet.has(getGradeCellKey(row, column)) ? getGradeCellValue(newGradeStudents[row], column) : '');
                }
                copiedRows.push(copiedCells.join('\t'));
            }
            event.preventDefault();
            event.clipboardData?.setData('text/plain', copiedRows.join('\n'));
        };
        const handleDocumentPaste = (event: ClipboardEvent) => {
            const clipboardText = event.clipboardData?.getData('text/plain') || '';
            if (!clipboardText) return;
            const positions = selectedGradeCells.map(cellKey => {
                const [row, column] = cellKey.split('-').map(Number);
                return { row, column };
            });
            event.preventDefault();
            pasteGradeCellsAt(
                Math.min(...positions.map(item => item.row)),
                Math.min(...positions.map(item => item.column)),
                parseGradeClipboard(clipboardText)
            );
        };
        document.addEventListener('copy', handleDocumentCopy);
        document.addEventListener('paste', handleDocumentPaste);
        return () => {
            document.removeEventListener('copy', handleDocumentCopy);
            document.removeEventListener('paste', handleDocumentPaste);
        };
    }, [gradePageMode, selectedGradeCells, newGradeStudents, newGradeSubjects]);

    const handlePasteGradeTable = (studentIndex: number, columnIndex: number, event: React.ClipboardEvent<HTMLInputElement>) => {
        const clipboardText = event.clipboardData.getData('text');
        if (!clipboardText) return;
        const cells = parseGradeClipboard(clipboardText);
        if (cells.length <= 1 && cells[0]?.length <= 1) return;
        event.preventDefault();
        pasteGradeCellsAt(studentIndex, columnIndex, cells);
    };
    const focusGradeCell = (rowIndex: number, columnIndex: number) => {
        const nextInput = document.querySelector<HTMLInputElement>(`[data-grade-cell="${rowIndex}-${columnIndex}"]`);
        nextInput?.focus();
        nextInput?.select();
    };
    const handleGradeCellKeyDown = (rowIndex: number, columnIndex: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        const maxRowIndex = newGradeStudents.length - 1;
        const maxColumnIndex = newGradeSubjects.length;
        if ((event.key === 'Backspace' || event.key === 'Delete') && selectedGradeCells.length > 0) {
            event.preventDefault();
            handleClearSelectedGradeCells();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            focusGradeCell(Math.min(rowIndex + 1, maxRowIndex), columnIndex);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusGradeCell(Math.min(rowIndex + 1, maxRowIndex), columnIndex);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusGradeCell(Math.max(rowIndex - 1, 0), columnIndex);
        } else if (event.key === 'ArrowRight' && event.currentTarget.selectionStart === event.currentTarget.value.length) {
            event.preventDefault();
            focusGradeCell(rowIndex, Math.min(columnIndex + 1, maxColumnIndex));
        } else if (event.key === 'ArrowLeft' && event.currentTarget.selectionStart === 0) {
            event.preventDefault();
            focusGradeCell(rowIndex, Math.max(columnIndex - 1, 0));
        }
    };
    const handleDropGradeSubject = (targetSubject: string) => {
        if (!draggedGradeSubject || draggedGradeSubject === targetSubject) return;
        setNewGradeSubjects(subjects => {
            const nextSubjects = [...subjects];
            const fromIndex = nextSubjects.indexOf(draggedGradeSubject);
            const toIndex = nextSubjects.indexOf(targetSubject);
            if (fromIndex < 0 || toIndex < 0) return subjects;
            const [movedSubject] = nextSubjects.splice(fromIndex, 1);
            nextSubjects.splice(toIndex, 0, movedSubject);
            return nextSubjects;
        });
        setDraggedGradeSubject(null);
    };
    const handleFillGradeColumn = (subject: string) => {
        const value = (gradeColumnFillValues[subject] || '').trim();
        if (!value) {
            window.alert(`请先输入${subject}要统一填充的等级或内容。`);
            return;
        }
        updateActiveGradeStudents(students => {
            const source = students.length > 0 ? students : [createBlankGradeStudent(newGradeSubjects, 'manual-1')];
            return source.map(student => ({
                ...student,
                scores: { ...student.scores, [subject]: value }
            }));
        });
    };
    const handleSaveGradeExam = () => {
        const selectedClasses = gradePageMode === 'edit' && newGradeClass ? [newGradeClass] : newGradeClasses;
        const classStudentsMap = {
            ...gradeStudentsByClass,
            ...(activeGradeClassSheet ? { [activeGradeClassSheet]: newGradeStudents } : {})
        };
        const hasStudentInfo = selectedClasses.every(className => (
            (classStudentsMap[className] || []).some(student => student.name.trim())
        ));
        if (!newGradeTerm || !newGradeExamType || selectedClasses.length === 0 || newGradeSubjects.length === 0 || !hasStudentInfo) {
            window.alert('请补全学年-学期、考试类型、班级、科目，并确保每个班级 sheet 至少填写一名学生姓名。');
            return;
        }
        if (newGradeExamType === '月考' && !newGradeExamMonth) {
            window.alert('请补全月考月份。');
            return;
        }
        if (gradePageMode === 'edit' && selectedGradeExam) {
            const editClassName = selectedClasses[0];
            const editStudents = classStudentsMap[editClassName] || newGradeStudents;
            const updatedRow: GradeExamRow = {
                ...selectedGradeExam,
                term: newGradeTerm,
                type: newGradeExamType,
                month: newGradeExamType === '月考' ? newGradeExamMonth : undefined,
                subjects: newGradeSubjects,
                className: editClassName
            };
            setGradeExamRows(prev => prev.map(row => row.id === selectedGradeExam.id ? updatedRow : row));
            setGradeExamScoresMap(prev => ({
                ...prev,
                [selectedGradeExam.id]: editStudents
            }));
            window.alert('修改的考试记录已保存。');
        } else {
            const now = Date.now();
            const newRows = selectedClasses.map((className, index) => ({
                id: now + index,
                term: newGradeTerm,
                type: newGradeExamType,
                month: newGradeExamType === '月考' ? newGradeExamMonth : undefined,
                subjects: newGradeSubjects,
                className,
                creator: '林萧'
            }));
            setGradeExamRows(prev => [...newRows, ...prev]);
            setGradeExamScoresMap(prev => {
                const nextMap = { ...prev };
                newRows.forEach(row => {
                    nextMap[row.id] = classStudentsMap[row.className] || buildEmptyGradeRowsForClass(row.className);
                });
                return nextMap;
            });
            window.alert('考试记录已保存到当前 demo 列表。');
        }
        setGradeTermFilter('全部学期');
        setGradeExamTypeFilter('全部类型');
        setGradeCreatorSearch('');
        resetGradeCreateForm();
        setGradePageMode('list');
    };

    const escapeGradeExcelXml = (value: string | number) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const sanitizeGradeExcelSheetName = (name: string) => {
        const safeName = name.replace(/[\\/?*[\]:]/g, '-').trim() || '成绩表';
        return safeName.slice(0, 31);
    };

    const exportGradeScoreExcel = (fileName: string, sheets: { name: string; headers: string[]; rows: (string | number)[][] }[]) => {
        if (sheets.length === 0 || sheets.every(sheet => sheet.headers.length === 0)) {
            window.alert('没有数据可导出。');
            return;
        }
        const worksheetXml = sheets.map(sheet => {
            const rowsXml = [sheet.headers, ...sheet.rows].map(row => (
                `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeGradeExcelXml(cell)}</Data></Cell>`).join('')}</Row>`
            )).join('');
            return `<Worksheet ss:Name="${escapeGradeExcelXml(sanitizeGradeExcelSheetName(sheet.name))}"><Table>${rowsXml}</Table></Worksheet>`;
        }).join('');
        const excelXml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${worksheetXml}</Workbook>`;
        const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = () => {
        if (!activeGradeClassSheet) {
            window.alert('没有数据可导出。');
            return;
        }
        exportGradeScoreExcel(`${newGradeTerm}_${newGradeExamType}_${activeGradeClassSheet}_成绩表.xls`, [{
            name: activeGradeClassSheet,
            headers: ['序号', '姓名', ...newGradeSubjects],
            rows: newGradeStudents.map((student, index) => [
                index + 1,
                student.name,
                ...newGradeSubjects.map(subject => student.scores[subject] || '')
            ])
        }]);
    };

    const handleExportGradeLevelExcel = (level: string, rows: GradeExamRow[]) => {
        const sortedRows = [...rows].sort((a, b) => a.className.localeCompare(b.className, 'zh-Hans'));
        const subjects = Array.from(new Set(sortedRows.flatMap(row => row.subjects)));
        const hasExportStudents = sortedRows.some(row => (gradeStudentsByClass[row.className] || gradeExamScoresMap[row.id] || []).length > 0);
        if (!hasExportStudents) {
            window.alert('没有数据可导出。');
            return;
        }
        exportGradeScoreExcel(`${newGradeTerm}_${newGradeExamType}_${formatGradeLevelLabel(level)}_成绩表.xls`, sortedRows.map(row => ({
            name: row.className,
            headers: ['序号', '姓名', ...subjects],
            rows: (gradeStudentsByClass[row.className] || gradeExamScoresMap[row.id] || []).map((student, index) => [
                index + 1,
                student.name,
                ...subjects.map(subject => student.scores[subject] || '')
            ])
        })));
    };

    const getGradeClassProgress = (className: string) => {
        const students = className === activeGradeClassSheet
            ? newGradeStudents
            : (gradeStudentsByClass[className] || []);
        const total = students.length;
        if (total === 0 || newGradeSubjects.length === 0) {
            return { completed: 0, total, isComplete: false };
        }
        const completed = students.filter(student => (
            newGradeSubjects.every(subject => (student.scores[subject] || '').trim())
        )).length;
        return { completed, total, isComplete: completed === total };
    };

    const gradeClassProgressRows = newGradeClasses.map(className => ({
        className,
        ...getGradeClassProgress(className)
    }));
    const completedGradeStudentCount = gradeClassProgressRows.reduce((sum, row) => sum + row.completed, 0);
    const totalGradeStudentCount = gradeClassProgressRows.reduce((sum, row) => sum + row.total, 0);
    const gradeOverallProgressPercent = totalGradeStudentCount > 0
        ? Math.round((completedGradeStudentCount / totalGradeStudentCount) * 100)
        : 0;

    // 作业数据 demo 数据：按日期、班级、科目记录本班学生作业完成情况。
    const homeworkStatusOptions = ['优', '良', '合格', '待合格', '未交'];
    const homeworkStatusColorClassMap: Record<string, string> = {
        '优': 'bg-[#EAF8EF] text-[#16A34A]',
        '良': 'bg-[#EAF2FF] text-[#2563EB]',
        '合格': 'bg-[#EAF7F6] text-[#0F766E]',
        '待合格': 'bg-[#FFF7E6] text-[#D97706]',
        '未交': 'bg-[#FFF1F0] text-[#F53F3F]'
    };
    const getHomeworkStatusColorClass = (value: string) => homeworkStatusColorClassMap[value.trim()] || 'bg-white text-[#1D2129]';
    const [homeworkDateFilter, setHomeworkDateFilter] = useState('');
    const [homeworkClassFilter, setHomeworkClassFilter] = useState('');
    const [homeworkSubjectFilter, setHomeworkSubjectFilter] = useState('全部科目');
    const [homeworkCreatorSearch, setHomeworkCreatorSearch] = useState('');
    const [homeworkPageMode, setHomeworkPageMode] = useState<'list' | 'create' | 'view' | 'edit'>('list');
    const [selectedHomeworkRecord, setSelectedHomeworkRecord] = useState<HomeworkRecordRow | null>(null);
    const [newHomeworkDate, setNewHomeworkDate] = useState('2026-05-22');
    const [newHomeworkLevel, setNewHomeworkLevel] = useState('');
    const [newHomeworkClass, setNewHomeworkClass] = useState('');
    const [newHomeworkClasses, setNewHomeworkClasses] = useState<string[]>([]);
    const [activeHomeworkClassSheet, setActiveHomeworkClassSheet] = useState('');
    const [homeworkStudentsByClass, setHomeworkStudentsByClass] = useState<Record<string, HomeworkStudentRow[]>>({});
    const [homeworkColumnFillStatus, setHomeworkColumnFillStatus] = useState('');
    const [newHomeworkSubject, setNewHomeworkSubject] = useState('');
    const [newHomeworkName, setNewHomeworkName] = useState('');
    const [newHomeworkStudents, setNewHomeworkStudents] = useState<HomeworkStudentRow[]>([]);
    const [homeworkBatchStatus, setHomeworkBatchStatus] = useState('');
    const buildMockHomeworkStudents = (className: string, seed = 0): HomeworkStudentRow[] => {
        const names = ['林一诺', '周明轩', '陈雨桐', '李思远', '王若溪', '赵子涵', '吴昊然', '郑可欣', '孙嘉泽', '黄芷晴', '何宇航', '郭诗涵', '马梓豪', '罗语晨', '胡安琪', '高铭宇'];
        const levelNumber = className.match(/^(\d+)级/)?.[1] || '2025';
        const classNumber = className.match(/(\d+)班/)?.[1] || '1';
        return names.map((name, index) => ({
            id: `${className}-homework-${index + 1}`,
            studentNo: `${levelNumber}${classNumber.padStart(2, '0')}${(index + 1).toString().padStart(2, '0')}`,
            name,
            status: homeworkStatusOptions[(index + seed) % homeworkStatusOptions.length]
        }));
    };
    const buildHomeworkStudentsWithNames = (className: string): HomeworkStudentRow[] => (
        buildMockHomeworkStudents(className).map(student => ({ ...student, status: '' }))
    );
    const buildBlankHomeworkStudents = (className: string): HomeworkStudentRow[] => (
        buildMockHomeworkStudents(className).map(student => ({ ...student, studentNo: '', name: '', status: '' }))
    );
    const [homeworkRows, setHomeworkRows] = useState<HomeworkRecordRow[]>([
        { id: 1, date: '2026-05-22', subject: '语文', name: '阅读理解', className: '2023级4班', creator: '林萧', updatedAt: '2026-05-22 16:30', students: buildMockHomeworkStudents('2023级4班', 0) },
        { id: 2, date: '2026-05-21', subject: '数学', name: '分数应用题', className: '2023级4班', creator: '林萧', updatedAt: '2026-05-21 16:45', students: buildMockHomeworkStudents('2023级4班', 1) },
        { id: 3, date: '2026-05-21', subject: '英语', name: '', className: '2024级2班', creator: '周峰', updatedAt: '2026-05-21 17:10', students: buildMockHomeworkStudents('2024级2班', 2) }
    ]);
    const homeworkSubjects = Array.from(new Set([...gradeSubjectOptions, ...homeworkRows.map(row => row.subject)]));
    const filteredHomeworkRows = homeworkRows.filter(row => {
        if (homeworkDateFilter && row.date !== homeworkDateFilter) return false;
        if (homeworkClassFilter && row.className !== homeworkClassFilter) return false;
        if (homeworkSubjectFilter !== '全部科目' && row.subject !== homeworkSubjectFilter) return false;
        const keyword = homeworkCreatorSearch.trim();
        if (keyword && !row.creator.includes(keyword)) return false;
        return true;
    });
    const homeworkClassFilterPath = homeworkClassFilter
        ? [getGradeLevelFromClassName(homeworkClassFilter), homeworkClassFilter]
        : undefined;
    const resetHomeworkListFilters = () => {
        setHomeworkDateFilter('');
        setHomeworkClassFilter('');
        setHomeworkSubjectFilter('全部科目');
        setHomeworkCreatorSearch('');
    };
    const homeworkTableColumns = [
        { title: '作业日期', dataIndex: 'date', width: 120 },
        { title: '班级', dataIndex: 'className', width: 120 },
        { title: '科目', dataIndex: 'subject', width: 120 },
        {
            title: '作业名称',
            dataIndex: 'name',
            width: 160,
            render: (value: string) => value || '-'
        },
        { title: '录入人', dataIndex: 'creator', width: 120 },
        { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 128,
            align: 'right' as const,
            render: (_: unknown, row: HomeworkRecordRow) => (
                <div className="flex justify-end gap-4">
                    <Button type="text" size="small" className="!px-0" onClick={() => handleViewHomeworkRecord(row)}>查看</Button>
                    <Button type="text" size="small" className="!px-0" onClick={() => handleEditHomeworkRecord(row)}>编辑</Button>
                </div>
            )
        }
    ];
    const getHomeworkClassProgress = (className: string) => {
        const students = className === activeHomeworkClassSheet
            ? newHomeworkStudents
            : (homeworkStudentsByClass[className] || []);
        const total = students.length;
        const completed = students.filter(student => student.status.trim()).length;
        return { completed, total, isComplete: total > 0 && completed === total };
    };
    const homeworkClassProgressRows = newHomeworkClasses.map(className => ({
        className,
        ...getHomeworkClassProgress(className)
    }));
    const completedHomeworkStudentCount = homeworkClassProgressRows.reduce((sum, row) => sum + row.completed, 0);
    const totalHomeworkStudentCount = homeworkClassProgressRows.reduce((sum, row) => sum + row.total, 0);
    const homeworkProgressPercent = totalHomeworkStudentCount > 0
        ? Math.round((completedHomeworkStudentCount / totalHomeworkStudentCount) * 100)
        : 0;
    const homeworkStatusCounts = homeworkStatusOptions.reduce<Record<string, number>>((counts, status) => {
        const activeStudents = activeHomeworkClassSheet ? (homeworkStudentsByClass[activeHomeworkClassSheet] || newHomeworkStudents) : newHomeworkStudents;
        counts[status] = activeStudents.filter(student => student.status === status).length;
        return counts;
    }, {});
    const resetHomeworkForm = () => {
        setNewHomeworkDate('2026-05-22');
        setNewHomeworkLevel('');
        setNewHomeworkClass('');
        setNewHomeworkClasses([]);
        setActiveHomeworkClassSheet('');
        setHomeworkStudentsByClass({});
        setNewHomeworkSubject('');
        setNewHomeworkName('');
        setNewHomeworkStudents([]);
        setHomeworkBatchStatus('');
        setHomeworkColumnFillStatus('');
    };
    const openHomeworkCreatePage = () => {
        resetHomeworkForm();
        setSelectedHomeworkRecord(null);
        setHomeworkPageMode('create');
    };
    const handleViewHomeworkRecord = (record: HomeworkRecordRow) => {
        setSelectedHomeworkRecord(record);
        setNewHomeworkDate(record.date);
        setNewHomeworkSubject(record.subject);
        setNewHomeworkName(record.name === '-' ? '' : record.name);
        setNewHomeworkClass(record.className);
        setNewHomeworkClasses([record.className]);
        setActiveHomeworkClassSheet(record.className);
        setNewHomeworkLevel(getGradeLevelFromClassName(record.className));
        setNewHomeworkStudents(record.students);
        setHomeworkStudentsByClass({ [record.className]: record.students });
        setHomeworkBatchStatus('');
        setHomeworkPageMode('view');
    };
    const handleEditHomeworkRecord = (record: HomeworkRecordRow) => {
        handleViewHomeworkRecord(record);
        setHomeworkPageMode('edit');
    };
    const syncActiveHomeworkStudents = (className: string, students: HomeworkStudentRow[]) => {
        setNewHomeworkStudents(students);
        if (!className) return;
        setHomeworkStudentsByClass(prev => ({ ...prev, [className]: students }));
    };
    const updateActiveHomeworkStudents = (updater: (students: HomeworkStudentRow[]) => HomeworkStudentRow[]) => {
        setNewHomeworkStudents(prevStudents => {
            const nextStudents = updater(prevStudents);
            if (activeHomeworkClassSheet) {
                setHomeworkStudentsByClass(prev => ({ ...prev, [activeHomeworkClassSheet]: nextStudents }));
            }
            return nextStudents;
        });
    };
    const handleSwitchHomeworkClassSheet = (className: string) => {
        setNewHomeworkClass(className);
        setActiveHomeworkClassSheet(className);
        setNewHomeworkStudents(homeworkStudentsByClass[className] || buildBlankHomeworkStudents(className));
    };
    const handleToggleHomeworkClass = (className: string) => {
        if (!className || homeworkPageMode === 'view') return;
        setNewHomeworkClasses(prevClasses => {
            if (prevClasses.includes(className)) {
                const nextClasses = prevClasses.filter(item => item !== className);
                setHomeworkStudentsByClass(prevMap => {
                    const nextMap = { ...prevMap };
                    delete nextMap[className];
                    return nextMap;
                });
                if (activeHomeworkClassSheet === className) {
                    const nextActiveClass = nextClasses[0] || '';
                    setActiveHomeworkClassSheet(nextActiveClass);
                    setNewHomeworkClass(nextActiveClass);
                    setNewHomeworkStudents(nextActiveClass ? (homeworkStudentsByClass[nextActiveClass] || buildBlankHomeworkStudents(nextActiveClass)) : []);
                }
                return nextClasses;
            }

            const nextClasses = [...prevClasses, className];
            const classStudents = homeworkStudentsByClass[className] || buildBlankHomeworkStudents(className);
            setHomeworkStudentsByClass(prevMap => ({ ...prevMap, [className]: prevMap[className] || classStudents }));
            if (!activeHomeworkClassSheet) {
                setActiveHomeworkClassSheet(className);
                setNewHomeworkClass(className);
                setNewHomeworkStudents(classStudents);
            }
            return nextClasses;
        });
    };
    const handleSelectHomeworkClass = (className: string) => {
        handleToggleHomeworkClass(className);
    };
    const handleFillHomeworkStudents = () => {
        if (!activeHomeworkClassSheet) {
            window.alert('请先选择班级。');
            return;
        }
        syncActiveHomeworkStudents(activeHomeworkClassSheet, buildHomeworkStudentsWithNames(activeHomeworkClassSheet));
    };
    const handleChangeHomeworkName = (studentId: string, value: string) => {
        updateActiveHomeworkStudents(students => students.map(student => (
            student.id === studentId ? { ...student, name: value } : student
        )));
    };
    const handleChangeHomeworkStatus = (studentId: string, status: string) => {
        updateActiveHomeworkStudents(students => students.map(student => (
            student.id === studentId ? { ...student, status } : student
        )));
    };
    const handleBatchSetHomeworkStatus = () => {
        const value = (homeworkColumnFillStatus || homeworkBatchStatus).trim();
        if (!value) {
            window.alert('请先选择要批量设置的作业完成情况。');
            return;
        }
        updateActiveHomeworkStudents(students => students.map(student => ({ ...student, status: value })));
    };
    const handleSaveHomeworkRecord = () => {
        const selectedClasses = newHomeworkClasses;
        const classStudentsMap = {
            ...homeworkStudentsByClass,
            ...(activeHomeworkClassSheet ? { [activeHomeworkClassSheet]: newHomeworkStudents } : {})
        };
        const hasStudentInfo = selectedClasses.every(className => (
            (classStudentsMap[className] || []).some(student => student.name.trim())
        ));
        if (!newHomeworkDate || selectedClasses.length === 0 || !newHomeworkSubject || !hasStudentInfo) {
            window.alert('请补全日期、班级、科目，并确保每个班级 sheet 至少填写一名学生。作业名称可不填写。');
            return;
        }
        const now = Date.now();
        const rowsPayload = selectedClasses.map((className, index) => ({
            id: homeworkPageMode === 'edit' && selectedHomeworkRecord && index === 0 ? selectedHomeworkRecord.id : now + index,
            date: newHomeworkDate,
            subject: newHomeworkSubject,
            name: newHomeworkName.trim() || '-',
            className,
            creator: index === 0 ? (selectedHomeworkRecord?.creator || '林萧') : '林萧',
            updatedAt: `${newHomeworkDate} 17:00`,
            students: classStudentsMap[className] || buildBlankHomeworkStudents(className)
        }));
        setHomeworkRows(rows => {
            if (homeworkPageMode === 'edit' && selectedHomeworkRecord) {
                const extraRows = rowsPayload.slice(1);
                return [...extraRows, ...rows.map(row => row.id === selectedHomeworkRecord.id ? rowsPayload[0] : row)];
            }
            return [...rowsPayload, ...rows];
        });
        setHomeworkDateFilter('');
        setHomeworkClassFilter('');
        setHomeworkSubjectFilter('全部科目');
        setHomeworkCreatorSearch('');
        resetHomeworkForm();
        setSelectedHomeworkRecord(null);
        setHomeworkPageMode('list');
        window.alert('作业记录已保存到当前 demo 列表。');
    };



    const gradeScoreStatisticColumns = Array.from(new Set(newGradeStudents.flatMap(student => (
        newGradeSubjects.map(subject => (student.scores[subject] || '').trim()).filter(Boolean)
    )))).sort((a, b) => {
        const presetOrder = examLevelOptions.map(option => option.name);
        const presetIndexA = presetOrder.indexOf(a);
        const presetIndexB = presetOrder.indexOf(b);
        if (presetIndexA !== -1 || presetIndexB !== -1) {
            return (presetIndexA === -1 ? Number.MAX_SAFE_INTEGER : presetIndexA) - (presetIndexB === -1 ? Number.MAX_SAFE_INTEGER : presetIndexB);
        }
        return a.localeCompare(b, 'zh-Hans');
    });
    const gradeScoreStatisticRows = newGradeSubjects.map(subject => {
        const counts = gradeScoreStatisticColumns.reduce<Record<string, number>>((result, option) => {
            result[option] = 0;
            return result;
        }, {});
        newGradeStudents.forEach(student => {
            const hasStudentRecord = Boolean(student.name.trim() || Object.values(student.scores).some(score => score.trim()));
            if (!hasStudentRecord) return;

            const score = (student.scores[subject] || '').trim();
            if (score && score in counts) {
                counts[score] += 1;
            }
        });

        return { subject, counts };
    });

    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleModalMode, setRoleModalMode] = useState<'create' | 'editName' | 'config'>('create');
    const [assignRole, setAssignRole] = useState<any>(null);
    const [roleConfigTab, setRoleConfigTab] = useState<'feature' | 'data'>('feature');
    const [expandedPermissionMenus, setExpandedPermissionMenus] = useState<Record<string, boolean>>({ '报表中心': true, '货柜机配置中心': true, '基础信息配置': true });
    const [selectedPermissionValues, setSelectedPermissionValues] = useState<string[]>([]);
    const [assignSearch, setAssignSearch] = useState('');
    const [assignedTeacherPhones, setAssignedTeacherPhones] = useState<string[]>([]);
    const [assignedPage, setAssignedPage] = useState(1);
    const [assignSearchResults, setAssignSearchResults] = useState<any[]>([]);
    const [assignSearchPage, setAssignSearchPage] = useState(1);
    const assignPageSize = 5;
    const [roleRows, setRoleRows] = useState([
        {
            name: '系统管理员',
            type: '默认',
            users: 1,
            featureScope: '全部功能',
            dataPolicy: '全校数据',
            status: '启用',
            deletable: false,
            desc: '负责教师账号、角色、设备与基础配置'
        },
        {
            name: '学校高层',
            type: '默认',
            users: 1,
            featureScope: '报表中心、学校驾驶舱、学校驾驶舱-查看、学校驾驶舱-导出、评价记录明细表、评价记录明细表-查看、评价记录明细表-导出',
            dataPolicy: '全校数据',
            status: '启用',
            deletable: false,
            desc: '用于校级经营与使用数据查看'
        },
        {
            name: '教师',
            type: '默认',
            users: 48,
            featureScope: '货柜机配置中心、货币发放管理、货币发放管理-查看、历次发币记录、历次发币记录-查看、基础信息配置、学生管理、学生管理-查看',
            dataPolicy: '任教与管理范围',
            status: '启用',
            deletable: false,
            desc: '普通教师与年级组长共用功能'
        }
    ]);

    const permissionTree = menus.map(menu => ({
        menu: menu.title,
        pages: menu.children.map(page => ({
            page,
            buttons: ['查看', '新增', '编辑', '删除', '导出']
        }))
    }));

    const teacherAccounts = [
        { name: '郭老师', phone: '13800000000', dept: '教务处', role: '系统管理员' },
        { name: '王校长', phone: '13800000001', dept: '校长室', role: '学校高层' },
        { name: '张三', phone: '13800000002', dept: '体育组', role: '教师' },
        { name: '李四', phone: '13800000003', dept: '学生发展中心', role: '教师' },
        { name: '周老师', phone: '13800000004', dept: '语文组', role: '教师' }
    ];

    const allPermissionValues = permissionTree.flatMap(menu => [
        menu.menu,
        ...menu.pages.flatMap(page => [page.page, ...page.buttons.map(button => `${page.page}-${button}`)])
    ]);

    const getMenuValues = (menu: typeof permissionTree[number]) => [
        menu.menu,
        ...menu.pages.flatMap(page => [page.page, ...page.buttons.map(button => `${page.page}-${button}`)])
    ];

    const getPageValues = (page: typeof permissionTree[number]['pages'][number]) => [
        page.page,
        ...page.buttons.map(button => `${page.page}-${button}`)
    ];

    const togglePermissionValues = (values: string[], checked: boolean) => {
        setSelectedPermissionValues(prev => checked ? Array.from(new Set([...prev, ...values])) : prev.filter(item => !values.includes(item)));
    };

    const formatFeatureScope = (featureScope: string) => {
        if (!featureScope || featureScope === '未配置') return '未配置';
        const pageNames = permissionTree.flatMap(menu => menu.pages.map(page => page.page));
        const values = featureScope === '全部功能' ? allPermissionValues : featureScope.split('、').filter(Boolean);
        const selectedPages = pageNames.filter(page => values.includes(page) || values.some(value => value.startsWith(`${page}-`)));
        if (selectedPages.length === 0) return featureScope === '全部功能' ? '全部功能' : '未配置页面';
        const previewPages = selectedPages.slice(0, 5).join('、');
        return selectedPages.length > 5 ? `${previewPages} 等 ${selectedPages.length} 个页面` : previewPages;
    };

    const handleOpenRoleModal = (role: any = null, mode: 'create' | 'editName' | 'config' = role ? 'editName' : 'create') => {
        setEditingRole(role);
        setRoleModalMode(mode);
        setRoleConfigTab('feature');
        if (mode === 'config') {
            setSelectedPermissionValues(role?.featureScope === '全部功能' ? allPermissionValues : (role?.featureScope || '').split('、').filter(Boolean));
        } else if (mode === 'create') {
            setSelectedPermissionValues([]);
        }
        setRoleModalOpen(true);
    };

    const handleSaveRole = (roleData: any) => {
        if (editingRole) {
            setRoleRows(roleRows.map(role => role.name === editingRole.name ? { ...role, ...roleData } : role));
        } else {
            setRoleRows([{ ...roleData, type: '自定义', users: 0, status: roleData.status || '启用', deletable: true, desc: '' }, ...roleRows]);
        }
        setRoleModalOpen(false);
        setEditingRole(null);
    };

    const handleToggleRoleStatus = (roleName: string) => {
        const targetRole = roleRows.find(role => role.name === roleName);
        if (!targetRole || targetRole.type === '默认') return;
        if (targetRole.status === '启用' && targetRole.users > 0) {
            const confirmed = window.confirm(`该角色已分配给 ${targetRole.users} 名教师。禁用后，这些教师将暂时失去该角色对应权限。是否继续？`);
            if (!confirmed) return;
        }
        setRoleRows(roleRows.map(role => role.name === roleName ? { ...role, status: role.status === '启用' ? '禁用' : '启用' } : role));
    };

    const handleDeleteRole = (roleName: string) => {
        const targetRole = roleRows.find(role => role.name === roleName);
        if (!targetRole || targetRole.type === '默认' || targetRole.users > 0) return;
        setRoleRows(roleRows.filter(role => role.name !== roleName));
    };

    const handleOpenAssignRole = (role: any) => {
        setAssignRole(role);
        setAssignSearch('');
        setAssignedPage(1);
        setAssignSearchPage(1);
        setAssignSearchResults([]);
        setAssignedTeacherPhones(teacherAccounts.filter(teacher => teacher.role === role.name).map(teacher => teacher.phone));
    };

    const handleSearchAssignableTeachers = () => {
        const keyword = assignSearch.trim();
        setAssignSearchPage(1);
        setAssignSearchResults(teacherAccounts.filter(teacher => {
            if (assignedTeacherPhones.includes(teacher.phone)) return false;
            if (!keyword) return true;
            return [teacher.name, teacher.phone, teacher.dept].some(value => value.includes(keyword));
        }));
    };

    const handleSaveAssignedTeachers = (roleName: string, selectedCount: number) => {
        setRoleRows(roleRows.map(role => role.name === roleName ? { ...role, users: selectedCount } : role));
        setAssignRole(null);
        setAssignSearch('');
        setAssignSearchResults([]);
    };

    // 货柜商品管理状态
    const [shopActiveTab, setShopActiveTab] = useState<'products' | 'channels'>('channels');
    const [shopProducts, setShopProducts] = useState([
        { id: 1, name: '校庆限量徽章', price: 5, icon: '/assets/shop/shop_badge.png' },
        { id: 2, name: '星光书包', price: 150, icon: '/assets/shop/shop_backpack.png' },
        { id: 3, name: '定制刻字钢笔', price: 120, icon: '/assets/shop/shop_pen.png' },
        { id: 4, name: '智能成长笔记本', price: 15, icon: '/assets/shop/shop_notebook.png' },
    ]);
    const [channels, setChannels] = useState(
        Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            type: i < 10 ? '挂钩货道' : i < 20 ? '弹簧货道' : '推杆货道',
            productId: [0, 4, 15, 30].includes(i) ? (i === 0 ? 1 : i === 4 ? 2 : i === 15 ? 3 : 4) : null,
            stock: [0, 4, 15, 30].includes(i) ? (i === 0 ? 3 : i === 15 ? 8 : 10) : 0
        }))
    );
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [editingShopProduct, setEditingShopProduct] = useState<any>(null);
    const [editingChannel, setEditingChannel] = useState<any>(null);
    const [modalIcon, setModalIcon] = useState<string>('');

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [modalDays, setModalDays] = useState(7);
    const [modalRate, setModalRate] = useState(1.0);

    const handleOpenProductModal = (product: any = null) => {
        setEditingProduct(product);
        setModalDays(product?.days || 7);
        setModalRate(product ? parseFloat((product.rate * 100).toFixed(2)) : 1.0);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (productData: any) => {
        if (editingProduct) {
            setBankProducts(bankProducts.map(p => p.id === productData.id ? { ...productData, active: p.active } : p));
        } else {
            setBankProducts([...bankProducts, { ...productData, id: Date.now(), active: true }]);
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleToggleProductStatus = (id: number) => {
        setBankProducts(bankProducts.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const handleOpenShopModal = (product: any = null) => {
        setEditingShopProduct(product);
        setModalIcon(product?.icon || '/assets/c4d_shop.png');
        setIsShopModalOpen(true);
    };

    const handleOpenChannelModal = (channel: any) => {
        setEditingChannel(channel);
        setIsChannelModalOpen(true);
    };

    const handleSaveShopProduct = (productData: any) => {
        if (editingShopProduct) {
            setShopProducts(shopProducts.map(p => p.id === productData.id ? productData : p));
        } else {
            setShopProducts([{ ...productData, id: Date.now() }, ...shopProducts]);
        }
        setIsShopModalOpen(false);
        setEditingShopProduct(null);
    };

    const handleSaveChannel = (channelData: any) => {
        setChannels(channels.map(c => c.id === channelData.id ? channelData : c));
        setIsChannelModalOpen(false);
        setEditingChannel(null);
    };

    const handleDeleteShopProduct = (id: number) => {
        setShopProducts(shopProducts.filter(p => p.id !== id));
        // clear from channels
        setChannels(channels.map(c => c.productId === id ? { ...c, productId: null, stock: 0 } : c));
    };

    return (
        <div className={`${embedded ? 'h-full min-h-0' : 'min-h-screen'} bg-[#f0f2f5] flex font-sans text-slate-800`}>
            {/* 左侧侧边栏 - 极致还原原本菜单样式 */}
            <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0 ${embedded ? 'h-full' : 'h-screen'}`}>
                {embedded ? null : (
                    <div className="h-14 border-b border-slate-200 shrink-0 flex items-center justify-center">
                        <h1 className="text-blue-600 font-bold text-lg tracking-wide">乐途AI智慧教育平台</h1>
                    </div>
                )}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${embedded ? 'pt-2 pb-3' : 'py-4'}`}>
                    {menus.map((menu, idx) => (
                        <div key={idx} className="mb-2">
                            <div
                                className="px-6 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 text-slate-700"
                                onClick={() => toggleMenu(menu.title)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400">{menu.icon}</span>
                                    <span className="font-semibold text-sm">{menu.title}</span>
                                </div>
                                {expandedMenus[menu.title] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                            {expandedMenus[menu.title] && menu.children && (
                                <div className="mt-1">
                                    {menu.children.map((child, cIdx) => (
                                        <div
                                            key={cIdx}
                                            onClick={() => setActiveMenu(child)}
                                            className={`pl-12 pr-6 py-2 text-[13px] cursor-pointer transition-colors ${activeMenu === child
                                                ? 'bg-blue-50 text-blue-600 font-bold border-r-4 border-blue-600'
                                                : 'text-slate-500 hover:text-blue-500'
                                                }`}
                                        >
                                            {child}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* 右侧主体区 */}
            <div className={`flex-1 flex flex-col overflow-hidden ${embedded ? 'h-full min-h-0' : 'h-screen'}`}>
                {/* 顶栏 - 还原样式 */}
                {!embedded && (
                    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-4 text-slate-500 text-[13px]">
                            <Menu size={18} className="cursor-pointer hover:text-blue-600 transition-colors" />
                            <span className="text-slate-200">/</span>
                            <span className="font-semibold text-slate-700">{activeMenuGroup}</span>
                            <span className="text-slate-200">/</span>
                            <span className="font-semibold text-slate-700">{activeMenu}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[13px]">
                            <button
                                onClick={onNavigateBigScreen}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-blue-100"
                            >
                                <Monitor size={16} />
                                <span>进入大屏展示</span>
                            </button>
                            <span className="text-slate-600">欢迎，管理员 [成都七中初中附属小学]</span>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 shadow-sm">
                                <User size={16} />
                            </div>
                        </div>
                    </header>
                )}

                {/* 内容区 - 采用精致的高端设计 */}
                <main className={`flex-1 overflow-y-auto bg-[#f5f7fa] custom-scrollbar ${activeMenu === '考试数据' || activeMenu === '作业数据' || activeMenu === '设备基础配置' || activeMenu === '考试等级管理' || activeMenu === '期末报告配置' ? 'px-0 pt-0 pb-8' : embedded ? 'px-6 pt-4 pb-6' : 'p-8'}`}>

                    {/* 页面主标题 */}
                    {activeMenu !== '考试数据' && activeMenu !== '作业数据' && activeMenu !== '设备基础配置' && activeMenu !== '考试等级管理' && activeMenu !== '期末报告配置' && (
                    <div className={`transform animate-in fade-in slide-in-from-left-4 duration-500 ${activeMenu === '考试数据' ? 'mb-4' : embedded ? 'mb-5' : 'mb-8'}`}>
                        <div>
                            {activeMenu === '考试数据' ? (
                                <div className="mb-2 flex items-center gap-2 font-['PingFang_SC'] text-[14px] font-normal leading-none">
                                    <span className="text-[#AAAAAA]">数据中心</span>
                                    <span className="text-[#AAAAAA]">/</span>
                                    <span className={gradePageMode === 'create' ? 'text-[#AAAAAA]' : 'text-[#333333]'}>考试数据</span>
                                    {gradePageMode === 'create' && (
                                        <>
                                            <span className="text-[#AAAAAA]">/</span>
                                            <span className="text-[#333333]">新建考试</span>
                                        </>
                                    )}
                                </div>
                            ) : embedded && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-1.5">
                                    <span>{activeMenuGroup}</span>
                                    <span>/</span>
                                    <span className="text-slate-500">{activeMenu}</span>
                                </div>
                            )}
                            <h2 className={activeMenu === '考试数据' ? "font-['PingFang_SC'] text-[18px] font-semibold leading-none text-[#333333]" : `${embedded ? 'text-[20px]' : 'text-2xl'} font-[900] text-slate-800 tracking-tight`}>
                                {activeMenu === '考试数据' && gradePageMode === 'create' ? '新建考试' : activeMenu}
                            </h2>
                            {activeMenu !== '考试数据' && <div className="h-1 w-12 bg-blue-600 rounded-full mt-1.5"></div>}
                        </div>
                    </div>
                    )}

                    {/* 货币发放管理 - 增加标签页切换以分离自动模型和手动发币 */}
                    {activeMenu === '货币发放管理' && (
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden transform animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex flex-col gap-6 bg-white shrink-0">
                                {/* 内部 Tab 切换器 */}
                                <div className="flex bg-slate-100 rounded-xl p-1 self-start inline-flex">
                                    <button onClick={() => setIssuanceTab('auto')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${issuanceTab === 'auto' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>自动发放规则</button>
                                    <button onClick={() => setIssuanceTab('manual')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${issuanceTab === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>手动发放</button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                                {/* 自动发币模型配置区域 */}
                                {issuanceTab === 'auto' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
                                        {/* 头部标题区域 */}
                                        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                    <Coins size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">自动发放规则配置</h3>
                                                    <p className="text-slate-500 text-sm mt-1">设置并自动计算各发放池的额度，采用「保底+竞争」双池模型预防通胀</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 表单内容区 */}
                                        <div className="p-8 space-y-10">
                                            {/* 核心设置区段 */}
                                            <div className="space-y-8">

                                                {/* 预算与发币周期设置 */}
                                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
                                                    <div className="flex flex-col gap-5">

                                                        {/* 发币周期选择 */}
                                                        <div className="flex items-center gap-4">
                                                            <label className="text-sm font-semibold text-slate-700 w-24">发币周期</label>
                                                            <div className="flex bg-slate-200/50 p-1 rounded-lg">
                                                                <button
                                                                    onClick={() => setIssueCycle('monthly')}
                                                                    className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${issueCycle === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                                >
                                                                    按月度发放
                                                                </button>
                                                                <button
                                                                    onClick={() => setIssueCycle('weekly')}
                                                                    className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${issueCycle === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                                >
                                                                    按周度发放
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="h-px w-full bg-slate-200"></div>

                                                        {/* 预算输入 */}
                                                        <div className="flex flex-col gap-2 mt-1">
                                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                                班级总预算 <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Base Pool</span>
                                                            </label>
                                                            <div className="flex items-end gap-3 mt-1">
                                                                <div className="relative w-64">
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                                                        <Coins size={20} />
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        value={budgetPool}
                                                                        onChange={(e) => setBudgetPool(Math.max(0, Number(e.target.value)))}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg pl-12 pr-4 py-3 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                                <span className="text-slate-500 font-medium mb-3">校园币 / 班级 / {issueCycle === 'monthly' ? '月' : '周'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 比例分配与自动计算结果 */}
                                                <div className="grid grid-cols-2 gap-6">
                                                    {/* 保底池 */}
                                                    <div className="p-6 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-colors">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div>
                                                                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div> 阳光保底池
                                                                </h4>
                                                                <p className="text-xs text-slate-500 mt-1">保障每位学生的基准参与感</p>
                                                            </div>
                                                            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                                                人均发放
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">分配比例设置</label>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative w-32">
                                                                        <input
                                                                            type="number"
                                                                            value={guaranteedRate}
                                                                            onChange={(e) => {
                                                                                let val = Number(e.target.value);
                                                                                val = Math.max(0, Math.min(100, val));
                                                                                setGuaranteedRate(val);
                                                                                setCompetitiveRate(100 - val);
                                                                            }}
                                                                            className="w-full bg-slate-50 border border-slate-300 rounded-md pr-8 pl-4 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="0" max="100"
                                                                        value={guaranteedRate}
                                                                        onChange={(e) => {
                                                                            const val = Number(e.target.value);
                                                                            setGuaranteedRate(val);
                                                                            setCompetitiveRate(100 - val);
                                                                        }}
                                                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                                                                <span className="text-sm font-medium text-slate-500">本池具体额度:</span>
                                                                <div className="text-right">
                                                                    <span className="text-3xl font-black text-green-600">
                                                                        {Math.floor(budgetPool * (guaranteedRate / 100)).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-slate-400 ml-1">币</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 竞争池 */}
                                                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div>
                                                                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> 荣誉竞争池
                                                                </h4>
                                                                <p className="text-xs text-slate-500 mt-1">用于高分奖励，激发向上动力</p>
                                                            </div>
                                                            <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                                                                排名发放
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">剩余比例 (系统自动计算)</label>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative w-32 opacity-70 cursor-not-allowed">
                                                                        <input
                                                                            type="text"
                                                                            value={competitiveRate}
                                                                            disabled
                                                                            className="w-full bg-slate-100 border border-slate-300 rounded-md pr-8 pl-4 py-2 text-lg font-bold text-slate-600"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                    <div className="w-full h-2 bg-slate-200 rounded-lg overflow-hidden flex">
                                                                        <div className="bg-green-500 h-full transition-all" style={{ width: `${guaranteedRate}%` }}></div>
                                                                        <div className="bg-orange-500 h-full transition-all" style={{ width: `${competitiveRate}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                                                <span className="text-sm font-medium text-slate-500">本池具体额度:</span>
                                                                <div className="text-right">
                                                                    <span className="text-3xl font-black text-orange-500">
                                                                        {Math.floor(budgetPool * (competitiveRate / 100)).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-slate-400 ml-1">币</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* 底部操作栏 */}
                                            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
                                                <button className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                                                    重置为默认
                                                </button>
                                                <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
                                                    保存自动发放规则配置
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 手动定向发放区段 */}
                                {issuanceTab === 'manual' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
                                        <div className="px-8 py-6 border-b border-slate-200 bg-orange-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                                    <Sparkles size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">班级定向校园币发放</h3>
                                                    <p className="text-slate-500 text-sm mt-1">适用于流动红旗、运动会获奖等临时性集体奖励</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* 左侧：选择与计算 */}
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                            1. 选择目标班级
                                                        </label>
                                                        <select
                                                            value={manualClass}
                                                            onChange={(e) => setManualClass(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                                        >
                                                            <option value="" disabled>请选择班级...</option>
                                                            {Object.keys(classData).map(cName => (
                                                                <option key={cName} value={cName}>{cName}</option>
                                                            ))}
                                                        </select>
                                                        {manualClass && (
                                                            <div className="text-xs text-orange-600 font-bold bg-orange-50 w-max px-2.5 py-1 rounded inline-flex items-center gap-1.5 mt-1">
                                                                <Users size={14} /> 当前班级总人数：{selectedClassStudentCount} 人
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                            2. 每人发放数量
                                                        </label>
                                                        <div className="flex items-center gap-3 relative">
                                                            <div className="relative flex-1">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                                    <Coins size={18} />
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    value={manualPerStudent}
                                                                    onChange={(e) => setManualPerStudent(Math.max(0, Number(e.target.value)))}
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-12 pr-4 py-3 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                                                />
                                                            </div>
                                                            <span className="text-slate-500 font-medium whitespace-nowrap">校园币 / 人</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white shadow-md relative overflow-hidden">
                                                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                                            <Coins size={100} />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <div className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">本次发放总计</div>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-4xl font-black">{totalManualIssuance.toLocaleString()}</span>
                                                                <span className="font-medium text-orange-100">校园币</span>
                                                            </div>
                                                            <div className="mt-2 text-xs text-orange-100 opacity-90">
                                                                计算方式: {selectedClassStudentCount} 人 × {manualPerStudent} 币/人
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 右侧：理由与确认 */}
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                            3. 选择发放原因
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['流动红旗', '运动会奖励', '文明班级', '劳动实践优秀'].map(reason => (
                                                                <button
                                                                    key={reason}
                                                                    onClick={() => {
                                                                        setManualReason(reason);
                                                                        setCustomReason('');
                                                                    }}
                                                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${manualReason === reason
                                                                        ? 'bg-orange-50 border-orange-400 text-orange-700 font-bold'
                                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    {reason}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => setManualReason('custom')}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${manualReason === 'custom'
                                                                    ? 'bg-orange-50 border-orange-400 text-orange-700 font-bold'
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                自定义输入
                                                            </button>
                                                        </div>

                                                        {manualReason === 'custom' && (
                                                            <textarea
                                                                value={customReason}
                                                                onChange={(e) => setCustomReason(e.target.value)}
                                                                placeholder="请输入具体奖励事由..."
                                                                rows={3}
                                                                className="w-full mt-3 bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                                            ></textarea>
                                                        )}
                                                    </div>

                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed">
                                                        <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                                                            <AlertCircle size={16} className="text-blue-500" /> 操作提示
                                                        </div>
                                                        发放操作确认后，相应的校园币将实时打入对应班级每位学生的可用余额账户中，并在「成长足迹中心」产生流水记录。此操作无法撤销。
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 底部操作栏 */}
                                            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
                                                <button
                                                    className={`px-8 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 ${manualClass && manualPerStudent > 0
                                                        ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={!manualClass || manualPerStudent <= 0}
                                                    onClick={() => {
                                                        if (!manualClass || manualPerStudent <= 0) return;
                                                        alert(`已成功发放 ${totalManualIssuance} 校园币至 ${manualClass}`);
                                                        setManualClass('');
                                                        setManualPerStudent(0);
                                                    }}
                                                >
                                                    确认确认，立即发放
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 货柜超市管理 */}
                    {activeMenu === '货柜超市管理' && (
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden transform animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                                <div>
                                    <div className="flex bg-slate-100 rounded-xl p-1">
                                        <button onClick={() => setShopActiveTab('channels')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${shopActiveTab === 'channels' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>货道配置 (50)</button>
                                        <button onClick={() => setShopActiveTab('products')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${shopActiveTab === 'products' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>基础商品库</button>
                                    </div>
                                </div>
                                {shopActiveTab === 'products' && (
                                    <div className="flex gap-4 self-start">
                                        <button onClick={() => handleOpenShopModal()} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2">
                                            <Plus size={20} /> 新建商品
                                        </button>
                                    </div>
                                )}
                            </div>

                            {shopActiveTab === 'products' && (
                                <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead>
                                            <tr className="text-slate-400 text-[11px] font-[900] uppercase tracking-[0.15em]">
                                                <th className="py-6 px-10">商品名/SKU</th>
                                                <th className="py-6 px-6">售价 (校园币)</th>
                                                <th className="py-6 px-10 text-right">管理操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {shopProducts.map((item, index) => (
                                                <tr key={item.id} className="active:bg-slate-50 transition-all cursor-pointer border-b border-slate-50 last:border-0">
                                                    <td className="py-6 px-10">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform overflow-hidden">
                                                                {item.icon.includes('http') || item.icon.includes('/') || item.icon.startsWith('data:') ? <img src={item.icon} className="w-full h-full object-cover" alt={item.name} /> : item.icon}
                                                            </div>
                                                            <div>
                                                                <span className="font-black text-slate-800 text-lg block">{item.name}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-6">
                                                        <div className="flex items-center gap-2 font-black text-orange-500 text-xl">
                                                            <Coins size={22} className="text-orange-400" />
                                                            {item.price}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-10 text-right">
                                                        <div className="flex justify-end gap-3 transition-all">
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenShopModal(item); }} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 active:text-blue-600 active:border-blue-200 active:bg-blue-50 shadow-sm transition-colors"><PenTool size={18} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteShopProduct(item.id); }} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 active:text-red-500 active:border-red-200 active:bg-red-50 shadow-sm transition-colors"><Plus size={18} className="transform rotate-45" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {shopProducts.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-20 text-center text-slate-400 font-bold">商品库为空，请先新建商品</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {shopActiveTab === 'channels' && (
                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                                    <p className="text-slate-500 font-bold mb-6 text-sm flex items-center gap-2"><Info size={16} /> 点击对应编号的货道为其配置商品。每个货道最大容量为 10 件。</p>

                                    {[
                                        { title: '挂钩货道', count: 10, offset: 0 },
                                        { title: '弹簧货道', count: 10, offset: 10 },
                                        { title: '推杆货道', count: 30, offset: 20 }
                                    ].map(group => (
                                        <div key={group.title} className="mb-8 last:mb-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                                            <h4 className="text-lg font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <span className="text-sm border-2 border-current rounded-full w-5 h-5 flex items-center justify-center">{group.title[0]}</span>
                                                    </div>
                                                    {group.title} <span className="text-sm text-slate-400 font-bold">({group.offset + 1}-{group.offset + group.count})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setChannels(channels.map((c, idx) => {
                                                            if (idx >= group.offset && idx < group.offset + group.count && c.productId !== null) {
                                                                return { ...c, stock: 10 };
                                                            }
                                                            return c;
                                                        }));
                                                    }}
                                                    className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95 transition-all outline-none text-xs font-bold"
                                                >
                                                    <Database size={12} /> 一键补满本区
                                                </button>
                                            </h4>
                                            <div className="grid grid-cols-5 gap-4">
                                                {channels.slice(group.offset, group.offset + group.count).map((channel) => {
                                                    const product = shopProducts.find(p => p.id === channel.productId);
                                                    return (
                                                        <div
                                                            key={channel.id}
                                                            onClick={() => handleOpenChannelModal(channel)}
                                                            className={`bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-sm active:scale-95 group ${product ? 'border-blue-100 hover:border-blue-300' : 'border-dashed border-slate-200 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-lg font-black text-slate-800">{channel.id}</span>
                                                                </div>
                                                                {product && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${channel.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                                            存: {channel.stock}/10
                                                                        </span>
                                                                        {channel.stock < 10 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setChannels(channels.map(c => c.id === channel.id ? { ...c, stock: 10 } : c));
                                                                                }}
                                                                                className="h-5 px-1.5 flex items-center gap-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all outline-none text-[10px] font-bold"
                                                                                title="一键补满"
                                                                            >
                                                                                <Database size={10} /> 补满
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {product ? (
                                                                <div className="flex items-center gap-3">
                                                                    <img src={product.icon} alt="" className="w-10 h-10 object-contain drop-shadow-sm" />
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-black text-slate-800 truncate">{product.name}</div>
                                                                        <div className="text-orange-500 font-bold text-xs font-[NumberFont] flex items-center gap-0.5"><img src="/assets/coin.png" className="w-[1em] h-[1em]" alt="coin" /> {product.price}</div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-10 flex items-center justify-center text-slate-300 font-bold text-xs group-active:text-slate-400">
                                                                    + 空闲货道
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 历次发币记录 - 任务历史 */}
                    {activeMenu === '历次发币记录' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* 头部标题区域 */}
                            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-600 font-medium tracking-wide">以发放任务（Task）为维度，展示系统历次执行的批量发币记录</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-sm overflow-hidden hover:border-blue-400 focus-within:border-blue-500 focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] transition-all">
                                        <div className="flex items-center px-3 py-1.5 gap-2">
                                            <span className="text-slate-400">
                                                <svg viewBox="64 64 896 896" focusable="false" data-icon="calendar" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>
                                            </span>
                                            <input
                                                type="month"
                                                value={recordFilterMonthStart}
                                                onChange={e => setRecordFilterMonthStart(e.target.value)}
                                                className="text-sm text-slate-700 outline-none bg-transparent w-28 cursor-pointer placeholder:text-slate-300"
                                                placeholder="开始月份"
                                            />
                                            <span className="text-slate-300 px-1">~</span>
                                            <input
                                                type="month"
                                                value={recordFilterMonthEnd}
                                                onChange={e => setRecordFilterMonthEnd(e.target.value)}
                                                className="text-sm text-slate-700 outline-none bg-transparent w-28 cursor-pointer placeholder:text-slate-300"
                                                placeholder="结束月份"
                                            />
                                        </div>
                                    </div>
                                    <select value={recordFilterType} onChange={e => setRecordFilterType(e.target.value)} className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-all">
                                        <option value="全部类型">全部类型</option>
                                        <option value="自动发放">自动发放</option>
                                        <option value="手动发放">手动发放</option>
                                    </select>
                                </div>
                            </div>

                            {/* 报表主体 - 任务列表 */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-[13px]">
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">发币任务</th>
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">类型</th>
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">发币时间</th>
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">发币考核方式</th>
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">发币对象</th>
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">发币标准</th>
                                            <th className="py-4 px-6 border-b border-slate-200 font-normal">发币总量</th>
                                            <th className="py-4 px-6 border-b border-slate-200 text-right font-normal">操作人</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredRecords.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-slate-700">{item.title}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-700">
                                                    {item.type}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-700">{item.time}</td>
                                                <td className="py-4 px-6 text-sm text-slate-700">{item.cycle}</td>
                                                <td className="py-4 px-6 text-sm text-slate-700 truncate max-w-[150px]" title={item.targets}>
                                                    {item.targets}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                                            <Coins size={16} className="text-indigo-400" />
                                                            <span>{item.rateValue} / {item.rateUnit}</span>
                                                        </div>
                                                        {item.rateReason && <div className="text-xs text-slate-400">（原因：{item.rateReason}）</div>}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-slate-700 flex items-center gap-1.5">
                                                        <Coins size={16} className="text-indigo-400" />
                                                        {item.total.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right text-sm text-slate-700">
                                                    {item.operator}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 分页区 */}
                            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-sm text-slate-500">
                                <div>共计 {filteredRecords.length} 条记录</div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 opacity-50 cursor-not-allowed">上一页</button>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded bg-blue-50 text-blue-600">1</button>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 opacity-50 cursor-not-allowed">下一页</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 储蓄银行配置 */}
                    {activeMenu === '储蓄银行配置' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {/* 活期存款配置卡片 */}
                            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 p-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-green-400"></div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        活期存款设置
                                        <span className="bg-green-100 text-green-700 text-[12px] px-2.5 py-1 rounded font-bold tracking-wider">随存随取</span>
                                    </h3>
                                    <p className="text-slate-400 font-bold mt-2 text-sm">设置基础活期日利率</p>
                                </div>
                                <div className="flex flex-col xl:flex-row gap-8 xl:items-end p-2">
                                    <div className="flex items-end gap-6 shrink-0">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-500">活期日利率</label>
                                            <div className="relative w-48">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={currentDailyRate}
                                                    onChange={(e) => setCurrentDailyRate(Number(e.target.value))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-lg font-black text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-500">折合年利率 (约)</label>
                                            <div className="text-2xl font-black text-green-600 pb-2">{(currentDailyRate * 365).toFixed(2)}%</div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col gap-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Info size={16} className="text-blue-500" /> 收益体验试算 <span className="text-slate-400 font-normal">（假设存入 1000 校园币）</span>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一天</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600 flex justify-center items-center gap-0.5"><img src="/assets/coin.png" className="w-[1em] h-[1em] inline" alt="coin" /> {(1000 * (currentDailyRate / 100) * 1).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一周</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600 flex justify-center items-center gap-0.5"><img src="/assets/coin.png" className="w-[1em] h-[1em] inline" alt="coin" /> {(1000 * (currentDailyRate / 100) * 7).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一个月</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600 flex justify-center items-center gap-0.5"><img src="/assets/coin.png" className="w-[1em] h-[1em] inline" alt="coin" /> {(1000 * (currentDailyRate / 100) * 30).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">半年</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600 flex justify-center items-center gap-0.5"><img src="/assets/coin.png" className="w-[1em] h-[1em] inline" alt="coin" /> {(1000 * (currentDailyRate / 100) * 180).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一年</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600 flex justify-center items-center gap-0.5"><img src="/assets/coin.png" className="w-[1em] h-[1em] inline" alt="coin" /> {(1000 * (currentDailyRate / 100) * 365).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 定期存单产品卡片 */}
                            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 p-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Landmark className="text-indigo-500" size={28} /> 定期存单设置</h3>
                                            <p className="text-slate-400 font-bold mt-2 text-sm">管理定期存单的利率、存期等参数</p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenProductModal()}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Plus size={16} /> 添加存单产品
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {bankProducts.map((plan) => (
                                            <div key={plan.id} className={`flex items-center justify-between bg-white border ${plan.active ? 'border-slate-200 shadow-sm hover:shadow-md' : 'border-slate-100 opacity-60 bg-slate-50/50'} rounded-2xl p-5 transition-all relative`}>
                                                {/* 左侧信息 */}
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 ${plan.active ? 'text-indigo-500' : 'text-slate-300'} transition-colors`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                            {plan.label}
                                                            {!plan.active && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded shadow-inner border border-slate-200">进入未展示状态</span>}
                                                        </h5>
                                                        <p className="text-slate-400 text-xs font-bold mt-1">需存满 {plan.days} 天 <span className="mx-2 text-slate-300">|</span> {plan.desc}</p>
                                                    </div>
                                                </div>

                                                {/* 中间信息区 */}
                                                <div className="flex items-center gap-10 mr-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-widest">满期收益率</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className={`text-xl font-black ${plan.active ? 'text-indigo-600' : 'text-slate-500'}`}>{(plan.rate * 100).toFixed(1)}%</span>
                                                            <span className="text-xs text-slate-400 font-bold">
                                                                (年化 {((plan.rate / plan.days) * 365 * 100).toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-widest">起存金额</span>
                                                        <div className="flex items-center gap-1.5 h-7">
                                                            <Coins size={16} className={plan.active ? 'text-orange-400' : 'text-slate-400'} />
                                                            <span className={`text-lg font-black ${plan.active ? 'text-slate-700' : 'text-slate-400'}`}>{plan.min}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex flex-col justify-center px-4 py-2 rounded-xl border ${plan.active ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} min-w-[130px]`}>
                                                        <span className="text-[10px] text-slate-500 font-bold mb-0.5">存1000币收益试算</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={`text-lg font-black ${plan.active ? 'text-emerald-600' : 'text-slate-400'}`}>+</span>
                                                            <img src="/assets/coin.png" className="w-[1em] h-[1em] mb-[1px] opacity-80" alt="coin" />
                                                            <span className={`text-lg font-black ${plan.active ? 'text-emerald-600' : 'text-slate-400'}`}>{parseFloat((1000 * plan.rate).toFixed(2))}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 操作区 */}
                                                <div className="flex gap-3 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleOpenProductModal(plan)}
                                                        className={`px-5 py-2 rounded-xl border border-slate-200 ${plan.active ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white'} font-bold text-sm transition-colors flex items-center justify-center gap-1.5`}
                                                    >
                                                        <PenTool size={14} /> 编辑
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleProductStatus(plan.id)}
                                                        className={`px-5 py-2 rounded-xl font-bold text-sm transition-colors ${plan.active ? 'bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-500' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                    >
                                                        {plan.active ? '不展示(停止新签)' : '重新展示并可签署'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 设备基础配置 */}
                    {activeMenu === '设备基础配置' && (
                        <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                            <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                <span className="hover:text-[#1D2129] cursor-pointer">货柜机配置中心</span>
                                <span className="mx-2 text-[#C9CDD4]">/</span>
                                <span className="text-[#1D2129]">设备基础配置</span>
                            </div>

                            <div className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.02)] flex flex-col">
                                <h2 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129] mb-5">设备基础配置</h2>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="h-[18px] w-[5px] rounded-sm bg-[#165DFF]"></span>
                                    <h3 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129]">品牌及欢迎语</h3>
                                </div>
                                <div className="grid grid-cols-[96px_1fr_96px_1fr] items-center gap-x-4 gap-y-4 mb-6">
                                    <label className="text-sm font-normal leading-[22px] text-[#1D2129]">主标题前缀</label>
                                    <input
                                        value={terminalConfig.mainTitle}
                                        onChange={(e) => setTerminalConfig({ ...terminalConfig, mainTitle: e.target.value })}
                                        className="h-8 rounded border border-[#E5E6EB] bg-white px-3 text-sm font-normal leading-[22px] text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                    />
                                    <label className="text-sm font-normal leading-[22px] text-[#1D2129]">主标题后缀</label>
                                    <input
                                        value={terminalConfig.subTitle}
                                        onChange={(e) => setTerminalConfig({ ...terminalConfig, subTitle: e.target.value })}
                                        className="h-8 rounded border border-[#E5E6EB] bg-white px-3 text-sm font-normal leading-[22px] text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                    />
                                    <label className="self-start pt-[5px] text-sm font-normal leading-[22px] text-[#1D2129]">副标题</label>
                                    <textarea
                                        value={terminalConfig.slogan}
                                        onChange={(e) => setTerminalConfig({ ...terminalConfig, slogan: e.target.value })}
                                        rows={3}
                                        className="col-span-3 min-h-[72px] resize-none rounded border border-[#E5E6EB] bg-white px-3 py-[5px] text-sm font-normal leading-[22px] text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                    />
                                </div>

                                <div className="border-t border-[#F2F3F5] mb-5 w-full"></div>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="h-[18px] w-[5px] rounded-sm bg-[#165DFF]"></span>
                                    <h3 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129]">模块入口文案</h3>
                                </div>
                                <div className="overflow-x-auto border border-[#E5E6EB] rounded mb-6">
                                    <table className="w-full border-collapse text-left text-sm font-normal text-[#4E5969]">
                                        <thead>
                                            <tr className="bg-[#F7F8FA] text-[#1D2129]">
                                                <th className="h-12 px-4 border-b border-[#E5E6EB] font-semibold min-w-[160px]">模块</th>
                                                <th className="h-12 px-4 border-b border-[#E5E6EB] font-semibold min-w-[240px]">模块名称</th>
                                                <th className="h-12 px-4 border-b border-[#E5E6EB] font-semibold min-w-[360px]">描述文案</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { key: 'growth', name: '成长足迹', labelKey: 'growthLabel', descKey: 'growthDesc' },
                                                { key: 'shop', name: '文创超市', labelKey: 'shopLabel', descKey: 'shopDesc' },
                                                { key: 'bank', name: '储蓄银行', labelKey: 'bankLabel', descKey: 'bankDesc' }
                                            ].map((item) => (
                                                <tr key={item.key} className="border-b border-[#F2F3F5] last:border-b-0 hover:bg-[#F2F3F5] transition-colors">
                                                    <td className="h-12 px-4 text-[#1D2129]">{item.name}</td>
                                                    <td className="h-12 px-4">
                                                        <input
                                                            value={terminalConfig[item.labelKey as keyof typeof terminalConfig]}
                                                            onChange={(e) => setTerminalConfig({ ...terminalConfig, [item.labelKey]: e.target.value })}
                                                            className="h-8 w-full rounded border border-[#E5E6EB] bg-white px-3 text-sm font-normal leading-[22px] text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                                        />
                                                    </td>
                                                    <td className="h-12 px-4">
                                                        <input
                                                            value={terminalConfig[item.descKey as keyof typeof terminalConfig]}
                                                            onChange={(e) => setTerminalConfig({ ...terminalConfig, [item.descKey]: e.target.value })}
                                                            className="h-8 w-full rounded border border-[#E5E6EB] bg-white px-3 text-sm font-normal leading-[22px] text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border-t border-[#F2F3F5] mb-5 w-full"></div>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="h-[18px] w-[5px] rounded-sm bg-[#165DFF]"></span>
                                    <h3 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129]">校园币图标</h3>
                                </div>
                                <div className="grid grid-cols-[96px_1fr] items-start gap-x-4 mb-6">
                                    <div className="pt-[5px] text-sm font-normal leading-[22px] text-[#1D2129]">当前图标</div>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: '1', url: '/assets/coin.png', name: '经典铜钱' },
                                            { id: '2', url: '/assets/c4d_growth.png', name: '成长勋章' },
                                            { id: '3', url: '/assets/c4d_shop.png', name: '星光钻' },
                                            { id: '4', url: '/assets/c4d_bank.png', name: '博学水晶' }
                                        ].map(icon => (
                                            <button
                                                key={icon.id}
                                                onClick={() => setTerminalConfig({ ...terminalConfig, coinIconUrl: icon.url })}
                                                className={`h-8 rounded border px-3 text-sm font-normal leading-[22px] transition-all flex items-center gap-2 ${terminalConfig.coinIconUrl === icon.url ? 'border-[#165DFF] bg-[#E8F3FF] text-[#165DFF]' : 'border-[#E5E6EB] bg-white text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF]'}`}
                                            >
                                                <img src={icon.url} alt="" className="h-4 w-4 object-contain" />
                                                {icon.name}
                                                {terminalConfig.coinIconUrl === icon.url && <Check size={14} />}
                                            </button>
                                        ))}
                                        <button className="h-8 rounded border border-dashed border-[#E5E6EB] bg-white px-3 text-sm font-normal leading-[22px] text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] transition-all flex items-center gap-2">
                                            <Upload size={14} />
                                            上传新图标
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-[#F2F3F5] pt-5 flex justify-end gap-2">
                                    <button className="h-8 rounded border border-[#E5E6EB] bg-white px-4 text-sm font-normal text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] transition-all focus:outline-none">
                                        重置为默认
                                    </button>
                                    <button className="ml-3 h-8 rounded border-0 bg-[#165DFF] px-4 text-sm font-normal text-white hover:bg-[#4080FF] active:bg-[#0E42D2] transition-colors focus:outline-none">
                                        保存配置发布到设备
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 角色管理 */}
                    {activeMenu === '角色管理' && (
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden transform animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-3">
                                <div className="relative w-64">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input className="w-full bg-white border border-slate-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="搜索角色" />
                                </div>
                                <select className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" defaultValue="全部类型">
                                    <option>全部类型</option>
                                    <option>默认</option>
                                    <option>自定义</option>
                                </select>
                                <select className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" defaultValue="全部数据权限">
                                    <option>全部数据权限</option>
                                    <option>全校数据</option>
                                    <option>任教与管理范围</option>
                                </select>
                                <select className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" defaultValue="全部状态">
                                    <option>全部状态</option>
                                    <option>启用</option>
                                    <option>禁用</option>
                                </select>
                                <button
                                    onClick={() => handleOpenRoleModal()}
                                    className="ml-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    新增角色
                                </button>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="text-slate-400 text-[11px] font-black tracking-[0.12em] bg-white">
                                            <th className="py-5 px-6">角色名称</th>
                                            <th className="py-5 px-6">角色类型</th>
                                            <th className="py-5 px-6">功能权限</th>
                                            <th className="py-5 px-6">数据权限</th>
                                            <th className="py-5 px-6">已分配</th>
                                            <th className="py-5 px-6">状态</th>
                                            <th className="py-5 px-6 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {roleRows.map(role => (
                                            <tr key={role.name} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-5 px-6">
                                                    <div className="font-black text-slate-800">{role.name}</div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${role.type === '默认' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                        {role.type}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-sm font-bold text-slate-700 whitespace-nowrap">{formatFeatureScope(role.featureScope)}</td>
                                                <td className="py-5 px-6 text-sm font-bold text-slate-600 max-w-[260px]">{role.dataPolicy}</td>
                                                <td className="py-5 px-6 text-sm font-black text-slate-700">{role.users} 人</td>
                                                <td className="py-5 px-6">
                                                    <button
                                                        onClick={() => handleToggleRoleStatus(role.name)}
                                                        disabled={role.type === '默认'}
                                                        className={`relative w-12 h-7 rounded-full transition-all ${role.type === '默认' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${role.status === '启用' ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                        aria-label={`${role.status === '启用' ? '禁用' : '启用'}${role.name}`}
                                                    >
                                                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${role.status === '启用' ? 'left-6' : 'left-1'}`}></span>
                                                    </button>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenRoleModal(role, 'config')}
                                                            disabled={role.name === '系统管理员'}
                                                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${role.name === '系统管理员' ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95'} flex items-center gap-1.5`}
                                                        >
                                                            配置权限
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenAssignRole(role)}
                                                            disabled={role.name === '系统管理员'}
                                                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${role.name === '系统管理员' ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95'}`}
                                                        >
                                                            分配人员
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenRoleModal(role, 'editName')}
                                                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-1.5"
                                                        >
                                                            <PenTool size={14} /> 编辑
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRole(role.name)}
                                                            disabled={!role.deletable || role.users > 0}
                                                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${role.deletable && role.users === 0 ? 'border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 active:scale-95' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                                                        >
                                                            删除
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 作业数据 */}
                    {activeMenu === '作业数据' && (
                        homeworkPageMode === 'list' ? (
                            <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                                <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                    <span className="hover:text-[#1D2129] cursor-pointer">数据中心</span>
                                    <span className="mx-2 text-[#C9CDD4]">/</span>
                                    <span className="text-[#1D2129]">作业数据</span>
                                </div>

                                <div className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.02)] flex flex-col">
                                    <h2 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129] mb-5">作业数据</h2>

                                    <div className="pc-filter-bar mb-6 flex flex-wrap items-center gap-3">
                                        <DatePicker
                                            value={homeworkDateFilter}
                                            onChange={(dateString) => setHomeworkDateFilter(dateString)}
                                            allowClear
                                            placeholder="作业日期"
                                            style={{ width: 160 }}
                                            aria-label="作业日期筛选"
                                        />
                                        <Cascader
                                            allowClear
                                            showSearch
                                            checkedStrategy="child"
                                            placeholder="全部班级"
                                            value={homeworkClassFilterPath}
                                            options={gradeLevelOptions.map(level => ({
                                                label: formatGradeLevelLabel(level),
                                                value: level,
                                                children: getClassOptionsByLevel(level).map(className => ({ label: className, value: className }))
                                            }))}
                                            onChange={(value) => {
                                                const path = Array.isArray(value) ? value : [];
                                                setHomeworkClassFilter(path.length > 0 ? String(path[path.length - 1]) : '');
                                            }}
                                            dropdownMenuColumnStyle={{ width: 180 }}
                                            style={{ width: 200 }}
                                            aria-label="班级筛选"
                                        />
                                        <ArcoSelect
                                            allowClear
                                            showSearch
                                            placeholder="全部科目"
                                            value={homeworkSubjectFilter === '全部科目' ? undefined : homeworkSubjectFilter}
                                            options={homeworkSubjects.map(subject => ({ label: subject, value: subject }))}
                                            onChange={(value) => setHomeworkSubjectFilter(value ? String(value) : '全部科目')}
                                            style={{ width: 160 }}
                                            aria-label="科目筛选"
                                        />
                                        <Input
                                            value={homeworkCreatorSearch}
                                            onChange={setHomeworkCreatorSearch}
                                            prefix={<Search size={14} className="text-[#86909C]" />}
                                            placeholder="录入人"
                                            allowClear
                                            style={{ width: 180 }}
                                            aria-label="录入人筛选"
                                        />
                                        <Button type="primary" onClick={() => {}}>查询</Button>
                                        <Button onClick={resetHomeworkListFilters}>重置</Button>
                                    </div>

                                    <div className="border-t border-[#F2F3F5] mb-5 w-full"></div>

                                    <div className="mb-4 flex items-center justify-between">
                                        <Button type="primary" onClick={openHomeworkCreatePage}>新建作业记录</Button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <Table
                                            rowKey="id"
                                            columns={homeworkTableColumns}
                                            data={filteredHomeworkRows}
                                            pagination={false}
                                            border={false}
                                            noDataElement="暂无符合条件的作业记录"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                                <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                    <span className="hover:text-[#1D2129] cursor-pointer">数据中心</span>
                                    <span className="mx-2 text-[#C9CDD4]">/</span>
                                    <button
                                        type="button"
                                        onClick={() => setHomeworkPageMode('list')}
                                        className="cursor-pointer text-[#86909C] hover:text-[#1D2129] focus:outline-none bg-transparent border-0 p-0"
                                        aria-label="返回作业数据列表"
                                    >
                                        作业数据
                                    </button>
                                    <span className="mx-2 text-[#C9CDD4]">/</span>
                                    <span className="text-[#1D2129]">{homeworkPageMode === 'create' ? '新建作业记录' : homeworkPageMode === 'view' ? '查看作业记录' : '编辑作业记录'}</span>
                                </div>

                                <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center h-6 mb-6">
                                        <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                        <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">基本信息</h3>
                                    </div>

                                    {homeworkPageMode === 'view' ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex min-h-[24px] items-start">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">作业日期：</span>
                                                <span className="ml-3 text-[#1D2129]">{newHomeworkDate || '-'}</span>
                                            </div>
                                            <div className="flex min-h-[24px] items-start">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">科目：</span>
                                                <span className="ml-3 text-[#1D2129]">{newHomeworkSubject || '-'}</span>
                                            </div>
                                            <div className="flex min-h-[24px] items-start">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">班级：</span>
                                                <span className="ml-3 text-[#1D2129]">{newHomeworkClasses.join('、') || '-'}</span>
                                            </div>
                                            <div className="flex min-h-[24px] items-start">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">作业名称：</span>
                                                <span className="ml-3 text-[#1D2129]">{newHomeworkName || '-'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <label className="flex min-h-[32px] items-center">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#1D2129]"><span className="text-[#F53F3F] mr-1">*</span>作业日期：</span>
                                                <input
                                                    type="date"
                                                    value={newHomeworkDate}
                                                    onChange={(event) => setNewHomeworkDate(event.target.value)}
                                                    className="ml-3 h-8 w-[417px] rounded border border-[#E5E6EB] bg-white px-2 text-sm font-normal text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                                />
                                            </label>
                                            <label className="flex min-h-[32px] items-center">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#1D2129]"><span className="text-[#F53F3F] mr-1">*</span>科目：</span>
                                                <select
                                                    value={newHomeworkSubject}
                                                    onChange={(event) => setNewHomeworkSubject(event.target.value)}
                                                    className={`ml-3 h-8 w-[417px] rounded border border-[#E5E6EB] bg-white px-2 text-sm font-normal outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all ${newHomeworkSubject ? 'text-[#1D2129]' : 'text-[#86909C]'}`}
                                                >
                                                    <option value="" hidden disabled>请选择科目</option>
                                                    {gradeSubjectOptions.map(subject => <option key={subject} className="text-[#1D2129]">{subject}</option>)}
                                                </select>
                                            </label>
                                            {newGradeExamType === '月考' && (
                                                <div className="flex items-center min-h-[32px]">
                                                    <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0">
                                                        <span className="text-[#F53F3F] mr-1">*</span>月份：
                                                    </span>
                                                    <div className="group relative w-[417px]">
                                                        <select
                                                            value={newGradeExamMonth}
                                                            onChange={(event) => setNewGradeExamMonth(event.target.value)}
                                                            className={`h-8 w-full appearance-none rounded border border-[#E5E6EB] bg-white py-0 pl-2 pr-8 text-sm font-normal outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all ${newGradeExamMonth ? 'text-[#1D2129]' : 'text-[#86909C]'}`}
                                                        >
                                                            <option value="" hidden disabled>请选择月份</option>
                                                            {gradeMonthOptions.map(month => <option key={month} className="text-[#1D2129]">{month}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86909C] ${newGradeExamMonth ? 'group-hover:hidden group-focus-within:hidden' : ''}`} />
                                                        {newGradeExamMonth && (
                                                            <button
                                                                type="button"
                                                                onMouseDown={(event) => event.preventDefault()}
                                                                onClick={() => setNewGradeExamMonth('')}
                                                                className="absolute right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-[14px] leading-none text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#4E5969] group-hover:flex group-focus-within:flex"
                                                                aria-label="清除月考月份"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start min-h-[32px]">
                                                <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0">
                                                    <span className="text-[#F53F3F] mr-1">*</span>班级：
                                                </span>
                                                <div className="min-w-0 flex-1 rounded border border-[#E5E6EB] bg-white px-3 py-2 transition-all hover:border-[#165DFF]">
                                                    <div className="space-y-2">
                                                        {gradeLevelOptions.map(level => (
                                                            <div key={level} className="grid grid-cols-[112px_minmax(0,1fr)] gap-2">
                                                                <div className="flex h-7 items-center whitespace-nowrap text-[13px] font-medium text-[#1D2129]">
                                                                    {formatGradeLevelLabel(level)}
                                                                </div>
                                                                <div className="flex min-w-0 flex-wrap gap-1.5">
                                                                    {getClassOptionsByLevel(level).map(className => {
                                                                        const selected = newHomeworkClasses.includes(className);
                                                                        return (
                                                                            <button
                                                                                key={className}
                                                                                type="button"
                                                                                onClick={() => handleToggleHomeworkClass(className)}
                                                                                className={`flex h-7 items-center rounded px-2 text-[13px] transition-all ${selected ? 'bg-[#165DFF] text-white' : 'bg-[#F7F8FA] text-[#4E5969] hover:bg-[#E8F3FF] hover:text-[#165DFF]'}`}
                                                                                aria-pressed={selected}
                                                                            >
                                                                                {className}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="flex min-h-[32px] items-center">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#1D2129]">作业名称：</span>
                                                <input
                                                    value={newHomeworkName}
                                                    onChange={(event) => setNewHomeworkName(event.target.value)}
                                                    placeholder="例如：阅读理解"
                                                    className="ml-3 h-8 w-[417px] rounded border border-[#E5E6EB] bg-white px-2 text-sm font-normal text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                                />
                                            </label>
                                        </div>
                                    )}
                                </section>

                                {homeworkPageMode === 'view' && (
                                    <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center h-6 mb-5">
                                            <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                            <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">完成情况统计</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3 pl-[132px]">
                                            {homeworkStatusOptions.map(status => (
                                                <div key={status} className={`min-w-[96px] rounded border border-[#E5E6EB] px-3 py-2 text-center ${getHomeworkStatusColorClass(status)}`}>
                                                    <div className="text-[12px] leading-4">{status}</div>
                                                    <div className="mt-1 text-base font-semibold leading-5">{homeworkStatusCounts[status] || 0}人</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)] relative min-h-[274px]">
                                    <div className="absolute left-5 top-5 flex items-center h-6">
                                        <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                        <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">作业完成情况</h3>
                                    </div>

                                    {homeworkPageMode !== 'view' && (
                                        <div className="absolute left-5 top-[60px] flex min-h-8 w-3/4 max-w-[1280px] items-start rounded border border-[#BEDAFF] bg-[#E8F3FF] px-3 py-1.5 text-[13px] leading-5 text-[#4E5969]">
                                            <Info size={14} className="mr-2 mt-[3px] shrink-0 text-[#165DFF]" />
                                            <ol className="m-0 list-none p-0">
                                                <li>1、可以从 Excel 直接复制粘贴学生姓名和完成情况</li>
                                                <li>2、可以手动填写表格，并批量设置作业完成情况</li>
                                            </ol>
                                        </div>
                                    )}

                                    {newHomeworkClasses.length > 0 && (
                                        <div className={`absolute left-5 right-5 ${homeworkPageMode === 'view' ? 'top-[60px]' : 'top-[132px]'} flex items-center`}>
                                            <span className="w-[120px] shrink-0 text-right text-sm font-medium text-[#1D2129]">录入进度：</span>
                                            <div className="ml-3 h-2 w-[420px] shrink-0 overflow-hidden rounded-full bg-[#F2F3F5]">
                                                <div
                                                    className="h-full rounded-full bg-[#165DFF] transition-all"
                                                    style={{ width: `${homeworkProgressPercent}%` }}
                                                />
                                            </div>
                                            <span className="ml-3 shrink-0 text-[12px] font-medium text-[#4E5969]">
                                                {completedHomeworkStudentCount}/{totalHomeworkStudentCount}名学生
                                            </span>
                                        </div>
                                    )}

                                    <div className={`${homeworkPageMode === 'view' ? 'pt-[92px]' : newHomeworkClasses.length > 0 ? 'pt-[172px]' : 'pt-[144px]'} pr-0 pb-8 overflow-x-auto overflow-y-visible`}>
                                        {newHomeworkClasses.length > 0 && (
                                            <div className="mb-4 ml-[132px] max-w-[calc(100%-132px)] overflow-x-auto custom-scrollbar">
                                                <div className="flex w-max min-w-full items-center gap-2 rounded border border-[#E5E6EB] bg-[#F7F8FA] p-1">
                                                    {newHomeworkClasses.map(className => {
                                                        const active = activeHomeworkClassSheet === className;
                                                        const progress = getHomeworkClassProgress(className);
                                                        return (
                                                            <button
                                                                key={className}
                                                                type="button"
                                                                onClick={() => handleSwitchHomeworkClassSheet(className)}
                                                                className={`h-[46px] min-w-[124px] rounded px-3 text-left text-sm transition-colors duration-150 ${active ? 'bg-[#165DFF] text-white shadow-[0_2px_6px_rgba(22,93,255,0.18)]' : 'bg-transparent text-[#4E5969] hover:bg-white hover:text-[#165DFF]'}`}
                                                            >
                                                                <div className="whitespace-nowrap font-medium leading-5">{className}</div>
                                                                <div className={`mt-0.5 whitespace-nowrap text-[12px] leading-4 ${active ? 'text-white/85' : progress.isComplete ? 'text-[#00B42A]' : 'text-[#FF7D00]'}`}>
                                                                    {progress.isComplete ? '已完成' : '未完成'} {progress.completed}/{progress.total}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {homeworkPageMode !== 'view' && activeHomeworkClassSheet && (
                                            <div className="mb-4 flex min-w-[420px] items-center">
                                                <span className="w-[120px] shrink-0 text-right text-sm font-medium text-[#1D2129]">快捷操作：</span>
                                                <button
                                                    type="button"
                                                    onClick={handleFillHomeworkStudents}
                                                    className="ml-3 h-8 rounded border-0 bg-[#165DFF] px-4 text-sm font-normal text-white transition-colors hover:bg-[#4080FF] active:bg-[#0E42D2] focus:outline-none"
                                                >
                                                    填充本班学生姓名
                                                </button>
                                            </div>
                                        )}
                                        {!activeHomeworkClassSheet ? (
                                            <div className="ml-[132px] flex h-24 w-[420px] items-center justify-center border border-[#E5E6EB] bg-white text-sm font-normal text-[#86909C] rounded">请选择班级</div>
                                        ) : (
                                            <table className="ml-[132px] border-collapse text-center text-sm font-normal text-[#4E5969] border border-[#E5E6EB] rounded">
                                                <thead>
                                                    <tr className="bg-[#F7F8FA] text-[#1D2129]">
                                                        <th className="h-12 w-[60px] whitespace-nowrap border border-[#E5E6EB] px-2 text-[#86909C] font-semibold bg-[#F7F8FA]">序号</th>
                                                        <th className="h-12 w-[120px] border border-[#E5E6EB] px-2 font-semibold bg-[#F7F8FA]">姓名</th>
                                                        <th className="h-16 w-[168px] border border-[#E5E6EB] px-2 font-semibold bg-[#F7F8FA]">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="text-[#1D2129]">作业完成情况</div>
                                                                {homeworkPageMode !== 'view' && (
                                                                    <div className="flex h-6 items-center gap-1 mt-1">
                                                                        <div className="group relative w-[86px]">
                                                                            <select
                                                                                value={homeworkColumnFillStatus}
                                                                                onChange={(event) => setHomeworkColumnFillStatus(event.target.value)}
                                                                                className={`h-6 w-full appearance-none rounded border border-[#E5E6EB] py-0 pl-1 pr-5 text-[12px] font-normal outline-none focus:border-[#165DFF] ${homeworkColumnFillStatus ? getHomeworkStatusColorClass(homeworkColumnFillStatus) : 'bg-white text-[#86909C]'}`}
                                                                            >
                                                                                <option value="" hidden disabled>等级</option>
                                                                                {homeworkStatusOptions.map(status => <option key={status} value={status} className="text-[#1D2129]">{status}</option>)}
                                                                            </select>
                                                                            <ChevronDown size={12} className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#86909C] ${homeworkColumnFillStatus ? 'group-hover:hidden group-focus-within:hidden' : ''}`} />
                                                                            {homeworkColumnFillStatus && (
                                                                                <button
                                                                                    type="button"
                                                                                    onMouseDown={(event) => event.preventDefault()}
                                                                                    onClick={() => setHomeworkColumnFillStatus('')}
                                                                                    className="absolute right-1 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full text-[12px] leading-none text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#4E5969] group-hover:flex group-focus-within:flex"
                                                                                    aria-label="清除作业完成情况批量设置等级"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleBatchSetHomeworkStatus}
                                                                            className="h-6 w-[68px] rounded border border-[#E5E6EB] bg-white text-[12px] text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] transition-all"
                                                                        >
                                                                            批量设置
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {newHomeworkStudents.map((student, index) => (
                                                        <tr key={student.id}>
                                                            <td className="h-8 w-[60px] whitespace-nowrap border border-[#E5E6EB] bg-[#F7F8FA] px-2 text-[#86909C]">{index + 1}</td>
                                                            <td className="h-8 w-[120px] border border-[#E5E6EB] bg-white p-0">
                                                                <input
                                                                    value={student.name}
                                                                    onChange={(event) => handleChangeHomeworkName(student.id, event.target.value)}
                                                                    readOnly={homeworkPageMode === 'view'}
                                                                    className="h-[32px] w-[120px] border-0 bg-transparent px-[6px] text-center text-[14px] font-normal text-[#333333] outline-none focus:bg-[#E8F3FF] focus:ring-1 focus:ring-inset focus:ring-[#165DFF]"
                                                                    aria-label={`第${index + 1}行姓名`}
                                                                />
                                                            </td>
                                                            <td className="h-[32px] w-[168px] border border-[#DADCE0] bg-white p-0">
                                                                <input
                                                                    value={student.status || ''}
                                                                    onChange={(event) => handleChangeHomeworkStatus(student.id, event.target.value)}
                                                                    readOnly={homeworkPageMode === 'view'}
                                                                    className={`h-[32px] w-[168px] border-0 px-[6px] text-center text-[14px] font-normal outline-none focus:bg-[#E8F3FF] focus:ring-1 focus:ring-inset focus:ring-[#165DFF] ${getHomeworkStatusColorClass(student.status || '')}`}
                                                                    aria-label={`${student.name || `第${index + 1}行`}作业完成情况`}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </section>

                                <div className="mt-4 flex justify-center gap-3 py-3">
                                    <button
                                        type="button"
                                        onClick={() => setHomeworkPageMode('list')}
                                        className="h-8 w-[78px] rounded border border-[#E5E6EB] bg-white text-sm font-normal text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] active:border-[#0E42D2] transition-colors focus:outline-none"
                                    >
                                        返回
                                    </button>
                                    {homeworkPageMode !== 'view' && (
                                        <button
                                            type="button"
                                            onClick={handleSaveHomeworkRecord}
                                            className="h-8 w-[78px] rounded border-0 bg-[#165DFF] text-sm font-normal text-white hover:bg-[#4080FF] active:bg-[#0E42D2] transition-colors focus:outline-none"
                                        >
                                            确定
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    )}


                    {/* 期末报告配置 */}
                    {activeMenu === '期末报告配置' && (
                        <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                            <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                <span className="hover:text-[#1D2129] cursor-pointer">基础信息配置</span>
                                <span className="mx-2 text-[#C9CDD4]">/</span>
                                <span className="text-[#1D2129]">期末报告配置</span>
                            </div>

                            <div className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.02)] flex flex-col">
                                <h2 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129]">期末报告配置</h2>
                                <div className="mt-3 w-full max-w-[720px]">
                                    <div className="mb-5 flex min-h-8 w-full items-start rounded border border-[#BEDAFF] bg-[#E8F3FF] px-3 py-1.5 text-[13px] leading-5 text-[#4E5969]">
                                        <Info size={14} className="mr-2 mt-[3px] shrink-0 text-[#165DFF]" />
                                        <ol className="m-0 list-none p-0">
                                            <li>1、拖动排序标记进行板块调整排序</li>
                                        </ol>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                    {termReportModules.map((module, index) => (
                                        <div
                                            key={module.id}
                                            draggable
                                            onDragStart={() => setDraggedTermReportModuleId(module.id)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={() => handleDropTermReportModule(module.id)}
                                            onDragEnd={() => setDraggedTermReportModuleId(null)}
                                            className={`flex min-h-[56px] items-center gap-4 rounded border px-4 py-3 transition-all ${draggedTermReportModuleId === module.id ? 'border-[#165DFF] bg-[#E8F3FF]' : 'border-[#E5E6EB] bg-white hover:border-[#B8C7E8]'}`}
                                            title="拖拽排序"
                                        >
                                            <div className="w-8 shrink-0 text-center text-[13px] font-semibold text-[#86909C]">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex h-9 w-9 shrink-0 cursor-move items-center justify-center rounded border border-[#C9CDD4] bg-[#F7F8FA] text-[#4E5969]" aria-label="拖拽排序">
                                                <Move size={18} strokeWidth={2.2} />
                                            </div>
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <span className="text-sm font-semibold leading-[22px] text-[#1D2129]">{module.name}</span>
                                                {!module.enabled && (
                                                    <span className="rounded bg-[#F2F3F5] px-2 py-0.5 text-xs font-normal text-[#86909C]">未展示</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={module.enabled}
                                                onClick={() => handleToggleTermReportModule(module.id)}
                                                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#165DFF]/20 ${module.enabled ? 'bg-[#165DFF]' : 'bg-[#C9CDD4]'}`}
                                            >
                                                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform ${module.enabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 考试等级管理 */}
                    {activeMenu === '考试等级管理' && (
                        <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                            <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                <span className="hover:text-[#1D2129] cursor-pointer">基础信息配置</span>
                                <span className="mx-2 text-[#C9CDD4]">/</span>
                                <span className="text-[#1D2129]">考试等级管理</span>
                            </div>

                            <div className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.02)] flex flex-col">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129]">考试等级管理</h2>
                                        <p className="m-0 mt-1 text-[13px] leading-5 text-[#86909C]">考试等级将作为考试数据批量设置的可选值。</p>
                                    </div>
                                    <Button type="primary" onClick={() => handleOpenExamLevelModal()}>新增等级</Button>
                                </div>
                                <Table
                                    rowKey="id"
                                    columns={examLevelTableColumns}
                                    data={examLevelOptions}
                                    pagination={false}
                                    border={false}
                                    noDataElement={<div className="py-12 text-[#86909C]">暂无考试等级，请新增等级后再录入考试数据。</div>}
                                />
                            </div>
                        </div>
                    )}

                    {/* 考试数据 */}
                    {activeMenu === '考试数据' && (
                        gradePageMode === 'list' ? (
                            <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                                <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                    <span className="hover:text-[#1D2129] cursor-pointer">数据中心</span>
                                    <span className="mx-2 text-[#C9CDD4]">/</span>
                                    <span className="text-[#1D2129]">考试数据</span>
                                </div>

                                <div className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.02)] flex flex-col">
                                    <h2 className="m-0 text-base font-semibold leading-[24px] text-[#1D2129] mb-5">考试数据</h2>

                                    <div className="mb-4 inline-flex w-fit rounded border border-[#E5E6EB] bg-[#F7F8FA] p-1" role="tablist" aria-label="考试数据视角切换">
                                        {[
                                            { key: 'class' as const, label: '班级视角' },
                                            { key: 'exam' as const, label: '考试视角' }
                                        ].map(item => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => {
                                                    setGradeListViewMode(item.key);
                                                    setGradeCreatorSearch('');
                                                }}
                                                className={`h-7 rounded px-4 text-sm transition-all ${gradeListViewMode === item.key ? 'bg-white text-[#165DFF] shadow-[0_2px_6px_rgba(0,0,0,0.06)]' : 'text-[#4E5969] hover:text-[#1D2129]'}`}
                                                role="tab"
                                                aria-selected={gradeListViewMode === item.key}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pc-filter-bar mb-6 flex flex-wrap items-center gap-3">
                                        <ArcoSelect
                                            allowClear
                                            showSearch
                                            placeholder="全部学期"
                                            value={gradeTermFilter === '全部学期' ? undefined : gradeTermFilter}
                                            options={gradeTerms.map(term => ({ label: term, value: term }))}
                                            onChange={(value) => setGradeTermFilter(value ? String(value) : '全部学期')}
                                            style={{ width: 200 }}
                                            aria-label="学年学期筛选"
                                        />
                                        <ArcoSelect
                                            allowClear
                                            showSearch
                                            placeholder="全部类型"
                                            value={gradeExamTypeFilter === '全部类型' ? undefined : gradeExamTypeFilter}
                                            options={gradeExamTypes.map(type => ({ label: type, value: type }))}
                                            onChange={(value) => setGradeExamTypeFilter(value ? String(value) : '全部类型')}
                                            style={{ width: 160 }}
                                            aria-label="考试类型筛选"
                                        />
                                        {gradeListViewMode === 'class' && (
                                            <>
                                            <Cascader
                                                mode="multiple"
                                                allowClear
                                                showSearch
                                                checkedStrategy="child"
                                                maxTagCount={{ count: 1, render: (invisibleTagCount) => `+${invisibleTagCount}` }}
                                                placeholder="全部班级"
                                                value={gradeClassFilters.map(className => [className.match(/^(\d+级)/)?.[1] || '', className])}
                                                options={gradeLevelOptions.map(level => ({
                                                    label: formatGradeLevelLabel(level),
                                                    value: level,
                                                    children: getClassOptionsByLevel(level).map(className => ({ label: className, value: className }))
                                                }))}
                                                onChange={(value) => {
                                                    const paths = Array.isArray(value) ? value : [];
                                                    setGradeClassFilters(paths.map(path => Array.isArray(path) ? String(path[path.length - 1]) : String(path)).filter(Boolean));
                                                }}
                                                dropdownMenuColumnStyle={{ width: 180 }}
                                                style={{ width: 220 }}
                                                aria-label="班级筛选"
                                            />
                                            <ArcoSelect
                                                mode="multiple"
                                                allowClear
                                                showSearch
                                                maxTagCount={{ count: 1, render: (invisibleTagCount) => `+${invisibleTagCount}` }}
                                                placeholder="全部科目"
                                                value={gradeSubjectFilters}
                                                options={gradeFilterSubjects.map(subject => ({ label: subject, value: subject }))}
                                                onChange={(value) => setGradeSubjectFilters(Array.isArray(value) ? value.map(String) : [])}
                                                style={{ width: 220 }}
                                                aria-label="科目筛选"
                                            />
                                            <Input
                                                value={gradeCreatorSearch}
                                                onChange={setGradeCreatorSearch}
                                                prefix={<Search size={14} className="text-[#86909C]" />}
                                                placeholder="搜索创建人"
                                                allowClear
                                                style={{ width: 240 }}
                                                aria-label="创建人筛选"
                                            />
                                            </>
                                        )}
                                        <Button type="primary" onClick={() => {}}>查询</Button>
                                        <Button
                                            onClick={() => {
                                                setGradeTermFilter('全部学期');
                                                setGradeExamTypeFilter('全部类型');
                                                setGradeClassFilters([]);
                                                setGradeSubjectFilters([]);
                                                setGradeCreatorSearch('');
                                            }}
                                        >
                                            重置
                                        </Button>
                                    </div>

                                    <div className="border-t border-[#F2F3F5] mb-5 w-full"></div>

                                    <div className="flex flex-col gap-4">
                                        {gradeListViewMode === 'class' && (
                                            <div className="flex items-center justify-between">
                                                <Button type="primary" onClick={openGradeCreatePage}>新建考试</Button>
                                            </div>
                                        )}

                                        <div className="overflow-x-auto">
                                            <Table
                                                rowKey="id"
                                                columns={gradeListViewMode === 'class' ? gradeClassTableColumns : gradeExamAggregateTableColumns}
                                                data={gradeListViewMode === 'class' ? filteredGradeExamRows : gradeExamAggregateRows}
                                                pagination={false}
                                                border={false}
                                                noDataElement="暂无符合条件的考试记录"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4">
                                <div className="flex h-5 items-center text-[13px] leading-[20px] text-[#86909C] mb-1">
                                    <span className="hover:text-[#1D2129] cursor-pointer">数据中心</span>
                                    <span className="mx-2 text-[#C9CDD4]">/</span>
                                    <button
                                        type="button"
                                        onClick={() => setGradePageMode('list')}
                                        className="cursor-pointer text-[#86909C] hover:text-[#1D2129] focus:outline-none bg-transparent border-0 p-0"
                                        aria-label="返回考试数据列表"
                                    >
                                        考试数据
                                    </button>
                                    <span className="mx-2 text-[#C9CDD4]">/</span>
                                    <span className="text-[#1D2129]">{gradePageMode === 'create' ? '新建考试' : gradePageMode === 'view' || gradePageMode === 'examView' ? '查看考试' : '编辑考试'}</span>
                                </div>

                                <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center h-6 mb-6">
                                        <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                        <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">基本信息</h3>
                                    </div>

                                    {gradePageMode === 'view' || gradePageMode === 'examView' ? (
                                        <div className="grid max-w-[980px] grid-cols-2 gap-x-12 gap-y-5">
                                            <div className="flex min-h-[24px] items-start">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">学年-学期：</span>
                                                <span className="ml-3 text-[#1D2129]">{newGradeTerm || '-'}</span>
                                            </div>
                                            <div className="flex min-h-[24px] items-start">
                                                <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">考试类型：</span>
                                                <span className="ml-3 text-[#1D2129]">{newGradeExamType === '月考' && newGradeExamMonth ? `月考（${newGradeExamMonth}）` : (newGradeExamType || '-')}</span>
                                            </div>
                                            {gradePageMode === 'view' && (
                                                <>
                                                    <div className="flex min-h-[24px] items-start">
                                                        <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">年级：</span>
                                                        <span className="ml-3 text-[#1D2129]">{newGradeLevel ? formatGradeLevelLabel(newGradeLevel) : '-'}</span>
                                                    </div>
                                                    <div className="flex min-h-[24px] items-start">
                                                        <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">班级：</span>
                                                        <span className="ml-3 text-[#1D2129]">{newGradeClasses.length > 0 ? newGradeClasses.join('、') : (newGradeClass || '-')}</span>
                                                    </div>
                                                    <div className="flex min-h-[24px] items-start">
                                                        <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">创建人：</span>
                                                        <span className="ml-3 text-[#1D2129]">{selectedGradeExam?.creator || '-'}</span>
                                                    </div>
                                                    <div className="col-span-2 flex min-h-[28px] items-start">
                                                        <span className="w-[120px] shrink-0 text-right font-medium text-[#4E5969]">科目：</span>
                                                        <div className="ml-3 flex max-w-[760px] flex-wrap gap-2">
                                                            {newGradeSubjects.length > 0 ? newGradeSubjects.map(subject => (
                                                                <span key={subject} className="flex h-7 items-center rounded-full border border-[#E5E6EB] bg-[#F7F8FA] px-4 text-sm font-normal text-[#1D2129]">
                                                                    {subject}
                                                                </span>
                                                            )) : <span className="text-[#86909C]">-</span>}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center min-h-[32px]">
                                                <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0">
                                                    <span className="text-[#F53F3F] mr-1">*</span>学年-学期：
                                                </span>
                                                <select
                                                    value={newGradeTerm}
                                                    onChange={(event) => setNewGradeTerm(event.target.value)}
                                                    className="h-8 w-[417px] rounded border border-[#E5E6EB] bg-white px-2 text-sm font-normal text-[#1D2129] outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all"
                                                >
                                                    {gradeTermOptions.map(term => <option key={term} className="text-[#1D2129]">{term}</option>)}
                                                </select>
                                            </div>

                                            <div className="flex items-center min-h-[32px]">
                                                <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0">
                                                    <span className="text-[#F53F3F] mr-1">*</span>考试类型：
                                                </span>
                                                <div className="group relative w-[417px]">
                                                    <select
                                                        value={newGradeExamType}
                                                        onChange={(event) => {
                                                            const nextType = event.target.value;
                                                            setNewGradeExamType(nextType);
                                                            if (nextType !== '月考') setNewGradeExamMonth('');
                                                        }}
                                                        className={`h-8 w-full appearance-none rounded border border-[#E5E6EB] bg-white py-0 pl-2 pr-8 text-sm font-normal outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all ${newGradeExamType ? 'text-[#1D2129]' : 'text-[#86909C]'}`}
                                                    >
                                                        <option value="" hidden disabled>请选择考试类型</option>
                                                        {gradeExamTypeOptions.map(type => <option key={type} className="text-[#1D2129]">{type}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86909C] ${newGradeExamType ? 'group-hover:hidden group-focus-within:hidden' : ''}`} />
                                                    {newGradeExamType && (
                                                        <button
                                                            type="button"
                                                            onMouseDown={(event) => event.preventDefault()}
                                                            onClick={() => { setNewGradeExamType(''); setNewGradeExamMonth(''); }}
                                                            className="absolute right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-[14px] leading-none text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#4E5969] group-hover:flex group-focus-within:flex"
                                                            aria-label="清除考试类型"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {newGradeExamType === '月考' && (
                                                <div className="flex items-center min-h-[32px]">
                                                    <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0">
                                                        <span className="text-[#F53F3F] mr-1">*</span>月份：
                                                    </span>
                                                    <div className="group relative w-[417px]">
                                                        <select
                                                            value={newGradeExamMonth}
                                                            onChange={(event) => setNewGradeExamMonth(event.target.value)}
                                                            className={`h-8 w-full appearance-none rounded border border-[#E5E6EB] bg-white py-0 pl-2 pr-8 text-sm font-normal outline-none hover:border-[#165DFF] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 transition-all ${newGradeExamMonth ? 'text-[#1D2129]' : 'text-[#86909C]'}`}
                                                        >
                                                            <option value="" hidden disabled>请选择月份</option>
                                                            {gradeMonthOptions.map(month => <option key={month} className="text-[#1D2129]">{month}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86909C] ${newGradeExamMonth ? 'group-hover:hidden group-focus-within:hidden' : ''}`} />
                                                        {newGradeExamMonth && (
                                                            <button
                                                                type="button"
                                                                onMouseDown={(event) => event.preventDefault()}
                                                                onClick={() => setNewGradeExamMonth('')}
                                                                className="absolute right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-[14px] leading-none text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#4E5969] group-hover:flex group-focus-within:flex"
                                                                aria-label="清除月考月份"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start min-h-[32px]">
                                                <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0">
                                                    <span className="text-[#F53F3F] mr-1">*</span>班级：
                                                </span>
                                                <div className="min-w-0 flex-1 rounded border border-[#E5E6EB] bg-white px-3 py-2 transition-all hover:border-[#165DFF]">
                                                    <div className="space-y-2">
                                                        {gradeLevelOptions.map(level => (
                                                                <div key={level} className="grid grid-cols-[112px_minmax(0,1fr)] gap-2">
                                                                    <div className="flex h-7 items-center whitespace-nowrap text-[13px] font-medium text-[#1D2129]">
                                                                        {formatGradeLevelLabel(level)}
                                                                    </div>
                                                                    <div className="flex min-w-0 flex-wrap gap-1.5">
                                                                        {getClassOptionsByLevel(level).map(className => {
                                                                            const selected = newGradeClasses.includes(className);
                                                                            return (
                                                                                <button
                                                                                    key={className}
                                                                                    type="button"
                                                                                    onClick={() => handleToggleGradeClass(className)}
                                                                                    className={`flex h-7 items-center rounded px-2 text-[13px] transition-all ${selected ? 'bg-[#165DFF] text-white' : 'bg-[#F7F8FA] text-[#4E5969] hover:bg-[#E8F3FF] hover:text-[#165DFF]'}`}
                                                                                    aria-pressed={selected}
                                                                                >
                                                                                    {className}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start min-h-[32px]">
                                                <span className="w-[120px] text-right font-medium text-[#1D2129] shrink-0 pt-1">
                                                    <span className="text-[#F53F3F] mr-1">*</span>选择科目：
                                                </span>
                                                <div className="flex w-3/4 max-w-[1280px] flex-wrap gap-x-3 gap-y-2">
                                                    {gradeSubjectOptions.map(subject => {
                                                        const selected = newGradeSubjects.includes(subject);
                                                        return (
                                                            <button
                                                                key={subject}
                                                                type="button"
                                                                onClick={() => toggleNewGradeSubject(subject)}
                                                                className={`h-7 min-w-[64px] rounded-full px-4 text-center text-sm font-normal leading-none transition-all ${selected ? 'border border-[#165DFF] bg-[#165DFF] text-white' : 'border border-[#E5E6EB] bg-white text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF]'} cursor-pointer`}
                                                            >
                                                                {subject}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {gradePageMode === 'examView' && (
                                    <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center h-6 mb-4">
                                            <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                            <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">考试成绩</h3>
                                        </div>
                                        <div className="flex flex-col gap-5">
                                            {selectedAggregateGradeGroups.map(([level, rows]) => {
                                                const sortedRows = [...rows].sort((a, b) => a.className.localeCompare(b.className, 'zh-Hans'));
                                                const activeClass = activeAggregateClassByLevel[level] || sortedRows[0]?.className || '';
                                                const activeRow = sortedRows.find(row => row.className === activeClass) || sortedRows[0];
                                                const subjects = Array.from(new Set(sortedRows.flatMap(row => row.subjects)));
                                                const students = activeRow ? (gradeStudentsByClass[activeRow.className] || gradeExamScoresMap[activeRow.id] || []) : [];
                                                return (
                                                    <div key={level} className="rounded border border-[#E5E6EB] bg-white">
                                                        <div className="flex items-center justify-between border-b border-[#F2F3F5] px-4 py-3">
                                                            <div className="text-sm font-semibold text-[#1D2129]">{formatGradeLevelLabel(level)}</div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleExportGradeLevelExcel(level, rows)}
                                                                className="flex h-8 items-center gap-1.5 rounded px-2 text-sm font-normal text-[#165DFF] transition-colors hover:bg-[#E8F3FF] hover:text-[#4080FF] active:text-[#0E42D2] focus:outline-none"
                                                            >
                                                                <Download size={14} />
                                                                导出excel
                                                            </button>
                                                        </div>

                                                        <div className="px-4 pt-3">
                                                            <div className="mb-3 max-w-full overflow-x-auto custom-scrollbar">
                                                                <div className="flex w-max min-w-full items-center gap-2 rounded border border-[#E5E6EB] bg-[#F7F8FA] p-1">
                                                                {sortedRows.map(row => {
                                                                    const active = activeClass === row.className;
                                                                    return (
                                                                        <button
                                                                            key={row.id}
                                                                            type="button"
                                                                            onClick={() => setActiveAggregateClassByLevel(prev => ({ ...prev, [level]: row.className }))}
                                                                            className={`h-9 min-w-[112px] rounded px-3 text-center text-sm transition-colors duration-150 ${active ? 'bg-[#165DFF] font-medium text-white shadow-[0_2px_6px_rgba(22,93,255,0.18)]' : 'bg-transparent text-[#4E5969] hover:bg-white hover:text-[#165DFF]'}`}
                                                                        >
                                                                            <div className="whitespace-nowrap leading-5">{row.className}</div>
                                                                        </button>
                                                                    );
                                                                })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto px-4 pb-4">
                                                            <table className="border-collapse text-center text-sm font-normal text-[#4E5969] border border-[#E5E6EB]">
                                                                <thead>
                                                                    <tr className="bg-[#F7F8FA] text-[#1D2129]">
                                                                        <th className="h-12 w-[60px] whitespace-nowrap border border-[#E5E6EB] px-2 text-[#86909C] font-semibold bg-[#F7F8FA]">序号</th>
                                                                        <th className="h-12 w-[120px] border border-[#E5E6EB] px-2 font-semibold bg-[#F7F8FA]">姓名</th>
                                                                        {subjects.map(subject => (
                                                                            <th key={subject} className="h-12 w-[168px] border border-[#E5E6EB] px-2 font-semibold bg-[#F7F8FA]">{subject}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {students.map((student, index) => (
                                                                        <tr key={student.id}>
                                                                            <td className="h-8 w-[60px] whitespace-nowrap border border-[#E5E6EB] bg-[#F7F8FA] px-2 text-[#86909C]">{index + 1}</td>
                                                                            <td className="h-8 w-[120px] border border-[#E5E6EB] bg-white px-2 text-[#1D2129]">{student.name || '-'}</td>
                                                                            {subjects.map(subject => (
                                                                                <td key={subject} className={`h-8 w-[168px] border border-[#E5E6EB] px-2 ${getGradeScoreColorClass(student.scores[subject] || '')}`}>
                                                                                    {student.scores[subject] || '-'}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                    {students.length === 0 && (
                                                                        <tr>
                                                                            <td className="h-20 text-center text-[#86909C]" colSpan={subjects.length + 2}>暂无学生成绩数据</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {gradePageMode === 'view' && (
                                    <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center h-6 mb-6">
                                            <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                            <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">成绩统计</h3>
                                        </div>
                                        <div className="pl-[140px] pr-0 overflow-x-auto">
                                            {gradeScoreStatisticRows.length === 0 || gradeScoreStatisticColumns.length === 0 ? (
                                                <div className="flex h-16 w-[520px] items-center justify-center rounded border border-[#E5E6EB] bg-white text-sm font-normal text-[#86909C]">暂无可统计的成绩数据</div>
                                            ) : (
                                                <table className="min-w-[760px] border-collapse text-center text-sm font-normal text-[#4E5969] border border-[#E5E6EB]">
                                                    <thead>
                                                        <tr className="bg-[#F7F8FA] text-[#1D2129]">
                                                            <th className="h-10 min-w-[120px] border border-[#E5E6EB] px-3 text-left font-semibold">科目</th>
                                                            {gradeScoreStatisticColumns.map(option => (
                                                                <th key={option} className="h-10 min-w-[80px] border border-[#E5E6EB] px-3 font-semibold">{option}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gradeScoreStatisticRows.map(row => (
                                                            <tr key={row.subject} className="hover:bg-[#F7F8FA] transition-colors">
                                                                <td className="h-10 border border-[#E5E6EB] px-3 text-left font-medium text-[#1D2129]">{row.subject}</td>
                                                                {gradeScoreStatisticColumns.map(option => (
                                                                    <td key={option} className="h-10 border border-[#E5E6EB] px-3 text-[#1D2129]">{row.counts[option]}人</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </section>
                                )}
                                {gradePageMode !== 'examView' && (
                                 <section className="bg-[#FFFFFF] rounded border border-[#E5E6EB] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.02)] relative min-h-[274px]">
                                    <div className="absolute left-5 top-5 flex items-center h-6">
                                        <div className="h-[18px] w-[5px] bg-[#165DFF] rounded-[1px]" />
                                        <h3 className="ml-2 m-0 text-base font-semibold leading-none text-[#1D2129]">考试成绩</h3>
                                    </div>
                                    {gradePageMode === 'view' && (
                                        <button
                                            type="button"
                                            onClick={handleExportExcel}
                                            className="absolute right-5 top-4 flex h-8 items-center gap-1.5 rounded px-2 text-sm font-normal text-[#165DFF] transition-colors hover:bg-[#E8F3FF] hover:text-[#4080FF] active:text-[#0E42D2] focus:outline-none"
                                        >
                                            <Download size={14} />
                                            导出excel
                                        </button>
                                    )}

                                    {gradePageMode !== 'view' && (
                                        <div className="absolute left-5 top-[60px] flex min-h-8 w-3/4 max-w-[1280px] items-start rounded border border-[#BEDAFF] bg-[#E8F3FF] px-3 py-1.5 text-[13px] leading-5 text-[#4E5969]">
                                            <Info size={14} className="mr-2 mt-[3px] shrink-0 text-[#165DFF]" />
                                            <ol className="m-0 list-none p-0">
                                                <li>1、可以从 Excel 直接复制粘贴</li>
                                                <li>2、可以手动填写表格，并批量设置学科的等级</li>
                                                <li>3、拖动带 ↔ 的科目表头调整排序</li>
                                            </ol>
                                        </div>
                                    )}

                                    {newGradeClasses.length > 0 && (
                                        <div className={`absolute left-5 right-5 ${gradePageMode === 'view' ? 'top-[60px]' : 'top-[152px]'} flex items-center`}>
                                            <span className="w-[120px] shrink-0 text-right text-sm font-medium text-[#1D2129]">录入进度：</span>
                                            <div className="ml-3 h-2 w-[420px] shrink-0 overflow-hidden rounded-full bg-[#F2F3F5]">
                                                <div
                                                    className="h-full rounded-full bg-[#165DFF] transition-all"
                                                    style={{ width: `${gradeOverallProgressPercent}%` }}
                                                />
                                            </div>
                                            <span className="ml-3 shrink-0 text-[12px] font-medium text-[#4E5969]">
                                                {completedGradeStudentCount}/{totalGradeStudentCount}名学生
                                            </span>
                                        </div>
                                    )}

                                    <div className={`${gradePageMode === 'view' ? 'pt-[92px]' : newGradeClasses.length > 0 ? 'pt-[192px]' : 'pt-[164px]'} pr-0 pb-8 overflow-x-auto overflow-y-visible`} onMouseLeave={stopGradeCellDrag} onMouseUp={stopGradeCellDrag}>
                                        {newGradeClasses.length > 0 && (
                                            <div className="mb-4 ml-[132px] max-w-[calc(100%-132px)] overflow-x-auto custom-scrollbar">
                                                <div className="flex w-max min-w-full items-center gap-2 rounded border border-[#E5E6EB] bg-[#F7F8FA] p-1">
                                                {newGradeClasses.map(className => {
                                                    const active = activeGradeClassSheet === className;
                                                    const progress = getGradeClassProgress(className);
                                                    return (
                                                        <button
                                                            key={className}
                                                            type="button"
                                                            onClick={() => handleSwitchGradeClassSheet(className)}
                                                            className={`h-[46px] min-w-[124px] rounded px-3 text-left text-sm transition-colors duration-150 ${active ? 'bg-[#165DFF] text-white shadow-[0_2px_6px_rgba(22,93,255,0.18)]' : 'bg-transparent text-[#4E5969] hover:bg-white hover:text-[#165DFF]'}`}
                                                        >
                                                            <div className="whitespace-nowrap font-medium leading-5">{className}</div>
                                                            <div className={`mt-0.5 whitespace-nowrap text-[12px] leading-4 ${active ? 'text-white/85' : progress.isComplete ? 'text-[#00B42A]' : 'text-[#FF7D00]'}`}>
                                                                {progress.isComplete ? '已完成' : '未完成'} {progress.completed}/{progress.total}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                                </div>
                                            </div>
                                        )}
                                        {gradePageMode !== 'view' && activeGradeClassSheet && (
                                            <div className="mb-4 flex min-w-[420px] items-center">
                                                <span className="w-[120px] shrink-0 text-right text-sm font-medium text-[#1D2129]">快捷操作：</span>
                                                <button
                                                    type="button"
                                                    onClick={handleFillGradeStudents}
                                                    className="ml-3 h-8 rounded border-0 bg-[#165DFF] px-4 text-sm font-normal text-white transition-colors hover:bg-[#4080FF] active:bg-[#0E42D2] focus:outline-none"
                                                >
                                                    填充本班学生姓名
                                                </button>
                                            </div>
                                        )}
                                        {(!activeGradeClassSheet || newGradeSubjects.length === 0) ? (
                                            <div className="ml-[132px] flex h-24 w-[420px] items-center justify-center border border-[#E5E6EB] bg-white text-sm font-normal text-[#86909C] rounded">请选择班级和科目</div>
                                        ) : (
                                        <table className="ml-[132px] border-collapse text-center text-sm font-normal text-[#4E5969] border border-[#E5E6EB] rounded">
                                            <thead>
                                                <tr className="bg-[#F7F8FA] text-[#1D2129]">
                                                    <th className="h-12 w-[60px] whitespace-nowrap border border-[#E5E6EB] px-2 text-[#86909C] font-semibold bg-[#F7F8FA]">序号</th>
                                                    <th className="h-12 w-[120px] border border-[#E5E6EB] px-2 font-semibold bg-[#F7F8FA]">姓名</th>
                                                    {newGradeSubjects.map(subject => (
                                                        <th
                                                            key={subject}
                                                            draggable={gradePageMode !== 'view'}
                                                            onDragStart={() => gradePageMode !== 'view' && setDraggedGradeSubject(subject)}
                                                            onDragOver={(event) => event.preventDefault()}
                                                            onDrop={() => gradePageMode !== 'view' && handleDropGradeSubject(subject)}
                                                            onDragEnd={() => setDraggedGradeSubject(null)}
                                                            className={`h-16 w-[168px] border border-[#E5E6EB] px-2 font-semibold ${gradePageMode !== 'view' ? 'cursor-move' : ''} ${draggedGradeSubject === subject ? 'bg-[#E8F3FF] text-[#165DFF]' : 'bg-[#F7F8FA]'}`}
                                                            title={gradePageMode !== 'view' ? "拖动可调整科目列顺序" : undefined}
                                                        >
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="flex items-center gap-1 text-[#1D2129]">
                                                                    {gradePageMode !== 'view' && <span className="text-[12px] text-[#86909C]">↔</span>}
                                                                    <span>{subject}</span>
                                                                </div>
                                                                {gradePageMode !== 'view' && (
                                                                    <div className="flex h-6 items-center gap-1 mt-1">
                                                                        <div className="group relative w-[72px]">
                                                                            <select
                                                                                value={gradeColumnFillValues[subject] || ''}
                                                                                onChange={(event) => setGradeColumnFillValues(values => ({ ...values, [subject]: event.target.value }))}
                                                                                className={`h-6 w-full appearance-none rounded border border-[#E5E6EB] py-0 pl-1 pr-5 text-[12px] font-normal outline-none focus:border-[#165DFF] ${gradeColumnFillValues[subject] ? getGradeScoreColorClass(gradeColumnFillValues[subject]) : 'bg-white text-[#86909C]'}`}
                                                                                style={gradeColumnFillValues[subject] ? getExamLevelColorStyle(gradeColumnFillValues[subject]) : undefined}
                                                                            >
                                                                                <option value="" hidden disabled>等级</option>
                                                                                {gradeScoreSelectOptions.map(option => <option key={option.value} value={option.value} className="text-[#1D2129]">{option.label}</option>)}
                                                                            </select>
                                                                            <ChevronDown size={12} className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#86909C] ${gradeColumnFillValues[subject] ? 'group-hover:hidden group-focus-within:hidden' : ''}`} />
                                                                            {gradeColumnFillValues[subject] && (
                                                                                <button
                                                                                    type="button"
                                                                                    onMouseDown={(event) => event.preventDefault()}
                                                                                    onClick={() => setGradeColumnFillValues(values => ({ ...values, [subject]: '' }))}
                                                                                    className="absolute right-1 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full text-[12px] leading-none text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#4E5969] group-hover:flex group-focus-within:flex"
                                                                                    aria-label={`清除${subject}批量设置等级`}
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleFillGradeColumn(subject)}
                                                                            className="h-6 w-[68px] rounded border border-[#E5E6EB] bg-white text-[12px] text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] transition-all"
                                                                        >
                                                                            批量设置
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {newGradeStudents.map((student, index) => (
                                                    <tr key={student.id}>
                                                        <td className="h-8 w-[60px] whitespace-nowrap border border-[#E5E6EB] bg-[#F7F8FA] px-2 text-[#86909C]">{index + 1}</td>
                                                        <td className="h-8 w-[120px] border border-[#E5E6EB] bg-white p-0">
                                                            <input
                                                                value={student.name}
                                                                onChange={(event) => handleChangeStudentIdentity(student.id, 'name', event.target.value)}
                                                                onMouseDown={(event) => gradePageMode !== 'view' && handleGradeCellMouseDown(index, 0, event)}
                                                                onMouseEnter={() => gradePageMode !== 'view' && handleGradeCellMouseEnter(index, 0)}
                                                                onMouseUp={stopGradeCellDrag}
                                                                onKeyDown={(event) => gradePageMode !== 'view' && handleGradeCellKeyDown(index, 0, event)}
                                                                onPaste={(event) => gradePageMode !== 'view' && handlePasteGradeTable(index, 0, event)}
                                                                readOnly={gradePageMode === 'view'}
                                                                data-grade-cell={`${index}-0`}
                                                                className={`h-[32px] w-[120px] border-0 bg-transparent px-[6px] text-center text-[14px] font-normal text-[#333333] outline-none focus:bg-[#E8F3FF] focus:ring-1 focus:ring-inset focus:ring-[#165DFF] ${selectedGradeCellSet.has(getGradeCellKey(index, 0)) && gradePageMode !== 'view' ? 'bg-[#E8F3FF] ring-1 ring-inset ring-[#165DFF]' : ''}`}
                                                                aria-label={`第${index + 1}行姓名`}
                                                            />
                                                        </td>
                                                        {newGradeSubjects.map((subject, subjectIndex) => (
                                                            <td key={subject} className="h-[32px] w-[168px] border border-[#DADCE0] bg-white p-0">
                                                                <input
                                                                    value={student.scores[subject] || ''}
                                                                    onChange={(event) => handleChangeStudentGrade(student.id, subject, event.target.value)}
                                                                    onMouseDown={(event) => gradePageMode !== 'view' && handleGradeCellMouseDown(index, subjectIndex + 1, event)}
                                                                    onMouseEnter={() => gradePageMode !== 'view' && handleGradeCellMouseEnter(index, subjectIndex + 1)}
                                                                    onMouseUp={stopGradeCellDrag}
                                                                    onKeyDown={(event) => gradePageMode !== 'view' && handleGradeCellKeyDown(index, subjectIndex + 1, event)}
                                                                    onPaste={(event) => gradePageMode !== 'view' && handlePasteGradeTable(index, subjectIndex + 1, event)}
                                                                    readOnly={gradePageMode === 'view'}
                                                                    data-grade-cell={`${index}-${subjectIndex + 1}`}
                                                                    className={`h-[32px] w-[168px] border-0 px-[6px] text-center text-[14px] font-normal outline-none focus:bg-[#E8F3FF] focus:ring-1 focus:ring-inset focus:ring-[#165DFF] ${getGradeScoreColorClass(student.scores[subject] || '')} ${selectedGradeCellSet.has(getGradeCellKey(index, subjectIndex + 1)) && gradePageMode !== 'view' ? 'bg-[#E8F3FF] ring-1 ring-inset ring-[#165DFF]' : ''}`}
                                                                    style={getExamLevelColorStyle(student.scores[subject] || '')}
                                                                    aria-label={`${student.name || `第${index + 1}行`}${subject}成绩`}
                                                                />
                                                             </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        )}
                                    </div>
                                </section>
                                )}

                                <div className="mt-4 flex justify-center gap-3 py-3">
                                    <button
                                        type="button"
                                        onClick={() => setGradePageMode('list')}
                                        className="h-8 w-[78px] rounded border border-[#E5E6EB] bg-white text-sm font-normal text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] active:border-[#0E42D2] transition-colors focus:outline-none"
                                    >
                                        返回
                                    </button>
                                    {gradePageMode !== 'view' && gradePageMode !== 'examView' && (
                                        <button
                                            type="button"
                                            onClick={handleSaveGradeExam}
                                            className="h-8 w-[78px] rounded border-0 bg-[#165DFF] text-sm font-normal text-white hover:bg-[#4080FF] active:bg-[#0E42D2] transition-colors focus:outline-none"
                                        >
                                            确定
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    {/* 其它待开发 */}
                    {['学校驾驶舱', '评价指标管理'].includes(activeMenu) && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400 animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <Settings size={40} />
                            </div>
                            <h4 className="text-xl font-black text-slate-400">【{activeMenu}】模块打磨中</h4>
                            <p className="text-slate-300 font-bold mt-2 text-center max-w-xs">正在为您设计极致的交互体验，请稍后体验...</p>
                        </div>
                    )}
                </main>
            </div >


            {/* Exam Level Modal */}
            {examLevelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-[420px] rounded bg-white shadow-xl border border-[#E5E6EB]">
                        <div className="flex h-14 items-center justify-between border-b border-[#E5E6EB] px-6">
                            <h3 className="m-0 text-base font-semibold text-[#1D2129]">{editingExamLevel ? '编辑考试等级' : '新增考试等级'}</h3>
                            <button type="button" onClick={() => setExamLevelModalOpen(false)} className="text-[#86909C] hover:text-[#4E5969]" aria-label="关闭考试等级弹窗">×</button>
                        </div>
                        <div className="px-6 py-5">
                            <label className="mb-2 block text-sm font-medium text-[#1D2129]">等级名称</label>
                            <Input
                                value={examLevelForm.name}
                                onChange={(value) => setExamLevelForm(form => ({ ...form, name: value }))}
                                placeholder="请输入等级名称"
                                maxLength={12}
                                showWordLimit
                            />
                            <label className="mb-2 mt-5 block text-sm font-medium text-[#1D2129]">颜色</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={examLevelForm.color}
                                    onChange={(event) => setExamLevelForm(form => ({ ...form, color: event.target.value }))}
                                    className="h-8 w-12 cursor-pointer rounded border border-[#E5E6EB] bg-white p-0.5"
                                    aria-label="选择考试等级颜色"
                                />
                                <Input
                                    value={examLevelForm.color}
                                    onChange={(value) => setExamLevelForm(form => ({ ...form, color: value }))}
                                    placeholder="#165DFF"
                                    style={{ width: 160 }}
                                />
                                <span className="inline-flex h-6 items-center rounded px-2 text-xs font-medium" style={buildExamLevelColorStyle(examLevelForm.color)}>
                                    {examLevelForm.name || '预览'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-[#E5E6EB] px-6 py-4">
                            <Button onClick={() => setExamLevelModalOpen(false)}>取消</Button>
                            <Button type="primary" onClick={handleSaveExamLevel}>确定</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {roleModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <KeyRound size={20} className="text-blue-600" />
                                {roleModalMode === 'config' ? '配置权限' : roleModalMode === 'editName' ? '编辑角色' : '新增角色'}
                            </h3>
                            <button onClick={() => { setRoleModalOpen(false); setEditingRole(null); }} className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-95">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        <form
                            className="p-8 space-y-6 overflow-y-auto custom-scrollbar"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                if (roleModalMode === 'config') {
                                    handleSaveRole({
                                        featureScope: selectedPermissionValues.length > 0 ? selectedPermissionValues.join('、') : '未配置',
                                        dataPolicy: formData.get('dataPolicy') as string
                                    });
                                    return;
                                }
                                handleSaveRole({
                                    name: formData.get('name') as string,
                                    status: roleModalMode === 'create' ? (formData.get('status') as string) : editingRole?.status,
                                    featureScope: roleModalMode === 'create' ? (selectedPermissionValues.length > 0 ? selectedPermissionValues.join('、') : '未配置') : (editingRole?.featureScope || '未配置'),
                                    dataPolicy: roleModalMode === 'create' ? (formData.get('dataPolicy') as string) : (editingRole?.dataPolicy || '任教与管理范围')
                                });
                            }}
                        >
                            {roleModalMode !== 'config' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">角色名称</label>
                                    <input
                                        name="name"
                                        defaultValue={editingRole?.name || ''}
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="例如：德育主任"
                                    />
                                </div>
                            )}

                            {roleModalMode === 'create' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">状态</label>
                                        <select name="status" defaultValue="启用" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            <option>启用</option>
                                            <option>禁用</option>
                                        </select>
                                    </div>
                                    <div className="flex bg-slate-100 rounded-xl p-1 self-start">
                                        <button type="button" onClick={() => setRoleConfigTab('feature')} className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${roleConfigTab === 'feature' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>功能权限</button>
                                        <button type="button" onClick={() => setRoleConfigTab('data')} className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${roleConfigTab === 'data' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>数据权限</button>
                                    </div>
                                    {roleConfigTab === 'feature' && (
                                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                            {permissionTree.map(menu => {
                                                const menuValues = getMenuValues(menu);
                                                const menuChecked = menuValues.every(value => selectedPermissionValues.includes(value));
                                                return (
                                                    <div key={menu.menu} className="border-b border-slate-100 last:border-0">
                                                        <div className="h-11 px-4 bg-slate-50 flex items-center gap-3">
                                                            <button type="button" onClick={() => setExpandedPermissionMenus(prev => ({ ...prev, [menu.menu]: !prev[menu.menu] }))} className="w-6 h-6 rounded-lg bg-white border border-slate-100 text-slate-400 flex items-center justify-center active:scale-95">
                                                                {expandedPermissionMenus[menu.menu] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                            </button>
                                                            <input type="checkbox" checked={menuChecked} onChange={(e) => togglePermissionValues(menuValues, e.target.checked)} className="accent-blue-600" />
                                                            <span className="font-black text-sm text-slate-800">{menu.menu}</span>
                                                        </div>
                                                        {expandedPermissionMenus[menu.menu] && (
                                                            <div>
                                                                {menu.pages.map(page => {
                                                                    const pageValues = getPageValues(page);
                                                                    const pageChecked = pageValues.every(value => selectedPermissionValues.includes(value));
                                                                    return (
                                                                        <div key={page.page} className="min-h-11 px-4 pl-12 border-t border-slate-50 flex items-center gap-4">
                                                                            <label className="w-36 shrink-0 flex items-center gap-2 text-sm font-bold text-slate-700">
                                                                                <input type="checkbox" checked={pageChecked} onChange={(e) => togglePermissionValues(pageValues, e.target.checked)} className="accent-blue-600" />
                                                                                {page.page}
                                                                            </label>
                                                                            <div className="flex flex-wrap gap-2 py-2">
                                                                                {page.buttons.map(button => {
                                                                                    const value = `${page.page}-${button}`;
                                                                                    return (
                                                                                        <label key={value} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 cursor-pointer hover:text-blue-600 hover:border-blue-200 transition-colors">
                                                                                            <input type="checkbox" checked={selectedPermissionValues.includes(value)} onChange={(e) => togglePermissionValues([value], e.target.checked)} className="accent-blue-600 mr-1.5" />
                                                                                            {button}
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {roleConfigTab === 'data' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">数据权限</label>
                                            <select name="dataPolicy" defaultValue="任教与管理范围" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                                <option>全校数据</option>
                                                <option>任教与管理范围</option>
                                            </select>
                                        </div>
                                    )}
                                    {roleConfigTab === 'feature' && <input type="hidden" name="dataPolicy" value="任教与管理范围" />}
                                </>
                            )}

                            {roleModalMode === 'config' && (
                                <>
                                    <div className="flex bg-slate-100 rounded-xl p-1 self-start">
                                        <button type="button" onClick={() => setRoleConfigTab('feature')} className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${roleConfigTab === 'feature' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>功能权限</button>
                                        <button type="button" onClick={() => setRoleConfigTab('data')} className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${roleConfigTab === 'data' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>数据权限</button>
                                    </div>

                                    {roleConfigTab === 'feature' && (
                                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                            {permissionTree.map(menu => {
                                                const menuValues = getMenuValues(menu);
                                                const menuChecked = menuValues.every(value => selectedPermissionValues.includes(value));
                                                return (
                                                    <div key={menu.menu} className="border-b border-slate-100 last:border-0">
                                                        <div className="h-11 px-4 bg-slate-50 flex items-center gap-3">
                                                            <button type="button" onClick={() => setExpandedPermissionMenus(prev => ({ ...prev, [menu.menu]: !prev[menu.menu] }))} className="w-6 h-6 rounded-lg bg-white border border-slate-100 text-slate-400 flex items-center justify-center active:scale-95">
                                                                {expandedPermissionMenus[menu.menu] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                            </button>
                                                            <input type="checkbox" checked={menuChecked} onChange={(e) => togglePermissionValues(menuValues, e.target.checked)} className="accent-blue-600" />
                                                            <span className="font-black text-sm text-slate-800">{menu.menu}</span>
                                                        </div>
                                                        {expandedPermissionMenus[menu.menu] && (
                                                            <div>
                                                                {menu.pages.map(page => {
                                                                    const pageValues = getPageValues(page);
                                                                    const pageChecked = pageValues.every(value => selectedPermissionValues.includes(value));
                                                                    return (
                                                                        <div key={page.page} className="min-h-11 px-4 pl-12 border-t border-slate-50 flex items-center gap-4">
                                                                            <label className="w-36 shrink-0 flex items-center gap-2 text-sm font-bold text-slate-700">
                                                                                <input type="checkbox" checked={pageChecked} onChange={(e) => togglePermissionValues(pageValues, e.target.checked)} className="accent-blue-600" />
                                                                                {page.page}
                                                                            </label>
                                                                            <div className="flex flex-wrap gap-2 py-2">
                                                                                {page.buttons.map(button => {
                                                                                    const value = `${page.page}-${button}`;
                                                                                    return (
                                                                                        <label key={value} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 cursor-pointer hover:text-blue-600 hover:border-blue-200 transition-colors">
                                                                                            <input type="checkbox" checked={selectedPermissionValues.includes(value)} onChange={(e) => togglePermissionValues([value], e.target.checked)} className="accent-blue-600 mr-1.5" />
                                                                                            {button}
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {roleConfigTab === 'data' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">数据权限</label>
                                            <select name="dataPolicy" defaultValue={editingRole?.dataPolicy || '任教与管理范围'} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                                <option>全校数据</option>
                                                <option>任教与管理范围</option>
                                            </select>
                                        </div>
                                    )}
                                    {roleConfigTab === 'feature' && <input type="hidden" name="dataPolicy" value={editingRole?.dataPolicy || '任教与管理范围'} />}
                                </>
                            )}

                            <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => { setRoleModalOpen(false); setEditingRole(null); }} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
                                    取消
                                </button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teachers Modal */}
            {assignRole && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                            <h3 className="font-black text-slate-800 text-lg">分配人员</h3>
                            <button onClick={() => setAssignRole(null)} className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-95">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <div className="h-11 px-4 bg-slate-50 flex items-center justify-between">
                                    <span className="text-sm font-black text-slate-800">已分配成员</span>
                                    <span className="text-xs font-black text-slate-400">{assignedTeacherPhones.length} 人</span>
                                </div>
                                <div className="max-h-52 overflow-y-auto custom-scrollbar">
                                    {teacherAccounts
                                        .filter(teacher => assignedTeacherPhones.includes(teacher.phone))
                                        .slice((assignedPage - 1) * assignPageSize, assignedPage * assignPageSize)
                                        .map(teacher => (
                                            <div key={teacher.phone} className="grid grid-cols-[1fr_150px_130px_80px] items-center px-4 py-3 border-t border-slate-50">
                                                <div className="font-black text-slate-800">{teacher.name}</div>
                                                <div className="text-sm font-bold text-slate-500">{teacher.phone}</div>
                                                <div className="text-sm font-bold text-slate-500">{teacher.dept}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAssignedTeacherPhones(prev => {
                                                        const next = prev.filter(phone => phone !== teacher.phone);
                                                        setAssignedPage(Math.min(assignedPage, Math.max(1, Math.ceil(next.length / assignPageSize))));
                                                        return next;
                                                    })}
                                                    className="justify-self-end px-3 py-1.5 rounded-lg border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        ))}
                                    {assignedTeacherPhones.length === 0 && (
                                        <div className="px-4 py-8 text-center text-sm font-bold text-slate-300 border-t border-slate-50">暂无成员</div>
                                    )}
                                </div>
                                {assignedTeacherPhones.length > assignPageSize && (
                                    <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
                                        <button type="button" disabled={assignedPage === 1} onClick={() => setAssignedPage(prev => Math.max(1, prev - 1))} className="px-3 py-1.5 rounded-lg border border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-95">上一页</button>
                                        <span>{assignedPage} / {Math.ceil(assignedTeacherPhones.length / assignPageSize)}</span>
                                        <button type="button" disabled={assignedPage >= Math.ceil(assignedTeacherPhones.length / assignPageSize)} onClick={() => setAssignedPage(prev => Math.min(Math.ceil(assignedTeacherPhones.length / assignPageSize), prev + 1))} className="px-3 py-1.5 rounded-lg border border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-95">下一页</button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="搜索教师姓名、手机号、部门" />
                                </div>
                                <button type="button" onClick={handleSearchAssignableTeachers} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 active:scale-95 transition-all">搜索</button>
                            </div>

                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-[1fr_150px_130px_80px] px-4 py-3 bg-slate-50 text-[11px] font-black text-slate-400 tracking-[0.12em]">
                                    <div>搜索结果</div>
                                    <div>手机号</div>
                                    <div>部门</div>
                                    <div className="text-right">操作</div>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {assignSearchResults
                                        .filter(teacher => !assignedTeacherPhones.includes(teacher.phone))
                                        .slice((assignSearchPage - 1) * assignPageSize, assignSearchPage * assignPageSize)
                                        .map(teacher => (
                                            <div key={teacher.phone} className="grid grid-cols-[1fr_150px_130px_80px] items-center px-4 py-3 border-t border-slate-50 hover:bg-slate-50">
                                                <div className="font-black text-slate-800">{teacher.name}</div>
                                                <div className="text-sm font-bold text-slate-500">{teacher.phone}</div>
                                                <div className="text-sm font-bold text-slate-500">{teacher.dept}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAssignedTeacherPhones(prev => [...prev, teacher.phone]);
                                                        setAssignSearchResults(prev => prev.filter(item => item.phone !== teacher.phone));
                                                    }}
                                                    className="justify-self-end px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-black text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                                                >
                                                    分配
                                                </button>
                                            </div>
                                        ))}
                                    {assignSearchResults.length === 0 && (
                                        <div className="px-4 py-8 text-center text-sm font-bold text-slate-300 border-t border-slate-50">点击搜索后展示结果</div>
                                    )}
                                </div>
                                {assignSearchResults.length > assignPageSize && (
                                    <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
                                        <button type="button" disabled={assignSearchPage === 1} onClick={() => setAssignSearchPage(prev => Math.max(1, prev - 1))} className="px-3 py-1.5 rounded-lg border border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-95">上一页</button>
                                        <span>{assignSearchPage} / {Math.ceil(assignSearchResults.length / assignPageSize)}</span>
                                        <button type="button" disabled={assignSearchPage >= Math.ceil(assignSearchResults.length / assignPageSize)} onClick={() => setAssignSearchPage(prev => Math.min(Math.ceil(assignSearchResults.length / assignPageSize), prev + 1))} className="px-3 py-1.5 rounded-lg border border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-95">下一页</button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setAssignRole(null)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
                                    取消
                                </button>
                                <button type="button" onClick={() => handleSaveAssignedTeachers(assignRole.name, assignedTeacherPhones.length)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shop Product Modal */}
            {
                isShopModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <Package size={20} className="text-blue-600" />
                                    {editingShopProduct ? '编辑商品' : '新增商品'}
                                </h3>
                                <button onClick={() => setIsShopModalOpen(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <form id="shop-product-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const newProduct = {
                                        id: editingShopProduct?.id || Date.now(),
                                        name: formData.get('name') as string,
                                        price: Number(formData.get('price')),
                                        icon: modalIcon
                                    };
                                    handleSaveShopProduct(newProduct);
                                }}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">商品名称</label>
                                            <input name="name" defaultValue={editingShopProduct?.name || ''} required className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" placeholder="例如：校庆限量徽章" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">售价 (校园币)</label>
                                            <input type="number" name="price" defaultValue={editingShopProduct?.price || 10} required min="0" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-orange-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-4">商品图片设置 (支持默认或上传)</label>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { id: '1', url: '/assets/c4d_shop.png', name: '默认商品图' }
                                            ].map(icon => (
                                                <button
                                                    key={icon.id}
                                                    type="button"
                                                    onClick={() => setModalIcon(icon.url)}
                                                    className={`relative p-3 rounded-2xl border-2 transition-all active:scale-95 group w-24 ${modalIcon === icon.url ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-slate-100 bg-slate-50'}`}
                                                >
                                                    <div className="w-full h-12 rounded-xl flex items-center justify-center bg-white shadow-sm mb-2 p-1.5 relative overflow-hidden">
                                                        <img src={icon.url} alt={icon.name} className={`w-full h-full object-contain transition-transform z-10 ${modalIcon === icon.url ? 'drop-shadow-sm scale-110' : ''}`} />
                                                    </div>
                                                    <span className={`text-[11px] font-bold block text-center ${modalIcon === icon.url ? 'text-blue-700' : 'text-slate-500'}`}>{icon.name}</span>
                                                    {modalIcon === icon.url && (
                                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                                            <Check size={12} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}

                                            {/* 自定义上传 */}
                                            <div className="relative w-24 p-3 rounded-2xl border-2 border-dashed border-slate-200 active:border-blue-300 active:bg-blue-50 transition-all group flex flex-col items-center justify-center">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                if (event.target?.result) {
                                                                    setModalIcon(event.target.result as string);
                                                                }
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <div className="w-full h-12 rounded-xl flex flex-col items-center justify-center bg-white shadow-sm mb-2 p-1.5 text-slate-400 group-active:text-blue-500">
                                                    <Upload size={20} className="mb-0.5" />
                                                </div>
                                                <span className="text-[11px] font-bold block text-center text-slate-500 group-active:text-blue-600">自定义图片</span>
                                            </div>
                                        </div>
                                        {modalIcon && !modalIcon.startsWith('/assets/') && (
                                            <div className="mt-4 p-3 border border-blue-100 bg-blue-50 rounded-xl flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                    <img src={modalIcon} className="w-full h-full object-cover" alt="已上传图片" />
                                                </div>
                                                <div className="text-sm font-bold text-blue-700 flex-1">已成功应用自定义图片</div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                                <button onClick={() => setIsShopModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button>
                                <button type="submit" form="shop-product-form" className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">保存</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Channel Configuration Modal */}
            {
                isChannelModalOpen && editingChannel && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <Monitor size={20} className="text-blue-600" />
                                    货道 {editingChannel.id} 配置 ({editingChannel.type})
                                </h3>
                                <button onClick={() => setIsChannelModalOpen(false)} className="text-slate-400 active:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <form id="channel-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const productId = formData.get('productId') ? Number(formData.get('productId')) : null;
                                    const newChannel = {
                                        ...editingChannel,
                                        productId: productId,
                                        stock: productId ? Number(formData.get('stock')) : 0
                                    };
                                    handleSaveChannel(newChannel);
                                }}>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">选择商品放入货道</label>
                                        <select name="productId" defaultValue={editingChannel.productId || ''} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-bold">
                                            <option value="">-- 置空货道 --</option>
                                            {shopProducts.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (售价: {p.price})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">当前库存 (上限10件)</label>
                                        <div className="relative">
                                            <input id="stock-input" type="number" name="stock" defaultValue={editingChannel.stock || 0} min="0" max="10" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-700 pr-12" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ 10</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                                <button onClick={() => setIsChannelModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 active:bg-slate-200 transition-colors border border-slate-200">取消</button>
                                <button type="submit" form="channel-form" className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 active:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">放置商品</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 储蓄银行产品配置 Modal */}
            {
                isProductModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Landmark size={20} className="text-indigo-500" />
                                    {editingProduct ? '编辑储蓄产品' : '添加新产品'}
                                </h3>
                                <button
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                let autoRate = Number(formData.get('rate')) / 100;
                                let autoDesc = `满期固定利息${(autoRate * 100).toFixed(1)}%`;

                                handleSaveProduct({
                                    id: editingProduct?.id || Date.now(),
                                    label: formData.get('label') as string,
                                    days: Number(formData.get('days')),
                                    rate: autoRate,
                                    min: Number(formData.get('min')),
                                    desc: autoDesc
                                });
                            }} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">产品名称 <span className="text-red-500">*</span></label>
                                    <input name="label" required defaultValue={editingProduct?.label || ''} placeholder="例如：定期存单-1周" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">存期 (天) <span className="text-red-500">*</span></label>
                                        <input
                                            name="days" type="number" required min="1"
                                            value={modalDays}
                                            onChange={(e) => setModalDays(Math.max(1, Number(e.target.value)))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-right"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5 gap-1">
                                            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">满期利率 (%) <span className="text-red-500">*</span></label>
                                            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm whitespace-nowrap">
                                                折合年化: {((modalRate / (modalDays || 1)) * 365).toFixed(1)}%
                                            </span>
                                        </div>
                                        <input
                                            name="rate" type="number" step="0.01" required min="0"
                                            value={modalRate}
                                            onChange={(e) => setModalRate(Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-right"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">起存金额 (校园币) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input name="min" type="number" required min="1" defaultValue={editingProduct?.min || 1} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                        取消
                                    </button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95">
                                        保存产品
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TeacherDashboard;
