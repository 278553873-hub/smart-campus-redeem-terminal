import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Student } from '../types';
import {
    MOCK_SUBJECTS,
    MOCK_PE_REPORT_DETAILS,
    MOCK_ACTIVITIES,
    SUBJECT_REPORT_OVERRIDES,
    MOCK_GRADE_SUBJECT_REPORT_TEMPLATES,
    MOCK_SUBJECT_REPORT_TEMPLATES,
    MOCK_TERM_REPORT_AI_DATA,
    MOCK_TERM_REPORT_AI_DATA_FEMALE
} from '../constants';
import { ASSETS } from '../assets/images';
import SubjectRadarChart from '../components/SubjectRadarChart';
import SubjectGradesChart from '../components/SubjectGradesChart';
import FiveEducationRadarSimple from '../components/FiveEducationRadarSimple';
import {
    Printer, ChevronLeft, ChevronRight, CornerDownLeft,
    BookOpen, Calendar, TrendingUp, Home, Palmtree,
    PenTool, Star, MapPin, BrainCircuit, HeartHandshake, Map, Clock, Target,
    Calculator, Languages, FlaskConical, Monitor, Palette, Smile, Dumbbell,
    Award, Quote, Sparkles, Smartphone, FileText, Compass, Megaphone, Layout, Users,
    Sun, MessageSquare, PenLine, Edit3, ArrowUpRight, Anchor, Lightbulb, X, Layers
} from 'lucide-react';
import { BackIcon } from '../components/Icons';

// --- 0. AI CONTENT RENDERING ---
const RichTextDisplay = ({ html, className = "" }: { html: string, className?: string }) => (
    <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

interface TermReportViewProps {
    student: Student;
    onBack: () => void;
}

// --- 1. DESIGN SYSTEM (TYPOGRAPHY & LAYOUT) ---

// Spacing Constants
const SPACING = {
    pagePad: "px-5 py-6", // Standard Mobile Page Padding
    cardPad: "p-5",       // Standard Card Padding
    sectionGap: "mb-8",   // Gap between main sections
    itemGap: "gap-4",     // Gap between list items
};

// A. Page Container (Base Wrapper)
const ReportPageContainer = ({ children, className = "", mode = 'mobile', id }: { children: React.ReactNode, className?: string, mode?: 'a4' | 'mobile', id?: string, key?: any }) => (
    <div
        id={id}
        className={`
            relative w-full bg-white scroll-mt-[100px]
            ${mode === 'a4'
                ? 'w-[210mm] min-h-[297mm] mx-auto p-[15mm] mb-8 shadow-xl print:shadow-none print:mb-0 print:p-[15mm] page-break'
                : `w-full min-h-screen ${SPACING.pagePad} border-b-8 border-[#F2F4F8] last:border-0`
            }
            ${className}
        `}
    >
        {children}
        {mode === 'a4' && (
            <div className="hidden print:flex absolute bottom-[10mm] left-[15mm] right-[15mm] justify-between border-t border-slate-100 pt-2">
                <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">Student Growth Pulse</span>
                <span className="text-[9px] text-slate-300 page-number"></span>
            </div>
        )}
    </div>
);

// B. Section Header (Standardized Title Block)
// B. Section Header (Standardized Title Block)
const ReportSectionHeader = ({ title, subTitle, icon: Icon, className = "", badge, rightElement }: { title: string, subTitle: string, icon: any, className?: string, badge?: string, rightElement?: React.ReactNode }) => (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 leading-none">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
            {badge && (
                <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-black tracking-wider uppercase border border-blue-100">
                    {badge}
                </span>
            )}
            {rightElement}
        </div>
    </div>
);

// C. Standard Card (White Box)
const ReportCard = ({ children, className = "", noPadding = false, highlight = false }: { children: React.ReactNode, className?: string, noPadding?: boolean, highlight?: boolean, key?: any }) => (
    <div className={`
        rounded-2xl border transition-all duration-300
        ${highlight
            ? 'bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-sm'
            : 'bg-white border-slate-100 shadow-sm'
        }
        ${noPadding ? '' : SPACING.cardPad}
        ${className}
    `}>
        {children}
    </div>
);

// D. Typography Components
const ReportCardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h3 className={`text-[15px] font-bold text-slate-800 mb-2 leading-tight ${className}`}>
        {children}
    </h3>
);

const ReportBodyText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`text-[13px] text-slate-600 leading-7 text-justify ${className}`}>
        {children}
    </div>
);

const ReportCaption = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <p className={`text-[11px] text-slate-400 leading-normal ${className}`}>
        {children}
    </p>
);

const ReportTag = ({ children, color = "blue" }: { children: React.ReactNode, color?: 'blue' | 'green' | 'orange' | 'purple' }) => {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
    };
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${styles[color] || styles.blue}`}>
            {children}
        </span>
    );
};

// --- 2. HELPER COMPONENTS ---

// Text Display (Read-only - no editing, just display text)
const TextDisplay = ({
    value,
    className = "",
    align = "left"
}: {
    value: string,
    className?: string,
    align?: "left" | "center" | "right"
}) => {
    // 保留换行符的显示
    const formatText = (text: string) => {
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className={`w-full ${className} text-${align}`}>
            {formatText(value)}
        </div>
    );
};

// EditableArea - 兼容包装器（只读模式）
const EditableArea = ({
    value,
    onChange,
    className = "",
    multiline = false,
    placeholder = "",
    align = "left"
}: {
    value: string,
    onChange?: (val: string) => void,
    className?: string,
    multiline?: boolean,
    placeholder?: string,
    align?: "left" | "center" | "right"
}) => {
    // 只读模式，直接显示文本
    return <TextDisplay value={value} className={className} align={align} />;
};

// --- 3. PAGE SECTIONS ---

