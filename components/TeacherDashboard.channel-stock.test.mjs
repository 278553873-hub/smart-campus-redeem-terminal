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
requireText('装填库存（上限 ', 'PC 字段名要与柜机一致，叫「装填库存」。');
forbidText('当前库存（上限 ', '不再用「当前库存」这个与柜机口径不一致的字段名。');
const stockBlock = source.slice(source.indexOf('id="stock-input"'), source.indexOf('id="stock-input"') + 1500);
assert.ok(!stockBlock.includes('min="0"'), '库存不允许 0 和负数：装 0 件等于没装。');
assert.ok(!stockBlock.includes('type="number"'), '库存输入改用受控数字文本，避免浏览器原生校验的英文气泡。');
requireText('装 1 件起；货道卖光后库存会自动变成 0，不用手工填', '要说明 0 只由售卖产生，不用人工填。');

// 3. 输入即拦截 + 提交再兜一层，且不再静默改值
requireText('event.currentTarget.value.replace(/[^0-9]/g, ', '库存输入只收数字，负号和小数点进不来。');
requireText('setChannelStockError(validateChannelStockInput(editingChannel, digits)', '输入时就给出提示。');
requireText('Message.warning(stockError);', '提交时再过一次共享校验并说明原因。');
requireText('const stockError = validateChannelStockInput(editingChannel,', '提交校验走共享规则。');

// 4. 已卖光的格子默认补满，不会一进弹窗就被规则拦住
requireText('defaultValue={getDefaultChannelStockInput(editingChannel)}', '库存为 0 时默认补满。');

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货道「装填库存」检查未通过');
}

console.log('✅ 货道装填库存检查通过（两端同源：至少 1 件 / 0 只由售卖产生 / 卖光默认补满）');

