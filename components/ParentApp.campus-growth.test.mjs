import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message ?? `不应出现：${text}`);
};

requireText(parentSource, 'showPhoneShell?: boolean', '家长手机端应接收 showPhoneShell，用于和教师手机端一致地切换真实手机效果。');
requireText(parentSource, 'showDeviceFrame={showPhoneShell}', '家长手机端应把 showPhoneShell 传给 PhoneMockup 的 showDeviceFrame。');
requireText(parentSource, "type Screen = 'login' | 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank'", '页面状态应覆盖登录、绑定、成长、报告详情和银行，不应保留未绑定提醒中间页。');
requireText(parentSource, 'w-screen h-[100dvh] bg-[#EEF2F6]', '家长端外层演示背景应保持中性，不能把 H5 弥散背景铺满整个页面。');
requireText(parentSource, 'const ParentDiffuseBackdrop', '家长端应保留 H5 内容区内部的弥散背景组件。');

for (const parentBgColor of ['#FFD1B8', '#FFF2B8', '#DFF6D6', '#F4FBF1']) {
  requireText(parentSource, parentBgColor, `家长端 H5 背景应使用浅橙、浅黄、浅绿方向，缺少：${parentBgColor}`);
}

for (const removedOuterBg of ['radial-gradient(circle_at_25%_0%', 'linear-gradient(180deg,#fff9e6_0%,#eef7f6_100%)']) {
  forbidText(parentSource, removedOuterBg, `家长端 H5 弥散背景不应出现在整个页面外层：${removedOuterBg}`);
}

for (const blueMainBg of ['#DDF2FF', '#F7FBFF', '#F8FBFF']) {
  forbidText(parentSource, blueMainBg, `家长端背景主色应改为浅橙、浅黄、浅绿，不应保留蓝色主背景：${blueMainBg}`);
}



requireText(parentSource, 'h-[44px]', '家长端标题栏高度应对齐教师手机端“学校数据报表”的 44px 标题栏。');
for (const redundantBindingText of ['学生身份核验', '完成绑定 <ArrowRight']) {
  forbidText(parentSource, redundantBindingText, `绑定孩子页应删除显而易见或装饰性内容：${redundantBindingText}`);
}

requireText(parentSource, "const [bindForm, setBindForm] = useState({ schoolCode: '', studentName: '', studentNo: '' })", '绑定孩子页初始应只准备空表单，不应预填学生信息。');
requireText(parentSource, 'showStudentBindFields', '绑定孩子页应通过失焦后的状态控制学生姓名和学号逐步显示。');
requireText(parentSource, 'onBlur={event => revealStudentBindFields(event.currentTarget.value)}', '学校编号输入框失焦后才显示学生姓名和学生学号。');
requireText(parentSource, 'disabled={!canSubmitBinding}', '完成绑定按钮应在学校编号、学生姓名、学生学号都填写后可用。');
requireText(parentSource, 'bg-[#FFC210]', '家长端主按钮应使用产品指定主色 #FFC210。');
requireText(parentSource, 'bg-[#07C160] text-white', '微信授权登录按钮应使用微信绿色。');
requireText(parentSource, 'BINDING_INPUT_CLASS', '绑定孩子页输入框应收敛为统一样式，避免不同字段聚焦态背景不一致。');
requireText(parentSource, 'focus:bg-slate-50 focus:border-[#F97316]', '绑定孩子页输入框聚焦态应统一保持背景色，只改变橙色边框。');
requireText(parentSource, "placeholder: '例如：20250101'", '学生学号占位示例应使用 8 位日期式编号，方便家长理解输入格式。');
forbidText(parentSource, "placeholder: '例如：202208'", '学生学号占位示例不应继续使用旧的 6 位编号。');
forbidText(parentSource, 'focus:ring-4 focus:ring-[#FFC210]/20', '学校编号输入框聚焦态不应使用黄色外发光，避免看起来背景变色。');
forbidText(parentSource, 'focus:ring-4 focus:ring-[#5886EF]/15', '学生输入框聚焦态不应使用蓝色外发光，避免看起来背景变色。');

requireText(parentSource, 'bg-[#FFC210] text-[#653C16]', '家长端主按钮应使用 #FFC210 背景和 #653C16 文字。');

requireText(parentSource, '#5886EF', '家长端辅助强调色应保留产品指定蓝色 #5886EF。');

