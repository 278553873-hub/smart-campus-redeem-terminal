/**
 * 货柜机（终端）商品页版式规则
 *
 * 终端为 21.5 寸 1080 × 1920 竖屏，界面按 540 × 960 逻辑像素设计（1 逻辑像素 ≈ 0.5mm）。
 * 纵向空间分配：顶部栏 64 + 分类行 56 + 商品网格 840。
 * 分类行上下留白一致（各 12px）：顶部栏 → 分类标签 → 第一行商品卡片 都是 12px，
 * 因此商品网格不再额外加顶部内边距，卡片紧接分类行。
 *
 * 卡片自上而下（左右与上下内缩同一个 CARD_PADDING）：
 *   商品图底板（整块浅色圆角底，商品图直接铺在底板上，四周不画线）
 *   ↕ 名称间距（nameGap）
 *   商品名行
 *   ↕ 名称间距（nameGap，与上面那个相等）
 *   金额条（独立蓝底条，卡片视觉重点）
 *
 * 三条不变量：
 * 1) 商品名上下两侧的间距相等，居中由结构保证，不靠手算「半个行高」凑；
 * 2) 内层色块（商品图底板、金额条）圆角 = 卡片圆角 − 内边距（16 − 8 = 8），同心不打架；
 * 3) 商品图四周不描边。底板这块浅色就是商品图的边界，描边会在图外再套一圈画框：
 *    没上传图片时用的是默认 3D 图标，图形本体只占画布一部分，画框会和图形本体明显分离。
 *
 * 卡片内距按行数分两档（getTerminalShopCardSpec）：
 * - 常规档（2 × 3、3 × 3）：卡片高，商品图底板本身就够大，金额条保持 48px
 * - 紧凑档（2 × 4，4 行及以上）：卡片变矮，只收金额条，把高度还给商品图；
 *   否则文字区会从卡片的三分之一涨到接近一半，商品图被压成一条横带
 *
 * 所有间距取 4 的倍数（4 / 8 / 12 / 16 / 24），三套版式共用一套刻度。
 */

export interface TerminalShopGrid {
  columns: number;
  rows: number;
}

/** 当前启用版式：2 列 × 3 行，一屏 6 个商品 */
export const TERMINAL_SHOP_LAYOUT: TerminalShopGrid = { columns: 2, rows: 3 };

export type TerminalShopLayoutPresetId = '2x3' | '2x4' | '3x3';

export interface TerminalShopLayoutPreset extends TerminalShopGrid {
  id: TerminalShopLayoutPresetId;
  /** 演示控件上的按钮文案 */
  label: string;
}

/**
 * 给领导汇报时可在货柜机演示页右侧直接切换的 3 种版式。
 * 2 × 3：卡片最大、商品图最大，一屏 6 个（当前默认）
 * 2 × 4：卡片变矮、文字区转紧凑档，一屏 8 个
 * 3 × 3：卡片变窄、一屏 9 个，商品图受卡片宽度限制
 */
export const TERMINAL_SHOP_LAYOUT_PRESETS: readonly TerminalShopLayoutPreset[] = [
  { id: '2x3', label: '2 × 3', columns: 2, rows: 3 },
  { id: '2x4', label: '2 × 4', columns: 2, rows: 4 },
  { id: '3x3', label: '3 × 3', columns: 3, rows: 3 },
];

export const DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID: TerminalShopLayoutPresetId = '2x3';

/** 取版式：未知 id 一律回退到默认版式，避免历史配置把页面打崩 */
export const getTerminalShopLayoutPreset = (id: string): TerminalShopLayoutPreset =>
  TERMINAL_SHOP_LAYOUT_PRESETS.find(preset => preset.id === id) ?? TERMINAL_SHOP_LAYOUT_PRESETS[0];

export const TERMINAL_SHOP_SCREEN_WIDTH = 540;
export const TERMINAL_SHOP_SCREEN_HEIGHT = 960;
/** 顶部栏：返回首页 + 成长币余额 */
export const TERMINAL_SHOP_HEADER_HEIGHT = 64;

/** 分类行与顶部栏、与第一行商品卡片之间的统一间距 */
export const TERMINAL_SHOP_CATEGORY_GAP = 12;
/** 分类标签胶囊高度与文字号 */
export const TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT = 32;
export const TERMINAL_SHOP_CATEGORY_FONT_SIZE = 15;
/** 分类行总高 = 胶囊 32 + 上下留白各 12 */
export const TERMINAL_SHOP_CATEGORY_ROW_HEIGHT =
  TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT + TERMINAL_SHOP_CATEGORY_GAP * 2;

/** 网格区左右内边距 */
export const TERMINAL_SHOP_GRID_PADDING_X = 24;
/** 卡片横向与纵向间距（4 的倍数，与卡片内距同一套刻度） */
export const TERMINAL_SHOP_GRID_GAP = 12;

/** 卡片描边：1px 阴影环，不占布局高度（改用 box-shadow 实现，见 ShopView） */
export const TERMINAL_SHOP_CARD_RING = 1;
/** 卡片内边距：卡片边缘到「商品图底板」「金额条」的统一内缩 */
export const TERMINAL_SHOP_CARD_PADDING = 8;
/** 卡片外圆角 */
export const TERMINAL_SHOP_CARD_RADIUS = 16;
/** 内层色块圆角（商品图底板、金额条共用）：同心规则 = 卡片圆角 − 内边距 */
export const TERMINAL_SHOP_INNER_RADIUS = TERMINAL_SHOP_CARD_RADIUS - TERMINAL_SHOP_CARD_PADDING;

