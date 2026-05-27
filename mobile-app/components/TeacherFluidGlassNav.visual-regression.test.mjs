import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync('mobile-app/components/TeacherFluidGlassNav.tsx', 'utf8');
const css = fs.readFileSync('mobile-app/styles/navigation.css', 'utf8');

assert.match(
  component,
  /enableExperimentalLiquidDom\s*=\s*false/,
  'liquid-dom WebGPU 画布必须默认关闭，避免覆盖核心底部导航导致深灰和发糊'
);

assert.match(
  component,
  /enableExperimentalLiquidDom\s*&&\s*supportsWebGpu\s*&&\s*!liquidUnavailable/,
  '只有显式开启且支持 WebGPU 时，才允许挂载 liquid-dom 增强层'
);

assert.match(
  css,
  /\.ai-tabbar-container::before/,
  '底部导航需要 CSS 高光层来呈现 Liquid Glass 质感'
);

assert.match(
  css,
  /\.ai-tabbar-container::after/,
  '底部导航需要 CSS 折射边缘层来呈现玻璃厚度'
);

assert.match(
  css,
  /\.tabbar-liquid-indicator/,
  '选中态应使用独立液态玻璃胶囊，而不是深灰覆盖块'
);
