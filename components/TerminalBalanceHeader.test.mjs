import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const failures = [];

if (!appSource.includes('const HeaderCoinBalance')) {
  failures.push('详情页余额展示应抽成统一组件，避免超市、成长足迹和银行各自维护样式。');
}

for (const view of ["view === 'shop' && !isGuestBrowsing", "view === 'growth'", "view === 'bank'"]) {
  if (!appSource.includes(view)) failures.push(`标题栏缺少 ${view} 的余额展示场景。`);
}

if (!appSource.includes('text-xs font-black') || !appSource.includes('text-xl font-black')) {
  failures.push('标题栏余额的文案和数字字号应明显大于原有样式。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('terminal balance header assertions passed');
