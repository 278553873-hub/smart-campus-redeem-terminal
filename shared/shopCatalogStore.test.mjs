import assert from 'node:assert/strict';
import {
  DEFAULT_SHOP_CATEGORIES,
  SHOP_CATALOG_STORAGE_KEY,
  SHOP_CATALOG_UPDATED_EVENT,
  applyShopCatalogAction,
  createEmptyShopCatalog,
  createShopCategoryId,
  normalizeShopCatalog,
} from './shopCatalogStore.ts';

// 1. 初始分类：与终端现有标签一致的 5 个分类，全部启用，学校可以继续改
assert.equal(SHOP_CATALOG_STORAGE_KEY, 'cindy.shopCatalog');
assert.equal(SHOP_CATALOG_UPDATED_EVENT, 'shop-catalog-updated');
assert.equal(DEFAULT_SHOP_CATEGORIES.length, 5);
assert.deepEqual(DEFAULT_SHOP_CATEGORIES.map(category => category.name), ['文具', '文创', '玩具', '零食', '特权']);
assert.ok(DEFAULT_SHOP_CATEGORIES.every(category => category.enabled));

const empty = createEmptyShopCatalog();
assert.deepEqual(empty.productCategories, {});
// 取到的是副本，外部改不动内部数据
const copyCheck = createEmptyShopCatalog();
copyCheck.categories[0].name = '改坏了';
assert.equal(createEmptyShopCatalog().categories[0].name, '文具');

// 2. 自定义分类 id 要能区分同一次会话里连续创建的分类
const idA = createShopCategoryId();
const idB = createShopCategoryId();
assert.ok(idA.startsWith('cat_'));
assert.notEqual(idA, idB);

// 3. 脏数据容错：解析不出分类时回退默认分类，不抛错
for (const dirty of [null, undefined, 42, 'abc', {}, { categories: 'x' }, { categories: [{ id: 1 }] }]) {
  const normalized = normalizeShopCatalog(dirty);
  assert.equal(normalized.categories.length, 5, '脏数据应回退默认分类：' + JSON.stringify(dirty));
  assert.deepEqual(normalized.productCategories, {});
}
assert.deepEqual(normalizeShopCatalog({ productCategories: { p1: 'toy', p2: 2, p3: '  ' } }).productCategories, { p1: 'toy' });

// 4. 新建分类：合法名称排到最后，非法名称不生效
const created = applyShopCatalogAction(empty, { type: 'createCategory', name: ' 体育用品 ' });
assert.equal(created.categories.length, 6);
assert.equal(created.categories[5].name, '体育用品');
assert.equal(created.categories[5].enabled, true, '新建分类默认启用');
assert.deepEqual(applyShopCatalogAction(empty, { type: 'createCategory', name: '书' }), empty, '名称过短不生效');
assert.deepEqual(applyShopCatalogAction(empty, { type: 'createCategory', name: '文具' }), empty, '重名不生效');
assert.equal(empty.categories.length, 5, '纯函数不能改动原数据');

// 5. 改名：命中分类才生效，重名不生效
const renamed = applyShopCatalogAction(empty, { type: 'renameCategory', categoryId: 'toy', name: '益智玩具' });
assert.equal(renamed.categories[2].name, '益智玩具');
assert.deepEqual(applyShopCatalogAction(empty, { type: 'renameCategory', categoryId: 'toy', name: '文创' }), empty);
assert.deepEqual(applyShopCatalogAction(empty, { type: 'renameCategory', categoryId: 'not-exist', name: '新名字' }), empty);

// 6. 启用禁用：只改状态，不动顺序和商品归属
const disabled = applyShopCatalogAction({ ...empty, productCategories: { p1: 'toy' } }, { type: 'setCategoryEnabled', categoryId: 'toy', enabled: false });
assert.equal(disabled.categories[2].enabled, false);
assert.deepEqual(disabled.productCategories, { p1: 'toy' });
assert.equal(disabled.categories.map(category => category.id).join(','), 'stationery,cultural,toy,snack,privilege');

// 7. 拖动排序：把分类挪到目标位置，越界、原地不动、未知分类都原样返回
const order = catalog => catalog.categories.map(category => category.id);
assert.deepEqual(order(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'toy', toIndex: 0 })), ['toy', 'stationery', 'cultural', 'snack', 'privilege']);
assert.deepEqual(order(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'stationery', toIndex: 2 })), ['cultural', 'toy', 'stationery', 'snack', 'privilege']);
assert.deepEqual(order(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'privilege', toIndex: 0 })), ['privilege', 'stationery', 'cultural', 'toy', 'snack']);
assert.deepEqual(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'toy', toIndex: 2 }), empty, '拖回原位不应产生变更');
assert.deepEqual(order(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'toy', toIndex: 99 })), ['stationery', 'cultural', 'snack', 'privilege', 'toy'], '拖到末尾');
assert.deepEqual(order(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'toy', toIndex: -5 })), ['toy', 'stationery', 'cultural', 'snack', 'privilege'], '拖到开头');
assert.deepEqual(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'not-exist', toIndex: 0 }), empty);
assert.deepEqual(applyShopCatalogAction(empty, { type: 'reorderCategory', categoryId: 'toy', toIndex: Number.NaN }), empty);

// 8. 删除分类：同时清掉商品归属，避免留下指向已删分类的脏数据
const removed = applyShopCatalogAction(
  { categories: empty.categories, productCategories: { p1: 'toy', p2: 'cultural' } },
  { type: 'removeCategory', categoryId: 'toy' },
);
assert.equal(removed.categories.length, 4);
assert.deepEqual(removed.productCategories, { p2: 'cultural' });

// 9. 商品归属：写入、清空、未知分类不生效
const assigned = applyShopCatalogAction(empty, { type: 'assignProductCategory', productId: 'p1', categoryId: 'toy' });
assert.deepEqual(assigned.productCategories, { p1: 'toy' });
assert.deepEqual(applyShopCatalogAction(assigned, { type: 'assignProductCategory', productId: 'p1', categoryId: '' }).productCategories, {});
assert.deepEqual(applyShopCatalogAction(empty, { type: 'assignProductCategory', productId: 'p1', categoryId: 'not-exist' }), empty);
assert.deepEqual(applyShopCatalogAction(empty, { type: 'assignProductCategory', productId: '', categoryId: 'toy' }), empty);

console.log('✅ 货柜超市分类数据（持久化结构 + 增删改排序启停 + 商品归属）断言测试通过！');
