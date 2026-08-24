import fs from 'node:fs';

const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const sourceTriggerSource = fs.readFileSync(new URL('../components/ClassSourceTrigger.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

const sheetStart = meSource.indexOf('export const ClassSourceSheet');
const sheetEnd = meSource.indexOf('const MeView', sheetStart);
if (sheetStart < 0 || sheetEnd < 0) throw new Error('应将班级来源抽屉抽为独立组件，供 App 全局浮层渲染。');
const sheetSource = meSource.slice(sheetStart, sheetEnd);

requireText(sheetSource, '切换班级来源', '底部抽屉标题应为切换班级来源，而不是切换学校。');
requireText(sheetSource, 'title="切换班级来源"', '全局底部弹窗应通过标题提供切换班级来源的对话框语义。');
requireText(meSource, "if (space.type === 'personal') return '个人';", '个人来源应展示个人标签。');
requireText(meSource, "if (space.type === 'collaboration') return '协作';", '协作来源应展示协作标签。');
requireText(meSource, "return '学校';", '学校来源应展示学校标签。');
requireText(meSource, '<ClassSourceTrigger', '我的页应复用全局班级来源触发器。');
requireText(meSource, 'density="compact"', '我的页应使用班级来源触发器的紧凑可见样式。');
requireText(meSource, "import MobileBottomSheet from '../components/ui/MobileBottomSheet';", '班级来源抽屉应复用全局底部弹窗组件。');
requireText(sourceTriggerSource, 'personal: UserRound', '个人来源触发器应使用单人图标。');
requireText(sourceTriggerSource, 'collaboration: UsersRound', '协作来源触发器应使用多人图标。');
requireText(sourceTriggerSource, 'school: Building2', '学校来源触发器应使用学校图标。');
requireText(sourceTriggerSource, "density?: 'default' | 'compact';", '班级来源触发器应通过公共参数支持紧凑密度。');
requireText(sourceTriggerSource, 'inline-flex h-9 max-w-full items-center', '紧凑来源触发器的可见胶囊应为 36px。');
requireText(sourceTriggerSource, 'inline-flex min-h-11 max-w-full items-center', '来源触发器应继续保留 44px 触控高度。');
requireText(sheetSource, '<MobileBottomSheet open title="切换班级来源" onClose={onClose}>', '班级来源抽屉应使用全局底部弹窗的白色承载面与层级。');
requireText(sheetSource, 'text-[17px] font-semibold leading-[22px]', '抽屉标题和列表主文案应使用接近 iOS 17pt 的字号。');
requireText(sheetSource, 'min-h-[60px]', '来源卡片高度应按标注收紧为 60px。');
requireText(sheetSource, 'rounded-[var(--tm-radius-inner)]', '来源卡片应使用统一内层圆角令牌。');
requireText(sheetSource, 'bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card-on-white)]', '未选中来源应使用白色表面和白底专用阴影。');
requireText(sheetSource, 'bg-[var(--tm-brand-primary-soft)]', '当前来源卡片应使用浅红选中底。');
requireText(sheetSource, 'ring-[1.5px] ring-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-card)]', '当前来源卡片应使用品牌红描边与统一卡片阴影。');
requireText(sheetSource, 'bg-[var(--tm-brand-primary)] px-3 py-1 text-[13px] font-semibold leading-[18px] text-[var(--tm-text-inverse)]', '当前来源胶囊应使用品牌红和统一反色文字。');
requireText(sheetSource, 'transition-transform [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96]', '抽屉内按钮应使用快速动效令牌和 0.96 按压反馈。');
forbidText(sheetSource, 'aria-label="切换学校"', '不应继续使用切换学校语义。');
forbidText(sheetSource, '<div className="text-[16px] font-bold text-slate-900">切换学校</div>', '不应继续展示切换学校标题。');
forbidText(sheetSource, "bg-cyan-50/70", '班级来源当前态不应使用浅青底加圆点。');
forbidText(sheetSource, 'text-[20px]', '抽屉标题不应使用偏 Android/演示稿的大字号。');
forbidText(sheetSource, 'font-extrabold', '抽屉文字不应使用过重字重，应符合 iOS 克制风格。');
forbidText(sheetSource, 'transition ', '抽屉内不应使用 Tailwind transition shorthand。');
forbidText(sheetSource, '完成', '班级来源抽屉不应展示完成按钮。');
forbidText(sheetSource, 'min-h-[76px]', '来源卡片不应继续使用 76px 高度。');
forbidText(sheetSource, 'min-h-11 min-w-11', '移除完成按钮后不应保留完成按钮触控区。');
forbidText(sheetSource, 'bg-black/32', '遮罩不应使用黑色低保真风格。');
forbidText(sheetSource, 'bg-[var(--tm-bg-page-glass)]', '班级来源抽屉不应继续使用发灰的页面玻璃底。');
forbidText(sheetSource, 'backdrop-blur', '班级来源抽屉不应局部叠加背景模糊。');
forbidText(sheetSource, 'bg-slate-950 px-3 py-1', '当前标签不应使用黑白低保真配色。');
forbidText(sheetSource, 'rgba(15,23,42,0.92)', '当前描边不应使用近黑色。');
forbidText(sheetSource, '#1E9AAA', '班级来源抽屉不应残留旧青蓝主色。');

requireText(appSource, "{ id: 'personal', title: '我创建的班级', type: 'personal', role: 'owner' }", '我创建的班级应使用个人版创建者身份。');
requireText(appSource, "{ id: 'collab-li', title: '李明老师的班级', type: 'collaboration', role: 'collaborator' }", '被邀请班级应使用协作老师身份。');
requireText(appSource, "{ id: 'school-qizhong', title: '成都七中初中附属小学', type: 'school', role: 'homeroomTeacher',", '学校来源示例应覆盖班主任身份。');
requireText(appSource, "{ id: 'school-star', title: '星河实验小学', type: 'school', role: 'leader',", '学校来源示例应覆盖管理层身份。');
requireText(appSource, "{ id: 'school-qinghe', title: '青禾实验小学', type: 'school', role: 'homeroomTeacher',", '其他学校来源示例应保留班主任身份。');
requireText(appSource, "const DEFAULT_TEACHER_SPACE_ID = 'school-star';", '默认班级来源应与 demo 当前态保持一致。');
requireText(appSource, "import MeView, { ClassSourceSheet, type TeacherSpaceOption } from './views/MeView';", 'App 应导入全局班级来源抽屉组件。');
requireText(appSource, 'const INITIAL_TEACHER_PROFILES_BY_SPACE: Record<string, TeacherProfile>', '教师资料应按班级来源分别保存。');
requireText(appSource, "name: '刘飞'", '学校版教师资料应使用刘飞姓名。');
requireText(appSource, "name: '大飞'", '个人版教师资料应使用大飞姓名。');
requireText(appSource, 'avatar: ASSETS.AVATAR.TEACHER_DEFAULT', '不同班级来源的教师资料应统一继承小鹿默认头像。');
requireText(appSource, 'const teacherProfile = teacherProfilesBySpace[activeTeacherSpace.id]', '切换来源后应读取对应教师资料。');
requireText(appSource, '[activeTeacherSpace.id]: nextProfile', '编辑教师资料时只应更新当前来源。');
requireText(appSource, "'school-qinghe': {", '普通任课老师学校应有独立教师资料。');
requireText(appSource, "teachingAssignments: createTeachingAssignments(['c_2025_3', 'c_2025_6'], '体育')", '普通任课老师资料应包含任教班级和科目。');
requireText(appSource, "{currentView === 'me' && showTeacherSpaceSheet && (", '班级来源抽屉应只由“我的”页全局层级挂载。');
requireText(appSource, '<ClassSourceSheet', 'App 应渲染班级来源抽屉。');

const navIndex = appSource.indexOf('Teacher mobile bottom navigation');
const sheetIndex = appSource.indexOf('<ClassSourceSheet');
if (navIndex < 0 || sheetIndex < 0 || sheetIndex < navIndex) {
  throw new Error('班级来源抽屉应渲染在底部导航之后，确保层级位于底部导航上层。');
}

console.log('MeView class source sheet assertions passed');
