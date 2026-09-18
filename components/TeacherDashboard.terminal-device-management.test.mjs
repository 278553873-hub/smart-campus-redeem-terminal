import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// 1. 验证货柜机配置中心子菜单已升级为4字精简文案（方案A）并按高频优先排序
assert(
    source.includes("children: ['货柜超市', '货币发放', '发币记录', '储蓄银行', '终端设备']"),
    '未在 TeacherDashboard.tsx 中找到符合方案A精简文案的子菜单定义'
);

// 2. 验证主容器与标题逻辑兼容终端设备
assert(
    source.includes("activeMenu === '终端设备'") || source.includes("activeMenu === '终端设备管理'"),
    '主容器内容边距未纳入“终端设备”'
);

// 3. 验证具备双 Tab 结构（终端设备列表与屏幕界面配置）
assert(
    source.includes("终端设备列表") && source.includes("屏幕界面配置"),
    '终端设备管理页面缺少“终端设备列表”或“屏幕界面配置”双 Tab 切换'
);

// 4. 验证具备新增、编辑与删除终端设备能力
assert(
    source.includes("handleOpenCreateDevice") &&
    source.includes("handleOpenEditDevice") &&
    source.includes("handleDeleteDevice"),
    '缺少终端设备新增、编辑或删除的核心操作函数'
);

// 5. 验证操作列具备【前往配货】跳转机制
assert(
    source.includes("handleGoToVendingStock") && source.includes("前往配货"),
    '缺少前往配货直达货道平面图的跳转联动逻辑'
);

// 6. 验证存在终端设备新增/编辑弹窗及模板复制机制
assert(
    source.includes("isDeviceModalOpen") &&
    source.includes("初始货道配置模板") &&
    source.includes("创建全空白货道"),
    '缺少终端设备新增/编辑弹窗或货道初始模板选择逻辑'
);

// 7. 验证货柜超市反向跳转到终端设备
assert(
    source.includes("setActiveMenu('终端设备')") || source.includes("setActiveMenu('终端设备管理')"),
    '货柜超市缺少反向快捷跳转至终端设备的入口'
);

console.log('✅ 终端设备管理（路径 A 架构梳理）所有测试用例验证通过！');
