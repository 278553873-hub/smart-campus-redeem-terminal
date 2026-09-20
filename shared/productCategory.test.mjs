import assert from 'node:assert/strict';
import {
  ALL_CATEGORY_ID,
  MIN_SHOP_CATEGORY_COUNT_FOR_ROW,
  SHOP_CATEGORY_NAME_MAX_LENGTH,
  SHOP_CATEGORY_NAME_MIN_LENGTH,
  canDeleteShopCategory,
  countShopCategoryProducts,
  getShopCategoryName,
  getShopCategoryNameLength,
  getShopCategoryPickerOptions,
  getShopProductCategoryId,
  getShopVisibleCategoryIds,
  normalizeShopCategoryName,
  shouldShowShopCategoryRow,
  validateShopCategoryName,
} from './productCategory.ts';

const categories = [
  { id: 'stationery', name: '文具', enabled: true },
  { id: 'cultural', name: '文创', enabled: true },
  { id: 'toy', name: '玩具', enabled: false },
];

// 1. 名称规则：2~10 个字，学校自建分类不写死枚举
assert.equal(SHOP_CATEGORY_NAME_MIN_LENGTH, 2);
assert.equal(SHOP_CATEGORY_NAME_MAX_LENGTH, 10);
assert.equal(ALL_CATEGORY_ID, 'all');
assert.equal(MIN_SHOP_CATEGORY_COUNT_FOR_ROW, 2);

assert.equal(normalizeShopCategoryName('  文创  用品 '), '文创 用品');
assert.equal(getShopCategoryNameLength('  文创  用品 '), 5);
assert.equal(getShopCategoryNameLength('  '), 0);

// 2. 名称校验：空、过短、过长、重名都要拦下来
assert.equal(validateShopCategoryName('', categories), '请输入分类名称');
assert.equal(validateShopCategoryName('  ', categories), '请输入分类名称');
assert.equal(validateShopCategoryName('书', categories), '分类名称至少 2 个字');
assert.equal(validateShopCategoryName('分类名称已经超过十个字', categories), '分类名称最多 10 个字');
assert.equal(validateShopCategoryName('文创', categories), '分类名称不能重复');
assert.equal(validateShopCategoryName('文创', categories, 'cultural'), null, '改自己名字时不算重名');
assert.equal(validateShopCategoryName('文创用品', categories), null);
assert.equal(validateShopCategoryName(' 文创用品 ', categories), null);

// 3. 商品归属：后台改过的以映射为准，没改过的用商品自带分类
assert.equal(getShopProductCategoryId({ id: 'p1', category: 'toy' }, {}), 'toy');
assert.equal(getShopProductCategoryId({ id: 'p1', category: 'toy' }, { p1: 'cultural' }), 'cultural');
assert.equal(getShopProductCategoryId({ id: 'p1' }, {}), '');
assert.equal(getShopProductCategoryId({ id: 'p1', category: '   ' }, {}), '');

// 4. 终端标签行：只展示「当前有商品」的分类，顺序保持后台排好的顺序
//    停用只影响商品表单可选性，货柜机上的分类与商品照常展示
const products = [
  { id: 'a', category: 'toy' },
  { id: 'b', category: 'stationery' },
  { id: 'c', category: 'stationery' },
  { id: 'd' },
];
assert.deepEqual(
  getShopVisibleCategoryIds(products, categories),
  ['stationery', 'toy'],
  '玩具分类虽然已停用，货柜机上仍有商品，标签行要照常展示',
);
assert.deepEqual(getShopVisibleCategoryIds([{ id: 'a', category: 'cultural' }, { id: 'b', category: 'stationery' }], categories), ['stationery', 'cultural'], '顺序以后台分类顺序为准');
assert.deepEqual(getShopVisibleCategoryIds(products, categories, { d: 'cultural' }), ['stationery', 'cultural', 'toy']);
assert.equal(shouldShowShopCategoryRow(products, categories), true, '有 2 个及以上分类时标签行出现');
assert.equal(shouldShowShopCategoryRow([{ id: 'a', category: 'stationery' }], categories), false, '只剩 1 个分类时整行不出现');
assert.equal(shouldShowShopCategoryRow([{ id: 'a', category: 'stationery' }, { id: 'b', category: 'cultural' }], categories), true);

// 5. 停用只作用于商品表单：停用分类仍留在选项里（老商品看得见），但不能再被选上
const pickerOptions = getShopCategoryPickerOptions(categories);
assert.deepEqual(
  pickerOptions.map(option => option.id),
  ['stationery', 'cultural', 'toy'],
  '选项顺序与分类列表一致',
);
assert.deepEqual(
  pickerOptions.map(option => option.disabled),
  [false, false, true],
  '只有停用的分类不可选',
);
assert.deepEqual(pickerOptions.map(option => option.name), ['文具', '文创', '玩具']);

// 6. 分类名查询与商品数统计
assert.equal(getShopCategoryName(categories, 'stationery'), '文具');
assert.equal(getShopCategoryName(categories, 'not-exist'), '');
assert.equal(countShopCategoryProducts(products, categories, {}, 'stationery'), 2);

// 7. 删除校验：分类下有商品时不允许删除
assert.equal(canDeleteShopCategory('stationery', products, categories).allowed, false);
assert.equal(canDeleteShopCategory('stationery', products, categories).productCount, 2);
assert.ok(canDeleteShopCategory('stationery', products, categories).reason.includes('2 个商品'));
assert.equal(canDeleteShopCategory('cultural', products, categories).allowed, true);
assert.equal(canDeleteShopCategory('cultural', products, categories).reason, '');

console.log('✅ 商品分类规则（可自定义分类 + 名称 2~10 字 + 启停只影响表单可选性 + 有商品不许删）断言测试通过！');
