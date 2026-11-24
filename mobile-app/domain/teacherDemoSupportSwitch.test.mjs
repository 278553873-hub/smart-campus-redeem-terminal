import assert from 'node:assert/strict';
import { pbkdf2Sync } from 'node:crypto';
import { DEMO_UNREGISTERED_TEACHER_PHONE, findDemoTeacherAccount, isDemoTeacherPhone } from '../../shared/demoTeacherAccounts.ts';
import {
  addDemoTeacherSupportAccount, DEMO_TEACHER_PREVIEW_SECURITY_CODE, getVerifiedDemoTeacherSupportMode, hasDemoTeacherSupportAccess, hasVerifiedDemoTeacherSupportAccess,
  readDemoTeacherSupportAccounts, removeDemoTeacherSupportAccount, resetDemoTeacherSupportSecurityCode,
  subscribeToDemoTeacherSupportAccess,
} from '../../shared/demoTeacherSupportAccess.ts';
import { resolveDemoTeacherSwitch } from '../data/teacherLoginAccounts.ts';
import { getAvailableRecentTeacherLogins, getRecentTeacherLoginDestination, readRecentTeacherLogins, rememberRecentTeacherLogin, rememberRecentTeacherLoginSpace, RECENT_TEACHER_LOGINS_STORAGE_KEY } from '../data/recentTeacherLogins.ts';
import { PREVIEW_RECENT_TEACHER_LOGINS } from '../data/recentTeacherLoginPreview.ts';

const staffPhone = '19000000000';
const schoolTeacherPhone = '19900008610';
const personalTeacherPhone = '15200001332';
const unknownPhone = DEMO_UNREGISTERED_TEACHER_PHONE;
const firstCode = 'First2026';
const nextCode = '87654321Z';
const records = new Map();
const browser = new EventTarget();
browser.localStorage = {
  getItem: key => records.get(key) ?? null,
  setItem: (key, value) => records.set(key, value),
  removeItem: key => records.delete(key),
};
globalThis.window = browser;

