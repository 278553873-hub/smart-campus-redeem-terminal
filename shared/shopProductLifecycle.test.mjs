import assert from 'node:assert/strict';
import {
  getLiveShopProducts,
  isShopProductDeleted,
  markShopProductDeleted,
} from './shopProductLifecycle.ts';

// 1. 软删标记：有 deletedAt 才算已删除
assert.equal(isShopProductDeleted({ id: 'p1', deletedAt: null }), false);
assert.equal(isShopProductDeleted({ id: 'p1' }), false, '没打过标记的商品是未删除的');
assert.equal(isShopProductDeleted({ id: 'p1', deletedAt: '' }), false, '空标记不算删除');
assert.equal(isShopProductDeleted({ id: 'p1', deletedAt: '2026-09-21T10:00:00.000Z' }), true);
assert.equal(isShopProductDeleted(null), false);
assert.equal(isShopProductDeleted(undefined), false);

// 2. 软删只打标记：原字段一个不少，历史记录仍查得到商品名
const before = { id: 'p1', name: '薯片', price: 8, active: true, stock: 12 };
const after = markShopProductDeleted(before, '2026-09-21T10:00:00.000Z');
assert.equal(after.name, '薯片', '软删要保留商品名，历史兑换记录才能正常展示');
assert.equal(after.price, 8);
assert.equal(after.active, true, '软删不改上架状态');
assert.equal(after.deletedAt, '2026-09-21T10:00:00.000Z');
assert.equal(before.deletedAt, undefined, '软删不能改原对象');

// 3. 在用商品：已删除商品不进入商品列表、货道选品与统计
const products = [
  { id: 'p1', name: '薯片', deletedAt: null },
  { id: 'p2', name: '铅笔', deletedAt: '2026-09-21T10:00:00.000Z' },
  { id: 'p3', name: '橡皮' },
];
assert.deepEqual(getLiveShopProducts(products).map(product => product.id), ['p1', 'p3']);
assert.deepEqual(getLiveShopProducts([]), []);
assert.equal(getLiveShopProducts(products).length, 2, '已删除商品不计入在用商品');

console.log('✅ 商品生命周期规则（删除是软删 + 保留商品名 + 各列表都只认在用商品）断言测试通过！');
