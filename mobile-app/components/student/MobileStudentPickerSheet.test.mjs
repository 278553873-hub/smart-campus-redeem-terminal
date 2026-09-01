import fs from 'node:fs';
import assert from 'node:assert/strict';

const pickerSource = fs.readFileSync(new URL('./MobileStudentPickerSheet.tsx', import.meta.url), 'utf8');

assert.match(pickerSource, /MobileBottomSheet/, '公共学生选择弹窗应复用教师端底部抽屉外壳。');
assert.match(pickerSource, /MobileSearchInput/, '公共学生选择弹窗应复用公共搜索输入。');
assert.match(pickerSource, /StudentCompactSelectGrid/, '公共学生选择弹窗应复用紧凑学生选择网格。');
assert.match(pickerSource, /MobileEmptyState/, '公共学生选择弹窗应复用统一缺省状态。');
assert.match(pickerSource, /contentTone="plain"/, '公共学生选择弹窗应统一使用浅灰内容区。');
assert.match(pickerSource, /size = 'tall'/, '公共学生选择弹窗应默认使用高底部抽屉。');
assert.match(pickerSource, /auxiliary\?: React\.ReactNode/, '公共学生选择弹窗应允许业务按需传入辅助操作。');
assert.match(pickerSource, /fillTone="soft"/, '公共学生搜索框应使用规范的浅灰填充。');
assert.doesNotMatch(pickerSource, /fillTone="surface"/, '公共学生搜索框不应与白色搜索区同色。');
assert.match(pickerSource, /selectAllAction\?: \{/, '公共学生选择弹窗应统一承接全选操作。');
assert.match(pickerSource, /student-compact-select-last-column/, '全选操作应与学生网格最后一列对齐。');
assert.match(pickerSource, /'\u53d6\u6d88\u5168\u9009' : '\u5168\u9009'/, '全选操作应统一使用“全选 / 取消全选”文案。');
assert.match(pickerSource, /footer: React\.ReactNode/, '公共学生选择弹窗应由业务传入底部动作。');
console.log('MobileStudentPickerSheet assertions passed');
