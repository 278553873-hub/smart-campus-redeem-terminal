import fs from 'node:fs';

const edits = [];
const push = (file, from, to) => edits.push({ file, from: from.join('\n'), to: to.join('\n') });

// 修改态输入框：提示文案与数字统一居中
push('components/parent-app/ParentExchangePasswordSheet.tsx', [
  '              className="h-[52px] w-full rounded-[var(--pm-radius-field)] border border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)] px-4 text-[length:var(--pm-font-size-page-title)] font-bold tracking-[0.28em] text-[var(--pm-text-primary)] outline-none placeholder:text-[length:var(--pm-font-size-body)] placeholder:tracking-normal placeholder:text-[var(--pm-text-disabled)]"',
], [
  '              className="h-[52px] w-full rounded-[var(--pm-radius-field)] border border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)] px-4 text-center text-[length:var(--pm-font-size-page-title)] font-bold tracking-[0.28em] text-[var(--pm-text-primary)] outline-none placeholder:text-[length:var(--pm-font-size-body)] placeholder:tracking-normal placeholder:text-[var(--pm-text-disabled)]"',
]);

// 测试：锁住居中，避免回退
push('components/ParentApp.exchange-password.test.mjs', [
  "requireText(sheetSource, 'placeholder=\"请输入密码\"', '密码输入框应保留简洁的占位提示。');",
], [
  "requireText(sheetSource, 'placeholder=\"请输入密码\"', '密码输入框应保留简洁的占位提示。');",
  "requireText(sheetSource, 'px-4 text-center text-[length:var(--pm-font-size-page-title)]', '修改态输入框的占位提示与数字必须居中展示。');",
]);

let failed = false;
for (const { file, from, to } of edits) {
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(from).length - 1;
  if (count !== 1) {
    failed = true;
    console.error('匹配次数不是 1（' + count + '）：' + file);
    continue;
  }
  fs.writeFileSync(file, source.replace(from, to));
  console.log('已替换：' + file);
}
process.exit(failed ? 1 : 0);
