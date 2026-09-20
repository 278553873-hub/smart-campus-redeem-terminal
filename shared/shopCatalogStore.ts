/**
 * 货柜超市分类数据（PC 后台维护，终端读取同一份）
 *
 * 学校在 PC 后台「货柜超市 → 分类管理」里新建、改名、拖动排序、启停分类，
 * 再把商品挂到分类上；终端货柜机的分类标签行读的就是这份数据，改完立刻生效。
 *
 * 数据只存分类表与「商品 → 分类」的归属：
 * - 分类表：完整持久化，初始值是与终端现有标签一致的 5 个分类，学校可以继续改
 * - 商品归属：只记录后台改过的商品，没改过的沿用商品自带分类（constants.tsx 里的种子数据）
 * 用 localStorage + 自定义事件，沿用本项目既有做法，保证后台与终端是同一份状态。
 */
import {
  normalizeShopCategoryName,
  validateShopCategoryName,
  type ShopCategory,
  type ShopProductCategoryMap,
} from './productCategory.ts';

export interface ShopCatalogState {
  categories: ShopCategory[];
  productCategories: ShopProductCategoryMap;
}

export const SHOP_CATALOG_STORAGE_KEY = 'cindy.shopCatalog';
export const SHOP_CATALOG_UPDATED_EVENT = 'shop-catalog-updated';

/** 初始分类：与终端现有标签一致，学校可改名、排序、启停或继续新增 */
export const DEFAULT_SHOP_CATEGORIES: ShopCategory[] = [
  { id: 'stationery', name: '文具', enabled: true },
  { id: 'cultural', name: '文创', enabled: true },
  { id: 'toy', name: '玩具', enabled: true },
  { id: 'snack', name: '零食', enabled: true },
  { id: 'privilege', name: '特权', enabled: true },
];

export const createEmptyShopCatalog = (): ShopCatalogState => ({
  categories: DEFAULT_SHOP_CATEGORIES.map(category => ({ ...category })),
  productCategories: {},
});

