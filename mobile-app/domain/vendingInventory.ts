export interface VendingInventoryProduct {
  productId: string;
  productName: string;
  image?: string;
  categoryId: string;
  categoryName: string;
  stock: number;
}

/** 货柜当前库存快照，与历史兑换记录独立，不从兑换次数倒推库存。 */
export interface VendingCabinetInventory {
  id: string;
  name: string;
  schoolId: string;
  products: readonly VendingInventoryProduct[];
}

export type VendingInventoryStockFilter = 'all' | 'available' | 'zero';

export const filterVendingInventory = (
  products: readonly VendingInventoryProduct[],
  categoryId: string,
  stockFilter: VendingInventoryStockFilter = 'all',
): VendingInventoryProduct[] => products.filter(product => (!categoryId || product.categoryId === categoryId)
  && (stockFilter === 'all' || (stockFilter === 'available' ? product.stock > 0 : product.stock === 0)));
