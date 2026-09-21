/**
 * 新建 / 编辑商品表单里「售价」的规则与提示（表单弹窗与提交校验共用同一份口径）
 *
 * 提示怎么写、什么算合法只允许有一处定义：
 * 之前售价同时写了 HTML pattern 和 JS 校验两套规则，两套还会互相打架。
 */

/** 售价字段的输入说明 */
export const SHOP_PRODUCT_PRICE_HINT = '请输入大于 0 的数字，最多 2 位小数';

/** 售价不合法时给老师的字段级提示 */
export const SHOP_PRODUCT_PRICE_INVALID_MESSAGE = '售价必须大于 0';

/** 把输入收敛成「数字 + 最多两位小数」的文本：粘贴 " 12.3元 " 这类内容也能直接用 */
export const sanitizeShopPriceInput = (raw: string): string => {
  const digits = String(raw ?? '').replace(/[^0-9.]/g, '');
  const [integerPart, ...decimalParts] = digits.split('.');
  if (decimalParts.length === 0) return integerPart;
  return (integerPart || '0') + '.' + decimalParts.join('').slice(0, 2);
};

/** 解析售价：不是大于 0 的数字时返回 null，由调用方决定怎么提示 */
export const parseShopPrice = (input: string): number | null => {
  const value = Number(input);
  return Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)) : null;
};

