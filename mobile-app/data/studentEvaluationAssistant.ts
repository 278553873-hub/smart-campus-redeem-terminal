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
import { getMockStudentNamesForClass } from './studentNamePool.ts';

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
    /** 本周没有被评价到的学生姓名，用于把「还差多少人」说到具体是谁。 */
    uncoveredStudents: string[];
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

/**
 * 演示数据只有汇总口径，没有逐条记录明细，
 * 因此按班级花名册稳定取一批「本周没有被评价到」的学生，保证助理解答能点到具体的人。
 */
const buildUncoveredStudents = (
    classId: string,
    classSize: number,
    uncoveredCount: number,
    focusStudents: StudentEvaluationFocusStudent[],
): string[] => {
    if (uncoveredCount <= 0) return [];

    const focusedNames = new Set(
        focusStudents.flatMap(student => student.name.split('、').filter(Boolean)),
    );

    return getMockStudentNamesForClass(classId, classSize)
        .filter(name => !focusedNames.has(name))
        .slice(0, uncoveredCount);
};

const buildWeekSummary = (
    classId: string,
    weekAdvice: WeeklyActionAdvicePageData,
): StudentEvaluationWeekSummary => {
    if (weekAdvice.status !== 'generated') {
        return {
            label: '本周',
            dataRange: weekAdvice.currentWeekRange,
            records: weekAdvice.currentWeek.records,
            covered: weekAdvice.currentWeek.covered,
            total: weekAdvice.currentWeek.total,
            evaluators: weekAdvice.currentWeek.evaluators,
            focusStudents: [],
            uncoveredStudents: [],
            hasRecordDetails: false,
        };
    }

    const focusStudents: StudentEvaluationFocusStudent[] = weekAdvice.content.studentInsights.map(insight => ({
        name: insight.studentNames.join('、'),
        finding: insight.finding,
        evidence: insight.evidence,
        verificationFocus: insight.verificationFocus,
    }));
    const { records, covered, total, evaluators } = weekAdvice.overview;

    return {
        label: '本周',
        dataRange: weekAdvice.dataRange,
        records,
        covered,
        total,
        evaluators,
        focusStudents,
        uncoveredStudents: buildUncoveredStudents(
            classId,
            total,
            Math.max(0, total - covered),
            focusStudents,
        ),
        hasRecordDetails: true,
    };
};

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
        week: buildWeekSummary(classId, weekAdvice),
        month: buildMonthSummary(review),
    };
};
