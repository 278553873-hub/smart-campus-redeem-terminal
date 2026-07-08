import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("title: '家长绑定列表'", '10A/10B 标题应为家长绑定列表。');
requireText("if (pageKey === 'parentBindingList') return '10A';", '班主任家长绑定列表编号应为 10A。');
requireText("if (pageKey === 'parentBindingListMember') return '10B';", '非班主任家长绑定列表编号应为 10B。');
requireText("if (page === 'parentBindingList' || page === 'parentBindingListMember') {", '页面渲染应同时承接 10A/10B。');
requireText("navigate(isHeadTeacherDetail ? 'parentBindingList' : 'parentBindingListMember')", '班级详情进入家长绑定列表应按班主任/非班主任分流到 10A/10B。');
requireText("未绑定/已绑定", '页面应有未绑定/已绑定 tab 或统计。');
requireText("邀请家长绑定按钮固定在页面底部", 'PRD 应说明邀请按钮固定底部。');
requireText("mock 数据为 48/50", 'PRD 应说明家长绑定 mock 数据为 48/50。');
requireText("邀请家长绑定弹窗同样提供通过微信邀请、二维码邀请和通过链接邀请", 'PRD 应说明家长邀请三种方式。');
requireText("二维码使用“素养指南针”小程序二维码", 'PRD 应说明家长二维码邀请使用素养指南针二维码。');
requireText("链接文案不再引导输入班级号", 'PRD 应说明家长链接邀请不再引导输入班级号。');
requireText("reservedPhone: '15200001332'", 'mock 数据应包含已预留手机号但未绑定的学生。');
requireText("未绑定卡片展示学生头像、学生姓名和“待绑定”标签。", '未绑定卡片应统一展示待绑定标签。');
requireText("待绑定统一表示该学生还没有完成家长绑定，不在列表层区分是否已预留手机号。", 'PRD 应说明待绑定不再区分是否已预留手机号。');
requireText("const unboundLabel = '待绑定';", '未绑定学生标签应统一为待绑定。');
requireText('{unboundLabel}', '未绑定卡片应渲染动态绑定状态标签。');
requireText("已绑定 tab 每个家长绑定关系展示为一张可点击卡片", '已绑定 tab 应按每个家长绑定关系展示可点击卡片。');
requireText("例如“王小明的爸爸”；姓名字号应克制，关系作为轻层级信息展示。", '已绑定卡片主信息应展示为学生姓名+关系，并控制姓名视觉层级。');
requireText("同一个学生有多个家长绑定时，多个家长卡片连续排列；不同学生之间用弱化线条分隔。", '同一学生多个家长应连续展示，不同学生之间应弱分隔。');
requireText("08A/08B 预览不展示电话 icon", '08A/08B 预览不应展示电话 icon。');
requireText("点击卡片后在弹窗中默认展示关系和完整手机号，并只突出拨打电话主按钮。", '10A 详情默认态应只读展示并突出拨打电话。');
requireText("10A 详情弹窗提供“编辑”入口；点击编辑后才激活关系和手机号输入框，底部只展示左侧移除绑定和右侧保存修改，不再展示拨打电话。", '10A 编辑态应聚焦修改/移除，不再展示拨打电话。');
requireText("10B 可查看学生家长绑定关系和完整手机号，并可拨打电话。", '10B 应可查看绑定关系、手机号并拨打电话。');
requireText("10B 不能修改家长绑定关系，不能修改手机号，不能移除绑定。", '10B 不应允许编辑或移除绑定。');
requireText("10B 不展示邀请家长绑定按钮。", '10B 不应展示邀请家长绑定按钮。');
requireText("'拨打电话', '移除绑定'", '页面 10 PRD 模块应包含拨打电话和移除绑定。');
requireText("详情弹窗和移除确认均展示完整手机号", '详情弹窗和移除绑定确认时应展示完整手机号用于核对。');
requireText("一个学生可以被多个家长绑定", 'PRD 应说明一个学生可被多个家长绑定。');
requireText("班主任和副班主任可以移除单个家长绑定关系", 'PRD 应说明班主任/副班主任可移除绑定关系。');
requireText("guardians: [", '家长绑定数据应支持一个学生多个家长绑定关系。');
requireText("ActiveParentBindingCandidate", '应维护当前家长绑定详情候选状态。');
requireText("getParentGuardianLabel", '应统一处理“其他”身份的展示文本。');
requireText("guardian.relation === '其他' ? guardian.relationOther?.trim() || '其他' : guardian.relation", '其他身份应优先展示家长输入的文本。');
requireText("const visibleGuardians = compact ? guardians.slice(0, 2) : guardians;", '聚合卡片应限制预览关系数量，保证内容可读。');
requireText("ParentBindingGuardianCard", '页面 10 已绑定 tab 应使用家长绑定明细卡片。');
requireText("aria-label={`查看${student.name}的${guardianLabel}绑定详情`}", '已绑定卡片点击后应进入家长绑定详情。');
requireText("renderParentBindingDetailSheet", '家长绑定详情应有底部弹层。');
requireText("家长绑定详情", '详情弹层应有明确标题。');
requireText("text-[15px] font-bold", '已绑定卡片姓名字号应降低，避免突兀。');
requireText("text-sm font-semibold leading-5 text-gray-700", '已绑定卡片关系应作为轻层级信息展示。');
requireText("border-t border-gray-100 pt-2", '不同学生的家长卡片组之间应使用弱分隔线。');
requireText("aria-label=\"编辑家长关系\"", '详情弹层应支持编辑家长关系。');
requireText("aria-label=\"编辑家长手机号\"", '详情弹层应支持编辑家长手机号。');
requireText("parentIdentityRelationOptions.map((relation)", '编辑关系应复用爸爸/妈妈/爷爷/奶奶/外公/外婆/其他选项。');
requireText("aria-label=\"编辑其他关系\"", '选择其他关系时应支持编辑具体关系。');
requireText("保存修改", '详情弹层应提供保存修改按钮。');
requireText("Phone size={16}", '详情弹层中应提供拨打电话入口。');
requireText("拨打电话", '详情弹层中应展示拨打电话操作。');
requireText("移除绑定", '详情弹层中应展示移除绑定操作。');
requireText("const canManageParentBinding = page === 'parentBindingList';", '10B 应通过页面权限关闭编辑和移除能力。');
requireText("const [isEditingParentBinding, setIsEditingParentBinding] = useState(false);", '10A 家长绑定详情应有独立编辑状态。');
requireText("const showParentBindingEditFields = canManageParentBinding && isEditingParentBinding;", '10A 只有进入编辑状态后才展示编辑控件。');
requireText("disabled={!canRemoveParentBinding}", '10A 编辑态无移除权限时应禁用移除绑定。');
requireText("canRemoveParentBinding ? 'bg-white text-red-600 active:bg-red-50' : 'bg-gray-100 text-gray-400'", '10A 编辑态移除绑定应作为左侧危险次按钮。');
requireText("{showParentBindingEditFields ? (", '保存修改按钮只应在编辑状态展示。');
requireText('<div className="mt-4 grid grid-cols-2 gap-2">', '10A 编辑态底部应左右两列展示操作。');
requireText("canSaveParentBinding ? 'bg-gray-900 text-white active:bg-gray-800' : 'bg-gray-100 text-gray-400'", '10A 编辑态保存修改应作为右侧主按钮。');
requireText("onClick={() => setIsEditingParentBinding(true)}", '10A 默认态应提供编辑按钮进入编辑状态。');
requireText("setIsEditingParentBinding(false);", '打开或关闭家长绑定详情时应重置为非编辑状态。');
requireText("phone: activeParentBindingCandidate.phone", '移除绑定候选应从详情弹层记录完整手机号。');
requireText("{removeParentBindingCandidate.phone}", '移除确认弹窗应展示完整手机号。');
requireText("sortedParentBindingRows.slice(0, 4)", '08A/08B 预览应使用学生聚合卡片数据。');
requireText("<ParentBindingGuardianCard key={guardian.id} student={student} guardian={guardian} />", '页面 10 已绑定列表应按每个家长绑定关系渲染卡片。');
requireText("setRemoveParentBindingCandidate", '移除家长绑定前应记录待移除绑定关系。');
requireText("renderRemoveParentBindingConfirmSheet", '移除家长绑定应有二次确认弹窗。');
requireText("确认移除绑定", '移除家长绑定二次确认弹窗应明确标题。');
requireText("showClassActionToast(`已移除${removeParentBindingCandidate.studentName}${removeParentBindingCandidate.guardianLabel}绑定`)", '确认移除后才应展示移除成功反馈。');
requireText("codeTitle: '链接邀请'", '家长和老师的链接邀请标题应统一为链接邀请。');
requireText("家长您好，${inviteClass.inviter}邀请您绑定「${inviteClass.name}」学生，查看孩子的日常评价记录和成长报告。点击链接 ai-literacy://bind-student?code=${inviteClass.code}，直接完成绑定。", '家长链接邀请文案应按新口径展示。');
requireText("const qrInviteTitle = inviteAudience === 'teacher' ? '加入AI素养评价' : '绑定学生';", '家长二维码邀请图片标题应为绑定学生。');
requireText("const qrInviteImage = inviteAudience === 'teacher' ? '/assets/ai_literacy_qr.png' : '/assets/compass_qr.png';", '家长二维码邀请应使用素养指南针二维码。');
requireText("微信扫描上方二维码即可完成绑定。", '家长二维码邀请图片下方应展示扫码完成绑定文案。');

