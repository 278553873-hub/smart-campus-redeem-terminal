import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('mobile-app/components/TeacherMobileScreenBackground.tsx', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const record = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const me = fs.readFileSync('mobile-app/views/MeView.tsx', 'utf8');
const studentDetail = fs.readFileSync('mobile-app/views/DashboardView.tsx', 'utf8');

assert.match(source, /variant\?: TeacherMobileScreenBackgroundVariant/);
assert.match(source, /recordMode\?: TeacherMobileRecordMode/);
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

assert.match(app, /<TeacherMobileScreenBackground variant="record" recordMode=\{activeLogTab\} \/>/);
assert.match(app, /<TeacherMobileScreenBackground variant="plain" \/>/);
assert.match(app, /<TeacherMobileScreenBackground variant="me" \/>/);
assert.match(app, /<TeacherMobileScreenBackground \/>/);
assert.doesNotMatch(app, /radial-gradient\(/);
assert.doesNotMatch(record, /TeacherMobileScreenBackground|TeacherRecordAuroraBackground/);
assert.match(me, /bg-transparent/);
assert.match(studentDetail, /relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent/);

console.log('teacher mobile public screen background assertions passed');
