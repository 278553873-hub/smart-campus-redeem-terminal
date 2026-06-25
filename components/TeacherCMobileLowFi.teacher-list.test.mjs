import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("| 'teacherListMember'", 'C 端原型应新增 09B 非班主任老师列表页面。');
requireText("if (pageKey === 'teacherList') return '09A';", '09A 应对应班主任老师列表。');
requireText("if (pageKey === 'teacherListMember') return '09B';", '09B 应对应非班主任老师列表。');
requireText("classDetail: {\n    title: '班级详情'", '08A 节点名称应为班级详情。');
requireText("classDetailMember: {\n    title: '班级详情'", '08B 节点名称应为班级详情。');
requireText("classDetailSchoolHead: {\n    title: '班级详情(学校版)'", '08C 节点名称应为班级详情(学校版)。');
requireText("teacherList: {\n    title: '老师列表'", '09A 节点名称应为老师列表。');
requireText("teacherListMember: {\n    title: '老师列表'", '09B 节点名称应为老师列表。');
requireText("title={isHeadTeacherDetail ? '班级详情（班主任）' : '班级详情（非班主任）'}", '08A/08B 手机页标题应按班主任身份展示。');
requireText('班级详情卡片不展示班主任字段。', 'PRD 应说明 08A/08B 班级卡片不展示班主任字段。');
requireText('班级号和人数同一行展示：左侧班级号文案，右侧人数。', 'PRD 应说明班级号和人数同排。');
requireText('className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-600"', '08A/08B 班级号和人数字重应与班级列表一致。');
requireText('<span className="shrink-0 whitespace-nowrap">班级号：{formatClassCode(activeClassProfile.code)}</span>', '08A/08B 应直接展示班级号文案和完整 8 位号码。');
requireText('<Copy size={13} className="shrink-0 text-gray-500" />', '班级号后面应展示复制 icon。');
requireText('<span className="shrink-0 tabular-nums">{activeClassProfile.count}人</span>', '08A/08B 右侧应只展示人数。');
requireText("type ClassTeacherProfile", '老师列表应有独立老师数据结构。');
requireText('subjects: string[];', '老师应支持多个任教学科标签。');
requireText('isHeadTeacher: boolean;', '老师应标识是否班主任。');
requireText('isDeputyHeadTeacher: boolean;', '老师应标识是否副班主任。');
requireText("subjects: ['语文', '道德与法治'], isHeadTeacher: false, isDeputyHeadTeacher: false", '班主任初始数据应可由状态动态计算，支持后续转移。');
requireText("const currentTeacherDisplayName = teacherName.trim() || '郭老师';", '当前老师显示名应集中计算，避免默认班主任候选异常。');
requireText("const activeHeadTeacherName = classHeadTeacherName === '郭老师' ? currentTeacherDisplayName : classHeadTeacherName;", '默认班主任应随当前老师显示名同步。');
requireText("isHeadTeacher: teacher.name === activeHeadTeacherName", '班主任标签应随班主任状态动态变化。');
requireText("subjects: ['体育', '劳动'], isHeadTeacher: false, isDeputyHeadTeacher: true", '副班主任也应能同时任教多个科目。');
requireText("navigate(isHeadTeacherDetail ? 'teacherList' : 'teacherListMember')", '08A/08B 应分别进入 09A/09B。');
requireText("title: '班级(个人版)',\n    pages: ['classListPersonal'],\n    branchGroups: [\n      {\n        branches: [\n          { text: '班主任', pages: ['classDetail'] },\n          { text: '非班主任', pages: ['classDetailMember'] },\n        ],\n      },\n      {\n        branches: [\n          { text: '班主任', pages: ['teacherList'] },\n          { text: '非班主任', pages: ['teacherListMember'] },\n        ],\n      },\n    ],\n    tailPages: ['parentBindingList', 'studentList', 'studentBatchEdit'],", '08A/08B 应作为个人版班级流程的第一组并行分支，09A/09B 应作为第二组并行分支。');
requireText("title: '班级(学校版)',\n    pages: ['classListSchool'],\n    branchGroups: [\n      {\n        branches: [\n          { text: '班主任', pages: ['classDetailSchoolHead'] },\n          { text: '非班主任', pages: ['classDetailMember'] },\n        ],\n      },\n      {\n        branches: [\n          { text: '班主任', pages: ['teacherList'] },\n          { text: '非班主任', pages: ['teacherListMember'] },\n        ],\n      },\n    ],\n    tailPages: ['parentBindingList', 'studentList', 'studentBatchEdit'],", '08C/08B 应作为学校版班级流程的第一组并行分支，09A/09B 应作为第二组并行分支。');
requireText('grid w-fit shrink-0 grid-cols-[20px_max-content_12px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500', '页面地图分支条件列应按内容撑开。');
requireText('<span className="whitespace-nowrap">{branch.text}</span>', '页面地图分支名称班主任/非班主任不应换行。');
requireText('09A 老师列表规则', 'PRD 说明应区分 09A。');
requireText('09B 老师列表规则', 'PRD 说明应区分 09B。');
requireText('09A 是班主任视角，个人版中创建班级的人默认成为班主任。', 'PRD 应说明 09A 是班主任视角。');
requireText('teacher.isHeadTeacher && <span', '老师卡片应展示班主任标签。');
requireText('teacher.isDeputyHeadTeacher && <span', '老师卡片应展示副班主任标签。');
requireText('bg-gray-300 px-2 py-0.5 text-[11px] font-black text-gray-900">副班主任</span>', '副班主任标签应与班主任区分层级。');
requireText('teacher.subjects.map((subject)', '老师卡片应渲染多个学科标签。');
requireText('className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-gray-50 p-4"', '老师列表应以独立卡片展示老师。');
requireText('老师列表内容区可滚动，邀请老师按钮固定在页面底部。', 'PRD 应说明邀请老师入口固定在底部。');
requireText('const primaryClassTeachers = classTeachers.filter((teacher) => teacher.isHeadTeacher || teacher.isDeputyHeadTeacher);', '老师列表应将班主任和副班主任置顶。');
requireText('const otherClassTeachers = classTeachers.filter((teacher) => !teacher.isHeadTeacher && !teacher.isDeputyHeadTeacher);', '老师列表应拆出其余老师。');
requireText('{primaryClassTeachers.length > 0 && otherClassTeachers.length > 0 && <div className="h-px bg-gray-200" />}', '班主任/副班主任和其余老师之间应使用横线分隔。');
requireText('班主任和副班主任置顶', 'PRD 应说明班主任和副班主任置顶。');
requireText('先展示邀请方式弹窗：通过微信邀请、二维码邀请、通过链接邀请、取消。', 'PRD 应说明邀请老师三种方式。');
requireText('通过微信邀请展示“推荐”标签', 'PRD 应说明通过微信邀请有推荐标签。');
requireText('选择二维码邀请时展示加入班级图片', 'PRD 应说明二维码邀请图片。');
requireText('选择链接邀请时只展示可复制文案', 'PRD 应说明链接邀请文案。');
requireText('<span className="min-w-0 flex-1 text-sm font-black">通过微信邀请</span>', '邀请老师弹窗应将邀请微信好友改为通过微信邀请。');
requireText('<span className="rounded-full bg-gray-900 px-2 py-1 text-[11px] font-black text-white">推荐</span>', '通过微信邀请应展示推荐标签。');
requireText('<span className="text-sm font-black">二维码邀请</span>', '邀请老师弹窗应新增二维码邀请。');
requireText("setShowQrInviteSheet(true);", '点击二维码邀请应展示二维码邀请弹窗。');
requireText("inviteAudience === 'teacher' ? '通过链接邀请' : '家长邀请'", '教师邀请应将通过班级号邀请改为通过链接邀请。');
requireText("codeTitle: inviteAudience === 'teacher' ? '链接邀请' : '家长邀请'", '教师链接邀请弹窗标题应为链接邀请。');
requireText('我正在使用「AI 素养评价」记录学生日常表现。为进一步提升班级管理工作效率，诚邀您加入「${inviteClass.name}」，共同参与班级管理。点击链接 ai-literacy://join-class?code=${inviteClass.code}，直接加入班级。', '教师链接邀请文案应按新口径展示。');
requireText('const renderQrInviteSheet = () =>', '应新增二维码邀请弹窗。');
requireText('aria-label="二维码邀请"', '二维码邀请弹窗应有无障碍标签。');
requireText('加入AI素养评价', '二维码邀请图片上方应展示指定标题。');
requireText('/assets/ai_literacy_qr.png', '二维码邀请应展示 AI 素养评价小程序二维码。');
requireText('微信扫描上方二维码即可加入班级。', '二维码邀请图片下方应展示扫码加入文案。');
requireText('保存图片', '二维码邀请图片下方应提供保存图片按钮。');

