import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const searchInput = read('./MobileSearchInput.tsx');
const classDetail = read('../../views/ClassDetailView.tsx');
const bankPassword = read('../../views/bank-password/BankPasswordView.tsx');
const questionnaire = read('../../views/questionnaire/QuestionnaireManagementView.tsx');
const guidelines = read('../../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md');

assert.doesNotMatch(searchInput, /focus:border-|focus:ring-/, '公共搜索框聚焦时不得改变边框颜色或增加外环。');
assert.match(searchInput, /type="search"/, '公共搜索框应使用搜索输入语义。');
assert.match(searchInput, /density === 'compact'/, '公共搜索框应支持学生花名册的紧凑密度。');
assert.match(searchInput, /appearance === 'filled'/, '公共搜索框应支持无边框浅底填充样式。');
assert.match(searchInput, /fillTone === 'surface'/, '公共搜索框的填充样式应支持白色与浅灰底。');
assert.match(searchInput, /border-0 shadow-none/, '填充样式不得显示边框或阴影。');

assert.match(classDetail, /<MobileSearchInput/, '学生列表应复用公共搜索框。');
assert.match(bankPassword, /<MobileSearchInput/, '兑换密码页应复用公共搜索框。');
assert.equal((questionnaire.match(/<MobileSearchInput/g) ?? []).length, 2, '采集记录和回答明细应复用公共搜索框。');
assert.match(
  guidelines,
  /获得焦点后继续保持相同极浅暖灰边框与白色表面，不改变边框颜色、不增加外环/,
  '教师手机端规范应明确搜索框沿用中性输入聚焦规则。',
);

console.log('MobileSearchInput neutral focus assertions passed');
