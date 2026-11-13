import assert from 'node:assert/strict';
import { filterVendingInventory } from './vendingInventory.ts';

const products = [
  { productId: 'p1', categoryId: 'stationery', stock: 5 },
  { productId: 'p2', categoryId: 'stationery', stock: 0 },
  { productId: 'p3', categoryId: 'toy', stock: 0 },
];
assert.deepEqual(filterVendingInventory(products, ''), products, '默认包含零库存商品');
assert.deepEqual(filterVendingInventory(products, '', 'zero').map(item => item.productId), ['p2', 'p3']);
assert.deepEqual(filterVendingInventory(products, '', 'available').map(item => item.productId), ['p1'], '有库存仅展示数量大于0的商品');
assert.deepEqual(filterVendingInventory(products, 'toy', 'available'), [], '有库存与分类共同筛选');
assert.deepEqual(filterVendingInventory(products, 'stationery', 'zero').map(item => item.productId), ['p2'], '分类与零库存共同筛选');
assert.deepEqual(filterVendingInventory(products, 'snack', 'zero'), [], '无匹配商品返回空结果');
assert.equal(filterVendingInventory(products, '', 'all').length, 3, '切回全部库存恢复商品');
assert.equal(products.length, 3, '筛选不修改库存快照');
console.log('商品库存筛选通过');
