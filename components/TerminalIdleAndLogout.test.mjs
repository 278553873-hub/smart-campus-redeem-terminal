import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const dashboardSource = readFileSync(new URL('./Dashboard.tsx', import.meta.url), 'utf8');
const failures = [];

if (!appSource.includes('const TERMINAL_IDLE_SECONDS = 999')) {
  failures.push('货柜机自动退出倒计时应统一为 999 秒。');
}

if (!appSource.includes('TERMINAL_IDLE_SECONDS * 1000')) {
  failures.push('自动退出实际时长应与 999 秒倒计时保持一致。');
}

if (!appSource.includes('absolute z-[90] top-8')) {
  failures.push('自动退出提示应上移到标题栏顶部区域。');
}

if (!dashboardSource.includes('>退出</span>')) {
  failures.push('货柜机首页退出按钮应展示“退出”文案。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('terminal idle and logout assertions passed');
