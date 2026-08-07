import fs from 'node:fs';

const recordSource = fs.readFileSync(new URL('./ClassRecordLogView.tsx', import.meta.url), 'utf8');
const inputSource = fs.readFileSync(new URL('./RecordInputView.tsx', import.meta.url), 'utf8');
const classDetailSource = fs.readFileSync(new URL('./ClassDetailView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const keyboardSource = fs.readFileSync(new URL('../components/VirtualKeyboard.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const spaceAccessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(recordSource, 'canRecordClass?: boolean;', '记录页应接收当前来源的班级记录权限。');
requireText(recordSource, '[padding-right:var(--mini-program-capsule-right-inset,0px)]', '记录页顶部来源行必须消费微信胶囊右侧安全区。');
requireText(recordSource, 'h-[var(--mini-program-title-bar-height,44px)] w-[176px]', '记录对象切换行应与微信标题栏等高。');
requireText(recordSource, 'h-[var(--tm-record-scope-visual-height)]', '记录对象切换胶囊应通过独立变量限制可见高度。');
requireText(recordSource, 'h-[var(--tm-size-touch)] flex-1', '记录对象按钮应在紧凑视觉胶囊内保留 44 像素触控高度。');
requireText(recordSource, '<div className="flex h-[var(--mini-program-title-bar-height,44px)] items-center">', '指标应使用独立标题栏行，双对象时位于切换胶囊下方。');
requireText(tokenSource, "'--tm-record-scope-visual-height': '36px'", '记录对象切换胶囊可见高度应为 36 像素，低于 44 像素微信标题栏。');
requireText(recordSource, '<div className="px-5 pt-0">', '记录页工具行应取消额外顶部留白，与微信胶囊视觉中心对齐。');
forbidText(recordSource, '<div className="px-5 pt-3">', '记录页不应在状态栏安全区后再次增加顶部留白。');
forbidText(recordSource, 'ClassSourceTrigger', '记录页不应再展示或依赖班级来源切换入口。');
forbidText(recordSource, 'classSourceName', '记录页不应再接收班级来源名称。');
forbidText(recordSource, 'onOpenClassSourceSwitcher', '记录页不应再接收打开来源抽屉的动作。');
forbidText(recordSource, 'absolute left-1/2 top-0 flex min-h-11 -translate-x-1/2', '指标入口不应再与来源共用一行并依赖绝对定位。');
forbidText(recordSource, '<div className="flex h-11 items-center justify-center">', '单一记录对象的指标入口不应再使用居中布局。');
requireText(recordSource, '<span>指标</span>', '单一记录对象已隐含学生上下文，指标入口应使用精简文案。');
requireText(recordSource, '{canRecordClass && (', '记录对象切换应只对支持记录班级的来源披露。');
forbidText(recordSource, 'grid-cols-[224px_minmax(0,1fr)]', '移除来源后不应继续使用占满下一行的宽分段控件。');
requireText(recordSource, 'items-center gap-0.5 rounded-[var(--tm-radius-control)]', '指标入口应在独立下一行保持左对齐。');
requireText(recordSource, 'bg-[var(--tm-bg-surface-glass)] [box-shadow:var(--tm-shadow-control)]', '分段控件应使用无边框轻表面和克制阴影。');
forbidText(recordSource, 'ring-1 ring-inset ring-[var(--tm-border-subtle)]', '无边框圆角体系不应为记录对象分段控件单独增加描边。');
forbidText(recordSource, 'bg-[var(--tm-bg-surface-muted)] p-1', '记录对象未选中态不应使用类似禁用状态的灰色底板。');
forbidText(recordSource, "canRecordClass ? 'grid-cols-[176px_minmax(0,1fr)]' : 'grid-cols-1'", '记录对象切换与指标不应继续使用同一行网格布局。');
forbidText(recordSource, '{canRecordClass && (\n                                <button', '“记录学生”不应作为始终可见的单项分段控件。');
requireText(recordSource, 'aria-label={`查看${activeTab', '指标入口应通过无障碍名称明确从属于当前记录对象。');
requireText(recordSource, '内容由AI生成', '每张已完成的 AI 解读记录卡都应标注 AI 生成内容。');
requireText(recordSource, 'mt-2 px-0.5 text-right text-[11px] font-medium leading-4 text-[var(--tm-text-disabled)]', 'AI 生成声明应位于记录卡底部，并保持低视觉权重。');
forbidText(recordSource, 'aiGenerationNotice', '记录页顶部不应再保留页面级 AI 生成声明。');
if ((recordSource.match(/内容由AI生成/g) ?? []).length !== 1) {
  throw new Error('AI 生成声明应由记录卡模板统一渲染，禁止在多个页面位置重复硬编码。');
}
forbidText(recordSource, '<div className="pr-[116px]">', '顶部切换不应再通过右侧留白偏移。');
requireText(appSource, 'canRecordClass={canRecordClassForActiveSpace}', '应将当前来源的班级记录权限传入记录页。');
forbidText(appSource, "currentView === 'home_log' || currentView === 'class_list') && showTeacherSpaceSheet", '记录页不应再挂载班级来源选择抽屉。');
requireText(appSource, "(currentView === 'me' || currentView === 'class_list') && showTeacherSpaceSheet", '班级页与我的页应继续共用全局班级来源抽屉。');
requireText(appSource, "activeLogTab === 'class' && !canTeacherSpaceRecordClass(nextSpace)", '切换到不支持班级记录的来源时应回到记录学生。');
requireText(spaceAccessSource, "space.type === 'school' && space.classRecordEnabled === true", '只有已开通能力的学校来源可以记录班级。');

requireText(inputSource, "const shouldShowStudentContext = mode !== 'camera'", '拍照页应在无学生时隐藏学生占位文案。');
forbidText(inputSource, '>{studentNameList || "未选择学生"}</span>', '拍照页不应无条件展示“未选择学生”。');

requireText(appSource, 'role="textbox"', '文字录入态应展示可见的输入区。');
requireText(appSource, "inputText || '输入记录内容'", '文字录入态应实时展示草稿或占位文案。');
requireText(appSource, 'rounded-[var(--tm-radius-card)] bg-white px-2.5 [box-shadow:var(--tm-shadow-floating)]', '悬浮录入条应使用独立白色面板和可生效的双层中性阴影。');
requireText(tokenSource, "'--tm-shadow-floating': '0 -10px 24px -12px rgba(64, 60, 58, 0.18), 0 10px 28px -12px rgba(64, 60, 58, 0.18)'", '悬浮录入条阴影变量应同时提供向上分层和向下承托。');
forbidText(appSource, 'linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.9)_46%,#FFFFFF_100%)', '悬浮录入条不应用大面积白色渐变遮挡记录内容。');
forbidText(appSource, 'mainBottomReserveClass', '悬浮录入条不应永久压缩页面主内容区。');
requireText(recordSource, 'pb-44', '记录列表应通过尾部滚动留白保证最后一条可完整阅读。');
requireText(classDetailSource, 'pb-40', '班级详情列表应通过尾部滚动留白保证末行可完整阅读。');
requireText(keyboardSource, 'z-[80]', '模拟键盘应高于遮罩和底部导航。');
requireText(appSource, 'if (!inputText.trim()) return;', '空文本不应触发解析。');

requireText(appSource, 'requestId:', '每次录入应生成唯一任务标识。');
requireText(recordSource, 'processedRecordIdsRef.current.has(recordRequestId)', '记录页应对已处理的录入任务去重。');

console.log('Teacher record page interaction assertions passed');