const COVER_TRAITS = [
    { label: '全面发展', className: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: '成熟可靠', className: 'bg-pink-50 text-pink-600 border-pink-100' },
    { label: '独立自主', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
];

// 1. Cover Page
const PageCover = ({ student, onStart, mode = 'mobile' }: { student: Student, onStart: () => void, mode?: 'a4' | 'mobile', key?: any }) => {
    const classLabel = student.class || '2025级一班';
    const gradeLabel = student.grade || '一年级';
    const termLabel = '2025-2026学年 上学期';

    return (
        <ReportPageContainer mode={mode} className="flex flex-col items-center justify-between text-center bg-gradient-to-b from-blue-50/30 to-white overflow-hidden min-h-[600px]">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[30%] bg-blue-100/40 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[30%] bg-purple-100/40 rounded-full blur-[80px]"></div>

            <div className="mt-16 relative z-10 w-full px-8">
                <div className="w-12 h-1.5 bg-blue-600 mx-auto rounded-full mb-6"></div>
                <h1 className="text-[32px] sm:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-3">学期成长手册</h1>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">Semester Growth Report</p>
            </div>

            <div className="flex-1 w-full flex items-center justify-center relative z-10 py-8">
                <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] relative flex items-center justify-center">
                    <div className="absolute inset-4 bg-gradient-to-tr from-white to-blue-50 rounded-full border border-white shadow-2xl shadow-blue-100/50"></div>
                    <img
                        src={student.gender === 'male' ? ASSETS.COVER.BOY : ASSETS.COVER.GIRL}
                        alt="Cover"
                        className="relative w-full h-full object-contain drop-shadow-xl z-20"
                    />
                </div>
            </div>

            <div className="w-full pb-16 z-10 px-8">
                <div className="bg-white/70 backdrop-blur-md border border-white rounded-3xl p-8 shadow-xl max-w-sm mx-auto space-y-3">
                    <div className="text-2xl font-black text-slate-800">{student.name}</div>
                    <div className="flex items-center justify-center gap-3 text-[13px] text-slate-600 font-semibold tracking-wide whitespace-nowrap">
                        <span>{classLabel}</span>
                        <span className="text-slate-300">|</span>
                        <span>{gradeLabel}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em]">{termLabel}</div>
                    <div className="flex items-center justify-center gap-2.5 pt-4">
                        {(student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE.studentTags : MOCK_TERM_REPORT_AI_DATA.studentTags).map((tag, idx) => (
                            <span
                                key={tag}
                                className={`text-[11px] px-3 py-1.5 rounded-lg font-black tracking-tight border whitespace-nowrap ${COVER_TRAITS[idx % COVER_TRAITS.length].className}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                Future Education System
            </div>
        </ReportPageContainer>
    );
};

// 2. School Profile
const PageSchoolProfile = ({ mode = 'mobile', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => (
    <ReportPageContainer mode={mode} id={id}>
        <ReportSectionHeader title="学校风采" subTitle="School Profile" icon={Home} />

        <ReportCard noPadding className="overflow-hidden">
            <div className="h-48 overflow-hidden relative">
                <img src={ASSETS.ACTIVITY.SCHOOL} className="w-full h-full object-cover" alt="School" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Motto</div>
                    <div className="text-lg font-serif italic">博学笃行，格物致知</div>
                </div>
            </div>
            <div className="p-5">
                <ReportBodyText>
                    <span className="font-bold text-slate-800">未来实验小学</span> 创办于1998年，始终秉持“让每一个生命都精彩绽放”的办学理念。学校致力于构建“无边界学习空间”，将科技与人文深度融合。本学期，学校新建成的<span className="font-bold text-blue-600">“全息阅读中心”</span>正式投入使用，藏书量突破10万册。
                </ReportBodyText>
            </div>
        </ReportCard>
    </ReportPageContainer>
);

// 3. Teacher Attention List (EDITABLE)
const PageTeacherAttention = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const teachers = [
        {
            id: 1,
            name: "王晓梅",
            role: "班主任",
            tag: "最懂你沉稳气质的老师",
            quote: "她常说:'心恰站在那里，队伍就会安静下来。'王老师欣赏你在晨会、排队等环节中毫不张扬地维持秩序，她认为这种不刻意的影响力，正是班级管理中最珍贵的品质。在本学期的家长会上，王老师特别提到你是班上的'定海神针'，只要你在，大家就会自然而然地安静下来。",
            icon: ASSETS.AVATAR.TEACHER_WANG
        },
        {
            id: 2,
            name: "林嘉莉",
            role: "语文",
            tag: "最珍惜你细腻文字的老师",
            quote: "每次批改随笔，她都会在页脚写:'谢谢你把善意留在纸上。'林老师鼓励你把喜欢的段落读给同学听，她说你的文字有一种独特的温度，能够让读者感受到真诚和温暖。本学期你的课外阅读笔记让林老师印象深刻，她建议你可以尝试向校刊投稿，让更多人看到你的文字。",
            icon: ASSETS.AVATAR.TEACHER_LIN
        },
        {
            id: 3,
            name: "刘建辉",
            role: "体育",
            tag: "最放心你自我管理的老师",
            quote: "他注意到你课间操动作标准、节奏稳定，结束后还会主动提醒同学拉伸，于是点评:'既自律又贴心。'刘老师说，体育课上你虽然不是跑得最快的，但一定是最坚持的那一个。冬季长跑训练时，你从不缺席，还会主动帮助其他同学调整呼吸节奏，这种自律和互助的精神让老师非常欣慰。",
            icon: ASSETS.AVATAR.TEACHER_LIU
        }
    ];

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="老师关注榜" subTitle="Teacher Attention" icon={Sparkles} />

            <div className="space-y-4">
                {teachers.map((t) => (
                    <ReportCard key={t.id}>
                        <div className="flex gap-4">
                            {/* Avatar Column */}
                            <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={t.icon} className="w-full h-full object-cover" alt={t.name} />
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-slate-800">{t.name}</div>
                                    <div className="text-[9px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded mt-0.5">{t.role}</div>
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 min-w-0">
                                {/* Tag */}
                                <div className="mb-2 text-[13px] font-bold text-blue-600">
                                    {t.tag}
                                </div>

                                {/* Quote */}
                                <div className="bg-slate-50/50 rounded-lg p-3 relative border border-slate-100/50">
                                    <Quote className="absolute top-2 left-2 w-3 h-3 text-slate-300 -scale-x-100 opacity-50" />
                                    <div className="pl-3 relative z-10 text-xs text-slate-600 leading-relaxed text-justify">
                                        {t.quote}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ReportCard>
                ))}
            </div>

            <div className="mt-6 text-center">
                <ReportCaption>陪伴你的老师们都在教室、走廊、操场守望你的努力</ReportCaption>
            </div>
        </ReportPageContainer>
    );
};

// 4. Growth Overview (EDITABLE)
const PageGrowthOverview = ({ mode = 'a4', student, id, onSubjectClick, showFullContent = true }: { mode?: 'a4' | 'mobile', student: Student, id?: string, onSubjectClick?: (subject: string) => void, showFullContent?: boolean, key?: any }) => {
    // 五维度数据（崇德、求知、向阳、尚美、躬行）
    // 基础分60分，其余维度根据学期表现调整
    const fiveDimensions = [
        { label: '崇德', score: 78 },  // 基础60 + 18
        { label: '求知', score: 85 },  // 基础60 + 25
        { label: '向阳', score: 72 },  // 基础60 + 12
        { label: '尚美', score: 80 },  // 基础60 + 20
        { label: '躬行', score: 75 },  // 基础60 + 15
    ];

    const highlights = [
        { label: "求知", color: "bg-blue-100 text-blue-700", text: "语文口头表达自如，朗读清晰，但写作需建立信心。数学思维灵活，能提出多种解题策略。科学实验严谨，英语口语有勇气突破。" },
        { label: "崇德", color: "bg-orange-100 text-orange-700", text: "诚信意识成长明显，从外在约束向内在认同转变。文明礼貌成习惯，但物品管理需加强。实践活动积极，理论课程参与度待提升。" },
        { label: "尚美", color: "bg-pink-100 text-pink-700", text: "音乐天赋突出，合唱掌握多声部，社团担任领唱。文化传承兴趣有选择性，节气课程表现优秀，但有时完成度不够。" },
        { label: "向阳", color: "bg-yellow-100 text-yellow-700", text: "坚持晨跑锻炼，冬季测试进步明显。篮球课展现团队协作和领导力。对抗项目中情绪管理需提升，从场景依赖向主动调节发展。" },
        { label: "躬行", color: "bg-green-100 text-green-700", text: "每天主动整理花圃和教室，劳动意识强。但劳动实践记录不够系统，擅长做而非记，需培养边做边想的习惯。" },
    ];

    // 生成总分总结构的总体评价（包含六维度数据分析和学科成绩分析）
    const summary = (() => {
        // 总起（约50字）
        const opening = `${student.name}同学本学期整体表现良好，在德智体美劳各方面均有不同程度的成长。通过对六维度发展数据和各学科成绩的综合分析，可以看到该生在多个领域展现出积极向上的发展态势。`;

        // 六维度详细分析（约200字）
        const dimensionAnalysis = `从六维度发展雷达图来看：求知维度得分85分，表现最为突出。该生在课堂上思维活跃，勤于思考，数学逻辑推理能力强，科学探究精神突出，能够主动提出问题并寻求解答。尚美维度得分80分，音乐艺术天赋显现，在合唱、器乐演奏方面表现优异，具有较好的审美感知力和艺术表现力。崇德维度得分78分，诚信意识成长明显，从外在约束逐步向内在认同转变，文明礼貌已成为日常习惯。躬行维度得分75分，劳动习惯良好，能够主动参与班级卫生维护和值日工作。向阳维度得分72分，坚持体育锻炼，体质有所提升，但在情绪管理和抗挫折能力方面还需进一步加强。`;

        // 学科成绩详细分析（约150字）
        const subjectAnalysis = `从学科成绩分布来看：语文学科成绩稳定，口头表达流畅自然，朗读富有感情，课外阅读量较大，但在写作深度和细节描写方面还有提升空间，需要建立更强的写作自信。数学学科表现突出，思维能力强，解题策略多样，能够举一反三。英语学科基础扎实，单词记忆和书写规范，口语表达有勇气突破。体育、音乐、美术等综合学科表现优异，尤其是音乐方面天赋明显。科学学科实验操作严谨，探究精神值得肯定。道德与法治、信息技术等学科也保持良好水平。`;

        // 总结与建议（约100字）
        const conclusion = `整体而言，${student.name}同学呈现出全面发展的良好势头，各学科均衡发展，综合素质较高。建议寒假期间重点关注以下几个方面：一是通过阅读优秀范文和坚持日记写作来提升写作能力，建立写作自信；二是通过参与体育竞技活动来锻炼情绪调节能力和抗挫折能力；三是强化责任意识的延续性，培养自我管理和时间规划能力。期待下学期看到更加优秀的表现。`;

        return `${opening}\n\n${dimensionAnalysis}\n\n${subjectAnalysis}\n\n${conclusion}`;
    })();

    const oneSentence = "你用行动诠释着做好当下的力量，用真诚编织着与同伴的温暖连接，未来值得期待。";

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="成长概览" subTitle="Overview" icon={TrendingUp} />

            <ReportCaption className="mb-4">
                综合展示六育发展与学科表现，全方位了解本学期成长情况
            </ReportCaption>

            {/* 双图表区域 */}
            <div className="grid grid-cols-1 gap-4 mb-4">
                {/* 六维度雷达图 */}
                <ReportCard className="bg-white">
                    <div className="text-[13px] font-black text-slate-700 mb-6 text-center tracking-tight">5维度发展对比图</div>
                    <div className="flex flex-col items-center">
                        <FiveEducationRadarSimple
                            dimensions={student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE.dimensionScores : MOCK_TERM_REPORT_AI_DATA.dimensionScores}
                            startDimensions={student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE.startDimensionScores : MOCK_TERM_REPORT_AI_DATA.startDimensionScores}
                        />
                    </div>
                    <div className="mt-6 text-[11px] text-slate-400 text-center font-medium leading-relaxed">
                        对比学期初与学期末的数据表现<br />全方位呈现核心素养的拔节生长
                    </div>
                </ReportCard>

                {/* 学科成绩分布（点击查看详细报告） */}
                <ReportCard className="bg-gradient-to-br from-slate-50/30 to-white">
                    <SubjectGradesChart subjects={MOCK_SUBJECTS} onSubjectClick={onSubjectClick} showClickHint={true} />

                </ReportCard>
            </div>

            {/* 六育亮点（仅男生版显示） */}
            {showFullContent && (
                <ReportCard className="mb-4">
                    <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        六育发展亮点
                    </div>
                    <div className="space-y-2.5">
                        {highlights.map((h, i) => (
                            <div key={i} className="flex gap-2.5 items-start">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${h.color} mt-0.5`}>
                                    {h.label}
                                </span>
                                <div className="flex-1 text-xs text-slate-600 leading-relaxed">
                                    {h.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </ReportCard>
            )}

            {/* 总体评价 - AI Generated HTML */}
            <div>
                <ReportSectionHeader
                    title="总体评价"
                    subTitle="Overall"
                    icon={Star}
                    className="mt-4"
                    rightElement={
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 active:scale-95 transition-all">
                            <PenLine className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold">编辑</span>
                        </button>
                    }
                />
                <ReportCard className="mb-4 bg-white border-slate-100">
                    <RichTextDisplay
                        html={(student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE.overallAssessment : MOCK_TERM_REPORT_AI_DATA.overallAssessment)
                            .replace(/{name}/g, student.name.length > 2 ? student.name.substring(student.name.length - 2) : student.name)}
                    />
                </ReportCard>
            </div>

            {/* 教师寄语（仅男生版显示） */}
            {showFullContent && (
                <div className="relative pt-4 border-t border-slate-100">
                    <div className="text-sm font-bold text-orange-500 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" /> 教师寄语
                    </div>
                    <div className="px-4 text-base font-serif font-medium text-slate-800 text-center leading-relaxed italic">
                        {oneSentence}
                    </div>
                </div>
            )}
        </ReportPageContainer>
    );
};

// 新增：合并的成长建议板块（包含优势拔高、差项补足）
const PageComprehensiveGrowthAdvice = ({ mode = 'a4', id, student }: { mode?: 'a4' | 'mobile', id?: string, student: Student, key?: any }) => {
    // 成长建议内容（约800字，包含优势拔高和差项补足）
    const advice = `亲爱的家长，根据${student.name}同学本学期的综合表现，我们为您提供以下成长建议：

一、优势拔高方向

1. 学科优势的深化提升
${student.name}在数学逻辑思维方面表现突出，建议寒假期间可以尝试接触一些趣味数学题目或数学思维训练，如数独、华罗庚金杯等趣味竞赛题型，不以竞赛为目的，而是通过挑战性问题来进一步激发数学兴趣，培养更加灵活的解题思路。同时，音乐艺术方面的天赋值得继续培养，可以考虑在原有基础上学习一些音乐理论知识，或者尝试参加校外合唱团的活动，让艺术才能得到更专业的指导。

2. 自律品质的延展应用
在体育锻炼和日常行为中展现出的自律性非常难得，建议将这种品质延展到时间管理和学习规划中。可以尝试让孩子自主制定每日或每周计划，家长从旁辅助但不过度干预，逐步培养独立管理时间的能力。这种自我管理能力会成为未来学习和生活中的重要竞争力。

二、需要关注的提升空间

1. 写作能力的建立与突破
虽然口头表达流畅，但在写作方面还需要建立更强的信心。建议从每天10分钟的自由写作开始，内容不限，可以是日记、观察记录或读后感，重点在于养成动笔的习惯。同时，多阅读优秀范文，学习如何组织文章结构、如何进行细节描写。家长可以每周与孩子一起选择一篇他/她的作品进行讨论，多给予肯定和鼓励，而非纠错批评，让孩子逐步建立写作的信心。

2. 情绪管理能力的培养
在体育竞技等对抗性项目中，情绪管理还需要提升。建议家长在日常生活中有意识地和孩子讨论情绪话题，教会孩子识别、表达和调节自己的情绪。可以通过绘本、电影等媒介进行情绪教育，也可以在孩子遇到挫折时，引导他/她用"暂停-深呼吸-思考-行动"的方式来应对，逐步从情景依赖向主动调节转变。

3. 责任意识的延续性培养
劳动意识很好，但在记录和反思方面有待加强。建议建立一个"成长记录本"，引导孩子在完成任务后简单记录过程和感受，培养"做中思、思中悟"的习惯。这不仅能提升责任感，还能培养元认知能力，让孩子学会从经验中总结方法。

三、寒假重点行动建议

1. 每天坚持20分钟自由写作，不限题材，重在养成习惯
2. 每周进行1-2次家庭运动竞赛，在竞争中练习情绪调节
3. 制定并执行个人寒假计划表，培养时间管理能力
4. 阅读3-5本适龄书籍，并尝试写简短的读后感或思维导图
5. 参与家庭劳动的同时，记录劳动日记，分享劳动感受

以上建议希望能为孩子的成长提供参考。每个孩子都是独特的个体，成长需要时间和耐心。让我们携手努力，陪伴孩子健康快乐地成长。`;

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader
                title="成长建议"
                subTitle="Advice"
                icon={Layers}
                className="text-[#10B981]"
                rightElement={
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                        <PenLine className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold">编辑</span>
                    </button>
                }
            />
            <ReportCard className="mb-4">
                <RichTextDisplay
                    html={student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE.growthAdvice : MOCK_TERM_REPORT_AI_DATA.growthAdvice}
                    className="space-y-4"
                />
            </ReportCard>
        </ReportPageContainer>
    );
};

