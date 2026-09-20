import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const controlSource = readFileSync(new URL('./TerminalShopLayoutPreviewControls.tsx', import.meta.url), 'utf8');
const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};

// 1. 版式清单只能来自共享常量，控件里不能再写一份列数行数
requireText(controlSource, 'TERMINAL_SHOP_LAYOUT_PRESETS.map', '控件应遍历共享的版式清单，不能自己写一份。');
if (/columns:\s*\d/.test(controlSource)) {
  failures.push('控件里不应再写死列数/行数，版式只有 shared/terminalShopLayout 一个来源。');
}

// 2. 单选语义：屏幕阅读器要能读出当前选中的版式
requireText(controlSource, 'role="radiogroup"', '版式控件应是单选组（role=radiogroup）。');
requireText(controlSource, 'role="radio"', '每个版式按钮应是单选项（role=radio）。');
requireText(controlSource, 'aria-checked={selected}', '单选项要标记选中状态。');
requireText(controlSource, 'aria-label="商品展示方式预览"', '单选组要有可读的名称。');

// 3. 每个按钮要直接写出一屏几个商品，领导不用自己算
requireText(controlSource, 'getTerminalShopPerScreenCount(preset)', '按钮上应显示一屏商品数。');

// 4. 触控热区不小于 44px
requireText(controlSource, 'min-h-11', '版式按钮触控热区应不小于 44px。');

// 5. 控件只能挂在货柜机画面之外（演示坞），不能进终端页面本身
requireText(appSource, "terminalView === 'shop' && (", '商品页应挂出展示方式控件。');
requireText(appSource, '<TerminalShopLayoutPreviewControls', 'App 应渲染展示方式控件。');
if (shopSource.includes('TerminalShopLayoutPreviewControls')) {
  failures.push('演示控件不能出现在货柜机商品页里，终端界面必须保持干净。');
}

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('商品展示方式演示控件检查未通过');
}

console.log('✅ 商品展示方式演示控件检查通过（单选语义、数量可见、控件在机器画面之外）');
