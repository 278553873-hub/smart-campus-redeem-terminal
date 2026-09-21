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
assert(src.includes('disabled={isUnlocking}'), '开门指令下发期间按钮应禁用，避免重复触发');
assert(src.includes('号储物格门'), '开门按钮应有可读的无障碍说明（第几排第几格）');
assert(src.includes('<span>开门</span>'), '开门按钮文案应为「开门」');

// 5. 机械指令的反馈语言全项目统一：右柜开门必须与左柜出货同一套（蓝色高亮 + 转动图标）
const leftStart = src.indexOf("if (activeCabinet === 'left') {");
assert(leftStart > 0, '未找到调试模式左柜出货分支');
const leftCell = src.slice(leftStart, src.indexOf('} else {', leftStart));
const rightStart = src.indexOf('// 右柜电锁开门调试');
assert(rightStart > 0, '未找到调试模式右柜开门分支');
const rightCell = src.slice(rightStart, src.indexOf('})}', rightStart));

const ACTIVE_HIGHLIGHT = "? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/40'";
const SPIN_ICON = '<RefreshCw size={13} className="animate-spin text-blue-600" />';
assert(leftCell.includes(ACTIVE_HIGHLIGHT) && rightCell.includes(ACTIVE_HIGHLIGHT), '左柜出货与右柜开门的「指令下发中」必须是同一套蓝色高亮');
assert(leftCell.includes(SPIN_ICON) && rightCell.includes(SPIN_ICON), '左柜出货与右柜开门的「指令下发中」必须是同一个转动图标');
assert(!rightCell.includes('amber'), '调试模式右柜开门不应再出现琥珀色（琥珀只留给「门已开」等状态）');
assert(!src.includes('text-amber-600 animate-pulse'), '开门动作不应再用琥珀色脉冲反馈');
assert(!src.includes('isPulsing'), '不应残留旧命名 isPulsing（统称 isUnlocking）');

// 6. 商品上架页的开门按钮：常态蓝色动作色，下发中同为蓝色 + 转动图标
const doorBtnStart = src.indexOf('号储物格门');
const doorBtn = src.slice(doorBtnStart, src.indexOf('</button>', doorBtnStart));
assert(doorBtn.includes('bg-blue-50 border-blue-200 text-blue-700'), '开门按钮常态应为蓝色动作色');
assert(doorBtn.includes("isUnlocking ? 'bg-blue-100 border-blue-400 text-blue-700'"), '开门按钮下发中应是加深的蓝色');
assert(doorBtn.includes('<RefreshCw size={is10Narrow ? 10 : 12} className="animate-spin shrink-0" />'), '开门按钮下发中也应显示转动图标');
assert(!doorBtn.includes('amber'), '上架页开门按钮不应出现琥珀色');

console.log('✅ 货柜机右柜逐格开门检查通过（无一键全开入口、按钮在格子外侧下方、机械指令反馈与左柜出货统一为蓝色 + 转动图标）');