try {
  assert.deepEqual(readDemoTeacherSupportAccounts(), []);
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone)).error, '当前账号未获排查授权');
  await assert.rejects(addDemoTeacherSupportAccount(unknownPhone, firstCode), /未找到/);
  for (const invalid of ['Test123', '123456789', 'EnglishOnly', '校园Test2026', 'Test2026!', 'Test2026\n']) {
    await assert.rejects(addDemoTeacherSupportAccount(staffPhone, invalid), /至少 8 位/);
  }
  assert.equal(isDemoTeacherPhone(unknownPhone), true, '未注册演示应使用格式有效但未收录的号码');

  let changes = 0;
  const unsubscribe = subscribeToDemoTeacherSupportAccess(() => { changes += 1; });
  await addDemoTeacherSupportAccount(` ${staffPhone} `, firstCode);
  assert.equal(changes, 1, '同一页面保存授权后，订阅方立即刷新');
  assert.deepEqual(readDemoTeacherSupportAccounts().map(account => account.phone), [staffPhone]);
  assert.equal(findDemoTeacherAccount(staffPhone).schoolSpaceIds.length, 3, '按手机号可查到完整多校关系');
  assert.ok([...records.values()].every(value => !value.includes(firstCode)), '浏览器仅保存校验所需的派生值');
  await assert.rejects(addDemoTeacherSupportAccount(staffPhone, nextCode), /已授权/);

  assert.equal((await resolveDemoTeacherSwitch(staffPhone, '123')).error, '请输入正确的手机号');
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, staffPhone)).error, '当前已登录此账号');
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, unknownPhone, firstCode), { error: '该手机号未注册，请核对后重试' });
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone), { needsSecurityCode: true });
  const codeEnteredPreview = { registered: true, codeEntered: true };
  const codeMissingPreview = { registered: true, codeEntered: false };
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, undefined, false, undefined, codeEnteredPreview)).session.account.phone, schoolTeacherPhone);
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, undefined, false, undefined, codeMissingPreview), { needsSecurityCode: true });
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, nextCode, false, undefined, codeMissingPreview), { error: '安全码有误，请重试' });
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, DEMO_TEACHER_PREVIEW_SECURITY_CODE, false, undefined, codeMissingPreview)).session.account.phone, schoolTeacherPhone);
  assert.equal(hasVerifiedDemoTeacherSupportAccess(staffPhone, false), false, '两种预览状态均不写入实际授权验证记录');
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, nextCode), { error: '安全码有误，请重试' });
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone), { needsSecurityCode: true });
  const cancelled = new AbortController();
  const cancelledSwitch = resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, firstCode, false, cancelled.signal);
  cancelled.abort();
  assert.equal((await cancelledSwitch).error, '校验已取消');
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone), { needsSecurityCode: true });

  const schoolSwitch = (await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, firstCode)).session;
  assert.equal(hasVerifiedDemoTeacherSupportAccess(staffPhone, false), true);
  assert.equal(getVerifiedDemoTeacherSupportMode(staffPhone, false), 'granted');
  assert.equal(getVerifiedDemoTeacherSupportMode(staffPhone, true), 'granted');
  assert.equal(schoolSwitch.account.phone, schoolTeacherPhone);
  assert.equal(schoolSwitch.spaceId, 'school-star');
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, undefined, false, undefined, { registered: false, codeEntered: true })).error, '该手机号未注册，请核对后重试');
  assert.ok((await resolveDemoTeacherSwitch(staffPhone, unknownPhone, undefined, false, undefined, { registered: true })).session, '注册预览可使用任意格式正确的手机号');
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, '123', undefined, false, undefined, { registered: true })).error, '请输入正确的手机号');
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, undefined, false, undefined, codeMissingPreview), { needsSecurityCode: true }, '已实际验证仍可预览未输入安全码');
  assert.equal(hasDemoTeacherSupportAccess(schoolSwitch.account.phone), false, '目标账号不继承原账号授权');
  assert.deepEqual((await resolveDemoTeacherSwitch(staffPhone, personalTeacherPhone)).session, {
    account: { phone: personalTeacherPhone, schoolSpaceIds: [], collaborationSpaceIds: [] },
    spaceId: 'personal',
  });

  await resetDemoTeacherSupportSecurityCode(staffPhone, nextCode);
  assert.equal(hasVerifiedDemoTeacherSupportAccess(staffPhone, false), false, '重置后不再复用旧的验证结果');
  assert.equal(getVerifiedDemoTeacherSupportMode(staffPhone, true), null);
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone), { needsSecurityCode: true });
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, firstCode)).error, '安全码有误，请重试');
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone, nextCode)).session.account.phone, schoolTeacherPhone);

  assert.deepEqual(await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone, undefined, true), { needsSecurityCode: true });
  assert.equal((await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone, DEMO_TEACHER_PREVIEW_SECURITY_CODE, true)).session.account.phone, staffPhone);
  assert.equal(getVerifiedDemoTeacherSupportMode(schoolTeacherPhone, true), 'preview');
  assert.equal(getVerifiedDemoTeacherSupportMode(schoolTeacherPhone, false), null, '模拟验证只在预览环境可复用');
  assert.equal((await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone)).error, '当前账号未获排查授权');

  const legacyKey = 'letu-demo-teacher-support:v1:' + findDemoTeacherAccount(schoolTeacherPhone).id;
  records.set(legacyKey, '1');
  const changesBeforeStorage = changes;
  const storageEvent = new Event('storage');
  Object.defineProperty(storageEvent, 'key', { value: legacyKey });
  browser.dispatchEvent(storageEvent);
  assert.equal(changes, changesBeforeStorage + 1, '其他标签页的授权变动也会刷新');
  assert.deepEqual(await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone), { needsSecurityCode: true });
  assert.equal((await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone, nextCode)).error, '该排查授权尚未设置安全码');
  await resetDemoTeacherSupportSecurityCode(schoolTeacherPhone, nextCode);
  assert.deepEqual(await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone), { needsSecurityCode: true });

  const changesBeforeRemoval = changes;
  removeDemoTeacherSupportAccount(staffPhone);
  assert.equal(changes, changesBeforeRemoval + 1, '移除后立即通知授权列表和教师端');
  assert.deepEqual(readDemoTeacherSupportAccounts().map(account => account.phone), [schoolTeacherPhone]);
  assert.equal((await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone)).error, '当前账号未获排查授权');
  await addDemoTeacherSupportAccount(staffPhone, firstCode);
  assert.deepEqual(await resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone), { needsSecurityCode: true });
  unsubscribe();

  const oldCode = '校园Test2026';
  const oldSalt = '11'.repeat(16);
  const verifier = pbkdf2Sync(oldCode, Buffer.from(oldSalt, 'hex'), 120_000, 32, 'sha256').toString('hex');
  records.set(legacyKey, JSON.stringify({ salt: oldSalt, verifier, verified: false }));
  assert.deepEqual(await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone), { needsSecurityCode: true });
  assert.equal((await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone, nextCode)).error, '安全码有误，请重试');
  assert.equal((await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone, oldCode)).session.account.phone, staffPhone);
  assert.equal((await resolveDemoTeacherSwitch(schoolTeacherPhone, staffPhone)).session.account.phone, staffPhone);

  const operator = { ...schoolSwitch, account: { ...schoolSwitch.account, phone: staffPhone }, name: '刘飞', schoolName: '星河实验学校' };
  const target = { ...schoolSwitch, name: '陈雨', schoolName: '星河实验学校', support: { operatorPhone: staffPhone, preview: false } };
  const ordinaryLogins = rememberRecentTeacherLogin([], operator);
  assert.deepEqual(getAvailableRecentTeacherLogins(ordinaryLogins, target, null), [target, operator], '切换功能启用前已经进入排查账号时也能切回原账号');
  const supportLogins = rememberRecentTeacherLogin(ordinaryLogins, target);
  assert.deepEqual(readRecentTeacherLogins(), supportLogins, '排查登录记录可从当前浏览器恢复');
  assert.deepEqual(getAvailableRecentTeacherLogins(supportLogins, target, null), [target, operator], '切到目标后可回到原账号');
  assert.deepEqual(getAvailableRecentTeacherLogins(supportLogins, operator, 'granted'), [target, operator], '原账号已验证时可再次切入目标');
  assert.deepEqual(getAvailableRecentTeacherLogins(supportLogins, operator, null), [operator], '排查授权撤销或重置后不再提供快捷进入');
  assert.deepEqual(getAvailableRecentTeacherLogins(supportLogins, operator, 'preview'), [operator], '预览验证不能复用运营授权的排查记录');
  const movedSchool = rememberRecentTeacherLoginSpace(supportLogins, staffPhone, 'school-qizhong');
  assert.deepEqual(movedSchool.map(entry => entry.account.phone), [schoolTeacherPhone, staffPhone], '切换学校不改变账号最近登录顺序或增加账号行');
  const [, savedOperator] = readRecentTeacherLogins();
  assert.deepEqual(getRecentTeacherLoginDestination(savedOperator), {
    spaceId: 'school-qizhong', spaceName: '成都七中初中附属小学', schoolCount: 3, canRestore: true,
  });
  assert.deepEqual(getRecentTeacherLoginDestination(savedOperator, { ...savedOperator.account, schoolSpaceIds: ['school-star'] }), {
    spaceId: 'school-star', spaceName: '星河实验学校', schoolCount: 1, canRestore: false,
  });
  const movedPersonal = rememberRecentTeacherLoginSpace(movedSchool, staffPhone, 'personal');
  assert.deepEqual(getRecentTeacherLoginDestination(movedPersonal[1]), {
    spaceId: 'personal', spaceName: '个人空间', schoolCount: 3, canRestore: true,
  });
  assert.deepEqual(rememberRecentTeacherLoginSpace(movedPersonal, staffPhone, 'collab-li'), movedPersonal, '协作班级不替代已记录的学校或个人空间');
  const ordinaryTarget = { ...target, support: undefined };
  rememberRecentTeacherLogin(supportLogins, ordinaryTarget);
  assert.equal(rememberRecentTeacherLogin(supportLogins, target)[0].support, undefined, '已常规登录的账号保持原有切换资格');
  records.delete(RECENT_TEACHER_LOGINS_STORAGE_KEY);

  const recentEntry = index => ({
    account: { phone: '1390000' + String(index).padStart(4, '0'), schoolSpaceIds: [], collaborationSpaceIds: [] },
    spaceId: 'personal', name: `教师${index}`, schoolName: '个人空间',
  });
  let recent = [];
  for (let index = 1; index <= 12; index++) recent = rememberRecentTeacherLogin(recent, recentEntry(index));
  assert.deepEqual(readRecentTeacherLogins(), Array.from({ length: 10 }, (_, index) => recentEntry(12 - index)));
  recent = rememberRecentTeacherLogin(recent, recentEntry(6));
  assert.equal(recent.length, 10);
  assert.equal(recent[0].name, '教师6');
  records.set(RECENT_TEACHER_LOGINS_STORAGE_KEY, JSON.stringify([null, { account: { phone: 1 } }, ...recent, recent[0]]));
  assert.deepEqual(readRecentTeacherLogins(), recent, '最近账号读取时排除无效记录和重复手机号');
  assert.equal(PREVIEW_RECENT_TEACHER_LOGINS.length, 10);
  assert.equal(new Set(PREVIEW_RECENT_TEACHER_LOGINS.map(entry => entry.account.phone)).size, 10);
  assert.ok(PREVIEW_RECENT_TEACHER_LOGINS.every(entry => entry.name && entry.schoolName && isDemoTeacherPhone(entry.account.phone)));
  assert.ok(PREVIEW_RECENT_TEACHER_LOGINS.some(entry => getRecentTeacherLoginDestination(entry).schoolCount > 1), '满列表预览包含多校老师');
  assert.deepEqual(readRecentTeacherLogins(), recent, '示例账号不写入真实登录历史');
} finally {
  delete globalThis.window;
}

console.log('教师排查授权、安全码与最近账号检查通过');
