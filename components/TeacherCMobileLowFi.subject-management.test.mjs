import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');

function requireText(text, message) {
  if (!source.includes(text)) {
    throw new Error(message);
  }
}

function forbidTextInSubjectBlock(text, message) {
  const start = source.indexOf("if (page === 'subjectManagement')");
  const end = source.indexOf("if (page === 'departmentManagement')");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('未找到科目管理页面独立分支。');
  }
  const block = source.slice(start, end);
  if (block.includes(text)) {
    throw new Error(message);
  }
}

function getBlock(startText, endText, missingMessage) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start + startText.length);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(missingMessage);
  }
  return source.slice(start, end);
}

requireText('type SchoolSubjectItem = {', '科目管理应使用独立轻量数据结构。');
requireText('const [subjectItems, setSubjectItems] = useState<SchoolSubjectItem[]>(schoolSubjectItems);', '科目列表应由页面状态承载，支持新增、排序、删除。');
requireText('const [deletingSubjectItem, setDeletingSubjectItem] = useState<SchoolSubjectItem | null>(null);', '科目删除应先进入待确认状态。');
requireText('const openSubjectEditSheet = (item?: SchoolSubjectItem)', '科目管理应使用专用编辑弹窗，不复用含启停能力的基础信息弹窗。');
requireText('const moveSubjectItem = (dragId: string, targetId: string)', '科目管理应支持拖动排序。');
requireText('draggable', '科目行应可拖动排序。');
requireText('<GripVertical size={18} />', '科目行应展示拖动手柄。');
requireText('修改科目名称', '科目编辑弹窗应聚焦修改名称。');
requireText('renderSubjectDeleteConfirmSheet()', '科目管理应挂载删除二次确认弹窗。');
requireText('确认删除', '删除科目应二次确认。');
requireText('setDeletingSubjectItem(item)', '点击删除 icon 应先打开二次确认。');
requireText('新增科目', '科目管理应支持新增科目。');
requireText('className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-600 active:bg-gray-50"', '新增入口应以卡片形式展示在列表末尾。');
requireText("modules: ['科目列表', '新增入口', '拖动排序', '编辑底部弹窗', '删除科目']", '科目管理页面元信息应同步轻量能力边界。');
requireText("{ label: '删除科目', priority: 'P3', position: '列表行删除图标，二次确认后删除' }", '页面元信息应说明删除科目需要二次确认。');

const subjectPageBlock = getBlock("if (page === 'subjectManagement')", "if (page === 'departmentManagement')", '未找到科目管理页面代码块。');
if (subjectPageBlock.includes('<FormSectionTitle title="科目" />')) {
  throw new Error('科目管理页不应展示多余的“科目”标题文案。');
}
if (subjectPageBlock.indexOf('{subjectItems.map((item) => (') > subjectPageBlock.indexOf('onClick={() => openSubjectEditSheet()}')) {
  throw new Error('新增卡片应放在最后一个科目数据后面。');
}

const editSheetBlock = getBlock('const renderSubjectEditSheet = () =>', 'const renderSubjectDeleteConfirmSheet = () =>', '未找到科目编辑弹窗代码块。');
if (editSheetBlock.includes('删除') || editSheetBlock.includes('deleteSubject')) {
  throw new Error('编辑科目弹窗不应包含删除科目操作。');
}

const deleteConfirmBlock = getBlock('const renderSubjectDeleteConfirmSheet = () =>', 'const renderTermEditSheet = () =>', '未找到科目删除确认弹窗代码块。');
if (!deleteConfirmBlock.includes('setSubjectItems((items) => items.filter((item) => item.id !== deletingSubjectItem.id))')) {
  throw new Error('删除确认弹窗应在确认后执行删除。');
}

forbidTextInSubjectBlock('activeItems.length', '科目管理不应统计展示有多少项。');
forbidTextInSubjectBlock('BasicInfoStatusBadge', '科目管理不应展示启用/停用状态标签。');
forbidTextInSubjectBlock('item.desc', '科目管理不应在列表展示说明文案。');
forbidTextInSubjectBlock('openBasicInfoEditSheet', '科目管理不应复用含启停的基础信息编辑弹窗。');
forbidTextInSubjectBlock('启用', '科目管理页面不应出现启用操作。');
forbidTextInSubjectBlock('停用', '科目管理页面不应出现停用操作。');

console.log('TeacherCMobileLowFi 科目管理轻量化测试通过');
