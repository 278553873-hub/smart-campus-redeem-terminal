import assert from 'node:assert/strict';
import {
  DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID,
  TERMINAL_SHOP_LAYOUT,
  TERMINAL_SHOP_LAYOUT_PRESETS,
  TERMINAL_SHOP_CARD_PADDING,
  TERMINAL_SHOP_CARD_RADIUS,
  TERMINAL_SHOP_CARD_RING,
  TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT,
  TERMINAL_SHOP_CATEGORY_GAP,
  TERMINAL_SHOP_CATEGORY_ROW_HEIGHT,
  TERMINAL_SHOP_COMPACT_CARD_SPEC,
  TERMINAL_SHOP_COMPACT_MIN_ROWS,
  TERMINAL_SHOP_GRID_GAP,
  TERMINAL_SHOP_INNER_RADIUS,
  TERMINAL_SHOP_REGULAR_CARD_SPEC,
  getTerminalShopCardHeight,
  getTerminalShopCardInnerWidth,
  getTerminalShopCardSpec,
  getTerminalShopCardWidth,
  getTerminalShopGridHeight,
  getTerminalShopImageTileHeight,
  getTerminalShopLayoutPreset,
  getTerminalShopPerScreenCount,
  toTerminalShopMillimeters,
} from './terminalShopLayout.ts';

const fitsOnOneScreen = (rows) =>
  rows * getTerminalShopCardHeight(rows) + TERMINAL_SHOP_GRID_GAP * (rows - 1) <= getTerminalShopGridHeight();

const isMultipleOf4 = (value) => Number.isInteger(value) && value % 4 === 0;

// 1. 当前版式：2 列 × 3 行，一屏完整展示 6 个商品
assert.deepEqual(TERMINAL_SHOP_LAYOUT, { columns: 2, rows: 3 });
assert.equal(getTerminalShopPerScreenCount(), 6);
assert.ok(fitsOnOneScreen(TERMINAL_SHOP_LAYOUT.rows), '2 列 × 3 行应完整放进网格区');

// 2. 分类行与顶部栏、与商品卡片的间距必须一致（上下各一个 GAP），
//    网格不再额外加顶部内边距，否则卡片会被多推下去 12px。
assert.equal(TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT + TERMINAL_SHOP_CATEGORY_GAP * 2, TERMINAL_SHOP_CATEGORY_ROW_HEIGHT);
assert.ok(TERMINAL_SHOP_CATEGORY_GAP >= 8 && TERMINAL_SHOP_CATEGORY_GAP <= 16, '分类行与上下内容的间距应在 8~16px');
assert.ok(TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT >= 32, '分类标签胶囊高度不应小于 32px');

// 3. 卡片结构等式：上下内边距 + 商品图底板 + 名称间距 + 商品名行 + 名称间距 + 金额条。
//    商品名上下两侧用的是同一个 nameGap，所以「商品名居中」是结构保证的，不靠手算半个行高。
//    卡片描边改用 1px 阴影环（box-shadow），不进等式，高度全部留给商品图底板。
assert.equal(TERMINAL_SHOP_CARD_RING, 1, '卡片描边应是 1px 阴影环而不是实线边框');
assert.equal(TERMINAL_SHOP_CARD_PADDING, 8, '卡片内边距应让底板与金额条统一内缩 8px');
for (const rows of [2, 3, 4]) {
  const spec = getTerminalShopCardSpec(rows);
  assert.equal(
    getTerminalShopCardHeight(rows),
    TERMINAL_SHOP_CARD_PADDING * 2
    + getTerminalShopImageTileHeight(rows)
    + spec.nameGap
    + spec.nameRowHeight
    + spec.nameGap
    + spec.priceBarHeight,
    rows + ' 行卡片高度应等于各结构块之和',
  );
  assert.ok(spec.nameGap >= 4 && spec.nameGap <= 12, rows + ' 行商品名上下间距应在 4~12px，当前 ' + spec.nameGap);
  assert.ok(spec.nameRowHeight >= 28, rows + ' 行商品名行不应低于 28px，否则文字被挤压');
  // 行高由字号推导（16px 字号 + 盒内上下各 7px = 30px），取偶数，文字才落在整像素上、上下留白严格相等
  assert.equal(spec.nameRowHeight % 2, 0, rows + ' 行商品名行高应是偶数，当前 ' + spec.nameRowHeight);
}

