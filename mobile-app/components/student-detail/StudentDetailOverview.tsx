import React from 'react';
import { ChevronLeft, ChevronRight, Mars, Triangle, Venus } from 'lucide-react';
import { useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { ASSETS } from '../../assets/images';
import type { CampusCoinDetail, Student } from '../../types';
import { formatCoinAmount } from '../../utils/coinFormat';
import './StudentDetailOverview.css';
import StudentDetailProfileGlass, { studentDetailProfileLayout } from './StudentDetailProfileGlass';

interface StudentDetailOverviewProps {
    student: Student;
    titleRef?: React.Ref<HTMLHeadingElement>;
    termSelector: React.ReactNode;
    className: string;
    medalCount: number;
    archiveCount: number;
    questionnaireCount: number;
    reportCount: number;
    campusCoinDetail: CampusCoinDetail;
    onBack: () => void;
    onEdit: () => void;
    onOpenMedals: () => void;
    onOpenArchive: () => void;
    onOpenQuestionnaires: () => void;
    onOpenCoins: () => void;
    onOpenReports: () => void;
    onOpenStudentActions: () => void;
}

export default function StudentDetailOverview({
    student,
    titleRef,
    termSelector,
    className: displayClassName,
    medalCount,
    archiveCount,
    questionnaireCount,
    reportCount,
    campusCoinDetail,
    onBack,
    onEdit,
    onOpenMedals,
    onOpenArchive,
    onOpenQuestionnaires,
    onOpenCoins,
    onOpenReports,
    onOpenStudentActions,
}: StudentDetailOverviewProps) {
    const coinTerms = useGrowthCoinTerms();
    const coinBalance = formatCoinAmount(campusCoinDetail.balance);
    const GenderIcon = student.gender === 'male' ? Mars : Venus;
    const isLeft = student.status === 'left';
    const status = isLeft ? '离校' : '在校';
    const metrics = [
        {
            id: 'coins',
            label: coinTerms.name,
            value: coinBalance,
            onOpen: onOpenCoins,
            ariaLabel: `查看${coinTerms.details}，${coinTerms.available} ${coinBalance}`,
        },
        { id: 'archive', label: '档案', value: archiveCount, onOpen: onOpenArchive },
        { id: 'questionnaires', label: '问卷', value: questionnaireCount, onOpen: onOpenQuestionnaires },
    ];

    return (
        <div className="student-detail-overview">
            <div className="student-detail-profile-toolbar">
                <button type="button" onClick={onBack} className="student-detail-profile-back" aria-label="返回">
                    <ChevronLeft size={22} strokeWidth={2.4} aria-hidden="true" />
                </button>
                {termSelector}
            </div>
            <section className="student-detail-profile tm-gold-header-surface" style={studentDetailProfileLayout} aria-labelledby="student-detail-profile-name">
                <StudentDetailProfileGlass />
                <div className="student-detail-profile-rear">
                    <button type="button" onClick={onEdit} className="student-detail-profile-edit">
                        编辑信息 <ChevronRight size={14} strokeWidth={2.3} aria-hidden="true" />
                    </button>
                </div>
                <div className="student-detail-profile-surface">
                    <div className="student-detail-profile-identity">
                        <div className="student-detail-profile-avatar-frame">
                            <img
                                className="student-detail-profile-avatar"
                                src={student.avatar || (student.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.STUDENT_GIRL_DEFAULT)}
                                alt=""
                                width={60}
                            />
                            <span
                                className="student-detail-profile-gender"
                                data-gender={student.gender}
                                role="img"
                                aria-label={student.gender === 'male' ? '男生' : '女生'}
                            >
                                <GenderIcon size={11} strokeWidth={2.6} aria-hidden="true" />
                            </span>
                        </div>
                        <div className="student-detail-profile-info">
                            <div className="student-detail-profile-name-row">
                                <h1 id="student-detail-profile-name" ref={titleRef} tabIndex={-1}>{student.name}</h1>
                                <button
                                    type="button"
                                    className="student-detail-profile-status"
                                    data-left={isLeft || undefined}
                                    aria-label={`${status}，查看学籍状态操作`}
                                    aria-haspopup="dialog"
                                    onClick={onOpenStudentActions}
                                >
                                    <span>{status}</span>
                                    <Triangle size={7} fill="currentColor" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="student-detail-profile-meta">
                                <span>{displayClassName}</span>
                                <span><span className="sr-only">学号 </span>{student.studentNo || student.id}</span>
                            </div>
                        </div>
                    </div>
                    <ul className="student-detail-profile-metrics" aria-label="学生成长概况">
                        {metrics.map(({ id, label, value, onOpen, ariaLabel }) => (
                            <li key={id}>
                                <button type="button" className="student-detail-profile-metric" onClick={onOpen} aria-label={ariaLabel}>
                                    <span className="student-detail-profile-metric-value">{value}</span>
                                    <span className="student-detail-profile-metric-label">{label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            <div className="student-detail-shortcuts">
                <button
                    type="button"
                    className="student-detail-shortcut student-detail-shortcut--medals"
                    onClick={onOpenMedals}
                    aria-label={`我的奖章，${medalCount}枚`}
                >
                    <span className="student-detail-shortcut-copy">
                        <span className="student-detail-shortcut-title">我的奖章</span>
                        <span className="student-detail-shortcut-count">
                            <strong className="student-detail-shortcut-value">{medalCount}</strong>
                            <ChevronRight size={14} aria-hidden="true" />
                        </span>
                    </span>
                </button>
                <button
                    type="button"
                    className="student-detail-shortcut student-detail-shortcut--reports"
                    onClick={onOpenReports}
                    aria-label={`我的报告，${reportCount}份`}
                >
                    <span className="student-detail-shortcut-copy">
                        <span className="student-detail-shortcut-title">我的报告</span>
                        <span className="student-detail-shortcut-count">
                            <strong className="student-detail-shortcut-value">{reportCount}</strong>
                            <ChevronRight size={14} aria-hidden="true" />
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
}