// 新增：简化的亲子活动板块（纯文本）
const PageSimpleParentChildActivities = ({ mode = 'a4', id, student }: { mode?: 'a4' | 'mobile', id?: string, student: Student, key?: any }) => {
    const activities = `为促进孩子全面发展，建议家长在寒假期间安排以下高质量的亲子活动：

一、学习成长类活动

1. 周末阅读分享会
每周日晚饭后，家长和孩子各分享本周最喜欢的一本书或一篇文章，交流阅读心得。这不仅能培养阅读习惯，提升表达能力，还能增进亲子沟通。建议准备书籍和笔记本，每次活动时间约30分钟。

2. 家庭学习计划制定
与孩子一起制定学习计划，让孩子学会时间管理和目标设定。家长可以提供建议但不强制，培养孩子的自主学习能力。每周回顾一次计划执行情况，及时调整。

二、运动健康类活动

1. 家庭运动挑战
制定家庭运动计划，如晨跑、跳绳、羽毛球等，全家人共同参与并记录打卡。可以设置小目标和奖励机制，增强体质的同时培养运动习惯，提升家庭凝聚力。建议每天30分钟，准备运动装备和打卡表。

2. 户外自然探索
利用周末或假期进行户外活动，如爬山、公园徒步、植物观察等。鼓励孩子记录自然观察日志，拍照记录有趣的发现。这能开阔视野，培养观察力，增强环保意识。建议每次活动半天至一天，准备观察笔记、相机和野外指南。

三、艺术创造类活动

1. 创意手工时光
每月一次手工制作活动，可以是绘画、折纸、陶艺、编织等。完成作品后合影留念，建立家庭作品展示角。这能培养动手能力和创造力，记录成长足迹。建议每次1-2小时，准备相应的手工材料。

2. 家庭音乐时光
鉴于孩子在音乐方面的天赋，可以安排家庭音乐活动，如一起欣赏音乐会、学唱歌曲、乐器演奏等。创造音乐氛围，让艺术成为家庭生活的一部分。

四、生活实践类活动

1. 家务劳动实践
安排孩子参与适当的家务劳动，如整理房间、协助做饭、照顾植物等。重要的是引导孩子在劳动后记录感受和收获，培养责任意识和生活技能。

2. 社区志愿服务
寒假期间可以带孩子参加一些社区志愿活动，如图书馆整理、社区清洁、帮助邻居等。培养社会责任感和奉献精神。

温馨提示：
- 活动安排要考虑孩子的兴趣和实际情况，不要过度安排
- 重在过程中的陪伴和互动，而非结果的完美
- 鼓励孩子表达想法，尊重孩子的选择
- 适当记录活动过程，留下美好回忆`;
    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader
                title="亲子活动指南"
                subTitle="Activities"
                icon={Users}
                rightElement={
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 active:scale-95 transition-all">
                        <PenLine className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold">编辑</span>
                    </button>
                }
            />
            <ReportCard>
                <RichTextDisplay
                    html={student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE.parentActivityGuide : MOCK_TERM_REPORT_AI_DATA.parentActivityGuide}
                    className="space-y-4"
                />
            </ReportCard>
        </ReportPageContainer>
    );
};

// 新增：高光时刻板块
const PageHighbrightMoments = ({ mode = 'a4', id, student }: { mode?: 'a4' | 'mobile', id?: string, student: Student, key?: any }) => {
    const data = student.gender === 'female' ? MOCK_TERM_REPORT_AI_DATA_FEMALE : MOCK_TERM_REPORT_AI_DATA;
    const highlights = (data as any).highlights || [];
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader
                title="高光时刻"
                icon={Star}
                className="text-amber-500"
            />
            <div className="grid grid-cols-1 gap-5">
                {highlights.map((item: any, idx: number) => (
                    <ReportCard key={idx} className="overflow-hidden p-0 border-none shadow-xl shadow-slate-200/40 relative group/card rounded-3xl bg-white ring-1 ring-slate-100">
                        <div className="flex flex-col sm:flex-row h-full">
                            {/* 图片容器 */}
                            <div
                                className={`w-full sm:w-1/3 aspect-[4/3] bg-slate-50 relative overflow-hidden cursor-pointer ${item.isAward ? 'p-2.5' : ''}`}
                                onClick={() => item.isAward && setPreviewImage(item.imageUrl)}
                            >
                                <div className={`w-full h-full overflow-hidden rounded-2xl relative ${item.isAward ? 'ring-1 ring-amber-100 shadow-sm' : ''}`}>
                                    <img
                                        src={item.imageUrl || "/api/placeholder/400/300"}
                                        alt="高光时刻"
                                        className="w-full h-full object-cover transition-all duration-1000 group-hover/card:scale-110"
                                    />
                                    {/* 为证书添加光泽效果 */}
                                    {item.isAward && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 -translate-x-full group-hover/card:translate-x-full" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/10">
                                                <div className="px-3 py-1.5 rounded-full bg-white/90 text-amber-600 text-[10px] font-bold shadow-sm backdrop-blur-sm">点击查看大图</div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {item.isAward && (
                                    <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black shadow-lg z-10">
                                        <Award className="w-3.5 h-3.5" />
                                        <span className="tracking-widest">荣誉证书</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* 内容文字 */}
                            <div className="flex-1 p-8 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50/30 relative">
                                <div className="relative z-10">
                                    <Quote className={`absolute -left-3 -top-3 w-8 h-8 ${item.isAward ? 'text-amber-500/10' : 'text-emerald-500/10'} pointer-events-none`} />
                                    <div className={`
                                        pl-5 pr-2 py-1 text-[14px] leading-[1.8] font-normal transition-all duration-300 text-justify tracking-wide
                                        ${item.isAward
                                            ? 'text-slate-700 border-l-3 border-amber-400/50'
                                            : 'text-slate-700 border-l-3 border-emerald-400/50'
                                        }
                                    `}>
                                        {item.achievement}
                                    </div>
                                    <Quote className={`absolute -right-1 -bottom-3 w-8 h-8 ${item.isAward ? 'text-amber-500/10' : 'text-emerald-500/10'} rotate-180 pointer-events-none`} />
                                </div>

                                {/* 装饰性背景 */}
                                {item.isAward ? (
                                    <Award className="absolute -bottom-6 -right-4 w-32 h-32 text-amber-500/[0.03] rotate-12 pointer-events-none" />
                                ) : (
                                    <TrendingUp className="absolute -bottom-6 -right-4 w-32 h-32 text-emerald-500/[0.03] rotate-12 pointer-events-none" />
                                )}
                            </div>
                        </div>
                    </ReportCard>
                ))}
            </div>

            {/* 预览模态框 */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-full max-h-full overflow-hidden flex flex-col items-center">
                        <button
                            className="absolute top-4 right-4 text-white /10 rounded-full p-2 transition-colors z-[10000]"
                            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={previewImage}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500"
                            alt="预览"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-6 text-white text-lg font-bold tracking-widest bg-white/10 px-6 py-2 rounded-full border border-white/20">
                            荣誉证书预览
                        </div>
                    </div>
                </div>
            )}
        </ReportPageContainer>
    );
};

