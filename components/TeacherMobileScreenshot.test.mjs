import assert from 'node:assert/strict';
import fs from 'node:fs';

const rootApp = fs.readFileSync('App.tsx', 'utf8');
const mobileApp = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const phoneMockup = fs.readFileSync('components/PhoneMockup.tsx', 'utf8');
const exporter = fs.readFileSync('utils/exportElementAsPng.ts', 'utf8');

assert.match(rootApp, /screenRef=\{teacherPhoneScreenRef\}/, '教师手机端应显式绑定截图目标。');
assert.match(rootApp, /const teacherScreenshotLabel = teacherScreenshotStatus === 'capturing'/, '截图按钮应提供清晰状态。');
assert.match(rootApp, /aria-label=\{teacherScreenshotLabel\}/, '纯图标截图按钮应保留无障碍名称。');
assert.match(rootApp, /pixelRatio: 3/, '截图应按三倍像素导出。');
const screenshotHandlerIndex = rootApp.indexOf('onClick={handleTeacherScreenshot}');
const screenshotButtonStart = rootApp.lastIndexOf('<button', screenshotHandlerIndex);
const screenshotButtonEnd = rootApp.indexOf('</button>', screenshotHandlerIndex);
const screenshotButton = rootApp.slice(screenshotButtonStart, screenshotButtonEnd);
assert.match(screenshotButton, /h-11 w-11/, '截图入口应使用紧凑的 44 像素图标按钮。');
assert.match(screenshotButton, /<Camera /, '截图入口应使用相机图标。');
assert.doesNotMatch(screenshotButton, /<span/, '截图入口不应显示按钮文案。');
assert.doesNotMatch(screenshotButton, /border|bg-white|shadow-\[/, '截图图标不应使用边框、白底或独立阴影。');
assert.match(rootApp, /aria-label="模拟真实手机"/, '手机模拟开关应使用精简名称。');
assert.match(rootApp, /whitespace-nowrap[^>]*>模拟真实手机<\/span>/, '手机模拟开关文案不应换行。');
assert.match(rootApp, /h-\[22px\] w-10/, '手机模拟开关应使用紧凑轨道。');
assert.match(mobileApp, /screenRef\?: React\.Ref<HTMLDivElement>/, '教师手机端应透传屏幕引用。');
assert.equal((mobileApp.match(/screenRef=\{screenRef\}/g) ?? []).length, 2, '登录前后都应绑定同一截图目标。');
assert.match(phoneMockup, /ref=\{screenRef\}/, '截图引用应落在手机屏幕内容层。');
assert.match(phoneMockup, /const shouldShowNativeChrome = showDeviceFrame && safeAreaTop;/, '原生状态区应继续受真实手机效果联动控制。');
assert.match(exporter, /domToBlob/, '截图应使用浏览器原生排版导出。');
assert.match(exporter, /restoreScrollPosition: true/, '截图应保留当前滚动位置。');
assert.match(exporter, /borderRadius: '0'/, '导出图片不应保留手机屏幕圆角。');
assert.match(exporter, /boxShadow: 'none'/, '导出图片不应保留手机屏幕阴影。');
assert.doesNotMatch(exporter, /html2canvas/, '截图不得继续使用会重绘文字的 html2canvas。');

console.log('教师手机端截图功能断言通过');
