import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const homeworkSource = fs.readFileSync(new URL('./HomeworkEntryView.tsx', import.meta.url), 'utf8');
const statusGroupSource = fs.readFileSync(new URL('../components/homework/HomeworkStatusButtonGroup.tsx', import.meta.url), 'utf8');

assert.match(classListSource, /onViewHomeworkEntry: \(classId: string\) => void;/, '班级列表应暴露作业录入回调。');
assert.match(classListSource, /label: '作业录入'/, '更多操作应展示作业录入入口。');
assert.match(classListSource, /activeActionPolicy\.canManuallyEnterHomework/, '作业录入入口应受任教班级权限控制。');
assert.match(classListSource, /runClassAction\(onViewHomeworkEntry\)/, '作业录入应携带当前班级。');
assert.match(classListSource, /title: '日常操作'/, '作业录入和兑换奖励应归入日常操作。');

assert.match(appSource, /currentView === 'homework_entry' && selectedClassId/, '应用应渲染作业录入页面。');
assert.match(appSource, /students=\{getMergedStudentsForClass\(selectedClassId\)\.filter/, '作业录入应读取当前班级学生。');
assert.match(appSource, /'homework_entry'[\s\S]*viewHandlesScroll/, '作业录入应使用页面内部滚动。');
assert.match(appSource, /createTeachingAssignments\(\['c_2025_1'\], '语文'\)[\s\S]*createTeachingAssignments\(\['c_2025_1'\], '书法'\)/, '演示账号应在同一班级配置多个任教科目。');
assert.match(appSource, /subject: '语文'[\s\S]*subject: '书法'/, '多科目状态应提供可切换的作业演示数据。');

assert.match(homeworkSource, /subjects: string\[\]/, '作业录入应由任教关系提供可选学科。');
assert.match(homeworkSource, /type HomeworkAssignment/, '手工录入应使用共享作业台账模型。');
assert.doesNotMatch(homeworkSource, /browseMode|作业查看方式|value: 'list'/, '作业录入不应增加无价值的列表模式。');
assert.match(homeworkSource, /value=\{subject\}[\s\S]*ariaLabel="任教学科"/, '多个任教科目应通过科目分段控件切换。');
assert.doesNotMatch(homeworkSource, /activeAssignment\.source|>手工<|>识别</, '作业主题行不应展示无决策价值的录入来源标签。');
assert.match(homeworkSource, /setCalendarMonth\(current => addMonths\(current, -1\)\)/, '日历应支持查看上个月。');
assert.match(homeworkSource, /setCalendarMonth\(current => addMonths\(current, 1\)\)/, '日历应支持查看下个月。');
assert.match(homeworkSource, /assignmentsByDate\[dateText\]\?\.length/, '日历应标记每天的作业次数。');
assert.match(homeworkSource, /selectedDateAssignments/, '选择日期后应展示当天全部作业。');
assert.match(homeworkSource, /批量操作[\s\S]*activeResultGroups\.map/, '日历选择作业后应在同页直接展示批量设置和学生名单。');
assert.match(homeworkSource, /assignmentCount === 1[\s\S]*rounded-full/, '单次作业日期应使用轻量圆点标记。');
assert.doesNotMatch(homeworkSource, /absolute bottom-\[calc\(var\(--tm-space-4\)/, '作业录入不应使用遮挡日历登记内容的悬浮新建按钮。');
assert.match(homeworkSource, /studentGroupSize = 20/, '长名单应保留每20人一组的快捷定位。');
assert.match(homeworkSource, /<HomeworkStatusButtonGroup/, '手工作业录入应复用共享五档等级控件。');
assert.match(statusGroupSource, /HOMEWORK_STATUS_VALUES\.map/, '共享等级控件应来自统一的五档业务枚举。');
assert.match(homeworkSource, /showAllTones/, '批量与逐人登记都应直观展示五档语义颜色。');
assert.match(homeworkSource, /请填写作业日期和主题/, '作业日期和主题均应必填。');
assert.match(homeworkSource, /results: buildHomeworkResults\(students\)/, '新建作业应生成完整班级结果。');
assert.match(homeworkSource, /second\.date\.localeCompare\(first\.date\) \|\| second\.updatedAt/, '同日多次作业应作为独立记录排序展示。');
assert.match(homeworkSource, /onSaveAssignment\(\{[\s\S]*results: activeAssignment\.results\.map/, '逐人修改应自动写回共享台账。');
assert.match(homeworkSource, /result\.status === status \? null : status/, '再次点选同一状态应恢复为未登记。');
assert.match(homeworkSource, /实时保存/, '页面应明确采用实时保存。');
assert.doesNotMatch(homeworkSource, /学期|年级/, '手工作业录入不应要求维护学期或年级。');
assert.match(homeworkSource, /onClick=\{backAction\}/, '作业录入应使用页面顶部返回按钮。');
assert.match(homeworkSource, /--tm-border-subtle/, '作业录入普通边框应使用教师端浅边框 Token。');
assert.match(homeworkSource, /--tm-size-touch/, '作业录入触控区应使用教师端触控尺寸 Token。');
assert.doesNotMatch(homeworkSource, /(?:bg|text|border|shadow)-(?:blue|indigo|violet|cyan)-/, '作业录入不应残留旧蓝紫色。');
assert.doesNotMatch(homeworkSource, /#[0-9A-Fa-f]{3,8}|rgba\(/, '作业录入不应硬编码颜色。');
assert.doesNotMatch(homeworkSource, /保存作业录入/, '自动保存页面不应再放置保存按钮。');

console.log('ClassListView homework entry assertions passed');