// 5. Subject Detail (Enhanced with Radar Chart)
const PageSubjectDetail = ({ subject, grade, details, student, mode = 'a4', id }: { subject: string, grade: string, details: typeof MOCK_PE_REPORT_DETAILS, student: Student, mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const getIcon = (name: string) => {
        const map: any = { '语文': BookOpen, '数学': Calculator, '英语': Languages, '科学': FlaskConical, '体育': Dumbbell, '美术': Palette };
        return map[name] || Award;
    };

    // Get report content based on grade and subject
    const gradeTemplates = MOCK_GRADE_SUBJECT_REPORT_TEMPLATES[student.grade];
    const gradeSpecificContent = gradeTemplates?.[subject];
    const genericContent = MOCK_SUBJECT_REPORT_TEMPLATES[subject];
    const reportContent = gradeSpecificContent || genericContent || details;

    // Replace student name in content
    const displayDetails = reportContent.map(section => ({
        ...section,
        content: section.content.replace(/宋卓/g, student.name)
    }));

    const getContent = (title: string) => displayDetails.find(d => d.title === title)?.content || '';

    // 解析学科维度数据 - 与ReportDetailView保持一致
    const parsedDimensions = useMemo(() => {
        if (subject === '语文') {
            return [
                { label: '认字写字', score: 4, fullScore: 4 },
                { label: '背诵默写', score: 6, fullScore: 6 },
                { label: '课外阅读', score: 4, fullScore: 6 },
                { label: '口语交际', score: 4, fullScore: 4 },
                { label: '习作表达', score: 6.5, fullScore: 10 },
                { label: '期末检测', score: 52.5, fullScore: 70 },
            ];
        } else if (subject === '数学') {
            return [
                { label: '课堂观察', score: 6, fullScore: 10 },
                { label: '作业情况', score: 18, fullScore: 20 },
                { label: '数学阅读', score: 5, fullScore: 5 },
                { label: '数学设计', score: 5, fullScore: 5 },
                { label: '数学思维', score: 4, fullScore: 5 },
                { label: '数学应用', score: 4, fullScore: 5 },
            ];
        } else if (subject === '英语') {
            return [
                { label: '课堂表现', score: 10, fullScore: 10 },
                { label: '家庭作业', score: 8, fullScore: 10 },
                { label: '单词识记', score: 9, fullScore: 10 },
                { label: '书写作业', score: 9, fullScore: 10 },
                { label: '期末检测', score: 51, fullScore: 60 },
            ];
        } else if (subject === '道法') {
            return [
                { label: '课堂表现', score: 18, fullScore: 20 },
                { label: '作业完成', score: 9, fullScore: 10 },
                { label: '实践活动', score: 9, fullScore: 10 },
                { label: '期末检测', score: 53, fullScore: 60 },
            ];
        } else if (subject === '科学') {
            return [
                { label: '平时成绩', score: 30, fullScore: 30 },
                { label: '活动手册', score: 18, fullScore: 20 },
                { label: '期末考试', score: 40.25, fullScore: 50 },
            ];
        } else if (subject === '体育') {
            return [
                { label: '课堂表现', score: 9, fullScore: 10 },
                { label: '运动技能', score: 18, fullScore: 20 },
                { label: '体能测试', score: 26, fullScore: 30 },
                { label: '团队协作', score: 9, fullScore: 10 },
            ];
        } else if (subject === '音乐') {
            return [
                { label: '演唱表现', score: 18, fullScore: 20 },
                { label: '演奏技能', score: 17, fullScore: 20 },
                { label: '音乐鉴赏', score: 14, fullScore: 15 },
                { label: '课堂参与', score: 14, fullScore: 15 },
                { label: '期末考核', score: 27, fullScore: 30 },
            ];
        } else if (subject === '美术') {
            return [
                { label: '创作能力', score: 18, fullScore: 20 },
                { label: '审美鉴赏', score: 14, fullScore: 15 },
                { label: '课堂表现', score: 14, fullScore: 15 },
            ];
        } else if (subject === '信息技术') {
            return [
                { label: '操作技能', score: 19, fullScore: 20 },
                { label: '编程思维', score: 17, fullScore: 20 },
                { label: '作品质量', score: 28, fullScore: 30 },
            ];
        } else if (subject === '生安心理') {
            return [
                { label: '安全意识', score: 19, fullScore: 20 },
                { label: '心理健康', score: 18, fullScore: 20 },
                { label: '实践能力', score: 13, fullScore: 15 },
            ];
        }
        // 默认维度
        return [
            { label: '平时表现', score: 18, fullScore: 20 },
            { label: '作业完成', score: 27, fullScore: 30 },
            { label: '期末检测', score: 43, fullScore: 50 },
        ];
    }, [subject]);

    // 计算综合等级
    const calculatedGrade = useMemo(() => {
        if (parsedDimensions.length === 0) return '优';

        const totalScore = parsedDimensions.reduce((sum, dim) => sum + dim.score, 0);
        const totalFullScore = parsedDimensions.reduce((sum, dim) => sum + dim.fullScore, 0);
        const scoreRate = totalFullScore > 0 ? (totalScore / totalFullScore) * 100 : 0;

        if (scoreRate >= 85) return '优';
        else if (scoreRate >= 70) return '良';
        else if (scoreRate >= 60) return '合格';
        else return '待提升';
    }, [parsedDimensions]);

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title={`${subject}学科`} subTitle="Subject Report" icon={getIcon(subject)} />

            <div className="flex justify-between items-end mb-6 px-2">
                <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Semester Grade</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tight">{calculatedGrade}</div>
                </div>
                <div className="flex gap-2">
                    <ReportTag color="blue">2025-2026上</ReportTag>
                    <ReportTag color="green">期末综合</ReportTag>
                </div>
            </div>

            {/* 雷达图区域 */}
            {parsedDimensions.length > 0 && (
                <ReportCard className="mb-4 bg-gradient-to-br from-slate-50 to-white">
                    <SubjectRadarChart dimensions={parsedDimensions} />

                    {/* 图例 */}
                    <div className="mt-4 px-2">
                        <div className="flex justify-center items-center gap-4 text-xs flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className="text-green-600 font-bold">●</span>
                                <span className="text-slate-700">优秀</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-blue-600 font-bold">●</span>
                                <span className="text-slate-700">良好</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-orange-600 font-bold">▲</span>
                                <span className="text-slate-700">待提升</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-red-600 font-bold">▼</span>
                                <span className="text-slate-700">需加强</span>
                            </div>
                        </div>
                    </div>
                </ReportCard>
            )}

            <div className="space-y-4">
                {/* AI Dynamic Subject Report Sections */}
                {(() => {
                    const aiReport = (MOCK_TERM_REPORT_AI_DATA.subjectReports as any)[subject];
                    if (aiReport) {
                        return (
                            <>
                                <ReportCard highlight>
                                    <ReportCardTitle>学科评价</ReportCardTitle>
                                    <ReportBodyText>{aiReport.subjectAssessment}</ReportBodyText>
                                </ReportCard>

                                <ReportCard>
                                    <ReportCardTitle>表现亮点</ReportCardTitle>
                                    <ReportBodyText>{aiReport.performanceHighlights}</ReportBodyText>
                                </ReportCard>

                                <ReportCard>
                                    <ReportCardTitle>提升建议</ReportCardTitle>
                                    <ReportBodyText>{aiReport.improvementAdvice}</ReportBodyText>
                                </ReportCard>
                            </>
                        );
                    }

                    // Fallback to legacy content
                    return (
                        <>
                            <ReportCard highlight>
                                <ReportCardTitle>学科评价</ReportCardTitle>
                                <ReportBodyText>{getContent('学科评价') || getContent('总体评价')}</ReportBodyText>
                            </ReportCard>

                            <ReportCard>
                                <ReportCardTitle>表现亮点</ReportCardTitle>
                                <ReportBodyText>{getContent('表现亮点')}</ReportBodyText>
                            </ReportCard>

                            <ReportCard>
                                <ReportCardTitle>提升建议</ReportCardTitle>
                                <ReportBodyText>{getContent('提升建议') || getContent('发展与提升')}</ReportBodyText>
                            </ReportCard>
                        </>
                    );
                })()}
            </div>
        </ReportPageContainer>
    );
};