// 不应存在 activeParentRemove
if (source.includes('activeParentRemove')) {
  failures.push('不应存在 activeParentRemove 状态。');
}

// 不应回到按数据行写死可移除权限。
if (source.includes('canRemove:')) {
  failures.push('不应在绑定数据里写死 canRemove 属性。');
}

// 不应存在 parentNames
if (source.includes('parentNames')) {
  failures.push('不应存在 parentNames 数据。');
}

const parentBindingCardStart = source.indexOf('const ParentBindingCard =');
const parentBindingCardEnd = source.indexOf('const renderPrdBlock', parentBindingCardStart);
const parentBindingCardBlock = parentBindingCardStart >= 0 && parentBindingCardEnd > parentBindingCardStart
  ? source.slice(parentBindingCardStart, parentBindingCardEnd)
  : '';

if (parentBindingCardBlock.includes('尾号 {guardian.phoneTail}')) {
  failures.push('已绑定卡片日常态不应展示手机号尾号。');
}

if (parentBindingCardBlock.includes('Phone size={13}') || parentBindingCardBlock.includes('Edit3 size={13}') || parentBindingCardBlock.includes('Trash2 size={13}')) {
  failures.push('已绑定列表卡片不应直接展示 icon 操作。');
}

if (!parentBindingCardBlock.includes("'whitespace-nowrap font-black leading-5'")) {
  failures.push('家长绑定卡片学生姓名必须单行完整展示，不应在 08 预览中换行或截断。');
}

