import fs from 'node:fs';

const pickerSource = fs.readFileSync(new URL('./GrowthFieldCategoryPicker.tsx', import.meta.url), 'utf8');
const catalogSource = fs.readFileSync(new URL('../../../shared/studentGrowthFieldCatalog.ts', import.meta.url), 'utf8');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

for (const [key, label] of [
  ['body_growth', '生长发育'],
  ['vision_health', '视力健康'],
  ['physical_fitness', '体质测试'],
  ['health_check', '健康体检'],
]) {
  requireText(catalogSource, `key: '${key}', label: '${label}'`, `成长字段分类不正确：${label}`);
}

requireText(catalogSource, 'PLATFORM_GROWTH_FIELD_GROUPS.flatMap', '成长字段分组顺序必须由平台分类目录统一决定。');
requireText(pickerSource, 'getGrowthFieldGroups(fields)', '分类选择器必须复用平台字段分组。');
requireText(pickerSource, 'role="tablist" aria-label="成长数据分类"', '分类选择器必须提供分类页签语义。');
requireText(pickerSource, 'role="tabpanel"', '分类内容必须提供页签面板语义。');
requireText(pickerSource, 'role="checkbox"', '成长字段必须使用多选语义。');
requireText(pickerSource, 'activeGroup.fields.map', '页面只应渲染当前分类字段。');
requireText(pickerSource, 'selectedCount > 0', '分类标签必须显示已选数量。');
requireText(pickerSource, 'min-h-[var(--tm-size-touch)]', '分类页签触控高度必须使用教师端触控令牌。');
requireText(pickerSource, '学校暂未启用成长数据', '没有启用字段时必须提供明确空状态。');
requireText(pickerSource, "selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)]", '成长字段勾选态必须使用品牌主色。');
requireText(pickerSource, 'text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]', '成长字段单位提示必须使用统一辅助文字层级。');
if (pickerSource.includes("selected ? 'border-[var(--tm-status-positive)]")) {
  throw new Error('成长字段勾选态不应使用成功状态色。');
}

console.log('Growth field category picker assertions passed');
