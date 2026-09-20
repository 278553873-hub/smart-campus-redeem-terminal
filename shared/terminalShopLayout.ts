/**
 * 货柜机（终端）商品页版式规则
 *
 * 终端为 21.5 寸 1080 × 1920 竖屏，界面按 540 × 960 逻辑像素设计（1 逻辑像素 ≈ 0.5mm）。
 * 纵向空间分配：顶部栏 64 + 分类行 56 + 商品网格 840。
 * 分类行上下留白一致（各 12px）：顶部栏 → 分类标签 → 第一行商品卡片 都是 12px，
 * 因此商品网格不再额外加顶部内边距，卡片紧接分类行。
 * 卡片结构：图片区 + 商品名行 + 商品名与金额条之间的间距 + 金额条 + 底部留白。
 * 商品名在「图片底边」与「金额条顶边」之间视觉居中，金额单独成条作为卡片视觉重点。
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
 * 2 × 4：卡片变矮、图明显变小，一屏 8 个
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
/** 卡片横向与纵向间距 */
export const TERMINAL_SHOP_GRID_GAP = 14;
/** 卡片描边宽度（border-2） */
export const TERMINAL_SHOP_CARD_BORDER = 2;

/** 商品图与图片区边缘的留白，上下一致 */
export const TERMINAL_SHOP_IMAGE_PADDING = 8;
/** 商品名行高度 */
export const TERMINAL_SHOP_NAME_ROW_HEIGHT = 30;
export const TERMINAL_SHOP_NAME_FONT_SIZE = 16;
/** 商品名行与金额条之间的间距：与「图片底边 → 商品名」的视觉间距保持一致 */
export const TERMINAL_SHOP_NAME_TO_PRICE_GAP = 8;
/** 金额条高度：金额是卡片视觉重点，单独成条 */
export const TERMINAL_SHOP_PRICE_BAR_HEIGHT = 48;
export const TERMINAL_SHOP_PRICE_FONT_SIZE = 20;
/** 金额条与卡片底边的留白 */
export const TERMINAL_SHOP_CARD_PADDING_BOTTOM = 6;

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

/** 图片区高度（含商品图上下留白）= 卡片高度 − 描边 − 商品名行 − 名称与金额条间距 − 金额条 − 底部留白 */
export const getTerminalShopImageAreaHeight = (rows: number = TERMINAL_SHOP_LAYOUT.rows) =>
  getTerminalShopCardHeight(rows)
  - TERMINAL_SHOP_CARD_BORDER * 2
  - TERMINAL_SHOP_NAME_ROW_HEIGHT
  - TERMINAL_SHOP_NAME_TO_PRICE_GAP
  - TERMINAL_SHOP_PRICE_BAR_HEIGHT
  - TERMINAL_SHOP_CARD_PADDING_BOTTOM;

/** 商品图实际可占高度 = 图片区高度 − 上下留白 */
export const getTerminalShopProductImageHeight = (rows: number = TERMINAL_SHOP_LAYOUT.rows) =>
  getTerminalShopImageAreaHeight(rows) - TERMINAL_SHOP_IMAGE_PADDING * 2;

/** 商品名在图片与金额条之间的视觉间距（上下应相等） */
export const getTerminalShopNameGaps = () => {
  const halfLineBox = (TERMINAL_SHOP_NAME_ROW_HEIGHT - TERMINAL_SHOP_NAME_FONT_SIZE) / 2;
  return {
    above: TERMINAL_SHOP_IMAGE_PADDING + halfLineBox,
    below: halfLineBox + TERMINAL_SHOP_NAME_TO_PRICE_GAP,
  };
};

/** 一屏完整展示的商品数 */
export const getTerminalShopPerScreenCount = (grid: TerminalShopGrid = TERMINAL_SHOP_LAYOUT) =>
  grid.columns * grid.rows;
