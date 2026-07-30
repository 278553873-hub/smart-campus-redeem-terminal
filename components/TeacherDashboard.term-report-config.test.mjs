import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const sectionStart = source.indexOf('{/* 期末报告配置 */}');
const sectionEnd = source.indexOf('{/* 考试等级管理 */}', sectionStart);
const section = source.slice(sectionStart, sectionEnd);
const baseConfigMenuStart = source.indexOf("title: '基础信息配置'");
const reportConfigMenuStart = source.indexOf("title: '报告配置'");
const dataCenterMenuStart = source.indexOf("title: '数据中心'");
const baseConfigMenu = source.slice(baseConfigMenuStart, reportConfigMenuStart);
const reportConfigMenu = source.slice(reportConfigMenuStart, dataCenterMenuStart);

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const requireSectionText = (needle, message) => {
  if (!section.includes(needle)) throw new Error(message);
};

const forbidSectionText = (needle, message) => {
  if (section.includes(needle)) throw new Error(message);
};

if (baseConfigMenu.includes("'期末报告配置'")) throw new Error('基础信息配置菜单不应继续承载期末报告配置。');
if (!reportConfigMenu.includes("children: ['学科指标', '期末报告配置']")) throw new Error('报告配置菜单应包含学科指标和期末报告配置。');
requireText('interface TermReportDataModuleConfig', '期末报告配置应区分报告使用内容。');
requireText('defaultTermReportDataModules', '应定义平台预置的报告内容模块。');
for (const name of ['目标达成', '日常表现', '学业表现', '身体成长', '健康概览', '教师评价']) {
  requireText(`name: '${name}'`, `报告内容应包含${name}。`);
}
requireText("id: 'bodyGrowth', name: '身体成长'", '身体成长必须作为独立报告内容模块。');
requireText("id: 'healthOverview', name: '健康概览'", '健康概览必须作为独立报告内容模块。');
requireText("permissionLabel: '健康数据'", '健康内容必须提示权限范围。');
requireText('handleToggleTermReportDataModule', '报告使用内容应支持独立开关。');
requireText('handleDropTermReportModule', '报告展示板块应支持拖动排序。');
requireSectionText('报告使用内容', '页面应先配置报告使用内容。');
requireSectionText('报告展示板块', '页面应继续配置报告展示板块。');
requireSectionText('>报告配置</span>', '期末报告配置面包屑应归属报告配置。');
requireSectionText('<Switch size="small"', '内容模块与展示板块应使用标准开关。');
requireSectionText('保存配置', '跨模块报告配置应显式保存。');
requireSectionText('拖动左侧图标调整顺序', '报告板块应提供紧凑排序提示。');
requireSectionText('<Move size={17}', '排序入口应使用图标。');
forbidSectionText('问卷', '首期报告配置不应允许学校选择普通问卷。');
forbidSectionText('数据库字段', '报告配置不应暴露底层字段。');
forbidSectionText('提示词', '内容配置页不应把提示词作为数据选择方式。');
forbidSectionText('border border-[#BEDAFF] bg-[#E8F3FF]', '页面不应保留说明型蓝色提示卡。');
forbidSectionText('1、拖动排序标记进行板块调整排序', '页面不应保留备注式操作说明。');
