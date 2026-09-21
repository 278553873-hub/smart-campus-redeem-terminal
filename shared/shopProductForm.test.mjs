import assert from 'node:assert/strict';
import {
  SHOP_PRODUCT_PRICE_HINT,
  SHOP_PRODUCT_PRICE_INVALID_MESSAGE,
  parseShopPrice,
  sanitizeShopPriceInput,
} from '../shared/shopProductForm.ts';

// 输入收敛：只留数字与小数点，最多两位小数
assert.equal(sanitizeShopPriceInput('12'), '12');
assert.equal(sanitizeShopPriceInput('12.3'), '12.3');
assert.equal(sanitizeShopPriceInput('12.345'), '12.34');
assert.equal(sanitizeShopPriceInput('12.3.4'), '12.34');
assert.equal(sanitizeShopPriceInput(' 12.3元 '), '12.3');
assert.equal(sanitizeShopPriceInput('abc'), '');
assert.equal(sanitizeShopPriceInput('.5'), '0.5');

// 解析：大于 0 才算合法，合法值统一保留两位小数
assert.equal(parseShopPrice('10.00'), 10);
assert.equal(parseShopPrice('0.5'), 0.5);
assert.equal(parseShopPrice('12.345'), 12.35);
assert.equal(parseShopPrice(''), null, '空值不合法');
assert.equal(parseShopPrice('.'), null, '只有小数点不合法');
assert.equal(parseShopPrice('0'), null, '0 不合法');
assert.equal(parseShopPrice('0.00'), null, '0.00 不合法');
assert.equal(parseShopPrice('-5'), null, '负数不合法');
assert.equal(parseShopPrice('abc'), null, '非数字不合法');

assert.ok(SHOP_PRODUCT_PRICE_HINT.includes('大于 0'));
assert.ok(SHOP_PRODUCT_PRICE_INVALID_MESSAGE.includes('大于 0'));

console.log('✅ 商品表单售价规则（输入收敛 / 合法性 / 提示文案）断言测试通过！');

