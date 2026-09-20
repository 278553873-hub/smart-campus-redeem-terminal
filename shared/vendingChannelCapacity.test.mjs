import assert from 'node:assert/strict';
import {
  LEFT_CABINET_DEFAULT_CAPACITY,
  RIGHT_CABINET_CAPACITY,
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

console.log('✅ 货柜格口容量规则（右柜电子锁单件格口）断言测试通过！');
