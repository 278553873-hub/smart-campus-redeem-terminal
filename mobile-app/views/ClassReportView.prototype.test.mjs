import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassReportView.tsx', import.meta.url), 'utf8');
const chartSource = fs.readFileSync(new URL('../components/report/TeacherReportChart.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

for (const section of [
    '概况',
    '评价记录分布',
    '五育得分分布',
    '五育事件分布',
    '排行榜',
    '重点关注对象',
    '未点评学生清单',
]) {
    assert.ok(viewSource.includes(section), `班级报告缺少原型功能区块：${section}`);
}

assert.ok(viewSource.includes('{totalStudents}名学生'), '班级报告应只展示学生人数。');
assert.ok(!viewSource.includes("classInfo.tags.includes('班主任')"), '班级报告不应展示班主任或任课老师身份。');
assert.ok(viewSource.includes('showAllRanking'), '排行榜应支持渐进披露前10名。');
assert.ok(viewSource.includes('showAllFocus'), '重点关注对象应支持渐进披露完整Top 10。');
assert.ok(viewSource.includes('showAllUnreviewed'), '未点评学生清单应支持渐进披露。');
assert.ok(viewSource.includes('min-h-11'), '班级报告交互控件应满足44像素触控高度。');
assert.ok(!viewSource.includes('sticky top-0 z-20'), '班级标题与筛选不应在滚动时长期占用内容视口。');
assert.ok(viewSource.includes('TeacherReportBarChart'), '评价记录和五育得分应使用通用报表图表组件。');
assert.ok(viewSource.includes('TeacherReportDonutChart'), '五育事件应使用通用环形图组件。');

for (const token of [
    '--tm-bg-page-glass',
    '--tm-brand-primary-soft',
    '--tm-status-positive',
    '--tm-status-negative',
    '--tm-edu-virtue',
    '--tm-edu-wisdom',
    '--tm-edu-fitness',
    '--tm-edu-aesthetic',
    '--tm-edu-labor',
    '--tm-chart-grid',
    '--tm-chart-tooltip',
    '--tm-chart-series-peer',
    '--tm-chart-series-total',
    '--tm-chart-series-muted-opacity',
]) {
    assert.ok(viewSource.includes(token) || chartSource.includes(token) || tokenSource.includes(token), `班级报告缺少最新设计Token：${token}`);
}

for (const legacyStyle of ['bg-blue-', 'text-blue-', 'from-blue-', 'to-indigo-', 'text-slate-', 'bg-slate-']) {
    assert.ok(!viewSource.includes(legacyStyle), `班级报告仍残留旧视觉样式：${legacyStyle}`);
}

assert.ok(chartSource.includes("import('echarts/core')"), '报表图表应复用专业图表引擎。');
assert.ok(viewSource.includes('categoryColors'), '评价记录分布应按五育分类维度着色。');
assert.ok(viewSource.includes("color: 'peer'"), '年级平均等外部参照系列应使用中性参照灰。');
assert.ok(chartSource.includes('mutedOpacity'), '上周期等历史系列应使用同色系弱化透明度。');
assert.ok(appSource.includes("'class_report', 'student_detail'"), '班级报告应接入教师手机端统一页面背景。');

console.log('ClassReportView prototype functionality and token assertions passed');
