import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const permissionMatrixSource = fs.readFileSync(new URL('./TeacherPermissionMatrix.tsx', import.meta.url), 'utf8');
const failures = [];

const requireSource = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

const requirePermissionSource = (text, message) => {
  if (!permissionMatrixSource.includes(text)) failures.push(message);
};

requireSource("{ key: 'versionCompare', label: '版本对比' }", 'C端改造顶部导航应包含版本对比。');
requireSource("{ key: 'permissionCompare', label: '权限对比' }", 'C端改造顶部导航应在版本对比后增加权限对比。');
requireSource("const versionCompareRows: Array<{ type: string; items: string[]; personal: string; school: string }> = [", '版本对比应使用按类型合并后的双版本数据结构。');
requireSource("版本能力对比", '版本对比原型标题应改为能力对比。');

const surfaceTabsStart = source.indexOf('const surfaceTabs');
const surfaceTabsEnd = source.indexOf('];', surfaceTabsStart);
const surfaceTabsBlock = source.slice(surfaceTabsStart, surfaceTabsEnd);
const surfaceTabKeys = [...surfaceTabsBlock.matchAll(/\{ key: '([^']+)', label: '([^']+)' \}/g)].map((match) => match[1]);
if (surfaceTabsBlock.includes("label: '改造点整理'") || surfaceTabKeys.includes('summary')) {
  failures.push('C端改造右侧导航不应展示“改造点整理”。');
}
if (surfaceTabKeys.at(-1) !== 'permissionCompare' || surfaceTabKeys.at(-2) !== 'versionCompare') {
  failures.push('C端改造右侧导航中“权限对比”应紧跟在“版本对比”后。');
}

requireSource("import TeacherPermissionMatrix from './TeacherPermissionMatrix';", '权限对比应使用独立业务组件。');
requireSource('const renderPermissionComparePrototype = () => <TeacherPermissionMatrix />;', '权限对比应直接渲染权限矩阵组件。');
if (source.includes('permissionMatrixHtml') || source.includes('srcDoc=') || source.includes('?raw')) {
  failures.push('权限对比不应继续依赖独立 HTML 或 iframe 内嵌实现。');
}
requireSource('permissionCompare: 72', '权限矩阵默认应获得更宽的原型展示区。');
requireSource('const surfaceTabsRef = useRef<HTMLDivElement>(null);', '顶部导航变窄后应保留滚动容器引用。');
requireSource('?.scrollIntoView({ block: \'nearest\', inline: \'nearest\' });', '切换页面后应把当前顶部导航项滚入可视区。');

[
  '班级来源与归属',
  '日常操作',
  '学生与班级管理',
  '老师与家长协同',
  '班主任专属管理',
  '创建班级',
  "conditional('仅本人来源')",
  '编辑班级基本信息',
  '离校学生管理',
  '邀请老师',
  '邀请家长',
  '设置或取消副班主任',
].forEach((text) => {
  requirePermissionSource(text, `权限矩阵组件应完整展示权限口径：${text}`);
});
requirePermissionSource("const [versionFilter, setVersionFilter] = useState<VersionFilter>('all');", '权限矩阵应支持按版本筛选。');
requirePermissionSource('const [differencesOnly, setDifferencesOnly] = useState(false);', '权限矩阵应支持仅看差异。');

const capabilityCount = (permissionMatrixSource.match(/capability: '/g) || []).length;
if (capabilityCount !== 24) {
  failures.push(`权限矩阵应包含 24 项权限，当前为 ${capabilityCount} 项。`);
}

[
  "type: '基础功能', items: ['学生管理', '班级管理'], personal: '✓', school: '✓'",
  "type: 'AI解析', items: ['语音识别', '奖状识别', '学生识别', '指标识别'], personal: '✓', school: '✓'",
  "type: 'AI报告', items: ['期末综合报告'], personal: '✓', school: '✓'",
  "type: '详细报告', items: ['月度成长报告', '各学科明细报告'], personal: '×', school: '✓'",
  "type: '校级报告', items: ['校级分析报告'], personal: '×', school: '✓'",
  "items: ['货柜机'], personal: '×', school: '✓'",
  "items: ['自定义指标'], personal: '×', school: '✓'",
].forEach((text) => {
  requireSource(text, `版本对比能力口径应明确展示：${text}`);
});

const rowsStart = source.indexOf('const versionCompareRows');
const rowsEnd = source.indexOf('];', rowsStart);
const rowsBlock = source.slice(rowsStart, rowsEnd);
const rowCount = (rowsBlock.match(/\{ type:/g) || []).length;
if (rowCount > 8) {
  failures.push(`版本对比条目应按类型合并，当前 ${rowCount} 条仍然过多。`);
}

if (rowsBlock.includes("feature: '微信登录'") || rowsBlock.includes("feature: '创建班级'")) {
  failures.push('版本对比不应再逐条罗列基础功能，应按能力类型合并。');
}
if (rowsBlock.includes('AI记录')) {
  failures.push('基础功能不应展示 AI记录。');
}
if (rowsBlock.includes("type: '基础使用'") || rowsBlock.includes("'登录', '班级', '学生'")) {
  failures.push('基础使用应改为基础功能，并只展示学生管理、班级管理。');
}
if (rowsBlock.includes("type: '评价范围'") || rowsBlock.includes('评价班级')) {
  failures.push('版本对比应取消评价范围条目。');
}
if (rowsBlock.includes("type: '后台运营'") || rowsBlock.includes('批量导入') || rowsBlock.includes('转学校版')) {
  failures.push('版本对比应取消后台运营板块。');
}
if (source.includes('区域版') || rowsBlock.includes('regional')) {
  failures.push('版本对比不应再展示区域版。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi version compare assertions passed');
