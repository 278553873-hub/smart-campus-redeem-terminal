import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("type ParentPageKey = 'wechatCard' | 'login' | 'bindSelf' | 'bindInvite' | 'parentIdentity' | 'landing';", '家长端应有独立页面路径类型。');
requireText("wechatCard: { number: '00', title: '收到卡片' }", '页面地图应包含 00 收到卡片。');
requireText("login: { number: '01', title: '微信登录' }", '页面地图应包含 01 微信登录。');
requireText("bindSelf: { number: '02', title: '绑定学生（自主）' }", '页面地图应包含 02 自主绑定。');
requireText("bindInvite: { number: '03', title: '绑定学生（班级邀请）' }", '页面地图应包含 03 班级邀请绑定。');
requireText("parentIdentity: { number: '04', title: '绑定提醒' }", '页面地图应包含 04 绑定提醒。');
requireText("landing: { number: '05', title: '落地页' }", '页面地图应包含 05 落地页。');
requireText("title: '自主登录'", '家长端页面地图应包含自主登录流程。');
requireText("title: '被邀请'", '家长端页面地图应包含被邀请流程。');
requireText("source: 'login'", '自主登录流程应从 01 微信登录开始分流。');
requireText("text: '未绑定任何学生'", '01 后应展示未绑定任何学生分支。');
requireText("page: 'bindSelf'", '未绑定任何学生应进入 02 自主绑定。');
requireText("{ text: '已绑定任何学生', pages: [{ page: 'landing' }] }", '01 到 05 的分支线应展示已绑定任何学生。');
requireText("source: 'wechatCard'", '被邀请流程应从 00 收到卡片开始分流。');
requireText("text: '未绑定该班级的任意学生'", '00 后应展示未绑定该班级的任意学生分支。');
requireText("page: 'bindInvite'", '未绑定该班级任意学生应进入 03 班级邀请绑定。');
requireText("{ text: '已绑定该班级的任意学生', pages: [{ page: 'landing' }] }", '00 到 05 的分支线应展示已绑定该班级的任意学生。');
requireText("text: '授权手机与班主任录入的手机一致'", '02/03 后应展示授权手机一致分支。');
requireText("text: '授权手机与班主任录入的手机不一致'", '02/03 后应展示授权手机不一致分支。');
requireText("pages: [{ page: 'landing' }]", '授权手机一致时应直接进入 05 落地页。');
requireText("pages: [{ page: 'parentIdentity' }, { page: 'landing' }]", '授权手机不一致时应进入 04 后再进入 05。');
requireText('lane.branches.map((branch)', '页面地图应渲染被邀请流程分支。');
requireText("const [activeParentDirectoryNodeKey, setActiveParentDirectoryNodeKey] = useState('被邀请-source-wechatCard');", '页面地图选中态应记录到具体节点实例。');
requireText('const sourceNodeKey = `${lane.title}-source-${lane.source}`;', '分支源节点应生成独立选中 key。');
requireText('onClick={() => jumpToParentPage(lane.source, sourceNodeKey)}', '分支源节点点击应按节点实例选中。');
requireText('const renderParentFlowNodes = (nodes: ParentFlowNode[], keyPrefix: string): React.ReactNode =>', '页面地图应支持嵌套分支节点。');
requireText('const nodeKey = `${keyPrefix}-${node.page}`;', '分支目标节点应生成独立选中 key。');
requireText('onClick={() => jumpToParentPage(node.page, nodeKey)}', '分支目标节点点击应按节点实例选中。');
requireText('素养指南针', '家长端小程序名称应为素养指南针。');
requireText('郭老师邀请你绑定学生', '微信卡片应从老师邀请家长绑定学生开始。');
requireText("const parentCanBind = Boolean((isParentInviteBinding || parentPrimaryCode.trim()) && parentBindForm.studentName.trim() && parentBindForm.studentNo.trim());", '绑定按钮应按自主/邀请不同规则激活。');
requireText("{(isParentInviteBinding || parentPrimaryCode.trim()) && (", '02 编号输入后或 03 邀请路径应展示姓名和学号。');
requireText('showParentWechatPhoneSheet', '家长端微信授权登录后应展示微信原生手机号授权弹窗。');
requireText("onClick={() => setShowParentWechatPhoneSheet(true)}", '家长端 01 微信授权登录应先打开授权弹窗。');
requireText('const renderParentWechatPhoneSheet = () =>', '家长端应复刻微信手机号授权弹窗。');
requireText('申请获取并验证你的手机号', '家长端微信授权弹窗应复用微信手机号授权标题。');
requireText('用户正常进行授权登录', '家长端微信授权弹窗应复用授权说明。');
requireText('上次提供', '家长端微信授权弹窗应展示上次提供号码状态。');
requireText('不允许', '家长端微信授权弹窗应提供拒绝入口。');
requireText('管理号码', '家长端微信授权弹窗应提供管理号码入口。');
requireText("setShowParentWechatPhoneSheet(false);\n      jumpToParentPage('bindSelf');", '家长端选择手机号后应关闭弹窗并进入 02 自主绑定。');
requireText("onClick={() => jumpToParentPage('bindInvite')}", '收到卡片后应进入 03 班级邀请绑定。');
requireText("if (parentCanBind) jumpToParentPage('parentIdentity');", '低保真页面应模拟后台手机号不一致时进入 04 绑定提醒。');
requireText('const renderParentIdentity = () =>', '家长端应新增绑定提醒页。');
requireText('为了切实守护每位学生的信息安全与隐私权，请您仔细核实并确认信息，仅允许绑定自己孩子的账号，感谢您的配合。', '绑定提醒页应使用友好且明确的隐私安全文案。');
requireText('您的家长身份', '绑定提醒页应先展示家长身份。');
requireText('您的联系手机', '绑定提醒页应展示联系手机。');
requireText("parentMaskedPhone", '联系人手机应使用中间四位脱敏展示。');
requireText('当前授权手机', '联系人手机应标明来自当前授权手机。');
requireText("const parentIdentityRelationOptions: ParentIdentityRelation[] = ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];", '家长身份应包含完整下拉选项。');
requireText("aria-label=\"选择家长关系\"", '家长身份下拉只选择关系，不应把学生姓名放进选项。');
requireText("parentIdentityForm.relation === '其他'", '选择其他时应展示文本输入。');
requireText('返回修改', '绑定提醒页应提供返回修改入口。');
requireText('确认绑定', '绑定提醒页应提供明确主按钮。');
requireText("if (parentIdentityComplete) jumpToParentPage('landing');", '家长信息确认完成后应进入 05 落地页。');
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
if (parentDirectoryBlock.includes('const active = branch.pages.includes(parentPage)') || parentDirectoryBlock.includes('const pageActive = parentPage === pageKey')) {
  failures.push('页面地图分支节点选中态应按节点实例判断，不能按相同页面批量高亮。');
}
const parentLandingStart = source.indexOf('const renderParentLanding');
const parentLandingEnd = source.indexOf('const renderParentPrototype', parentLandingStart);
const parentLandingBlock = source.slice(parentLandingStart, parentLandingEnd);
if (parentLandingBlock.includes('bg-[#F7FBFC]') || parentLandingBlock.includes('blur-3xl') || parentLandingBlock.includes('bg-cyan') || parentLandingBlock.includes('bg-emerald') || parentLandingBlock.includes('bg-rose')) {
  failures.push('05 落地页应保持低保真灰白风格，不应使用渐变或氛围背景。');
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
if (parentLoginBlock.includes("jumpToParentPage('bindSelf')")) {
  failures.push('家长端 01 微信登录不应点击按钮后直接进入 02，应先展示微信授权弹窗。');
}

const parentBindingStart = source.indexOf('const renderParentBinding');
const parentBindingEnd = source.indexOf('const renderParentIdentity', parentBindingStart);
const parentBindingBlock = source.slice(parentBindingStart, parentBindingEnd);
if (parentBindingBlock.includes('手机号校验') || parentBindingBlock.includes('parentPhoneMatchesTeacher')) {
  failures.push('02/03 绑定页应模拟真实页面，不展示手机号校验一致/不一致开关。');
}

const parentIdentityStart = source.indexOf('const renderParentIdentity');
const parentIdentityEnd = source.indexOf('const renderParentLanding', parentIdentityStart);
const parentIdentityBlock = source.slice(parentIdentityStart, parentIdentityEnd);
if (parentIdentityBlock.includes('aria-label="家长手机"') || parentIdentityBlock.includes('readOnly')) {
  failures.push('联系人手机不应使用文本输入框样式，应作为只读信息展示。');
}
if (parentIdentityBlock.includes('该手机号将作为')) {
  failures.push('绑定提醒页不应展示“该手机号将作为...”说明文案。');
}
if (parentIdentityBlock.includes('请核实孩子信息') || parentIdentityBlock.includes('如果当前不是您的孩子，请联系班主任进行处理。') || parentIdentityBlock.includes('<Shield size={16} />')) {
  failures.push('绑定提醒页不应再展示底部核实提示块。');
}
if (parentIdentityBlock.includes('span className="truncate">{parentStudentName}的</span>') && parentIdentityBlock.includes('border border-gray-200 bg-white px-3 text-sm font-normal')) {
  const studentPrefixStart = parentIdentityBlock.indexOf('span className="truncate">{parentStudentName}的</span>');
  const selectStart = parentIdentityBlock.indexOf('<select', studentPrefixStart);
  const prefixBlock = parentIdentityBlock.slice(studentPrefixStart, selectStart);
  if (prefixBlock.includes('border') || prefixBlock.includes('bg-white')) {
    failures.push('学生姓名前缀是只读信息，不应使用输入框边框或白底样式。');
  }
}
const phoneLabelIndex = parentIdentityBlock.indexOf('您的联系手机');
const phoneBlockEnd = parentIdentityBlock.indexOf('<div className="space-y-2 pt-3">', phoneLabelIndex);
const phoneBlock = parentIdentityBlock.slice(phoneLabelIndex, phoneBlockEnd);
if (phoneBlock.includes('input') || phoneBlock.includes('border border-gray-200')) {
  failures.push('联系手机是只读信息，不应使用输入框或边框样式。');
}
if (parentIdentityBlock.includes('<option key={relation} value={relation}>{parentStudentName}的{relation}</option>')) {
  failures.push('家长身份下拉选项不应包含学生姓名，只展示关系。');
}
if (parentIdentityBlock.indexOf('您的家长身份') > parentIdentityBlock.indexOf('您的联系手机')) {
  failures.push('绑定提醒页应先展示您的家长身份，再展示您的联系手机。');
}
if (!parentIdentityBlock.includes('space-y-2 pt-3')) {
  failures.push('返回和确认按钮应上下排列，形成更清晰的 CTA 层级。');
}
if (parentIdentityBlock.indexOf('返回修改') > parentIdentityBlock.indexOf('确认绑定')) {
  failures.push('绑定提醒页底部应先提供返回修改，再提供确认绑定。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi parent compass assertions passed');
