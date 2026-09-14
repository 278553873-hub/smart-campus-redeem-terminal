import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('mobile-app/components/TeacherMobileScreenBackground.tsx', 'utf8');
const gradientPreview = fs.readFileSync('mobile-app/styles/teacherGradientPreview.ts', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const record = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const classList = fs.readFileSync('mobile-app/views/ClassListView.tsx', 'utf8');
const me = fs.readFileSync('mobile-app/views/MeView.tsx', 'utf8');
const studentDetail = fs.readFileSync('mobile-app/views/DashboardView.tsx', 'utf8');

assert.match(source, /variant\?: TeacherMobileScreenBackgroundVariant/);
assert.match(source, /recordMode\?: TeacherMobileRecordMode/);
assert.match(source, /classListMode\?: TeacherMobileClassListMode/);
assert.match(source, /variant === 'plain'/);
assert.match(source, /variant === 'me'/);
assert.match(source, /bg-\[var\(--tm-page-plain-header-bg\)\]/);
assert.match(source, /radial-gradient\(ellipse 84% 50% at -8% 24%/);
assert.match(source, /var\(--tm-me-gradient-primary-field\)/);
assert.match(source, /var\(--tm-me-gradient-sky-field\)/);
assert.match(source, /var\(--tm-me-gradient-jade-hint\)/);
assert.match(source, /linear-gradient\(180deg, transparent 52%, var\(--tm-me-gradient-tail-field\) 100%\)/);
assert.doesNotMatch(source, /conic-gradient/);
assert.match(source, /var\(--tm-bg-page-low\)/);
assert.match(source, /var\(--tm-glow-primary-subtle\)/);
assert.match(source, /var\(--tm-glow-secondary-subtle\)/);
assert.match(
  source,
  /const SharedAmbientBase[\s\S]*?<SharedAmbientBase \/>/,
  '环境背景与记录页应复用同一底层，保持页面之间的连续感',
);
assert.doesNotMatch(source, /bottom-0 h-48/);
assert.doesNotMatch(source, /linear-gradient\(180deg, var\(--tm-bg-page\) 0%, var\(--tm-bg-surface\) 100%\)/);
assert.match(gradientPreview, /underlayScheme = teacherGradientSchemes\.find\(item => item\.id === 'scheme-2'\)/, '专属插画应复用方案二的完整弥散渐变');
assert.match(gradientPreview, /backgroundSize: 'contain, auto, auto, auto, auto, auto'/, '专属插画应完整显示，不得使用 cover 裁切原图');
assert.match(gradientPreview, /backgroundPosition: 'center bottom, center, center, center, center, center'/, '专属插画应与页面底部草地对齐');
assert.match(gradientPreview, /direction: TeacherGradientDirection = 'forward'/, '渐变生成器应支持正向与反向配色');
assert.match(gradientPreview, /direction === 'reverse' \? toneB : toneA/, '反向配色应交换左右主辅色');
assert.match(source, /<PreviewBackgroundPanel visible preview=\{preview\} direction="forward" \/>/, '正向预览背景应始终保持完整，避免交叉淡入中段露出底色');
assert.match(source, /<PreviewBackgroundPanel visible=\{!isPrimaryContext\} preview=\{preview\} direction="reverse" \/>/, '只允许反向预览背景在正向底层上淡入淡出');
assert.doesNotMatch(source, /<PreviewBackgroundPanel visible=\{isPrimaryContext\} preview=\{preview\} direction="forward" \/>/, '正反预览背景不得同时反向改变透明度');

assert.match(app, /<TeacherMobileScreenBackground variant="record" recordMode=\{activeLogTab\} preview=\{gradientPreview\} \/>/);
assert.match(app, /<TeacherMobileScreenBackground variant="class-list" classListMode=\{classListTab\} preview=\{gradientPreview\} \/>/);
assert.match(app, /<TeacherMobileScreenBackground variant="plain" \/>/);
assert.match(app, /<TeacherMobileScreenBackground variant="me" \/>/);
assert.doesNotMatch(app, /radial-gradient\(/);
assert.doesNotMatch(record, /TeacherMobileScreenBackground|TeacherRecordAuroraBackground/);
assert.doesNotMatch(classList, /--tm-record-(student|class)/, '班级内容分类不得复用记录模式色');
assert.doesNotMatch(classList, /teacher-context-enter/, '班级内容切换不得产生位移或淡入动效');
assert.doesNotMatch(record, /teacher-context-enter/, '记录内容切换不得产生位移或淡入动效');
assert.match(me, /bg-transparent/);
assert.match(studentDetail, /relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent/);

console.log('teacher mobile public screen background assertions passed');
