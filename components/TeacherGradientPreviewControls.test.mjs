import assert from 'node:assert/strict';
import fs from 'node:fs';

const rootApp = fs.readFileSync('App.tsx', 'utf8');
const mobileApp = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const background = fs.readFileSync('mobile-app/components/TeacherMobileScreenBackground.tsx', 'utf8');
const preview = fs.readFileSync('mobile-app/styles/teacherGradientPreview.ts', 'utf8');

assert.match(rootApp, /const \[teacherGradientScheme, setTeacherGradientScheme\]/);
assert.match(rootApp, /const \[teacherGradientStyle, setTeacherGradientStyle\]/);
assert.match(rootApp, /aria-label="选择渐变配色方案"/);
assert.match(rootApp, /aria-label="选择渐变样式"/);
assert.match(rootApp, /isTeacherGradientControlsOpen/);
assert.match(rootApp, /展开渐变预览配置/);
assert.match(rootApp, /max-\[900px\]:hidden/);
assert.match(rootApp, /gradientPreview=\{\{ schemeId: teacherGradientScheme, styleId: teacherGradientStyle \}\}/);
assert.match(mobileApp, /gradientPreview\?: TeacherGradientPreviewConfig/);
assert.match(mobileApp, /variant="preview" preview=\{gradientPreview\}/);
assert.match(mobileApp, /screenBackground=\{gradientPreview/);
assert.match(mobileApp, /gradientPreview \? 'bg-transparent'/);
assert.match(background, /getTeacherGradientPreviewVisual\(preview\)/);
assert.match(preview, /schemeId: 'scheme-6'/);
assert.match(preview, /styleId: 'diffuse'/);
assert.match(preview, /item\.id === defaultTeacherGradientPreview\.schemeId/);
assert.equal((preview.match(/id: 'scheme-\d+'/g) ?? []).length, 11, '预览配置应包含 11 套配色方案。');
assert.equal((preview.match(/id: '(?:diffuse|linear|aurora|conic)'/g) ?? []).length, 4, '预览配置应包含 4 种渐变样式。');
assert.match(preview, /cleanDiffuse: true/);
assert.match(preview, /const tailWash = `linear-gradient\(180deg, transparent 52%, \$\{withAlpha\(toneB, 0\.05\)\} 100%\)`/);
assert.equal((preview.match(/\btailWash,/g) ?? []).length, 5, '所有渐变样式与清透分支都应保留由当前辅助色派生的底部续色层。');

console.log('教师手机端渐变预览控制断言通过');
