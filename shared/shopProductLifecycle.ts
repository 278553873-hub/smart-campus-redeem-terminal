/**
 * 商品生命周期规则（PC 后台商品管理 + 货柜机维护台共用）
 *
 * 商品删除是软删除：只打 deletedAt 标记，不从商品库里移除。
 * 这样历史兑换记录、补货清单、报表仍然按 id 查得到商品名，不会出现「未知商品」。
 * - 已删除商品不再出现在商品列表、货道选品、补货清单和分类商品数里
 * - 商品随时可以删除；货道上还有库存时后台会二次确认，删除后同步清空这些货道
 */

export interface ShopProductLifecycleFields {
  /** 软删标记：有值表示已删除，数据保留，供历史记录取名字 */
  deletedAt?: string | null;
}

export const isShopProductDeleted = (product: ShopProductLifecycleFields | null | undefined): boolean =>
  Boolean(product?.deletedAt);

/** 仍在用的商品：商品列表、货道选品、补货清单、分类统计都只认这些 */
export const getLiveShopProducts = <T extends ShopProductLifecycleFields>(products: T[]): T[] =>
  products.filter(product => !isShopProductDeleted(product));

/** 软删：保留原数据只打标记，历史记录照常查得到商品名 */
export const markShopProductDeleted = <T extends ShopProductLifecycleFields>(product: T, deletedAt: string): T =>
  ({ ...product, deletedAt });
