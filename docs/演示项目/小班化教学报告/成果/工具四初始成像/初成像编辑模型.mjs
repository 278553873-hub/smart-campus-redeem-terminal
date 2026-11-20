// 独立报告的数据与编辑规则；与教师业务应用、A4 生成器隔离。
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const readField = (report, path) => path.reduce((value, key) => value?.[key], report) ?? '';
export function writeField(report, path, value) {
  if (!editableFields(report).some((field) => field.path.join('.') === path.join('.'))) throw new Error('固定字段不允许编辑');
  const next = clone(report);
  let cursor = next;
  for (const key of path.slice(0, -1)) cursor = cursor[key];
  cursor[path.at(-1)] = value;
  return next;
}

export const scriptJSON = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function stringShape(value, template) {
  if (typeof template === 'string') return typeof value === 'string';
  if (Array.isArray(template)) return Array.isArray(value) && value.length === template.length && template.every((item, i) => stringShape(value[i], item));
  if (template && typeof template === 'object') return value && typeof value === 'object' && Object.keys(template).every((key) => stringShape(value[key], template[key]));
  return value === template;
}

export function restoreSaved(initial, raw) {
  try {
    const saved = JSON.parse(raw);
    if (saved.revision !== initial.revision || !Number.isFinite(saved.savedAt) || saved.savedAt < initial.updatedAt) return initial;
    if (!stringShape(saved.report, initial)) return initial;
    return applyEditableChanges(initial, saved.report);
  } catch { return initial; }
}

export function editorGroups(report, section) {
  const [sectionId, itemId] = section.split(':');
  const f = (label, path, type = 'textarea') => ({ label, path, type });
  const group = (title, fields) => ({ title, fields });
  const sourceKeys = ['parent', 'child', 'teacher'];
  const item = (groups) => itemId === undefined ? groups : groups.filter((_, i) => i === Number(itemId));
  if (sectionId === 'cover') return [group('学生信息', [
    f('学生姓名', ['meta', 'name'], 'text'), f('成像日期', ['data', 'date'], 'date'),
  ])];
  if (sectionId === 'observations') return item(report.data.matrix.map((row, i) => group(row.dim, [
    ...sourceKeys.map((key) => f(report.labels.sources[key], ['data', 'matrix', i, key])),
    f('初步判断', ['data', 'matrix', i, 'insight']),
  ])));
  if (sectionId === 'card') return sourceKeys.filter((key) => itemId === undefined || itemId === key).map((key) => group(report.labels.quotes[key], [
    ...report.data.quotes[key].flatMap((item, i) => typeof item === 'string'
      ? [f(`原话 ${i + 1}`, ['data', 'quotes', key, i])]
      : [f(`场景 ${i + 1}`, ['data', 'quotes', key, i, 'context'], 'text'), f(`观察原话 ${i + 1}`, ['data', 'quotes', key, i, 'quote'])]),
  ]));
  if (sectionId === 'five' || sectionId === 'three') return item(report.data[sectionId].map(([label], i) => group(label, [
    f('观察与分析', ['data', sectionId, i, 1]),
  ])));
  if (sectionId === 'light') return [
    ...['want', 'strong', 'parent', 'teacher'].filter((key) => itemId === undefined || itemId === key).map((key) => group(report.labels.light[key], [f('方向与补充', ['data', 'light', key])])),
    ...(itemId === undefined || itemId === 'synthesis' ? [group('交汇建议', [f('交汇建议', ['data', 'light', 'synthesis'])])] : []),
  ];
  if (sectionId === 'watch') return item(report.data.watch.map((item, i) => group(item.title, [
    f('观察主题', ['data', 'watch', i, 'title'], 'text'), f('观察内容', ['data', 'watch', i, 'text']),
  ])));
  if (sectionId === 'message') return [group('三个特质', report.data.message.traits.map((_, i) => f(`特质 ${i + 1}`, ['data', 'message', 'traits', i], 'text'))),
    group('理解与陪伴', [f('最需要被理解的是', ['data', 'message', 'need']), f('想先从哪里开始留意', ['data', 'message', 'begin'])])];
  return [];
}

export function editableFields(report) {
  return ['cover', 'observations', 'card', 'five', 'three', 'light', 'watch', 'message'].flatMap((section) => editorGroups(report, section).flatMap((group) => group.fields));
}

// 保存及恢复时重新投影允许修改的值，旧缓存或额外字段无法改写模板。
export function applyEditableChanges(initial, edited) {
  const result = clone(initial);
  for (const field of editableFields(initial)) {
    let cursor = result;
    for (const key of field.path.slice(0, -1)) cursor = cursor[key];
    const value = readField(edited, field.path);
    if (typeof value === 'string') cursor[field.path.at(-1)] = value;
  }
  return result;
}

export function dateInput(value) {
  const match = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(value);
  return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : value;
}
export function dateDisplay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[1]}年${Number(match[2])}月${Number(match[3])}日` : value;
}