export const createShopCategoryId = (): string =>
  `cat_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const isShopCategory = (value: unknown): value is ShopCategory => {
  if (!value || typeof value !== 'object') return false;
  const category = value as Partial<ShopCategory>;
  return typeof category.id === 'string' && typeof category.name === 'string' && typeof category.enabled === 'boolean';
};

/** 容错：脏数据、旧数据结构一律回退，避免把后台或终端打崩 */
export const normalizeShopCatalog = (raw: unknown): ShopCatalogState => {
  if (!raw || typeof raw !== 'object') return createEmptyShopCatalog();
  const candidate = raw as Partial<ShopCatalogState>;
  const categories = Array.isArray(candidate.categories)
    ? candidate.categories.filter(isShopCategory).map(category => ({
      id: category.id,
      name: normalizeShopCategoryName(category.name),
      enabled: category.enabled,
    })).filter(category => category.name.length > 0)
    : [];
  const productCategories: ShopProductCategoryMap = {};
  if (candidate.productCategories && typeof candidate.productCategories === 'object') {
    for (const [productId, categoryId] of Object.entries(candidate.productCategories)) {
      if (typeof productId === 'string' && typeof categoryId === 'string' && categoryId.trim()) {
        productCategories[productId] = categoryId.trim();
      }
    }
  }
  return {
    categories: categories.length > 0 ? categories : createEmptyShopCatalog().categories,
    productCategories,
  };
};

export const readShopCatalog = (): ShopCatalogState => {
  if (typeof window === 'undefined') return createEmptyShopCatalog();
  try {
    const stored = window.localStorage.getItem(SHOP_CATALOG_STORAGE_KEY);
    if (!stored) return createEmptyShopCatalog();
    return normalizeShopCatalog(JSON.parse(stored));
  } catch {
    return createEmptyShopCatalog();
  }
};

export const writeShopCatalog = (next: ShopCatalogState): ShopCatalogState => {
  const normalized = normalizeShopCatalog(next);
  if (typeof window === 'undefined') return normalized;
  try {
    window.localStorage.setItem(SHOP_CATALOG_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // 隐私模式等场景写不进去也不影响本次使用
  }
  window.dispatchEvent(new CustomEvent(SHOP_CATALOG_UPDATED_EVENT));
  return normalized;
};

/** 订阅分类数据变更：后台改完，终端（同一窗口的另一处渲染）跟着刷新 */
export const subscribeShopCatalog = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => { };
  const handler = () => listener();
  window.addEventListener(SHOP_CATALOG_UPDATED_EVENT, handler);
  return () => window.removeEventListener(SHOP_CATALOG_UPDATED_EVENT, handler);
};

export type ShopCatalogAction =
  | { type: 'createCategory'; name: string }
  | { type: 'renameCategory'; categoryId: string; name: string }
  | { type: 'setCategoryEnabled'; categoryId: string; enabled: boolean }
  | { type: 'reorderCategory'; categoryId: string; toIndex: number }
  | { type: 'removeCategory'; categoryId: string }
  | { type: 'assignProductCategory'; productId: string; categoryId: string };

/** 分类数据变更的纯函数：名称不合法、分类不存在、越界移动都原样返回 */
export const applyShopCatalogAction = (
  catalog: ShopCatalogState,
  action: ShopCatalogAction,
): ShopCatalogState => {
  const current = normalizeShopCatalog(catalog);
  switch (action.type) {
    case 'createCategory': {
      if (validateShopCategoryName(action.name, current.categories)) return current;
      const category: ShopCategory = {
        id: createShopCategoryId(),
        name: normalizeShopCategoryName(action.name),
        enabled: true,
      };
      // 新建的分类排到最后，学校再拖动手柄调整顺序
      return { ...current, categories: [...current.categories, category] };
    }
    case 'renameCategory': {
      if (!current.categories.some(category => category.id === action.categoryId)) return current;
      if (validateShopCategoryName(action.name, current.categories, action.categoryId)) return current;
      const name = normalizeShopCategoryName(action.name);
      return {
        ...current,
        categories: current.categories.map(category => (category.id === action.categoryId ? { ...category, name } : category)),
      };
    }
    case 'setCategoryEnabled': {
      if (!current.categories.some(category => category.id === action.categoryId)) return current;
      return {
        ...current,
        categories: current.categories.map(category => (
          category.id === action.categoryId ? { ...category, enabled: action.enabled } : category
        )),
      };
    }
    case 'reorderCategory': {
      const index = current.categories.findIndex(category => category.id === action.categoryId);
      const targetIndex = Math.max(0, Math.min(current.categories.length - 1, Math.trunc(action.toIndex)));
      if (index < 0 || !Number.isFinite(action.toIndex) || targetIndex === index) return current;
      const categories = [...current.categories];
      const [movedCategory] = categories.splice(index, 1);
      categories.splice(targetIndex, 0, movedCategory);
      return { ...current, categories };
    }
    case 'removeCategory': {
      if (!current.categories.some(category => category.id === action.categoryId)) return current;
      const productCategories = { ...current.productCategories };
      for (const [productId, categoryId] of Object.entries(productCategories)) {
        if (categoryId === action.categoryId) delete productCategories[productId];
      }
      return {
        categories: current.categories.filter(category => category.id !== action.categoryId),
        productCategories,
      };
    }
    case 'assignProductCategory': {
      const productId = action.productId?.trim();
      const categoryId = action.categoryId?.trim();
      if (!productId) return current;
      // 允许清空归属，清空后回到商品自带分类
      if (!categoryId) {
        const productCategories = { ...current.productCategories };
        delete productCategories[productId];
        return { ...current, productCategories };
      }
      if (!current.categories.some(category => category.id === categoryId)) return current;
      return { ...current, productCategories: { ...current.productCategories, [productId]: categoryId } };
    }
    default:
      return current;
  }
};

/** 执行一次分类数据变更并落盘广播 */
export const runShopCatalogAction = (action: ShopCatalogAction): ShopCatalogState =>
  writeShopCatalog(applyShopCatalogAction(readShopCatalog(), action));
