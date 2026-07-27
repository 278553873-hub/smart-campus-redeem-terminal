import assert from 'node:assert/strict';
import fs from 'node:fs';

const assetsSource = fs.readFileSync('mobile-app/assets/images.ts', 'utf8');
const constantsSource = fs.readFileSync('mobile-app/constants.ts', 'utf8');
const classDetailSource = fs.readFileSync('mobile-app/views/ClassDetailView.tsx', 'utf8');
const studentDetailSource = fs.readFileSync('mobile-app/views/DashboardView.tsx', 'utf8');

assert.match(assetsSource, /STUDENT_GIRL_DEFAULT: studentGirlDefaultAvatar/);
assert.match(constantsSource, /ASSETS\.AVATAR\.STUDENT_GIRL_DEFAULT/);
assert.match(classDetailSource, /student\.avatar \|\| ASSETS\.AVATAR\.STUDENT_GIRL_DEFAULT/);
assert.match(studentDetailSource, /student\.gender === 'male' \? ASSETS\.AVATAR\.GENERIC_BOY : ASSETS\.AVATAR\.STUDENT_GIRL_DEFAULT/);

console.log('女生默认头像已统一接入学生列表和学生详情页。');
