import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createDutyWeeks,
  formatDutyTeacherSummary,
  formatDutyWeekRange,
  getDutyWeeksForMonth,
} from '../domain/weeklyDutySchedule.ts';

const viewSource = fs.readFileSync(new URL('./WeeklyDutyScheduleView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyDutySchedule.ts', import.meta.url), 'utf8');

const requireText = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message);
};

const weeks = createDutyWeeks('2026-07-27', 6);
assert.equal(weeks.length, 6);
assert.equal(formatDutyWeekRange(weeks[0]), '07.27-08.02');
assert.equal(formatDutyTeacherSummary([]), '未安排');
assert.equal(formatDutyTeacherSummary(['陈思敏']), '陈思敏');
assert.equal(formatDutyTeacherSummary(['李连', '刘畅']), '李连、刘畅');
assert.equal(formatDutyTeacherSummary(['张全有', '刘飞', '陈思敏']), '张全有等3人');
assert.deepEqual(
  getDutyWeeksForMonth(weeks, 2026, 7).map(week => formatDutyWeekRange(week)),
  ['07.27-08.02', '08.03-08.09', '08.10-08.16', '08.17-08.23', '08.24-08.30', '08.31-09.06'],
  '月历应完整展示所有与当前月份相交的自然周。',
);

requireText(viewSource, 'grid grid-cols-2 gap-[var(--tm-duty-week-grid-gap)]', '月历应使用两列周块网格。');
requireText(viewSource, '只看未安排', '页面应提供只看未安排筛选。');
requireText(viewSource, 'dimmed = onlyUnscheduled && assigned', '月历筛选应弱化已安排周并保持网格位置。');
requireText(viewSource, 'MobileBottomSheet', '教师选择应复用公共底部抽屉。');
requireText(viewSource, 'MobileSearchInput', '教师选择应复用公共搜索输入框。');
requireText(viewSource, 'teacher.name.includes(keyword)', '教师搜索应按姓名子串即时过滤。');
requireText(viewSource, 'MobileEmptyState', '教师搜索无结果应复用公共缺省态组件。');
requireText(viewSource, 'ASSETS.DEFAULT_STATE.MAGNIFIER', '教师搜索无结果应使用统一的放大镜缺省图。');
requireText(viewSource, '没有匹配的教师', '教师搜索无结果应展示明确结果文案。');
requireText(viewSource, 'teacher.avatar', '教师结果应展示教师头像。');
assert.ok(!viewSource.includes('MobileToast') && !viewSource.includes('showToast'), '排班成功后页面已即时更新，不应重复显示成功Toast。');
requireText(dataSource, 'Record<string, string[]>', '每周排班数据应支持多个教师。');
requireText(viewSource, 'draftTeacherIds', '教师抽屉应使用临时多选状态，避免点选后立即保存。');
requireText(viewSource, 'const selectedTeachers = useMemo(', '教师抽屉应提供独立的已选教师摘要。');
requireText(viewSource, '已选 {draftTeacherIds.length}人', '已选区域应持续展示当前选择人数。');
requireText(viewSource, 'aria-label={`移除${teacher.name}`}', '已选教师应提供明确的移除操作。');
requireText(viewSource, 'overflow-x-auto no-scrollbar', '已选教师较多时应横向滚动，不得挤压教师名录。');
requireText(viewSource, 'h-[var(--tm-size-touch)] min-w-0', '已选区域应固定占位，避免首次选择导致名录跳动。');
assert.ok(!viewSource.includes('leftSelectedIndex') && !viewSource.includes('rightSelectedIndex'), '选择教师后不得动态重排教师名录。');
requireText(viewSource, 'toggleTeacher', '教师列表应支持连续选中和取消。');
requireText(viewSource, 'saveTeacherSelection', '多人选择应通过统一保存操作提交。');
requireText(viewSource, "`保存（${draftTeacherIds.length}人）`", '保存按钮应展示当前已选教师人数。');
assert.ok(!viewSource.includes('assignTeacher'), '多人配置不应继续沿用单选即关闭逻辑。');
requireText(viewSource, 'aria-label="暂不安排老师"', '抽屉应提供常驻的暂不安排老师选项。');
assert.ok(viewSource.indexOf('aria-label="暂不安排老师"') < viewSource.indexOf('<MobileSearchInput'), '暂不安排老师按钮应位于搜索框上方。');
requireText(viewSource, 'header={teacherSheetWeek ? (', '暂不安排老师应进入抽屉标题栏。');
requireText(viewSource, "title={teacherSheetWeek ? formatDutyWeekRange(teacherSheetWeek) : '选择教师'}", '抽屉标题应只保留周日期范围。');
requireText(viewSource, 'border-[var(--tm-duty-unassigned-button-border)]', '暂不安排老师默认态应有明确按钮边界。');
requireText(viewSource, '[box-shadow:var(--tm-duty-unassigned-button-shadow)]', '暂不安排老师默认态应有控件阴影。');
requireText(viewSource, 'h-[var(--tm-duty-unassigned-option-height)]', '暂不安排老师应保留完整触控高度。');
requireText(viewSource, 'h-[var(--tm-duty-unassigned-button-visible-height)]', '暂不安排老师的可见按钮应使用紧凑高度。');
requireText(viewSource, 'rounded-[var(--tm-duty-unassigned-button-radius)]', '暂不安排老师的可见按钮应使用紧凑圆角。');
requireText(tokenSource, "'--tm-duty-unassigned-button-bg': 'var(--tm-bg-surface)'", '暂不安排老师默认态应使用白色实体表面。');
requireText(tokenSource, "'--tm-duty-unassigned-button-visible-height': '28px'", '暂不安排老师的可见按钮高度应为28像素。');
requireText(tokenSource, "'--tm-duty-unassigned-button-radius': '8px'", '暂不安排老师的可见按钮圆角应为8像素。');
requireText(tokenSource, "'--tm-duty-unassigned-button-selected-bg': 'var(--tm-brand-primary-soft)'", '暂不安排老师已选态应使用主题色浅表面，不应使用灰色底色。');
requireText(tokenSource, "'--tm-duty-unassigned-button-border': 'var(--tm-brand-primary)'", '暂不安排老师按钮边框应使用主题色。');
requireText(tokenSource, "'--tm-duty-unassigned-button-text': 'var(--tm-brand-primary)'", '暂不安排老师按钮文字应使用主题色。');
assert.ok(!viewSource.includes('值周老师'), '抽屉顶部不应继续显示“值周老师”。');
assert.ok(!viewSource.includes('scheduledCount') && !viewSource.includes('7/27周'), '页面不应展示已安排周数统计。');
assert.ok(!viewSource.includes('当前安排') && !viewSource.includes('RotateCcw'), '抽屉不应保留旧的当前安排与清空行。');
requireText(viewSource, '--tm-duty-current-button-bg', '本周入口应使用明确的中性按钮表面。');
requireText(viewSource, 'h-7', '本周按钮的可见描边应保持紧凑高度。');
requireText(viewSource, 'rounded-[8px]', '本周按钮应使用 8 像素圆角。');
requireText(viewSource, 'border-[var(--tm-duty-current-button-border)]', '本周按钮应使用主题色边框。');
requireText(viewSource, 'text-[var(--tm-duty-current-button-text)]', '本周按钮应使用主题色文字。');
requireText(tokenSource, "'--tm-duty-current-button-bg': 'var(--tm-bg-surface)'", '本周按钮应使用白色表面承载主题色描边。');
requireText(tokenSource, "'--tm-duty-current-button-text': 'var(--tm-brand-primary)'", '本周按钮文字应使用主题色。');
requireText(tokenSource, "'--tm-duty-current-button-border': 'var(--tm-brand-primary)'", '本周按钮边框应使用主题色。');
requireText(tokenSource, "'--tm-duty-week-tile-height': '76px'", '周块应使用更紧凑的 76 像素高度。');
requireText(viewSource, 'CheckCircle2', '已安排周应通过勾选图标辅助表达状态。');
requireText(viewSource, '--tm-duty-week-assigned-text', '已安排周应使用成功语义文字。');
requireText(viewSource, '--tm-duty-week-unassigned-bg', '未安排周应使用中性组件表面。');
requireText(viewSource, 'active:scale-[0.96]', '值周安排交互控件应使用0.96按压反馈。');
requireText(viewSource, 'tabular-nums', '周次、日期和进度应使用等宽数字。');
requireText(viewSource, 'transition-[scale,background-color', '交互动效应只声明实际变化的属性。');
assert.ok(!viewSource.includes('transition-all'), '不得使用transition-all。');
assert.ok(!viewSource.includes('bg-blue-') && !viewSource.includes('text-blue-'), '值周安排不得引入旧蓝紫视觉体系。');
assert.ok(!viewSource.includes('DutyViewMode') && !viewSource.includes('批量排班'), 'V1不应保留列表视图与批量排班界面。');
assert.ok(!viewSource.includes('isCurrent'), '周块不应重复显示本周文字。');
assert.ok(!viewSource.includes('department'), '教师结果只展示头像和完整姓名。');
requireText(dataSource, "name: '李连'", '演示教师应使用可核对的完整姓名。');
requireText(dataSource, "name: '张全有'", '演示教师应使用可核对的完整姓名。');
requireText(dataSource, "['teacher-li-lian', 'teacher-liu-chang']", '演示排班应覆盖同一周两位教师。');
requireText(dataSource, "['teacher-zhang-quanyou', 'teacher-liu-fei', 'teacher-chen-simin']", '演示排班应覆盖同一周三位教师。');
assert.equal((dataSource.match(/name: '刘/g) ?? []).length, 4, '输入刘时应有多位刘姓教师可供筛选。');

for (const token of [
  '--tm-duty-week-grid-gap',
  '--tm-duty-week-tile-height',
  '--tm-duty-week-tile-radius',
  '--tm-duty-week-selected-shadow',
  '--tm-duty-week-dimmed-opacity',
  '--tm-duty-week-assigned-bg',
  '--tm-duty-week-assigned-text',
  '--tm-duty-week-unassigned-bg',
  '--tm-duty-week-unassigned-text',
  '--tm-duty-current-button-bg',
  '--tm-duty-current-button-text',
  '--tm-duty-current-button-shadow',
  '--tm-duty-current-button-pressed-bg',
  '--tm-duty-unassigned-option-height',
  '--tm-duty-unassigned-button-visible-height',
  '--tm-duty-unassigned-button-radius',
  '--tm-duty-unassigned-button-bg',
  '--tm-duty-unassigned-button-selected-bg',
  '--tm-duty-unassigned-button-pressed-bg',
  '--tm-duty-unassigned-button-border',
  '--tm-duty-unassigned-button-text',
  '--tm-duty-unassigned-button-shadow',
  '--tm-duty-teacher-row-height',
]) {
  requireText(tokenSource, token, `教师端令牌源缺少${token}。`);
  requireText(viewSource, token, `值周安排页未消费${token}。`);
}

const primaryToolsSource = meSource.slice(meSource.indexOf('const allPrimaryTools'), meSource.indexOf('const primaryTools'));
const moreToolsSource = meSource.slice(meSource.indexOf('const allMoreTools'), meSource.indexOf('const moreTools'));
assert.ok(!primaryToolsSource.includes("id: 'weeklyDutySchedule'"), '管理工具不应继续展示值周安排。');
requireText(moreToolsSource, "id: 'weeklyDutySchedule'", '更多工具应展示值周安排入口。');
const expectedMoreToolOrder = ['coinIssuance', 'questionnaire', 'weeklyDutySchedule', 'archiveDesign', 'subjectManagement', 'departmentManagement', 'suggestionFeedback'];
for (let index = 1; index < expectedMoreToolOrder.length; index += 1) {
  assert.ok(
    moreToolsSource.indexOf(`id: '${expectedMoreToolOrder[index - 1]}'`) < moreToolsSource.indexOf(`id: '${expectedMoreToolOrder[index]}'`),
    '更多工具应按使用频率从高到低排列。',
  );
}
requireText(meSource, "title: '值周安排'", '入口名称应为值周安排。');
const moreToolTypeSource = accessSource.slice(accessSource.indexOf('export type TeacherMoreToolId'), accessSource.indexOf('export interface TeacherSpaceMenuPolicy'));
requireText(moreToolTypeSource, "| 'weeklyDutySchedule'", '统一权限模型应将值周安排归入更多工具。');
requireText(appSource, "'weekly_duty_schedule'", '教师手机端应注册值周安排路由。');
requireText(appSource, '<WeeklyDutyScheduleView onBack={goBack} />', '值周安排路由应渲染完整业务页。');

console.log('Weekly duty schedule assertions passed');
