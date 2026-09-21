import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};
const forbidText = (text, message) => {
  if (source.includes(text)) failures.push(message);
};

// 1. 必填字段要能一眼看出是必填
const requiredMarker = '<span className="mr-1 text-[#F53F3F]" aria-hidden="true">*</span>';
assert.equal(source.split(requiredMarker).length - 1, 3, '商品名称 / 售价 / 商品分类三个必填项各标一个 *');

// 2. 字段间距走同一套 8px 节奏：字段之间 16px，标签到控件 8px，控件到说明 4px
requireText('<div className="grid grid-cols-2 gap-4">', '字段之间的间距要统一由一处栅格控制');
requireText('<form id="shop-product-form" className="pc-form"', '表单保持 pc-form（可编辑态样式），栅格放在内层容器');
requireText('<div className="col-span-2 shop-product-image-upload">', '图片是整行控件，独占一行，并带单图位作用域类');
assert.ok(source.split('text-[#4E5969]">').length > 3, '标签样式保持一致');
forbidText('mb-3 block text-sm font-medium text-[#4E5969]', '标签到控件统一 8px，不许再出现 12px');

// 3. 去掉没有信息量的说明文案
forbidText('决定商品在货柜机上归到哪个分类标签', '分类字段名已经说明用途，不再重复解释');

// 4. 图片说明要完整展示，不用 Arco 自带的单行省略提示
forbidText('tip={SHOP_PRODUCT_IMAGE_TIP}', 'Arco tip 是 nowrap + 省略号，长文案会被截断');
forbidText('tip={', 'Arco 的 tip 是单行省略样式，改用本页自己的说明行');
requireText('id="shop-product-image-hint"', '图片说明要有稳定 id，方便无障碍关联');
requireText('aria-describedby="shop-product-image-hint"', '上传控件要关联到说明文案');

// 5. 售价校验只有一套规则，且来自共享基础层
forbidText('pattern="^(?=.*', 'JSX 字符串属性不解析转义，写成 pattern 会让售价永远校验不通过');
requireText("import { SHOP_PRODUCT_PRICE_HINT, SHOP_PRODUCT_PRICE_INVALID_MESSAGE, parseShopPrice, sanitizeShopPriceInput } from '../shared/shopProductForm';", '售价规则与提示要来自共享基础层');
requireText("const SHOP_PRODUCT_IMAGE_HINT = '建议 1:1 正方形", '图片说明要写清尺寸、格式与大小要求');
requireText('setShopPriceInput(sanitizeShopPriceInput(event.currentTarget.value));', '输入即按共享规则收敛');
requireText('const price = parseShopPrice(shopPriceInput);', '提交按共享规则解析');
requireText('{SHOP_PRODUCT_PRICE_HINT}', '提示文案来自共享基础层');
requireText('{SHOP_PRODUCT_IMAGE_HINT}', '图片说明来自共享基础层');

// 文案本身不要写实现细节，也不要留无意义的重复说明
assert.ok(!source.includes('SHOP_PRODUCT_IMAGE_TIP'));

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货柜超市「商品表单」检查未通过');
}

console.log('✅ 货柜超市「商品表单」检查通过（必填标记 / 间距节奏 / 文案精简 / 图片说明完整 / 售价校验单一口径）');

