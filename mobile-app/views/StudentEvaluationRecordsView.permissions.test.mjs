import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const appSource = read('../App.tsx');
const dashboardSource = read('./DashboardView.tsx');
const listSource = read('./StudentEvaluationRecordsView.tsx');
const timeFilterSource = read('./student-evaluation/EvaluationTimeFilterSheet.tsx');
const teacherFilterSource = read('./student-evaluation/EvaluationTeacherFilterSheet.tsx');
const indicatorFilterSource = read('./student-evaluation/EvaluationIndicatorFilterSheet.tsx');
const detailSource = read('./student-evaluation/EvaluationRecordDetailView.tsx');
const editSource = read('./student-evaluation/EvaluationRecordEditView.tsx');
const typeSource = read('./student-evaluation/types.ts');
const sheetSource = read('../components/ui/MobileBottomSheet.tsx');

const requireText = (source, text, message) => assert.ok(source.includes(text), message);

requireText(listSource, '<EvaluationTimeFilterSheet', '记录时间必须使用独立底部抽屉。');
requireText(listSource, '<EvaluationTeacherFilterSheet', '评价人必须使用独立底部抽屉。');
requireText(listSource, '<EvaluationIndicatorFilterSheet', '指标必须使用独立底部抽屉。');
requireText(timeFilterSource, "value: 'last-week'", '当前学期记录时间必须支持筛选上周。');
requireText(timeFilterSource, "value: 'this-week'", '当前学期记录时间必须支持筛选本周。');
requireText(timeFilterSource, "value: 'this-month'", '记录时间必须支持筛选本月。');
requireText(timeFilterSource, "value: 'last-month'", '记录时间必须支持筛选上月。');
requireText(timeFilterSource, 'type="date"', '记录时间必须支持自定义日期。');
assert.ok(!timeFilterSource.includes('month:${string}') && !timeFilterSource.includes('visibleMonths'), '时间筛选不应再动态生成具体月份选项。');
assert.ok(!teacherFilterSource.includes('type="search"') && !teacherFilterSource.includes('搜索教师姓名'), '评价人筛选不应提供教师姓名搜索。');
requireText(teacherFilterSource, '我的评价', '评价人筛选应提供当前教师快捷入口。');
requireText(listSource, 'counts.get(teacher.id) ?? 0', '评价人条数必须跟随当前记录时间范围重新计算。');
requireText(listSource, 'record.teacherId === teacherFilterId', '评价人筛选必须使用教师编号，避免同名教师混淆。');
requireText(listSource, 'matchesIndicatorPath', '指标筛选必须按指标路径匹配评价记录。');
requireText(listSource, 'record.indicatorPath.slice(0, 3)', '指标筛选选项必须从一二三级指标路径构建。');
requireText(indicatorFilterSource, "['一级指标', '二级指标', '三级指标']", '指标筛选必须支持逐级选择到三级指标。');
requireText(indicatorFilterSource, '按“{selectedLabel}”筛选', '指标筛选必须允许停在任意层级应用。');
requireText(listSource, 'groupedRecords', '评价记录跨月时必须按月份聚合。');
assert.ok(!listSource.includes('<EvaluationFilterSheet') && !timeFilterSource.includes('title="筛选评价记录"'), '页面不应继续使用时间与评价人混合的综合筛选入口。');

requireText(typeSource, 'teacherId: string', '评价记录必须通过教师编号判断创建人，不能只比较姓名。');
requireText(typeSource, 'StudentEvaluationRecordRevision', '评价修改必须有结构化变更记录。');
requireText(listSource, 'activeRecord.teacherId === currentTeacherId || canEditOtherTeachersRecords', '本人或当前班班主任才可修改评价。');
requireText(appSource, 'teacherProfile.homeroomClassIds.includes(activeStudentClassId)', '班主任权限必须绑定当前学生所属班级。');
requireText(editSource, '!isEditingOthersRecord || reason.trim().length > 0', '修改他人评价必须填写修改原因。');
requireText(listSource, 'previous: {', '保存评价修改前必须记录原值。');
requireText(detailSource, '修改记录', '评价详情必须展示修改留痕。');
requireText(detailSource, 'LockKeyhole', '原始记录应明确保持只读。');

assert.ok(!editSource.includes('record.description') && !editSource.includes('setDescription'), '编辑页不得修改原始记录。');
requireText(dashboardSource, 'evaluationScoreDeltas', '评价分值修改后必须回算对应学期的五育积分。');
requireText(dashboardSource, 'getTermValueForEvaluationDate', '五育积分回算必须按评价日期归属学期。');

for (const source of [listSource, timeFilterSource, teacherFilterSource, indicatorFilterSource, detailSource, editSource, sheetSource]) {
  assert.ok(!source.match(/#[0-9a-fA-F]{3,8}\b/), '评价记录相关界面不得新增十六进制颜色。');
}
requireText(sheetSource, 'var(--tm-radius-sheet)', '评价筛选必须复用教师端弹层圆角令牌。');
requireText(sheetSource, 'var(--tm-shadow-sheet)', '评价筛选必须复用教师端弹层阴影令牌。');
for (const source of [listSource, timeFilterSource, teacherFilterSource, indicatorFilterSource]) requireText(source, 'var(--tm-size-touch)', '评价记录筛选控件必须满足 44px 触控尺寸。');
for (const source of [detailSource, editSource]) assert.ok(source.includes('h-11') || source.includes('h-[var(--tm-size-touch)]'), '评价详情与编辑控件必须满足 44px 触控尺寸。');
