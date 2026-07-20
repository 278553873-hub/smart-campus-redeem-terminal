import fs from 'node:fs';

const recordSource = fs.readFileSync(new URL('./ClassRecordLogView.tsx', import.meta.url), 'utf8');
const inputSource = fs.readFileSync(new URL('./RecordInputView.tsx', import.meta.url), 'utf8');
const classDetailSource = fs.readFileSync(new URL('./ClassDetailView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const keyboardSource = fs.readFileSync(new URL('../components/VirtualKeyboard.tsx', import.meta.url), 'utf8');
const sourceTriggerSource = fs.readFileSync(new URL('../components/ClassSourceTrigger.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const spaceAccessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(recordSource, 'classSourceType?: TeacherSpaceType;', '记录页应接收班级来源类型以匹配统一图标。');
requireText(recordSource, 'canRecordClass?: boolean;', '记录页应接收当前来源的班级记录权限。');
requireText(sourceTriggerSource, 'inline-flex min-h-11 max-w-full items-center', '班级来源切换入口应具备至少 44px 触控热区。');
requireText(sourceTriggerSource, "variant?: 'surface' | 'quiet';", '班级来源触发器应支持页面层级不同的展示变体。');
requireText(recordSource, 'variant="quiet"', '记录页来源入口应使用轻量展示，避免抢占记录任务层级。');
requireText(recordSource, '{canRecordClass && (', '记录对象切换应只对支持记录班级的来源披露。');
requireText(recordSource, 'grid-cols-[224px_minmax(0,1fr)]', '双记录对象来源应使用稳定宽度的分段控件和弹性指标列。');
requireText(recordSource, 'items-end gap-3 px-5 pb-3 pt-1.5', '指标入口应与记录对象分段控件底部对齐。');
requireText(recordSource, 'items-center justify-self-end gap-0.5', '指标入口应对齐下方记录卡右边界。');
requireText(recordSource, 'bg-[var(--tm-bg-surface-glass)] p-1 shadow-[var(--tm-shadow-control)]', '分段控件应使用无边框轻表面和克制阴影。');
forbidText(recordSource, 'ring-1 ring-inset ring-[var(--tm-border-subtle)]', '无边框圆角体系不应为记录对象分段控件单独增加描边。');
forbidText(recordSource, 'bg-[var(--tm-bg-surface-muted)] p-1', '记录对象未选中态不应使用类似禁用状态的灰色底板。');
requireText(recordSource, '!canRecordClass && (', '单一记录对象时应直接展示学生指标入口。');
forbidText(recordSource, '{canRecordClass && (\n                                <button', '“记录学生”不应作为始终可见的单项分段控件。');
requireText(recordSource, "activeTab === 'student' ? '学生指标' : '班级指标'", '指标入口应明确从属于当前记录对象。');
forbidText(recordSource, '<div className="pr-[116px]">', '顶部切换不应再通过右侧留白偏移。');
requireText(recordSource, 'classSourceName?: string;', '记录页应接收当前班级来源名称。');
requireText(recordSource, 'showClassSourceSwitcher?: boolean;', '记录页应支持单来源账号隐藏切换入口。');
requireText(recordSource, 'onOpenClassSourceSwitcher?: () => void;', '记录页应将打开班级来源抽屉的动作交给应用层。');
requireText(recordSource, '<ClassSourceTrigger', '记录页应复用全局班级来源触发器。');
requireText(sourceTriggerSource, 'aria-label={`切换班级来源，当前${name}`}', '班级来源入口应提供完整的无障碍语义。');
requireText(sourceTriggerSource, 'personal: UserRound', '个人来源应使用单人图标。');
requireText(sourceTriggerSource, 'collaboration: UsersRound', '协作来源应使用多人图标。');
requireText(sourceTriggerSource, 'school: Building2', '学校来源应使用学校图标。');
requireText(sourceTriggerSource, '<ChevronDown', '来源触发器应使用向下箭头表达打开选择器。');

requireText(appSource, 'classSourceName={activeTeacherSpace.title}', '应将当前班级来源传入记录页。');
requireText(appSource, 'classSourceType={activeTeacherSpace.type}', '应将当前班级来源类型传入记录页。');
requireText(appSource, 'canRecordClass={canRecordClassForActiveSpace}', '应将当前来源的班级记录权限传入记录页。');
requireText(appSource, 'showClassSourceSwitcher={hasMultipleTeacherSpaces}', '记录页班级来源入口只应对多来源账号展示。');
requireText(appSource, "(currentView === 'me' || currentView === 'home_log' || currentView === 'class_list') && showTeacherSpaceSheet", '记录页、班级页与我的页应共用同一个全局班级来源抽屉。');
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
