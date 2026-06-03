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
requireText(parentSource, 'screenBackground={<ParentDiffuseBackdrop />}', '家长端渐变背景应传给 PhoneMockup 的 screenBackground，覆盖真实手机状态栏时间和 WiFi 区域。');
requireText(parentSource, 'contentTopInsetMode="full-chrome"', '开启真实手机效果时，家长端内容应同时避让状态栏和微信胶囊，避免银行页、报告页关键信息被遮挡。');
forbidText(parentSource, 'contentTopInsetMode="status-bar"', '家长端不能只避让状态栏，否则银行页和报告页顶部内容会被微信胶囊遮挡。');
requireText(parentSource, "type Screen = 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank'", '家长端应取消微信授权登录页，页面状态从绑定、成长、报告详情和银行开始。');
forbidText(parentSource, "type Screen = 'login' | 'binding'", '家长端不应再保留微信授权登录页作为页面状态。');
requireText(parentSource, 'w-screen h-[100dvh] bg-[#EEF2F6]', '家长端外层演示背景应保持中性，不能把 H5 弥散背景铺满整个页面。');
requireText(parentSource, 'const ParentDiffuseBackdrop', '家长端应保留 H5 内容区内部的弥散背景组件。');

for (const parentBgColor of ['#FFD1B8', '#FFF2B8', '#DFF6D6', '#F4FBF1']) {
  forbidText(parentSource, parentBgColor, `家长端接入教师端 token 试点后，不应继续在全局背景里写死旧暖色：${parentBgColor}`);
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
requireText(parentSource, 'shouldShowStudentBindFields', '绑定孩子页应根据学校编号输入内容实时显示学生姓名和学生学号。');
requireText(parentSource, "setBindForm(prev => field === 'schoolCode' && !value.trim()", '学校编号被清空时，应同步清空学生姓名和学生学号，避免残留误提交。');
forbidText(parentSource, 'onBlur={event => revealStudentBindFields(event.currentTarget.value)}', '学校编号输入框不应再依赖点击空白处后才显示学生姓名和学生学号。');
requireText(parentSource, "if (screen === 'binding') return Binding();", '绑定页输入期间会更新父组件状态，应以内联函数调用渲染，避免局部组件身份变化导致输入框失焦。');
forbidText(parentSource, "if (screen === 'binding') return <Binding />;", '绑定页不应以局部 JSX 组件方式渲染，否则每次输入都会重新挂载并导致输入框失焦。');
requireText(parentSource, 'disabled={!canSubmitBinding}', '完成绑定按钮应在学校编号、学生姓名、学生学号都填写后可用。');
requireText(parentSource, 'ParentPrimaryButton', '家长端确认类按钮应使用新的 ParentPrimaryButton 组件。');
forbidText(parentSource, 'bg-[#07C160] text-white', '家长端已取消第一个微信授权登录页面，不应保留微信绿色登录按钮。');
requireText(parentSource, 'BINDING_INPUT_CLASS', '绑定孩子页输入框应收敛为统一样式，避免不同字段聚焦态背景不一致。');
requireText(parentSource, "placeholder: '例如：20250101'", '学生学号占位示例应使用 8 位日期式编号，方便家长理解输入格式。');
forbidText(parentSource, "placeholder: '例如：202208'", '学生学号占位示例不应继续使用旧的 6 位编号。');
forbidText(parentSource, 'focus:ring-4 focus:ring-[#FFC210]/20', '学校编号输入框聚焦态不应使用黄色外发光，避免看起来背景变色。');
forbidText(parentSource, 'focus:ring-4 focus:ring-[#5886EF]/15', '学生输入框聚焦态不应使用蓝色外发光，避免看起来背景变色。');

requireText(parentSource, 'ParentGradientIcon', '家长端功能图标应使用统一渐变 icon 组件。');

requireText(parentSource, 'ParentCard', '家长端卡片应使用统一 ParentCard 组件。');

requireText(parentSource, "bindingReturnTarget", '从学生切换弹窗进入新增绑定时，应记录返回目标。');
requireText(parentSource, "返回切换孩子", '新增绑定弹窗应提供返回切换孩子弹窗的路径。');
requireText(parentSource, "aria-label=\"切换孩子\"", '成长页学生信息卡应提供明确的切换孩子入口。');
forbidText(parentSource, "student-summary-topbar", '家长端报告页和银行页不应继续展示顶部头像、姓名、下拉切换栏。');
forbidText(parentSource, "wechat-titlebar-student", '家长端报告页和银行页不应继续展示顶部头像、姓名、下拉切换栏。');
forbidText(parentSource, "const MainStudentTitleBar", '家长端不应继续保留顶部头像姓名下拉栏组件。');
requireText(parentSource, "import { ASSETS } from '../mobile-app/assets/images';", '家长端成长页学生头像应复用教师手机端已有真实学生头像资源。');
requireText(parentSource, 'avatar: string;', '家长端孩子档案应包含真实头像字段。');
requireText(parentSource, 'ASSETS.AVATAR.BOYS', '男生头像应从教师端真实学生头像池中选择。');
requireText(parentSource, 'ASSETS.AVATAR.GIRLS', '女生头像应从教师端真实学生头像池中选择。');
requireText(parentSource, 'const GrowthChildProfileCard', '成长页应使用学生基本信息卡展示当前孩子，而不是旧头像姓名标题栏。');
requireText(parentSource, 'alt={`${activeChild.name}头像`}', '成长页学生头像应提供可访问的头像说明。');
requireText(parentSource, "className: `${2025 - index}级${index + 1}班`", '家长端演示孩子班级应使用“2025级1班”格式。');
requireText(parentSource, 'activeChild.className', '成长页学生信息卡应展示班级。');
requireText(parentSource, '{activeChild.studentNo}', '成长页学生信息卡应只展示具体学号编号，不应追加“学号”前缀。');
forbidText(parentSource, '学号 {activeChild.studentNo}', '成长页学生信息卡中的学号只显示编号即可。');
requireText(parentSource, '切换\n          </button>', '成长页学生信息卡应提供明确的切换按钮。');
forbidText(parentSource, 'bg-slate-950 px-3 text-[13px] font-black text-white', '成长页学生信息卡切换按钮不应使用黑色强按钮，应改为与教师端蓝色 token 更协调的轻按钮。');
requireText(parentSource, 'border border-blue-100 bg-blue-50 px-3 text-[13px] font-black text-blue-600', '成长页学生信息卡切换按钮应使用轻蓝品牌样式，降低视觉冲突。');
requireText(parentSource, '<GrowthChildProfileCard />', '成长页顶部应渲染学生基本信息卡。');
requireText(parentSource, 'rounded-[28px] border border-white p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl bg-white', '成长页学生信息卡顶层背景应使用白色。');
requireText(parentSource, 'rounded-[28px] border border-white bg-white p-4 shadow-[0_18px_46px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl', '成长页本月净得分卡顶层背景应使用白色。');
requireText(parentSource, 'rounded-[28px] border border-white bg-white p-4 shadow-[0_18px_46px_-36px_rgba(249,115,22,0.55)] backdrop-blur-xl', '成长页预估分红总额卡顶层背景应使用白色。');
forbidText(parentSource, 'bg-white/82', '成长页顶层卡片不应使用半透明白色背景。');
forbidText(parentSource, 'bg-white/92', '成长页顶层卡片不应使用半透明白色背景。');
forbidText(parentSource, 'bg-gradient-to-b from-orange-50/90 to-white/86', '成长页预估分红总额卡不应继续使用渐变背景。');
requireText(parentSource, '<section className="mx-5 mt-4 flex flex-col gap-3">', '成长页两个成长记录中心摘要卡片应上下排列，适配手机端窄屏阅读。');
forbidText(parentSource, '<section className="mx-5 mt-4 grid grid-cols-2 gap-3">\n        <article', '成长页两个摘要卡片不应继续左右并排展示。');
forbidText(parentSource, '<MainStudentTitleBar />\\n        <section className="mx-5 mt-4', '成长页不应继续使用旧的头像加姓名标题栏作为顶部学生展示。');
forbidText(parentSource, '<MainStudentTitleBar />\\n        <section className="px-5 pt-4 space-y-3">', '报告页顶部不应继续展示头像、姓名和下拉切换按钮。');
forbidText(parentSource, '<MainStudentTitleBar />\\n        <section className="mx-5 mt-4 grid grid-cols-2 gap-3">', '银行页顶部不应继续展示头像、姓名和下拉切换按钮。');
forbidText(parentSource, '<Header title="成长" />', '成长页不应再显示白底文字标题栏。');
forbidText(parentSource, '<Header title="报告" />', '报告页不应再显示白底文字标题栏。');
forbidText(parentSource, '<Header title="银行" />', '银行页不应再显示白底文字标题栏。');
requireText(parentSource, "student-switcher-card", '学生切换弹窗应使用信息卡片展示绑定学生。');
requireText(parentSource, "所在班级", '学生切换弹窗应展示所在班级字段。');
requireText(parentSource, "学号", '学生切换弹窗应展示学号字段。');
requireText(parentSource, "新增绑定", '学生切换弹窗应提供新增绑定入口。');
requireText(parentSource, "child.id === activeChildId ? '当前' : '切换'", '学生切换卡片应区分当前学生和可切换学生。');
requireText(parentSource, 'whitespace-nowrap', '学生切换弹窗班级和学号信息不应换行。');
forbidText(parentSource, "bg-slate-900 text-white border-slate-900", '学生切换弹窗当前卡片不应使用深色底。');
forbidText(parentSource, "border-[#FFC210]/70", '学生切换弹窗当前卡片不应继续使用家长端黄色描边，应改用教师端 token。');
forbidText(parentSource, "bg-[#FFF4CC] text-[#653C16]", '学生切换弹窗当前按钮不应继续使用家长端黄色体系，应改用教师端 token。');
forbidText(parentSource, "mt-1 text-[12px] font-medium text-slate-400 truncate'>{activeChild.className}", '顶部学生区域不应展示班级，应只展示头像、姓名和切换入口。');

const emojiPattern = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
for (const [name, source] of [['ParentApp.tsx', parentSource], ['App.tsx', appSource]]) {
  if (emojiPattern.test(source)) failures.push(`${name} 不应出现 emoji。`);
}

for (const required of ['绑定孩子', '学校编号', '学生姓名', '学生学号', '切换孩子', '新增绑定', '本月净得分', '稳步成长', '预估分红总额', '成长奖励', '得分奖励', '月度报告', '期末报告', '报告详情', '积分银行', '钱包', '存款', '签署新存单', '我的存单', '存钱计划', '存入金额', '签署存单', '确认签署这份存单?', '签署计划', '投入本金', '预期利息', '我再想想', '确认签署']) {
  requireText(parentSource, required, `家长手机端缺少核心流程文案：${required}`);
}
forbidText(parentSource, '请检查你的签署信息，确认后将扣除相应校园币。', '二次确认弹窗应简化页面，不展示解释性说明文案。');
requireText(parentSource, 'parent-bank-balance-strip', '银行页钱包和存款信息应弱化为一行紧凑信息条，给下方存钱计划留出更多空间。');
requireText(parentSource, 'parent-bank-balance-strip sticky top-0 z-30', '银行页钱包和存款金额应改为吸顶长条。');
requireText(parentSource, 'parent-bank-balance-strip sticky top-0 z-30 px-5 bg-white/70 backdrop-blur-xl', '银行页钱包和存款吸顶条高度应收敛到 40px，不应再叠加上下内边距。');
requireText(parentSource, 'flex h-10 items-center px-1 text-slate-600', '银行页钱包和存款金额不应继续使用胶囊容器，应改为平铺文字信息栏。');
requireText(parentSource, 'h-5 w-px bg-slate-200', '银行页钱包和存款长条中间应有低视觉权重分隔线。');
forbidText(parentSource, 'parent-bank-balance-strip sticky top-0 z-30 px-5 pt-4 pb-3 bg-white/70 backdrop-blur-xl', '银行页钱包和存款吸顶条不应继续使用 68px 高度，应压缩为 40px。');
forbidText(parentSource, 'rounded-[20px] border border-white bg-white px-4 text-slate-700', '银行页钱包和存款吸顶信息不应继续使用胶囊样式。');
forbidText(parentSource, 'flex h-12 items-center rounded-[20px] border border-white bg-gradient-to-r from-indigo-600 to-blue-600', '银行页钱包和存款吸顶长条不应使用蓝色渐变，避免和下方内容抢视觉重心。');
requireText(parentSource, 'parent-bank-action-tabs', '银行页签署新存单/我的存单切换应使用新的轻量动作入口样式。');
requireText(parentSource, "active ? 'border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 text-white", '银行页签署新存单/我的存单选中态应使用蓝色主风格。');
forbidText(parentSource, 'mx-5 mt-3 rounded-[24px] bg-slate-100/70 p-1.5 flex gap-1', '银行页签署新存单/我的存单不应继续使用旧的浅灰分段控件。');
requireText(parentSource, 'className="h-4 w-4 shrink-0"', '银行页钱包和存款金额应像货柜机一样在同一行配金币图标展示。');
requireText(parentSource, 'const formatCoin = (value: number) => value.toFixed(2);', '银行页钱包和存款金额应统一模拟两位小数。');
forbidText(parentSource, 'grid grid-cols-2 gap-3">\n          <div className="flex h-11 items-center justify-center gap-1.5 rounded-full', '银行页钱包和存款金额不应继续使用两个胶囊按钮样式。');
requireText(parentSource, "const PARENT_SCREEN_CLASS = 'relative flex-1 overflow-y-auto no-scrollbar bg-transparent';", '银行页弹窗需要脱离页面内容的低层级限制，避免被底部导航挡住。');
forbidText(parentSource, "const PARENT_SCREEN_CLASS = 'relative z-10 flex-1 overflow-y-auto no-scrollbar bg-transparent';", '页面滚动容器不应创建低于底部导航的 z-index 层级，否则弹窗会被底部导航遮挡。');
forbidText(parentSource, 'from-indigo-600/92 to-blue-600/92', '银行页存款胶囊不应使用比钱包更弱的背景色。');
forbidText(parentSource, 'from-orange-50 to-amber-100 p-4 border border-orange-100', '银行页可用货币不应继续使用大卡片展示。');
forbidText(parentSource, 'from-blue-50 to-indigo-100 p-4 border border-blue-100', '银行页银行存款不应继续使用大卡片展示。');

forbidText(parentSource, "{ key: 'week' as const, label: '本周' }", '成长页顶部改为成长记录中心两个板块后，不应继续展示周期筛选：本周。');
forbidText(parentSource, "{ key: 'month' as const, label: '本月' }", '成长页顶部改为成长记录中心两个板块后，不应继续展示周期筛选：本月。');
forbidText(parentSource, "{ key: 'term' as const, label: '本学期' }", '成长页顶部改为成长记录中心两个板块后，不应继续展示周期筛选：本学期。');
for (const removedGrowthText of ['表扬次数', '批评次数', '净积分', '最近评价']) {
  forbidText(parentSource, removedGrowthText, `成长页顶部改为成长记录中心两个板块后，不应继续展示：${removedGrowthText}`);
}

forbidText(parentSource, "type GrowthPeriod = 'week' | 'month' | 'term'", '成长页取消周期筛选后，不应继续定义周、月、学期筛选类型。');
forbidText(parentSource, "useState<GrowthPeriod>('week')", '成长页取消周期筛选后，不应继续维护默认本周状态。');
requireText(parentSource, 'createdAt', '评价记录应包含可筛选日期字段。');
forbidText(parentSource, 'visibleRecordCount', '成长页不展示最近评价后，不应继续维护滑动加载历史评价状态。');
forbidText(parentSource, 'handleGrowthScroll', '成长页不展示最近评价后，不应继续处理评价列表滚动加载。');
forbidText(parentSource, 'ParentFiveEducationRadar', '成长页已取消五育能力模型板块，不应继续渲染雷达图。');
forbidText(parentSource, 'student-virtual-avatar', '成长页已取消顶部学生信息大卡片，不应继续展示虚拟形象板块。');
forbidText(parentSource, 'bg-white/[0.32]', '成长页已取消顶部学生信息大卡片，不应保留玻璃卡片背景。');
forbidText(parentSource, 'from-[#2DD4BF] to-[#14B8A6]', '学生头像背景不应使用绿色或青绿色。');
forbidText(parentSource, 'tracking-[2px]">•••', '家长端标题栏不应手动画微信胶囊，模拟真实手机效果会自带原生控件。');

for (const tab of ["key: 'growth', label: '成长'", "key: 'reports', label: '报告'", "key: 'bank', label: '银行'"]) {
  requireText(parentSource, tab, `底部菜单缺少固定入口：${tab}`);
}

requireText(parentSource, 'const renderParentBottomNav = () =>', '家长端底部菜单应使用渲染函数保持 nav DOM 连续，避免局部组件重挂载导致滑块动画跳变。');
forbidText(parentSource, '<ParentBottomNav />', '家长端底部菜单不应以局部组件 JSX 方式渲染，否则每次父组件渲染都可能重挂载，和教师端交互差异很大。');
requireText(parentSource, '{showTabs && renderParentBottomNav()}', '家长端底部菜单应像教师端一样在当前 JSX 层直接渲染，保证滑块动画有连续的旧位置和新位置。');
requireText(parentSource, "import TeacherFluidGlassNav from '../mobile-app/components/TeacherFluidGlassNav';", '家长端底部菜单应复用教师手机端同款滑块组件。');
requireText(parentSource, "import '../mobile-app/styles/navigation.css';", '家长端底部菜单应复用教师手机端同款底部导航样式。');
requireText(parentSource, 'bg-white/20', '绑定页标题栏应使用透明毛玻璃底，让教师端渐变背景覆盖到标题栏。');
forbidText(parentSource, 'bg-white/90 px-4 py-2 backdrop-blur-xl', '绑定页接入教师端渐变背景后，标题栏不应继续用高不透明白底遮住背景。');
requireText(parentSource, 'ParentPageShell', '家长端页面应使用统一 ParentPageShell 背景和滚动容器。');
forbidText(parentSource, 'bg-[#FFC210] text-[#653C16]', '家长端新视觉不应继续使用黄色主按钮。');
forbidText(parentSource, 'parent-teacher-token-primary-button', '家长端新视觉不应继续依赖教师端主按钮 token。');
forbidText(parentSource, 'focus:border-[#F97316]', '绑定孩子页接入教师端 token 后，不应继续使用橙色聚焦边框。');
forbidText(parentSource, 'className="mt-6 w-full h-14 rounded-[18px] bg-[#FFC210] text-[#653C16]', '绑定孩子页试点接入教师端 token 后，完成绑定按钮不应继续使用家长端黄色主按钮。');
requireText(parentSource, 'ai-tabbar-container', '家长端底部菜单外壳应复刻教师端同款 ai-tabbar-container。');
forbidText(parentSource, 'tabbar-jelly-active-', '家长端底部菜单外层 class 应与教师端保持一致，不额外添加教师端没有的动效类。');
requireText(parentSource, 'const [parentNavActiveIndex, setParentNavActiveIndex] = useState(0);', '家长端底部菜单 activeIndex 应像教师端一样独立维护状态，避免滑块直接跳变。');
requireText(parentSource, "const [, setParentNavSlideDirection] = useState<'left' | 'right' | 'none'>('none');", '家长端底部菜单应复刻教师端切换方向状态节奏。');
requireText(parentSource, 'const parentTabbarRef = useRef<HTMLDivElement>(null);', '家长端底部菜单应像教师端一样测量底栏宽度，保证滑块动画对齐。');
requireText(parentSource, '}, [screen]);', '家长端底部菜单宽度测量应像教师端一样随当前页面变化重新执行。');
requireText(parentSource, 'setParentNavSlideDirection', '家长端底部菜单应复刻教师端先判断切换方向、再更新滑块位置的交互节奏。');
requireText(parentSource, 'tabbarWidth={parentTabbarWidth}', '家长端底部菜单应把实测宽度传给教师端液态滑块组件。');
requireText(parentSource, 'TeacherFluidGlassNav activeIndex={parentNavActiveIndex} itemCount={tabItems.length} jellyToggle={parentNavJellyToggle} tabbarWidth={parentTabbarWidth}', '家长端底部菜单应使用教师端同款浅灰滑块、果冻动画和宽度参数。');
requireText(parentSource, 'tabbar-item-btn', '家长端底部菜单按钮结构应复刻教师端同款。');
requireText(parentSource, 'tabbar-icon-wrap', '家长端底部菜单图标容器应复刻教师端同款。');
requireText(parentSource, 'tabbar-item-label', '家长端底部菜单文字样式应复刻教师端同款。');
forbidText(parentSource, 'parent-bottom-nav-shell', '家长端底部菜单不应再使用家长端原白色 Liquid Glass 外壳。');
forbidText(parentSource, 'ParentFluidGlassNav', '家长端底部菜单不应再使用家长端原 3D 白色玻璃导航。');
forbidText(parentSource, "bg-[#FFC210]/30", '家长端底部菜单选中态不应继续使用黄色块，应复刻教师端浅灰滑块。');



for (const bankText of ['活期存单', '定期存单', '单日利息', '到期利息', '到期时间', '取出']) {
  requireText(parentSource, bankText, `家长端银行操作应参考货柜机存单流程，缺少：${bankText}`);
}
requireText(parentSource, '<img src="/assets/coin.png" alt="" className="h-5 w-5 shrink-0" />\n                        <span>{deposit.amount}</span>', '我的存单列表本金金额应增加校园币 icon，和顶部资产金额表达保持一致。');
forbidText(parentSource, '>预计利息<', '银行页存入金额弹窗中该字段文案应改为“单日利息”。');
requireText(parentSource, "selectedBankScheme.type === 'current' ? '单日利息' : '到期利息'", '银行页存入金额弹窗中，活期应显示单日利息，所有定期应显示到期利息。');
requireText(parentSource, "const interestRate = scheme.type === 'current' ? scheme.dailyRate : scheme.dailyRate * scheme.days;", '银行页定期利息应按日利率乘以存期天数计算到期总利息。');
requireText(parentSource, "selectedBankScheme.type === 'current' ? 'bg-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'", '银行页存入金额弹窗签署按钮应跟随活期绿色、定期蓝色风格，不应使用黄色。');
forbidText(parentSource, 'onClick={submitDeposit} className="mt-4 w-full h-[52px] rounded-[18px] bg-[#FFC210] text-[#653C16]', '银行页存入金额弹窗签署按钮不应继续使用黄色按钮。');
requireText(parentSource, "deposit.type === 'current' ? 'bg-gradient-to-r from-emerald-500 to-teal-600", '我的存单列表取出按钮应使用活期绿色渐变，和其他主按钮保持一致的渐变质感。');
requireText(parentSource, "'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.75)]'", '我的存单列表定期取出按钮应继续使用蓝色渐变。');
forbidText(parentSource, "deposit.type === 'current' ? 'bg-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'", '我的存单列表活期取出按钮不应继续使用纯绿色，应改为绿色渐变。');
forbidText(parentSource, 'onClick={() => setWithdrawTarget(deposit)} className="mt-4 w-full h-12 rounded-[18px] bg-[#FFC210] text-[#653C16]', '我的存单列表取出按钮不应继续使用黄色按钮。');
requireText(parentSource, 'const [showDepositReview, setShowDepositReview] = useState(false);', '点击签署存单后应先展示二次确认弹窗。');
requireText(parentSource, 'onClick={() => setShowDepositReview(true)}', '存入金额弹窗里的签署存单按钮应打开二次确认，而不是直接签署。');
requireText(parentSource, 'showDepositReview && selectedBankScheme', '二次确认弹窗应基于当前选择的存单展示。');
requireText(parentSource, 'onClick={submitDeposit}', '二次确认弹窗中的确认签署按钮才执行真正签署。');
requireText(parentSource, 'setShowDepositReview(false);', '签署成功或取消时应关闭二次确认弹窗。');

requireText(parentSource, 'const PARENT_BANK_TERMS', '家长端银行存钱计划应收敛为独立配置，避免在页面里散落写死。');
requireText(parentSource, '<div className="space-y-2">', '家长端银行存钱计划应纵向排列，一行一个。');
requireText(parentSource, 'setSelectedBankScheme(scheme); setShowDepositConfirm(true);', '点击存钱计划后应打开存入金额弹窗，而不是只在页面内选中。');
requireText(parentSource, 'productName: \'定期30天\'', '存钱计划卡片应提供产品名称字段，例如定期30天。');
requireText(parentSource, 'termLabel: \'30天\'', '存钱计划卡片应提供存期字段，例如30天。');
requireText(parentSource, '{scheme.productName}', '存钱计划卡片应展示产品名称。');
requireText(parentSource, '存期 {scheme.termLabel}', '存钱计划卡片应展示存期。');
requireText(parentSource, '日利率 {formatDailyRate(scheme.dailyRate)}', '存钱计划卡片应展示日利率。');
requireText(parentSource, '{selectedBankScheme.productName} · 存期 {selectedBankScheme.termLabel} · 日利率 {formatDailyRate(selectedBankScheme.dailyRate)}', '存入金额弹窗应展示当前选择的产品、存期和日利率。');
requireText(parentSource, "isCurrent ? 'border-emerald-500 bg-emerald-50' : 'border-[#5886EF] bg-[#EEF3FF]'", '存钱计划应区分活期和定期：活期用绿色，定期用蓝色。');
requireText(parentSource, "isCurrent ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'", '存钱计划日利率标签应区分活期绿色和定期蓝色。');
requireText(parentSource, 'const CURRENT_DEPOSIT_PROJECTION_DAYS = [7, 30, 60, 90];', '活期弹窗应展示 7天、30天、60天、90天后的收益预估。');
requireText(parentSource, "selectedBankScheme.type === 'current' &&", '活期收益预估只应在活期弹窗里展示。');
requireText(parentSource, '活期收益预估', '活期弹窗应展示收益预估标题。');
forbidText(parentSource, '对比定期更划算', '活期收益预估模块不应显示“对比定期更划算”提示。');
requireText(parentSource, 'CURRENT_DEPOSIT_PROJECTION_DAYS.map(days =>', '活期弹窗应按多个存期展示收益预估。');
requireText(parentSource, '(amount * BANK_CONFIG.DAILY_RATE * days).toFixed(2)', '活期收益预估应基于存入金额、活期日利率和天数计算。');
forbidText(parentSource, '<div className="grid grid-cols-2 gap-3">\n                {PARENT_BANK_TERMS.map', '家长端银行存钱计划不应继续使用两列卡片。');
for (const planText of ['活期存单', '日利率0.03%', '定期存单-7天', '日利率0.1%', '定期存单-30天', '日利率0.15%', '定期存单-60天', '日利率0.3%', '定期存单-90天', '日利率0.5%', '定期存单-180天', '日利率0.8%']) {
  if (planText.startsWith('日利率')) {
    const rateValue = planText.replace('日利率', '').replace('%', '');
    const expectedRate = Number(rateValue) / 100;
    if (expectedRate === 0.0003) {
      requireText(parentSource, 'dailyRate: BANK_CONFIG.DAILY_RATE', `家长端银行存钱计划缺少：${planText}`);
    } else {
      requireText(parentSource, `dailyRate: ${expectedRate}`, `家长端银行存钱计划缺少：${planText}`);
    }
  } else {
    requireText(parentSource, `label: '${planText}'`, `家长端银行存钱计划缺少：${planText}`);
  }
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

requireText(parentSource, "useState<Screen>('binding')", '家长手机端打开后应直接进入绑定孩子页面。');
forbidText(parentSource, "useState<Screen>('login')", '家长手机端不应先进入微信授权登录页面。');





for (const extraNoise of ['家校共育成长账户', '授权后可查看成长评价、月度报告、期末报告和积分银行信息。', '仅用于家长身份确认和学生信息展示，不会公开孩子个人数据。', '选择已绑定孩子，或继续绑定孩子', '第一步：', '第二步：']) {
  forbidText(parentSource, extraNoise, `家长端页面仍有可删除的说明或步骤噪音：${extraNoise}`);
}

requireText(parentSource, 'indicatorPath', '家长端演示数据仍应保留五育三级指标结构，供后续详情页使用。');
forbidText(parentSource, 'record.indicatorPath.map', '成长页不展示最近评价后，不应继续渲染三级指标路径列表。');
forbidText(parentSource, 'record.content', '成长页不展示最近评价后，不应继续渲染老师评语列表。');
forbidText(parentSource, '评价老师：{record.teacher}', '成长页不展示最近评价后，不应继续展示评价老师。');
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
requireText(appSource, '家长-手机端', 'DEMO 环境切换面板应展示家长端手机入口。');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent campus growth app assertions passed');
