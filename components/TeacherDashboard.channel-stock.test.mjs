import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const vendingSource = readFileSync(new URL('./VendingAdmin.tsx', import.meta.url), 'utf8');

const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};
const forbidText = (text, message) => {
  if (source.includes(text)) failures.push(message);
};

// 1. 两端同源：装填库存的校验与最小件数都来自共享规则，页面和柜机都不自己写
requireText('validateChannelStockInput,', 'PC 货道配置要调用共享的装填库存校验。');
requireText('getDefaultChannelStockInput,', 'PC 货道配置的默认装填件数要走共享规则。');
assert.ok(vendingSource.includes('CHANNEL_STOCK_MIN'), '柜机步进器的最小件数要与 PC 同源。');
assert.ok(vendingSource.includes('getDefaultChannelStockInput(channel)'), '柜机打开抽屉的默认装填件数也要走共享规则。');

// 2. 两端口径一致：都叫「装填库存」，都要求至少 1 件
requireText('装填库存</label>', 'PC 字段名要与柜机一致，叫「装填库存」。');
forbidText('当前库存（上限 ', '不再用「当前库存」这个与柜机口径不一致的字段名。');
const stockBlock = source.slice(source.indexOf('id="stock-input"'), source.indexOf('id="stock-input"') + 1500);
assert.ok(!stockBlock.includes('min="0"'), '库存不允许 0 和负数：装 0 件等于没装。');
assert.ok(!stockBlock.includes('type="number"'), '库存输入改用受控数字文本，避免浏览器原生校验的英文气泡。');
forbidText('装 1 件起；货道卖光后库存会自动变成 0，不用手工填', '输入框下面的说明行是废话，不显示；只在出错时给中文原因。');
requireText('id="channel-stock-hint" aria-live="polite"', '库存出错时要有一行可被读屏播报的中文提示位，并且高度固定不引起跳动。');

// 3. 输入即拦截 + 提交再兜一层，且不再静默改值
requireText('event.currentTarget.value.replace(/[^0-9]/g, ', '库存输入只收数字，负号和小数点进不来。');
requireText('setChannelStockError(validateChannelStockInput(editingChannel, digits)', '输入时就给出提示。');
requireText('Message.warning(stockError);', '提交时再过一次共享校验并说明原因。');
requireText('const stockError = validateChannelStockInput(editingChannel,', '提交校验走共享规则。');

// 4. 已卖光的格子默认补满，不会一进弹窗就被规则拦住
requireText('defaultValue={getDefaultChannelStockInput(editingChannel)}', '库存为 0 时默认补满。');

// 5. 弹窗里的必填项都带 * 标记；「置空仓位」是显式选项，空值留给「请选择商品」占位
requireText('*</span>选择商品放入', '「选择商品」是必填项，要显示 *。');
requireText('*</span>装填库存', '「装填库存」是必填项，要显示 *。');
requireText('const CHANNEL_CLEAR_PRODUCT_VALUE', '「置空仓位」要用显式选项值，空值不可兼作置空。');
requireText('<option value="">请选择商品</option>', '下拉要有「请选择商品」占位项。');
requireText("Message.warning('请选择要绑定的商品')", '没选商品就点保存，要给中文提示而不是静默通过。');

// 6. 右柜与左柜同款：同一套「装填库存」字段，上限由共享容量规则给出（右柜 1 件），不能单独画成只读说明
forbidText('isSingleItemChannel(editingChannel)', '右柜不能再走单独的只读分支，否则弹窗里没法补货。');
forbidText('该格为电子锁储物格', '右柜不再摆“无需手工填写库存”的说明行，要和左柜一样能填件数。');
requireText('placeholder={getChannelStockPlaceholder(editingChannel)}', '可填范围要放在输入框的占位提示里：清空输入框时就能看到（左柜 1 ~ 10 件、右柜 1 件）。');
forbidText('装 1 件起', '输入框下方不再常显说明文案，那行只用来显示错误原因。');

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货道「装填库存」检查未通过');
}

console.log('✅ 货道装填库存检查通过（两端同源：至少 1 件 / 0 只由售卖产生 / 卖光默认补满）');

