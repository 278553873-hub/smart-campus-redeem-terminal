import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("type ParentPageKey = 'wechatCard' | 'login' | 'bindSelf' | 'bindInvite' | 'landing';", '家长端应有独立页面路径类型。');
requireText("wechatCard: { number: '00', title: '收到卡片' }", '页面地图应包含 00 收到卡片。');
requireText("login: { number: '01', title: '微信登录' }", '页面地图应包含 01 微信登录。');
requireText("bindSelf: { number: '02', title: '绑定学生（自主）' }", '页面地图应包含 02 自主绑定。');
requireText("bindInvite: { number: '03', title: '绑定学生（班级邀请）' }", '页面地图应包含 03 班级邀请绑定。');
requireText("landing: { number: '04', title: '落地页' }", '页面地图应包含 04 落地页。');
requireText("title: '自主登录'", '家长端页面地图应包含自主登录流程。');
requireText("title: '被邀请'", '家长端页面地图应包含被邀请流程。');
requireText("source: 'wechatCard'", '被邀请流程应从 00 收到卡片开始分流。');
requireText("{ text: '未绑定该班级的任意学生', page: 'bindInvite' }", '00 到 03 的分支线应展示未绑定该班级的任意学生。');
requireText("{ text: '已绑定该班级的任意学生', page: 'landing' }", '00 到 04 的分支线应展示已绑定该班级的任意学生。');
requireText('lane.branches.map((branch)', '页面地图应渲染被邀请流程分支。');
requireText("onClick={() => jumpToParentPage(lane.source)}", '被邀请流程的 00 收到卡片应作为分支源节点。');
requireText('素养指南针', '家长端小程序名称应为素养指南针。');
requireText('郭老师邀请你绑定学生', '微信卡片应从老师邀请家长绑定学生开始。');
requireText("const parentCanBind = Boolean((isParentInviteBinding || parentPrimaryCode.trim()) && parentBindForm.studentName.trim() && parentBindForm.studentNo.trim());", '绑定按钮应按自主/邀请不同规则激活。');
requireText("{(isParentInviteBinding || parentPrimaryCode.trim()) && (", '02 编号输入后或 03 邀请路径应展示姓名和学号。');
requireText("onClick={() => jumpToParentPage('bindSelf')}", '微信登录后应进入 02 自主绑定。');
requireText("onClick={() => jumpToParentPage('bindInvite')}", '收到卡片后应进入 03 班级邀请绑定。');
requireText("if (parentCanBind) jumpToParentPage('landing');", '完成绑定后应进入 04 落地页。');
requireText('邀请班级', '03 班级邀请绑定应展示自动带入的班级信息。');
requireText('{isParentInviteBinding ? (', '03 班级邀请绑定不应展示可编辑编号输入框。');
requireText('const renderParentLanding', '家长端应新增落地页原型。');
requireText('CheckCircle2,', '落地页表扬图标应从 lucide-react 正确导入。');
requireText('Clock,', '落地页待改进图标应从 lucide-react 正确导入。');
requireText('本月净得分', '落地页应复刻成长页的本月净得分卡。');
requireText('预估分红总额', '落地页应复刻成长页的预估分红卡。');
requireText("['成长', '报告', '银行']", '落地页应保留成长页底部三栏导航。');
requireText('showParentChildSwitcherSheet', '落地页切换孩子应有独立弹窗状态。');
requireText('const renderParentChildSwitcherSheet', '落地页应提供切换孩子底部弹窗。');
requireText('const addBinding = () =>', '新增绑定应先关闭弹窗再跳转。');
requireText("jumpToParentPage('bindSelf');", '新增绑定应跳转到 02 绑定学生（自主）。');
requireText('切换孩子', '切换孩子弹窗应复刻截图标题。');
requireText('新增绑定', '切换孩子弹窗应提供新增绑定入口。');

if (source.includes('parentClosureNode')) {
  failures.push('页面地图不应新增“闭环”流程。');
}
const parentDirectoryStart = source.indexOf('const renderParentPageDirectory');
const parentDirectoryEnd = source.indexOf('const renderSurfaceTabs', parentDirectoryStart);
const parentDirectoryBlock = source.slice(parentDirectoryStart, parentDirectoryEnd);
if (parentDirectoryBlock.includes('node.desc') || parentDirectoryBlock.includes('mt-1 block text-[11px]')) {
  failures.push('页面地图节点只展示标题，不应展示说明文字。');
}
const parentLandingStart = source.indexOf('const renderParentLanding');
const parentLandingEnd = source.indexOf('const renderParentPrototype', parentLandingStart);
const parentLandingBlock = source.slice(parentLandingStart, parentLandingEnd);
if (parentLandingBlock.includes('bg-[#F7FBFC]') || parentLandingBlock.includes('blur-3xl') || parentLandingBlock.includes('bg-cyan') || parentLandingBlock.includes('bg-emerald') || parentLandingBlock.includes('bg-rose')) {
  failures.push('04 落地页应保持低保真灰白风格，不应使用渐变或氛围背景。');
}
const parentSwitcherStart = source.indexOf('const renderParentChildSwitcherSheet');
const parentSwitcherEnd = source.indexOf('const renderParentPrototype', parentSwitcherStart);
const parentSwitcherBlock = source.slice(parentSwitcherStart, parentSwitcherEnd);
if (parentSwitcherBlock.includes('text-[25px]') || parentSwitcherBlock.includes('text-[23px]') || parentSwitcherBlock.includes('h-16 w-16') || parentSwitcherBlock.includes('h-[72px]') || parentSwitcherBlock.includes('text-[24px]')) {
  failures.push('切换孩子弹窗应与 C 端低保真字号和尺寸一致，不能使用正式稿大字号大按钮。');
}
requireText("className=\"mt-4 flex min-h-14 items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3\"", '切换孩子弹窗列表项应使用 C 端低保真紧凑列表规格。');
requireText('2025级1班 · 20250101', '切换孩子弹窗学生信息应合并为紧凑低保真信息行。');
requireText("className=\"h-10 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 active:bg-gray-50\"", '切换孩子按钮应使用低保真小按钮规格。');
requireText("className=\"mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white active:bg-gray-700\"", '新增绑定按钮应使用 C 端低保真主按钮规格。');

const parentLoginStart = source.indexOf('const renderParentLogin');
const parentLoginEnd = source.indexOf('const renderParentBinding', parentLoginStart);
const parentLoginBlock = source.slice(parentLoginStart, parentLoginEnd);
if (parentLoginBlock.includes('手机号登录') || parentLoginBlock.includes('密码登录')) {
  failures.push('家长端 01 微信登录不应展示手机号或密码登录入口。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi parent compass assertions passed');
