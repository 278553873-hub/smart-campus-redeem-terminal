import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const classList = read('./ClassListView.tsx');
const app = read('../App.tsx');
const batchEdit = read('./StudentBatchEditView.tsx');
const inviteFlow = read('../components/class/ClassInviteFlow.tsx');
const bottomSheet = read('../components/ui/MobileBottomSheet.tsx');
const childViews = [
  read('./reward-verification/RewardVerificationView.tsx'),
  read('./face-update/FaceUpdateView.tsx'),
  read('./bank-password/BankPasswordView.tsx'),
  read('./HomeworkEntryView.tsx'),
];

assert.match(classList, /onBatchEditStudents: \(classId: string\) => void;/, '批量修改学生应使用独立导航回调。');
assert.match(classList, /runClassAction\(onBatchEditStudents\)/, '批量修改学生不应进入普通学生列表。');
assert.match(app, /navigateTo\('student_batch_edit'\)/, '应用应提供独立批量修改学生页面。');
assert.match(app, /<StudentBatchEditView/, '应用应渲染批量修改学生页面。');
assert.match(batchEdit, /studentNo/, '批量修改应支持编辑学号。');
assert.match(batchEdit, /gender/, '批量修改应支持编辑性别。');
assert.match(batchEdit, /onSave\(drafts\)/, '批量修改应保存学生数据。');

assert.match(classList, /<ClassInviteFlow/, '更多操作应接入完整邀请流程。');
assert.match(classList, /showHandle=\{false\}/, '班级更多操作应隐藏通用拖拽条，恢复班级信息主层级。');
assert.match(classList, /header=\{activeActionClass/, '班级更多操作应使用班级信息作为业务标题。');
assert.match(classList, /查看\$\{activeActionClass\.name\}班级详情/, '班级名称应保持为班级详情入口。');
assert.match(classList, /text-\[var\(--tm-brand-primary\)\][\s\S]*详情[\s\S]*<ChevronRight/, '班级详情入口应使用品牌色文字和箭头明确表达可点击。');
assert.match(classList, /items-baseline gap-\[var\(--tm-space-2\)\]/, '班级名称与详情应使用8像素 Token 间距并按文字基线对齐。');
assert.doesNotMatch(classList, /mb-\[var\(--tm-space-4\)\] rounded-\[var\(--tm-radius-card\)\] bg-\[var\(--tm-bg-surface-soft\)\]/, '班级信息不应再被包进浅灰卡片。');
assert.match(inviteFlow, /audience === 'teacher'/, '邀请方式应区分老师与家长。');
assert.match(inviteFlow, /wechat-select/, '老师邀请应支持微信。');
assert.match(inviteFlow, /二维码邀请/, '邀请应支持二维码。');
assert.match(inviteFlow, /通过链接邀请/, '邀请应支持链接。');
assert.match(inviteFlow, /copyText\(inviteText\)/, '链接邀请应支持复制文案。');
assert.match(inviteFlow, /download=/, '二维码邀请应支持保存图片。');
assert.doesNotMatch(app, /handleInviteTeacher|handleInviteParent/, '邀请不应再回退到应用层原生提示框。');

const sheetUsages = classList.match(/<MobileBottomSheet/g) ?? [];
assert.ok(sheetUsages.length >= 4, '班级操作、显示设置、更多操作和离校学生均应使用公共底部抽屉。');
assert.match(inviteFlow, /<MobileBottomSheet/, '邀请流程应使用公共底部抽屉。');
assert.match(bottomSheet, /--tm-border-subtle/, '公共底部抽屉拖拽条应使用浅边框 Token。');
assert.match(bottomSheet, /safe-area-inset-bottom/, '公共底部抽屉应兼容手机底部安全区。');

for (const source of childViews) {
  assert.match(source, /--tm-/, '更多操作子页面必须使用教师端设计 Token。');
  assert.match(source, /--tm-border-subtle/, '更多操作子页面普通边框必须使用浅边框 Token。');
  assert.doesNotMatch(source, /MOCK_STUDENTS_CLASS_1/, '更多操作子页面不得固定读取一班学生。');
  assert.doesNotMatch(source, /(?:bg|text|border|shadow)-(?:blue|indigo|violet|cyan)-/, '更多操作子页面不得残留旧蓝紫色。');
  assert.doesNotMatch(source, /#[0-9A-Fa-f]{3,8}|rgba\(/, '更多操作子页面不得硬编码颜色。');
}

assert.match(app, /<RewardVerificationView[\s\S]*students=\{getMergedStudentsForClass\(selectedClassInfo\.id\)/, '奖励页应读取当前班级学生。');
assert.match(app, /<FaceUpdateView[\s\S]*students=\{getMergedStudentsForClass\(selectedClassInfo\.id\)/, '人脸页应读取当前班级学生。');
assert.match(app, /<BankPasswordView[\s\S]*students=\{getMergedStudentsForClass\(selectedClassInfo\.id\)/, '密码页应读取当前班级学生。');

console.log('Class more actions audit assertions passed');
