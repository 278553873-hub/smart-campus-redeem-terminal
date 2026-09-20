import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getTerminalShopPerScreenCount } from './shared/terminalShopLayout.ts';
import {
  getShopCategoryName,
  getShopProductCategoryId,
  getShopVisibleCategoryIds,
  shouldShowShopCategoryRow,
} from './shared/productCategory.ts';
import { DEFAULT_SHOP_CATEGORIES } from './shared/shopCatalogStore.ts';

// constants.tsx 不能被 node 直接执行，这里按演示数据的写法解析
const source = readFileSync(new URL('./constants.tsx', import.meta.url), 'utf8');
const blockStart = source.indexOf('export const MOCK_PRODUCTS');
const blockEnd = source.indexOf('\n];', blockStart);
assert.ok(blockStart > 0 && blockEnd > blockStart, '找不到 MOCK_PRODUCTS 定义');
const block = source.slice(blockStart, blockEnd);

const shelfPattern = /shelfProduct\('([^']*)',\s*'([^']*)',\s*([\d.]+),\s*'([^']*)',\s*(\d+)(?:,\s*'([^']*)')?\)/g;
const shelfProducts = [...block.matchAll(shelfPattern)].map(match => ({
  id: match[1],
  name: match[2],
  price: Number(match[3]),
  category: match[4],
  stock: Number(match[5]),
  image: match[6] ?? '',
}));
const privilegeProducts = [...block.matchAll(/privilegeProduct\('([^']*)',\s*'([^']*)'/g)].map(match => match[1]);

assert.equal(shelfProducts.length + privilegeProducts.length, (block.match(/\n\s*(shelf|privilege)Product\(/g) || []).length, '有演示商品没被解析到，检查写法');

// 1. 演示数据要按学校实际在售规模（49 件）准备，否则评估不出一屏 6 个时的滑动量
assert.ok(shelfProducts.length >= 49, '在售演示商品应不少于 49 件，当前 ' + shelfProducts.length + ' 件');
assert.equal(new Set(shelfProducts.map(product => product.id)).size, shelfProducts.length, '演示商品 id 不能重复');

// 2. 至少要覆盖 2 个分类，否则根本看不到分类标签行
const categoryIds = getShopVisibleCategoryIds(shelfProducts, DEFAULT_SHOP_CATEGORIES);
assert.ok(categoryIds.length >= 2, '演示商品至少要有 2 个分类，当前 ' + categoryIds.length + ' 个');
assert.equal(
  shouldShowShopCategoryRow(shelfProducts, DEFAULT_SHOP_CATEGORIES),
  true,
  '演示数据应能展示分类标签行',
);

// 3. 商品上的分类必须在后台默认分类表里，否则终端标签取不到名字
for (const product of shelfProducts) {
  const categoryId = getShopProductCategoryId(product);
  assert.ok(categoryId, '在售商品「' + product.name + '」缺少分类');
  assert.ok(
    DEFAULT_SHOP_CATEGORIES.some(category => category.id === categoryId),
    '商品「' + product.name + '」的分类 ' + categoryId + ' 不在后台分类表里',
  );
}

// 4. 商品数要多于一屏，否则一屏就放完了
assert.ok(shelfProducts.length > getTerminalShopPerScreenCount(), '演示商品数要多于一屏');

// 5. 必须同时存在「有图」和「没上传图」的商品，才能验证默认商品图这条规则
assert.ok(shelfProducts.some(product => product.image), '演示数据里要有已上传图片的商品');
assert.ok(shelfProducts.some(product => !product.image), '演示数据里要有没上传图片的商品，用来验证默认商品图');

// 6. 必须存在售罄商品，才能验证「售罄沉底」
assert.ok(shelfProducts.some(product => product.stock <= 0), '演示数据里要有售罄商品');

// 7. 价格不能本来就排好序，否则看不出终端排序是否生效
const prices = shelfProducts.map(product => product.price);
assert.notDeepEqual(prices, [...prices].sort((a, b) => a - b), '演示数据的价格要打乱，用来验证排序规则');

console.log(
  '✅ 货柜机演示数据检查通过（在售 ' + shelfProducts.length + ' 件 / ' + categoryIds.length + ' 个分类：'
  + categoryIds.map(id => getShopCategoryName(DEFAULT_SHOP_CATEGORIES, id)).join('、')
  + ' / 售罄 ' + shelfProducts.filter(product => product.stock <= 0).length + ' 件）',
);
