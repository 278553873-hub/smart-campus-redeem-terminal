import assert from 'node:assert/strict';
import fs from 'node:fs';

const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const managementViewSource = fs.readFileSync(new URL('./ParentEvaluationVisibilityManagementView.tsx', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const settingsSource = fs.readFileSync(new URL('../components/class/ParentEvaluationVisibilitySettings.tsx', import.meta.url), 'utf8');

// 1. 验证 MeView 更多工具入口配置
const moreToolsSource = meSource.slice(meSource.indexOf('const allMoreTools'), meSource.indexOf('const moreTools'));
assert.ok(moreToolsSource.includes("id: 'parentEvaluationVisibility'"), '更多工具应包含 parentEvaluationVisibility 入口。');
assert.ok(moreToolsSource.includes("title: '家长端展示'"), '更多工具入口标题应为家长端展示。');
assert.ok(moreToolsSource.includes("icon: MonitorSmartphone"), '更多工具入口图标应为 MonitorSmartphone。');

// 2. 验证排序：值周安排 -> 家长端展示 -> 档案设计
assert.ok(
  moreToolsSource.indexOf("id: 'weeklyDutySchedule'") < moreToolsSource.indexOf("id: 'parentEvaluationVisibility'"),
  '家长端展示应排在值周安排之后。',
);
assert.ok(
  moreToolsSource.indexOf("id: 'parentEvaluationVisibility'") < moreToolsSource.indexOf("id: 'archiveDesign'"),
  '家长端展示应排在档案设计之前。',
);

// 3. 验证权限模型
assert.ok(accessSource.includes("| 'parentEvaluationVisibility'"), '统一权限类型定义应包含 parentEvaluationVisibility。');
assert.ok(accessSource.includes("'parentEvaluationVisibility'"), 'ALL_MORE_TOOLS 应包含 parentEvaluationVisibility。');

// 4. 验证 App 路由与视图集成
assert.ok(appSource.includes("'parent_evaluation_visibility'"), 'App ViewState 应支持 parent_evaluation_visibility。');
assert.ok(appSource.includes("case 'parent_evaluation_visibility': return '家长端展示';"), '标题栏映射应包含家长端展示。');
assert.ok(appSource.includes('<ParentEvaluationVisibilityManagementView'), 'App 应渲染全校家长端展示管理视图。');
assert.ok(appSource.includes('writeSchoolParentEvaluationVisibility(activeTeacherSpace.id, config, true)'), '保存时应调用学校级配置并应用方案B重置。');

// 5. 验证独立管理视图设计（对齐“货币发放”配置规范）
assert.ok(managementViewSource.includes('<FeaturePanel className="relative z-10 px-4 py-2" allowOverflow>'), '最上方应为独立的开关卡片。');
assert.ok(managementViewSource.includes('CircleHelp'), '开关旁应提供问号 icon 说明入口。');
assert.ok(managementViewSource.includes('开启后，班主任可自主设置本班家长端展示规则；关闭后，全校统一按照本处设置的方案进行展示，不允许班主任私自调整'), '问号说明应简明易懂。');
assert.ok(managementViewSource.includes('<h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">'), '板块卡片标题应采用与货币发放一致的 15px font-bold 主文字色。');
assert.ok(managementViewSource.includes('showPreview={false}'), '规则卡片内不应包含预览容器。');
assert.ok(managementViewSource.includes('onSave(nextConfig, false)'), '开关切换应立即触发自动持久化。');
assert.ok(classListSource.includes("badge: activeActionClass && !getEffectiveParentEvaluationVisibility(activeActionClass.id, currentSpace.id).allowCustomization"), '全校管控下班级操作菜单应透出统管徽标。');

// 6. 验证班级卡片只读态与提示
assert.ok(classListSource.includes('getEffectiveParentEvaluationVisibility'), '班级列表应通过有效规则获取展示设置与只读态。');
assert.ok(classListSource.includes('readOnly={effective.isReadOnly}'), '班级列表应向弹窗传递 readOnly 状态。');
assert.ok(settingsSource.includes('readOnly'), '设置组件应支持 readOnly 属性。');
assert.ok(settingsSource.includes('学校已开启全校统一管控'), '设置组件只读态应展示学校统管说明文案。');
assert.ok(settingsSource.includes('disabled={readOnly}'), '设置组件只读态应将分段控制器设为禁用。');

console.log('ParentEvaluationVisibilityManagementView assertions passed');