export const TERMINAL_SHOP_NAME_FONT_SIZE = 16;
export const TERMINAL_SHOP_PRICE_FONT_SIZE = 20;

/** 卡片文字区的三块尺寸：商品名行 / 名称上下间距 / 金额条 */
export interface TerminalShopCardSpec {
  /** 商品名行高度 */
  nameRowHeight: number;
  /** 商品名行上下间距：与底板、与金额条都取这个值，两侧相等商品名才真正居中 */
  nameGap: number;
  /** 金额条高度：金额是卡片视觉重点，单独成条 */
  priceBarHeight: number;
}

/** 常规档：2 × 3 与 3 × 3 */
export const TERMINAL_SHOP_REGULAR_CARD_SPEC: TerminalShopCardSpec = {
  nameRowHeight: 30,
  nameGap: 8,
  priceBarHeight: 48,
};

/**
 * 紧凑档：2 × 4（4 行及以上）。
 * 卡片变矮时商品名行与间距保持不变（再压文字会挤），只收金额条，
 * 让「金额条 ÷ 卡片高度」从 24% 回到与 2 × 3 接近的 20%。
 */
export const TERMINAL_SHOP_COMPACT_CARD_SPEC: TerminalShopCardSpec = {
  ...TERMINAL_SHOP_REGULAR_CARD_SPEC,
  priceBarHeight: 40,
};

/** 行数达到这个值就启用紧凑档 */
export const TERMINAL_SHOP_COMPACT_MIN_ROWS = 4;

/** 按行数取卡片内距档位 */
export const getTerminalShopCardSpec = (rows: number = TERMINAL_SHOP_LAYOUT.rows): TerminalShopCardSpec =>
  rows >= TERMINAL_SHOP_COMPACT_MIN_ROWS ? TERMINAL_SHOP_COMPACT_CARD_SPEC : TERMINAL_SHOP_REGULAR_CARD_SPEC;

/** 屏幕物理像素密度：21.5 寸 1080 × 1920 竖屏，1 逻辑像素 = 2 物理像素 */
const PHYSICAL_PIXELS_PER_INCH = Math.hypot(1080, 1920) / 21.5;
const LOGICAL_PIXELS_PER_INCH = PHYSICAL_PIXELS_PER_INCH / 2;

/** 1 个逻辑像素对应的物理毫米数（约 0.5mm），用于校验图片与触控热区的真实大小 */
export const TERMINAL_SHOP_MM_PER_PIXEL = 25.4 / LOGICAL_PIXELS_PER_INCH;

export const toTerminalShopMillimeters = (logicalPixels: number) => logicalPixels * TERMINAL_SHOP_MM_PER_PIXEL;

/** 商品网格可用高度：扣除顶部栏与分类行（分类行已包含上下统一间距） */
export const getTerminalShopGridHeight = () =>
  TERMINAL_SHOP_SCREEN_HEIGHT - TERMINAL_SHOP_HEADER_HEIGHT - TERMINAL_SHOP_CATEGORY_ROW_HEIGHT;

/** 卡片宽度 =（屏宽 − 左右内边距 − 列间距）÷ 列数 */
export const getTerminalShopCardWidth = (columns: number = TERMINAL_SHOP_LAYOUT.columns) =>
  Math.floor(
    (TERMINAL_SHOP_SCREEN_WIDTH - TERMINAL_SHOP_GRID_PADDING_X * 2 - TERMINAL_SHOP_GRID_GAP * (columns - 1)) / columns,
  );

/** 卡片高度 =（网格区可用高度 − 行间距）÷ 行数 */
export const getTerminalShopCardHeight = (rows: number = TERMINAL_SHOP_LAYOUT.rows) =>
  Math.floor((getTerminalShopGridHeight() - TERMINAL_SHOP_GRID_GAP * (rows - 1)) / rows);

/** 卡片内容区宽度 = 卡片宽度 − 左右内边距（商品图底板与金额条同宽） */
export const getTerminalShopCardInnerWidth = (columns: number = TERMINAL_SHOP_LAYOUT.columns) =>
  getTerminalShopCardWidth(columns) - TERMINAL_SHOP_CARD_PADDING * 2;

/**
 * 商品图底板高度 = 卡片高度 − 上下内边距 − 商品名上下间距 − 商品名行 − 金额条。
 * 底板就是商品图的最大占位，商品图不再另有内缩，所以这个值也是商品图可占的最大高度。
 */
export const getTerminalShopImageTileHeight = (rows: number = TERMINAL_SHOP_LAYOUT.rows) => {
  const spec = getTerminalShopCardSpec(rows);
  return getTerminalShopCardHeight(rows)
    - TERMINAL_SHOP_CARD_PADDING * 2
    - spec.nameGap * 2
    - spec.nameRowHeight
    - spec.priceBarHeight;
};

/** 一屏完整展示的商品数 */
export const getTerminalShopPerScreenCount = (grid: TerminalShopGrid = TERMINAL_SHOP_LAYOUT) =>
  grid.columns * grid.rows;