requireText('onClick={openInviteFromList}', '09A 邀请老师入口应使用老师列表邀请处理。');
requireText('mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100', '09A 邀请老师入口应固定在列表下方。');
requireText('setActiveTeacherAction(teacher)', '班主任视角应通过更多 icon 打开老师操作。');
requireText('renderTeacherActionSheet', '班主任视角应有老师更多操作底部弹层。');
requireText("activeTeacherAction.isDeputyHeadTeacher ? '取消副班主任' : '设为副班主任'", '更多操作应支持设置或取消副班主任。');
requireText('移除老师', '更多操作应支持移除老师。');
requireText('setRemoveTeacherCandidate(activeTeacherAction)', '点击移除老师后应先记录待移除老师。');
requireText('renderRemoveTeacherConfirmSheet', '移除老师应有二次确认弹窗。');
requireText('确认移除老师', '移除老师二次确认弹窗应明确标题。');
requireText('确认后该老师不再管理当前班级。', 'PRD 应说明移除老师确认后的结果。');
requireText("showClassActionToast(`已移除${removeTeacherCandidate.name}`)", '确认移除后才应展示移除成功反馈。');
requireText('转移班主任', '08A 应提供转移班主任入口。');
requireText('renderTransferHeadTeacherSheet', '08A 应有选择新班主任的老师列表弹窗。');
requireText('transferHeadTeacherCandidates.map((teacher)', '转移班主任弹窗应展示可选择老师列表。');
requireText('setTransferHeadTeacherCandidate(teacher)', '选中老师后应进入转移班主任二次确认。');
requireText('renderTransferHeadTeacherConfirmSheet', '转移班主任应有二次确认弹窗。');
requireText("setClassHeadTeacherName(transferHeadTeacherCandidate.name)", '确认后班主任身份应转移给选中老师。');
requireText('原班主任不再拥有班级班主任权限', 'PRD 应说明转移后原班主任权限变化。');
requireText("const classDetailComparisonPrdBlocks: PrdBlock[] = [", '08A/08B/08C 应使用差异对比型 PRD，而不是复述低保真画面。');
requireText("text: '08 班级详情差异对比'", '08 组 PRD 标题应强调差异对比。');
requireText('08D 暂不落独立页面', '08 组 PRD 应说明 08D 的预留口径。');
requireText('当前它与 08B 权限一致，继续复用 08B', '08D 暂不独立时应说明复用 08B 的原因。');
requireText("const isClassDetailPrd = page === 'classDetail' || page === 'classDetailMember' || page === 'classDetailSchoolHead';", '08A/08B/08C PRD 应识别为班级详情组。');
requireText("...(!isClassDetailPrd ? [", '08A/08B/08C PRD 不应先展示通用页面模块、CTA 和状态清单。');