requireText(parentSource, "bindingReturnTarget", '从学生切换弹窗进入新增绑定时，应记录返回目标。');
requireText(parentSource, "返回切换孩子", '新增绑定弹窗应提供返回切换孩子弹窗的路径。');
requireText(parentSource, "aria-label=\"切换孩子\"", '顶部学生区域应提供明确的切换按钮。');
requireText(parentSource, "student-summary-topbar", '顶部学生区域应只作为简洁学生摘要，不承载完整字段。');
requireText(parentSource, "wechat-titlebar-student", '学生头像和姓名切换入口应放在最上方标题栏。');
requireText(parentSource, "const MainStudentTitleBar", '成长、报告、银行主页面应复用学生标题栏，而不是各自显示白底文字标题。');
forbidText(parentSource, '<Header title="成长" />', '成长页不应再显示白底文字标题栏。');
forbidText(parentSource, '<Header title="报告" />', '报告页不应再显示白底文字标题栏。');
forbidText(parentSource, '<Header title="银行" />', '银行页不应再显示白底文字标题栏。');
requireText(parentSource, "student-switcher-card", '学生切换弹窗应使用信息卡片展示绑定学生。');
requireText(parentSource, "所在班级", '学生切换弹窗应展示所在班级字段。');
requireText(parentSource, "学号", '学生切换弹窗应展示学号字段。');
requireText(parentSource, "新增绑定", '学生切换弹窗应提供新增绑定入口。');
requireText(parentSource, "child.id === activeChildId ? '当前' : '切换'", '学生切换卡片应区分当前学生和可切换学生。');
requireText(parentSource, "child.id === activeChildId ? 'bg-white text-slate-900", '学生切换弹窗当前卡片不应使用深色底。');
requireText(parentSource, 'whitespace-nowrap', '学生切换弹窗班级和学号信息不应换行。');
forbidText(parentSource, "bg-slate-900 text-white border-slate-900", '学生切换弹窗当前卡片不应使用深色底。');
forbidText(parentSource, "mt-1 text-[12px] font-medium text-slate-400 truncate'>{activeChild.className}", '顶部学生区域不应展示班级，应只展示头像、姓名和切换入口。');

const emojiPattern = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
for (const [name, source] of [['ParentApp.tsx', parentSource], ['App.tsx', appSource]]) {
  if (emojiPattern.test(source)) failures.push(`${name} 不应出现 emoji。`);
}

for (const required of ['微信授权登录', '绑定孩子', '学校编号', '学生姓名', '学生学号', '切换孩子', '新增绑定', '表扬次数', '批评次数', '净积分', '最近评价', '月度报告', '期末报告', '报告详情', '积分银行', '可用货币', '银行存款', '签署新存单', '我的存单', '存钱计划', '存入金额', '签署存单', '确认签署']) {
  requireText(parentSource, required, `家长手机端缺少核心流程文案：${required}`);
}

for (const periodText of ['本周', '本月', '本学期']) {
  requireText(parentSource, periodText, `成长页周期筛选缺少：${periodText}`);
}

requireText(parentSource, "type GrowthPeriod = 'week' | 'month' | 'term'", '成长页应定义周、月、学期筛选类型。');
requireText(parentSource, "useState<GrowthPeriod>('week')", '成长页默认应按本周统计。');
requireText(parentSource, 'createdAt', '评价记录应包含可筛选日期字段。');
requireText(parentSource, 'visibleRecordCount', '成长页应通过可见条数支持滑动加载历史评价。');
requireText(parentSource, 'handleGrowthScroll', '成长页应在滚动容器中处理接近底部自动加载。');
forbidText(parentSource, 'ParentFiveEducationRadar', '成长页已取消五育能力模型板块，不应继续渲染雷达图。');
forbidText(parentSource, 'student-virtual-avatar', '成长页已取消顶部学生信息大卡片，不应继续展示虚拟形象板块。');
forbidText(parentSource, 'bg-white/[0.32]', '成长页已取消顶部学生信息大卡片，不应保留玻璃卡片背景。');
forbidText(parentSource, 'from-[#2DD4BF] to-[#14B8A6]', '学生头像背景不应使用绿色或青绿色。');
forbidText(parentSource, 'tracking-[2px]">•••', '家长端标题栏不应手动画微信胶囊，模拟真实手机效果会自带原生控件。');

for (const tab of ["key: 'growth', label: '成长'", "key: 'reports', label: '报告'", "key: 'bank', label: '银行'"]) {
  requireText(parentSource, tab, `底部菜单缺少固定入口：${tab}`);
}

requireText(parentSource, 'const ParentBottomNav', '家长端底部菜单应封装为 ParentBottomNav，避免样式散落在页面尾部。');
requireText(parentSource, 'parent-bottom-nav-shell', '家长端底部菜单应使用白色悬浮胶囊容器。');
requireText(parentSource, 'parent-bottom-nav-indicator', '家长端底部菜单应使用滑块式选中态。');
requireText(parentSource, 'parent-bottom-nav-prism', '家长端底部菜单切换时应有彩色折射尾迹层。');
requireText(parentSource, 'parent-bottom-nav-glare', '家长端底部菜单应有随动玻璃高光层。');
requireText(parentSource, 'transform: `translateX(${activeIndex * 100}%)`', '家长端底部菜单选中滑块应通过 transform 平移，保证动效流畅。');
requireText(parentSource, 'rounded-full bg-white/95', '家长端底部菜单应复刻录屏中的大圆角白色胶囊。');
requireText(parentSource, "<style>{`", '家长端底部菜单的玻璃/流体动效应收敛在组件局部样式内。');
requireText(parentSource, 'backdrop-filter: blur(20px) saturate(1.75);', '家长端底部菜单滑块应具备玻璃模糊和饱和折射质感。');
requireText(parentSource, '@keyframes parentNavPrism', '家长端底部菜单应定义切换折射动效。');
forbidText(parentSource, "bg-[#FFC210]/30", '家长端底部菜单选中态不应继续使用黄色块，应改为录屏式浅灰滑块。');



