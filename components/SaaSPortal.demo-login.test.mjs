import fs from 'node:fs';

const source = fs.readFileSync(new URL('./SaaSPortal.tsx', import.meta.url), 'utf8');

const requiredSnippets = [
  "if (loginTab === 'password' || trimmedCredential === '123456')",
  'placeholder="请输入密码（演示环境任意输入）"',
  "setLoginError(loginTab === 'password' ? '请输入密码' : '请输入验证码')",
  "setLoginError('验证码错误，请重试')",
];

const forbiddenSnippets = [
  "if (credential === '123456')",
  'placeholder="请输入密码（演示密码：123456）"',
  '账号或密码错误，请重试',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`PC 端演示登录缺少预期实现：${snippet}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (source.includes(snippet)) {
    throw new Error(`PC 端演示登录仍包含旧密码限制或旧文案：${snippet}`);
  }
}

console.log('SaaS portal demo login assertions passed');
