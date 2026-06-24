import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("type ParentPageKey = 'wechatCard' | 'login' | 'bindSelfMatched' | 'bindSelfUnmatched' | 'bindInviteMatched' | 'bindInviteUnmatched' | 'bindInviteBoundUnmatched' | 'bindingLimitNotice' | 'bindingTotalLimitNotice' | 'bindingNotice' | 'parentIdentity' | 'landing';", '家长端被邀请手机号未匹配应按班级已绑定数量进入 03B/03C/04B，且总量已满进入 04C。');
requireText("wechatCard: { number: '00', title: '收到卡片' }", '页面地图应包含 00 收到卡片。');
requireText("login: { number: '01', title: '微信登录' }", '页面地图应包含 01 微信登录。');
requireText("bindSelfMatched: { number: '03A', title: '绑定学生' }", '自主和被邀请手机号匹配成功页面无差异，应统一展示为 03A 绑定学生。');
requireText("bindSelfUnmatched: { number: '02B', title: '手机号未匹配' }", '页面地图应包含 02B 手机号未匹配。');
requireText("bindInviteMatched: { number: '03A', title: '绑定学生' }", '页面地图应包含 03A 绑定学生。');
requireText("bindInviteUnmatched: { number: '03B', title: '绑定学生' }", '页面地图应包含 03B 绑定学生。');
requireText("bindInviteBoundUnmatched: { number: '03C', title: '绑定学生' }", '页面地图应包含 03C 绑定学生。');
requireText("bindingLimitNotice: { number: '04B', title: '绑定提醒' }", '页面地图应包含 04B 绑定提醒。');
requireText("bindingTotalLimitNotice: { number: '04C', title: '绑定提醒' }", '页面地图应包含 04C 总量已满绑定提醒。');
requireText("bindingNotice: { number: '04A', title: '绑定提醒' }", '页面地图应包含 04A 绑定提醒。');
requireText("parentIdentity: { number: '04', title: '绑定确认' }", '页面地图保留历史 04 绑定确认。');
requireText("landing: { number: '05', title: '落地页' }", '页面地图应包含 05 落地页。');
requireText("title: '自主登录'", '家长端页面地图应包含自主登录流程。');
requireText("title: '被邀请'", '家长端页面地图应包含被邀请流程。');
requireText("title: '自主新增绑定'", '家长端页面地图应包含自主新增绑定流程。');
requireText("source: 'login'", '自主登录流程应从 01 微信登录开始分流。');
requireText("source: 'wechatCard'", '被邀请流程应从 00 收到卡片开始分流。');
requireText("source: 'landing'", '自主新增绑定流程应从 05 落地页开始分流。');
requireText("text: '手机号匹配成功&有新增绑定'", '自主登录 01 后应展示手机号匹配成功且有新增绑定分支。');
requireText("text: '手机号未匹配'", '自主登录 01 后应展示手机号未匹配分支。');
requireText("{ text: '手机号匹配成功&无新增绑定', pages: [{ page: 'landing' }] }", '自主登录手机号匹配成功且无新增绑定时应直接进入 05。');
requireText("pages: [{ page: 'bindSelfMatched' }, { page: 'landing' }]", '自主手机号匹配成功后应在 03A 确认并进入 05。');
requireText("pages: [{ page: 'bindSelfUnmatched' }]", '自主手机号未匹配时应停留在 02B 提示页。');
requireText("text: '未登录打开'", '被邀请流程应先从 00 收到卡片进入 01 微信登录。');
requireText("page: 'login',\n          branches: [", '被邀请流程的三条分支应挂在 01 微信登录节点下。');
requireText("{ text: '手机号匹配成功&有新增绑定', pages: [{ page: 'bindInviteMatched' }, { page: 'landing' }] }", '被邀请手机号匹配成功且有新增绑定时应从 01 微信登录进入 03A 后到 05。');
requireText("{ text: '手机号匹配成功&无新增绑定', pages: [{ page: 'landing' }] }", '被邀请手机号匹配成功且无新增绑定时应从 01 微信登录直接到 05 落地页。');
requireText("{ text: '手机号未匹配成功&未绑定该班级的任意学生', pages: [{ page: 'bindInviteUnmatched' }, { page: 'bindingNotice' }, { page: 'landing' }] }", '被邀请手机号未匹配且未绑定该班级任意学生应从 01 进入 03B。');
requireText("{ text: '手机号未匹配成功&已绑定该班级的任意学生', pages: [{ page: 'bindInviteBoundUnmatched' }, { page: 'bindingNotice' }, { page: 'landing' }] }", '被邀请手机号未匹配且已绑定该班级任意学生应从 01 进入 03C。');
requireText("{ text: '手机号未匹配成功&已绑定该班级的2个学生', pages: [{ page: 'bindingLimitNotice' }, { page: 'landing' }] }", '被邀请手机号未匹配且该班已绑定 2 个学生应进入 04B 满额提醒。');
requireText("{ text: '已绑定3名学生&继续新增', pages: [{ page: 'bindingTotalLimitNotice' }, { page: 'landing' }] }", '被邀请授权后若总量已满，应进入 04C。');
requireText("{ text: '点击新增绑定&绑定学生数<3', pages: [{ page: 'bindSelfUnmatched' }] }", '自主新增绑定学生数小于 3 时应直接进入 02B 提示页。');
requireText("{ text: '点击新增绑定&绑定学生数≧3', pages: [{ page: 'bindingTotalLimitNotice' }, { page: 'landing' }] }", '05 落地页新增绑定学生数大于等于 3 时应进入 04C。');
requireText('lane.branches.map((branch)', '页面地图应渲染被邀请流程分支。');
requireText("const [activeParentDirectoryNodeKey, setActiveParentDirectoryNodeKey] = useState('被邀请-source-wechatCard');", '页面地图仍应记录节点来源，用于来源感知返回。');
requireText("const [parentBindingReturnPage, setParentBindingReturnPage] = useState<ParentPageKey>('login');", '家长端未匹配页应记录返回目标，不能固定返回登录。');
requireText("const [parentBindingNoticeBackPage, setParentBindingNoticeBackPage] = useState<ParentPageKey>('login');", '04A 绑定提醒页应记录上一级页面。');
requireText('const sourceNodeKey = `${lane.title}-source-${lane.source}`;', '分支源节点应生成独立选中 key。');
requireText('onClick={() => jumpToParentPage(lane.source, sourceNodeKey)}', '分支源节点点击应记录来源信息。');
requireText('const renderParentFlowNodes = (nodes: ParentFlowNode[], keyPrefix: string): React.ReactNode =>', '页面地图应支持嵌套分支节点。');
requireText('const nodeKey = `${keyPrefix}-${node.page}`;', '分支目标节点应生成独立选中 key。');
requireText('onClick={() => jumpToParentPage(node.page, nodeKey)}', '分支目标节点点击应记录来源信息。');
requireText('const isSameParentDirectoryPage = (pageA: ParentPageKey, pageB: ParentPageKey) =>', '页面地图应支持同一页面实体的等价高亮。');
requireText("page === 'bindSelfMatched' || page === 'bindInviteMatched' ? 'matchedBinding' : page", '03A 绑定学生的自主/邀请入口应视为同一个页面实体。');
requireText('const active = isSameParentDirectoryPage(parentPage, node.page);', '页面地图里同一页面实体节点应同时选中。');
requireText('const sourceActive = isSameParentDirectoryPage(parentPage, lane.source);', '页面地图源节点应按当前页面实体选中。');
requireText('className="flex w-fit max-w-[180px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500"', '嵌套分支标签不应使用过宽固定最小宽度，避免 01 微信登录卡片和箭头间距过大。');
if (source.includes('min-w-[152px]')) {
  failures.push('页面地图分支标签不应使用固定最小宽度，避免箭头和右侧卡片间距不一致。');
}
requireText('素养指南针', '家长端小程序名称应为素养指南针。');
requireText('const renderParentPrdPanel = () => (\n    <aside className="min-h-[60dvh] w-full min-w-0 overflow-y-auto border-t border-gray-200 bg-gray-50 xl:h-full xl:min-h-0 xl:flex-1 xl:border-l xl:border-t-0">', 'Codex 侧边栏窄视口下，家长端页面导航地图和 PRD 不应被 lg:hidden 隐藏，应在原型下方可滚动查看。');
requireText('郭老师邀请你绑定学生', '微信卡片应从老师邀请家长绑定学生开始。');
requireText("setParentLoginTarget('bindInviteMatched'); setParentBindMode('class'); jumpToParentPage('login');", '收到邀请卡片后应先进入微信登录授权并记录被邀请模式。');
requireText('const parentMatchedStudentCandidates: ParentBindingProfile[] = [', '家长端应支持一个手机号匹配多个可绑定学生。');
requireText("const matchedParentStudents = parentMatchedStudentCandidates.filter((student) => student.reservedPhone === parentIdentityForm.phone);", '家长端应按授权手机号匹配可绑定学生候选。');
requireText("const parentStudentMaskedName = parentStudentName;", '匹配成功和确认页按需求展示学生全名。');
requireText('showParentWechatPhoneSheet', '家长端微信授权登录后应展示微信原生手机号授权弹窗。');
requireText("onClick={() => setShowParentWechatPhoneSheet(true)}", '家长端 01 微信授权登录应先打开授权弹窗。');
requireText('const renderParentWechatPhoneSheet = () =>', '家长端应复刻微信手机号授权弹窗。');
requireText('申请获取并验证你的手机号', '家长端微信授权弹窗应复用微信手机号授权标题。');
requireText('用户正常进行授权登录', '家长端微信授权弹窗应复用授权说明。');
requireText('上次提供', '家长端微信授权弹窗应展示上次提供号码状态。');
requireText('不允许', '家长端微信授权弹窗应提供拒绝入口。');
requireText('管理号码', '家长端微信授权弹窗应提供管理号码入口。');
requireText("const allowPhone = (phone: string, result: 'matchedWithNewBinding' | 'matchedWithoutNewBinding' | 'unmatchedLimit' | 'totalLimit' = 'matchedWithNewBinding') =>", '家长端选择不同手机号应能进入不同匹配结果和总量已满结果。');
requireText("jumpToParentPage(target);", '家长端选择手机号后应关闭弹窗并进入当前入口对应的匹配结果页。');
requireText("result === 'matchedWithoutNewBinding'\n          ? 'landing'", '被邀请手机号匹配成功但无新增绑定时应从授权弹窗直接进入 05。');
requireText("result === 'totalLimit'\n            ? 'bindingTotalLimitNotice'", '授权后发现家长已绑定 3 名学生且继续新增时应进入 04C。');
requireText("onClick={() => allowPhone('18800005566', 'matchedWithoutNewBinding')}", '授权弹窗应提供可点击入口演示无新增绑定直达 05。');
requireText("onClick={() => allowPhone('19900008610', 'unmatchedLimit')}", '被邀请授权弹窗应能演示该班已绑定 2 个学生的 04B 分支。');
requireText("onClick={() => allowPhone('17700003333', 'totalLimit')}", '授权弹窗应能演示家长总量已满的 04C 分支。');
requireText("setParentBindingNoticeBackPage(target);", '04A 绑定提醒页返回应回到进入 04A 前的页面。');
requireText("if (parentIdentityComplete) jumpToParentPage('landing');", '手机号匹配成功页应直接确认进入 05。');
requireText('const continueParentBindingFlow = () => {', '03A 应抽象确认当前学生后的继续流程。');
requireText("if (parentIdentityForm.phone === '17700003333') {\n                      jumpToParentPage('bindingTotalLimitNotice');", '03A 确认绑定时应校验家长总量已满并进入 04C。');
requireText("if (hasNextParentMatchedStudent) {", '03A 处理当前学生后应优先进入下一个学生。');
requireText("jumpToParentPage('landing');", '03A 所有学生处理完后才进入 05 落地页。');
requireText('不是我的孩子', '03A 应提供“不是我的孩子”作为当前学生的否定判断入口。');
requireText('showParentMismatchConfirmSheet', '03A 点击不是我的孩子应展示二次确认弹窗。');
requireText('确认不是你的孩子？', '03A 不是我的孩子二次确认应明确标题。');
requireText('将不绑定当前学生，请确认是否继续。', '03A 不是我的孩子二次确认应使用单句通用文案。');
requireText('取消', '03A 不是我的孩子二次确认应提供取消入口。');
requireText('{normalizedParentMatchedStudentIndex + 1}/{parentMatchedStudents.length}', '匹配成功页应展示多个学生确认进度。');
requireText("className=\"mb-3 text-center text-xs font-black text-gray-500\"", '03A 进度应居中展示。');
requireText('matchedParentStudent && renderParentStudentCard(matchedParentStudent.name)', '03A 多学生时应只展示当前待确认学生，并复用统一学生卡片。');
requireText('min-h-[132px] rounded-3xl border border-gray-900 bg-gray-50 p-4 text-left', '03A 当前学生卡片应保持单张完整卡片。');
requireText('张天天', '匹配成功页应展示学生全名。');
requireText('张弟弟', '匹配成功页第二个 mock 学生应叫张弟弟。');
requireText('星河实验小学', '03A 卡片应展示学校。');
requireText("const renderParentInviteStudentBinding = (variant: 'unbound' | 'bound') =>", '家长端应复用 03B/03C 被邀请未匹配绑定学生页。');
requireText('<h2 className="text-center text-base font-black">绑定学生</h2>', '03B 顶部标题应为绑定学生。');
requireText('邀请班级', '03B 应展示邀请班级。');
requireText('2025级1班', '03B 应展示被邀请班级名称。');
requireText('学生姓名', '03B 应要求输入学生姓名。');
requireText('请输入学生姓名', '03B 学生姓名输入框应有占位提示。');
requireText('学生学号', '03B 应要求输入学生学号。');
requireText('请输入学生学号', '03B 学生学号输入框应有占位提示。');
requireText('const parentInviteStudentComplete = Boolean(parentInviteStudentForm.name.trim() && parentInviteStudentForm.no.trim());', '03B 应在姓名和学号都填写后才允许绑定。');
requireText("setParentBindingNoticeBackPage(variant === 'bound' ? 'bindInviteBoundUnmatched' : 'bindInviteUnmatched');", '03B/03C 进入 04A 前应记录各自返回页。');
requireText("setParentBindingNoticeBackPage(variant === 'bound' ? 'bindInviteBoundUnmatched' : 'bindInviteUnmatched');", '03B/03C 总量未满时进入 04A 前应记录各自返回页。');
requireText("jumpToParentPage('bindingNotice');", '03B/03C 总量未满时绑定学生后应进入 04A 绑定提醒。');
requireText("if (parentIdentityForm.phone === '17700003333') {\n                jumpToParentPage('bindingTotalLimitNotice');", '03B/03C 点击绑定学生时应校验家长总量已满并进入 04C。');
requireText("variant === 'bound' && (", '03C 应在绑定学生页面额外展示暂不绑定入口。');
requireText('暂不绑定', '03C 应提供暂不绑定 CTA。');
requireText("onClick={() => jumpToParentPage('landing')}", '03C 暂不绑定应进入 05 落地页。');
requireText('const renderParentBindingNotice = () =>', '家长端应新增绑定提醒页。');
requireText('同一班级最多绑定 2 名学生', '绑定提醒页应明确同一班级最多绑定 2 名学生。');
requireText('一个家长最多绑定 3 名学生', '绑定提醒页应明确一个家长最多绑定 3 名学生。');
requireText('请确认当前绑定均为自己的孩子', '绑定提醒页应提示家长确认绑定对象都是自己的孩子。');
requireText('安全提醒', '绑定提醒页应以安全提醒作为主题。');
requireText('const renderParentBindingLimitNotice = () =>', '家长端应新增 04B 已绑定满 2 个学生提醒页。');
requireText('当前班级已绑定 2 个孩子，如需调整，请联系班主任先解绑后再重新绑定。', '04B 应说明当前班级已满 2 个绑定名额并引导联系班主任解绑。');
requireText("renderParentStudentCard('郑小磊')", '04B 应展示第一个已绑定学生卡片。');
requireText("renderParentStudentCard('郑小雅')", '04B 应展示第二个已绑定学生卡片。');
requireText('回到首页', '04B 应提供回到首页 CTA。');
requireText("onClick={() => jumpToParentPage('landing')}", '04B 回到首页应进入 05 落地页。');
requireText('const renderParentBindingTotalLimitNotice = () =>', '家长端应新增 04C 已绑定满 3 名学生提醒页。');
requireText('当前账号已绑定 3 个孩子，如需调整，请联系班主任先解绑后再重新绑定。', '04C 应说明当前账号已满 3 个绑定名额并引导联系班主任解绑。');
requireText("renderParentStudentCard('郑小宇')", '04C 应展示第三个已绑定学生卡片。');
requireText("parentPage === 'bindingTotalLimitNotice' && renderParentBindingTotalLimitNotice()", '家长端原型应渲染 04C 总量已满页面。');
requireText('const renderParentStudentCard = (studentName = parentStudentMaskedName) =>', '家长端应抽象统一学生卡片，避免 03A 和 04 样式不一致。');
requireText('{renderParentStudentCard()}', '绑定提醒页应复用统一学生卡片。');
requireText('您的家长身份', '绑定提醒页应先展示家长身份。');
requireText("const parentIdentityRelationOptions: ParentIdentityRelation[] = ['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];", '家长身份应新增默认选项家长。');
requireText("relation: '家长'", '家长身份默认值应为家长。');
requireText("aria-label=\"选择家长关系\"", '家长身份下拉只选择关系，不应把学生姓名放进选项。');
requireText("parentIdentityForm.relation === '其他'", '选择其他时应展示文本输入。');
requireText('返回', '绑定提醒页应提供返回入口。');
requireText("onClick={() => jumpToParentPage(parentBindingNoticeBackPage)}", '04A 返回应回到上一级页面。');
requireText('确认绑定', '绑定提醒页应提供明确主按钮。');
requireText("if (parentIdentityComplete) jumpToParentPage('landing');", '家长信息确认完成后应进入 05 落地页。');
requireText('暂未匹配到学生', '02B 应展示未匹配提示标题。');
requireText('当前授权的手机（{parentIdentityForm.phone}）未查询到可绑定的学生，请联系班主任，让班主任分享邀请链接。', '02B 应按指定文案展示当前授权手机和班主任邀请处理方式。');
requireText('{parentIdentityForm.phone}', '手机号未匹配页应在提示文案中展示完整手机号。');
requireText(">\n                返回\n              </button>", '02B 底部按钮应为返回。');
requireText("onClick={() => jumpToParentPage(parentBindingReturnPage)}", '02B 返回应回到来源页。');
requireText('const renderParentLanding', '家长端应新增落地页原型。');
requireText('CheckCircle2,', '落地页表扬图标应从 lucide-react 正确导入。');
requireText('Clock,', '落地页待改进图标应从 lucide-react 正确导入。');
requireText('本月净得分', '落地页应复刻成长页的本月净得分卡。');
requireText('预估分红总额', '落地页应复刻成长页的预估分红卡。');
requireText("['成长', '报告', '银行']", '落地页应保留成长页底部三栏导航。');
requireText('showParentChildSwitcherSheet', '落地页切换孩子应有独立弹窗状态。');
requireText('const renderParentChildSwitcherSheet', '落地页应提供切换孩子底部弹窗。');
requireText('const addBinding = () =>', '新增绑定应先关闭弹窗再跳转。');
requireText("if (parentIdentityForm.phone === '17700003333') {\n        jumpToParentPage('bindingTotalLimitNotice');", '05 落地页新增绑定时应先校验家长总量是否已满。');
requireText('const startParentBindingLookup = () =>', '新增绑定应直接进入 02B，不再模拟拉取可绑定学生。');
requireText("setParentBindingReturnPage('landing');", '05 落地页新增绑定拉取后的结果页应返回 05。');
requireText("jumpToParentPage('bindSelfUnmatched');", '新增绑定点击后应直接进入 02B 提示页。');
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
if (parentDirectoryBlock.includes('activeParentDirectoryNodeKey === nodeKey') || parentDirectoryBlock.includes('activeParentDirectoryNodeKey === sourceNodeKey')) {
  failures.push('页面地图视觉选中态应按页面判断，同一个页面出现多次时都要高亮。');
}
const invitedLaneStart = source.indexOf("title: '被邀请'");
const invitedLaneEnd = source.indexOf("title: '自主新增绑定'", invitedLaneStart);
const invitedLaneBlock = source.slice(invitedLaneStart, invitedLaneEnd);
if (invitedLaneBlock.includes("pages: [{ page: 'login' }, { page: 'bindInviteMatched'") || invitedLaneBlock.includes("pages: [{ page: 'login' }, { page: 'bindInviteUnmatched'") || invitedLaneBlock.includes("pages: [{ page: 'login' }, { page: 'bindInviteBoundUnmatched'")) {
  failures.push('被邀请流程的三条分支必须挂在 01 微信登录节点下，不应从 00 收到卡片直接分出三条重复登录节点。');
}
const selfLoginLaneStart = source.indexOf("title: '自主登录'");
const selfLoginLaneEnd = source.indexOf("title: '被邀请'", selfLoginLaneStart);
const selfLoginLaneBlock = source.slice(selfLoginLaneStart, selfLoginLaneEnd);
if (selfLoginLaneBlock.includes('已绑定3名学生&继续新增') || selfLoginLaneBlock.includes('bindingTotalLimitNotice')) {
  failures.push('自主登录流程不应展示“已绑定3名学生&继续新增”，该分支只属于自主新增绑定。');
}
const selfAddBindingLaneStart = source.indexOf("title: '自主新增绑定'");
const selfAddBindingLaneEnd = source.indexOf('];', selfAddBindingLaneStart);
const selfAddBindingLaneBlock = source.slice(selfAddBindingLaneStart, selfAddBindingLaneEnd);
if (selfAddBindingLaneBlock.includes("text: '点击新增绑定'") || selfAddBindingLaneBlock.includes("text: '已绑定3名学生'")) {
  failures.push('自主新增绑定流程分支应展示绑定学生数条件，不应使用旧分支名。');
}
const parentLandingStart = source.indexOf('const renderParentLanding');
const parentLandingEnd = source.indexOf('const renderParentPrototype', parentLandingStart);
const parentLandingBlock = source.slice(parentLandingStart, parentLandingEnd);
if (parentLandingBlock.includes('bg-[#F7FBFC]') || parentLandingBlock.includes('blur-3xl') || parentLandingBlock.includes('bg-cyan') || parentLandingBlock.includes('bg-emerald') || parentLandingBlock.includes('bg-rose')) {
  failures.push('05 落地页应保持低保真灰白风格，不应使用渐变或氛围背景。');
}
if (parentLandingBlock.includes('parentBindingLookupState') || parentLandingBlock.includes('正在查找可绑定学生') || parentLandingBlock.includes('transition-all duration-300')) {
  failures.push('05 落地页不应在页面正文展示新增绑定检索进度，应改为 toast 轻提示。');
}
const parentPrototypeStart = source.indexOf('const renderParentPrototype');
const parentPrototypeEnd = source.indexOf('const renderOpsPrototype', parentPrototypeStart);
const parentPrototypeBlock = source.slice(parentPrototypeStart, parentPrototypeEnd);
if (!parentPrototypeBlock.includes('classActionToast &&') || !parentPrototypeBlock.includes('{classActionToast}')) {
  failures.push('家长端原型容器应渲染 toast，承载新增绑定检索提示。');
}
const parentSwitcherStart = source.indexOf('const renderParentChildSwitcherSheet');
const parentSwitcherEnd = source.indexOf('const renderParentWechatPhoneSheet', parentSwitcherStart);
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
const parentWechatPhoneSheetStart = source.indexOf('const renderParentWechatPhoneSheet');
const parentWechatPhoneSheetEnd = source.indexOf('const renderParentPrototype', parentWechatPhoneSheetStart);
const parentWechatPhoneSheetBlock = source.slice(parentWechatPhoneSheetStart, parentWechatPhoneSheetEnd);
if (parentWechatPhoneSheetBlock.includes('手机号未匹配') || parentWechatPhoneSheetBlock.includes('已绑定该班级任意学生') || parentWechatPhoneSheetBlock.includes('188****4567')) {
  failures.push('微信原生手机号授权弹窗不应展示业务分流标签或额外演示号码。');
}

