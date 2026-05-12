import { readFileSync } from 'node:fs';

const accountLoginSource = readFileSync(new URL('./AccountLogin.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const failures = [];

if (!accountLoginSource.includes('placeholder="请输入：20250101"')) {
  failures.push('账号输入框占位提示应精简为「请输入：20250101」。');
}

if (!accountLoginSource.includes('placeholder="请输入：123456"')) {
  failures.push('密码输入框占位提示应精简为「请输入：123456」。');
}

if (!accountLoginSource.includes('placeholder:font-sans placeholder:text-[17px] placeholder:font-bold placeholder:tracking-normal')) {
  failures.push('账号和密码输入框应统一占位提示的字体、字号、字重和字距。');
}

if (accountLoginSource.includes('font-[NumberFont] ${layout ===')) {
  failures.push('账号输入框不应让中文占位提示继承数字字体，避免字体混搭。');
}

for (const forbidden of ['demoCredentials', '演示账号：', '演示密码：', '演示登录', '账号，如：', '密码，如：']) {
  if (accountLoginSource.includes(forbidden) || appSource.includes(forbidden)) {
    failures.push(`不应新增独立演示提示模块或使用生硬占位文案：${forbidden}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('account login placeholder hint assertions passed');