const teacherListMemberBlockStart = source.indexOf("if (page === 'teacherListMember')");
const teacherListMemberBlockEnd = source.indexOf("if (page === 'parentBindingList')", teacherListMemberBlockStart);
const teacherListMemberBlock = source.slice(teacherListMemberBlockStart, teacherListMemberBlockEnd);
const teacherListBlockStart = source.indexOf("if (page === 'teacherList')");
const teacherListBlockEnd = source.indexOf("if (page === 'teacherListMember')", teacherListBlockStart);
const teacherListBlock = source.slice(teacherListBlockStart, teacherListBlockEnd);
if (!teacherListBlock.includes('{primaryClassTeachers.length > 0 && otherClassTeachers.length > 0 && <div className="h-px bg-gray-200" />}')) {
  failures.push('09A 班主任老师列表应在班主任/副班主任与其他老师之间展示分隔线。');
}
if (teacherListMemberBlock.includes('移除') || teacherListMemberBlock.includes('MoreHorizontal') || teacherListMemberBlock.includes('setActiveTeacherAction')) {
  failures.push('09B 非班主任老师列表不应展示移除或更多操作。');
}
if (!teacherListMemberBlock.includes('邀请老师')) {
  failures.push('09B 非班主任老师列表应展示邀请老师按钮。');
}
const inviteOptionsStart = source.indexOf('const renderInviteOptionsSheet = () =>');
const inviteOptionsEnd = source.indexOf('const renderWechatChatSheet = () =>', inviteOptionsStart);
const inviteOptionsBlock = source.slice(inviteOptionsStart, inviteOptionsEnd);
if (inviteOptionsBlock.includes('邀请微信好友') || inviteOptionsBlock.includes('通过班级号邀请')) {
  failures.push('邀请老师方式弹窗不应继续展示“邀请微信好友”或“通过班级号邀请”。');
}
const teacherInviteCopyStart = source.indexOf('const inviteCopy = {');
const teacherInviteCopyEnd = source.indexOf('const renderInviteOptionsSheet = () =>', teacherInviteCopyStart);
const teacherInviteCopyBlock = source.slice(teacherInviteCopyStart, teacherInviteCopyEnd);
if (teacherInviteCopyBlock.includes('加入「${inviteClass.name}」一起管理班级；也可以点击链接')) {
  failures.push('教师链接邀请文案不应再引导输入班级号。');
}

