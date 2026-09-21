/**
 * 班主任助理「学生评价」能力的演示数据快照
 *
 * 数据来源与「本周行动建议」「我的评价复盘」两份报告保持一致，
 * 保证同一个班级在报告页和助理对话里看到的是同一份口径。
 */
import {
    CURRENT_TEACHER_EVALUATION_REVIEW,
    TEACHER_EVALUATION_REVIEW_CURRENT_BY_CLASS,
    type TeacherEvaluationReviewPageData,
} from './teacherEvaluationReview.ts';
import {
    CURRENT_WEEKLY_ACTION_ADVICE,
    WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS,
    type WeeklyActionAdvicePageData,
} from './weeklyActionAdvice.ts';

export interface StudentEvaluationFocusStudent {
    name: string;
    finding: string;
    evidence: string;
    verificationFocus: string;
}

export interface StudentEvaluationWeekSummary {
    label: string;
    dataRange: string;
    records: number;
    covered: number;
    total: number;
    evaluators: number;
    focusStudents: StudentEvaluationFocusStudent[];
    hasRecordDetails: boolean;
}

export interface StudentEvaluationMonthSummary {
    label: string;
    dataRange: string;
    records: number;
    covered: number;
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    indicatorsUsed: number;
    coverageNotes: string[];
    orientationNotes: string[];
    expressionNotes: string[];
    actions: string[];
    hasRecordDetails: boolean;
}

export interface StudentEvaluationSnapshot {
    id: string;
    classId: string;
    week?: StudentEvaluationWeekSummary;
    month?: StudentEvaluationMonthSummary;
}

const getMonthLabel = (reviewMonth: string) => {
    const month = Number(reviewMonth.split('-')[1]);
    return Number.isFinite(month) && month > 0 ? `${month}月` : '上月';
};

const pickWeekAdvice = (classId: string): WeeklyActionAdvicePageData => (
    WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS[classId] ?? CURRENT_WEEKLY_ACTION_ADVICE
);

const pickReview = (classId: string): TeacherEvaluationReviewPageData => (
    TEACHER_EVALUATION_REVIEW_CURRENT_BY_CLASS[classId] ?? CURRENT_TEACHER_EVALUATION_REVIEW
);

const buildWeekSummary = (weekAdvice: WeeklyActionAdvicePageData): StudentEvaluationWeekSummary => (
    weekAdvice.status === 'generated'
        ? {
            label: '本周',
            dataRange: weekAdvice.dataRange,
            records: weekAdvice.overview.records,
            covered: weekAdvice.overview.covered,
            total: weekAdvice.overview.total,
            evaluators: weekAdvice.overview.evaluators,
            focusStudents: weekAdvice.content.studentInsights.map(insight => ({
                name: insight.studentNames.join('、'),
                finding: insight.finding,
                evidence: insight.evidence,
                verificationFocus: insight.verificationFocus,
            })),
            hasRecordDetails: true,
        }
        : {
            label: '本周',
            dataRange: weekAdvice.currentWeekRange,
            records: weekAdvice.currentWeek.records,
            covered: weekAdvice.currentWeek.covered,
            total: weekAdvice.currentWeek.total,
            evaluators: weekAdvice.currentWeek.evaluators,
            focusStudents: [],
            hasRecordDetails: false,
        }
);

const buildMonthSummary = (review: TeacherEvaluationReviewPageData): StudentEvaluationMonthSummary => (
    review.status === 'generated'
        ? {
            label: getMonthLabel(review.reviewMonth),
            dataRange: review.dataRange,
            records: review.overview.records,
            covered: review.overview.covered,
            total: review.overview.total,
            positive: review.overview.positive,
            negative: review.overview.negative,
            neutral: review.overview.neutral,
            indicatorsUsed: review.overview.indicatorsUsed,
            coverageNotes: review.content.attentionInsights,
            orientationNotes: review.content.perspectiveInsights,
            expressionNotes: review.content.indicatorAndExpressionInsights,
            actions: review.content.actions,
            hasRecordDetails: true,
        }
        : {
            label: getMonthLabel(review.reviewMonth),
            dataRange: review.dataRange,
            records: review.overview.records,
            covered: review.overview.covered,
            total: review.overview.total,
            positive: review.overview.positive,
            negative: review.overview.negative,
            neutral: review.overview.neutral,
            indicatorsUsed: review.overview.indicatorsUsed,
            coverageNotes: [],
            orientationNotes: [],
            expressionNotes: [],
            actions: [],
            hasRecordDetails: false,
        }
);

export const getStudentEvaluationSnapshot = (classId: string): StudentEvaluationSnapshot => {
    const weekAdvice = pickWeekAdvice(classId);
    const review = pickReview(classId);

    return {
        id: ['student-evaluation', classId, weekAdvice.id, review.id].join('-'),
        classId,
        week: buildWeekSummary(weekAdvice),
        month: buildMonthSummary(review),
    };
};