if (parentBindingCardBlock.includes("'truncate font-black leading-5'")) {
  failures.push('家长绑定卡片学生姓名不应使用 truncate 截断。');
}

if (parentBindingCardBlock.includes("'break-words font-black leading-5'")) {
  failures.push('家长绑定卡片学生姓名不应换行展示。');
}

const classDetailStart = source.indexOf("if (page === 'classDetail' || page === 'classDetailMember')");
const classDetailEnd = source.indexOf("if (page === 'teacherList')", classDetailStart);
const classDetailBlock = classDetailStart >= 0 && classDetailEnd > classDetailStart
  ? source.slice(classDetailStart, classDetailEnd)
  : '';

if (classDetailBlock.includes('showPhoneAction')) {
  failures.push('08A/08B 班级详情预览不应展示电话 icon。');
}

if (classDetailBlock.includes('setActiveParentBindingCandidate')) {
  failures.push('08A/08B 班级详情预览不应打开家长绑定详情。');
}

if (parentBindingCardBlock.includes("'已绑定'") || parentBindingCardBlock.includes('>未绑定</div>')) {
  failures.push('家长绑定卡片不应重复展示已绑定标签，也不应继续使用笼统“未绑定”标签。');
}

if (parentBindingCardBlock.includes('未填手机号') || parentBindingCardBlock.includes('待家长绑定') || parentBindingCardBlock.includes('student.reservedPhone ?')) {
  failures.push('10 家长绑定列表未绑定卡片不应再按手机号预留状态区分标签，应统一为“待绑定”。');
}

const parentBindingDetailStart = source.indexOf('const renderParentBindingDetailSheet = () =>');
const parentBindingDetailEnd = source.indexOf('const renderTransferHeadTeacherSheet', parentBindingDetailStart);
const parentBindingDetailBlock = parentBindingDetailStart >= 0 && parentBindingDetailEnd > parentBindingDetailStart
  ? source.slice(parentBindingDetailStart, parentBindingDetailEnd)
  : '';
const editBranchStart = parentBindingDetailBlock.indexOf('showParentBindingEditFields ? (');
const editBranchEnd = parentBindingDetailBlock.indexOf(') : canManageParentBinding && (', editBranchStart);
const editBranchBlock = editBranchStart >= 0 && editBranchEnd > editBranchStart
  ? parentBindingDetailBlock.slice(editBranchStart, editBranchEnd)
  : '';
if (editBranchBlock.includes('拨打电话') || editBranchBlock.includes('Phone size={16}')) {
  failures.push('10A 家长绑定详情编辑态不应展示拨打电话按钮。');
}
if (!editBranchBlock.includes('移除绑定') || !editBranchBlock.includes('保存修改')) {
  failures.push('10A 家长绑定详情编辑态应只保留移除绑定和保存修改。');
}

const inviteCopyStart = source.indexOf('const inviteCopy = {');
const inviteCopyEnd = source.indexOf('const renderInviteOptionsSheet = () =>', inviteCopyStart);
const inviteCopyBlock = inviteCopyStart >= 0 && inviteCopyEnd > inviteCopyStart
  ? source.slice(inviteCopyStart, inviteCopyEnd)
  : '';
if (inviteCopyBlock.includes('请在「素养指南针」中输入班级号')) {
  failures.push('家长链接邀请文案不应再引导输入班级号。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi parent binding list assertions passed');
