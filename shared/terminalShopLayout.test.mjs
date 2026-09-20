import assert from 'node:assert/strict';
import {
  DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID,
  TERMINAL_SHOP_LAYOUT,
  TERMINAL_SHOP_LAYOUT_PRESETS,
  TERMINAL_SHOP_CARD_BORDER,
  TERMINAL_SHOP_CARD_PADDING_BOTTOM,
  TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT,
  TERMINAL_SHOP_CATEGORY_GAP,
  TERMINAL_SHOP_CATEGORY_ROW_HEIGHT,
  TERMINAL_SHOP_GRID_GAP,
  TERMINAL_SHOP_IMAGE_PADDING,
  TERMINAL_SHOP_NAME_ROW_HEIGHT,
  TERMINAL_SHOP_NAME_TO_PRICE_GAP,
  TERMINAL_SHOP_PRICE_BAR_HEIGHT,
  getTerminalShopCardHeight,
  getTerminalShopCardWidth,
  getTerminalShopGridHeight,
  getTerminalShopImageAreaHeight,
  getTerminalShopLayoutPreset,
  getTerminalShopNameGaps,
  getTerminalShopPerScreenCount,
  getTerminalShopProductImageHeight,
  toTerminalShopMillimeters,
} from './terminalShopLayout.ts';

const fitsOnOneScreen = (rows) =>
  rows * getTerminalShopCardHeight(rows) + TERMINAL_SHOP_GRID_GAP * (rows - 1) <= getTerminalShopGridHeight();

// 1. 当前版式：2 列 × 3 行，一屏完整展示 6 个商品
assert.deepEqual(TERMINAL_SHOP_LAYOUT, { columns: 2, rows: 3 });
assert.equal(getTerminalShopPerScreenCount(), 6);
assert.ok(fitsOnOneScreen(TERMINAL_SHOP_LAYOUT.rows), '2 列 × 3 行应完整放进网格区');

// 2. 分类行与顶部栏、与商品卡片的间距必须一致（上下各一个 GAP），
//    网格不再额外加顶部内边距，否则卡片会被多推下去 12px。
assert.equal(TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT + TERMINAL_SHOP_CATEGORY_GAP * 2, TERMINAL_SHOP_CATEGORY_ROW_HEIGHT);
assert.ok(TERMINAL_SHOP_CATEGORY_GAP >= 8 && TERMINAL_SHOP_CATEGORY_GAP <= 16, '分类行与上下内容的间距应在 8~16px');
assert.ok(TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT >= 32, '分类标签胶囊高度不应小于 32px');

// 3. 商品名在「图片底边」与「金额条顶边」之间视觉居中：两段间距必须相等
const nameGaps = getTerminalShopNameGaps();
assert.equal(nameGaps.above, nameGaps.below, `商品名上下间距应相等，当前上 ${nameGaps.above}px、下 ${nameGaps.below}px`);

// 4. 卡片结构：图片区 + 商品名行 + 名称与金额条间距 + 金额条 + 底部留白
assert.equal(
  getTerminalShopCardHeight(),
  getTerminalShopImageAreaHeight()
  + TERMINAL_SHOP_CARD_BORDER * 2
  + TERMINAL_SHOP_NAME_ROW_HEIGHT
  + TERMINAL_SHOP_NAME_TO_PRICE_GAP
  + TERMINAL_SHOP_PRICE_BAR_HEIGHT
  + TERMINAL_SHOP_CARD_PADDING_BOTTOM,
);
assert.ok(TERMINAL_SHOP_NAME_ROW_HEIGHT >= 28, '商品名行不应低于 28px，否则文字被挤压');
assert.ok(TERMINAL_SHOP_PRICE_BAR_HEIGHT >= 44, '金额条不应低于 44px，金额是卡片视觉重点');

