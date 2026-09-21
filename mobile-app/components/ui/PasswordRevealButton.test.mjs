import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const readRepoFile = relativePath => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const component = read('./PasswordRevealButton.tsx');

// 公共件语义：图标代表当前状态，无障碍名称代表点击后的动作。
assert.match(
  component,
  /\{visible[\s\S]*?\?\s*<Eye\b[\s\S]*?:\s*<EyeOff\b/,
  '公共密码显隐按钮必须"明文用睁眼（Eye）、掩码用闭眼（EyeOff）"，不得写反。',
);
assert.match(
  component,
  /aria-label=\{visible \? hideLabel : revealLabel\}/,
  '无障碍名称必须描述点击后的动作：明文时是隐藏，掩码时是查看。',
);

const callSites = [
  ['components/SaaSPortal.tsx', 'PC 后台登录'],
  ['components/parent-app/ParentExchangePasswordSheet.tsx', '家长手机端兑换密码'],
  ['mobile-app/views/TeacherLoginView.tsx', '教师手机端登录'],
  ['mobile-app/views/bank-password/BankPasswordView.tsx', '教师手机端兑换密码'],
  ['components/TeacherDashboard.tsx', 'PC 后台设备管理'],
];

for (const [file, label] of callSites) {
  const source = readRepoFile(file);
  assert.match(source, /<PasswordRevealButton/, label + '的密码显隐必须复用公共组件，不得自己拼装眼睛图标。');
  assert.doesNotMatch(source, /<Eye\b|<EyeOff\b/, label + '不得直接渲染眼睛图标，避免各端把睁眼闭眼写反。');
}

const scannedRoots = ['components', 'mobile-app', 'services', 'shared'];
const allowlist = new Set([
  'mobile-app/components/Icons.tsx',
  'mobile-app/components/ui/PasswordRevealButton.tsx',
]);
const files = [];
const walk = directory => {
  for (const entry of fs.readdirSync(path.join(repoRoot, directory), { withFileTypes: true })) {
    const relativePath = directory + '/' + entry.name;
    if (entry.isDirectory()) walk(relativePath);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) files.push(relativePath);
  }
};
scannedRoots.forEach(walk);

const inlineToggles = files.filter(file => !allowlist.has(file) && /<EyeOff\b/.test(readRepoFile(file)));
assert.deepEqual(
  inlineToggles,
  [],
  '闭眼图标只能由公共组件渲染，以下文件绕过了公共组件：' + inlineToggles.join('、'),
);

const teacherGuidelines = readRepoFile('design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md');
const parentGuidelines = readRepoFile('PARENT_APP_UI_GUIDELINES.md');
assert.match(teacherGuidelines, /PasswordRevealButton/, '教师手机端规范应写明密码显隐复用公共组件。');
assert.match(parentGuidelines, /PasswordRevealButton/, '家长手机端规范应写明密码显隐复用公共组件。');

console.log('PasswordRevealButton assertions passed');
