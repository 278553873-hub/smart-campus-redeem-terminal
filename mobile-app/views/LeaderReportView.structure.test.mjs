import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

if (!source.includes('const teacherUsageHeaderColumns')) {
  throw new Error('教师使用排行榜需要抽象表头列配置 teacherUsageHeaderColumns');
}

for (const label of ['老师', '评价次数', '覆盖学生']) {
  if (!source.includes(label)) {
    throw new Error(`教师使用排行榜表头缺少「${label}」`);
  }
}

if (source.includes('评价 <span') || source.includes('次 · 覆盖')) {
  throw new Error('教师使用排行榜行内不应重复展示「评价x次/覆盖x人」文案');
}

for (const required of [
  'getDefaultCoverageGradeId',
  "chart.dispatchAction({ type: 'showTip'",
  'onSelect={setSelectedGradeId}',
]) {
  if (!source.includes(required)) {
    throw new Error(`年级覆盖率交互缺少结构：${required}`);
  }
}

if (source.includes('GradeCoverageSummary')) {
  throw new Error('年级覆盖率不应在图表下方增加重复摘要条');
}
if (source.includes('onSelect={(gradeId) => openClassCoverageSheet(gradeId)}')) {
  throw new Error('点击年级柱形应只切换选中年级，不应直接打开班级明细抽屉');
}

for (const required of [
  'tooltipEnabled?: boolean',
  'tooltipEnabled={!showClassCoverageSheet}',
  "chart.dispatchAction({ type: 'hideTip' })",
]) {
  if (!source.includes(required)) {
    throw new Error(`弹窗打开时需要隐藏外层年级浮层：${required}`);
  }
}

const classChartStart = source.indexOf('const ClassCoverageChart');
const leaderViewStart = source.indexOf('const LeaderReportView');
const classChartSource = source.slice(classChartStart, leaderViewStart);
for (const required of [
  "triggerOn: 'click'",
  'alwaysShowContent: false',
  "chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: params.dataIndex })",
]) {
  if (!classChartSource.includes(required)) {
    throw new Error(`班级覆盖率图缺少点击浮层逻辑：${required}`);
  }
}

for (const forbidden of [
  'const defaultClassDataIndex = 0',
  "chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: defaultClassDataIndex })",
]) {
  if (classChartSource.includes(forbidden)) {
    throw new Error(`班级覆盖率图不应默认显示第一个柱子的浮层：${forbidden}`);
  }
}


for (const required of [
  '年级评价数',
  'aria-label="查看年级评价数统计口径"',
  '按住查看统计口径',
  'showEvaluationRecordsHelp',
  '按学生明细记录统计，即如果老师记录“2023级1班全体同学积极参加运动会”，且2023级1班有30名学生。那么评价数是30。',
  'getEvaluationRecordsAxis',
  'interval: evaluationAxis.interval',
  'GradeEvaluationRecordsChart',
  'ClassEvaluationRecordsChart',
  '班级评价数明细',
  'evaluationRecords',
  '评价记录：${grade.evaluationRecords}条',
]) {
  if (!source.includes(required)) {
    throw new Error(`年级评价数图表缺少结构或口径说明入口：${required}`);
  }
}

for (const repeatedCopy of [
  '一次全班评价会按学生人数生成多条记录',
  '说明：按学生明细记录统计',
]) {
  if (source.includes(repeatedCopy)) {
    throw new Error(`年级评价数点击浮层不应反复展示说明文案：${repeatedCopy}`);
  }
}


const teacherUsageSectionStart = source.indexOf('教师使用排行榜');
const teacherScoreSectionStart = source.indexOf('<TeacherScoreRankingCard', teacherUsageSectionStart);
const teacherUsageSection = source.slice(teacherUsageSectionStart, teacherScoreSectionStart);

if (!teacherUsageSection.includes('查看全部')) {
  throw new Error('教师使用排行榜标题行需要保留「查看全部」入口');
}
if (teacherUsageSection.includes('<Trophy') || teacherUsageSection.includes('<ClipboardList')) {
  throw new Error('教师使用排行榜 Tab 不应使用图标，应与其他排行榜筛选样式统一为纯文字');
}
if (!teacherUsageSection.includes('className={`min-h-[36px] rounded-xl px-4 text-sm font-semibold')) {
  throw new Error('教师使用排行榜 Tab 需要使用纯文字分段控件样式');
}


if (!teacherUsageSection.includes('className="inline-flex rounded-2xl bg-[var(--tm-bg-surface-muted)] p-1"')) {
  throw new Error('教师使用排行榜筛选外层应使用 inline-flex，避免背景铺满溢出');
}
if (teacherUsageSection.includes('text-emerald') || teacherUsageSection.includes('text-orange')) {
  throw new Error('教师使用排行榜不应残留旧绿色或工具类橙色，应统一引用品牌 Token');
}
if (!teacherUsageSection.includes('className="shrink-0 text-xs font-medium text-[var(--tm-brand-primary)] active:opacity-70"')) {
  throw new Error('教师使用排行榜「查看全部」应与其他板块统一为品牌红文字按钮');
}
