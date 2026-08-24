import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassInfoView.tsx', import.meta.url), 'utf8');
const listSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const detailOverviewSource = viewSource.slice(
  viewSource.indexOf('const renderDetail ='),
  viewSource.indexOf('const renderTeacherList ='),
);

assert.match(viewSource, /<MobileBottomSheet[\s\S]*title="编辑班级信息"/, '编辑班级信息应复用全局底部抽屉。');
assert.match(viewSource, /copyText\(classInfo\.classCode\)/, '班级信息页的班级号应支持复制。');
assert.match(viewSource, /'班级详情'/, '页面标题应与产品原型一致。');
assert.match(viewSource, /老师列表/, '班级详情应包含老师列表。');
assert.match(viewSource, /家长绑定列表/, '班级详情应包含家长绑定列表。');
assert.match(viewSource, /等级展示规则/, '班级详情应直接提供等级展示规则。');
assert.match(tokenSource, /'--tm-class-info-title-font-size': '20px'/, '班级信息标题应使用 20 像素组件字号 Token。');
assert.match(viewSource, /text-\[length:var\(--tm-class-info-title-font-size\)\]/, '班级名称应消费班级信息标题字号 Token。');
assert.match(viewSource, /TeacherAvatar[\s\S]*?tm-font-size-compact\)\] font-medium/, '首页老师姓名应使用 500 字重。');
assert.match(viewSource, /tm-font-size-meta\)\] font-medium[\s\S]*?已绑定/, '首页绑定状态应使用 500 字重。');
assert.match(viewSource, /仅计算本学期/, '等级展示规则应明确只计算当前学期。');
assert.match(viewSource, /累计所有学期/, '等级展示规则应明确累计全部学期。');
assert.doesNotMatch(viewSource, />班级设置</, '班级详情不应重复展示“班级设置”分组标题。');
assert.match(viewSource, /effectiveRole === 'headTeacher'/, '等级展示方式只允许班主任配置。');
assert.match(viewSource, /role="radiogroup"/, '等级展示方式应使用可访问的单选结构。');
assert.match(viewSource, /studentLevelDisplayMode: levelDisplayDraft/, '等级展示方式应随班级信息回写。');
assert.doesNotMatch(detailOverviewSource, /邀请老师/, '班级详情首页的老师列表不应展示邀请快捷入口。');
assert.doesNotMatch(detailOverviewSource, /邀请家长绑定/, '班级详情首页的家长绑定列表不应展示邀请快捷入口。');
assert.match(viewSource, /page === 'teachers' && canInvite[\s\S]*邀请老师/, '完整老师列表应保留邀请入口。');
assert.match(viewSource, /page === 'parents' && canInvite[\s\S]*邀请家长绑定/, '完整家长绑定列表应保留邀请入口。');
assert.match(viewSource, /role="tablist"/, '家长绑定子页面应提供未绑定和已绑定切换。');
assert.match(viewSource, /未绑定[\s\S]*已绑定/, '家长绑定子页面应区分未绑定与已绑定学生。');
assert.match(viewSource, /title="老师更多操作"/, '班主任应通过底部抽屉管理老师角色。');
assert.match(viewSource, /设为副班主任/, '老师管理应支持设置副班主任。');
assert.match(viewSource, /title="确认移除老师"/, '移除老师应经过二次确认。');
assert.match(viewSource, /title="家长绑定详情"/, '已绑定家长应进入绑定详情抽屉。');
assert.match(viewSource, /title="确认解除绑定"/, '解除家长绑定应经过二次确认。');
assert.match(viewSource, /title="确认转移班主任"/, '转移班主任应经过二次确认。');
assert.match(viewSource, /输入英文 delete 确认解散/, '个人版解散班级应要求输入 delete。');
assert.match(viewSource, /inviteAudience === 'teacher' && \([\s\S]*发送给微信好友/, '微信分享应只用于邀请老师，家长邀请不应展示。');
assert.match(viewSource, /二维码邀请/, '邀请流程应提供二维码方式。');
assert.match(viewSource, /通过链接邀请/, '家长邀请流程应提供链接方式。');
assert.match(viewSource, /const parentInviteTeacherName = currentTeacherFullName\.endsWith\('老师'\)/, '家长邀请应使用当前老师完整姓名并补充老师称谓。');
assert.match(viewSource, /const parentQrInviteText = `家长您好，\$\{parentInviteTeacherName\}邀请您绑定/, '家长二维码邀请文案应展示当前老师完整姓名。');
assert.match(viewSource, /ai-literacy:\/\/bind-student\?code=\$\{classInfo\.classCode\}/, '家长链接邀请文案应包含绑定链接。');
assert.match(viewSource, /classInfo\.classCode}</, '班级详情应展示连续的 8 位班级号，不应插入空格。');
assert.match(viewSource, /effectiveRole === 'headTeacher' \|\| effectiveRole === 'deputyHeadTeacher'/, '班级信息页应按班级角色控制编辑与邀请入口。');
assert.match(viewSource, /inputMode="numeric"/, '编辑班级信息的班号应使用数字输入框。');
assert.match(viewSource, />取消<[\s\S]*>\s*完成\s*</, '编辑抽屉底部应按原型提供取消和完成操作。');
assert.match(viewSource, /转移班主任/, '班主任详情页应保留转移班主任操作。');
assert.match(viewSource, /解散班级/, '个人版班主任详情页应保留解散班级操作。');
assert.match(viewSource, /退出班级/, '学校版及成员详情页应保留退出班级操作。');
assert.match(viewSource, /退出后，你将无法查看和记录「\{displayClassName\}」的数据。/, '退出班级确认应与 C 端改造统一，只保留无法查看和记录班级数据的核心影响。');
assert.doesNotMatch(viewSource, /该班级仍由班主任保留|你的个人资料和个人版不会受到影响/, '退出班级确认不应继续展示班级归属或个人资料说明。');
assert.match(viewSource, /pb-\[calc\(var\(--tm-space-4\)\+env\(safe-area-inset-bottom\)\)\]/, '底部班级操作区应保留 Token 间距并兼容手机安全区。');
assert.match(viewSource, /--tm-page-plain-header-bg/, '班级信息页应使用教师手机端设计 Token。');
assert.match(viewSource, /border-\[var\(--tm-border-subtle\)\]/, '班级信息页的普通控件应复用班级报告自定义日期的浅边框 Token。');
assert.doesNotMatch(viewSource, /border-\[var\(--tm-border-control\)\]/, '班级信息页不应使用偏深的控件边框。');
assert.doesNotMatch(viewSource, /#[\da-fA-F]{3,8}\b/, '班级信息页不应硬编码颜色。');
assert.doesNotMatch(viewSource, /onInviteTeacher|onInviteParent/, '班级详情邀请流程不应再回退到应用层 alert。');

assert.match(listSource, /copyText\(classInfo\.classCode\)/, '班级卡片应使用通用复制能力。');
assert.match(listSource, /onClick=\{\(\) => copyClassCode\(activeActionClass\)\}/, '更多操作弹窗的班级号应支持复制。');
assert.match(listSource, /onClick=\{\(\) => runClassAction\(onEditClassInfo\)\}/, '更多操作弹窗顶部班级名称行应进入班级详情。');
assert.match(listSource, /aria-label=\{`查看\$\{activeActionClass\.name\}班级详情`\}/, '顶部班级详情入口应提供明确的无障碍名称。');
assert.match(appSource, /navigateTo\('class_info'\)/, '编辑班级信息应进入真实班级信息页面。');
assert.match(appSource, /classOverrides/, '保存后的班级信息应提升到应用状态。');
assert.match(appSource, /<ClassInfoView/, '应用应渲染班级信息页面。');
assert.match(appSource, /classRole=\{selectedClassRole\}/, '应用应向班级详情传入班级角色。');
assert.match(appSource, /getStudentLevelNetScore\(/, '班级花名册等级应按班级配置计算展示分值。');
assert.match(appSource, /students=\{getMergedStudentsForClass\(selectedClassInfo\.id\)\}/, '班级详情应使用当前班级学生数据。');

console.log('Class info view integration assertions passed');
