import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const sectionStart = source.indexOf("{/* 期末报告配置 */}");
const sectionEnd = source.indexOf("{/* 考试等级管理 */}", sectionStart);
const section = source.slice(sectionStart, sectionEnd);

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const requireSectionText = (needle, message) => {
  if (!section.includes(needle)) throw new Error(message);
};

const forbidSectionText = (needle, message) => {
  if (section.includes(needle)) throw new Error(message);
};

requireText("'期末报告配置'", '基础信息配置菜单应新增期末报告配置。');
requireText('interface TermReportModuleConfig', '期末报告配置应有独立数据结构。');
requireText('defaultTermReportModules', '应定义期末报告默认板块。');
for (const name of ['五育雷达图', '学科成绩分布', '高光时刻', '总体评价', '成长建议', '亲子活动指南']) {
  requireText(`name: '${name}'`, `默认板块应包含${name}。`);
}
requireText("id: 'highlightMoments', name: '高光时刻', enabled: false", '高光时刻默认应未选中。');
for (const id of ['fiveEducationRadar', 'subjectGradeDistribution', 'overallEvaluation', 'growthSuggestions', 'parentChildActivityGuide']) {
  requireText(`id: '${id}'`, `默认配置应包含${id}。`);
}
requireText('setDraggedTermReportModuleId', '期末报告配置应支持拖拽排序状态。');
requireText('handleDropTermReportModule', '期末报告配置应支持拖拽落位。');
requireText('handleToggleTermReportModule', '期末报告配置应支持展示开关。');
requireText("activeMenu === '期末报告配置'", '应渲染期末报告配置页面。');
requireSectionText('aria-label="拖拽排序"', '页面应保留拖拽排序入口。');
requireText('Move', '拖拽排序标记应使用十字移动图标，不能使用字符或 emoji。');
requireSectionText('<Move size={18}', '拖拽排序标记应使用更清晰的十字移动图标。');
requireText('absolute left-0.5 top-0.5 h-5 w-5', '开关圆点必须有固定 left 定位，避免开启态漂移。');
forbidSectionText('保存配置', '拖动排序、开关设置应立即生效，不需要保存按钮。');
forbidSectionText('拖拽排序会影响家长端期末报告中的板块展示顺序。', '不需要展示旧版拖拽排序说明文案。');
requireSectionText('border border-[#BEDAFF] bg-[#E8F3FF]', '期末报告配置备注应复用新建考试的蓝底提示样式。');
requireSectionText('<Info size={14}', '期末报告配置备注应复用新建考试的 Info 图标样式。');
requireSectionText('<ol className="m-0 list-none p-0">', '期末报告配置备注应复用新建考试的列表结构。');
requireSectionText('1、拖动排序标记进行板块调整排序', '期末报告配置应显示排序备注。');
forbidSectionText('已展示 {termReportModules.filter(module => module.enabled).length}', '不需要显示已展示数量。');
forbidSectionText('重置为默认', '不需要重置为默认操作。');
forbidSectionText('{module.description}', '不需要展示每个板块备注文案。');
forbidSectionText('↔', '拖拽排序图标不应使用 ↔。');
forbidSectionText('↕', '拖拽排序图标不应使用 ↕ 字符。');
forbidSectionText('h-10 w-10 shrink-0 items-center justify-center rounded border', '序号不应增加边框容器。');
requireSectionText('w-full max-w-[720px]', '备注框和选项框应使用同一宽度容器，避免右侧不对齐。');

forbidSectionText('<Alert', '不应使用 Arco Alert，应复用新建考试的备注样式。');
forbidSectionText('role="note"', '不应使用旧版手写 note 容器。');
