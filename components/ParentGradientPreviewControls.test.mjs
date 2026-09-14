import assert from 'node:assert/strict';
import fs from 'node:fs';

const rootSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const parentSource = fs.readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const previewSource = fs.readFileSync(new URL('../mobile-app/styles/teacherGradientPreview.ts', import.meta.url), 'utf8');
const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

requireText(rootSource, 'defaultParentGradientPreview', '家长端应有独立的默认渐变预览配置。');
requireText(rootSource, 'parentGradientScheme', '家长端应维护当前配色方案选择。');
requireText(rootSource, 'parentGradientStyle', '家长端应维护当前渐变样式选择。');
requireText(rootSource, 'aria-label="家长端选择渐变配色方案"', '家长端应提供配色方案选择控件。');
requireText(rootSource, 'aria-label="家长端选择渐变样式"', '家长端应提供渐变样式选择控件。');
requireText(rootSource, 'gradientPreview={{ schemeId: parentGradientScheme, styleId: parentGradientStyle }}', '家长端应接收当前渐变预览配置。');
requireText(parentSource, 'variant="preview" preview={preview}', '家长端应复用教师端背景渲染组件。');
requireText(previewSource, "export const defaultParentGradientPreview: TeacherGradientPreviewConfig = {", '默认家长端渐变配置应集中在教师端预览源文件。');
requireText(previewSource, "schemeId: 'scheme-8'", '家长端默认配色应为方案八。');
requireText(previewSource, "styleId: 'diffuse'", '家长端默认渐变样式应为弥散。');

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent gradient preview controls assertions passed');
