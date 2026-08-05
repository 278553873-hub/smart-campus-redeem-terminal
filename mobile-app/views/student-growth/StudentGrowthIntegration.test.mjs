import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../../App.tsx');
const dashboardSource = read('../DashboardView.tsx');
const bodySource = read('./StudentBodyMeasurementsView.tsx');
const healthSource = read('./StudentHealthRecordsView.tsx');
const storeSource = read('../../../shared/studentGrowthStore.ts');
const archiveStoreSource = read('../../../shared/studentArchiveStore.ts');
const pcSource = read('../../../components/TeacherDashboard.tsx');
const importSource = read('../../../components/HealthDataImportView.tsx');
const settingsSource = read('../../../components/GrowthDataSettingsView.tsx');
const catalogSource = read('../../../shared/studentGrowthFieldCatalog.ts');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

for (const route of ['student_body_measurements', 'student_health_records']) {
  requireText(appSource, `'${route}'`, `教师手机端缺少${route}路由。`);
}
if (appSource.includes("'student_goal_plan'") || dashboardSource.includes('本学期目标')) {
  throw new Error('学期目标暂缓后，不应继续出现在学生详情可见流程中。');
}
requireText(appSource, 'ensureStudentGrowthProfile(activeStudent.id)', '学生切换后应读取统一成长数据。');
requireText(appSource, 'STUDENT_GROWTH_STORE_EVENT', '成长数据修改后应刷新学生详情。');
requireText(dashboardSource, '成长数据', '成长概览应展示成长数据摘要。');
requireText(dashboardSource, '健康检查', '成长概览应展示健康检查摘要。');
requireText(dashboardSource, 'onViewBodyMeasurements', '身体成长摘要应进入独立的身体成长记录。');
requireText(dashboardSource, 'onViewHealthRecords', '健康检查摘要应进入体检详情。');
requireText(dashboardSource, 'latestHeightMeasurement', '成长概览必须独立读取最近一次身高。');
requireText(dashboardSource, 'latestWeightMeasurement', '成长概览必须独立读取最近一次体重。');
requireText(dashboardSource, 'latestBmiMeasurement', '身体质量指数必须读取最近一次完整测量记录。');
requireText(dashboardSource, 'bodyGrowthMetrics.length > 0 &&', '学生没有成长数据时不应渲染空模块。');
requireText(dashboardSource, '{latestHealthRecord && (', '学生没有体检数据时不应渲染空模块。');
requireText(dashboardSource, 'metric.recordedAt', '不同成长指标必须分别展示自己的记录日期。');
if (dashboardSource.includes("latestMeasurement?.measuredAt ?? '待补充'") || dashboardSource.includes('暂无测量记录') || dashboardSource.includes('暂无体检记录')) {
  throw new Error('学生详情不应把非必填成长数据表达为待补充或空卡片。');
}

requireText(bodySource, "type PageMode = 'list' | 'detail' | 'form'", '身体成长页面应支持列表、详情和编辑。');
requireText(bodySource, 'saveStudentGrowthDataRecord', '成长数据页面应把新增和修正写回统一成长记录。');
requireText(bodySource, 'record.sourceLabel', '身体成长历史应展示问卷、体检或手机录入来源。');
requireText(bodySource, 'h-11 w-11', '身体成长图标操作必须满足44像素触控尺寸。');
requireText(bodySource, '请至少填写一项成长数据', '手机端成长数据应允许任意启用字段独立录入。');
requireText(bodySource, 'getEnabledGrowthFields(spaceId)', '手机端成长数据必须读取学校启用字段。');
requireText(bodySource, '选择本次录入内容', '手机端新增记录应先渐进选择本次字段。');

requireText(healthSource, "type PageMode = 'list' | 'detail' | 'form'", '体检页面应支持列表、详情和完整表单。');
requireText(healthSource, 'validateHealthExamInput', '保存体检记录前应校验日期和数值。');
requireText(healthSource, 'calculateBmi', '身体质量指数必须自动计算。');
requireText(healthSource, "formValue.id ? '体检记录已修正' : '新测量已保存'", '编辑与新增必须使用不同业务语义。');
requireText(healthSource, '修正本次记录', '旧记录编辑应明确为修正。');
requireText(healthSource, '新增测量', '新测量应新增成长记录。');
requireText(healthSource, '<MobileBottomSheet', '低频体检操作应渐进披露。');
requireText(healthSource, 'h-11 w-11', '图标操作必须满足44像素触控尺寸。');

requireText(storeSource, 'sourceType: HealthExamSourceType', '体检记录应保存来源类型。');
requireText(storeSource, 'corrections: HealthExamCorrection[]', '体检修正应保留历史。');
requireText(storeSource, 'record.id !== input.id', '同日记录校验应允许修正当前记录。');
requireText(storeSource, "sourceLabel: '教师手机端新增'", '手机新测量应保存来源。');
const selectableGrowthModules = archiveStoreSource.slice(
  archiveStoreSource.indexOf('export const ARCHIVE_GROWTH_MODULE_OPTIONS'),
  archiveStoreSource.indexOf('export const ARCHIVE_GROWTH_FIELD_GROUPS'),
);
if (selectableGrowthModules.includes('semester_goal') || selectableGrowthModules.includes('学期目标')) {
  throw new Error('档案新增字段暂不应提供学期目标。');
}
requireText(archiveStoreSource, '.filter(module => SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS.has(module.key))', '旧档案草稿必须过滤已暂缓的成长模块。');

requireText(pcSource, "children: ['资料文件', '考试数据', '作业数据', '成长数据设置', '成长数据导入']", 'PC数据中心应提供成长数据设置和导入入口。');
requireText(pcSource, "activeMenu === '成长数据设置'", 'PC后台应渲染成长数据设置页面。');
requireText(settingsSource, 'setEnabledGrowthFieldKeys', '学校字段开关必须写入统一启用配置。');
requireText(settingsSource, 'PLATFORM_GROWTH_FIELD_CATALOG', '学校字段设置必须展示运营平台字段目录。');
requireText(catalogSource, 'GROWTH_FIELD_CONFIG_EVENT', '统一字段配置必须提供跨页面更新事件。');
for (const text of ['导入成长数据', '重复记录', '未匹配学生', '待确认格式']) {
  requireText(importSource, text, `PC成长数据导入流程缺少${text}。`);
}
