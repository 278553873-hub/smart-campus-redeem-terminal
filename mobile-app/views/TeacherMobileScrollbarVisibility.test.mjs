import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('mobile-app/index.css', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const guidelines = fs.readFileSync('design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', 'utf8');

assert.match(
  app,
  /className="teacher-mobile-app flex h-\[100dvh\]/,
  '教师手机端真实模式和手机壳预览应共享稳定的应用级样式边界',
);
assert.match(
  css,
  /\.teacher-mobile-app,\s*\.teacher-mobile-app \* \{\s*-ms-overflow-style: none;\s*scrollbar-width: none;\s*\}/s,
  '教师手机端应隐藏 Firefox 和旧版 Edge 的横向、纵向滚动条',
);
assert.match(
  css,
  /\.teacher-mobile-app::\-webkit-scrollbar,\s*\.teacher-mobile-app \*::\-webkit-scrollbar \{\s*display: none;\s*width: 0;\s*height: 0;\s*\}/s,
  '教师手机端应隐藏微信 WebView、Safari 和 Chrome 的横向、纵向滚动条',
);
assert.doesNotMatch(css, /\.phone-mockup \*::\-webkit-scrollbar/);
assert.match(guidelines, /隐藏横向、纵向滚动条本体/);
assert.match(guidelines, /保留触摸滑动、惯性滚动、键盘滚动与程序定位能力/);

console.log('teacher mobile scrollbar visibility assertions passed');
