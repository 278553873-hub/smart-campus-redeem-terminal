import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');
const bankSource = readFileSync(new URL('./BankView.tsx', import.meta.url), 'utf8');
const failures = [];

if (appSource.includes('请靠近终端屏幕')) {
  failures.push('货柜机欢迎页不应继续展示“请靠近终端屏幕”。');
}

if (shopSource.includes('isScrolled') || shopSource.includes('星光超市')) {
  failures.push('文创星光超市详情页不应保留顶部卡片或吸顶状态。');
}

if (shopSource.includes('transition-all duration-500') || bankSource.includes('transition-all duration-500')) {
  failures.push('吸顶头部不应使用 transition-all，避免收起时产生无关属性抖动。');
}

if (bankSource.includes('isScrolled') || bankSource.includes('储蓄银行')) {
  failures.push('储蓄银行详情页不应保留顶部银行卡片或吸顶状态。');
}

if (!appSource.includes("view === 'bank'") || !appSource.includes("view === 'growth'") || !appSource.includes('HeaderCoinBalance') || !appSource.includes('GROWTH_COIN_TERMS.saved')) {
  failures.push('超市、成长足迹和储蓄银行余额应统一展示在返回标题栏中。');
}

if (!appSource.includes("view === 'shop' && !isGuestBrowsing")) {
  failures.push('游客浏览商品时不应展示余额，登录后的超市详情页应展示余额。');
}

if (!bankSource.includes('rounded-2xl') || !bankSource.includes('py-2.5 text-base') || !bankSource.includes('bg-slate-100/80')) {
  failures.push('储蓄银行 Tab 应保留清晰的外框、白色选中态和紧凑触控区域。');
}

if (bankSource.includes('shadow-[0_3px_8px_rgba(148,163,184,0.18)]') || bankSource.includes('py-4 text-lg')) {
  failures.push('储蓄银行 Tab 不应继续使用过重阴影或过大的占位尺寸。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('terminal sticky header assertions passed');