// 6. Subject Reports with Tab Switcher (学科报告-Tab切换版本)
const PageSubjectReportsWithTabs = ({ student, mode = 'a4', id, initialSubject, onBack }: { student: Student, mode?: 'a4' | 'mobile', id?: string, initialSubject?: string, onBack?: () => void }) => {
    const [activeSubject, setActiveSubject] = useState(initialSubject || MOCK_SUBJECTS[0].subject);

    const getIcon = (name: string) => {
        const map: any = {
            '语文': BookOpen, '数学': Calculator, '英语': Languages,
            '道法': Users, '科学': FlaskConical, '信息技术': Monitor,
            '体育': Dumbbell, '音乐': Sun, '美术': Palette, '生安心理': HeartHandshake
        };
        return map[name] || Award;
    };

    // 当前选中学科的数据
    const currentSubjectData = MOCK_SUBJECTS.find(s => s.subject === activeSubject) || MOCK_SUBJECTS[0];

    // Get report content
    const gradeTemplates = MOCK_GRADE_SUBJECT_REPORT_TEMPLATES[student.grade];
    const gradeSpecificContent = gradeTemplates?.[activeSubject];
    const genericContent = MOCK_SUBJECT_REPORT_TEMPLATES[activeSubject];
    const reportContent = gradeSpecificContent || genericContent || MOCK_PE_REPORT_DETAILS;

    const displayDetails = reportContent.map(section => ({
        ...section,
        content: section.content.replace(/宋卓/g, student.name)
    }));

    const getContent = (title: string) => displayDetails.find(d => d.title === title)?.content || '';

    // 解析维度数据
    const parsedDimensions = useMemo(() => {
        if (activeSubject === '语文') {
            return [
                { label: '认字写字', score: 4, fullScore: 4 },
                { label: '背诵默写', score: 6, fullScore: 6 },
                { label: '课外阅读', score: 4, fullScore: 6 },
                { label: '口语交际', score: 4, fullScore: 4 },
                { label: '习作表达', score: 6.5, fullScore: 10 },
                { label: '期末检测', score: 52.5, fullScore: 70 },
            ];
        } else if (activeSubject === '数学') {
            return [
                { label: '课堂观察', score: 6, fullScore: 10 },
                { label: '作业情况', score: 18, fullScore: 20 },
                { label: '数学阅读', score: 5, fullScore: 5 },
                { label: '数学设计', score: 5, fullScore: 5 },
                { label: '数学思维', score: 4, fullScore: 5 },
                { label: '数学应用', score: 4, fullScore: 5 },
            ];
        } else if (activeSubject === '英语') {
            return [
                { label: '课堂表现', score: 10, fullScore: 10 },
                { label: '家庭作业', score: 8, fullScore: 10 },
                { label: '单词识记', score: 9, fullScore: 10 },
                { label: '书写作业', score: 9, fullScore: 10 },
                { label: '期末检测', score: 51, fullScore: 60 },
            ];
        } else if (activeSubject === '道法') {
            return [
                { label: '课堂表现', score: 18, fullScore: 20 },
                { label: '作业完成', score: 9, fullScore: 10 },
                { label: '实践活动', score: 9, fullScore: 10 },
                { label: '期末检测', score: 53, fullScore: 60 },
            ];
        } else if (activeSubject === '科学') {
            return [
                { label: '平时成绩', score: 30, fullScore: 30 },
                { label: '活动手册', score: 18, fullScore: 20 },
                { label: '期末考试', score: 40.25, fullScore: 50 },
            ];
        } else if (activeSubject === '体育') {
            return [
                { label: '课堂表现', score: 9, fullScore: 10 },
                { label: '运动技能', score: 18, fullScore: 20 },
                { label: '体能测试', score: 26, fullScore: 30 },
                { label: '团队协作', score: 9, fullScore: 10 },
            ];
        } else if (activeSubject === '音乐') {
            return [
                { label: '演唱表现', score: 18, fullScore: 20 },
                { label: '演奏技能', score: 17, fullScore: 20 },
                { label: '音乐鉴赏', score: 14, fullScore: 15 },
                { label: '课堂参与', score: 14, fullScore: 15 },
                { label: '期末考核', score: 27, fullScore: 30 },
            ];
        } else if (activeSubject === '美术') {
            return [
                { label: '创作能力', score: 18, fullScore: 20 },
                { label: '审美鉴赏', score: 14, fullScore: 15 },
                { label: '课堂表现', score: 14, fullScore: 15 },
            ];
        } else if (activeSubject === '信息技术') {
            return [
                { label: '操作技能', score: 19, fullScore: 20 },
                { label: '编程思维', score: 17, fullScore: 20 },
                { label: '作品质量', score: 28, fullScore: 30 },
            ];
        } else if (activeSubject === '生安心理') {
            return [
                { label: '安全意识', score: 19, fullScore: 20 },
                { label: '心理健康', score: 18, fullScore: 20 },
                { label: '实践能力', score: 13, fullScore: 15 },
            ];
        }
        return [
            { label: '平时表现', score: 18, fullScore: 20 },
            { label: '作业完成', score: 27, fullScore: 30 },
            { label: '期末检测', score: 43, fullScore: 50 },
        ];
    }, [activeSubject]);

    // 计算等级
    const calculatedGrade = useMemo(() => {
        if (parsedDimensions.length === 0) return '优';
        const totalScore = parsedDimensions.reduce((sum, dim) => sum + dim.score, 0);
        const totalFullScore = parsedDimensions.reduce((sum, dim) => sum + dim.fullScore, 0);
        const scoreRate = totalFullScore > 0 ? (totalScore / totalFullScore) * 100 : 0;
        if (scoreRate >= 85) return '优';
        else if (scoreRate >= 70) return '良';
        else if (scoreRate >= 60) return '合格';
        else return '待提升';
    }, [parsedDimensions]);

    const CurrentIcon = getIcon(activeSubject);

    return (
        <ReportPageContainer mode={mode} id={id}>
            <div className="flex items-center justify-between mb-4">
                <ReportSectionHeader title="学科详情" subTitle="Subject Details" icon={FileText} className="mb-0" />
                {onBack && (
                    <button onClick={onBack} className="p-2 bg-slate-100 rounded-full active:bg-slate-200">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                )}
            </div>

            {/* Tab导航 */}
            <div className="mb-4 -mx-5 px-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max pb-2">
                    {MOCK_SUBJECTS.map((sub) => {
                        const Icon = getIcon(sub.subject);
                        const isActive = activeSubject === sub.subject;
                        return (
                            <button
                                key={sub.subject}
                                onClick={() => setActiveSubject(sub.subject)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 active:scale-95'
                                    }
                                `}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {sub.subject}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 学科详情内容 */}
            <div>
                {/* 等级显示 */}
                <div className="flex justify-between items-end mb-6 px-2">
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Semester Grade</div>
                        <div className="text-4xl font-black text-slate-900 tracking-tight">{calculatedGrade}</div>
                    </div>
                    <div className="flex gap-2">
                        <ReportTag color="blue">2025-2026上</ReportTag>
                        <ReportTag color="green">期末综合</ReportTag>
                    </div>
                </div>

                {/* 雷达图 */}
                {parsedDimensions.length > 0 && (
                    <ReportCard className="mb-4 bg-gradient-to-br from-slate-50 to-white">
                        <SubjectRadarChart dimensions={parsedDimensions} />
                        <div className="mt-4 px-2">
                            <div className="flex justify-center items-center gap-4 text-xs flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-green-600 font-bold">●</span>
                                    <span className="text-slate-700">优秀</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-blue-600 font-bold">●</span>
                                    <span className="text-slate-700">良好</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-orange-600 font-bold">▲</span>
                                    <span className="text-slate-700">待提升</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-red-600 font-bold">▼</span>
                                    <span className="text-slate-700">需加强</span>
                                </div>
                            </div>
                        </div>
                    </ReportCard>
                )}

                {/* 文字报告 */}
                <div className="space-y-4">
                    <ReportCard highlight>
                        <ReportCardTitle>学科评价</ReportCardTitle>
                        <ReportBodyText>{getContent('学科评价') || getContent('总体评价')}</ReportBodyText>
                    </ReportCard>

                    <ReportCard>
                        <ReportCardTitle>表现亮点</ReportCardTitle>
                        <ReportBodyText>{getContent('表现亮点')}</ReportBodyText>
                    </ReportCard>

                    <ReportCard>
                        <ReportCardTitle>提升建议</ReportCardTitle>
                        <ReportBodyText>{getContent('提升建议') || getContent('发展与提升')}</ReportBodyText>
                    </ReportCard>
                </div>
            </div>
        </ReportPageContainer>
    );
};

// 7. Future Potential (EDITABLE)
const PageFuturePotential = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const [potentials, setPotentials] = useState([
        {
            id: 1,
            title: "秩序统筹力",
            content: "你对“哪里该整理”有天然敏感度。建议在班级提出“整洁守望表”，安排值日与公共角维护。",
            direction: "未来方向：做项目管理、活动策划的底层素养。",
            style: { bg: "bg-indigo-50/50", border: "border-indigo-100", icon: Layout, color: "text-indigo-600" }
        },
        {
            id: 2,
            title: "温柔表达力",
            content: "手账和随笔里已经有很多真诚的观察。每月挑一段在班会上朗读，让文字通过声音传出去。",
            direction: "未来方向：教育、传媒、公共服务等行业。",
            style: { bg: "bg-pink-50/50", border: "border-pink-100", icon: Megaphone, color: "text-pink-600" }
        },
        {
            id: 3,
            title: "同理支持力",
            content: "同伴遇到烦恼喜欢找你，说明你有天然的情绪共情力。可以参与班级心理小站维护。",
            direction: "未来方向：从事教育、心理、护理等助人职业。",
            style: { bg: "bg-orange-50/50", border: "border-orange-100", icon: HeartHandshake, color: "text-orange-600" }
        }
    ]);

    const updatePotential = (id: number, field: string, val: string) => {
        setPotentials(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    };

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="潜能与未来" subTitle="Future Potential" icon={Compass} />

            <ReportCaption className="mb-4">
                基于本学期全维度数据分析，老师为你梳理了三项核心潜能：
            </ReportCaption>

            <div className="space-y-4">
                {potentials.map((p) => (
                    <ReportCard key={p.id} className={`${p.style.bg} ${p.style.border} relative overflow-hidden`}>
                        <div className="flex items-start gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm ${p.style.color}`}>
                                <p.style.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 pt-1">
                                <EditableArea
                                    value={p.title}
                                    onChange={(v) => updatePotential(p.id, 'title', v)}
                                    className={`text-[15px] font-bold text-slate-800`}
                                />
                            </div>
                        </div>

                        <div className="pl-11">
                            <div className="mb-3">
                                <EditableArea
                                    value={p.content}
                                    onChange={(v) => updatePotential(p.id, 'content', v)}
                                    multiline
                                    className="text-xs text-slate-600 leading-relaxed"
                                />
                            </div>
                            <div className="bg-white/60 rounded p-2 flex gap-2 items-start border border-white/40">
                                <ArrowUpRight className={`w-3 h-3 ${p.style.color} mt-0.5 shrink-0`} />
                                <EditableArea
                                    value={p.direction}
                                    onChange={(v) => updatePotential(p.id, 'direction', v)}
                                    multiline
                                    className={`text-[11px] font-bold text-slate-700`}
                                />
                            </div>
                        </div>
                    </ReportCard>
                ))}
            </div>
        </ReportPageContainer>
    );
};