// 5. 商品图仍然够大：实际可占高度不小于 150px（约 74mm），且保持横向取景
const productImageHeight = getTerminalShopProductImageHeight();
const cardWidth = getTerminalShopCardWidth();
assert.ok(productImageHeight >= 150, `商品图实际高度应不小于 150px，当前 ${productImageHeight}px`);
assert.ok(
  toTerminalShopMillimeters(productImageHeight) >= 74,
  `商品图物理高度应不小于 74mm，当前 ${toTerminalShopMillimeters(productImageHeight).toFixed(0)}mm`,
);
assert.ok(productImageHeight <= cardWidth - TERMINAL_SHOP_CARD_BORDER * 2, '商品图不应高于卡片内宽，避免被压成竖长条');
assert.ok(TERMINAL_SHOP_IMAGE_PADDING * 2 < getTerminalShopImageAreaHeight() / 2, '商品图留白不应吃掉图片区一半高度');

// 6. 备选版式：3 列 × 4 行一屏 12 个，同样要完整放进网格区
assert.ok(fitsOnOneScreen(4), '4 行应完整放进网格区');
assert.equal(getTerminalShopPerScreenCount({ columns: 3, rows: 4 }), 12);

// 7. 图片区高度只由行数决定：2 列 × 4 行与 3 列 × 4 行的图一样大，
//    但 3 列 × 4 行一屏多 4 个商品，所以加量时应选 3 列 × 4 行而不是 2 列 × 4 行。
assert.equal(
  getTerminalShopImageAreaHeight(4),
  getTerminalShopCardHeight(4)
  - TERMINAL_SHOP_CARD_BORDER * 2
  - TERMINAL_SHOP_NAME_ROW_HEIGHT
  - TERMINAL_SHOP_NAME_TO_PRICE_GAP
  - TERMINAL_SHOP_PRICE_BAR_HEIGHT
  - TERMINAL_SHOP_CARD_PADDING_BOTTOM,
);
assert.ok(getTerminalShopPerScreenCount({ columns: 3, rows: 4 }) > getTerminalShopPerScreenCount({ columns: 2, rows: 4 }));

// 8. 演示可切换的 3 种版式：每种都要完整放进网格区，且卡片不能小到点不动
assert.deepEqual(TERMINAL_SHOP_LAYOUT_PRESETS.map(preset => preset.id), ['2x3', '2x4', '3x3']);
assert.equal(getTerminalShopPerScreenCount(getTerminalShopLayoutPreset('2x3')), 6);
assert.equal(getTerminalShopPerScreenCount(getTerminalShopLayoutPreset('2x4')), 8);
assert.equal(getTerminalShopPerScreenCount(getTerminalShopLayoutPreset('3x3')), 9);
const defaultPreset = getTerminalShopLayoutPreset(DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID);
assert.equal(defaultPreset.columns, TERMINAL_SHOP_LAYOUT.columns, '默认版式要与终端当前版式一致');
assert.equal(defaultPreset.rows, TERMINAL_SHOP_LAYOUT.rows, '默认版式要与终端当前版式一致');
assert.equal(getTerminalShopLayoutPreset('9x9').id, DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID, '未知版式要回退默认');

for (const preset of TERMINAL_SHOP_LAYOUT_PRESETS) {
  assert.ok(fitsOnOneScreen(preset.rows), preset.id + ' 应完整放进网格区，不能出现半截卡片');
  assert.ok(getTerminalShopCardWidth(preset.columns) >= 150, preset.id + ' 卡片宽度不应小于 150px（约 75mm）');
  assert.ok(getTerminalShopCardHeight(preset.rows) >= 190, preset.id + ' 卡片高度不应小于 190px');
  assert.ok(
    getTerminalShopProductImageHeight(preset.rows) >= 80,
    preset.id + ' 商品图实际高度不应小于 80px（约 40mm），当前 ' + getTerminalShopProductImageHeight(preset.rows) + 'px',
  );
}

// 9. 3 列时商品图是「宽度受限」：卡内宽减左右留白后比图区高度还窄，图会按宽度缩放
assert.ok(
  getTerminalShopCardWidth(3) - TERMINAL_SHOP_CARD_BORDER * 2 - TERMINAL_SHOP_IMAGE_PADDING * 2
  < getTerminalShopProductImageHeight(3),
  '3 列版式下商品图应由卡片宽度决定显示大小',
);
console.log('✅ 货柜机商品页版式规则断言测试通过（默认 2 × 3 + 3 种可选版式都能完整放下）');
