import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const record = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const background = fs.readFileSync('mobile-app/components/TeacherMobileScreenBackground.tsx', 'utf8');
const inputBar = fs.readFileSync('mobile-app/components/TeacherRecordInputBar.tsx', 'utf8');
const tokenSource = fs.readFileSync('mobile-app/styles/teacherMobileTokens.ts', 'utf8');

assert.match(tokenSource, /'--tm-record-student-primary': teacherBrandSemantic\.primary/);
assert.match(tokenSource, /'--tm-record-student-text': teacherBrandSemantic\.primaryStrong/);
assert.match(tokenSource, /'--tm-record-class-primary': teacherBrandSemantic\.secondary/);
assert.match(tokenSource, /'--tm-record-class-text': teacherBrandSemantic\.secondaryStrong/);
assert.match(tokenSource, /'--tm-record-positive-text': teacherBrandSemantic\.positiveStrong/);
assert.match(tokenSource, /'--tm-record-negative-text': teacherEvaluationScoreSemantic\.negative/);
assert.match(tokenSource, /'--tm-score-negative': teacherEvaluationScoreSemantic\.negative/);

assert.match(record, /text-\[var\(--tm-record-student-text\)\]/);
assert.match(record, /text-\[var\(--tm-record-class-text\)\]/);
assert.match(record, /text-\[var\(--tm-record-positive-text\)\]/);
assert.match(record, /text-\[var\(--tm-record-negative-text\)\]/);
assert.match(record, /bg-\[var\(--tm-score-negative\)\]/);
assert.match(record, /text-\[var\(--tm-score-negative\)\]/);
assert.equal((record.match(/--tm-status-negative/g) ?? []).length, 1, '移除按压浅底后，记录页危险色仅用于删除操作文字。');
assert.doesNotMatch(record, /#12B8CB|#128698|#7C3AED|#C026D3|#19B8C8|#6679F2|#B832D2/);
assert.match(record, /const recordSheetBackdropClass = '.*bg-\[var\(--tm-mask\)\].*\[animation-duration:var\(--tm-duration-standard\)\]'/);
assert.match(record, /const recordSheetSurfaceClass = '.*rounded-t-\[var\(--tm-radius-sheet\)\].*\[box-shadow:var\(--tm-shadow-sheet\)\].*\[animation-duration:var\(--tm-duration-panel\)\]'/);
assert.doesNotMatch(record, /rounded-t-\[32px\]|bg-slate-900\/40|shadow-lg/);

assert.match(background, /var\(--tm-glow-primary\)/);
assert.match(background, /var\(--tm-glow-secondary\)/);

assert.match(app, /<TeacherRecordInputBar/);
assert.match(inputBar, /rounded-\[var\(--tm-radius-card\)\] bg-white/);
assert.match(inputBar, /\[box-shadow:var\(--tm-shadow-floating\)\]/);
assert.match(inputBar, /'按住说话'/);
assert.doesNotMatch(inputBar, /border-\[|border-[#\s]/);
assert.doesNotMatch(inputBar, /from-\[|to-\[|bg-gradient/);

console.log('ClassRecordLogView brand token assertions passed');
