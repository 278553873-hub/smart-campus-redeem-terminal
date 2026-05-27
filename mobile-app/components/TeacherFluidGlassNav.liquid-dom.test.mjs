import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const component = fs.readFileSync('mobile-app/components/TeacherFluidGlassNav.tsx', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');

assert.equal(
  packageJson.dependencies?.['@liquid-dom/react'],
  '0.1.0',
  'package.json 应声明 @liquid-dom/react@0.1.0 依赖'
);

assert.match(
  component,
  /from ['"]@liquid-dom\/react['"]/,
  'TeacherFluidGlassNav 应实际导入 @liquid-dom/react'
);

assert.match(
  component,
  /'gpu' in window\.navigator/,
  'TeacherFluidGlassNav 应检测 WebGPU 支持，避免不兼容浏览器挂载 LiquidCanvas'
);

assert.match(
  component,
  /setLiquidUnavailable\(true\)/,
  'TeacherFluidGlassNav 应在 liquid-dom 渲染报错时回退 CSS 降级层'
);

assert.match(
  app,
  /tabbarWidth=\{tabbarWidth\}/,
  'App 应把实测底栏宽度传给 TeacherFluidGlassNav，保证 liquid-dom Frame 尺寸准确'
);
