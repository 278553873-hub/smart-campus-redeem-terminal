/**
 * 货柜机商品页展示排序规则
 *
 * 两条规则，前面的先判定：
 * 1. 已售罄的一律排在最后：学生先看到能买的东西，售罄商品只作为「货架上还有这件商品」的参考。
 * 2. 可购买的商品按价格从低到高（越贵的越靠下）：成长币不多的学生看前几个就够了，不用一路划到底。
 * 价格与库存相同的商品保持原有顺序（数组 sort 为稳定排序），避免同一份数据每次渲染顺序抖动。
 * 这里只决定「展示顺序」，不改变商品数据、库存与兑换逻辑。
 */

interface ShelfProduct {
  price: number;
  stock: number;
}

const isSoldOut = (product: ShelfProduct): boolean => product.stock <= 0;

export const sortShopProductsForShelf = <T extends ShelfProduct>(products: readonly T[]): T[] =>
  [...products].sort((a, b) => (Number(isSoldOut(a)) - Number(isSoldOut(b))) || (a.price - b.price));
