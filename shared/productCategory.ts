/**
 * 货柜机商品分类规则（终端分类标签行 + PC 后台分类管理共用）
 *
 * 分类不再写死：学校在 PC 后台「货柜超市 → 分类管理」里自己维护，可新建、改名、上下移、启用禁用。
 * 分类数据与商品归属存在 shared/shopCatalogStore.ts，这里只放规则：
 * - 名称 2~10 个字，不能与已有分类重名
 * - 终端标签行只展示「当前有商品」的分类，顺序就是后台排好的顺序
 * - 只剩 1 个分类时整行不出现，此时分类标签只是噪音
 * - 商品可以没有分类，未分类商品只在「全部」里出现
 * - 停用只影响商品表单：停用的分类不能在新建 / 编辑商品时选用；
 *   货柜机上已有的分类与商品不受影响，只是不再往这个分类里放新商品
 * - 分类下有商品时不允许删除，必须先调整商品分类
 */

export interface ShopCategory {
  id: string;
  name: string;
  enabled: boolean;
}

/** 商品归属的分类映射：商品 id → 分类 id，后台改过分类的商品才会写进来 */
export type ShopProductCategoryMap = Record<string, string>;

interface CategorizedProduct {
  id: string;
  category?: string | null;
}

/** 「全部」标签不是真实分类，只是不过滤 */
export const ALL_CATEGORY_ID = 'all';

export const SHOP_CATEGORY_NAME_MIN_LENGTH = 2;
export const SHOP_CATEGORY_NAME_MAX_LENGTH = 10;

/** 分类标签行只在有 2 个及以上分类时出现 */
export const MIN_SHOP_CATEGORY_COUNT_FOR_ROW = 2;

/** 分类名归一：去掉首尾空白，中间连续空白压成一个空格 */
export const normalizeShopCategoryName = (raw: string | null | undefined): string =>
  (raw ?? '').trim().replace(/\s+/g, ' ');

export const getShopCategoryNameLength = (raw: string | null | undefined): number =>
  [...normalizeShopCategoryName(raw)].length;

/** 名称校验：返回错误文案，通过时返回 null */
export const validateShopCategoryName = (
  raw: string | null | undefined,
  categories: ShopCategory[],
  excludeCategoryId?: string,
): string | null => {
  const name = normalizeShopCategoryName(raw);
  const length = getShopCategoryNameLength(name);
  if (length === 0) return '请输入分类名称';
  if (length < SHOP_CATEGORY_NAME_MIN_LENGTH) return `分类名称至少 ${SHOP_CATEGORY_NAME_MIN_LENGTH} 个字`;
  if (length > SHOP_CATEGORY_NAME_MAX_LENGTH) return `分类名称最多 ${SHOP_CATEGORY_NAME_MAX_LENGTH} 个字`;
  if (categories.some(category => category.id !== excludeCategoryId && normalizeShopCategoryName(category.name) === name)) {
    return '分类名称不能重复';
  }
  return null;
};

/** 商品归属的分类 id：后台改过的以映射为准，没改过的用商品自带的分类 */
export const getShopProductCategoryId = (
  product: CategorizedProduct,
  productCategories: ShopProductCategoryMap = {},
): string => productCategories[product?.id]?.trim() || product?.category?.trim() || '';

/**
 * 终端标签行要展示的分类：当前有商品，顺序与后台分类列表一致（停用不影响终端展示）。
 * 分类已不存在时（历史数据）该商品按未分类处理，不会因此消失。
 */
export const getShopVisibleCategoryIds = (
  products: CategorizedProduct[],
  categories: ShopCategory[],
  productCategories: ShopProductCategoryMap = {},
): string[] => {
  const usedCategoryIds = new Set(
    products.map(product => getShopProductCategoryId(product, productCategories)).filter(Boolean),
  );
  return categories.filter(category => usedCategoryIds.has(category.id)).map(category => category.id);
};

/** 终端是否需要展示分类标签行 */
export const shouldShowShopCategoryRow = (
  products: CategorizedProduct[],
  categories: ShopCategory[],
  productCategories: ShopProductCategoryMap = {},
): boolean =>
  getShopVisibleCategoryIds(products, categories, productCategories).length >= MIN_SHOP_CATEGORY_COUNT_FOR_ROW;

export interface ShopCategoryPickerOption {
  id: string;
  name: string;
  /** 停用的分类不能再被选上 */
  disabled: boolean;
}

/**
 * 商品表单里的分类选项。
 * 停用的分类仍然保留在选项里（老商品还挂在这个分类上，编辑时要能看见），
 * 但标记为不可选：停用就是「不再往这个分类里放新商品」。
 */
export const getShopCategoryPickerOptions = (categories: ShopCategory[]): ShopCategoryPickerOption[] =>
  categories.map(category => ({ id: category.id, name: category.name, disabled: !category.enabled }));

export const getShopCategoryName = (categories: ShopCategory[], categoryId: string): string =>
  categories.find(category => category.id === categoryId)?.name ?? '';

export const findShopCategory = (categories: ShopCategory[], categoryId: string): ShopCategory | undefined =>
  categories.find(category => category.id === categoryId);

/** 分类下的商品数，用于删除校验与后台列表展示 */
export const countShopCategoryProducts = (
  products: CategorizedProduct[],
  categories: ShopCategory[],
  productCategories: ShopProductCategoryMap = {},
  categoryId?: string,
): number => products.filter(product => getShopProductCategoryId(product, productCategories) === categoryId).length;

export interface ShopCategoryDeleteCheck {
  allowed: boolean;
  productCount: number;
  reason: string;
}

/** 删除校验：分类下有商品时不允许删除 */
export const canDeleteShopCategory = (
  categoryId: string,
  products: CategorizedProduct[],
  categories: ShopCategory[],
  productCategories: ShopProductCategoryMap = {},
): ShopCategoryDeleteCheck => {
  const productCount = countShopCategoryProducts(products, categories, productCategories, categoryId);
  if (productCount === 0) return { allowed: true, productCount, reason: '' };
  return {
    allowed: false,
    productCount,
    reason: `该分类下还有 ${productCount} 个商品，请先把商品调整到其他分类`,
  };
};
