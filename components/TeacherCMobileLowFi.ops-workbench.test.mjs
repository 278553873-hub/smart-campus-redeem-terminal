import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(path.resolve('components/TeacherCMobileLowFi.tsx'), 'utf8');

const failures = [];

function requireText(text, message) {
  if (!source.includes(text)) failures.push(message);
}

function forbidText(text, message) {
  if (source.includes(text)) failures.push(message);
}

requireText("{ key: 'ops', label: '运营端' }", 'C端改造顶部导航应包含运营端。');
requireText("const [opsPage, setOpsPage] = useState<'home' | 'personalUsers' | 'suggestionFeedback'>('home');", '运营端应有首页、个人用户管理和建议反馈内部页状态。');
requireText("C端改造 · 运营端", '运营端原型标题应明确位于 C端改造。');
requireText('>退出登录</button>', '运营端顶部按钮应显示退出登录。');
requireText('max-w-[950px]', '运营端原型宽度应扩展到 950px，减少列表左右滑动。');
requireText("const [prototypeWidths, setPrototypeWidths] = useState<Record<CEndSurface, number>>({", 'C端改造各顶部 tab 应独立保存拖动宽度。');
requireText("schoolAdmin: 60,", '学校后台端应有独立 60% 默认宽度。');
requireText("ops: 60,", '运营端应有独立 60% 默认宽度。');
requireText("const prototypeWidth = prototypeWidths[surface];", '当前原型宽度应来自当前 tab 的独立状态。');
requireText("setPrototypeWidths((widths) => ({", '拖动滑块时应只更新当前 tab 的宽度。');
requireText("const getPrototypeWidthMax = (currentSurface: CEndSurface) => (currentSurface === 'ops' || currentSurface === 'schoolAdmin' ? 82 : 52);", '运营端和学校后台端应使用更高拖动上限。');
requireText("[surface]: Math.min(getPrototypeWidthMax(surface), Math.max(24, drag.startWidth + deltaPercent)),", '当前 tab 拖动宽度应按自身上限更新。');
requireText("style={{ '--prototype-width': `${prototypeWidth}%` } as React.CSSProperties}", '拖动滑块后应直接使用当前原型宽度。');
requireText("currentSurface === 'ops' || currentSurface === 'schoolAdmin' ? 82 : 52", '运营端和学校后台端拖拽展示区上限应高于手机端原型。');
requireText("{ key: 'home' as const, label: '首页' }", '运营端内部菜单应包含首页。');
requireText("{ key: 'personalUsers' as const, label: '个人用户管理' }", '运营端内部菜单应包含个人用户管理。');
requireText("{ key: 'suggestionFeedback' as const, label: '建议反馈' }", '运营端内部菜单应包含建议反馈。');
requireText('<div className="text-sm font-black">学校总数</div>', '运营首页应展示学校总数。');
requireText("{ label: '未开始', value: 8 }", '运营首页应展示未开始学校数。');
requireText("{ label: '合作中', value: 46 }", '运营首页应展示合作中学校数。');
requireText("{ label: '已到期', value: 6 }", '运营首页应展示已到期学校数。');
requireText('<div className="text-sm font-black">个人用户</div>', '运营首页应展示个人用户总数。');
requireText("{ label: '已转化', value: 328 }", '运营首页应展示已转化个人用户数。');
requireText("{ label: '待转化', value: 514 }", '运营首页应展示待转化个人用户数。');
requireText('发起了2025-2026学年下学期的期末报告生成', '运营首页待办应展示期末报告生成内容。');
requireText("{handled ? '已处理' : '标记处理'}", '运营首页待办应支持标记已处理。');
requireText("{ phone: '138****2468', name: '李明老师', classCount: 3, studentCount: 128, recordCount: 42, schoolVersion: '否' }", '个人用户管理应展示手机号、姓名、班级数、学生数、记录条数、是否转学校版。');
requireText('手机号</div>', '个人用户管理表格应包含手机号列。');
requireText('姓名</div>', '个人用户管理表格应包含姓名列。');
requireText('拥有班级数</div>', '个人用户管理表格应包含拥有班级数列。');
requireText('拥有学生数</div>', '个人用户管理表格应包含拥有学生数列。');
requireText('记录条数</div>', '个人用户管理表格应包含记录条数列。');
requireText('是否转学校版</div>', '个人用户管理表格应包含是否转学校版列。');
requireText('登录学校后台', '个人用户管理行内操作应包含登录学校后台。');
requireText('个性化配置', '个人用户管理行内操作应包含个性化配置。');
requireText('提示词管理', '个人用户管理行内操作应包含提示词管理。');
requireText('手动触发', '个人用户管理行内操作应包含手动触发。');
requireText('删除</button>', '个人用户管理行内操作应包含删除。');
requireText('overflow-hidden rounded-2xl border border-gray-200', '个人用户管理表格应优先在扩展容器内完整展示。');
requireText("opsPage === 'suggestionFeedback'", '运营端应渲染建议反馈模块。');
requireText('搜索老师 / 内容', '建议反馈模块应支持按老师或内容搜索。');
requireText('teacherSuggestionFeedbackRows.map((row)', '建议反馈模块应展示教师端提交的反馈列表。');
requireText('老师姓名</div>', '建议反馈模块表格应展示老师姓名。');
requireText('手机号</div>', '建议反馈模块表格应展示手机号。');
requireText('操作</div>', '建议反馈模块表格应展示操作列。');
requireText("{row.status === '待处理' ? '标记为已处理' : '标记为待处理'}", '建议反馈模块应支持标记为已处理和标记为待处理。');

forbidText("title=\"运营端-PC工作台\"", '不应把学校 PC 端环境切换改名为运营端。');
forbidText('>导出</button>', '运营端顶部按钮不应再显示导出。');
forbidText('const effectivePrototypeWidth =', '运营端不应通过有效宽度锁定拖动结果。');
forbidText('const [prototypeWidth, setPrototypeWidth] = useState(34);', 'C端改造不应让所有 tab 共用同一个拖动宽度。');
forbidText("setPrototypeWidth((width) => (tab.key === 'ops' && width < 78 ? 78 : width));", '切换 tab 不应改写其他 tab 的拖动宽度。');
forbidText("['全部 842', '已转化 328', '待转化 514']", '个人用户管理页不应展示顶部统计卡片。');
forbidText('min-w-[960px]', '个人用户管理表格不应再依赖 960px 最小宽度造成左右滑动。');

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('TeacherCMobileLowFi 运营端工作台测试通过');
