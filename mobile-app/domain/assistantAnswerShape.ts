/**
 * 班主任助理对话回答的公共展示结构
 *
 * 学生评价与班级评价的数据口径各自独立，但对话气泡的呈现字段必须一致，
 * 这样同一套气泡渲染可以承接两类能力，不需要在页面上区分来源。
 */

export type AssistantAnswerType =
    | 'weekly_performance'
    | 'deduction_patterns'
    | 'next_week_focus'
    | 'clarification'
    | 'unavailable'
    | 'student_coverage'
    | 'student_orientation'
    | 'student_improvement'
    | 'capability_unavailable';

export interface AssistantAnswerMetric {
    label: string;
    value: string;
    tone?: 'default' | 'negative';
}

export interface AssistantAnswerBreakdown {
    label: string;
    value: string;
    detail: string;
    tone?: 'default' | 'negative';
}

export interface AssistantAiInsight {
    title: string;
    body: string;
}

export interface AssistantAnswerPresentation {
    answerType: AssistantAnswerType;
    message: string;
    metrics: AssistantAnswerMetric[];
    breakdown: AssistantAnswerBreakdown[];
    analysis: AssistantAiInsight[];
    suggestions: AssistantAiInsight[];
    evidenceRefs: string[];
    promptVersion: string;
    dataSnapshotId: string;
}
