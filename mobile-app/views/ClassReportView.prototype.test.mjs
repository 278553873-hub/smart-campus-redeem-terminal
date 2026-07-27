import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassReportView.tsx', import.meta.url), 'utf8');
const chartSource = fs.readFileSync(new URL('../components/report/TeacherReportChart.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const summaryRuleSource = fs.readFileSync(new URL('../domain/classReportChartSummary.ts', import.meta.url), 'utf8');
const chartRuleDocument = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_CHART_RULES.md', import.meta.url), 'utf8');
const coverageDomainSource = fs.readFileSync(new URL('../domain/classStudentCoverage.ts', import.meta.url), 'utf8');
const bottomSheetSource = fs.readFileSync(new URL('../components/ui/MobileBottomSheet.tsx', import.meta.url), 'utf8');

for (const section of [
    '概况',
    '评价记录分布',
    '五育得分分布',
    '五育事件分布',
    '排行榜',
    '重点关注对象',
    '学生覆盖情况',
]) {
    assert.ok(viewSource.includes(section), `班级报告缺少原型功能区块：${section}`);
    assert.ok(viewSource.includes(`title="${section}"`), `班级报告板块标题应放入统一卡片：${section}`);
}

assert.equal((viewSource.match(/<ReportSection\b/g) ?? []).length, 7, '班级报告的7个板块应全部使用统一卡片结构。');
assert.equal((viewSource.match(/\$\{cardClass\}/g) ?? []).length, 1, '班级报告卡片样式应只由统一板块组件承载，避免卡片嵌套。');
assert.equal((viewSource.match(/<ChartAnalysis\b/g) ?? []).length, 3, '三个图表解析应统一使用引语提示块。');
assert.ok(viewSource.includes('<ChartAnalysis {...recordDistributionAnalysis} />'), '评价记录分布应展示总结与补充。');
assert.ok(viewSource.includes('<ChartAnalysis {...educationScoreAnalysis} />'), '五育得分分布应展示总结与补充。');
assert.ok(viewSource.includes('<ChartAnalysis {...educationEventAnalysis} />'), '五育事件分布应展示总结与补充。');
assert.ok(viewSource.includes('role="note"') && viewSource.includes('aria-label="图表解析"'), '图表解析提示块应具备可识别的无障碍语义。');
assert.ok(viewSource.includes('font-semibold') && viewSource.includes('font-normal'), '图表解析应使用较强字重的总结和常规字重的补充。');
assert.ok(viewSource.includes('<Quote') && viewSource.includes('<Triangle'), '图表解析应使用图标库还原引用符号与顶部指向。');
assert.ok(!viewSource.includes('chartSummaryClass'), '图表解析不应继续使用普通段落样式。');

assert.ok(!viewSource.includes('{classInfo.name}') && !viewSource.includes('{totalStudents}名学生'), '班级报告内容区不应重复展示班级名称和班级人数。');
assert.ok(!viewSource.includes("classInfo.tags.includes('班主任')"), '班级报告不应展示班主任或任课老师身份。');
assert.ok(viewSource.includes('showAllRanking'), '排行榜应支持渐进披露前10名。');
assert.ok(viewSource.includes('showAllFocus'), '重点关注对象应支持渐进披露完整Top 10。');
assert.ok(!viewSource.includes('未点评学生清单'), '班级报告不应继续使用旧的未点评学生清单。');
assert.ok(viewSource.includes("useState<StudentCoverageSortKey>('evaluationCount')"), '学生覆盖情况应默认按评价次数排序。');
assert.ok(viewSource.includes("useState<StudentCoverageSortDirection>('asc')"), '学生覆盖情况应默认从少到多展示。');
assert.ok(viewSource.includes('const visibleCoverageRows = sortedCoverageRows.slice(0, 10)'), '学生覆盖情况主卡应默认展示前10名。');
assert.ok(viewSource.includes("{ key: 'evaluationCount' as const, label: '评价次数' }"), '学生覆盖情况应支持按评价次数排序。');
assert.ok(viewSource.includes("{ key: 'teacherCount' as const, label: '评价老师' }"), '学生覆盖情况应支持按评价老师数排序。');
assert.ok(viewSource.includes("direction === 'asc' ? '少到多' : '多到少'"), '学生覆盖情况应支持正序和倒序切换。');
assert.ok(viewSource.includes('评价次数') && viewSource.includes('评价老师'), '学生覆盖清单应同时展示评价次数和评价老师数。');
assert.ok(viewSource.includes('查看全部{sortedCoverageRows.length}名学生'), '学生覆盖情况应提供查看全部入口。');
assert.ok(viewSource.includes('<MobileBottomSheet') && viewSource.includes('title="全部学生覆盖情况"'), '完整学生覆盖清单应使用共享底部抽屉。');
assert.ok(viewSource.includes('<StudentCoverageList rows={sortedCoverageRows}'), '底部抽屉应展示完整排序结果。');
assert.ok(viewSource.includes("useState<ReportSourceKey>('all')"), '班级报告应默认展示全班汇总。');
assert.ok(viewSource.includes("{ key: 'all', label: '全班汇总', recordShare: 1 },\n    { key: 'mine', label: '我的记录', recordShare: 0.42 },\n    ...evaluatingTeacherSources"), '数据来源顺序应为全班汇总、我的记录、其他评价老师。');
assert.ok(viewSource.includes("{ key: 'teacher:zhang-yi', label: '张怡'"), '班级报告应展示参与评价的其他老师。');
assert.ok(viewSource.includes('evaluatingTeacherSources.filter(source => source.recordShare > 0)'), '数据来源只应展示有评价记录的老师。');
assert.ok(viewSource.includes('role="tablist"') && viewSource.includes('aria-label="报告数据来源"'), '报告数据来源应使用可横向滚动的标签栏语义。');
assert.ok(viewSource.includes('role="tab"') && viewSource.includes('aria-selected={reportSourceKey === item.key}'), '每个数据来源应具备标签选中状态。');
assert.ok(viewSource.includes('overflow-x-auto') && viewSource.includes('min-w-max'), '老师较多时数据来源标签栏应支持横向滚动。');
assert.ok(viewSource.includes('currentTeacherName: string;') && appSource.includes('currentTeacherName={teacherProfile.name}'), '我的记录应关联当前登录老师身份。');
assert.ok(viewSource.includes('activeReportSource.recordShare'), '切换老师后所有报告数据应使用对应老师的数据占比。');
assert.ok(viewSource.includes("maxTeacherCount: reportSourceKey === 'all'"), '全班汇总应统计多位老师，个人老师视角应按一位老师计算。');
assert.ok(viewSource.includes("'!text-[var(--tm-brand-primary)]'"), '数据来源选中项文字应使用主题红。');
assert.ok(viewSource.includes("reportSourceKey === item.key ? 'opacity-100' : 'opacity-0'"), '数据来源选中项应使用主题色下划线。');
assert.ok(viewSource.includes('aria-label="报告时间范围"'), '时间范围应使用独立的筛选标签组。');
assert.ok(viewSource.includes("'bg-[var(--tm-brand-primary)] text-white active:bg-[var(--tm-brand-primary-pressed)]'"), '时间范围选中项应使用主题红实底和白色文字。');
assert.ok(viewSource.includes("'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]'"), '时间范围未选中项应使用白底和深色文字。');
for (const filterLabel of ['排行榜类型', '重点关注维度', '学生覆盖排序']) {
    assert.ok(viewSource.includes(`aria-label="${filterLabel}"`), `班级报告缺少${filterLabel}筛选语义。`);
}
assert.ok(!viewSource.includes('bg-[var(--tm-brand-primary-soft)]'), '班级报告筛选与展开操作不应继续使用浅粉背景。');
assert.ok(coverageDomainSource.includes('evaluationCount') && coverageDomainSource.includes('teacherCount'), '学生覆盖统计层应同时维护评价次数和评价老师数。');
assert.ok(coverageDomainSource.includes('sortStudentCoverageRows'), '学生覆盖排序应收敛到独立领域模块。');
assert.ok(bottomSheetSource.includes('role="dialog"') && bottomSheetSource.includes('aria-modal="true"'), '共享底部抽屉应具备模态无障碍语义。');
assert.ok(bottomSheetSource.includes("createPortal") && bottomSheetSource.includes("getElementById('teacher-mobile-overlay-root')"), '共享底部抽屉应挂载到手机端统一浮层，避免受页面滚动与动画变换影响。');
assert.ok(appSource.includes('id="teacher-mobile-overlay-root"'), '教师手机端壳层应提供统一浮层挂载点。');
assert.ok(viewSource.includes('min-h-[var(--tm-size-touch)]'), '学生覆盖清单行应使用教师端触控尺寸令牌。');
assert.ok(viewSource.includes('h-[var(--tm-size-touch)]'), '学生覆盖排序控件应使用教师端触控尺寸令牌。');
assert.ok(viewSource.includes('min-h-11'), '班级报告交互控件应满足44像素触控高度。');
assert.ok(!viewSource.includes('sticky top-0 z-20'), '班级标题与筛选不应在滚动时长期占用内容视口。');
assert.ok(viewSource.includes('TeacherReportBarChart'), '评价记录与五育得分应使用通用柱状图组件。');
assert.ok(!viewSource.includes('TeacherReportBulletChart'), '评价记录分布不应继续使用横向子弹图。');
assert.ok(viewSource.includes('TeacherReportDonutChart'), '五育事件应使用通用环形图组件。');

for (const token of [
    '--tm-bg-page-glass',
    '--tm-brand-primary-soft',
    '--tm-chart-data-default',
    '--tm-chart-data-default-text',
    '--tm-chart-data-default-soft',
    '--tm-chart-positive',
    '--tm-chart-positive-text',
    '--tm-chart-positive-soft',
    '--tm-chart-warning',
    '--tm-chart-negative',
    '--tm-chart-negative-text',
    '--tm-chart-negative-soft',
    '--tm-chart-edu-virtue',
    '--tm-chart-edu-wisdom',
    '--tm-chart-edu-fitness',
    '--tm-chart-edu-aesthetic',
    '--tm-chart-edu-labor',
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
assert.ok(viewSource.includes("categories={['正向事件', '负向事件']}"), '评价记录分布应按正向和负向事件分组。');
assert.ok(viewSource.includes("categoryColors={['positive', 'negative']}"), '正负向事件应使用对应语义色。');
assert.ok(viewSource.includes('previousPositiveRecords'), '评价记录分布应提供上周期正向事件。');
assert.ok(viewSource.includes('previousNegativeRecords'), '评价记录分布应提供上周期负向事件。');
assert.ok(viewSource.includes('gradeAveragePositiveRecords'), '评价记录分布应提供年级平均正向事件。');
assert.ok(viewSource.includes('gradeAverageNegativeRecords'), '评价记录分布应提供年级平均负向事件。');
assert.ok(viewSource.includes('getRecordDistributionAnalysis'), '评价记录分布应使用固定规则生成两部分解析。');
assert.ok(viewSource.includes('getEducationScoreAnalysis'), '五育得分分布应使用固定规则生成两部分解析。');
assert.ok(viewSource.includes('getEducationEventAnalysis'), '五育事件分布应使用固定规则生成两部分解析。');
assert.ok(viewSource.includes('showValueAxis={false}'), '评价记录分布的柱顶已有精确值时应隐藏纵轴标尺。');
assert.ok(viewSource.includes('valueLabelSuffix="条"'), '评价记录分布的柱顶数值应显示单位。');
assert.ok(!viewSource.includes('recordComparisonSummary.map'), '图表下方不应继续展示两列数据总结组件。');
assert.ok(summaryRuleSource.includes('正向和负向事件的变化不一致'), '固定规则应覆盖正向和负向事件变化不一致的情况。');
for (const chartSection of ['评价记录分布', '五育得分分布', '五育事件分布']) {
    assert.ok(chartRuleDocument.includes(`## ${chartSection}`), `图表话术文档缺少${chartSection}规则。`);
}
for (const unrelatedSection of ['通用图表规则', '颜色', '代码映射']) {
    assert.ok(!chartRuleDocument.includes(unrelatedSection), `图表话术文档不应包含${unrelatedSection}等无关内容。`);
}
assert.ok(chartSource.includes('mutedOpacity'), '上周期等历史系列应使用同色系弱化透明度。');
assert.ok(chartSource.includes('labelColors'), '清亮图形填充应与深色数值标签分层。');
assert.ok(!chartSource.includes('ScatterChart'), '删除子弹图后不应继续加载散点图运行时。');
assert.ok(viewSource.includes("{ name: '净得分', values: reportData.netScores, color: 'data' }"), '净得分应使用清亮普通数据蓝。');
for (const color of ['#43B0F6', '#5BD65D', '#FF9B3D', '#FF8176', '#AFBDCB']) {
    assert.ok(tokenSource.includes(color), `班级报告缺少已确认的清亮图表色：${color}`);
}
assert.ok(!chartSource.includes("readToken(style, '--tm-status-positive')"), '班级报告图形不应继续直接读取全局正向色。');
assert.ok(!chartSource.includes("readToken(style, '--tm-status-negative')"), '班级报告图形不应继续直接读取全局负向色。');
assert.ok(appSource.includes("'class_report', 'student_detail'"), '班级报告应接入教师手机端统一页面背景。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
assert.ok(plainBackgroundList.includes("'class_report'"), '班级报告应使用纯白标题栏、浅灰内容区背景。');

console.log('ClassReportView prototype functionality and token assertions passed');
