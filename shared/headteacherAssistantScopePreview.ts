/**
 * 班主任助理评价能力的演示开关
 *
 * 只用于教师手机端预览页现场对比「仅开通学生评价 / 仅开通班级评价 / 都开通」三种板块组合，
 * 不参与真实权限判定：真实能力范围仍由学校空间的 evaluationScopes 决定。
 * 滑块本身没有「跟随配置」这一档，进入页面时的默认档位由学校配置推出，
 * 也就是在下面三个选项里选中与学校配置一致的那一个。
 */

export type HeadteacherAssistantScopePreviewMode = 'student-only' | 'class-only' | 'both';

export interface HeadteacherAssistantScopePreviewOption {
    value: HeadteacherAssistantScopePreviewMode;
    /** 滑块上显示的短文案，保证三项并排不折行 */
    label: string;
    /** 辅助技术与悬停提示使用的完整文案 */
    fullLabel: string;
}

export const HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS: readonly HeadteacherAssistantScopePreviewOption[] = [
    { value: 'student-only', label: '仅学生', fullLabel: '仅开通学生评价' },
    { value: 'class-only', label: '仅班级', fullLabel: '仅开通班级评价' },
    { value: 'both', label: '都开通', fullLabel: '学生评价和班级评价都开通' },
];

/** 学校配置对应的默认档位；两种评价都没开通时班主任助理入口不出现，返回空值。 */
export const getHeadteacherAssistantScopePreviewMode = (
    scopes: readonly string[],
): HeadteacherAssistantScopePreviewMode | null => {
    const hasStudent = scopes.includes('student');
    const hasClass = scopes.includes('class');
    if (hasStudent && hasClass) return 'both';
    if (hasStudent) return 'student-only';
    if (hasClass) return 'class-only';
    return null;
};
