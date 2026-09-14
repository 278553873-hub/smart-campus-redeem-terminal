import { readFileSync } from 'node:fs';

const accountLoginSource = readFileSync(new URL('./AccountLogin.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const failures = [];

if (!accountLoginSource.includes("demoRelaxedValidation ? '任意填写学号' : '请输入：20250101'")) {
  failures.push('货柜机演示的账号输入框应提示「任意填写学号」，其他终端保留原提示。');
}

if (!accountLoginSource.includes("demoRelaxedValidation ? '任意填写密码' : '请输入：123456'")) {
  failures.push('货柜机演示的密码输入框应提示「任意填写密码」，其他终端保留原提示。');
}

if (!accountLoginSource.includes("demoRelaxedValidation ? '学号和密码任意填写即可登录。'")) {
  failures.push('货柜机演示的登录说明应与宽松校验规则保持一致。');
}

if (!accountLoginSource.includes('placeholder:font-sans placeholder:text-[17px] placeholder:font-bold placeholder:tracking-normal')) {
  failures.push('账号和密码输入框应统一占位提示的字体、字号、字重和字距。');
}

if (accountLoginSource.includes('font-[NumberFont] ${layout ===')) {
  failures.push('账号输入框不应让中文占位提示继承数字字体，避免字体混搭。');
}

if (!accountLoginSource.includes('demoRelaxedValidation?: boolean')
  || !accountLoginSource.includes('!demoRelaxedValidation && password.length !== 6')) {
  failures.push('账号登录组件应允许货柜机演示跳过密码格式校验。');
}

if (!accountLoginSource.includes("demoRelaxedValidation\n                                                ? e.target.value")) {
  failures.push('货柜机演示密码输入框应接受任意内容，不能强制过滤为六位数字。');
}

if (!accountLoginSource.includes("登录 {layout !== 'vertical' && <ArrowRight size={26} />}") ) {
  failures.push('密码登录弹窗的主按钮应只显示“登录”，不应增加右箭头。');
}

if (!appSource.includes('demoRelaxedValidation={isVending}')) {
  failures.push('仅货柜机演示应启用宽松登录校验，其他终端继续使用原规则。');
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
