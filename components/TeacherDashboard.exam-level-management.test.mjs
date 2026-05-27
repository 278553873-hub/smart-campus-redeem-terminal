import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText("'考试等级管理'", '基础信息配置菜单应新增考试等级管理。');
requireText('interface ExamLevelOption', '考试等级应有独立数据结构，避免散落字符串。');
requireText('defaultExamLevelOptions', '考试等级管理应定义默认等级数据。');
for (const level of ['优', '良', '合格', '待合格', '缺考']) {
  requireText(`name: '${level}'`, `考试等级默认值应包含${level}。`);
}
for (const color of ['#00994C', '#2962FF', '#CC8800', '#E64A19', '#666666']) {
  requireText(`color: '${color}'`, `考试等级默认颜色应包含${color}。`);
}
requireText('examLevelOptions.map(option => ({ label: option.name, value: option.name }))', '考试数据批量设置下拉应读取考试等级管理的数据来源。');
requireText('getExamLevelColorStyle', '考试成绩颜色应读取考试等级管理中的颜色。');
forbidText("const gradeScorePresetOptions = ['优', '良', '合格', '待合格', '缺考'];", '考试数据不应继续使用写死的等级数组。');
forbidText('const gradeScoreColorClassMap', '考试数据不应继续使用写死的颜色 class 映射。');
requireText("activeMenu === '考试等级管理'", '应渲染考试等级管理页面。');
requireText('等级名称', '新增/编辑考试等级应包含等级名称字段。');
requireText('颜色', '新增/编辑考试等级应包含颜色字段。');
requireText('handleOpenExamLevelModal', '考试等级管理应支持新增和编辑。');
requireText('handleSaveExamLevel', '考试等级管理应支持保存。');
requireText('handleDeleteExamLevel', '考试等级管理应支持删除。');
requireText('window.confirm(`确认删除考试等级“${level.name}”吗？`)', '删除考试等级应有二次确认。');
requireText('考试等级将作为考试数据批量设置的可选值。', '页面应说明考试等级对考试数据批量设置的影响。');
