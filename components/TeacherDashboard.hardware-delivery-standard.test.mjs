import fs from 'node:fs';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// 1. 验证交付标准化方案文档已存在且内容完备
const standardDoc = fs.readFileSync(new URL('../智能货柜软硬件一体化交付与多机型配置标准化方案.md', import.meta.url), 'utf8');
assert(standardDoc.includes('B 建立档案（前置配货） + A 握手同步（现场校准）'), '标准化方案文档缺少核心原则阐述');
assert(standardDoc.includes('MODEL_DUAL_49') && standardDoc.includes('MODEL_SINGLE_36') && standardDoc.includes('MODEL_LOCKER_24'), '标准化方案文档缺少标准机型定义');
assert(standardDoc.includes('/dev/ttyS1') && standardDoc.includes('波特率') && standardDoc.includes('激活码'), '标准化方案文档缺少硬件调试与激活机制描述');

// 2. 验证 PC 后台 TeacherDashboard.tsx 中具备机型库与激活码/密码管理
const pcSource = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
assert(pcSource.includes('DEVICE_MODEL_CATALOG') && pcSource.includes('MODEL_DUAL_49'), 'PC端缺少机型模板库定义');
assert(pcSource.includes('generateActivationCode') && pcSource.includes('activationCode'), 'PC端缺少6位激活码生成与绑定字段');
assert(pcSource.includes('adminPassword') && pcSource.includes('showPasswordDeviceId'), 'PC端缺少终端设备运维密码与查看/隐藏机制');
assert(pcSource.includes('采购机柜机型') && pcSource.includes('终端运维管理密码'), '新增/编辑设备弹窗缺少机型规格或运维密码输入项');

// 3. 验证 货柜机维护控制台 VendingAdmin.tsx 专注现场补货，取消复杂冗余的硬件调试与设备激活
const vendingAdminSource = fs.readFileSync(new URL('./VendingAdmin.tsx', import.meta.url), 'utf8');
assert(
    vendingAdminSource.includes('返回') &&
    vendingAdminSource.includes('调试') &&
    vendingAdminSource.includes('handleDiagnosticsMotor') &&
    !vendingAdminSource.includes('设备激活'),
    '货柜机控制台应支持顶部调试入口与独立承接页（左柜推杆出货+右柜模拟开柜）'
);
assert(
    !vendingAdminSource.includes('540×960') &&
    !vendingAdminSource.includes('在线') &&
    !vendingAdminSource.includes('待补 <strong'),
    '货柜机顶栏应去除 540*960、在线、待补看板等多余废话'
);
assert(
    vendingAdminSource.includes('handleBatchUnlockDoors') && !vendingAdminSource.includes('补满整柜'),
    '顶栏快捷操作应去除补满整柜，并保留右柜全开储物门'
);
assert(
    vendingAdminSource.includes('补满本排') && vendingAdminSource.includes('grid-cols-10'),
    '排头应固定常驻补满本排按钮，右柜第4排应为1排10窄格'
);
assert(
    vendingAdminSource.includes('handleOpenAssignModal') && 
    vendingAdminSource.includes('handleConfirmAssign') &&
    vendingAdminSource.includes('handleUnassignChannel') &&
    !vendingAdminSource.includes('从学校商品库中点选'),
    '货柜机选品上架抽屉已去除多余废话并支持换绑与下架清空'
);
assert(
    vendingAdminSource.includes('flex-1 flex flex-col justify-between overflow-hidden'),
    '货柜机补货界面未针对 540x960 视口实现全屏自适应均分布局'
);

console.log('✅ 智能货柜软硬件交付标准化与现场补货极简重构测试全部验证通过！');
