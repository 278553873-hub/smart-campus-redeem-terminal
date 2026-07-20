import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const record = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const background = fs.readFileSync('mobile-app/components/TeacherRecordAuroraBackground.tsx', 'utf8');
const tokenSource = fs.readFileSync('mobile-app/styles/teacherMobileTokens.ts', 'utf8');

assert.match(tokenSource, /'--tm-record-student-primary': teacherBrandSemantic\.primary/);
assert.match(tokenSource, /'--tm-record-student-text': teacherBrandSemantic\.primaryStrong/);
assert.match(tokenSource, /'--tm-record-class-primary': teacherBrandSemantic\.secondary/);
assert.match(tokenSource, /'--tm-record-class-text': teacherBrandSemantic\.secondaryStrong/);
assert.match(tokenSource, /'--tm-record-positive-text': teacherBrandSemantic\.positiveStrong/);
assert.match(tokenSource, /'--tm-record-negative-text': teacherBrandSemantic\.negativeStrong/);

assert.match(record, /text-\[var\(--tm-record-student-text\)\]/);
assert.match(record, /text-\[var\(--tm-record-class-text\)\]/);
assert.match(record, /text-\[var\(--tm-record-positive-text\)\]/);
assert.match(record, /text-\[var\(--tm-record-negative-text\)\]/);
assert.doesNotMatch(record, /#12B8CB|#128698|#7C3AED|#C026D3|#19B8C8|#6679F2|#B832D2/);
assert.match(record, /const recordSheetBackdropClass = '.*bg-\[var\(--tm-mask\)\].*\[animation-duration:var\(--tm-duration-standard\)\]'/);
assert.match(record, /const recordSheetSurfaceClass = '.*rounded-t-\[var\(--tm-radius-sheet\)\].*shadow-\[var\(--tm-shadow-sheet\)\].*\[animation-duration:var\(--tm-duration-panel\)\]'/);
assert.doesNotMatch(record, /rounded-t-\[32px\]|bg-slate-900\/40|shadow-lg/);

assert.match(background, /var\(--tm-glow-primary\)/);
assert.match(background, /var\(--tm-glow-secondary\)/);

const inputStart = app.indexOf('const GlobalInputBar');
const inputEnd = app.indexOf('const showInputBar', inputStart);
const inputBar = app.slice(inputStart, inputEnd);

assert.match(inputBar, /rounded-\[var\(--tm-radius-card\)\] bg-white/);
assert.match(inputBar, /\[box-shadow:var\(--tm-shadow-floating\)\]/);
assert.match(inputBar, />按住说话</);
assert.doesNotMatch(inputBar, /border-\[|border-[#\s]/);
assert.doesNotMatch(inputBar, /from-\[|to-\[|bg-gradient/);

console.log('ClassRecordLogView brand token assertions passed');
