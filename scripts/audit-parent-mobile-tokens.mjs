import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadParentDesignTokens, createParentTokenExport } from './export-parent-mobile-design-tokens.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = await loadParentDesignTokens();
const { teacherBrandCssVariables: teacher, parentMobileTokens: parent, parentMobileColorOverrides: overrides } = tokens;
const overrideKeys = new Set([
  '--pm-bg-page-glass', '--pm-bg-surface-glass',
  '--pm-shadow-card', '--pm-shadow-control', '--pm-shadow-avatar',
]);
assert.deepEqual(new Set(Object.keys(overrides)), overrideKeys, '颜色差异必须保持显式白名单');
const stripColor = value => value.replace(/rgba?\([^)]*\)|#[\da-fA-F]{6,8}/g, '<color>');
for (const [key, value] of Object.entries(teacher)) {
  const parentKey = key.replace('--tm-', '--pm-');
  assert.ok(parentKey in parent, `家长端缺少教师基线：${key}`);
  const baselineValue = value.replaceAll('--tm-', '--pm-');
  if (!overrideKeys.has(parentKey)) assert.equal(parent[parentKey], baselineValue, `非颜色基线发生偏离：${parentKey}`);
  else if (parentKey.includes('shadow')) assert.equal(stripColor(parent[parentKey]), stripColor(baselineValue), `阴影形态发生偏离：${parentKey}`);
  else assert.match(parent[parentKey], /^#[\da-fA-F]{6}([\da-fA-F]{2})?$/, `颜色覆盖包含非颜色值：${parentKey}`);
  assert.equal(tokens.parentSharedComponentBridge[key], `var(${parentKey})`, `共享组件桥接错误：${key}`);
}
for (const [key, value] of Object.entries(tokens.parentGrowthColors)) {
  assert.match(value, /^#[\da-fA-F]{6}([\da-fA-F]{2})?$/, `成长页颜色混入非颜色参数：${key}`);
}
for (const [key, value] of Object.entries(parent)) assert.ok(!value.includes('--tm-'), `家长令牌仍依赖教师命名：${key}`);

// 对整个引用图检查缺失与循环，包含公共组件 tm → pm 桥接。
const variables = tokens.parentMobileCssVariables;
const visited = new Set();
function visit(key, chain = []) {
  assert.ok(key in variables, `悬空令牌：${[...chain, key].join(' → ')}`);
  assert.ok(!chain.includes(key), `循环引用：${[...chain, key].join(' → ')}`);
  if (visited.has(key)) return;
  for (const [, ref] of variables[key].matchAll(/var\((--[\w-]+)/g)) visit(ref, [...chain, key]);
  visited.add(key);
}
Object.keys(variables).forEach(key => visit(key));

// 检查实际消费者及规范里使用的具体令牌，防止兼容层漏项或文档引用不存在的变量。
const consumerFiles = ['components/ParentApp.tsx', 'design-system/parent-mobile/PARENT_MOBILE_UI_GUIDELINES.md'];
for (const entry of fs.readdirSync(path.join(root, 'components/parent-app'))) {
  if (/\.(tsx?|css)$/.test(entry) && !['parentMobileTokens.ts', 'parentMobileColors.ts'].includes(entry)) consumerFiles.push(`components/parent-app/${entry}`);
}
for (const file of consumerFiles) {
  for (const [key] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/--pm-[a-z0-9]+(?:-[a-z0-9]+)*/g)) {
    // 文档中 --pm-filter-* 等命名空间说明不是具体令牌。
    if (['--pm-filter', '--pm-selection'].includes(key)) continue;
    assert.ok(key in parent, `${file} 引用了不存在的家长令牌：${key}`);
  }
}
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'design-system/parent-mobile/parent-mobile.tokens.json'), 'utf8'));
assert.deepEqual(snapshot, await createParentTokenExport(), '交付快照过期，请重新导出家长令牌');
console.log(`家长令牌检查通过：${Object.keys(teacher).length} 项教师基线完整继承，${Object.keys(parent).length} 项家长令牌，无缺失或循环引用，非颜色参数保持一致。`);
