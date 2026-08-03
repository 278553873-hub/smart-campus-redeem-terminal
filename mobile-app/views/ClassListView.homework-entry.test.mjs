import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const homeworkSource = fs.readFileSync(new URL('./HomeworkEntryView.tsx', import.meta.url), 'utf8');

assert.match(classListSource, /onViewHomeworkEntry: \(classId: string\) => void;/, '班级列表应暴露作业录入回调。');
assert.match(classListSource, /label: '作业录入'/, '更多操作应展示作业录入入口。');
assert.match(classListSource, /runClassAction\(onViewHomeworkEntry\)/, '作业录入应携带当前班级。');
assert.match(classListSource, /title: '日常操作'/, '作业录入和兑换奖励应归入日常操作。');

assert.match(appSource, /currentView === 'homework_entry' && selectedClassId/, '应用应渲染作业录入页面。');
assert.match(appSource, /students=\{getMergedStudentsForClass\(selectedClassId\)\.filter/, '作业录入应读取当前班级学生。');
assert.match(appSource, /'homework_entry'[\s\S]*viewHandlesScroll/, '作业录入应使用页面内部滚动。');

assert.match(homeworkSource, /const subjectOptions = \['语文', '书法'\];/, '作业录入应按当前老师的授课科目切换。');
assert.match(homeworkSource, /const statusOptions = \['优', '良', '合格', '待合格', '未交'\];/, '作业状态应完整。');
assert.match(homeworkSource, /homeworkResultsBySubject/, '作业结果应按学科和日期保存。');
assert.match(homeworkSource, /getMonthGrid\(calendarMonth\)/, '作业录入应显示月历。');
assert.match(homeworkSource, /aria-label="上个月"/, '月历应支持上个月。');
assert.match(homeworkSource, /aria-label="下个月"/, '月历应支持下个月。');
assert.match(homeworkSource, /placeholder="作业名称（选填）"/, '应支持填写作业名称。');
assert.match(homeworkSource, /实时保存/, '页面应明确采用实时保存。');
assert.match(homeworkSource, /sortedStudents/, '学生应按学号稳定排序。');
assert.match(homeworkSource, /studentGroupSize = 20/, '学生应按每20人分组。');
assert.match(homeworkSource, /prev|current\[studentId\] !== status/, '再次点选同一状态应可取消。');
assert.match(homeworkSource, /onClick=\{onBack\}/, '作业录入应使用页面顶部返回按钮。');
assert.match(homeworkSource, /--tm-border-subtle/, '作业录入普通边框应使用教师端浅边框 Token。');
assert.match(homeworkSource, /--tm-size-touch/, '作业录入触控区应使用教师端触控尺寸 Token。');
assert.doesNotMatch(homeworkSource, /(?:bg|text|border|shadow)-(?:blue|indigo|violet|cyan)-/, '作业录入不应残留旧蓝紫色。');
assert.doesNotMatch(homeworkSource, /#[0-9A-Fa-f]{3,8}|rgba\(/, '作业录入不应硬编码颜色。');
assert.doesNotMatch(homeworkSource, /保存作业录入/, '实时保存页面不应再放置保存按钮。');

console.log('ClassListView homework entry assertions passed');
