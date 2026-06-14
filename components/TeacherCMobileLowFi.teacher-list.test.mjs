import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("| 'teacherListMember'", 'C 端原型应新增 09B 非管理员老师列表页面。');
requireText("if (pageKey === 'teacherList') return '09A';", '09A 应对应管理员老师列表。');
requireText("if (pageKey === 'teacherListMember') return '09B';", '09B 应对应非管理员老师列表。');
requireText("title: '班级详情（管理员）'", '08A 页面名称应为班级详情（管理员）。');
requireText("title: '班级详情（非管理员）'", '08B 页面名称应为班级详情（非管理员）。');
requireText("title={activeClassProfile.isCreator ? '班级详情（管理员）' : '班级详情（非管理员）'}", '08A/08B 手机页标题应按管理员身份展示。');
requireText('班级详情卡片不展示班主任字段。', 'PRD 应说明 08A/08B 班级卡片不展示班主任字段。');
requireText('班级号和人数同一行展示：左侧班级号文案，右侧人数。', 'PRD 应说明班级号和人数同排。');
requireText('className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-600"', '08A/08B 班级号和人数字重应与班级列表一致。');
requireText('<span className="shrink-0 whitespace-nowrap">班级号：{formatClassCode(activeClassProfile.code)}</span>', '08A/08B 应直接展示班级号文案和完整 8 位号码。');
requireText('<Copy size={13} className="shrink-0 text-gray-500" />', '班级号后面应展示复制 icon。');
requireText('<span className="shrink-0 tabular-nums">{activeClassProfile.count}人</span>', '08A/08B 右侧应只展示人数。');
requireText("type ClassTeacherProfile", '老师列表应有独立老师数据结构。');
requireText('subjects: string[];', '老师应支持多个任教学科标签。');
requireText('isHomeroom: boolean;', '老师应标识是否班主任。');
requireText('isAdmin: boolean;', '老师应标识是否管理员。');
requireText("subjects: ['语文', '道德与法治'], isHomeroom: false, isAdmin: false", '管理员初始数据应可由状态动态计算，支持后续转移。');
requireText("const currentTeacherDisplayName = teacherName.trim() || '郭老师';", '当前老师显示名应集中计算，避免默认管理员候选异常。');
requireText("const activeAdminTeacherName = classAdminTeacherName === '郭老师' ? currentTeacherDisplayName : classAdminTeacherName;", '默认管理员应随当前老师显示名同步。');
requireText("isAdmin: teacher.name === activeAdminTeacherName", '管理员标签应随班级管理员状态动态变化。');
requireText("subjects: ['体育', '劳动'], isHomeroom: true, isAdmin: false", '班主任也应能同时任教多个科目。');
requireText("navigate(activeClassProfile.isCreator ? 'teacherList' : 'teacherListMember')", '08A/08B 应分别进入 09A/09B。');
requireText('<div className="grid shrink-0 grid-rows-2 gap-2">\n                  <PageNodeButton item="teacherList" lane={lane.title} />\n                  <PageNodeButton item="teacherListMember" lane={lane.title} />\n                </div>', '09A/09B 在地图上应像 08A/08B 一样并排展示。');
requireText('09A 老师列表规则', 'PRD 说明应区分 09A。');
requireText('09B 老师列表规则', 'PRD 说明应区分 09B。');
requireText('09A 是管理员视角，管理员即创建班级的人。', 'PRD 应说明 09A 是管理员视角。');
requireText('班主任只是标签，不代表管理权限。', 'PRD 应说明班主任只是标签。');
requireText('teacher.isAdmin && <span', '老师卡片应展示管理员标签。');
requireText('teacher.isHomeroom && <span', '老师卡片应展示班主任标签。');
requireText('bg-gray-300 px-2 py-0.5 text-[11px] font-black text-gray-900">班主任</span>', '班主任标签应与管理员同形态但灰度更弱。');
requireText('teacher.subjects.map((subject)', '老师卡片应渲染多个学科标签。');
requireText('className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-gray-50 p-4"', '老师列表应以独立卡片展示老师。');
requireText('老师列表内容区可滚动，邀请老师按钮固定在页面底部。', 'PRD 应说明邀请老师入口固定在底部。');
requireText('const primaryClassTeachers = classTeachers.filter((teacher) => teacher.isAdmin || teacher.isHomeroom);', '老师列表应将管理员和班主任置顶。');
requireText('const otherClassTeachers = classTeachers.filter((teacher) => !teacher.isAdmin && !teacher.isHomeroom);', '老师列表应拆出其余老师。');
requireText('{primaryClassTeachers.length > 0 && otherClassTeachers.length > 0 && <div className="h-px bg-gray-200" />}', '管理员/班主任和其余老师之间应使用横线分隔。');
requireText('管理员和班主任置顶', 'PRD 应说明管理员和班主任置顶。');

