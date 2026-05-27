import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const css = fs.readFileSync('mobile-app/styles/navigation.css', 'utf8');

assert.match(
  app,
  /showTabBar\s*&&\s*!viewHandlesScroll\s*\?\s*['"]has-floating-tabbar['"]\s*:\s*['"]['"]/, 
  '只有外层 main 自己滚动的底部导航页，才应增加统一底部安全区；记录页这类内部滚动页不能在 main 上露出白底'
);

assert.doesNotMatch(
  app,
  /showTabBar\s*\?\s*['"]has-floating-tabbar['"]\s*:\s*['"]['"]/, 
  '不能对所有显示底部导航的页面无差别增加 main 底部 padding，否则记录页会出现额外白色底座'
);

assert.match(
  css,
  /--teacher-tabbar-height:\s*66px;/,
  '底部导航高度应抽象为 CSS 变量，避免滚动安全区和实际底栏尺寸不一致'
);

assert.match(
  css,
  /--teacher-tabbar-bottom:\s*max\(16px,\s*env\(safe-area-inset-bottom\)\);/,
  '底部导航距底部的安全区应抽象为 CSS 变量'
);

assert.match(
  css,
  /#main-scroll-container\.has-floating-tabbar[\s\S]*padding-bottom:\s*calc\(var\(--teacher-tabbar-height\) \+ var\(--teacher-tabbar-bottom\) \+ var\(--teacher-tabbar-content-gap\)\)/,
  '外层滚动主容器应为悬浮底栏预留内容底部空间，避免最后一屏被遮挡'
);

assert.match(
  css,
  /#main-scroll-container\.has-floating-tabbar[\s\S]*scroll-padding-bottom:\s*calc\(var\(--teacher-tabbar-height\) \+ var\(--teacher-tabbar-bottom\) \+ var\(--teacher-tabbar-content-gap\)\)/,
  '滚动定位也应避开悬浮底栏，避免锚点或聚焦内容落到导航后方'
);
