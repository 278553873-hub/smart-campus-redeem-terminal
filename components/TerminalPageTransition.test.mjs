import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const componentFiles = [
  'AccountLogin.tsx',
  'BankView.tsx',
  'Dashboard.tsx',
  'ExchangeView.tsx',
  'FaceScanner.tsx',
  'GrowthView.tsx',
  'ShopView.tsx',
  'TransactionView.tsx',
  'VendingAdmin.tsx',
];
const componentSources = componentFiles.map(file => ({
  file,
  source: readFileSync(new URL(`./${file}`, import.meta.url), 'utf8'),
}));

const failures = [];

if (!appSource.includes("pageTransitionDirection === 'back' ? 'slide-in-from-left-12' : 'slide-in-from-right-12'")) {
  failures.push('货柜机页面切换应根据导航方向，在返回时从左向右、前进时从右向左进入。');
}

if (!appSource.includes("key={view === 'scanning' ? `${view}-${loginSubView}` : view}")) {
  failures.push('切换页面或登录方式时，应重新触发统一的水平进入动画。');
}

if (!appSource.includes("const [pageTransitionDirection, setPageTransitionDirection] = useState<'forward' | 'back'>('forward')")) {
  failures.push('页面切换应由终端容器统一维护前进/返回方向状态。');
}

if (!appSource.includes("const navigateTo = (nextView: ViewState, direction: 'forward' | 'back' = 'forward')")) {
  failures.push('页面导航应通过统一入口设置切换方向，避免各页面分别实现动画。');
}

if (!appSource.includes("navigateTo(isGuestBrowsing ? 'welcome' : 'dashboard', 'back')")) {
  failures.push('商品页返回首页应使用从左向右的返回动画。');
}

if (!appSource.includes("onBack={() => navigateTo('dashboard', 'back')}")) {
  failures.push('业务子页面返回仪表盘应使用从左向右的返回动画。');
}

for (const { file, source } of componentSources) {
  const openingRoot = source.match(/return \(\s*<div className=(?:"([^"]+)"|\{`([^`]+)`\})/s);
  const rootClass = openingRoot?.[1] ?? openingRoot?.[2] ?? '';
  if (/animate-in|slide-in-from-|zoom-in/.test(rootClass)) {
    failures.push(`${file} 仍保留独立页面入场动画，会与统一水平切页叠加。`);
  }
}

if (componentSources.find(item => item.file === 'ShopView.tsx')?.source.includes('fade-in zoom-in-[0.98]')) {
  failures.push('商品列表仍在页面切换时缩放，会形成斜向移动错觉。');
}

if (componentSources.find(item => item.file === 'GrowthView.tsx')?.source.includes('slide-in-from-bottom-2')) {
  failures.push('成长页默认内容仍从下方进入，会与水平切页叠加。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('terminal page transition assertions passed');
