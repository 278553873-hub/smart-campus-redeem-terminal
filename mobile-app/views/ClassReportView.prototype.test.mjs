import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassReportView.tsx', import.meta.url), 'utf8');
const chartSource = fs.readFileSync(new URL('../components/report/TeacherReportChart.tsx', import.meta.url), 'utf8');
const recordComparisonSource = fs.readFileSync(new URL('../components/report/RecordDistributionComparison.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const summaryRuleSource = fs.readFileSync(new URL('../domain/classReportChartSummary.ts', import.meta.url), 'utf8');
const chartRuleDocument = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_CHART_RULES.md', import.meta.url), 'utf8');
const uiGuidelineSource = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');
const coverageDomainSource = fs.readFileSync(new URL('../domain/classStudentCoverage.ts', import.meta.url), 'utf8');
const reportSourceDomainSource = fs.readFileSync(new URL('../domain/classReportSource.ts', import.meta.url), 'utf8');
const bottomSheetSource = fs.readFileSync(new URL('../components/ui/MobileBottomSheet.tsx', import.meta.url), 'utf8');
const indicatorDemoSource = fs.readFileSync(new URL('../data/classReportIndicatorDemo.ts', import.meta.url), 'utf8');
const indicatorTreeSource = fs.readFileSync(new URL('../domain/classReportIndicatorTree.ts', import.meta.url), 'utf8');
const indicatorDrilldownSource = fs.readFileSync(new URL('../components/report/ClassReportIndicatorDrilldown.tsx', import.meta.url), 'utf8');

for (const section of [
    '概况',
    '评价记录分布',
    '五育得分分布',
    '五育事件分布',
    '积分排行',
    '需要关注',
    '学生覆盖情况',
]) {
    assert.ok(viewSource.includes(section), `班级报告缺少原型功能区块：${section}`);
    assert.ok(viewSource.includes(`title="${section}"`), `班级报告板块标题应放入统一卡片：${section}`);
}

assert.equal((viewSource.match(/<ReportSection\b/g) ?? []).length, 7, '班级报告的7个板块应全部使用统一卡片结构。');
assert.equal((viewSource.match(/\$\{cardClass\}/g) ?? []).length, 1, '班级报告卡片样式应只由统一板块组件承载，避免卡片嵌套。');
for (const [token, value] of [
    ['--tm-report-page-inline', 'var(--tm-space-5)'],
    ['--tm-report-card-gap', 'var(--tm-space-6)'],
    ['--tm-report-card-padding', 'var(--tm-space-4)'],
    ['--tm-report-card-content-gap', 'var(--tm-space-4)'],
    ['--tm-report-coverage-row-height', '48px'],
    ['--tm-report-coverage-value-height', '24px'],
    ['--tm-report-coverage-name-inset', 'var(--tm-space-4)'],
    ['--tm-report-coverage-evaluation-column', '76px'],
    ['--tm-report-coverage-teacher-column', '104px'],
    ['--tm-report-filter-padding-top', '0px'],
    ['--tm-report-filter-padding-bottom', '0px'],
    ['--tm-report-filter-padding-pinned', '0px'],
    ['--tm-report-date-indicator-width', '56px'],
    ['--tm-report-date-indicator-height', '3px'],
    ['--tm-report-custom-range-height', '40px'],
    ['--tm-report-source-list-inline', 'var(--tm-space-2)'],
    ['--tm-report-source-item-gap', 'var(--tm-space-2)'],
    ['--tm-report-source-item-inline', '6px'],
    ['--tm-report-source-padding-top', '0px'],
    ['--tm-report-source-padding-bottom', '0px'],
    ['--tm-report-source-pill-height', '28px'],
    ['--tm-report-source-pill-inline', '6px'],
]) {
    assert.ok(tokenSource.includes(`'${token}': '${value}'`), `班级报告缺少组件令牌：${token}`);
}
assert.ok(viewSource.includes('p-[var(--tm-report-card-padding)]') && viewSource.includes('mb-[var(--tm-report-card-content-gap)]'), '统一报告卡片应消费内边距与标题内容间距令牌。');
assert.ok(viewSource.includes('space-y-[var(--tm-report-card-gap)]') && viewSource.includes('px-[var(--tm-report-page-inline)]') && viewSource.includes('pt-[var(--tm-report-card-gap)]'), '班级报告内容区应消费页面留白与板块间距令牌。');
for (const localCardSpacing of ['px-3 pb-4 pt-4', 'overflow-hidden p-3', 'className="p-3"', 'px-4 pb-4 pt-4', 'className="pt-1"']) {
    assert.ok(!viewSource.includes(localCardSpacing), `报告板块不应保留局部卡片间距：${localCardSpacing}`);
}
assert.equal((viewSource.match(/<ChartAnalysis\b/g) ?? []).length, 3, '三个图表解析应统一使用引语提示块。');
assert.ok(viewSource.includes('<ChartAnalysis {...recordDistributionAnalysis} />'), '评价记录分布应展示总结与补充。');
assert.ok(viewSource.includes('<ChartAnalysis {...educationScoreAnalysis} />'), '五育得分分布应展示总结与补充。');
assert.ok(viewSource.includes('<ChartAnalysis {...educationEventAnalysis} />'), '五育事件分布应展示总结与补充。');
assert.ok(viewSource.includes('role="note"') && viewSource.includes('aria-label="数据解析"'), '数据解析提示块应具备可识别的无障碍语义。');
assert.ok(viewSource.includes('font-semibold') && viewSource.includes('font-normal'), '图表解析应使用较强字重的总结和常规字重的补充。');
assert.ok(viewSource.includes('<Quote') && viewSource.includes('<Triangle'), '图表解析应使用图标库还原引用符号与顶部指向。');
assert.ok(!viewSource.includes('chartSummaryClass'), '图表解析不应继续使用普通段落样式。');

assert.ok(!viewSource.includes('{classInfo.name}') && !viewSource.includes('{totalStudents}名学生'), '班级报告内容区不应重复展示班级名称和班级人数。');
assert.ok(!viewSource.includes("classInfo.tags.includes('班主任')"), '班级报告不应展示班主任或任课老师身份。');
assert.ok(viewSource.includes('const visibleRankingRows = showAllRanking ? rankingRows : rankingRows.slice(0, 10)'), '积分排行应默认展示前10名，展开后展示当前班级全部学生。');
assert.ok(viewSource.includes('rankingRows.length > 10') && viewSource.includes('`查看全部${rankingRows.length}名`'), '积分排行仅在超过10人时展示包含总人数的查看全部入口。');
assert.ok(viewSource.includes('aria-expanded={showAllRanking}') && viewSource.includes('aria-controls="class-ranking-list"'), '积分排行展开入口应向辅助技术表达展开状态并关联排行列表。');
assert.ok(viewSource.includes("import rankingCrownIcon from '../assets/resources/ranking-crown-icon.png'") && viewSource.includes('<RankingPosition position={index + 1} />'), '积分排行前3名应使用自定义生成的皇冠图片承载名次。');
assert.ok(viewSource.includes('WebkitMaskImage: `url(${rankingCrownIcon})`') && viewSource.includes("maskSize: 'contain'"), '生成的皇冠图片应通过遮罩复用教师端排名语义色。');
assert.ok(!viewSource.includes('<Crown'), '积分排行不应继续使用图标库内置皇冠。');
assert.ok(viewSource.includes('if (position > 3)') && viewSource.includes('aria-label={`第${position}名`}'), '积分排行第4名起应保持普通数字，前三名皇冠应保留明确的无障碍排名语义。');
for (const rankingToken of ['--tm-brand-reward-strong', '--tm-text-secondary', '--tm-brand-secondary-strong']) {
    assert.ok(viewSource.includes(rankingToken), `积分排行前三名应使用教师端语义Token：${rankingToken}`);
}
assert.ok(viewSource.includes("{ key: 'net' as const, label: '总分' }") && viewSource.includes("{ key: 'progress' as const, label: '进步幅度' }"), '积分排行应使用老师易理解的总分与进步幅度文案。');
assert.ok(!viewSource.includes('净得分排行') && !viewSource.includes('进步排行'), '积分排行不应继续使用难理解或重复的旧文案。');
assert.ok(viewSource.includes('reportData.previousRecords / reportData.totalRecords') && viewSource.includes('progress: net - (previousPlus - previousMinus)'), '进步幅度必须按本周期总分相对上周期总分的变化计算。');
assert.ok(viewSource.includes("row.progress >= 0 ? '+' : ''") && viewSource.includes("(rankingMode === 'net' ? row.net : row.progress) >= 0"), '进步幅度应正确展示正负号与对应语义色。');
assert.ok(viewSource.includes('<FocusStudentList rows={focusRows.positive}') && viewSource.includes('<FocusStudentList rows={focusRows.negative}'), '需要关注应在主卡双栏直接展示完整前10名。');
assert.ok(viewSource.includes('<FocusStudentList rows={focusRows.positive} tone="positive" onSelectStudent={onSelectStudent}') && viewSource.includes('aria-label={`查看${row.student.name}学生详情`}'), '需要关注中的学生姓名应能直接进入学生详情。');
assert.ok(!viewSource.includes('showFocusDetails') && !viewSource.includes('focusListMode') && !viewSource.includes('查看完整榜单'), '需要关注不应再通过按钮和底部抽屉二次展开前10名。');
assert.ok(viewSource.includes('加分TOP10') && viewSource.includes('扣分TOP10'), '需要关注双栏应使用约定的加分TOP10与扣分TOP10榜单名。');
assert.ok(!viewSource.includes('加分前10名') && !viewSource.includes('扣分前10名'), '需要关注不应保留旧榜单名称。');
assert.ok(viewSource.includes('表现突出') && viewSource.includes('需关注'), '需要关注应将教师判断作为榜单依据后的次级结论。');
assert.ok(viewSource.includes('text-[length:var(--tm-font-size-body)] font-bold') && viewSource.includes('text-[length:var(--tm-font-size-badge)] font-medium'), '榜单标题与辅助判断应通过字号和字重拉开层级。');
assert.ok(viewSource.includes('text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]'), '双栏学生姓名应使用正文级字号和半粗字重提升可读性。');
assert.ok(!viewSource.includes('<CirclePlus') && !viewSource.includes('<CircleMinus'), '加分和扣分榜单标题不应使用额外的加减图标。');
assert.ok(viewSource.includes('bg-[var(--tm-chart-positive-soft)]') && viewSource.includes('bg-[var(--tm-chart-negative-soft)]'), '需要关注应使用无重边框的正负语义浅色分区。');
assert.ok(viewSource.includes("tone === 'positive' ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'"), '榜单分值必须使用教师端正向与负向文字Token。');
assert.ok(!viewSource.includes('重点关注对象') && !viewSource.includes('双向榜单'), '需要关注不应保留旧板块名称或冗余标签。');
assert.ok(!viewSource.includes('未点评学生清单'), '班级报告不应继续使用旧的未点评学生清单。');
assert.ok(viewSource.includes("useState<StudentCoverageSortKey>('evaluationCount')"), '学生覆盖情况应默认按评价次数排序。');
assert.ok(viewSource.includes("useState<StudentCoverageSortDirection>('asc')"), '学生覆盖情况应默认从少到多展示。');
assert.ok(viewSource.includes('const visibleCoverageRows = sortedCoverageRows.slice(0, 10)'), '学生覆盖情况主卡应默认展示前10名。');
assert.ok(viewSource.includes("{ key: 'evaluationCount', label: '评价次数' }"), '学生覆盖情况应支持按评价次数排序。');
assert.ok(viewSource.includes("{ key: 'teacherCount', label: '评价老师数' }"), '学生覆盖情况应支持按评价老师数排序。');
assert.ok(viewSource.includes('handleCoverageSort') && viewSource.includes("setCoverageSortDirection('asc')"), '切换学生覆盖排序字段时应默认从少到多。');
assert.ok(viewSource.includes("current => current === 'asc' ? 'desc' : 'asc'"), '再次点击当前表头时应切换正序和倒序。');
assert.ok(viewSource.includes('ArrowUpNarrowWide') && viewSource.includes('ArrowDownNarrowWide') && viewSource.includes('ArrowUpDown'), '学生覆盖表头应通过图标表达当前方向和可排序能力。');
assert.ok(viewSource.includes("aria-sort={selected ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}"), '学生覆盖表头应向读屏说明当前排序方向。');
assert.ok(!viewSource.includes('CoverageSortControls'), '学生覆盖情况不应保留独立排序 Tab。');
assert.ok(viewSource.includes('rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)]'), '学生覆盖列表应使用与页面协调的无边框圆角表头。');
assert.ok(!viewSource.includes('rounded-[6px] border-y border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-muted)]'), '学生覆盖表头不应继续使用生硬的边框与深灰底。');
assert.ok(viewSource.includes('grid-cols-[minmax(0,1fr)_var(--tm-report-coverage-evaluation-column)_var(--tm-report-coverage-teacher-column)]') && viewSource.includes('学生姓名'), '学生覆盖表格应使用令牌控制三列布局，并为末列表头保留空间。');
assert.ok(!viewSource.includes('grid-cols-[28px_minmax(0,1fr)_84px_84px]') && viewSource.includes('<ul>\n            {rows.map(row => {'), '学生覆盖表格不应展示没有业务含义的序号。');
assert.ok(viewSource.includes('<span role="columnheader" className="pl-[var(--tm-report-coverage-name-inset)] text-[var(--tm-text-primary)]">学生姓名</span>'), '学生姓名应使用一致的表头语义与令牌化左侧缓冲。');
assert.ok(viewSource.includes('text-[length:var(--tm-font-size-compact)] font-semibold') && viewSource.includes('px-1 font-semibold'), '学生覆盖表头应统一使用13像素半粗字重，并为排序标题保留横向留白。');
assert.ok(viewSource.includes('const evaluationMissing = row.evaluationCount === 0') && viewSource.includes('const teacherMissing = row.teacherCount === 0'), '评价次数和评价老师数应分别判断零值。');
assert.ok(viewSource.includes("teacherMissing\n                                        ? 'font-semibold text-[var(--tm-chart-negative-text)]'"), '两个指标的零值应使用一致的负向文字样式。');
assert.ok(!viewSource.includes("const evaluationSelected = sortKey === 'evaluationCount'") && !viewSource.includes("const teacherSelected = sortKey === 'teacherCount'"), '排序状态只应由表头表达，不应给整列数据重复增加视觉背景。');
assert.ok(viewSource.includes('h-[var(--tm-report-coverage-value-height)]') && !viewSource.includes('mx-auto flex h-7 w-16'), '学生覆盖数值应使用更扁的令牌化区域，避免胶囊控件感。');
assert.ok(viewSource.includes('>\n                                {row.evaluationCount}\n                            </span>') && viewSource.includes('>\n                                {row.teacherCount}\n                            </span>'), '学生覆盖数据单元应只展示数字，不重复表头已有的单位。');
assert.ok(viewSource.includes('aria-label={`评价${row.evaluationCount}次`}') && viewSource.includes('aria-label={`${row.teacherCount}位老师评价`}'), '视觉精简后仍应为读屏保留完整单位。');
assert.ok(!viewSource.includes('rounded-full bg-[var(--tm-chart-negative-soft)]'), '学生覆盖序号不应使用Top 3排名徽标。');
assert.ok(viewSource.includes('已覆盖{\' \'}') && viewSource.includes('{coveredStudentCount}/{totalStudents}'), '已覆盖人数应与学生覆盖情况标题在同一行展示。');
assert.ok(viewSource.includes('rounded-full bg-[var(--tm-chart-data-default-soft)]') && viewSource.includes('text-[var(--tm-chart-data-default-text)]'), '已覆盖人数应使用克制的普通数据标签建立信息层级。');
assert.ok(viewSource.includes('text-[length:var(--tm-font-size-meta)] font-medium') && viewSource.includes('<strong className="font-semibold tabular-nums">'), '顶部已覆盖统计应保持当前字号与字重，不随表格强化而加重。');
assert.ok(viewSource.includes('transition-[color,background-color,scale]') && viewSource.includes('active:scale-[0.96]'), '学生覆盖排序表头应使用明确属性过渡和克制按压反馈。');
assert.ok(viewSource.includes('tabular-nums'), '学生覆盖数值应使用等宽数字保持纵向对齐。');
assert.ok(viewSource.includes('查看全部{sortedCoverageRows.length}名学生'), '学生覆盖情况应提供查看全部入口。');
assert.ok(viewSource.includes('mt-1 flex min-h-[var(--tm-size-touch)]') && viewSource.includes('<ChevronRight aria-hidden="true"') && !viewSource.includes('onClick={() => setShowAllCoverage(true)}\n                            className="mt-2'), '查看全部学生应使用无底色文字入口并保持完整触控区。');
assert.ok(viewSource.includes('<MobileBottomSheet') && viewSource.includes('title="全部学生覆盖情况"'), '完整学生覆盖清单应使用共享底部抽屉。');
assert.ok(viewSource.includes('rows={sortedCoverageRows}'), '底部抽屉应展示完整排序结果。');
assert.ok(viewSource.includes("useState<ReportSourceKey>('all')"), '班级报告应默认展示全班汇总。');
assert.ok(reportSourceDomainSource.includes("{ key: 'all', label: '全班汇总'") && reportSourceDomainSource.indexOf("key: 'all'") < reportSourceDomainSource.indexOf("key: 'mine'"), '数据来源顺序应为全班汇总、我的记录、其他评价老师。');
assert.ok(reportSourceDomainSource.includes("{ key: 'teacher:zhang-yi', label: '张怡'"), '班级报告应维护参与评价的其他老师。');
assert.ok(reportSourceDomainSource.includes("source.key === 'all' || source.key === 'mine' || source.recordShare > 0"), '全班汇总和我的记录应固定展示，其他老师只展示当前周期内有记录的来源。');
assert.ok(viewSource.includes('getReportSourceOptions(resolvedReportPeriod)') && viewSource.includes('[resolvedReportPeriod]'), '来源列表应由已应用日期范围动态生成。');
assert.ok(viewSource.includes('resolveReportSourceKey(nextSourceOptions, reportSourceKey)') && reportSourceDomainSource.includes("? currentSourceKey\n  : 'all'"), '日期变化导致当前来源失效时应回到全班汇总。');
assert.ok(viewSource.includes("if (nextTimeRange === 'custom')") && viewSource.includes('setShowCustomDatePicker(true)') && viewSource.includes('setAppliedCustomRange({ ...draftCustomRange, days: nextDays })') && viewSource.includes('if (nextDays == null) return'), '预设日期应立即应用，自定义日期应通过弹窗确认后提交已应用范围。');
assert.ok(viewSource.includes('appliedCustomRange == null') && viewSource.includes('appliedCustomRange.days / 7'), '报告数据应使用已应用自定义范围，而不是输入中的半成品日期。');
assert.ok(viewSource.indexOf('aria-label="报告时间范围"') < viewSource.indexOf('aria-label="当前日期范围的数据来源"'), '筛选顺序必须为日期在上、来源在下。');
assert.ok(viewSource.includes('role="tablist"') && viewSource.includes('aria-label="当前日期范围的数据来源"'), '报告来源应使用可连续切换的横向标签语义。');
assert.ok(viewSource.includes('role="tab"') && viewSource.includes('aria-selected={selected}') && viewSource.includes('aria-controls="class-report-content"'), '每个来源应具备标签选中状态和内容关联。');
assert.ok(viewSource.includes('sourceScrollerRef') && viewSource.includes('data-report-source-key={item.key}') && viewSource.includes('overflow-x-auto'), '超过一屏的来源应支持横向滚动和选中项定位。');
assert.ok(viewSource.includes('currentTeacherName: string;') && appSource.includes('currentTeacherName={teacherProfile.name}'), '我的记录应关联当前登录老师身份。');
assert.ok(viewSource.includes('activeReportSource.recordShare'), '切换老师后所有报告数据应使用对应老师的数据占比。');
assert.ok(viewSource.includes('getReportSourceRecordCount(source, currentPeriodRecordCount)') && viewSource.includes('({displayedRecordCount})'), '我的记录和其他老师名称后应使用紧凑括号展示当前日期范围的评价条数。');
assert.ok(viewSource.includes('formatReportSourceRecordCount(item.recordCount)') && reportSourceDomainSource.includes("recordCount > 999 ? '999+'"), '来源条数超过999时应封顶显示为999+。');
assert.ok(viewSource.includes('text-[length:var(--tm-font-size-badge)] font-medium tabular-nums'), '来源条数应使用11像素中等字重和等宽数字。');
assert.ok(viewSource.includes("maxTeacherCount: reportSourceKey === 'all'"), '全班汇总应统计多位老师，个人老师视角应按一位老师计算。');
assert.ok(viewSource.includes('gap-[var(--tm-report-source-item-gap)] px-[var(--tm-report-source-list-inline)]'), '来源列表应使用令牌化外边距与项目间距。');
assert.ok(viewSource.includes('h-[var(--tm-report-source-pill-height)]') && viewSource.includes('px-[var(--tm-report-source-pill-inline)]') && viewSource.includes('px-[var(--tm-report-source-item-inline)]'), '来源项与选中胶囊应分别消费稳定高度和水平内边距令牌。');
assert.ok(viewSource.includes("'bg-[var(--tm-brand-primary)] px-[var(--tm-report-source-pill-inline)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-brand-primary-pressed)]'"), '当前来源应使用主题红实底、反白文字和轻阴影。');
assert.ok(viewSource.includes('grid h-[var(--tm-size-touch)] grid-cols-5') && !viewSource.includes('<div className="border-b border-[var(--tm-border-subtle)]">'), '时间范围应使用开放式五等分文字标签，日期与来源之间不增加干扰线。');
assert.ok(viewSource.includes('bg-[var(--tm-page-plain-header-bg)]'), '班级报告顶部筛选容器应使用纯白标题栏背景。');
assert.ok(viewSource.includes('h-[var(--tm-report-date-indicator-height)] w-[var(--tm-report-date-indicator-width)]') && viewSource.includes('h-[var(--tm-size-touch)]'), '日期选中项应使用令牌化短线并保留44像素触控区域。');
assert.ok(viewSource.includes('px-[var(--tm-report-page-inline)]') && viewSource.includes('pb-[var(--tm-report-filter-padding-bottom)] pt-[var(--tm-report-filter-padding-top)]'), '顶部工具区应与报告卡片共用左右基线并消费默认态上下留白令牌。');
assert.ok(viewSource.includes('pt-[var(--tm-report-source-padding-top)]') && viewSource.includes('pb-[var(--tm-report-source-padding-bottom)]') && viewSource.includes('h-[var(--tm-size-touch)] shrink-0'), '来源标签栏应消费上下留白令牌并保留44像素触控高度。');
assert.ok(viewSource.includes('pt-[var(--tm-report-card-gap)]'), '日期筛选卡片到概况卡片的间距应复用正文板块间距令牌。');
assert.ok(viewSource.includes("'font-semibold text-[var(--tm-brand-primary)]'") && viewSource.includes("timeRange === item.key ? 'opacity-100' : 'opacity-0'"), '日期选中项应使用品牌文字和短下划线。');
assert.ok(viewSource.includes("'font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]'"), '日期未选项应使用中等字重次级文字和按压反馈。');
assert.ok(!viewSource.includes('bg-[var(--tm-bg-page-glass)] pb-3 backdrop-blur-xl'), '班级报告顶部筛选不应继续使用玻璃背景。');
for (const filterLabel of ['积分排行类型', '需要关注维度']) {
    assert.ok(viewSource.includes(`aria-label="${filterLabel}"`), `班级报告缺少${filterLabel}筛选语义。`);
}
assert.ok(!viewSource.includes('bg-[var(--tm-brand-primary-soft)]'), '班级报告筛选与展开操作不应继续使用浅粉背景。');
assert.ok(viewSource.includes("'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]'"), '积分排行与需要关注内容分段选中项应使用主题红文字。');
assert.ok(viewSource.includes("const inactiveConditionFilterClass = 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)]"), '次级条件筛选未选项应使用白底浅边界和次级文字，避免描边抢占视觉重点。');
assert.ok(viewSource.includes("const customDateInputClass = 'h-12 w-full") && viewSource.includes('border border-[var(--tm-input-border)]') && viewSource.includes('bg-[var(--tm-input-bg)]') && viewSource.includes('focus:border-[var(--tm-input-focus-border)]') && viewSource.includes('focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]') && viewSource.includes('disabled:bg-[var(--tm-input-disabled-bg)]') && viewSource.includes('read-only:bg-[var(--tm-input-readonly-bg)]'), '弹窗内的自定义日期输入应使用白色可编辑默认态，并明确区分聚焦、禁用和只读状态。');
assert.ok(viewSource.includes('open={showCustomDatePicker}') && viewSource.includes('title="选择日期范围"') && viewSource.includes('应用日期'), '自定义日期应通过公共底部抽屉渐进披露并在确认后应用。');
assert.ok(viewSource.includes('aria-label={`当前自定义日期范围：${appliedCustomRange.start}至${appliedCustomRange.end}`}') && viewSource.includes('--tm-report-custom-range-height') && viewSource.includes('自定义时间：') && viewSource.includes('修改日期'), '已应用自定义日期应在日期下方通过紧凑摘要回显，并允许重新修改。');
assert.ok(!viewSource.includes("timeRange === 'custom' && (\n                            <div className=\"grid grid-cols-[1fr_auto_1fr]"), '页面顶部不应继续直接展开两个日期输入框。');
assert.equal((viewSource.match(/inactiveConditionFilterClass/g) ?? []).length, 2, '重点关注筛选应复用统一浅边界未选样式。');
assert.ok(coverageDomainSource.includes('evaluationCount') && coverageDomainSource.includes('teacherCount'), '学生覆盖统计层应同时维护评价次数和评价老师数。');
assert.ok(coverageDomainSource.includes('sortStudentCoverageRows'), '学生覆盖排序应收敛到独立领域模块。');
assert.ok(bottomSheetSource.includes('role="dialog"') && bottomSheetSource.includes('aria-modal="true"'), '共享底部抽屉应具备模态无障碍语义。');
assert.ok(bottomSheetSource.includes("createPortal") && bottomSheetSource.includes("getElementById('teacher-mobile-overlay-root')"), '共享底部抽屉应挂载到手机端统一浮层，避免受页面滚动与动画变换影响。');
assert.ok(appSource.includes('id="teacher-mobile-overlay-root"'), '教师手机端壳层应提供统一浮层挂载点。');
assert.ok(viewSource.includes('min-h-[var(--tm-size-touch)]'), '学生覆盖清单行应使用教师端触控尺寸令牌。');
assert.ok(viewSource.includes('min-h-[var(--tm-size-touch)] grid-cols-[minmax(0,1fr)_var(--tm-report-coverage-evaluation-column)_var(--tm-report-coverage-teacher-column)]'), '学生覆盖表头应使用教师端触控尺寸令牌并保持稳定的数值列宽。');
assert.ok(uiGuidelineSource.includes('列表不设置独立的排序 Tab') && uiGuidelineSource.includes('无边框的浅中性圆角表面'), '教师手机端规范应固化学生覆盖的表头排序交互与视觉层级。');
assert.ok(uiGuidelineSource.includes('三个表头统一使用 13 像素半粗字重') && uiGuidelineSource.includes('数据单元只展示裸数字') && uiGuidelineSource.includes('不增加胶囊背景'), '教师手机端规范应固化三列表头、裸数字和无胶囊零值提醒。');
assert.ok(uiGuidelineSource.includes('排序状态只通过表头文字色') && uiGuidelineSource.includes('48/24 像素的舒展比例'), '教师手机端规范应固化排序状态与数据行节奏。');
assert.ok(uiGuidelineSource.includes('主卡片与“全部学生覆盖情况”底部抽屉复用同一列表组件'), '教师手机端规范应要求主卡与完整列表保持一致。');
assert.ok(uiGuidelineSource.includes('--tm-report-page-inline') && uiGuidelineSource.includes('--tm-report-card-content-gap'), '教师手机端规范应固化班级报告卡片间距令牌。');
assert.ok(viewSource.includes('min-h-11'), '班级报告交互控件应满足44像素触控高度。');
for (const pinnedInteraction of [
    'const [isFilterPinned, setIsFilterPinned] = useState(false)',
    'handleReportScroll',
    'onScroll={handleReportScroll}',
    'sticky top-0 z-30',
    'transition-[border-color,box-shadow] [transition-duration:var(--tm-duration-panel)] ease-out',
    "'border-[var(--tm-border-subtle)] [box-shadow:var(--tm-shadow-control)]'",
    "'py-[var(--tm-report-filter-padding-pinned)]'",
    "'pb-[var(--tm-report-filter-padding-bottom)] pt-[var(--tm-report-filter-padding-top)]'",
]) {
    assert.ok(viewSource.includes(pinnedInteraction), `班级报告顶部筛选需要首屏/吸顶双状态与微动画，缺少：${pinnedInteraction}`);
}
assert.ok(!viewSource.includes('tm-report-date-option-height-pinned') && !viewSource.includes('tm-report-date-option-width-pinned'), '吸顶状态不应改变日期字号、视觉高度或选项宽度。');
assert.ok(uiGuidelineSource.includes('--tm-report-source-pill-height') && uiGuidelineSource.includes('--tm-report-filter-padding-pinned'), '教师手机端规范应固化来源胶囊高度和吸顶垂直留白令牌。');
assert.ok(uiGuidelineSource.includes('视觉顺序、DOM 顺序和吸顶顺序都必须保持“日期 → 来源 → 报告内容”') && uiGuidelineSource.includes('来源失效时自动回到“全班汇总”'), '教师手机端规范应固化日期与来源的父子依赖。');
assert.ok(uiGuidelineSource.includes('点击“应用日期”后才更新') && uiGuidelineSource.includes('常见 4 至 5 个来源'), '教师手机端规范应固化自定义日期应用时机与来源舒展展示策略。');
for (const internallyScrolledView of ["'class_detail'", "'class_report'", "'student_detail'"]) {
    assert.ok(appSource.includes(internallyScrolledView), `页面内部滚动列表缺少${internallyScrolledView}，无法保证筛选吸顶和底部抽屉层级稳定。`);
}
assert.ok(viewSource.includes('TeacherReportBarChart'), '五育得分应使用通用柱状图组件。');
assert.ok(viewSource.includes('<RecordDistributionComparison') && viewSource.includes('overview={recordDistributionOverview}'), '评价记录分布默认态应使用正负事件占比图。');
assert.ok(!viewSource.includes('onToneSelect=') && !recordComparisonSource.includes('onToneSelect'), '评价记录分布只展示占比，不应提供记录下钻。');
assert.ok(viewSource.includes('aria-label="查看评价记录对比详情"') && viewSource.includes('对比详情'), '评价记录分布应提供轻量对比详情入口。');
assert.ok(viewSource.includes('open={showRecordDistributionDetails}') && viewSource.includes('title="评价记录对比"'), '评价记录精确值应通过公共底部抽屉渐进披露。');
assert.ok(viewSource.includes('<RecordDistributionDetails rows={recordDistributionRows} />'), '评价记录对比抽屉应展示完整数值对照。');
assert.ok(!viewSource.includes('TeacherReportBulletChart'), '评价记录分布不应继续使用横向子弹图。');
assert.ok(viewSource.includes('TeacherReportDonutChart'), '五育事件应使用通用环形图组件。');
assert.ok(viewSource.includes('buildClassReportIndicatorTree(classReportIndicatorDemoPaths, totalRecords)'), '两张五育图表应复用学校配置的三级指标树。');
for (const label of ['崇德', '求知', '向阳', '尚美', '躬行', '乐创']) {
    assert.ok(indicatorDemoSource.includes(`'${label}'`), `真实学校指标 Demo 缺少一级指标：${label}`);
}
assert.ok(indicatorTreeSource.includes('paths: readonly ClassReportIndicatorPath[]'), '指标领域层不得把一级指标固定为五项。');
assert.ok(indicatorTreeSource.includes('aggregateNode') && indicatorTreeSource.includes('addMetrics'), '二级、一级数据必须从三级指标向上汇总。');
assert.ok(viewSource.includes("onCategorySelect={label => openIndicatorDrilldown('score', label)}"), '点击得分图一级指标应直达对应二级明细。');
assert.ok(viewSource.includes("onCategorySelect={label => openIndicatorDrilldown('event', label)}"), '点击事件图一级指标应直达对应二级明细。');
assert.ok(viewSource.includes('查看五育得分二级和三级指标明细') && viewSource.includes('查看五育事件二级和三级指标明细'), '两张图都应提供可访问的查看明细入口。');
assert.ok(viewSource.includes('<ClassReportIndicatorDrilldown') && indicatorDrilldownSource.includes('MobileBottomSheet'), '五育下钻应复用公共底部抽屉。');
assert.ok(!viewSource.includes('ClassReportEvidenceSheet') && !viewSource.includes('openAttentionEvidence') && !viewSource.includes('openCoverageEvidence'), '需要关注和学生覆盖不应提供记录下钻。');
assert.ok(!viewSource.includes('onSelectRow') && !viewSource.includes("label: '去记录'"), '主卡和全部学生覆盖清单都不应恢复整行记录下钻。');
assert.equal((viewSource.match(/onSelectStudent=\{onSelectStudent\}/g) ?? []).length, 4, '需要关注双栏、学生覆盖主卡和完整清单都应复用学生详情入口。');
assert.ok(uiGuidelineSource.includes('占比色块只承载数据表达') && uiGuidelineSource.includes('完整清单只扩展汇总数据范围'), '教师手机端规范应明确长周期汇总板块不下钻记录。');
assert.ok(viewSource.includes("[{ id: 'all', label: '全部' }, ...reportData.indicatorTree]"), '需要关注筛选应与五育图表复用学校一级指标配置。');
assert.ok(chartSource.includes("chart.on('click', handleItemSelect)") && chartSource.includes("chart.off('click', handleItemSelect)"), '通用图表应提供可清理的分类点击回调。');
assert.ok(chartSource.includes("if (!chart.isDisposed()) chart.off('click', handleItemSelect)"), '图表卸载时不应对已释放实例重复解绑事件。');
assert.ok(chartSource.includes("params.componentType === 'xAxis'") && chartSource.includes('triggerEvent: Boolean(onCategorySelect)'), '可下钻柱状图应同时支持点击柱组和横轴指标名称。');
assert.ok(chartSource.includes("formatter: onCategorySelect ? (value: string) => `{label|${value}} {arrow|›}`") && chartSource.includes('label: { color: theme.textPrimary') && chartSource.includes('arrow: { color: theme.textSecondary'), '可下钻柱状图的指标名应使用主文字黑色，箭头使用次级灰色。');
assert.ok(indicatorDrilldownSource.includes('TeacherReportBarChart') && indicatorDrilldownSource.includes("{ name: '加分'") && indicatorDrilldownSource.includes("{ name: '扣分'") && indicatorDrilldownSource.includes("{ name: '总分'"), '得分一级、二级、三级应保持三系列柱状图语义一致。');
assert.ok(indicatorDrilldownSource.includes('<ScoreLegend />') && indicatorDrilldownSource.includes('showLegend={false}'), '得分下钻横向滚动时图例应固定在滚动区上方。');
assert.ok(indicatorDrilldownSource.includes('TeacherReportDonutChart') && indicatorDrilldownSource.includes("optionKey={`indicator-event-${path.join('-')}`}") && indicatorDrilldownSource.includes('value: node.metrics.eventCount'), '事件一级、二级、三级应保持环形图语义一致。');
assert.ok(indicatorDrilldownSource.includes('aria-label="一级指标切换"') && indicatorDrilldownSource.includes('pathNodes.length > 1'), '下钻抽屉应使用一级指标切换栏，并只在三级显示返回路径。');
assert.ok(viewSource.includes('lastIndicatorRootByMode') && viewSource.includes('reportData.indicatorTree[0]') && viewSource.includes('onRootChange={rootId =>'), '查看明细应直达首个或最近查看的一级指标二级数据。');
assert.ok(uiGuidelineSource.includes('“五育”是国家“五育并举”育人理念下的固定业务名称') && uiGuidelineSource.includes('一级指标必须读取学校当前启用的指标配置'), '教师端规范应明确五育名称固定、一级指标可配置。');

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
assert.ok(recordComparisonSource.includes('positivePercentage') && recordComparisonSource.includes('negativePercentage'), '评价记录默认图形应直接展示正负事件占比。');
assert.ok(recordComparisonSource.includes('role="img"') && recordComparisonSource.includes('h-4 overflow-hidden'), '评价记录默认态应使用一条只读、可访问的百分比堆叠图。');
assert.ok(summaryRuleSource.includes("label: '正向事件'") && summaryRuleSource.includes("label: '负向事件'"), '评价记录对比详情应保留正向和负向事件分类。');
assert.ok(viewSource.includes('previousPositiveRecords'), '评价记录分布应提供上周期正向事件。');
assert.ok(viewSource.includes('previousNegativeRecords'), '评价记录分布应提供上周期负向事件。');
assert.ok(viewSource.includes('gradeAveragePositiveRecords'), '评价记录分布应提供年级平均正向事件。');
assert.ok(viewSource.includes('gradeAverageNegativeRecords'), '评价记录分布应提供年级平均负向事件。');
assert.ok(viewSource.includes('getRecordDistributionAnalysis'), '评价记录分布应使用固定规则生成两部分解析。');
assert.ok(viewSource.includes('getRecordDistributionComparisonRows'), '评价记录对比详情的原始值应收敛到领域逻辑。');
assert.ok(viewSource.includes('getRecordDistributionOverview'), '评价记录默认占比应由领域逻辑统一计算。');
assert.ok(viewSource.includes('getEducationScoreAnalysis'), '五育得分分布应使用固定规则生成两部分解析。');
assert.ok(viewSource.includes('getEducationEventAnalysis'), '五育事件分布应使用固定规则生成两部分解析。');
for (const label of ['本周期', '上周期', '年级平均']) {
    assert.ok(recordComparisonSource.includes(label), `评价记录对比抽屉应展示${label}。`);
}
assert.ok(recordComparisonSource.includes('<table') && recordComparisonSource.includes('table-fixed'), '对比详情应使用适配手机宽度的纯文字数值表格。');
assert.ok(recordComparisonSource.includes('scope="col"') && recordComparisonSource.includes('scope="row"'), '对比详情表格应具备正确的行列标题语义。');
assert.ok(recordComparisonSource.includes('tabular-nums'), '对比详情中的数字应使用等宽数字对齐。');
assert.ok(!recordComparisonSource.includes('getBarWidth') && !recordComparisonSource.includes('border-dashed'), '对比详情不应继续使用临时最大值进度条或年级平均虚线。');
for (const redundantComparison of ['增加', '减少', '还差', '优于', '多出']) {
    assert.ok(!recordComparisonSource.includes(redundantComparison), `图表不应重复展示“${redundantComparison}”结论。`);
}
assert.ok(!recordComparisonSource.includes('shadow-'), '评价记录对比行内部不应增加卡片阴影。');
assert.ok(!recordComparisonSource.includes('图例') && !recordComparisonSource.includes('坐标轴'), '评价记录对比行不应继续依赖图例或坐标轴。');
assert.ok(summaryRuleSource.includes('正向和负向事件的变化不一致'), '固定规则应覆盖正向和负向事件变化不一致的情况。');
for (const chartSection of ['评价记录分布', '五育得分分布', '五育事件分布']) {
    assert.ok(chartRuleDocument.includes(`## ${chartSection}`), `图表话术文档缺少${chartSection}规则。`);
}
for (const unrelatedSection of ['通用图表规则', '颜色', '代码映射']) {
    assert.ok(!chartRuleDocument.includes(unrelatedSection), `图表话术文档不应包含${unrelatedSection}等无关内容。`);
}
assert.ok(!chartSource.includes('PictorialBarChart'), '评价记录改为直接对比后不应保留无用的象形柱图运行时。');
assert.ok(uiGuidelineSource.includes('百分比堆叠条') && uiGuidelineSource.includes('纯文字数值对照表'), '教师手机端规范应固化评价记录分布的简洁默认态与文字详情结构。');
assert.ok(uiGuidelineSource.includes('占比色块只承载数据表达') && uiGuidelineSource.includes('不设置整行点击或记录下钻') && uiGuidelineSource.includes('学生姓名可直接进入学生详情') && uiGuidelineSource.includes('禁止在该板块内直接加载规模不可预测的评价记录'), '教师手机端规范应明确长周期汇总板块不加载记录明细，仅允许姓名进入学生详情。');
assert.ok(chartSource.includes('labelColors'), '清亮图形填充应与深色数值标签分层。');
assert.ok(!chartSource.includes('ScatterChart'), '删除子弹图后不应继续加载散点图运行时。');
assert.ok(viewSource.includes("{ name: '总分', values: reportData.netScores, color: 'data' }"), '总分应使用清亮普通数据蓝。');
for (const color of ['#43B0F6', '#5BD65D', '#FF9B3D', '#FF8176', '#AFBDCB']) {
    assert.ok(tokenSource.includes(color), `班级报告缺少已确认的清亮图表色：${color}`);
}
assert.ok(!chartSource.includes("readToken(style, '--tm-status-positive')"), '班级报告图形不应继续直接读取全局正向色。');
assert.ok(!chartSource.includes("readToken(style, '--tm-status-negative')"), '班级报告图形不应继续直接读取全局负向色。');
assert.ok(appSource.includes("'class_report'") && appSource.includes("'student_detail'"), '班级报告应接入教师手机端统一页面背景。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
assert.ok(plainBackgroundList.includes("'class_report'"), '班级报告应使用纯白标题栏、浅灰内容区背景。');

console.log('ClassReportView prototype functionality and token assertions passed');
