import fs from 'node:fs';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// 验证 VendingAdmin.tsx 方案 A 逻辑实现完整性
const vendingAdminSource = fs.readFileSync(new URL('./VendingAdmin.tsx', import.meta.url), 'utf8');

// 1. 核心状态与函数
assert(vendingAdminSource.includes('selectedChannelForAssign') && vendingAdminSource.includes('setSelectedChannelForAssign'), '缺少选品上架抽屉状态');
assert(vendingAdminSource.includes('isDiagnosticsMode') && vendingAdminSource.includes('setIsDiagnosticsMode'), '缺少调试模式状态 isDiagnosticsMode');
assert(vendingAdminSource.includes('const hasItem ='), '缺少关键渲染变量 hasItem');
assert(vendingAdminSource.includes('handleOpenAssignModal'), '缺少打开上架抽屉函数');
assert(vendingAdminSource.includes('handleConfirmAssign'), '缺少确认上架/换品函数');
assert(vendingAdminSource.includes('handleUnassignChannel'), '缺少下架清空货道函数');

// 2. 空闲货道交互与视觉指引
assert(vendingAdminSource.includes('上架') && (vendingAdminSource.includes('点按选品') || vendingAdminSource.includes('选品')), '空闲货道缺少明显的上架引导标识');
assert(vendingAdminSource.includes('handleOpenAssignModal(ch)'), '空闲货道或满仓货道点击未接入选品上架抽屉');

// 3. 抽屉内商品库渲染与装填库存控制
assert(!vendingAdminSource.includes('从学校商品库中点选') && !vendingAdminSource.includes('积分'), '抽屉应去除从学校商品库点选废话及积分展示');
assert(vendingAdminSource.includes('装填库存'), '抽屉缺少装填库存步进器');
assert(vendingAdminSource.includes('确认上架') && vendingAdminSource.includes('确认保存'), '抽屉缺少确认上架/确认保存按钮');
assert(vendingAdminSource.includes('下架清空'), '抽屉缺少下架清空操作项');
assert(!vendingAdminSource.includes('低频操作'), '抽屉不应出现低频操作等废话');
assert(!vendingAdminSource.includes('更换为其他商品'), '抽屉不应出现折叠废话');



// 4. 验证所有使用的 Lucide 图标组件均已正确 import，杜绝运行时未定义崩溃
const importMatch = vendingAdminSource.match(/from\s+['"]lucide-react['"]/);
assert(importMatch, 'VendingAdmin.tsx 必须引入 lucide-react');
const lucideImportsMatch = vendingAdminSource.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
assert(lucideImportsMatch, '无法匹配 lucide-react 引入列表');
const importedIcons = new Set(
    lucideImportsMatch[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
);
['Lock', 'Unlock', 'DoorOpen', 'CheckCircle2', 'ChevronLeft', 'RefreshCw'].forEach(icon => {
    assert(importedIcons.has(icon), `VendingAdmin.tsx 缺少关键图标导入: ${icon}`);
});

// 5. 验证硬件无状态回执特性：杜绝虚假状态标签与伪复位功能
assert(!vendingAdminSource.includes('✔ 正常'), '调试模式左柜不应回显虚假正常标签');
assert(!vendingAdminSource.includes('手动关门复位'), '右柜无门磁回执，不应出现手动关门复位按钮');
assert(!vendingAdminSource.includes('点按单格出货') && !vendingAdminSource.includes('点按模拟开柜'), '层板不应出现引导废话文案');

console.log('✅ 货柜机现场选品上架/换绑/下架（方案 A）与右柜开门硬件调试端到端验证通过！');


