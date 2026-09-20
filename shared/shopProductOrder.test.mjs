import assert from 'node:assert/strict';
import { sortShopProductsForShelf } from './shopProductOrder.ts';

const ids = products => products.map(product => product.id);

// 1. 可购买的商品按价格从低到高：越贵的越靠下，学生不用划到底部才发现有便宜的东西
const products = [
  { id: 'pen', price: 120, stock: 3 },
  { id: 'badge', price: 5, stock: 9 },
  { id: 'globe', price: 88, stock: 1 },
  { id: 'backpack', price: 15, stock: 7 },
];
assert.deepEqual(ids(sortShopProductsForShelf(products)), ['badge', 'backpack', 'globe', 'pen']);

// 2. 不能就地改动原数组（原数组直接来自 state）
assert.deepEqual(ids(products), ['pen', 'badge', 'globe', 'backpack']);

// 3. 售罄一律沉到最后，哪怕它是最便宜的
const withSoldOut = [
  { id: 'cheap-sold-out', price: 2, stock: 0 },
  { id: 'expensive', price: 150, stock: 4 },
  { id: 'cheap', price: 3, stock: 12 },
  { id: 'mid-sold-out', price: 30, stock: 0 },
];
assert.deepEqual(ids(sortShopProductsForShelf(withSoldOut)), ['cheap', 'expensive', 'cheap-sold-out', 'mid-sold-out']);

// 4. 同价同库存保持原有顺序，列表不会在多次渲染之间抖动
const samePrice = [
  { id: 'first', price: 10, stock: 5 },
  { id: 'second', price: 10, stock: 5 },
  { id: 'third', price: 10, stock: 5 },
];
assert.deepEqual(ids(sortShopProductsForShelf(samePrice)), ['first', 'second', 'third']);

// 5. 边界：空列表与只有一个商品
assert.deepEqual(sortShopProductsForShelf([]), []);
assert.deepEqual(ids(sortShopProductsForShelf([{ id: 'only', price: 3, stock: 0 }])), ['only']);

// 6. 真实规模：49 件商品里，最后一件必须是售罄商品（若有售罄），且可购买部分价格单调不减
const many = Array.from({ length: 49 }, (_, index) => ({
  id: 'p' + index,
  price: (index * 7) % 23,
  stock: index % 6 === 0 ? 0 : 10,
}));
const sorted = sortShopProductsForShelf(many);
const firstSoldOut = sorted.findIndex(product => product.stock <= 0);
assert.ok(firstSoldOut > 0, '存在售罄商品时，第一件必须仍是可购买商品');
assert.ok(sorted.slice(firstSoldOut).every(product => product.stock <= 0), '售罄商品必须连续排在最后');
for (let index = 1; index < firstSoldOut; index += 1) {
  assert.ok(sorted[index - 1].price <= sorted[index].price, '可购买部分价格必须单调不减');
}

console.log('✅ 货柜机商品页排序规则（售罄沉底 + 越贵的越靠下）断言测试通过！');
