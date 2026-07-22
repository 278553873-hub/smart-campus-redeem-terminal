import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('mobile-app/components/TeacherMobileScreenBackground.tsx', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const record = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const me = fs.readFileSync('mobile-app/views/MeView.tsx', 'utf8');
const studentDetail = fs.readFileSync('mobile-app/views/DashboardView.tsx', 'utf8');

assert.match(source, /variant\?: TeacherMobileScreenBackgroundVariant/);
assert.match(source, /recordMode\?: TeacherMobileRecordMode/);
assert.match(source, /var\(--tm-bg-page-low\)/);
assert.match(source, /var\(--tm-glow-primary-subtle\)/);
assert.match(source, /var\(--tm-glow-secondary-subtle\)/);
assert.match(
  source,
  /const SharedAmbientBase[\s\S]*?<SharedAmbientBase \/>/,
  '所有背景变体应复用同一环境底层，保证记录页下半屏与班级页、我的页一致',
);
assert.doesNotMatch(source, /bottom-0 h-48/);
assert.doesNotMatch(source, /linear-gradient\(180deg, var\(--tm-bg-page\) 0%, var\(--tm-bg-surface\) 100%\)/);

assert.match(app, /<TeacherMobileScreenBackground variant="record" recordMode=\{activeLogTab\} \/>/);
assert.match(app, /<TeacherMobileScreenBackground \/>/);
assert.doesNotMatch(app, /radial-gradient\(/);
assert.doesNotMatch(record, /TeacherMobileScreenBackground|TeacherRecordAuroraBackground/);
assert.match(me, /bg-transparent/);
assert.match(studentDetail, /min-h-screen bg-transparent/);

console.log('teacher mobile public screen background assertions passed');
