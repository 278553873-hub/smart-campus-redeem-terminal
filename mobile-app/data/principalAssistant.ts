/**
 * 校长助理的学校数据快照（演示数据）
 *
 * 与「本周管理建议」「上月学校复盘」「学期学校报告」三份报告共用同一份口径，
 * 保证助理的回答和报告里看到的数字、点名的班级完全一致。
 */
import {
    PRINCIPAL_MONTHLY_REPORT_SAMPLE,
    PRINCIPAL_WEEKLY_REPORT_SAMPLE,
    type PrincipalPeriodicReportContent,
} from './principalPeriodicReports.ts';
import { PRINCIPAL_TERM_REPORT_SAMPLE, type PrincipalTermReportContent } from './principalTermReport.ts';

/** 需要重点关注的班级：说明关注点，并给出判断依据。 */
export interface PrincipalClassSignal {
    className: string;
    signal: string;
    evidence: string;
}

export interface PrincipalAssistantSnapshot {
    id: string;
    week: PrincipalPeriodicReportContent;
    month: PrincipalPeriodicReportContent;
    term: PrincipalTermReportContent;
    focusClasses: PrincipalClassSignal[];
}

/**
 * 需要重点关注的班级名单。
 * 演示口径：与报告里点名的班级（三年级12班、三年级14班为高频班级）保持一致。
 */
const PRINCIPAL_FOCUS_CLASSES: PrincipalClassSignal[] = [
    {
        className: '五年级5班',
        signal: '上周没有新增记录',
        evidence: '上周没有产生任何评价事件，也没有任课教师参与，先核实是账号、流程还是场景安排问题',
    },
    {
        className: '三年级1班',
        signal: '记录依赖少数教师',
        evidence: '上周只有1至2名教师产生记录，跨班任课教师的参与为0',
    },
    {
        className: '六年级8班',
        signal: '记录密度全校最低',
        evidence: '整月32条，为全校最低，其中超过70%的记录来自同一位教师',
    },
    {
        className: '二年级2班',
        signal: '记录集中在少数日期',
        evidence: '本月70%以上的记录集中在4天内完成，日常连续性不足',
    },
];

export const getPrincipalAssistantSnapshot = (): PrincipalAssistantSnapshot => ({
    id: ['principal-assistant', PRINCIPAL_WEEKLY_REPORT_SAMPLE.periodLabel, PRINCIPAL_MONTHLY_REPORT_SAMPLE.periodLabel].join('-'),
    week: PRINCIPAL_WEEKLY_REPORT_SAMPLE,
    month: PRINCIPAL_MONTHLY_REPORT_SAMPLE,
    term: PRINCIPAL_TERM_REPORT_SAMPLE,
    focusClasses: PRINCIPAL_FOCUS_CLASSES,
});
