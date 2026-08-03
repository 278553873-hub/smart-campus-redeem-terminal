import assert from 'node:assert/strict';
import fs from 'node:fs';

const classList = fs.readFileSync('mobile-app/views/ClassListView.tsx', 'utf8');
const css = fs.readFileSync('mobile-app/index.css', 'utf8');

assert.match(classList, /bg-\[var\(--tm-brand-primary-soft\)\] text-\[var\(--tm-brand-primary\)\]/);
assert.match(classList, /bg-\[var\(--tm-brand-secondary-soft\)\] text-\[var\(--tm-brand-secondary-strong\)\]/);
assert.match(classList, /bg-\[var\(--tm-status-positive-soft\)\]/);
assert.match(classList, /bg-\[var\(--tm-status-negative\)\]/);
assert.match(classList, /import MobileBottomSheet/);
assert.ok((classList.match(/<MobileBottomSheet/g) ?? []).length >= 4, '班级页弹层应统一复用公共底部抽屉。');

assert.doesNotMatch(classList, /(?:bg|text|border|shadow)-(?:cyan|blue|indigo|violet)-/);
assert.doesNotMatch(classList, /bg-gradient/);
assert.doesNotMatch(classList, /#[0-9A-Fa-f]{6}|rgba\(/);
assert.doesNotMatch(classList, /h-\[10px\]|h-\[38px\]/);
assert.match(classList, /min-h-11 items-center/);

assert.match(css, /radial-gradient\(circle at 12% 0%, var\(--tm-glow-primary\)/);
assert.match(css, /radial-gradient\(circle at 88% 2%, var\(--tm-glow-secondary\)/);
assert.match(css, /linear-gradient\(180deg, var\(--tm-bg-page\)/);

console.log('ClassListView brand token assertions passed');
