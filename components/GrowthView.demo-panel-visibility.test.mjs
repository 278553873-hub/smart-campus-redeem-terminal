import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const failures = [];

if (appSource.includes('<GrowthSidePanel />')) {
  failures.push('成长足迹中心详情页不应展示右侧排行榜规则和排行榜展示试算面板。');
}

if (appSource.includes("if (view === 'growth') {")) {
  failures.push('成长足迹中心不应继续使用带右侧演示面板的特殊页面布局。');
}

if (!appSource.includes("case 'growth':")) {
  failures.push('成长足迹中心页面入口不能被移除。');
}

console.log(failures.length ? failures.join('\n') : 'growth side demo panel visibility assertions passed');
if (failures.length) process.exit(1);
