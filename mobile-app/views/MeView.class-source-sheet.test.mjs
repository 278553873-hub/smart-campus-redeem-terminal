import fs from 'node:fs';

const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

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
requireText(sheetSource, "aria-label=\"切换班级来源\"", '底部抽屉语义应标记为切换班级来源。');
requireText(meSource, "if (space.type === 'personal') return '个人';", '个人来源应展示个人标签。');
requireText(meSource, "if (space.type === 'collaboration') return '协作';", '协作来源应展示协作标签。');
requireText(meSource, "return '学校';", '学校来源应展示学校标签。');
requireText(sheetSource, 'absolute inset-0 z-[70] flex items-end', '班级来源抽屉层级应高于底部导航 z-50。');
requireText(sheetSource, 'text-[17px] font-semibold leading-[22px]', '抽屉标题和列表主文案应使用接近 iOS 17pt 的字号。');
requireText(sheetSource, 'min-h-[60px]', '来源卡片高度应按标注收紧为 60px。');
requireText(sheetSource, 'rounded-[18px]', '60px 高度下卡片圆角应同步收紧，保持比例克制。');
requireText(sheetSource, 'bg-[rgba(72,118,156,0.18)] backdrop-blur-[1px]', '遮罩应使用页面同源的蓝灰轻遮罩，而不是黑色低保真遮罩。');
requireText(sheetSource, 'bg-[rgba(248,252,255,0.96)]', '抽屉面板应使用浅蓝白轻玻璃底。');
requireText(sheetSource, 'bg-cyan-200/70', '底部抽屉拖拽条应使用青蓝体系。');
requireText(sheetSource, 'bg-[rgba(236,253,255,0.92)]', '当前来源卡片应使用浅青选中底。');
requireText(sheetSource, 'shadow-[0_0_0_1.5px_rgba(30,154,170,0.36)', '当前来源卡片描边应使用教师端青蓝主色。');
requireText(sheetSource, 'bg-[#1E9AAA] px-3 py-1 text-[13px] font-semibold leading-[18px] text-white', '当前来源胶囊应使用教师端全局导航青蓝色。');
requireText(sheetSource, 'active:scale-[0.96] transition-transform duration-150 ease-out', '抽屉内按钮按压反馈应使用 0.96 缩放且只过渡 transform。');
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
forbidText(sheetSource, 'bg-slate-950 px-3 py-1', '当前标签不应使用黑白低保真配色。');
forbidText(sheetSource, 'rgba(15,23,42,0.92)', '当前描边不应使用近黑色。');

requireText(appSource, "{ id: 'personal', title: '我创建的班级', type: 'personal' }", '班级来源应包含我创建的班级。');
requireText(appSource, "{ id: 'collab-li', title: '李明老师的班级', type: 'collaboration' }", '班级来源应包含协作老师班级。');
requireText(appSource, "{ id: 'school-qizhong', title: '成都七中初中附属小学', type: 'school' }", '班级来源应包含学校来源。');
requireText(appSource, "{ id: 'school-star', title: '星河实验小学', type: 'school' }", '班级来源应包含星河实验小学。');
requireText(appSource, "const DEFAULT_TEACHER_SPACE_ID = 'school-star';", '默认班级来源应与 demo 当前态保持一致。');
requireText(appSource, "import MeView, { ClassSourceSheet, type TeacherSpaceOption } from './views/MeView';", 'App 应导入全局班级来源抽屉组件。');
requireText(appSource, "{currentView === 'me' && showTeacherSpaceSheet && (", '班级来源抽屉应由 App 在全局层级渲染。');
requireText(appSource, '<ClassSourceSheet', 'App 应渲染班级来源抽屉。');

const navIndex = appSource.indexOf('Teacher mobile bottom navigation');
const sheetIndex = appSource.indexOf('<ClassSourceSheet');
if (navIndex < 0 || sheetIndex < 0 || sheetIndex < navIndex) {
  throw new Error('班级来源抽屉应渲染在底部导航之后，确保层级位于底部导航上层。');
}

console.log('MeView class source sheet assertions passed');
