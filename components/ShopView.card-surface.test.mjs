import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');

const failures = [];

// 商品卡片代码块：从「点击打开确认兑换」到卡片自己的闭合标签
const cardStart = shopSource.indexOf('onClick={() => handleOpenConfirm(product)}');
const cardEnd = shopSource.indexOf('</button>', cardStart);
assert.ok(cardStart >= 0 && cardEnd > cardStart, '未能定位商品卡片代码块，请检查 ShopView 的卡片结构');
const cardBlock = shopSource.slice(cardStart, cardEnd);
const requireText = (text, message) => {
  if (!cardBlock.includes(text)) failures.push(message);
};

// 1. 卡片圆角必须来自版式规则，不在页面里另写一份
requireText('borderRadius: TERMINAL_SHOP_CARD_RADIUS', '卡片圆角应使用版式规则常量 TERMINAL_SHOP_CARD_RADIUS，不要在页面里写死圆角类名。');
requireText('padding: TERMINAL_SHOP_CARD_PADDING', '卡片内边距应使用版式规则常量 TERMINAL_SHOP_CARD_PADDING，底板与金额条才与卡片同心内缩。');
if (/rounded-(2xl|xl|lg|md)\b/.test(cardBlock)) {
  failures.push('卡片不要再用 rounded-* 写死圆角：圆角改动要同时改版式规则和页面两处，容易脱钩。');
}

// 2. 商品图底板：整块浅色底 + 内层圆角，四周不画任何线
requireText('borderRadius: TERMINAL_SHOP_INNER_RADIUS', '商品图底板与金额条的圆角应使用版式规则常量 TERMINAL_SHOP_INNER_RADIUS（= 卡片圆角 − 内边距）。');
if (!/bg-[a-z]+-\d{2,3}[^"]*"[^>]*>\s*\n\s*<img/.test(cardBlock)) {
  failures.push('商品图底板必须靠背景色块撑出边界（底板 div 上要有 bg-* 底色），不要用线条。');
}
// 只放行键盘焦点样式（focus-visible:outline-none），其余线条一律不许出现
const cardSurface = cardBlock.replace('focus-visible:outline-none', '');
if (/\boutline\b|\bborder(-[0-9])?\b/.test(cardSurface)) {
  failures.push('商品图与底板不要描边或加实线边框：线条会在商品图外多套一圈画框，没上传图片时与图形本体明显分离，请用背景色块表达边界。');
}

// 3. 商品名上下等距：上下都用同一个 nameGap，居中由结构保证
requireText('marginTop: shopCardSpec.nameGap', '商品名行上方间距应使用 shopCardSpec.nameGap。');
requireText('marginBottom: shopCardSpec.nameGap', '商品名行下方间距应使用同一个 shopCardSpec.nameGap，否则商品名不会上下居中。');
if (/nameToPriceGap|cardPaddingBottom/.test(cardBlock)) {
  failures.push('商品名上下间距不要再拆成「与金额条的间距」和「卡片底部留白」两套值，居中会算不准。');
}

// 4. 金额条圆角与底板同源，才与卡片同心
requireText('borderRadius: TERMINAL_SHOP_INNER_RADIUS', '金额条圆角应使用版式规则常量 TERMINAL_SHOP_INNER_RADIUS。');

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货柜机商品卡片外观检查未通过');
}

console.log('✅ 货柜机商品卡片外观检查通过（底板用色块不用线条、商品名上下等距、圆角来自共享版式规则）');

