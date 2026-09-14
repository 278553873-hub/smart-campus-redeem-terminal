import assert from 'node:assert/strict';
import fs from 'node:fs';

const rootApp = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const navigationStart = rootApp.indexOf('{/* 控制面板 */}');
const navigation = rootApp.slice(navigationStart);
const expectedApps = [
  "setCurrentApp('terminal')",
  "setCurrentApp('admin')",
  "setCurrentApp('parent')",
  "setCurrentApp('ui-renovation')",
  "setCurrentApp('pc-workspace')",
  "setCurrentApp('region-pc')",
  "setCurrentApp('teacher-c-mobile')",
];

assert.notEqual(navigationStart, -1, '应存在 Demo 环境切换控制面板。');

let previousIndex = -1;
for (const appEntry of expectedApps) {
  const currentIndex = navigation.indexOf(appEntry);
  assert.ok(currentIndex > previousIndex, `Demo 导航顺序错误：${appEntry}`);
  previousIndex = currentIndex;
}

assert.match(rootApp, /const \[showAdvancedApps, setShowAdvancedApps\] = useState\(false\);/, '区级-PC端和C端改造应默认隐藏。');
assert.match(rootApp, /environmentTitleClickCountRef\.current >= 2/, '连续点击环境切换两次后应切换高级入口显隐。');
assert.match(rootApp, /setShowAdvancedApps\(prev => !prev\);/, '再次点击两次应能隐藏高级入口。');
assert.match(navigation, /\{showAdvancedApps && \([\s\S]*setCurrentApp\('region-pc'\)[\s\S]*setCurrentApp\('teacher-c-mobile'\)[\s\S]*\)\}/, '区级-PC端和C端改造必须共同受高级入口状态控制。');
assert.doesNotMatch(rootApp, /showPhoneShellToggle|模拟真实手机/, '旧的模拟真实手机设置应移除。');

console.log('Demo 导航顺序与隐藏入口断言通过');
