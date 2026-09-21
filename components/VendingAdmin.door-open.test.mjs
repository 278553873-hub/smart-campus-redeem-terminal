import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync(new URL('./VendingAdmin.tsx', import.meta.url), 'utf8');

// 1. 该品牌右柜电磁锁不支持一键全开：上架页与调试模式都不许留「全开」入口
assert(!src.includes('handleBatchUnlockDoors'), '不应保留批量开门函数：该品牌不支持一键全开');
assert(!src.includes('全开门') && !src.includes('全开测试'), '不应残留「全开门」「全开测试」入口');

// 2. 右柜开门收敛为逐格：上架页每格下方 + 调试模式单格，共用同一个脉冲动作
assert(src.includes('const handleUnlockDoorPulse = (channelId: number) => {'), '缺少单格开门脉冲动作');
const pulseUses = src.split('handleUnlockDoorPulse(ch.id)').length - 1;
assert.equal(pulseUses, 2, '开门动作应只有两个入口（上架页每格按钮 + 调试模式单格），当前 ' + pulseUses + ' 处');

// 3. 上架页：开门按钮必须在格子外侧下方，点格子仍然只做「选品上架」一件事
const cellClick = src.indexOf('onClick={() => handleOpenAssignModal(ch)}');
const cellClickEnd = cellClick + 'onClick={() => handleOpenAssignModal(ch)}'.length;
const doorClick = src.indexOf('handleUnlockDoorPulse(ch.id)', cellClickEnd);
assert(cellClick > 0 && doorClick > cellClickEnd, '上架页开门按钮应在格子之后渲染（格子外侧下方）');
const between = src.slice(cellClickEnd, doorClick);
assert(between.includes('</div>'), '开门按钮必须在格子元素的闭合标签之后，不能放进格子里');
assert(!between.includes('handleOpenAssignModal'), '开门按钮不应再挂选品弹窗，避免与「点格子上架」混淆');
assert(src.includes('<div key={ch.id} className="min-h-0 flex flex-col gap-1">'), '每格应是「格子 + 外侧开门按钮」的纵向容器');

// 4. 开门按钮的无障碍与防重复触发
assert(src.includes('disabled={isPulsing}'), '开门指令下发期间按钮应禁用，避免重复触发');
assert(src.includes('号储物格门'), '开门按钮应有可读的无障碍说明（第几排第几格）');
assert(src.includes('<span>开门</span>'), '开门按钮文案应为「开门」');

// 5. 颜色语义：蓝色=可执行动作（与页面内其他操作同一套语言），琥珀色只留给「指令下发中」
const doorBtnStart = src.indexOf('号储物格门');
const doorBtn = src.slice(doorBtnStart, src.indexOf('</button>', doorBtnStart));
assert(doorBtn.includes('bg-blue-50 border-blue-200 text-blue-700'), '开门按钮常态应为蓝色动作色');
assert(!doorBtn.includes('bg-amber-50 border-amber-300 text-amber-700'), '开门按钮常态不应使用琥珀色，避免抢「门已开 / 库存预警」的状态色');
assert(doorBtn.includes("isPulsing ? 'bg-amber-500"), '仅「指令下发中」用琥珀色实心反馈');

console.log('✅ 货柜机右柜逐格开门检查通过（无一键全开入口、开门按钮在格子外侧下方、点格子仍是选品上架、常态为蓝色动作色）');