const classDetailBlockStart = source.indexOf("if (page === 'classDetail' || page === 'classDetailMember' || page === 'classDetailSchoolHead')");
const classDetailBlockEnd = source.indexOf("if (page === 'teacherList')", classDetailBlockStart);
const classDetailBlock = source.slice(classDetailBlockStart, classDetailBlockEnd);
if (classDetailBlock.includes('学生人数')) {
  failures.push('08A/08B 班级卡片不应继续展示“学生人数”，应改为“学生数”。');
}
if (!classDetailBlock.includes("{isHeadTeacherDetail && (")) {
  failures.push('08B 非班主任不能修改班级详情，编辑按钮必须只在 08A 展示。');
}
const classInfoCardStart = classDetailBlock.indexOf('activeClassTitle');
const classInfoCardEnd = classDetailBlock.indexOf('<section className="rounded-2xl bg-gray-50 p-4">', classInfoCardStart);
const classInfoCardBlock = classDetailBlock.slice(classInfoCardStart, classInfoCardEnd);
if (classInfoCardBlock.includes('班主任')) {
  failures.push('08A/08B 班级信息卡片不应展示班主任字段。');
}
if (classInfoCardBlock.includes('<Hash')) {
  failures.push('08A/08B 班级号和人数行不应展示前置 icon。');
}
if (classInfoCardBlock.includes('min-w-0 truncate tabular-nums')) {
  failures.push('8 位班级号不应使用 truncate 截断。');
}
if (classInfoCardBlock.includes('学生数')) {
  failures.push('08A/08B 班级卡片应按截图只展示班级号和人数，不展示学生数字段名。');
}
if ((classDetailBlock.match(/解散班级/g) ?? []).length !== 1) {
  failures.push('08A 班级详情只能保留一个解散班级入口。');
}

// 08C assertions: school version head teacher
if (!source.includes("title: '班级详情(学校版)'", '08C 页面名称应为班级详情(学校版)。')) {
  // fallback
}
if (!source.includes("page === 'classDetailSchoolHead'")) {
  failures.push('08C 学校版班主任详情页面应存在。');
}
if (!source.includes("isSchoolVersionHead = page === 'classDetailSchoolHead'")) {
  failures.push('08C 应通过 page 状态判断是否为学校版班主任。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi teacher list assertions passed');