for (const bankText of ['活期存单', '定期存单', '预计利息', '到期时间', '取出']) {
  requireText(parentSource, bankText, `家长端银行操作应参考货柜机存单流程，缺少：${bankText}`);
}

if (!parentSource.includes('BANK_CONFIG.TERMS')) {
  failures.push('家长端银行应复用货柜机 BANK_CONFIG.TERMS 存单计划配置。');
}

if (!parentSource.includes("activeBankTab") || !parentSource.includes("'deposit' | 'list'")) {
  failures.push('家长端银行应采用“签署新存单 / 我的存单”双标签操作。');
}

for (const forbiddenTab of ["label: '记录'", "label: '资产'", "key: 'records'", "key: 'assets'"]) {
  forbidText(parentSource, forbiddenTab, `底部菜单不应再保留旧入口：${forbiddenTab}`);
}

for (const forbiddenBusiness of ['兑换奖励', '兑换商品', '货柜兑换', "type: 'exchange'", '兑换记录']) {
  forbidText(parentSource, forbiddenBusiness, `家长端不能提供或强化兑换相关能力：${forbiddenBusiness}`);
}





for (const removedStep of ['emptyBinding', '还没有绑定孩子', '先绑定孩子才能查看成长数据']) {
  forbidText(parentSource, removedStep, `微信授权后应直接进入绑定页，不应保留未绑定提醒中间步骤：${removedStep}`);
}

requireText(parentSource, "onClick={() => setScreen('binding')}", '微信授权登录后没有绑定孩子时，应直接进入绑定页面。');





for (const extraNoise of ['家校共育成长账户', '授权后可查看成长评价、月度报告、期末报告和积分银行信息。', '仅用于家长身份确认和学生信息展示，不会公开孩子个人数据。', '选择已绑定孩子，或继续绑定孩子', '第一步：', '第二步：']) {
  forbidText(parentSource, extraNoise, `家长端页面仍有可删除的说明或步骤噪音：${extraNoise}`);
}

requireText(parentSource, 'indicatorPath', '成长页评价列表应展示五育三级指标结构。');
requireText(parentSource, 'record.indicatorPath.map', '成长页评价卡片应渲染三级指标路径。');
requireText(parentSource, 'record.content', '成长页评价卡片应展示老师评语。');
requireText(parentSource, '评价老师：{record.teacher}', '成长页评价卡片应展示评价老师。');
requireText(parentSource, "['崇德', '仪容仪表', '举止得体']", '成长页评价演示数据应包含三级指标示例。');

if (parentSource.includes('activeChild.school} · {activeChild.className} · 学号')) {
  failures.push('当前孩子区域不应同时展示学校、班级、学号，保留姓名和班级即可。');
}

for (const bindingNoise of ['输入任意信息即可体验 Demo', '学校编号、学生姓名、学生学号均可使用演示值']) {
  forbidText(parentSource, bindingNoise, `绑定页应删除多余灰色说明：${bindingNoise}`);
}

for (const noisyText of ['最近评价与关键统计', '月度报告与期末报告', '可用货币、银行存款与存储记录', '当前绑定的孩子']) {
  forbidText(parentSource, noisyText, `家长端应删除一眼能看懂的多余说明或重复标签：${noisyText}`);
}

if (parentSource.includes('line-clamp-2') || parentSource.includes('report.summary}</p>')) {
  failures.push('报告列表不应展示报告内容简介，家长进入详情页查看正文即可。');
}

for (const legacy of ['智批作文', 'AI Guardian', '作文综合评分', '深度诊断报告']) {
  forbidText(parentSource, legacy, `家长手机端不应保留旧作文批改方案文案：${legacy}`);
}

requireText(appSource, '<ParentApp showPhoneShell={showParentPhoneShell} />', 'AppSwitcher 应接入家长手机端并传入独立的 showParentPhoneShell。');
requireText(appSource, "currentApp === 'admin' || currentApp === 'parent'", '模拟真实手机效果开关应同时覆盖教师手机端和家长手机端。');
requireText(appSource, '家长手机端', 'DEMO 环境切换面板应展示“家长手机端”入口。');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent campus growth app assertions passed');