const parentBindingStart = source.indexOf('const renderParentBinding');
const parentBindingEnd = source.indexOf('const renderParentBindingNotice', parentBindingStart);
const parentBindingBlock = source.slice(parentBindingStart, parentBindingEnd);
if (parentBindingBlock.includes('手机号校验') || parentBindingBlock.includes('parentPhoneMatchesTeacher')) {
  failures.push('02/03 绑定页应模拟真实页面，不展示手机号校验一致/不一致开关。');
}
if (parentBindingBlock.includes('学生姓名') || parentBindingBlock.includes('学生学号') || parentBindingBlock.includes('学校编号') || parentBindingBlock.includes('班级号</button>')) {
  failures.push('02/03 手机号匹配页不应再让家长输入学生姓名、学生学号、学校编号或班级号。');
}
if (parentBindingBlock.includes('匹配范围') || parentBindingBlock.includes('老师预留') || parentBindingBlock.includes('已匹配到学生') || parentBindingBlock.includes('未匹配到手机号') || parentBindingBlock.includes('邀请班级')) {
  failures.push('02/03 真实页面不应展示后台匹配逻辑、流程分支文案或冗余邀请说明。');
}
if (parentBindingBlock.includes('确认学生')) {
  failures.push('03A 不应展示“确认学生”文案。');
}
const matchedBranchStart = parentBindingBlock.indexOf('{isParentMatchedBinding ? (');
const unmatchedBranchStart = parentBindingBlock.indexOf(') : (', matchedBranchStart);
const matchedBranchBlock = matchedBranchStart >= 0 && unmatchedBranchStart > matchedBranchStart
  ? parentBindingBlock.slice(matchedBranchStart, unmatchedBranchStart)
  : '';