// 7. Future Growth Suggestions (未来成长建议)
const PageFutureGrowthSuggestions = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const [suggestions, setSuggestions] = useState([
        {
            id: 1,
            title: "培养学习规划能力",
            content: "建议每周日晚与孩子一起规划下周任务，优先排序重要事项，并预留弹性时间应对突发情况。",
            tips: "可使用周计划表格,让孩子自主填写,家长辅助点评。",
            icon: Target,
            color: "blue"
        },
        {
            id: 2,
            title: "深化阅读思考深度",
            content: "在课外阅读基础上,引导孩子尝试写读后感或思维导图,从被动接受转向主动思考与输出。",
            tips: "每读完一本书,家长可与孩子进行10分钟主题讨论。",
            icon: BookOpen,
            color: "green"
        },
        {
            id: 3,
            title: "提升表达组织能力",
            content: "鼓励孩子参与课堂展示、家庭分享等活动,锻炼逻辑性表达和临场应变能力。",
            tips: "可从家庭餐桌话题开始,每周一次'今日主讲人'活动。",
            icon: Megaphone,
            color: "purple"
        }
    ]);

    const updateSuggestion = (id: number, field: string, val: string) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="未来成长建议" subTitle="Growth Suggestions" icon={TrendingUp} />

            <ReportCaption className="mb-4">
                基于本学期整体表现，老师为你提供以下成长方向建议：
            </ReportCaption>

            <div className="space-y-4">
                {suggestions.map((s) => {
                    const colorStyles = {
                        blue: { bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-600' },
                        green: { bg: 'bg-green-50/50', border: 'border-green-100', text: 'text-green-600' },
                        purple: { bg: 'bg-purple-50/50', border: 'border-purple-100', text: 'text-purple-600' },
                        orange: { bg: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-600' }
                    };
                    const style = colorStyles[s.color as keyof typeof colorStyles] || colorStyles.blue;

                    return (
                        <ReportCard key={s.id} className={`${style.bg} ${style.border}`}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm ${style.text}`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <EditableArea
                                        value={s.title}
                                        onChange={(v) => updateSuggestion(s.id, 'title', v)}
                                        className="text-[15px] font-bold text-slate-800 mb-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <EditableArea
                                    value={s.content}
                                    onChange={(v) => updateSuggestion(s.id, 'content', v)}
                                    multiline
                                    className="text-xs text-slate-600 leading-relaxed"
                                />
                                <div className="bg-white/60 rounded-lg p-2 flex gap-2 items-start border border-white/40">
                                    <Sparkles className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                    <EditableArea
                                        value={s.tips}
                                        onChange={(v) => updateSuggestion(s.id, 'tips', v)}
                                        multiline
                                        className="text-[11px] font-medium text-slate-700"
                                    />
                                </div>
                            </div>
                        </ReportCard>
                    );
                })}
            </div>
        </ReportPageContainer>
    );
};

// 8. Strengths Enhancement (优势拔高)
const PageStrengthsEnhancement = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const [strengths, setStrengths] = useState([
        {
            id: 1,
            subject: "语文表达",
            current: "在课外阅读和随笔写作方面展现出扎实基础，文字细腻真诚。",
            enhancement: "可尝试参加校级作文比赛或文学社活动，接触更多题材与写作风格。每周精读一篇优秀范文，学习写作技巧。",
            icon: PenTool,
            color: "indigo"
        },
        {
            id: 2,
            subject: "音乐艺术",
            current: "在演唱和演奏方面表现优异，具有良好的音乐感知力。",
            enhancement: "建议参加学校合唱团或器乐队，通过集体排练提升协作能力。可尝试学习音乐理论知识，深化对音乐的理解。",
            icon: Award,
            color: "pink"
        },
        {
            id: 3,
            subject: "班级管理",
            current: "在维持秩序、协助老师方面展现出天然的责任感和执行力。",
            enhancement: "可担任班级小组长或纪律委员，在实践中提升领导力。参与学生会或班干部竞选，扩大服务范围。",
            icon: Users,
            color: "emerald"
        }
    ]);

    const updateStrength = (id: number, field: string, val: string) => {
        setStrengths(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="优势拔高" subTitle="Strengths Enhancement" icon={Star} />

            <ReportCaption className="mb-4">
                你已经在以下方面展现出明显优势，老师建议进一步拔高：
            </ReportCaption>

            <div className="space-y-4">
                {strengths.map((s, index) => {
                    const colorStyles = {
                        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-600' },
                        pink: { bg: 'bg-pink-50', border: 'border-pink-200', badge: 'bg-pink-600' },
                        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600' },
                        amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600' }
                    };
                    const style = colorStyles[s.color as keyof typeof colorStyles] || colorStyles.indigo;

                    return (
                        <ReportCard key={s.id} className={`${style.bg} ${style.border}`}>
                            <div className="flex items-center gap-3 mb-3 border-b border-white/50 pb-2">
                                <div className={`w-6 h-6 rounded ${style.badge} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                                    {index + 1}
                                </div>
                                <s.icon className="w-4 h-4 text-slate-600" />
                                <EditableArea
                                    value={s.subject}
                                    onChange={(v) => updateStrength(s.id, 'subject', v)}
                                    className="text-sm font-bold text-slate-800 flex-1"
                                />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        现有表现
                                    </div>
                                    <EditableArea
                                        value={s.current}
                                        onChange={(v) => updateStrength(s.id, 'current', v)}
                                        multiline
                                        className="text-xs text-slate-600 leading-relaxed"
                                    />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        拔高建议
                                    </div>
                                    <EditableArea
                                        value={s.enhancement}
                                        onChange={(v) => updateStrength(s.id, 'enhancement', v)}
                                        multiline
                                        className="text-xs text-slate-700 leading-relaxed font-medium"
                                    />
                                </div>
                            </div>
                        </ReportCard>
                    );
                })}
            </div>
        </ReportPageContainer>
    );
};

// 9. Weakness Improvement (差项补足)
const PageWeaknessImprovement = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const [weaknesses, setWeaknesses] = useState([
        {
            id: 1,
            area: "习作表达深度",
            issue: "在期末检测的作文部分，内容相对简短，细节描写和情感表达还有提升空间。",
            plan: "每周完成一篇随笔，家长协助选择感兴趣的主题。阅读优秀范文时，重点关注描写技巧和修辞手法。",
            timeline: "本学期目标：积累10篇优质习作",
            icon: PenLine,
            priority: "高"
        },
        {
            id: 2,
            area: "课堂主动表达",
            issue: "虽然思考深入，但举手发言频率较低，缺少主动展示想法的勇气。",
            plan: "设定小目标：每天至少主动回答一个问题。家长可在家进行角色扮演，模拟课堂场景练习表达。",
            timeline: "近期目标：一个月内发言次数翻倍",
            icon: Megaphone,
            priority: "中"
        },
        {
            id: 3,
            area: "体能持久力",
            issue: "在体能测试的耐力项目中表现略显薄弱，需要加强日常锻炼。",
            plan: "每天坚持10分钟晨跑或跳绳，周末可进行户外运动。制定运动打卡表，家长监督执行。",
            timeline: "下学期目标：体能测试达到良好",
            icon: Dumbbell,
            priority: "中"
        }
    ]);

    const updateWeakness = (id: number, field: string, val: string) => {
        setWeaknesses(prev => prev.map(w => w.id === id ? { ...w, [field]: val } : w));
    };

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="差项补足" subTitle="Areas for Improvement" icon={Target} />

            <ReportCaption className="mb-4">
                基于数据分析，以下方面是本学期需要重点关注和提升的领域：
            </ReportCaption>

            <div className="space-y-4">
                {weaknesses.map((w) => {
                    const priorityStyles = {
                        '高': { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600', text: 'text-red-600' },
                        '中': { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-600', text: 'text-orange-600' },
                        '低': { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-600', text: 'text-yellow-600' }
                    };
                    const style = priorityStyles[w.priority as keyof typeof priorityStyles] || priorityStyles['中'];

                    return (
                        <ReportCard key={w.id} className={`${style.bg} ${style.border}`}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm ${style.text}`}>
                                    <w.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <EditableArea
                                            value={w.area}
                                            onChange={(v) => updateWeakness(w.id, 'area', v)}
                                            className="text-[15px] font-bold text-slate-800"
                                        />
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${style.badge} text-white`}>
                                            {w.priority}优先级
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white/60 rounded-lg p-3 border border-white/40">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        问题分析
                                    </div>
                                    <EditableArea
                                        value={w.issue}
                                        onChange={(v) => updateWeakness(w.id, 'issue', v)}
                                        multiline
                                        className="text-xs text-slate-600 leading-relaxed"
                                    />
                                </div>
                                <div className="bg-white/80 rounded-lg p-3 border border-white/40">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        改进方案
                                    </div>
                                    <EditableArea
                                        value={w.plan}
                                        onChange={(v) => updateWeakness(w.id, 'plan', v)}
                                        multiline
                                        className="text-xs text-slate-700 leading-relaxed font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    <EditableArea
                                        value={w.timeline}
                                        onChange={(v) => updateWeakness(w.id, 'timeline', v)}
                                        className="italic"
                                    />
                                </div>
                            </div>
                        </ReportCard>
                    );
                })}
            </div>
        </ReportPageContainer>
    );
};

