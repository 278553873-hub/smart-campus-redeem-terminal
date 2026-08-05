import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const performanceSource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');

assert.match(source, /avatar: string;/, '课堂大屏学生数据应包含头像字段');
assert.match(source, /getSystemStudentAvatar\(gender, studentIndex \* 17\)/, '演示学生应按性别稳定分配系统头像');
assert.match(source, /avatar=\{student\.avatar\}/, '学生卡应向等级头像传入学生头像');
assert.match(performanceSource, /src=\{avatar\}/, '等级头像应展示学生头像');
assert.match(source, /src=\{evalStudent\.avatar\}/, '点评弹窗应展示学生头像');
assert.doesNotMatch(source, /student\.name\.slice\(0, 1\)/, '学生头像不应继续显示姓氏文字');
assert.doesNotMatch(source, />\s*(更换头像|上传头像|拍照|从相册选择)\s*</, '课堂大屏不应提供头像编辑入口');

console.log('SmartBigScreen student avatar checks passed.');