if (matchedBranchBlock.includes('学号') || matchedBranchBlock.includes('手机号')) {
  failures.push('03A 学生卡片只展示头像、姓名、班级、学校，不应展示学号或手机号。');
}
if (matchedBranchBlock.includes('上一个') || matchedBranchBlock.includes('下一个')) {
  failures.push('03A 多学生候选应挨个确认，不应展示上一个/下一个按钮。');
}
if (matchedBranchBlock.includes('左右滑动') || matchedBranchBlock.includes('snap-x') || matchedBranchBlock.includes('w-[82%]')) {
  failures.push('03A 多学生候选已改为挨个确认，不应展示左右滑动提示或露出下一张。');
}
if (!matchedBranchBlock.includes('不是我的孩子')) {
  failures.push('03A 挨个判断流程必须提供“不是我的孩子”，避免家长被迫绑定错误学生。');
}
if (!matchedBranchBlock.includes('continueParentBindingFlow()')) {
  failures.push('03A 判断当前学生后应进入下一个学生，全部处理后才进入 05。');
}
if (!matchedBranchBlock.includes('{parentStudentMaskedName}的')) {
  failures.push('03A 您的家长身份文案应跟随当前滑动学生姓名。');
}
if (parentBindingBlock.includes('请确认学生信息') && parentBindingBlock.includes('未找到可绑定学生') && !source.includes('isParentMatchedBinding ?')) {
  failures.push('02/03 成功和未匹配状态必须分支渲染，不能同时作为一个真实页面展示。');
}
const unmatchedPromptBranchStart = parentBindingBlock.indexOf(') : (');
const unmatchedPromptBranchBlock = unmatchedPromptBranchStart >= 0 ? parentBindingBlock.slice(unmatchedPromptBranchStart) : '';
if (unmatchedPromptBranchBlock.includes('继续绑定') || unmatchedPromptBranchBlock.includes("jumpToParentPage('bindingNotice')")) {
  failures.push('自主登录手机号未匹配提示页不应继续进入 04A 绑定提醒。');
}
if (unmatchedPromptBranchBlock.includes('从邀请链接绑定') || unmatchedPromptBranchBlock.includes("jumpToParentPage('wechatCard')")) {
  failures.push('02B 邀请链接不是家长当前可执行动作，不应设计成可点击 CTA。');
}
const mismatchConfirmStart = source.indexOf('const renderParentMismatchConfirmSheet');
const mismatchConfirmEnd = source.indexOf('const renderParentWechatPhoneSheet', mismatchConfirmStart);
const mismatchConfirmBlock = source.slice(mismatchConfirmStart, mismatchConfirmEnd);
if (!mismatchConfirmBlock.includes('continueParentBindingFlow();')) {
  failures.push('03A 不是我的孩子二次确认后应进入下一个学生，全部判断后进入 05。');
}
if (mismatchConfirmBlock.includes("jumpToParentPage('bindingNotice')")) {
  failures.push('03A 不是我的孩子二次确认后不应进入 04A 绑定提醒。');
}