// 10. Parent-Child Activities Guide (亲子活动指南)
const PageParentChildActivities = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => {
    const [activities, setActivities] = useState([
        {
            id: 1,
            name: "周末阅读分享会",
            description: "每周日晚饭后,家长和孩子各分享本周最喜欢的一本书或一篇文章,交流阅读心得。",
            benefits: "培养阅读习惯,提升表达能力,增进亲子沟通。",
            materials: "书籍、笔记本",
            duration: "30分钟/次",
            icon: BookOpen,
            type: "学习类"
        },
        {
            id: 2,
            name: "家庭运动挑战",
            description: "制定家庭运动计划,如晨跑、跳绳、羽毛球等,全家人共同参与并记录打卡。",
            benefits: "增强体质,培养运动习惯,提升家庭凝聚力。",
            materials: "运动装备、打卡表",
            duration: "30分钟/天",
            icon: Dumbbell,
            type: "运动类"
        },
        {
            id: 3,
            name: "创意手工时光",
            description: "每月一次手工制作活动,可以是绘画、折纸、陶艺等,完成作品后合影留念。",
            benefits: "培养动手能力和创造力,记录成长足迹。",
            materials: "手工材料、相机",
            duration: "1-2小时/次",
            icon: Palette,
            type: "艺术类"
        },
        {
            id: 4,
            name: "户外自然探索",
            description: "利用周末或假期进行户外活动,如爬山、公园徒步、植物观察等,记录自然观察日志。",
            benefits: "开阔视野,培养观察力,增强环保意识。",
            materials: "观察笔记、相机、野外指南",
            duration: "半天至一天",
            icon: Map,
            type: "实践类"
        }
    ]);

    const updateActivity = (id: number, field: string, val: string) => {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
    };

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="亲子活动指南" subTitle="Parent-Child Activities" icon={HeartHandshake} />

            <ReportCaption className="mb-4">
                以下是老师为您家庭精心设计的亲子活动建议,通过高质量的陪伴促进孩子全面发展：
            </ReportCaption>

            <div className="space-y-4">
                {activities.map((a, index) => {
                    const typeStyles = {
                        '学习类': { bg: 'bg-blue-50/50', border: 'border-blue-100', badge: 'bg-blue-600' },
                        '运动类': { bg: 'bg-green-50/50', border: 'border-green-100', badge: 'bg-green-600' },
                        '艺术类': { bg: 'bg-purple-50/50', border: 'border-purple-100', badge: 'bg-purple-600' },
                        '实践类': { bg: 'bg-orange-50/50', border: 'border-orange-100', badge: 'bg-orange-600' }
                    };
                    const style = typeStyles[a.type as keyof typeof typeStyles] || typeStyles['学习类'];

                    return (
                        <ReportCard key={a.id} className={`${style.bg} ${style.border}`}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-slate-600`}>
                                    <a.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <EditableArea
                                            value={a.name}
                                            onChange={(v) => updateActivity(a.id, 'name', v)}
                                            className="text-[15px] font-bold text-slate-800"
                                        />
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${style.badge} text-white`}>
                                            {a.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        活动内容
                                    </div>
                                    <EditableArea
                                        value={a.description}
                                        onChange={(v) => updateActivity(a.id, 'description', v)}
                                        multiline
                                        className="text-xs text-slate-600 leading-relaxed"
                                    />
                                </div>
                                <div className="bg-white/60 rounded-lg p-2 border border-white/40">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        活动价值
                                    </div>
                                    <EditableArea
                                        value={a.benefits}
                                        onChange={(v) => updateActivity(a.id, 'benefits', v)}
                                        multiline
                                        className="text-[11px] text-slate-700 leading-relaxed"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <MapPin className="w-3 h-3" />
                                        <span>材料:</span>
                                        <EditableArea
                                            value={a.materials}
                                            onChange={(v) => updateActivity(a.id, 'materials', v)}
                                            className="flex-1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        <span>时长:</span>
                                        <EditableArea
                                            value={a.duration}
                                            onChange={(v) => updateActivity(a.id, 'duration', v)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ReportCard>
                    );
                })}
            </div>

            <ReportCard className="mt-6 bg-gradient-to-br from-amber-50 to-white border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-800">温馨提示</h4>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                    <p>• 活动重在过程而非结果,关注孩子的参与感和体验感</p>
                    <p>• 根据孩子兴趣和家庭实际情况灵活调整活动内容</p>
                    <p>• 建议为每次活动拍照或记录,制作成长相册</p>
                    <p>• 保持耐心和鼓励,营造轻松愉快的活动氛围</p>
                </div>
            </ReportCard>
        </ReportPageContainer>
    );
};

// 11. Parent Guide (EDITABLE) - 将被移除
const PageParentGuide = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string }) => {
    const [items, setItems] = useState([
        { activity: "课堂提醒卡", how: "和孩子一起设计“上课专注卡”，课前放在桌角。", why: "把“老师提醒”升级为“自我提醒”，建立自律闭环。" },
        { activity: "任务清单挑战", how: "每天写 3 件任务，做完勾选；忘了就记录原因。", why: "让孩子形成“计划→执行→复盘”的习惯。" },
        { activity: "音乐展示约定", how: "每两周一次家庭音乐分享，家长给出反馈。", why: "让音乐优势持续放光，训练“接受建议”的能力。" },
        { activity: "身体活力打卡", how: "制定“5分钟拉伸 + 10次跳绳”打卡表。", why: "规律运动帮助孩子更容易“坐得住、听得进”。" }
    ]);

    const updateItem = (idx: number, field: string, val: string) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[idx][field] = val;
        setItems(newItems);
    };

    return (
        <ReportPageContainer mode={mode} id={id}>
            <ReportSectionHeader title="家长安排" subTitle="Parent Plan" icon={Users} />

            <div className="space-y-4">
                {items.map((item, i) => (
                    <ReportCard key={i}>
                        <div className="flex items-center gap-3 mb-3 border-b border-slate-50 pb-2">
                            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                                {i + 1}
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">{item.activity}</h4>
                        </div>

                        <div className="space-y-2">
                            <div className="flex gap-2 items-start">
                                <span className="text-[10px] font-bold text-slate-400 uppercase w-12 shrink-0 pt-0.5">Action</span>
                                <div className="flex-1">
                                    <EditableArea
                                        value={item.how}
                                        onChange={(v) => updateItem(i, 'how', v)}
                                        multiline
                                        className="text-xs text-slate-600 leading-relaxed"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 items-start">
                                <span className="text-[10px] font-bold text-orange-400 uppercase w-12 shrink-0 pt-0.5">Value</span>
                                <div className="flex-1">
                                    <EditableArea
                                        value={item.why}
                                        onChange={(v) => updateItem(i, 'why', v)}
                                        multiline
                                        className="text-xs text-slate-600 leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    </ReportCard>
                ))}
            </div>
        </ReportPageContainer>
    );
};

