import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../../App.tsx');
const dashboardSource = read('../DashboardView.tsx');
const bodySource = read('./StudentBodyMeasurementsView.tsx');
const healthSource = read('./StudentHealthRecordsView.tsx');
const goalSource = read('./SemesterGoalPlanView.tsx');
const storeSource = read('../../../shared/studentGrowthStore.ts');
const pcSource = read('../../../components/TeacherDashboard.tsx');
const importSource = read('../../../components/HealthDataImportView.tsx');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

for (const route of ['student_body_measurements', 'student_health_records', 'student_goal_plan']) {
  requireText(appSource, `'${route}'`, `教师手机端缺少${route}路由。`);
}
requireText(appSource, 'ensureStudentGrowthProfile(activeStudent.id)', '学生切换后应读取统一成长数据。');
requireText(appSource, 'STUDENT_GROWTH_STORE_EVENT', '成长数据修改后应刷新学生详情。');
requireText(dashboardSource, '身体成长', '成长概览应展示身体成长摘要。');
requireText(dashboardSource, '本学期目标', '成长概览应展示学期目标摘要。');
requireText(dashboardSource, '健康检查', '成长概览应展示健康检查摘要。');
requireText(dashboardSource, 'onViewBodyMeasurements', '身体成长摘要应进入独立的身体成长记录。');
requireText(dashboardSource, 'onViewHealthRecords', '健康检查摘要应进入体检详情。');
requireText(dashboardSource, 'onViewGoalPlan', '学期目标摘要应进入目标详情。');

requireText(bodySource, "type PageMode = 'list' | 'detail' | 'form'", '身体成长页面应支持列表、详情和编辑。');
requireText(bodySource, 'saveBodyMeasurementRecord', '身体成长页面应把新增和修正写回成长数据。');
requireText(bodySource, 'record.sourceLabel', '身体成长历史应展示问卷、体检或手机录入来源。');
requireText(bodySource, 'h-11 w-11', '身体成长图标操作必须满足44像素触控尺寸。');

requireText(healthSource, "type PageMode = 'list' | 'detail' | 'form'", '体检页面应支持列表、详情和完整表单。');
requireText(healthSource, 'validateHealthExamInput', '保存体检记录前应校验日期和数值。');
requireText(healthSource, 'calculateBmi', '身体质量指数必须自动计算。');
requireText(healthSource, "formValue.id ? '体检记录已修正' : '新测量已保存'", '编辑与新增必须使用不同业务语义。');
requireText(healthSource, '修正本次记录', '旧记录编辑应明确为修正。');
requireText(healthSource, '新增测量', '新测量应新增成长记录。');
requireText(healthSource, '<MobileBottomSheet', '低频体检操作应渐进披露。');
requireText(healthSource, 'h-11 w-11', '图标操作必须满足44像素触控尺寸。');

for (const text of ['上学期回顾', '我的目标', '老师想对你说', '爸爸妈妈想对你说', '我们的约定', '共同确认']) {
  requireText(goalSource, text, `学期目标详情缺少${text}。`);
}
requireText(goalSource, "(['学生', '教师', '家长'] as const)", '学期目标应展示三方确认。');
requireText(goalSource, 'confirmation.method', '确认状态应展示账号确认或访谈确认方式。');

requireText(storeSource, 'sourceType: HealthExamSourceType', '体检记录应保存来源类型。');
requireText(storeSource, 'corrections: HealthExamCorrection[]', '体检修正应保留历史。');
requireText(storeSource, 'record.id !== input.id', '同日记录校验应允许修正当前记录。');
requireText(storeSource, "sourceLabel: '教师手机端新增'", '手机新测量应保存来源。');
requireText(storeSource, "value === undefined ? value", '成长数据复制应安全处理可选目标计划。');
requireText(storeSource, 'getLatestSemesterGoalPlan(workspace.semesterGoalPlans, studentId)', '学生详情和档案必须读取最新一版学期目标。');

requireText(pcSource, "children: ['资料文件', '考试数据', '作业数据', '体检数据']", 'PC数据中心应增加体检数据入口。');
requireText(pcSource, "activeMenu === '体检数据'", 'PC后台应渲染体检数据页面。');
for (const text of ['导入体检数据', '重复记录', '未匹配学生', '待确认格式']) {
  requireText(importSource, text, `PC体检导入流程缺少${text}。`);
}
