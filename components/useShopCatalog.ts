import { useEffect, useState } from 'react';
import { readShopCatalog, subscribeShopCatalog, type ShopCatalogState } from '../shared/shopCatalogStore';

/**
 * 订阅货柜超市分类数据。
 * 后台改动分类（新建、改名、排序、启停、改商品归属）后，终端分类标签行会跟着刷新。
 */
export const useShopCatalog = (): ShopCatalogState => {
  const [catalog, setCatalog] = useState<ShopCatalogState>(() => readShopCatalog());
  useEffect(() => subscribeShopCatalog(() => setCatalog(readShopCatalog())), []);
  return catalog;
};