// 8. Holiday Notice
const PageHolidayNotice = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => (
    <ReportPageContainer mode={mode} id={id}>
        <ReportSectionHeader title="假期安排" subTitle="Holiday Notice" icon={Calendar} />

        <ReportCard className="bg-gradient-to-br from-orange-50 to-white border-orange-100 relative overflow-hidden">
            <Sun className="absolute -top-4 -right-4 w-24 h-24 text-orange-100/50" />

            <div className="relative z-10 space-y-6 py-2">
                {[
                    { m: "Jan", d: "18", t: "正式放假", c: "整理物品，确认安全。" },
                    { m: "Feb", d: "16", t: "新学期报到", c: "上午 8:30 - 10:30 错峰报到。" }
                ].map((d, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-white border border-orange-100 flex flex-col items-center justify-center shadow-sm shrink-0 text-orange-600">
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{d.m}</span>
                            <span className="text-lg font-black leading-none">{d.d}</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">{d.t}</h4>
                            <p className="text-xs text-slate-500 mt-1">{d.c}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-orange-100/50">
                <div className="text-[11px] text-slate-600 leading-relaxed italic text-justify opacity-80">
                    “亲爱的同学们，假期是休整的港湾，也是弯道超车的机会。希望你们在享受春节团圆喜悦的同时，不忘阅读与运动。祝大家新年快乐！”
                </div>
            </div>
        </ReportCard>
    </ReportPageContainer>
);

// 9. Parent Feedback (Split from Combined Form)
const PageParentFeedback = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => (
    <ReportPageContainer mode={mode} id={id}>
        <ReportSectionHeader title="家长自评" subTitle="Parent Feedback" icon={MessageSquare} />

        <ReportCard>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <PenTool className="w-3 h-3" /> 家长寄语
            </div>
            <div className="space-y-6">
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="h-px bg-slate-100 w-full"></div>
            </div>
            <div className="mt-8 flex justify-end">
                <div className="text-right">
                    <div className="h-px bg-slate-300 w-32 mb-1"></div>
                    <div className="text-[10px] text-slate-300">家长签名</div>
                </div>
            </div>
        </ReportCard>
    </ReportPageContainer>
);

// 10. Student Feedback (Split from Combined Form)
const PageStudentFeedback = ({ mode = 'a4', id }: { mode?: 'a4' | 'mobile', id?: string, key?: any }) => (
    <ReportPageContainer mode={mode} id={id}>
        <ReportSectionHeader title="学生自评" subTitle="Student Reflection" icon={Smile} />

        <ReportCard>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Star className="w-3 h-3" /> 我的收获与目标
            </div>
            <div className="space-y-6">
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="h-px bg-slate-100 w-full"></div>
            </div>
            <div className="mt-8 flex justify-end">
                <div className="text-right">
                    <div className="h-px bg-slate-300 w-32 mb-1"></div>
                    <div className="text-[10px] text-slate-300">学生签名</div>
                </div>
            </div>
        </ReportCard>
    </ReportPageContainer>
);

// 11. Activity
const PageActivity = ({ activity, mode = 'a4', id }: { activity: any, mode?: 'a4' | 'mobile', id?: string, key?: any }) => (
    <ReportPageContainer mode={mode} id={id}>
        <ReportSectionHeader title="特色活动" subTitle="Activity" icon={Star} />

        <div className="w-full aspect-video bg-slate-100 rounded-xl overflow-hidden mb-5 shadow-sm">
            {activity.image && <img src={activity.image} className="w-full h-full object-cover" />}
        </div>

        <div className="flex items-baseline justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800">{activity.name}</h3>
            <span className="text-[10px] text-slate-400 font-mono">{activity.time}</span>
        </div>

        <ReportCard className="bg-blue-50/30 border-blue-50 mb-4">
            <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">Value</div>
            <ReportBodyText className="text-blue-900/80">{activity.purpose}</ReportBodyText>
        </ReportCard>

        <ReportCard>
            <ReportCardTitle>活动剪影</ReportCardTitle>
            <ReportBodyText>{activity.content}</ReportBodyText>
        </ReportCard>
    </ReportPageContainer>
);

// --- 4. NAVIGATION COMPONENT ---

const MobileAnchorBar = ({ activeSection, onNavigate, items }: { activeSection: string, onNavigate: (id: string) => void, items: { id: string, label: string }[] }) => {
    return (
        <div className="sticky top-[48px] z-30 bg-white/95 backdrop-blur border-b border-slate-100 print:hidden overflow-x-auto no-scrollbar py-2 pl-4 pr-4 shadow-sm">
            <div className="flex gap-2">
                {items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-slate-50 text-slate-500 '
                                }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


// --- MAIN WRAPPER ---

const TermReportView: React.FC<TermReportViewProps> = ({ student, onBack }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [viewMode, setViewMode] = useState<'a4' | 'mobile'>('mobile');
    const [activeSection, setActiveSection] = useState('cover');
    const [showSubjectSubPage, setShowSubjectSubPage] = useState(false);
    const [currentSubjectName, setCurrentSubjectName] = useState('');
    const contentStartRef = useRef<HTMLDivElement>(null);
    const isMale = student.gender === 'male';

    const mobileAnchorItems = isMale ? [
        { id: 'section-teacher', label: '教师关注' },
        { id: 'section-highlights', label: '高光时刻' },
        { id: 'section-growth', label: '成长概览' },
        { id: 'section-future', label: '未来潜力' },
        { id: 'section-future-suggestions', label: '成长建议' },
        { id: 'section-strengths', label: '优势强化' },
        { id: 'section-weakness', label: '薄弱改进' },
        { id: 'section-activities', label: '亲子活动' },
        { id: 'section-holiday', label: '寒假须知' },
        { id: 'section-parent', label: '家长反馈' },
        { id: 'section-student', label: '学生自评' }
    ] : [
        { id: 'section-highlights', label: '高光时刻' },
        { id: 'section-growth', label: '成长概览' },
        { id: 'section-advice', label: '成长建议' },
        { id: 'section-activities', label: '亲子活动' }
    ];

    const firstAnchorId = mobileAnchorItems[0]?.id;

    const handleStartReading = () => {
        if (viewMode === 'a4') {
            handleNext();
        } else if (firstAnchorId) {
            scrollToSection(firstAnchorId);
        }
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    // 处理学科选择 - 跳转到独立的子页面
    const handleSubjectClick = (subject: string) => {
        console.log('打开学科详情子页面:', subject);
        setCurrentSubjectName(subject);
        setShowSubjectSubPage(true);
    };

    const a4Pages = isMale ? [
        <PageCover key="cover" student={student} onStart={handleStartReading} mode="a4" />,
        <PageTeacherAttention key="teacher" mode="a4" />,
        <PageHighbrightMoments key="highlights" student={student} mode="a4" />,
        <PageGrowthOverview key="growth" student={student} mode="a4" onSubjectClick={handleSubjectClick} showFullContent={true} />,
        <PageFuturePotential key="future" mode="a4" />,
        <PageFutureGrowthSuggestions key="future-suggestions" mode="a4" />,
        <PageStrengthsEnhancement key="strengths" mode="a4" />,
        <PageWeaknessImprovement key="weakness" mode="a4" />,
        <PageParentChildActivities key="activities" mode="a4" />,
        <PageHolidayNotice key="holiday" mode="a4" />,
        <PageParentFeedback key="parent" mode="a4" />,
        <PageStudentFeedback key="student" mode="a4" />
    ] : [
        <PageCover key="cover" student={student} onStart={handleStartReading} mode="a4" />,
        <PageHighbrightMoments key="highlights" student={student} mode="a4" />,
        <PageGrowthOverview key="growth" student={student} mode="a4" onSubjectClick={handleSubjectClick} showFullContent={false} />,
        <PageComprehensiveGrowthAdvice key="advice" student={student} mode="a4" />,
        <PageSimpleParentChildActivities key="activities" student={student} mode="a4" />
    ];

    const mobilePages = isMale ? [
        <PageCover key="cover" student={student} onStart={handleStartReading} mode="mobile" />,
        <PageTeacherAttention key="teacher" mode="mobile" id="section-teacher" />,
        <PageHighbrightMoments key="highlights" student={student} mode="mobile" id="section-highlights" />,
        <PageGrowthOverview key="growth" student={student} mode="mobile" id="section-growth" onSubjectClick={handleSubjectClick} showFullContent={true} />,
        <PageFuturePotential key="future" mode="mobile" id="section-future" />,
        <PageFutureGrowthSuggestions key="future-suggestions" mode="mobile" id="section-future-suggestions" />,
        <PageStrengthsEnhancement key="strengths" mode="mobile" id="section-strengths" />,
        <PageWeaknessImprovement key="weakness" mode="mobile" id="section-weakness" />,
        <PageParentChildActivities key="activities" mode="mobile" id="section-activities" />,
        <PageHolidayNotice key="holiday" mode="mobile" id="section-holiday" />,
        <PageParentFeedback key="parent" mode="mobile" id="section-parent" />,
        <PageStudentFeedback key="student" mode="mobile" id="section-student" />
    ] : [
        <PageCover key="cover" student={student} onStart={handleStartReading} mode="mobile" />,
        <PageHighbrightMoments key="highlights" student={student} mode="mobile" id="section-highlights" />,
        <PageGrowthOverview student={student} mode="mobile" id="section-growth" onSubjectClick={handleSubjectClick} showFullContent={false} />,
        <PageComprehensiveGrowthAdvice key="advice" student={student} mode="mobile" id="section-advice" />,
        <PageSimpleParentChildActivities key="activities" student={student} mode="mobile" id="section-activities" />
    ];

    const totalPages = a4Pages.length;
    const handleNext = () => currentPage < totalPages - 1 && setCurrentPage(p => p + 1);
    const handlePrev = () => currentPage > 0 && setCurrentPage(p => p - 1);
    const handlePrint = () => window.print();

    return (
        <div className="h-full w-full bg-[#2A2A2A] sm:bg-[#E5E5E5] flex flex-col relative overflow-hidden print:bg-white print:h-auto print:overflow-visible font-sans">

            {/* Header */}
            <div className="bg-white px-4 py-2 flex items-center justify-between shadow-sm z-50 print:hidden h-[44px] shrink-0 border-b border-slate-100">
                <div className="flex-1 flex justify-start">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-slate-100 text-slate-700 transition-all">
                        <BackIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="font-bold text-slate-900 text-base">学期报告</div>
                <div className="flex-1"></div>
            </div>

            {/* Toolbar (View Mode) */}
            <div className="bg-[#F8FAFC] px-4 py-2 flex items-center justify-between border-b border-slate-200 z-40 print:hidden h-[48px] shrink-0 gap-2 sticky top-[44px]">
                <div className="flex bg-slate-200/50 rounded-lg p-0.5 shrink-0">
                    {['mobile', 'a4'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setViewMode(m as any)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase ${viewMode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 '}`}
                        >
                            {m === 'mobile' ? <Smartphone className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            {m}
                        </button>
                    ))}
                </div>

                {viewMode === 'a4' && (
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrev} disabled={currentPage === 0} className="p-1.5  rounded-full text-slate-600 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{currentPage + 1} / {totalPages}</span>
                        <button onClick={handleNext} disabled={currentPage === totalPages - 1} className="p-1.5  rounded-full text-slate-600 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                )}

                <button onClick={handlePrint} className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm active:scale-95">
                    <Printer className="w-4 h-4" />
                </button>
            </div>

            {/* Mobile Anchor Navigation (Only in Mobile Mode) */}
            {viewMode === 'mobile' && mobileAnchorItems.length > 0 && (
                <MobileAnchorBar activeSection={activeSection} onNavigate={scrollToSection} items={mobileAnchorItems} />
            )}

            {/* Main Viewport */}
            <div className="flex-1 overflow-y-auto print:overflow-visible px-0 pb-10 pt-0 print:p-0 flex justify-center items-start bg-white scroll-smooth" id="report-scroll-container">

                {/* 学科详情子页面叠加层 */}
                {showSubjectSubPage ? (
                    <div className="w-full h-full bg-white z-[60] flex flex-col sticky top-0 animate-in slide-in-from-right duration-300">
                        <PageSubjectReportsWithTabs
                            student={student}
                            mode="mobile"
                            initialSubject={currentSubjectName}
                            onBack={() => setShowSubjectSubPage(false)}
                        />
                    </div>
                ) : (
                    <>
                        {viewMode === 'mobile' && (
                            <div className="w-full bg-white overflow-hidden pb-10 print:hidden">
                                {mobilePages.map((page, i) => <React.Fragment key={i}>{page}</React.Fragment>)}
                                <div className="p-8 text-center text-[10px] text-slate-300 uppercase tracking-widest font-bold">- End of Report -</div>
                            </div>
                        )}

                        {viewMode === 'a4' && (
                            <div className="print:hidden w-full relative">
                                {a4Pages[currentPage]}
                            </div>
                        )}
                    </>
                )}

                <div className="hidden print:block w-full">
                    {a4Pages.map((P, i) => <div key={i} className="print-page-container">{P}</div>)}
                </div>
            </div>
        </div>
    );
};

export default TermReportView;
