import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

const forbidText = (text, message) => {
  if (source.includes(text)) failures.push(message);
};

requireText('const buildClassName = (entryYearValue: string | number, classNumberValue: string | number) => `${entryYearValue}级${classNumberValue}班`;', '班级名称应统一由入学年份和班号生成。');
requireText('const getClassNumberFromName = (name: string) => name.match(/级(\\d+)班/)?.[1] ?? \'1\';', '编辑班级时应从现有班级名称中提取班号。');
requireText('const [draftClassNumber, setDraftClassNumber] = useState(\'1\');', '编辑班级弹窗应只维护班号草稿。');
requireText('aria-label="班号数字"', '编辑班级弹窗应只允许输入班号数字。');
requireText('aria-label="班级数字"', '创建班级页应只允许输入班级数字。');
requireText('编辑弹窗字段顺序为：学段、入学年份、班号；班级名称按“入学年份级 + 班号 + 班”自动生成。', 'PRD 说明应明确编辑班级不能自定义整段名称。');
requireText("modules: ['学段选择', '入学年份选择', '班级数字输入']", '创建班级页元信息不应再包含自定义名称入口或重复预览。');

forbidText('isCustomClassName', '创建班级页不应保留自定义名称状态。');
forbidText('customClassName', '创建班级页不应保留自定义名称输入值。');
forbidText('aria-label="自定义班级名称"', '创建班级页不应展示自定义班级名称输入框。');
forbidText('自定义名称', '创建班级页不应展示自定义名称入口。');
forbidText('placeholder="输入班级名称"', '编辑班级弹窗不应允许输入整段班级名称。');
forbidText('aria-label="班级名称"', '编辑班级弹窗不应允许输入整段班级名称。');
forbidText('draftClassName', '编辑班级弹窗不应维护整段班级名称草稿。');
forbidText('班级名称预览', '创建班级页不应保留重复的班级名称预览模块。');
forbidText('draftClassDisplayName', '编辑班级弹窗不应保留重复的班级名称预览。');

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi class name rule assertions passed');
