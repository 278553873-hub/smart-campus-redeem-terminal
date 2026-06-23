import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const prd = fs.readFileSync(new URL('../docs/PRD-ToC个人教师自助开通改造.md', import.meta.url), 'utf8');

function requireText(text, message) {
  if (!source.includes(text)) throw new Error(message);
}

function requirePrd(text, message) {
  if (!prd.includes(text)) throw new Error(message);
}

function forbidText(text, message) {
  if (source.includes(text)) throw new Error(message);
}

requireText("| 'coinIssuanceManagement'", '教师端页面枚举应新增货币发放管理页。');
forbidText("| 'schoolUsageReport'", '教师端已取消 20 学校数据报表页，页面枚举不应保留。');
forbidText("if (pageKey === 'schoolUsageReport') return '20';", '教师端已取消页面 20，不应再有编号映射。');
requireText("if (pageKey === 'coinIssuanceManagement') return '21';", '货币发放管理页应编号为 21。');
requireText("modules: ['教师信息', '头像', '姓名', '扫一扫', '设置', '了解学校版', '管理工具', '生成期末报告', '更多工具', '科目管理', '部门管理', '货币发放管理'", '14A 应保留独立管理工具，并在更多工具中新增货币发放管理。');
requireText("modules: ['教师信息', '头像', '姓名', '扫一扫', '设置', '当前版本入口', '管理工具', '学校数据报表', '生成期末报告', '更多工具', '科目管理', '部门管理', '货币发放管理'", '14B 应保留独立管理工具，学校版展示学校数据报表，并在更多工具中保留货币发放管理。');
requireText('aria-label="进入基本信息设置"', '教师头像应作为基本信息设置入口。');
requireText('className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg font-black text-gray-800 active:bg-gray-200"', '教师头像应使用灰阶底色形成头像占位。');
requireText('className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"', '更多工具卡片应保留轻卡片效果。');
requireText('<div className="text-sm font-black">管理工具</div>', '管理工具卡片必须独立保留。');
requireText('<div className="text-sm font-black">更多工具</div>', '更多工具标题应使用紧凑字号字重。');
const mineRenderStart = source.indexOf("if (page === 'minePersonal' || page === 'mineSchool')");
const mineRenderEnd = source.indexOf("if (page === 'teacherBasicInfo')", mineRenderStart);
const mineRender = source.slice(mineRenderStart, mineRenderEnd);
if (!mineRender.includes("const hasMultipleVersions = page === 'mineSchool';")) {
  throw new Error('14B 应代表用户拥有多个版本，不能仅按当前切换版本判断页面身份。');
}
if (!mineRender.includes("const isCurrentSchoolVersion = currentSpace.type === 'school';")) {
  throw new Error('管理工具展示应按当前切换版本判断；14B 切到个人版时只保留个人版管理工具。');
}
if (mineRender.includes('relative rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]')) {
  throw new Error('我的页教师信息不应继续使用卡片承载。');
}
if (mineRender.includes('<Shield size={18} className="text-gray-500" />')) {
  throw new Error('更多工具标题不应显示自己的 icon。');
}
if (mineRender.indexOf('管理工具') < 0 || mineRender.indexOf('更多工具') < 0 || mineRender.indexOf('管理工具') > mineRender.indexOf('更多工具')) {
  throw new Error('管理工具必须作为独立卡片展示在更多工具上方。');
}
forbidText("onClick={() => navigate('schoolUsageReport')}", '学校数据报表不应恢复为独立 20 页面。');
requireText("label: '学校数据报表'", '14B 当前切换到学校版时，管理工具应展示学校数据报表。');
requireText("hasMultipleVersions && isCurrentSchoolVersion", '学校数据报表只应在 14B 且当前切换到学校版时展示。');
requireText("showClassActionToast('学校数据报表演示中')", '学校数据报表入口应提供演示反馈。');
requireText("label: '货币发放', icon: Coins, onClick: () => navigate('coinIssuanceManagement')", '货币发放入口应进入 21 货币发放管理页。');
requireText('onClick: openFinalReportConfirmSheet', '生成期末报告入口应先打开未到学期末提示弹窗。');
requireText('const mineMoreToolTabs = schoolBasicInfoTabs.filter((item) => item.key !== \'term\');', '14A/14B 更多工具应取消学期管理入口。');
requireText('className="mt-3 grid grid-cols-2 gap-2"', '管理工具入口应采用原独立横向重点操作布局。');
requireText('className="flex min-h-[86px] flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left active:bg-gray-100"', '管理工具入口应保留原灰阶重点操作样式。');
requireText('className="mt-4 grid grid-cols-3 gap-2"', '更多工具入口应采用三列高密度图标布局。');
requireText('className="flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl text-center active:bg-gray-100"', '更多工具入口应使用图标加短文案样式。');
if (mineRender.includes('cyan-') || mineRender.includes('indigo-') || mineRender.includes('18,184,203') || mineRender.includes('79,70,229')) {
  throw new Error('低保真原型的更多工具不应使用彩色视觉样式。');
}
requireText('<span className="text-xs font-black leading-4">{item.label}</span>', '更多工具入口应使用短文案。');
if (mineRender.includes('bg-gray-900 px-1.5 py-0.5 text-[10px] leading-none text-white')) {
  throw new Error('生成期末报告入口不应使用黑色确认标签抢层级。');
}
if (source.includes('className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-gray-900 bg-gray-950 p-3 text-left text-white active:bg-gray-800"')) {
  throw new Error('生成期末报告不应使用黑底强 CTA 卡片样式。');
}
requireText('const renderFinalReportConfirmSheet = () =>', '应有生成期末报告提示弹窗。');
requireText("aria-label={showFinalReportSamplePreview ? '期末报告样例预览' : '期末报告提示'}", '期末报告弹窗应具备明确语义标签。');
requireText('还未到学期末，暂时无法生成期末报告。', '未到学期末时应提示暂时无法生成期末报告。');
requireText('预览期末报告样例', '期末报告弹窗应提供样例预览入口。');
requireText("const TERM_REPORT_SAMPLE_IMAGE = '/assets/term-report-sample.jpg';", '期末报告样例图应使用项目内静态资源。');
requireText('<img src={TERM_REPORT_SAMPLE_IMAGE} alt="期末报告样例" className="block w-full" loading="lazy" />', '点击预览后应展示期末报告样例图。');
forbidText('finalReportBehaviorConfirmed', '期末报告不可生成提示不应保留行为记录勾选项状态。');
forbidText('finalReportScoreConfirmed', '期末报告不可生成提示不应保留成绩勾选项状态。');
forbidText("showClassActionToast('报告排队生成中');", '未到学期末时不应提示报告排队生成。');
forbidText("if (page === 'schoolUsageReport')", '教师端已取消页面 20，不应渲染学校数据报表页。');
forbidText('<PageNodeButton item="schoolUsageReport" lane={lane.title} />', '页面导航地图不应展示 20 学校数据报表节点。');
requireText("if (page === 'coinIssuanceManagement')", '应渲染货币发放管理页。');
requireText('开启货币发放', '货币发放管理页应展示顶部开关配置项。');
requireText('onPointerDown={() => setShowCoinIssueHelpOverlay(true)}', '问号 icon 应支持长按显示说明蒙层。');
requireText('const SwitchControl = ({', '低保真原型应抽象统一开关组件，避免业务页临时写死。');
requireText('role="switch"', '开关组件应使用 switch 语义。');
requireText('aria-checked={checked}', '开关组件应使用 aria-checked 表达状态。');
requireText("'absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white", '开关圆点应有明确 left/top 定位，避免开启时位置异常。');
requireText("checked ? 'translate-x-5' : 'translate-x-0'", '开关开启位移应与轨道和圆点尺寸精确匹配。');
requireText('<SwitchControl\n                    checked={coinIssuanceEnabled}', '货币发放管理页应使用统一 SwitchControl。');
forbidText('aria-pressed={coinIssuanceEnabled}', '货币发放开关不应使用按钮按下态模拟，应使用 switch 语义。');
forbidText("coinIssuanceEnabled ? 'translate-x-7' : 'translate-x-1'", '货币发放开关不应保留旧的异常位移写法。');
requireText('每周一发放', '发放周期应支持每周一发放。');
requireText('每月一号发放', '发放周期应支持每月一号发放。');
requireText('value={coinClassBudget}', '班级总预算应使用数字输入状态。');
requireText("const budgetSentencePrefix = coinIssuePeriod === 'weekly' ? '每周每个班级发放' : '每月每个班级发放';", '班级总预算文案应随发放周期切换。');
requireText('<span className="shrink-0 text-sm font-black text-gray-700">{budgetSentencePrefix}</span>', '班级总预算应以前置自然语言说明发放周期和班级范围。');
requireText('aria-label={budgetSentencePrefix}', '班级总预算输入框应具备随周期变化的语义标签。');
requireText('<span className="shrink-0 text-sm font-black text-gray-700">币</span>', '班级总预算输入框后只展示币单位。');
forbidText('校园币/班级/{periodUnit}', '班级总预算不应再使用割裂的斜杠单位文案。');
requireText('updateSunshineRatio', '阳光保底比例应与积分排行比例联动。');
requireText('updateRankingRatio', '积分排行比例应与阳光保底比例联动。');
requireText('const formatCoinAmount = (amount: number) =>', '货币金额应统一格式化，避免长小数。');
requireText('const sunshinePoolAmount = coinClassBudget * sunshineRatio / 100;', '阳光保底总额应由班级预算和比例实时计算。');
requireText('const rankingPoolAmount = coinClassBudget * rankingRatio / 100;', '积分排行奖池金额应由班级预算和比例实时计算。');
forbidText('coinDemoClassSize', '全班平分展示的是阳光保底资金池，不应再按演示人数拆成每人金额。');
forbidText('sunshinePerStudentAmount', '阳光保底说明金额应与排行奖池相加等于班级总预算，不应展示每人金额。');
requireText('<div className="font-medium">每位学生无论评价如何，都可以获得的奖励。</div>', '阳光保底说明第一行应只展示解释文案。');
requireText('<div className="font-black text-gray-900">全班平分：{formatCoinAmount(sunshinePoolAmount)}币</div>', '阳光保底金额应换行展示，并使用保底资金池金额。');
requireText('<div className="font-medium">评分为正的学生，可按比例分配的奖励。</div>', '积分排行说明第一行应只展示解释文案。');
requireText('<div className="font-black text-gray-900">奖池金额：{formatCoinAmount(rankingPoolAmount)}币</div>', '积分排行金额应换行展示，并与保底资金池相加等于班级预算。');
requireText('{formatCoinAmount(rankingPoolAmount)}币', '积分排行说明应展示实时奖池金额。');
requireText("showClassActionToast('货币发放配置已保存')", '保存按钮应给出保存反馈。');
requireText('<PageNodeButton item="coinIssuanceManagement" lane={lane.title} />', '页面导航地图应展示 21 货币发放管理节点。');

requirePrd('管理工具卡片 → 14A 展示，仅包含生成期末报告', 'PRD 应说明 14A 管理工具保持独立。');
requirePrd('更多工具卡片 → 由原“学校基础信息”改名而来，14A 展示科目管理、部门管理、货币发放管理', 'PRD 应说明 14A 更多工具内容。');
requirePrd('管理工具卡片 → 14B 当前切到学校版时展示学校数据报表、生成期末报告；切到个人版时仅展示生成期末报告', 'PRD 应说明 14B 管理工具随当前版本切换。');
requirePrd('更多工具卡片 → 由原“学校基础信息”改名而来，14B 展示科目管理、部门管理、货币发放管理', 'PRD 应说明 14B 更多工具内容。');
requirePrd('货币发放管理 → 进入 21 货币发放管理，默认关闭；开启后展示发放周期、班级总预算、阳光保底比例、积分排行比例和保存按钮', 'PRD 应说明货币发放管理链路。');
requirePrd('生成期末报告 → 未到学期末时展示底部浮层提示“还未到学期末，暂时无法生成期末报告。”，并提供“预览期末报告样例”入口', 'PRD 应说明生成期末报告未到期提示和样例预览链路。');

console.log('TeacherCMobileLowFi 管理工具结构测试通过');
