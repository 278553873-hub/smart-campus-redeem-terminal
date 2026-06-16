import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const homeworkEntrySource = fs.readFileSync(new URL('./HomeworkEntryView.tsx', import.meta.url), 'utf8');
const constantsSource = fs.readFileSync(new URL('../constants.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(classListSource, 'onViewHomeworkEntry: (classId: string) => void;', '班级列表应暴露作业录入回调。');
requireText(classListSource, "title: '日常操作'", '班级更多操作应按日常操作归类。');
requireText(classListSource, "title: '学生信息更新'", '班级更多操作应把学生资料维护能力归入学生信息更新。');
requireText(classListSource, "label: '作业录入'", '班级更多操作应新增作业录入。');
requireText(classListSource, 'runClassAction(onViewHomeworkEntry)', '作业录入应携带当前班级 id。');
requireText(classListSource, 'FileTextIcon', '作业录入应使用轻量图标入口。');
requireText(classListSource, 'activeActionClass', '班级更多操作应使用底部弹窗承载当前班级操作。');
requireText(classListSource, 'rounded-t-[30px] bg-white', '班级更多操作应展示为底部弹窗。');
requireText(classListSource, "title: '班级维护'", '班级更多操作应把维护类能力独立分组。');
requireText(classListSource, "title: '协同管理'", '班级更多操作应把邀请老师归入协同管理。');
requireText(classListSource, "label: '兑换奖励'", '底部弹窗应展示兑换奖励入口。');
requireText(classListSource, "label: '批量修改学生'", '底部弹窗应展示批量修改学生入口。');
requireText(classListSource, "label: '设置兑换密码'", '底部弹窗应展示设置兑换密码入口。');
requireText(classListSource, "label: '更新人脸数据'", '底部弹窗应展示更新人脸数据入口。');
requireText(classListSource, "label: '离校学生'", '底部弹窗应展示离校学生入口。');
requireText(classListSource, "label: '邀请老师加入'", '底部弹窗应展示邀请老师加入入口。');
requireText(classListSource, "label: '编辑班级信息'", '底部弹窗应展示编辑班级信息入口。');
if (classListSource.includes("title: '校园币兑换'")) {
  throw new Error('班级更多操作不应继续使用“校园币兑换”分组，应改为“学生信息更新”。');
}
requireText(classListSource, 'onInviteTeacher: (classId: string) => void;', '班级列表应暴露邀请老师回调。');
requireText(classListSource, 'onEditClassInfo: (classId: string) => void;', '班级列表应暴露编辑班级信息回调。');

requireText(appSource, "'homework_entry'", '手机端应新增作业录入页面状态。');
requireText(appSource, "case 'homework_entry': return MOCK_CLASSES.find(c => c.id === selectedClassId)?.name || '作业录入';", '作业录入页面标题应优先显示当前班级名。');
requireText(appSource, 'const handleViewHomeworkEntry = (classId: string)', 'App 应提供作业录入导航处理。');
requireText(appSource, 'const handleInviteTeacher = (classId: string)', 'App 应提供邀请老师演示处理。');
requireText(appSource, 'const handleEditClassInfo = (classId: string)', 'App 应提供编辑班级信息演示处理。');
requireText(appSource, '<HomeworkEntryView', 'App 应渲染作业录入页面。');
requireText(appSource, 'students={getMergedStudentsForClass(selectedClassId).filter', '作业录入应按当前班级加载学生。');

requireText(homeworkEntrySource, 'subjectOptions', '作业录入应按科目区分。');
requireText(homeworkEntrySource, "const statusOptions = ['优', '良', '合格', '待合格', '未交'];", '作业录入状态应包含优良合格待合格未交。');
requireText(homeworkEntrySource, '批量操作', '作业录入应提供批量操作录入区。');
if (homeworkEntrySource.includes('>完成情况<')) {
  throw new Error('完成情况卡片不应再显示“完成情况”标题文案。');
}

requireText(homeworkEntrySource, "const subjectOptions = ['语文', '书法'];", '作业录入科目应只展示当前老师授课科目 mock。');
const subjectIndex = homeworkEntrySource.indexOf('overflow-visible bg-[#F8FAFC] px-6 pt-2');
const dateIndex = homeworkEntrySource.indexOf('monthDays.map');
const nameIndex = homeworkEntrySource.indexOf('placeholder="作业名称（选填）"');
if (!(subjectIndex > -1 && dateIndex > subjectIndex && nameIndex > dateIndex)) {
  throw new Error('作业设置顺序应为顶部学科标签、日期、作业名称。');
}
requireText(homeworkEntrySource, 'sortedStudents', '作业录入应按学生学号升序稳定展示。');
requireText(homeworkEntrySource, 'studentNo', '作业录入学生列表应展示学生学号。');
requireText(homeworkEntrySource, 'progressText', '作业录入完成进度应显示完成人数/总人数。');
requireText(homeworkEntrySource, 'const items = sortedStudents.slice(start, start + studentGroupSize)', '学生列表应按每 20 人分组展示。');
requireText(homeworkEntrySource, 'scrollToStudentGroup', '学生分组应支持锚点快速定位。');
requireText(homeworkEntrySource, 'homeworkResultsBySubject', '作业结果应按学科和日期保存，支持学科切换和日历状态点。');
requireText(homeworkEntrySource, 'getCalendarDateResultTone', '日历应根据当天作业结果完整度展示状态点。');
requireText(constantsSource, 'studentCount: 60', 'mock 班级人数应固定为 60，匹配 20250101～20250160 学号范围。');
requireText(constantsSource, 'studentNo:', 'mock 学生数据应生成 studentNo 字段。');
requireText(constantsSource, 'classNumber.padStart(2', 'mock 学号应包含两位班级序号。');
if (homeworkEntrySource.includes('FileTextIcon')) {
  throw new Error('作业录入页取消顶部卡片后不应继续引入 FileTextIcon。');
}
if (homeworkEntrySource.includes('bg-gradient-to-br from-blue-600 to-cyan-500')) {
  throw new Error('作业录入页应取消最顶部渐变卡片。');
}
if (homeworkEntrySource.includes('全部{status}')) {
  throw new Error('批量按钮不应显示“全部”二字。');
}
if (homeworkEntrySource.includes('progressPercent')) {
  throw new Error('取消顶部统计卡后不应保留未使用的进度百分比。');
}
requireText(homeworkEntrySource, '批量操作</div>', '作业录入应支持批量操作，标题应显示为批量操作。');
requireText(homeworkEntrySource, '<div className="text-sm font-semibold text-slate-500">{progressText}</div>', '完成进度应放在批量操作同一行右侧。');
if (homeworkEntrySource.includes("{ key: 'pending'") || homeworkEntrySource.includes("{ key: 'completed'")) {
  throw new Error('作业录入学生列表应保持学号升序，不能按未录入/已录入分组导致跳动。');
}
if (homeworkEntrySource.includes('保存作业录入')) {
  throw new Error('作业录入为实时保存，不应保留保存作业录入按钮。');
}
if (homeworkEntrySource.includes('onClick={onBack}')) {
  throw new Error('作业录入页不应保留底部返回按钮。');
}

requireText(homeworkEntrySource, 'grid min-h-[46px] grid-cols-[76px_minmax(0,1fr)]', '学生完成情况应使用高密度单行列表。');
requireText(homeworkEntrySource, '{progressText}', '作业录入页应显示完成人数/总人数。');
if (homeworkEntrySource.includes('已录入 {completedCount}人')) {
  throw new Error('作业录入页不应继续显示已录入人数文案。');
}
if (homeworkEntrySource.includes('一屏快速点选')) {
  throw new Error('作业录入页不应保留无意义提示文案“一屏快速点选”。');
}
if (homeworkEntrySource.includes('helper:')) {
  throw new Error('作业录入分组不应保留冗余 helper 文案。');
}
requireText(homeworkEntrySource, "const weekDays = ['一', '二', '三', '四', '五', '六', '日'];", '作业录入日期应使用周一到周日的月历。');
requireText(homeworkEntrySource, 'getMonthGrid(calendarMonth)', '作业录入日期应显示当前月份日历网格。');
requireText(homeworkEntrySource, 'aria-label="上个月"', '作业录入月历应支持切换上个月。');
requireText(homeworkEntrySource, 'aria-label="下个月"', '作业录入月历应支持切换下个月。');
requireText(homeworkEntrySource, '今天', '作业录入月历应提供今天按钮。');
requireText(homeworkEntrySource, 'text-[17px] font-semibold text-slate-900', '月历月份标题不应超过手机端页面标题层级。');
if (homeworkEntrySource.includes('text-[20px] font-semibold text-slate-950')) {
  throw new Error('月历月份标题字号过大，不能比页面标题更抢层级。');
}
requireText(homeworkEntrySource, "bg-yellow-400", '作业录入月历应使用黄色圆点标记选中日期。');
requireText(homeworkEntrySource, "'今'", '作业录入月历应使用“今”标记今天。');
if (homeworkEntrySource.includes('type="date"')) {
  throw new Error('作业录入日期不应继续使用原生日期输入框，应显示月历。');
}
if (homeworkEntrySource.includes('statusSummary')) {
  throw new Error('作业录入页不应保留挤压空间的状态统计卡。');
}
if (homeworkEntrySource.includes('<h3 className="mb-3 text-[17px] font-semibold text-slate-900">基本信息</h3>')) {
  throw new Error('作业录入页不应使用 PC 化的基本信息表单标题。');
}
requireText(homeworkEntrySource, 'overflow-x-auto pb-1 no-scrollbar', '科目点选应保留横向轻量滚动。');
requireText(homeworkEntrySource, 'grid grid-cols-5 gap-1.5', '批量操作按钮应一屏完整展示，不再横向滚动。');
requireText(homeworkEntrySource, "return dateCompletedCount === students.length ? 'bg-green-500' : 'bg-amber-500';", '日历状态点应以绿色表示全员有结果，橙色表示部分无结果。');
requireText(homeworkEntrySource, 'className="flex h-11 flex-col items-center justify-center"', '日历单元应把日期圆形和状态点上下分离。');
requireText(homeworkEntrySource, 'flex h-9 w-9 items-center justify-center rounded-full', '日期选中态必须保持 36px 正圆形。');
requireText(homeworkEntrySource, 'mt-0.5 h-1.5 w-1.5 rounded-full', '状态点应独立显示在日期数字下方。');
requireText(homeworkEntrySource, 'h-full min-h-0 flex-col overflow-hidden', '作业录入页应使用内部滚动容器。');
requireText(homeworkEntrySource, 'absolute left-0 right-0 top-0 z-40', '滚动后的简洁上下文应脱离滚动内容并固定在页面顶部。');
requireText(homeworkEntrySource, 'overflow-visible bg-[#F8FAFC] px-6 pt-2', '顶部学科标签容器应留出垂直空间和左侧留白，避免标签被截断。');
requireText(homeworkEntrySource, 'overflow-x-auto pl-1 no-scrollbar', '学科标签横向区域应增加左侧缓冲，避免首个标签被裁切。');
requireText(homeworkEntrySource, 'h-12 rounded-t-[24px] rounded-b-none bg-blue-600 text-white', '当前学科标签应使用蓝底白字强化顶层页签。');
if (homeworkEntrySource.includes('aria-hidden={stickyContextProgress === 1}')) {
  throw new Error('大科目页签不应再放入吸顶切换容器，应作为第一屏内容自然滚走。');
}
if (homeworkEntrySource.includes('after:bottom-2 after:left-6 after:right-6 after:h-1.5')) {
  throw new Error('当前学科标签不应保留文字下方白色长条。');
}
requireText(homeworkEntrySource, 'h-10 rounded-t-[20px] rounded-b-none bg-white/78', '未选学科标签应缩短并贴到日历面板顶部。');
requireText(homeworkEntrySource, '-mt-px rounded-b-3xl rounded-tr-3xl border border-slate-100 bg-white', '学科页签应与下方日历卡片连成一个整体。');
requireText(homeworkEntrySource, 'buildMockHomeworkResults', '应 mock 之前日期的作业录入数据。');
requireText(homeworkEntrySource, 'addDays(today, -1)', 'mock 数据应包含当前日期之前的作业记录。');
requireText(homeworkEntrySource, 'selectedDateText', '滚动后顶部应固定展示当前日期信息。');
requireText(homeworkEntrySource, '<span>{subject}</span>', '滚动后顶部应固定展示当前科目信息。');
requireText(homeworkEntrySource, 'stickyContextProgress', '顶部固定上下文应根据滚动进度渐进展示。');
requireText(homeworkEntrySource, 'const nextProgress = Math.min(1, Math.max(0, (scrollTop - 180) / 80));', '顶部固定上下文应在滚动到后续内容时平滑出现，而不是第一屏常驻。');
requireText(homeworkEntrySource, 'transition-[opacity,transform] duration-300 ease-out', '顶部固定上下文应使用平滑过渡，避免突然闪现。');
requireText(homeworkEntrySource, 'className="pointer-events-none absolute left-0 right-0 top-0 z-40', '顶部固定上下文应作为不拦截点击的顶层浮层。');
requireText(homeworkEntrySource, 'flex h-11 items-center justify-between border-b border-slate-100 bg-white/96 px-8', '吸顶简洁栏应左右拉通平铺显示，不使用圆角矩形。');
if (homeworkEntrySource.includes('rounded-2xl border border-slate-100 bg-white/96 px-4')) {
  throw new Error('吸顶简洁栏不应继续使用圆角卡片样式。');
}
requireText(homeworkEntrySource, 'onScroll={handlePageScroll}', '页面滚动容器应监听滚动以控制固定上下文显示。');
requireText(homeworkEntrySource, 'prev[studentId] === status', '学生等级再次点击应取消选中。');
requireText(homeworkEntrySource, 'active ? statusToneMap[status]', '学生已选等级应使用对应等级颜色展示。');
