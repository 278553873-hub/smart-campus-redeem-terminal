/** 首期暂不开放的功能保留原页面和路由，后续可独立开启；开启后仍遵循学校权限。 */
export interface TeacherPadFeatureFlags {
    managementTools: boolean;
    weeklyDutySchedule: boolean;
    classLeaderboard: boolean;
    wechatQuickLogin: boolean;
}

export const teacherPadFeatures: TeacherPadFeatureFlags = {
    managementTools: false,
    weeklyDutySchedule: false,
    classLeaderboard: false,
    wechatQuickLogin: false,
};

/** 第二期预览在第一期基础上开放这些入口；具体内容仍受学校权限约束。 */
export const teacherPadPhaseTwoFeatures: TeacherPadFeatureFlags = {
    managementTools: true,
    weeklyDutySchedule: true,
    classLeaderboard: true,
    wechatQuickLogin: true,
};
