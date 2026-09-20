/**
 * 货柜机商品页版式的演示开关
 *
 * 只用于给领导汇报时现场对比「一屏放几个商品」，不参与真实终端逻辑。
 * 版式规则本身在 shared/terminalShopLayout.ts，这里只负责「当前选中哪一种版式」的存取。
 * 用 localStorage + 自定义事件，保证右侧控件与货柜机画面始终是同一份状态。
 */
import {
  DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID,
  TERMINAL_SHOP_LAYOUT_PRESETS,
  getTerminalShopLayoutPreset,
  type TerminalShopLayoutPreset,
  type TerminalShopLayoutPresetId,
} from './terminalShopLayout.ts';

export const TERMINAL_SHOP_LAYOUT_PREVIEW_STORAGE_KEY = 'cindy.terminalShopLayoutPreview';
export const TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT = 'terminal-shop-layout-preview-updated';

const isTerminalShopLayoutPresetId = (value: unknown): value is TerminalShopLayoutPresetId =>
  typeof value === 'string' && TERMINAL_SHOP_LAYOUT_PRESETS.some(preset => preset.id === value);

export const readTerminalShopLayoutPresetId = (): TerminalShopLayoutPresetId => {
  if (typeof window === 'undefined') return DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID;
  try {
    const stored = window.localStorage.getItem(TERMINAL_SHOP_LAYOUT_PREVIEW_STORAGE_KEY);
    return isTerminalShopLayoutPresetId(stored) ? stored : DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID;
  } catch {
    return DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID;
  }
};

export const readTerminalShopLayoutPreset = (): TerminalShopLayoutPreset =>
  getTerminalShopLayoutPreset(readTerminalShopLayoutPresetId());

export const writeTerminalShopLayoutPresetId = (id: string): TerminalShopLayoutPresetId => {
  const normalized = getTerminalShopLayoutPreset(id).id;
  if (typeof window === 'undefined') return normalized;

  try {
    window.localStorage.setItem(TERMINAL_SHOP_LAYOUT_PREVIEW_STORAGE_KEY, normalized);
  } catch {
    // 隐私模式等场景写不进去也不影响本次预览
  }
  window.dispatchEvent(new CustomEvent(TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT, { detail: { id: normalized } }));
  return normalized;
};
