import assert from 'node:assert/strict';
import {
  HOMEWORK_TEMPLATE_CAPACITY,
  getHomeworkTemplateLayout,
  getHomeworkTemplatePageSpec,
} from '../domain/homework.ts';
import fs from 'node:fs';

const exportSource = fs.readFileSync(new URL('./homeworkTemplateExport.ts', import.meta.url), 'utf8');

assert.deepEqual(HOMEWORK_TEMPLATE_CAPACITY, { A4: 72, A3: 100 });

const a4Layout = getHomeworkTemplateLayout('A4');
assert.equal(a4Layout.page.pageSize, 'A4');
assert.equal(a4Layout.leftSequences.length, 36);
assert.equal(a4Layout.rightSequences.length, 36);
assert.deepEqual(
  [a4Layout.leftSequences[0], a4Layout.leftSequences.at(-1), a4Layout.rightSequences[0], a4Layout.rightSequences.at(-1)],
  ['01', '36', '37', '72'],
  'A4通用模板应固定印刷01至72，并在左右区连续排列。',
);

const a3Layout = getHomeworkTemplateLayout('A3');
assert.equal(a3Layout.page.pageSize, 'A3');
assert.equal(a3Layout.page.width, 4961);
assert.equal(a3Layout.page.height, 3508);
assert.equal(a3Layout.leftSequences.length, 50);
assert.equal(a3Layout.rightSequences.length, 50);
assert.deepEqual(
  [a3Layout.leftSequences[0], a3Layout.leftSequences.at(-1), a3Layout.rightSequences[0], a3Layout.rightSequences.at(-1)],
  ['001', '050', '051', '100'],
  'A3通用模板应固定印刷001至100，并在左右区连续排列。',
);
assert.equal(getHomeworkTemplatePageSpec('A4').pageSize, 'A4');
assert.equal(getHomeworkTemplatePageSpec('A3').pageSize, 'A3');
assert.match(exportSource, /drawCell\(context, x, y, sequenceWidth, TABLE_HEADER_HEIGHT, '学号'/, '模板学生标识列应统一显示为学号。');
assert.match(exportSource, /TABLE_SEQUENCE_WIDTH_RATIO = 0\.07/, '学号列应仅保留必要宽度，把更多空间分配给等级标记格。');
assert.doesNotMatch(exportSource, /任课教师/, '通用模板不应展示任课教师。');
assert.match(exportSource, /HOMEWORK_STATUS_LABELS = \['优', '良', '合格', '待合格', '未交'\]/, '每次作业必须提供五个固定等级标记格。');
assert.match(exportSource, /`作业\$\{assignmentIndex \+ 1\}`/, '表格一级表头应明确显示作业1至作业6。');
assert.match(exportSource, /drawVerticalCellText/, '较长等级名称应使用竖排表头，为学生标记格保留宽度。');
assert.match(exportSource, /打勾、划线或涂抹/, '模板底部应说明光学标记填写方式。');
assert.doesNotMatch(exportSource, /等级码：A = 优/, '模板不应继续要求老师手写ABCDX。');
assert.match(exportSource, /getHomeworkTemplatePreviewDataUrl/, '应从实际模板画布生成预览图。');
assert.match(exportSource, /renderWidth: 960/, '预览图应使用轻量画布，避免加载两张完整打印图。');
assert.match(exportSource, /const scale = canvas\.width \/ LOGICAL_PAGE_WIDTH/, '缩略图应按实际画布宽度完整缩放模板，不能裁掉页面右侧。');

console.log('Homework template layout assertions passed');
