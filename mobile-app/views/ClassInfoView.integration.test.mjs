import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassInfoView.tsx', import.meta.url), 'utf8');
const listSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

assert.match(viewSource, /<MobileBottomSheet[\s\S]*title="编辑班级信息"/, '编辑班级信息应复用全局底部抽屉。');
assert.match(viewSource, /copyText\(classInfo\.classCode\)/, '班级信息页的班级号应支持复制。');
assert.match(viewSource, /'班级详情'/, '页面标题应与产品原型一致。');
assert.match(viewSource, /老师列表/, '班级详情应包含老师列表。');
assert.match(viewSource, /家长绑定列表/, '班级详情应包含家长绑定列表。');
assert.match(viewSource, /classInfo\.classCode}</, '班级详情应展示连续的 8 位班级号，不应插入空格。');
assert.match(viewSource, /classRole === 'headTeacher' \|\| classRole === 'deputyHeadTeacher'/, '班级信息页应按班级角色控制编辑与邀请入口。');
assert.match(viewSource, /inputMode="numeric"/, '编辑班级信息的班号应使用数字输入框。');
assert.match(viewSource, />取消<[\s\S]*>\s*完成\s*</, '编辑抽屉底部应按原型提供取消和完成操作。');
assert.match(viewSource, /转移班主任/, '班主任详情页应保留转移班主任操作。');
assert.match(viewSource, /解散班级/, '个人版班主任详情页应保留解散班级操作。');
assert.match(viewSource, /退出班级/, '学校版及成员详情页应保留退出班级操作。');
assert.match(viewSource, /pb-\[calc\(var\(--tm-space-4\)\+env\(safe-area-inset-bottom\)\)\]/, '底部班级操作区应保留 Token 间距并兼容手机安全区。');
assert.match(viewSource, /--tm-page-plain-header-bg/, '班级信息页应使用教师手机端设计 Token。');
assert.match(viewSource, /border-\[var\(--tm-border-subtle\)\]/, '班级信息页的普通控件应复用班级报告自定义日期的浅边框 Token。');
assert.doesNotMatch(viewSource, /border-\[var\(--tm-border-control\)\]/, '班级信息页不应使用偏深的控件边框。');
assert.doesNotMatch(viewSource, /#[\da-fA-F]{3,8}\b/, '班级信息页不应硬编码颜色。');

assert.match(listSource, /copyText\(classInfo\.classCode\)/, '班级卡片应使用通用复制能力。');
assert.match(listSource, /onClick=\{\(\) => copyClassCode\(activeActionClass\)\}/, '更多操作弹窗的班级号应支持复制。');
assert.match(listSource, /查看班级信息/, '普通老师的更多操作应提供只读班级信息入口。');
assert.match(appSource, /navigateTo\('class_info'\)/, '编辑班级信息应进入真实班级信息页面。');
assert.match(appSource, /classOverrides/, '保存后的班级信息应提升到应用状态。');
assert.match(appSource, /<ClassInfoView/, '应用应渲染班级信息页面。');
assert.match(appSource, /classRole=\{selectedClassRole\}/, '应用应向班级详情传入班级角色。');
assert.match(appSource, /students=\{getMergedStudentsForClass\(selectedClassInfo\.id\)\}/, '班级详情应使用当前班级学生数据。');

console.log('Class info view integration assertions passed');
