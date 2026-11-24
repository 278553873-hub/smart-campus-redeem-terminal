import assert from 'node:assert/strict';
import { DEMO_UNREGISTERED_TEACHER_PHONE, findDemoTeacherAccount, isDemoTeacherPhone } from '../../shared/demoTeacherAccounts.ts';
import {
  addDemoTeacherSupportAccount, hasDemoTeacherSupportAccess, readDemoTeacherSupportAccounts, removeDemoTeacherSupportAccount,
  subscribeToDemoTeacherSupportAccess,
} from '../../shared/demoTeacherSupportAccess.ts';
import { resolveDemoTeacherSwitch } from '../data/teacherLoginAccounts.ts';

const staffPhone = '19000000000';
const schoolTeacherPhone = '19900008610';
const personalTeacherPhone = '15200001332';
const unknownPhone = DEMO_UNREGISTERED_TEACHER_PHONE;
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
  assert.equal(resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone).error, '当前账号未获排查授权');
  assert.throws(() => addDemoTeacherSupportAccount(unknownPhone), /未找到/);
  assert.equal(isDemoTeacherPhone(unknownPhone), true, '未注册演示应使用格式有效但未收录的号码');

  let changes = 0;
  const unsubscribe = subscribeToDemoTeacherSupportAccess(() => { changes += 1; });
  addDemoTeacherSupportAccount(` ${staffPhone} `);
  assert.equal(changes, 1, '同一页面保存授权后，订阅方立即刷新');
  assert.deepEqual(readDemoTeacherSupportAccounts().map(account => account.phone), [staffPhone]);
  assert.equal(findDemoTeacherAccount(staffPhone).schoolSpaceIds.length, 3, '按手机号可查到完整多校关系');

  const schoolSwitch = resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone).session;
  assert.equal(schoolSwitch.account.phone, schoolTeacherPhone);
  assert.equal(schoolSwitch.spaceId, 'school-star');
  assert.notEqual(findDemoTeacherAccount(schoolSwitch.account.phone).id, findDemoTeacherAccount(staffPhone).id);
  assert.equal(hasDemoTeacherSupportAccess(schoolSwitch.account.phone), false, '目标账号不继承原账号授权');
  assert.equal(resolveDemoTeacherSwitch(schoolSwitch.account.phone, staffPhone).error, '当前账号未获排查授权');
  assert.deepEqual(resolveDemoTeacherSwitch(staffPhone, personalTeacherPhone).session, {
    account: { phone: personalTeacherPhone, schoolSpaceIds: [], collaborationSpaceIds: [] },
    spaceId: 'personal',
  });
  assert.equal(resolveDemoTeacherSwitch(staffPhone, '123').error, '请输入正确的手机号');
  assert.deepEqual(resolveDemoTeacherSwitch(staffPhone, unknownPhone), { error: '该手机号未注册，请核对后重试' });
  assert.equal(resolveDemoTeacherSwitch(staffPhone, staffPhone).error, '当前已登录此账号');

  addDemoTeacherSupportAccount(staffPhone);
  addDemoTeacherSupportAccount(schoolTeacherPhone);
  assert.equal(readDemoTeacherSupportAccounts().length, 2, '重复添加不产生重复行，新增存储不覆盖其他账号');
  const storageEvent = new Event('storage');
  Object.defineProperty(storageEvent, 'key', { value: records.keys().next().value });
  browser.dispatchEvent(storageEvent);
  assert.equal(changes, 4, '其他标签页的授权变动也会刷新');

  removeDemoTeacherSupportAccount(staffPhone);
  assert.equal(changes, 5, '移除后立即通知授权列表和教师端');
  assert.deepEqual(readDemoTeacherSupportAccounts().map(account => account.phone), [schoolTeacherPhone]);
  assert.equal(hasDemoTeacherSupportAccess(staffPhone), false);
  assert.equal(resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone).error, '当前账号未获排查授权');
  addDemoTeacherSupportAccount(staffPhone);
  assert.equal(resolveDemoTeacherSwitch(staffPhone, schoolTeacherPhone).session.account.phone, schoolTeacherPhone);
  unsubscribe();
} finally {
  delete globalThis.window;
}

console.log('教师排查授权与演示切换检查通过');