// 4. 金额条档位：金额是卡片视觉重点，任何版式都不低于 40px；
//    紧凑档把「金额条 ÷ 卡片高度」控制到与常规档接近，避免 2 × 4 时金额条显得又厚又占地方。
assert.ok(TERMINAL_SHOP_REGULAR_CARD_SPEC.priceBarHeight >= 44, '常规档金额条不应低于 44px');
assert.ok(TERMINAL_SHOP_COMPACT_CARD_SPEC.priceBarHeight >= 40, '紧凑档金额条不应低于 40px');
assert.ok(
  TERMINAL_SHOP_COMPACT_CARD_SPEC.priceBarHeight < TERMINAL_SHOP_REGULAR_CARD_SPEC.priceBarHeight,
  '紧凑档金额条应比常规档矮，把高度让给商品图底板',
);
const regularPriceRatio = TERMINAL_SHOP_REGULAR_CARD_SPEC.priceBarHeight / getTerminalShopCardHeight(3);
const compactPriceRatio = TERMINAL_SHOP_COMPACT_CARD_SPEC.priceBarHeight / getTerminalShopCardHeight(4);
assert.ok(regularPriceRatio <= 0.2, '常规档金额条占卡片高度不应超过 20%，当前 ' + (regularPriceRatio * 100).toFixed(1) + '%');
assert.ok(compactPriceRatio <= 0.22, '紧凑档金额条占卡片高度不应超过 22%，当前 ' + (compactPriceRatio * 100).toFixed(1) + '%');
assert.ok(
  Math.abs(compactPriceRatio - regularPriceRatio) <= 0.04,
  '两档金额条占比应接近，否则切换版式时金额条的视觉重量会突变',
);

// 5. 档位切换：2 × 3 与 3 × 3 走常规档，2 × 4（4 行及以上）走紧凑档
assert.equal(getTerminalShopCardSpec(TERMINAL_SHOP_COMPACT_MIN_ROWS), TERMINAL_SHOP_COMPACT_CARD_SPEC);
assert.equal(getTerminalShopCardSpec(TERMINAL_SHOP_COMPACT_MIN_ROWS - 1), TERMINAL_SHOP_REGULAR_CARD_SPEC);

// 6. 商品图够大：底板就是商品图的最大占位，常规档不小于 150px（约 74mm），紧凑档不小于 95px；
//    底板宽度等于卡片宽度减左右内边距，商品图不应比底板还宽，否则会被压成竖长条。
const regularTileHeight = getTerminalShopImageTileHeight(3);
assert.ok(regularTileHeight >= 150, '常规档商品图底板高度应不小于 150px，当前 ' + regularTileHeight + 'px');
assert.ok(
  toTerminalShopMillimeters(regularTileHeight) >= 74,
  '常规档商品图物理高度应不小于 74mm，当前 ' + toTerminalShopMillimeters(regularTileHeight).toFixed(0) + 'mm',
);
const compactTileHeight = getTerminalShopImageTileHeight(4);
assert.ok(compactTileHeight >= 95, '紧凑档商品图底板高度应不小于 95px，当前 ' + compactTileHeight + 'px');
assert.ok(
  toTerminalShopMillimeters(compactTileHeight) >= 45,
  '紧凑档商品图物理高度应不小于 45mm，当前 ' + toTerminalShopMillimeters(compactTileHeight).toFixed(0) + 'mm',
);
assert.ok(compactTileHeight < regularTileHeight, '紧凑档底板应小于常规档，这是行数变多的必然结果，靠收窄金额条来补偿');
assert.equal(
  getTerminalShopCardInnerWidth(),
  getTerminalShopCardWidth() - TERMINAL_SHOP_CARD_PADDING * 2,
  '底板宽度应由卡片宽度减左右内边距推导',
);
assert.ok(regularTileHeight <= getTerminalShopCardInnerWidth(), '商品图不应高于底板宽度，避免被压成竖长条');

// 7. 文字区（名称上下间距 + 商品名行 + 金额条）最多占卡片高度 45%，
//    超过就是「图小字大」，商品看不清。
for (const rows of [3, 4]) {
  const spec = getTerminalShopCardSpec(rows);
  const textArea = spec.nameGap * 2 + spec.nameRowHeight + spec.priceBarHeight;
  const ratio = textArea / getTerminalShopCardHeight(rows);
  assert.ok(ratio <= 0.45, rows + ' 行文字区占卡片高度不应超过 45%，当前 ' + (ratio * 100).toFixed(1) + '%');
}

// 8. 圆角同心规则：内层色块（商品图底板、金额条）圆角 = 外层卡片圆角 − 内边距（16 − 8 = 8），
//    否则色块四角会与卡片圆角的弧度错开。
assert.equal(TERMINAL_SHOP_CARD_RADIUS, 16);
assert.equal(TERMINAL_SHOP_INNER_RADIUS, TERMINAL_SHOP_CARD_RADIUS - TERMINAL_SHOP_CARD_PADDING);
assert.equal(TERMINAL_SHOP_INNER_RADIUS, 8);
assert.ok(TERMINAL_SHOP_INNER_RADIUS >= 8, '内层色块圆角不应小于 8px，太小看不出圆角');

