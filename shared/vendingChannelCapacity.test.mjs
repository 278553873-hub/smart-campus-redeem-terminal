import assert from 'node:assert/strict';
import {
  LEFT_CABINET_DEFAULT_CAPACITY,
  RIGHT_CABINET_CAPACITY,
  CHANNEL_STOCK_MIN,
  getDefaultChannelStockInput,
  validateChannelStockInput,
  clampChannelStock,
  getChannelCapacity,
  isChannelStockWarning,
  isSingleItemChannel,
} from './vendingChannelCapacity.ts';

// 1. 右柜电子锁储物格：单件格口，容量恒为 1
assert.equal(getChannelCapacity({ cabinet: 'right' }), 1);
assert.equal(getChannelCapacity({ cabinet: 'right', maxStock: 10 }), 1);
assert.equal(isSingleItemChannel({ cabinet: 'right' }), true);
assert.equal(RIGHT_CABINET_CAPACITY, 1);

// 2. 左柜出货货道：默认 10 件，货道自定义容量优先
assert.equal(getChannelCapacity({ cabinet: 'left' }), LEFT_CABINET_DEFAULT_CAPACITY);
assert.equal(getChannelCapacity({ cabinet: 'left', maxStock: 6 }), 6);
assert.equal(isSingleItemChannel({ cabinet: 'left' }), false);

// 3. 库存收敛：右柜只允许 0 / 1
assert.equal(clampChannelStock({ cabinet: 'right' }, 10), 1);
assert.equal(clampChannelStock({ cabinet: 'right' }, 0), 0);
assert.equal(clampChannelStock({ cabinet: 'right' }, -3), 0);
assert.equal(clampChannelStock({ cabinet: 'left', maxStock: 10 }, 12), 10);
assert.equal(clampChannelStock({ cabinet: 'left', maxStock: 10 }, 4), 4);

// 4. 告急判定：左柜 < 5 件预警，右柜仅缺货（0 件）预警，有货即满格
assert.equal(isChannelStockWarning({ cabinet: 'left', maxStock: 10, stock: 4 }), true);
assert.equal(isChannelStockWarning({ cabinet: 'left', maxStock: 10, stock: 5 }), false);
assert.equal(isChannelStockWarning({ cabinet: 'right', stock: 0 }), true);
assert.equal(isChannelStockWarning({ cabinet: 'right', stock: 1 }), false);

// 5. 装填库存校验：0 / 负数 / 小数 / 超容量都要拦下（库存 0 只由售卖产生）
assert.equal(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, '10'), null);
assert.equal(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, '1'), null);
assert.ok(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, '0'), '装 0 件等于没装，要拦下');
assert.ok(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, '-3'), '负数要拦下');
assert.ok(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, '2.5'), '小数要拦下');
assert.ok(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, '11'), '超过容量要拦下');
assert.ok(validateChannelStockInput({ cabinet: 'left', maxStock: 10 }, ''), '空值要拦下');
assert.ok(validateChannelStockInput({ cabinet: 'right' }, '2'), '右柜单件格口最多 1 件');
assert.equal(validateChannelStockInput({ cabinet: 'right' }, '1'), null);
assert.equal(CHANNEL_STOCK_MIN, 1);

// 6. 默认装填件数：卖光（0）时默认补满，PC 与柜机共用
assert.equal(getDefaultChannelStockInput({ cabinet: 'left', maxStock: 10, stock: 0 }), 10);
assert.equal(getDefaultChannelStockInput({ cabinet: 'left', maxStock: 10, stock: 4 }), 4);
assert.equal(getDefaultChannelStockInput({ cabinet: 'left', maxStock: 10, stock: 99 }), 10);
assert.equal(getDefaultChannelStockInput({ cabinet: 'left', maxStock: 10 }), 10);
assert.equal(getDefaultChannelStockInput({ cabinet: 'right', stock: 0 }), 1);

console.log('✅ 货柜格口容量与装填库存规则断言测试通过！');
