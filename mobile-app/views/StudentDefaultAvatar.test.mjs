import assert from 'node:assert/strict';
import fs from 'node:fs';

const assetsSource = fs.readFileSync('mobile-app/assets/images.ts', 'utf8');
const avatarCatalogSource = fs.readFileSync('mobile-app/assets/studentAvatarCatalog.ts', 'utf8');
const constantsSource = fs.readFileSync('mobile-app/constants.ts', 'utf8');
const parentAppSource = fs.readFileSync('components/ParentApp.tsx', 'utf8');
const classDetailSource = fs.readFileSync('mobile-app/views/ClassDetailView.tsx', 'utf8');
const studentDetailSource = fs.readFileSync('mobile-app/views/DashboardView.tsx', 'utf8');

assert.match(assetsSource, /STUDENT_GIRL_DEFAULT: studentGirlDefaultAvatar/);
assert.match(avatarCatalogSource, /gender === 'male' \? studentBoyAvatars : studentGirlAvatars/);
assert.match(constantsSource, /getSystemStudentAvatar\(gender, seed \* 31 \+ i \* 17\)/);
assert.doesNotMatch(constantsSource, /ASSETS\.AVATAR\.BOYS\[/);
assert.doesNotMatch(constantsSource, /ASSETS\.AVATAR\.GIRLS\[/);
assert.doesNotMatch(constantsSource, /isMissingFace/);
assert.match(parentAppSource, /ASSETS\.AVATAR\.SYSTEM_BOYS/);
assert.match(parentAppSource, /ASSETS\.AVATAR\.SYSTEM_GIRLS/);
assert.doesNotMatch(assetsSource, /avatar[_-]boy/i);
assert.doesNotMatch(assetsSource, /avatar[_-]girl/i);
assert.match(classDetailSource, /student\.avatar \|\| ASSETS\.AVATAR\.STUDENT_GIRL_DEFAULT/);
assert.match(studentDetailSource, /student\.gender === 'male' \? ASSETS\.AVATAR\.GENERIC_BOY : ASSETS\.AVATAR\.STUDENT_GIRL_DEFAULT/);

console.log('演示学生已按性别稳定分配系统默认头像。');