const parentNoticeStart = source.indexOf('const renderParentBindingNotice');
const parentNoticeEnd = source.indexOf('const renderParentInviteStudentBinding', parentNoticeStart);
const parentNoticeBlock = source.slice(parentNoticeStart, parentNoticeEnd);
if (!parentNoticeBlock.includes('{renderParentStudentCard()}')) {
  failures.push('绑定提醒页应复用与 03A 一致的学生卡片组件。');
}
if (!source.includes('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-gray-500') || !source.includes('星河实验小学')) {
  failures.push('统一学生卡片应包含姓氏头像、姓名、班级和学校。');
}
if (!parentNoticeBlock.includes('rounded-2xl bg-gray-50 p-4') || !parentNoticeBlock.includes('rounded-2xl bg-gray-50 p-3') || !parentNoticeBlock.includes('h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal')) {
  failures.push('绑定提醒页字号、间距和控件尺寸应维持 03A 的紧凑规格。');
}
if (parentNoticeBlock.includes('您的联系手机') || parentNoticeBlock.includes('{parentIdentityForm.phone}') || parentNoticeBlock.includes('切换登录')) {
  failures.push('绑定提醒页不应展示联系手机或切换登录入口。');
}
if (parentNoticeBlock.includes('aria-label="家长手机"') || parentNoticeBlock.includes('readOnly')) {
  failures.push('绑定提醒页不应保留家长手机输入或只读信息。');
}
if (parentNoticeBlock.includes('该手机号将作为')) {
  failures.push('绑定提醒页不应展示“该手机号将作为...”说明文案。');
}
if (parentNoticeBlock.includes('请核实孩子信息') || parentNoticeBlock.includes('如果当前不是您的孩子，请联系班主任进行处理。') || parentNoticeBlock.includes('<Shield size={16} />')) {
  failures.push('绑定提醒页不应再展示底部核实提示块。');
}
if (parentNoticeBlock.includes('<option key={relation} value={relation}>{parentStudentName}的{relation}</option>')) {
  failures.push('家长身份下拉选项不应包含学生姓名，只展示关系。');
}
if (parentNoticeBlock.indexOf('{renderParentStudentCard()}') > parentNoticeBlock.indexOf('您的家长身份')) {
  failures.push('绑定提醒页应先展示学生卡片，再展示您的家长身份。');
}
if (parentNoticeBlock.includes('maskChineseName')) {
  failures.push('绑定确认页不应再使用脱敏姓名，应展示学生全名。');
}
if (!parentNoticeBlock.includes('space-y-3 pt-4')) {
  failures.push('返回和确认按钮应上下排列，形成更清晰的 CTA 层级。');
}
if (parentNoticeBlock.includes('返回修改')) {
  failures.push('04A 绑定提醒页按钮文案应为“返回”，不再叫“返回修改”。');
}
if (parentNoticeBlock.indexOf('返回') > parentNoticeBlock.indexOf('确认绑定')) {
  failures.push('绑定提醒页底部应先提供返回，再提供确认绑定。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi parent compass assertions passed');
