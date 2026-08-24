import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('App.tsx', 'utf8');
const demo = fs.readFileSync('components/UiRenovationDemo.tsx', 'utf8');
const explorationPath = 'public/demos/gradient-background-exploration.html';
const tabExplorationPath = 'public/demos/tab-switch-exploration.html';

assert.match(app, /import UiRenovationDemo from '\.\/components\/UiRenovationDemo'/);
assert.match(app, /app === 'ui-renovation'/);
assert.match(app, /currentApp === 'ui-renovation' && <UiRenovationDemo \/>/);
assert.match(app, /setCurrentApp\('ui-renovation'\)/);
assert.match(app, />UI改造<\/span>/);
assert.match(demo, /label: '渐变背景'/);
assert.match(demo, /label: 'Tab切换'/);
assert.match(demo, /src: '\/demos\/gradient-background-exploration\.html'/);
assert.match(demo, /src: '\/demos\/tab-switch-exploration\.html'/);
assert.match(demo, /role="tablist"/);
assert.match(demo, /role="tabpanel"/);
assert.match(demo, /aria-selected=\{isActive\}/);
assert.equal(fs.existsSync(explorationPath), true, 'UI改造渐变探索页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(tabExplorationPath), true, 'UI改造 Tab 切换探索页应位于正式 Demo 目录。');
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

console.log('UI改造 Demo 导航与静态页面断言通过');
