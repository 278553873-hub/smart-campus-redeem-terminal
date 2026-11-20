import assert from 'node:assert/strict';
import fs from 'node:fs';

const loginView = fs.readFileSync('mobile-app/views/TeacherLoginView.tsx', 'utf8');

assert.match(loginView, />\s*一键登录\s*</);
assert.match(loginView, /AI素养评价/);
assert.match(loginView, /申请获取并验证你的手机号/);
assert.match(loginView, /用于识别您的学校与班级/);
assert.match(loginView, /WECHAT_TEACHER_LOGIN_PHONES\.map/);
assert.match(loginView, /maskTeacherLoginPhone\(loginPhone\)/);
assert.match(loginView, /上次提供/);
assert.match(loginView, />\s*不允许\s*</);
assert.match(loginView, />\s*管理号码\s*</);
assert.match(loginView, /ASSETS\.MANAGEMENT\.TEACHER_LOGIN_ICON/);
assert.match(loginView, /--tm-platform-wechat/);
assert.match(loginView, /text-\[length:var\(--tm-font-size-section-title\)\] font-semibold leading-6/);
assert.match(loginView, /font-medium leading-6 tabular-nums/);
assert.match(loginView, /text-\[length:var\(--tm-font-size-body\)\] font-medium/);

assert.match(loginView, /最近登录/);
assert.match(loginView, /手机号登录\/注册/);
assert.match(loginView, /验证码登录/);
assert.match(loginView, /密码登录/);
assert.doesNotMatch(loginView, /#[0-9A-Fa-f]{6}|rgba\(/);

console.log('TeacherLoginView WeChat authorization assertions passed');