// 9. 三套版式共用的间距、留白与圆角都取 4px 刻度，避免出现 13px、18px 这类随手写的数值
for (const [name, value] of [
  ['网格间距', TERMINAL_SHOP_GRID_GAP],
  ['卡片内边距', TERMINAL_SHOP_CARD_PADDING],
  ['分类行间距', TERMINAL_SHOP_CATEGORY_GAP],
  ['卡片圆角', TERMINAL_SHOP_CARD_RADIUS],
  ['内层色块圆角', TERMINAL_SHOP_INNER_RADIUS],
  ['商品名上下间距', TERMINAL_SHOP_REGULAR_CARD_SPEC.nameGap],
  ['金额条高度', TERMINAL_SHOP_REGULAR_CARD_SPEC.priceBarHeight],
]) {
  assert.ok(isMultipleOf4(value), name + ' 应是 4 的倍数，当前 ' + value);
}

// 10. 备选版式：3 列 × 4 行一屏 12 个，同样要完整放进网格区
assert.ok(fitsOnOneScreen(4), '4 行应完整放进网格区');
assert.equal(getTerminalShopPerScreenCount({ columns: 3, rows: 4 }), 12);

// 11. 底板高度只由行数决定：2 列 × 4 行与 3 列 × 4 行的底板一样高，
//     但 3 列 × 4 行一屏多 4 个商品，所以加量时应选 3 列 × 4 行而不是 2 列 × 4 行。
const compactSpec = getTerminalShopCardSpec(4);
assert.equal(
  getTerminalShopImageTileHeight(4),
  getTerminalShopCardHeight(4)
  - TERMINAL_SHOP_CARD_PADDING * 2
  - compactSpec.nameGap * 2
  - compactSpec.nameRowHeight
  - compactSpec.priceBarHeight,
);
assert.ok(getTerminalShopPerScreenCount({ columns: 3, rows: 4 }) > getTerminalShopPerScreenCount({ columns: 2, rows: 4 }));

// 12. 演示可切换的 3 种版式：每种都要完整放进网格区，且卡片不能小到点不动
assert.deepEqual(TERMINAL_SHOP_LAYOUT_PRESETS.map(preset => preset.id), ['2x3', '2x4', '3x3']);
assert.equal(getTerminalShopPerScreenCount(getTerminalShopLayoutPreset('2x3')), 6);
assert.equal(getTerminalShopPerScreenCount(getTerminalShopLayoutPreset('2x4')), 8);
assert.equal(getTerminalShopPerScreenCount(getTerminalShopLayoutPreset('3x3')), 9);
const defaultPreset = getTerminalShopLayoutPreset(DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID);
assert.equal(defaultPreset.columns, TERMINAL_SHOP_LAYOUT.columns, '默认版式要与终端当前版式一致');
assert.equal(defaultPreset.rows, TERMINAL_SHOP_LAYOUT.rows, '默认版式要与终端当前版式一致');
assert.equal(getTerminalShopLayoutPreset('9x9').id, DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID, '未知版式要回退默认');

for (const preset of TERMINAL_SHOP_LAYOUT_PRESETS) {
  const tileHeight = getTerminalShopImageTileHeight(preset.rows);
  const innerWidth = getTerminalShopCardInnerWidth(preset.columns);
  assert.ok(fitsOnOneScreen(preset.rows), preset.id + ' 应完整放进网格区，不能出现半截卡片');
  assert.ok(getTerminalShopCardWidth(preset.columns) >= 150, preset.id + ' 卡片宽度不应小于 150px（约 75mm）');
  assert.ok(getTerminalShopCardHeight(preset.rows) >= 190, preset.id + ' 卡片高度不应小于 190px');
  assert.ok(innerWidth >= 130, preset.id + ' 商品图底板宽度不应小于 130px（约 64mm），当前 ' + innerWidth + 'px');
  assert.ok(tileHeight >= 80, preset.id + ' 商品图底板高度不应小于 80px（约 40mm），当前 ' + tileHeight + 'px');
}

// 13. 3 列时商品图是「宽度受限」：底板宽度比底板高度还小，图会按宽度缩放
assert.ok(
  getTerminalShopCardInnerWidth(3) < getTerminalShopImageTileHeight(3),
  '3 列版式下商品图应由底板宽度决定显示大小',
);
console.log('✅ 货柜机商品页版式规则断言测试通过（默认 2 × 3 + 3 种可选版式都能完整放下，商品名上下等距、圆角同心、刻度一致）');

