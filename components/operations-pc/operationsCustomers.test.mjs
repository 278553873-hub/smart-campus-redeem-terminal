import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transform } from 'esbuild';

const source = fs.readFileSync(new URL('./operationsCustomers.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const model = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const { createOperationsCustomers, getOrganizationAuthorizationStatus, getOrganizationStatistics, getSchoolAuthorizationStatus, getSchoolOrganizations, collectIndicatorScope, getIndicatorConflicts, saveOrganization } = model;
const seed = createOperationsCustomers();
const original = JSON.stringify(seed);
const draft = { name: '新增市级组织', kind: 'city', administrator: '张老师', phone: '13800000000', schoolIds: ['1053', '1049', '1053'], indicatorId: 'secondary-v1', authorizationStartsAt: '2026-12-01', authorizationEndsAt: '2027-11-30' };
const now = new Date('2026-11-18T17:00:00Z');

const authorization = { authorizationStartsAt: '2026-11-18', authorizationEndsAt: '2026-11-20' };
for (const [time, expected] of [
  ['2026-11-17T15:59:59Z', '未开始'],
  ['2026-11-17T16:00:00Z', '合作中'],
  ['2026-11-20T15:59:59Z', '合作中'],
  ['2026-11-20T16:00:00Z', '已到期'],
]) assert.equal(getSchoolAuthorizationStatus(authorization, new Date(time)), expected, `授权边界按中国时区计算：${time}`);
assert.deepEqual(seed.schools.filter(school => ['1053', '1049', '1048'].includes(school.id)).map(school => getSchoolAuthorizationStatus(school, now)), ['合作中', '已到期', '未开始']);
const city = seed.organizations[0];
assert.deepEqual(getOrganizationStatistics(seed, { ...city, schoolIds: [...city.schoolIds, city.schoolIds[0], '不存在'] }), { schoolCount: 4, teacherCount: 248, classCount: 98, studentCount: 4296 }, '组织内按有效学校编号去重汇总规模');
for (const [time, expected] of [
  ['2026-11-17T15:59:59Z', '未开始'],
  ['2026-11-17T16:00:00Z', '合作中'],
  ['2026-11-20T15:59:59Z', '合作中'],
  ['2026-11-20T16:00:00Z', '已到期'],
]) assert.equal(getOrganizationAuthorizationStatus({ ...city, ...authorization }, new Date(time)), expected);
assert.equal(getOrganizationAuthorizationStatus({ ...city, authorizationStartsAt: '', authorizationEndsAt: '' }, now), '未配置', '旧组织缺少授权期时不猜测授权状态');
assert.throws(() => saveOrganization(seed, { ...draft, authorizationEndsAt: '2026-11-30' }, { activate: false }, now), /授权结束日期/, '授权区间倒置被拦截');
assert.throws(() => saveOrganization(seed, { ...draft, authorizationStartsAt: '2026-02-30' }, { activate: false }, now), /授权起止日期/, '不存在的日期被拦截');

assert.deepEqual(getSchoolOrganizations(seed, '1053').map(item => item.name).sort(), ['成都市教育局', '成都市高新区'].sort(), '一所学校同时关联市级和区级组织');
assert.equal(new Set(seed.organizations[0].schoolIds).size, 4, '市级组织学校去重');
const scope = collectIndicatorScope(seed, ['1053']);
assert.deepEqual(scope.schools.map(item => item.id).sort(), ['1050', '1051', '1052', '1053'], '从高新区学校传递找到市级与集团的完整影响范围');
assert.equal(scope.organizations.length, 3);
const conflicts = getIndicatorConflicts(seed, draft.schoolIds, draft.indicatorId);
assert.equal(conflicts.changedSchools.length, 4);
assert.equal(conflicts.changedOrganizations.length, 3);
assert.throws(() => saveOrganization(seed, draft, { activate: true }, now), /指标冲突/, '存在冲突且未确认时不能开通');
assert.equal(JSON.stringify(seed), original, '冲突拦截不修改原数据');

const savedDraft = saveOrganization(seed, draft, { activate: false }, now);
assert.equal(savedDraft.organizations[0].status, '待开通');
assert.equal(savedDraft.organizations[0].createdAt, '2026-11-19', '使用中国时区日期');
assert.deepEqual(savedDraft.schools, seed.schools, '保存草稿不改变学校指标');
assert.deepEqual(getSchoolOrganizations(savedDraft, '1053'), getSchoolOrganizations(seed, '1053'), '保存草稿不授予学校数据范围');
assert.equal(savedDraft.organizations[0].schoolIds.length, 2, '关联学校去重');
assert.equal(getOrganizationAuthorizationStatus(savedDraft.organizations[0], now), '待开通', '草稿日期不等同于已生效的组织授权');
assert.deepEqual(getOrganizationStatistics(savedDraft, savedDraft.organizations[0]), { schoolCount: 2, teacherCount: null, classCount: null, studentCount: null }, '草稿不展示已生效的师生规模');

const active = saveOrganization(savedDraft, draft, { activate: true, confirmUnify: true, editingId: savedDraft.organizations[0].id }, now);
assert.equal(active.organizations.length, savedDraft.organizations.length, '草稿续办沿用原组织编码，不重复新建');
assert.equal(active.organizations[0].status, '已开通');
assert.equal(getOrganizationAuthorizationStatus(active.organizations[0], now), '未开始');
assert.deepEqual(active.schools.map(school => [school.authorizationStartsAt, school.authorizationEndsAt]), seed.schools.map(school => [school.authorizationStartsAt, school.authorizationEndsAt]), '组织独立授权不改写任何学校授权');
for (const org of active.organizations.filter(item => item.status === '已开通')) {
  for (const schoolId of org.schoolIds) assert.equal(active.schools.find(item => item.id === schoolId).indicatorId, org.indicatorId, '共校组织和学校始终使用统一指标');
}
assert.equal(active.schools.find(item => item.id === '1048').indicatorId, 'primary-v1', '范围外学校指标不变');
assert.equal(JSON.stringify(seed), original, '成功更新也不侵入或改写输入数据');
assert.equal(getSchoolOrganizations(active, '1053').length, 3, '新关联追加，保留市级与区级旧关系');
assert.throws(() => saveOrganization(active, draft, { activate: false, editingId: active.organizations[0].id }, now), /已开通组织/, '禁止通过草稿意外停用组织');
assert.throws(() => saveOrganization(seed, { ...draft, schoolIds: ['1047'] }, { activate: true, confirmUnify: true }, now), /学校不可用/, '停用学校不可关联开通');
assert.throws(() => saveOrganization(seed, { ...draft, phone: '123' }, { activate: true }, now), /手机号/);
assert.throws(() => saveOrganization(seed, { ...draft, name: ' 成都市高新区 ' }, { activate: false }, now), /名称已存在/);
const matching = saveOrganization(seed, { ...draft, indicatorId: 'primary-v1', schoolIds: ['1053'] }, { activate: true }, now);
assert.equal(matching.organizations[0].status, '已开通', '无冲突时可直接建立关联');
console.log('✅ 运营组织模型验证通过：独立授权、日期边界、规模去重汇总、草稿隔离、多组织关联与指标一致性');
