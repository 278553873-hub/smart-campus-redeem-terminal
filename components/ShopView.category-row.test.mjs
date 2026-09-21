import { readFileSync } from 'node:fs';

const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../shared/terminalShopLayout.ts', import.meta.url), 'utf8');
const categorySource = readFileSync(new URL('../shared/productCategory.ts', import.meta.url), 'utf8');

const failures = [];
const requireText = (text, message) => {
  if (!shopSource.includes(text)) failures.push(message);
};

// 1. 分类标签行必须固定在返回栏下方，不能放进商品滚动容器里
const scrollContainerIndex = shopSource.indexOf('ref={scrollRef}');
const categoryRowIndex = shopSource.indexOf('aria-label="商品分类"');
if (categoryRowIndex < 0) failures.push('商品页缺少分类标签行（aria-label="商品分类"）。');
if (!(categoryRowIndex >= 0 && categoryRowIndex < scrollContainerIndex)) {
  failures.push('分类标签行应在商品滚动容器之外，滚动商品时分类不应跟着滚走。');
}

// 2. 标签行高度必须来自版式规则，不能各页写死
requireText('height: TERMINAL_SHOP_CATEGORY_ROW_HEIGHT', '分类标签行高度应使用版式规则常量。');
requireText('height: TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT', '分类标签胶囊高度应使用版式规则常量。');
if (!layoutSource.includes('TERMINAL_SHOP_CATEGORY_ROW_HEIGHT')) {
  failures.push('版式规则里应导出分类行高度。');
}
if (/TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT = (\d+)/.test(layoutSource)) {
  const chip = Number(/TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT = (\d+)/.exec(layoutSource)[1]);
  if (chip < 32) failures.push(`分类标签胶囊高度 ${chip}px 偏小，触控热区不足。`);
} else {
  failures.push('版式规则里应给出分类标签胶囊高度。');
}

// 3. 分类由 PC 后台维护，终端只读同一份数据，且按「当前有商品」收敛标签
if (!shopSource.includes('useShopCatalog')) {
  failures.push('分类数据应来自 PC 后台维护的共享分类表。');
}
if (!shopSource.includes('getShopVisibleCategoryIds(standardProducts, shopCategories, shopProductCategories)')) {
  failures.push('分类标签应只展示当前有未售罄商品的分类，且保持后台排好的顺序。');
}
if (!shopSource.includes('ALL_CATEGORY_ID')) {
  failures.push('分类标签行应包含「全部」入口。');
}
if (shopSource.includes('isShopProductVisibleOnTerminal')) {
  failures.push('分类启停只影响后台商品表单，终端展示不应按分类启用状态过滤商品。');
}
if (!shopSource.includes("products.filter(p => p.type === 'standard')")) {
  failures.push('终端商品只展示标准商品，应显式按商品类型过滤。');
}
if (!categorySource.includes('Number(product.stock ?? 0) > 0')) {
  failures.push('分类标签行只统计还有可售库存的商品，商品全部售罄的分类不应再占一个标签。');
}
if (!categorySource.includes('SHOP_CATEGORY_NAME_MAX_LENGTH')) {
  failures.push('分类规则应约束分类名称字数上限。');
}

// 4. 切换分类后应回到列表顶部，避免停在上一分类的滚动位置
if (!shopSource.includes('scrollRef.current?.scrollTo({ top: 0 })')) {
  failures.push('切换分类后应把商品列表滚回顶部。');
}

// 5. 只有一个分类时整行不出现（分类行必须按条件渲染）
if (!shopSource.includes('shouldShowShopCategoryRow(standardProducts, shopCategories, shopProductCategories)')) {
  failures.push('分类行应只在当前有 2 个及以上分类时展示。');
}
if (!/\{showCategoryRow && \(/.test(shopSource)) {
  failures.push('分类标签行必须按 showCategoryRow 条件渲染，只有一个分类时整行不能出现。');
}
if (!categorySource.includes('MIN_SHOP_CATEGORY_COUNT_FOR_ROW')) {
  failures.push('分类规则应给出「至少几个分类才展示分类行」的常量。');
}

// 6. 商品列表的展示顺序由共享排序规则决定：可购买在前（越贵越靠下），售罄沉底
if (!shopSource.includes('const visibleProducts = sortShopProductsForShelf(')) {
  failures.push('商品列表应使用货架展示排序（可购买在前、售罄沉底）。');
}
if (!shopSource.includes('getProductImage(product)')) {
  failures.push('商品图应走 getProductImage，没上传图片的商品要回退成默认商品图，不能出现空 src。');
}

// 7. 分类下没有商品时要有空状态，不能是一片白
requireText('这个分类还没有商品', '空分类应有空状态文案。');

// 8. 商品版式要能跟着演示控件实时切换：卡片尺寸按当前版式推导，不能写死在模块顶部
if (!shopSource.includes('readTerminalShopLayoutPresetId')) {
  failures.push('商品页版式应可在演示时切换（读取版式演示开关）。');
}
if (!shopSource.includes('TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT')) {
  failures.push('切换版式后商品页要能同步重排（监听版式变更事件）。');
}
if (!shopSource.includes('getTerminalShopCardHeight(shopLayout.rows)')) {
  failures.push('卡片高度应按当前版式的行数推导。');
}
if (shopSource.includes('const SHOP_CARD_HEIGHT =')) {
  failures.push('卡片高度不能写成模块级常量，否则演示时切版式不生效。');
}

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货柜机商品页分类标签行检查未通过');
}

console.log('✅ 货柜机商品页分类标签行检查通过（位置固定、单分类不出行、按价格升序展示、版式可切换）');

