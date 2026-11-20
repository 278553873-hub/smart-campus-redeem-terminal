import assert from 'node:assert/strict';
import { resolveDemoTeacherLoginAccount } from '../data/teacherLoginAccounts.ts';
import { confirmTeacherPersonalChoice, maskTeacherLoginPhone, readTeacherPersonalChoice, resolveTeacherLoginDestination } from './teacherLoginAccess.ts';

const unlinked = resolveDemoTeacherLoginAccount('15200001332');
const linked = resolveDemoTeacherLoginAccount('19900008610');

assert.deepEqual(resolveTeacherLoginDestination(unlinked, false), { type: 'school-guide' }, '未关联账号首次登录必须先得到学校关联指引');
assert.deepEqual(resolveTeacherLoginDestination(unlinked, true), { type: 'personal', spaceId: 'personal' }, '主动选择个人版后不重复拦截');
assert.deepEqual(resolveTeacherLoginDestination(linked, false), { type: 'school', spaceId: 'school-star' }, '学校账号直接进入已有学校');
assert.deepEqual(resolveTeacherLoginDestination({ ...unlinked, schoolSpaceIds: ['school-qinghe'] }, true), { type: 'school', spaceId: 'school-qinghe' }, '管理员补录学校后，旧个人版选择不能阻止识别学校');
assert.equal(maskTeacherLoginPhone(unlinked.phone), '152****1332');
assert.deepEqual(unlinked.schoolSpaceIds, [], '未关联演示账号不能继承上一个学校账号的关系');
assert.deepEqual(unlinked.collaborationSpaceIds, []);

const items = new Map();
globalThis.window = { localStorage: { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) } };
assert.equal(readTeacherPersonalChoice(unlinked.phone), false);
confirmTeacherPersonalChoice(unlinked.phone);
assert.equal(readTeacherPersonalChoice(unlinked.phone), true);
assert.equal(readTeacherPersonalChoice('13800001234'), false, '个人版确认应按账号隔离');
Object.defineProperty(window, 'localStorage', { get() { throw new Error('存储不可用'); } });
assert.equal(readTeacherPersonalChoice(unlinked.phone), false);
assert.doesNotThrow(() => confirmTeacherPersonalChoice(unlinked.phone), '存储受限不能阻断本次个人版使用');
delete globalThis.window;

console.log('教师登录分流检查通过：学校直达、个人版确认、补录恢复、账号隔离与存储受限');
