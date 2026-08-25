import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('App.tsx', 'utf8');
const demo = fs.readFileSync('components/UiRenovationDemo.tsx', 'utf8');
const explorationPath = 'public/demos/gradient-background-exploration.html';
const tabExplorationPath = 'public/demos/tab-switch-exploration.html';
const radiusInventoryPath = 'public/demos/radius-inventory.html';
const buttonInventoryPath = 'public/demos/button-style-inventory.html';
const buttonAuditPath = 'public/demos/button-style-audit.json';

assert.match(app, /import UiRenovationDemo from '\.\/components\/UiRenovationDemo'/);
assert.match(app, /app === 'ui-renovation'/);
assert.match(app, /currentApp === 'ui-renovation' && <UiRenovationDemo \/>/);
assert.match(app, /setCurrentApp\('ui-renovation'\)/);
assert.match(app, />UI改造<\/span>/);
assert.match(demo, /label: '渐变背景'/);
assert.match(demo, /label: 'Tab切换'/);
assert.match(demo, /label: '圆角'/);
assert.match(demo, /label: '按钮样式'/);
assert.match(demo, /src: '\/demos\/gradient-background-exploration\.html'/);
assert.match(demo, /src: '\/demos\/tab-switch-exploration\.html'/);
assert.match(demo, /src: '\/demos\/radius-inventory\.html'/);
assert.match(demo, /src: '\/demos\/button-style-inventory\.html'/);
assert.match(demo, /overflow-x-auto/);
assert.match(demo, /role="tablist"/);
assert.match(demo, /role="tabpanel"/);
assert.match(demo, /aria-selected=\{isActive\}/);
assert.equal(fs.existsSync(explorationPath), true, 'UI改造渐变探索页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(tabExplorationPath), true, 'UI改造 Tab 切换探索页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(radiusInventoryPath), true, 'UI改造圆角盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(buttonInventoryPath), true, 'UI改造按钮盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(buttonAuditPath), true, '按钮盘点应提供可追溯的全量审计数据。');
assert.equal(fs.existsSync('tmp/gradient-background-exploration.html'), false, '正式接入后应删除临时页面副本。');
assert.equal(fs.existsSync('.codex-work/teacher-mobile-switch-inventory.html'), false, '正式接入后应删除 Tab 切换临时页面副本。');

const exploration = fs.readFileSync(explorationPath, 'utf8');
assert.match(exploration, /data-style="diffuse"/);
assert.match(exploration, /data-style="linear"/);
assert.match(exploration, /data-style="aurora"/);
assert.match(exploration, /data-style="conic"/);
assert.equal((exploration.match(/<figure class=/g) ?? []).length, 11, '渐变探索页应保留 11 套配色方案。');
assert.match(exploration, /方案十一 · 红蓝清透/);
assert.match(exploration, /\.scheme-red-blue-clean/);

const tabExploration = fs.readFileSync(tabExplorationPath, 'utf8');
assert.match(tabExploration, /<title>教师手机端切换控件盘点<\/title>/);
assert.match(tabExploration, /6 类基础视觉样式/);
assert.match(tabExploration, /独立使用：19 处/);
assert.match(tabExploration, /组合使用：7 类/);
assert.match(tabExploration, /data-switch/);

const radiusInventory = fs.readFileSync(radiusInventoryPath, 'utf8');
assert.match(radiusInventory, /<title>教师手机端圆角盘点<\/title>/);
assert.match(radiusInventory, /6 档语义圆角/);
assert.match(radiusInventory, /--tm-radius-control/);
assert.match(radiusInventory, /历史写法分布/);

const buttonInventory = fs.readFileSync(buttonInventoryPath, 'utf8');
assert.match(buttonInventory, /<title>教师手机端按钮样式盘点<\/title>/);
assert.match(buttonInventory, /651/);
assert.match(buttonInventory, /441/);
assert.match(buttonInventory, /7 类按钮，27 种主要结构/);
assert.match(buttonInventory, /新建另一套分组/);
assert.match(buttonInventory, /C4-01/);
assert.match(buttonInventory, /整行操作与入口/);
assert.match(buttonInventory, /灰底品牌新建行/);
assert.match(buttonInventory, /浅灰外层 · 红色圆形图标 · 红字 · 按压浅红/);
assert.match(buttonInventory, /全量源码明细/);
assert.match(buttonInventory, /data-mode="signatures"/);
assert.match(buttonInventory, /data-mode="controls"/);
assert.doesNotMatch(buttonInventory, /遗漏样式|补齐：|本次发现的遗漏|补充 [ABC]|更新日志/);

const buttonAudit = JSON.parse(fs.readFileSync(buttonAuditPath, 'utf8'));
assert.equal(buttonAudit.buttonCount, 651, '应覆盖全部原生按钮实例。');
assert.equal(buttonAudit.buttonLikeAnchorCount, 4, '应另计全部按钮外观链接。');
assert.equal(buttonAudit.controlCount, 655, '按钮形控件总数应完整。');
assert.equal(buttonAudit.fileCount, 94, '应覆盖全部包含按钮的源码文件。');
assert.equal(buttonAudit.exactStyleCount, 512, '应按外层与内部承载统计精确写法。');
assert.equal(buttonAudit.visualSignatureCount, 441, '应保留代码级视觉签名的真实差异。');
assert.equal(buttonAudit.noClassNameCount, 0, '不应存在未登记样式的按钮。');

const groupingButton = buttonAudit.controls.find(control => (
  control.file === 'mobile-app/views/ClassDetailView.tsx' && control.line === 1605
));
assert.ok(groupingButton, '应收录“新建另一套分组”按钮。');
assert.match(groupingButton.label, /新建另一套分组/);
assert.match(groupingButton.className, /bg-\[var\(--tm-bg-surface-soft\)\]/);
assert.match(groupingButton.className, /active:bg-\[var\(--tm-brand-primary-soft\)\]/);
assert.match(groupingButton.className, /text-\[var\(--tm-brand-primary\)\]/);
assert.ok(groupingButton.childClassNames.some(className => (
  className.includes('h-8')
  && className.includes('w-8')
  && className.includes('rounded-full')
  && className.includes('bg-[var(--tm-brand-primary)]')
)), '应同时盘点按钮内部的 32 像素红色圆形图标承载。');

console.log('UI改造 Demo 导航与静态页面断言通过');