requireText('onClick={openInviteFromList}', '09A 邀请老师入口应使用老师列表邀请处理。');
requireText('mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100', '09A 邀请老师入口应固定在列表下方。');
requireText('setActiveTeacherAction(teacher)', '管理员视角应通过更多 icon 打开老师操作。');
requireText('renderTeacherActionSheet', '管理员视角应有老师更多操作底部弹层。');
requireText("activeTeacherAction.isHomeroom ? '取消班主任' : '设为班主任'", '更多操作应支持设置或取消班主任。');
requireText('移除老师', '更多操作应支持移除老师。');
requireText('setRemoveTeacherCandidate(activeTeacherAction)', '点击移除老师后应先记录待移除老师。');
requireText('renderRemoveTeacherConfirmSheet', '移除老师应有二次确认弹窗。');
requireText('确认移除老师', '移除老师二次确认弹窗应明确标题。');
requireText('确认后该老师不再管理当前班级。', 'PRD 应说明移除老师确认后的结果。');
requireText("showClassActionToast(`已移除${removeTeacherCandidate.name}`)", '确认移除后才应展示移除成功反馈。');
requireText('转移班级管理员', '08A 应提供转移班级管理员入口。');
requireText('renderTransferAdminTeacherSheet', '08A 应有选择新管理员的老师列表弹窗。');
requireText('transferAdminCandidates.map((teacher)', '转移管理员弹窗应展示可选择老师列表。');
requireText('setTransferAdminCandidate(teacher)', '选中老师后应进入转移管理员二次确认。');
requireText('renderTransferAdminConfirmSheet', '转移管理员应有二次确认弹窗。');
requireText("setClassAdminTeacherName(transferAdminCandidate.name)", '确认后管理员身份应转移给选中老师。');
requireText('原管理员不再拥有班级管理员身份', 'PRD 应说明转移后原管理员权限变化。');

const teacherListMemberBlockStart = source.indexOf("if (page === 'teacherListMember')");
const teacherListMemberBlockEnd = source.indexOf("if (page === 'parentBindingList')", teacherListMemberBlockStart);
const teacherListMemberBlock = source.slice(teacherListMemberBlockStart, teacherListMemberBlockEnd);
if (teacherListMemberBlock.includes('移除') || teacherListMemberBlock.includes('MoreHorizontal') || teacherListMemberBlock.includes('setActiveTeacherAction')) {
  failures.push('09B 非管理员老师列表不应展示移除或更多操作。');
}
if (!teacherListMemberBlock.includes('邀请老师')) {
  failures.push('09B 非管理员老师列表应展示邀请老师按钮。');
}

const classDetailBlockStart = source.indexOf("if (page === 'classDetail' || page === 'classDetailMember')");
const classDetailBlockEnd = source.indexOf("if (page === 'teacherList')", classDetailBlockStart);
const classDetailBlock = source.slice(classDetailBlockStart, classDetailBlockEnd);
if (classDetailBlock.includes('学生人数')) {
  failures.push('08A/08B 班级卡片不应继续展示“学生人数”，应改为“学生数”。');
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

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi teacher list assertions passed');
