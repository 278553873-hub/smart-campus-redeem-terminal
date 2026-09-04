import fs from 'node:fs';
import assert from 'node:assert/strict';

const viewSource = fs.readFileSync(new URL('./MedalIssuanceView.tsx', import.meta.url), 'utf8');
const pickerSource = fs.readFileSync(new URL('../components/student/MobileStudentPickerSheet.tsx', import.meta.url), 'utf8');
const medalDomainSource = fs.readFileSync(new URL('../domain/medal.ts', import.meta.url), 'utf8');
const imagesSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

assert.match(classListSource, /label: '颁发奖章'/, '班级更多操作应提供颁发奖章入口。');
assert.match(classListSource, /onViewMedalIssuance/, '班级更多操作应将奖章发放交给路由层。');
assert.match(appSource, /'medal_issuance'/, '教师端应注册奖章发放页面路由。');
assert.doesNotMatch(viewSource, /公共奖章（校级）|自定义奖章（班级）/, '奖章选择界面不应展示旧版范围文案。');
assert.match(medalDomainSource, /icon: 'book'/, '奖章定义应包含图标。');
assert.match(viewSource, /CompactSegmentedControl/, '奖章分类应使用 Token 化的公共分段切换控件。');
assert.match(viewSource, /sticky top-0 z-30 -mx-\[var\(--tm-space-4\)\] bg-\[var\(--tm-bg-surface\)\]/, '奖章分类切换应在内容滚动时使用不透明白色表面吸顶。');
assert.match(viewSource, /bg-\[var\(--tm-bg-surface\)\][^"\n]*pt-\[var\(--tm-space-4\)\]/, '吸顶白色承载层应包含顶部间距，防止奖章内容从标题栏与切换条之间穿透。');
assert.match(viewSource, /平台奖章/, '奖章分类应提供平台奖章。');
assert.match(viewSource, /学校奖章/, '奖章分类应提供学校奖章。');
assert.match(viewSource, /班级奖章/, '奖章分类应提供班级奖章。');
for (const categoryName of ['日常激励', '活动特长', '综合荣誉', '五育之星']) {
  assert.match(viewSource, new RegExp(`label: '${categoryName}'`), `平台奖章应显示${categoryName}分类。`);
}
assert.ok(viewSource.indexOf("label: '日常激励'") < viewSource.indexOf("label: '活动特长'"), '日常激励应排在活动特长之前。');
assert.ok(viewSource.indexOf("label: '活动特长'") < viewSource.indexOf("label: '综合荣誉'"), '活动特长应排在综合荣誉之前。');
assert.ok(viewSource.indexOf("label: '综合荣誉'") < viewSource.indexOf("label: '五育之星'"), '五育之星应作为最高价值分类放在最后。');
assert.doesNotMatch(viewSource, /学期称号/, '平台奖章不应继续使用不易理解的“学期称号”。');
assert.ok(viewSource.includes('const schoolMedals = DEFAULT_SCHOOL_MEDALS;'), '学校奖章默认应为空。');
assert.match(medalDomainSource, /DEFAULT_SCHOOL_MEDALS: MedalDefinition\[\] = \[\]/, '学校奖章数据定义默认应为空。');
assert.match(viewSource, /请联系学校管理员添加/, '学校奖章为空时应提示联系学校管理员添加。');
assert.match(viewSource, /<MobileEmptyState/, '学校奖章为空时应使用统一缺省组件。');
assert.match(medalDomainSource, /DEFAULT_PLATFORM_MEDALS/, '奖章定义应包含平台默认奖章。');
assert.match(medalDomainSource, /DEFAULT_SCHOOL_MEDALS/, '奖章定义应包含学校自设计奖章。');
assert.match(medalDomainSource, /MEDAL_DISPLAY_SPECS/, '奖章定义应提供跨页面展示规格。');
assert.match(medalDomainSource, /studentDetail: \{ iconSize: 32, itemMinHeight: 56, showQuantity: true \}/, '学生详情应展示32像素图标和累计数量。');
assert.match(medalDomainSource, /termReport: \{ iconSize: 24, itemMinHeight: 40, showQuantity: true \}/, '期末报告应使用24像素图标并展示累计数量。');
assert.match(viewSource, /新增班级奖章/, '班级奖章应提供班主任新增入口。');
assert.match(viewSource, /奖章名称/, '新增班级奖章应填写名称。');
assert.match(viewSource, /选择图标/, '新增班级奖章应选择图标。');
assert.match(viewSource, /PLATFORM_MEDALS\.map\(platformMedal/, '班级奖章应支持复用平台奖章图标。');
assert.match(viewSource, /type="file" accept="image\/\*"/, '班级奖章应支持上传图片作为图标。');
assert.match(viewSource, /handleMedalIconUpload/, '上传图标应转换为本地预览并保存。');
for (const assetKey of ['PLATFORM_DEYU_STAR', 'PLATFORM_ZHIYU_STAR', 'PLATFORM_TIYU_STAR', 'PLATFORM_MEIYU_STAR', 'PLATFORM_LAOYU_STAR']) {
  assert.match(imagesSource, new RegExp(`${assetKey}:`), `平台奖章应注册图片资源：${assetKey}。`);
}
for (const assetKey of ['SEMESTER_THREE_GOOD', 'SEMESTER_CADRE', 'SEMESTER_YOUNG_PIONEER', 'SEMESTER_EXCELLENT_STUDENT']) {
  assert.match(imagesSource, new RegExp(`${assetKey}:`), `综合荣誉应注册图片资源：${assetKey}。`);
}
for (const assetKey of ['DAILY_PROGRESS', 'DAILY_DILIGENT', 'DAILY_CIVILIZED', 'DAILY_DISCIPLINED', 'DAILY_FRIENDLY']) {
  assert.match(imagesSource, new RegExp(`${assetKey}:`), `日常激励应注册图片资源：${assetKey}。`);
}
for (const assetKey of ['ACTIVITY_SPORTS', 'ACTIVITY_ART', 'ACTIVITY_TECH', 'ACTIVITY_READING', 'ACTIVITY_PERFORMANCE']) {
  assert.match(imagesSource, new RegExp(`${assetKey}:`), `活动特长应注册图片资源：${assetKey}。`);
}
for (const medalName of ['三好学生', '优秀班干部', '优秀少先队员', '优秀学生']) {
  assert.match(medalDomainSource, new RegExp(`name: '${medalName}'`), `综合荣誉应包含：${medalName}。`);
}
for (const medalName of ['进步之星', '勤学之星', '文明之星', '守纪之星', '友善之星']) {
  assert.match(medalDomainSource, new RegExp(`name: '${medalName}'`), `日常激励应包含：${medalName}。`);
}
for (const medalName of ['运动达人', '艺术达人', '科技达人', '阅读达人', '表演达人']) {
  assert.match(medalDomainSource, new RegExp(`name: '${medalName}'`), `活动特长应包含：${medalName}。`);
}
assert.doesNotMatch(viewSource, /classInfo\.name/, '奖章页顶部不应重复展示班级名称。');
assert.match(viewSource, /selectedMedalIds/, '奖章选择应维护多选状态。');
assert.match(viewSource, /aria-pressed=\{selected\}/, '奖章卡应暴露选中状态。');
assert.match(viewSource, /min-h-\[var\(--tm-medal-grid-item-min-height\)\]/, '奖章网格项应使用稳定的触控高度 Token。');
assert.match(viewSource, /h-\[var\(--tm-medal-grid-icon-size\)\]/, '奖章网格项应使用独立的图标尺寸 Token。');
assert.match(viewSource, /grid-cols-4/, '奖章网格应优先一排展示四个奖章。');
assert.equal((viewSource.match(/grid grid-flow-row grid-cols-4 gap-x-\[var\(--tm-space-2\)\] gap-y-\[var\(--tm-space-3\)\]/g) ?? []).length, 2, '平台奖章与班级奖章均应使用8像素横向、12像素纵向间距。');
assert.match(viewSource, /border border-transparent/, '奖章网格项应保持稳定占位，但不使用红色选中边框。');
assert.equal((viewSource.match(/medalCardClassName = \[[\s\S]{0,400}?bg-\[var\(--tm-bg-surface\)\]/g) ?? []).length, 2, '平台奖章与班级奖章均应使用 Token 化白色圆角底。');
assert.equal((viewSource.match(/medalCardClassName = \[[\s\S]{0,300}?rounded-\[var\(--tm-radius-inner\)\]/g) ?? []).length, 2, '平台奖章与班级奖章应复用16像素内容卡片圆角。');
assert.doesNotMatch(viewSource, /selected \? 'border-\[var\(--tm-brand-primary\)\]'/, '奖章选中态不应使用整张卡片红色边框。');
assert.equal((viewSource.match(/MobileSelectionIndicator selected=\{selected\} showUnselected=\{false\} className="absolute -right-1 -top-1 z-20"/g) ?? []).length, 2, '平台奖章与班级奖章的选中标记均应定位在整张卡片右上角。');
assert.doesNotMatch(viewSource, /<MedalIconView[^>]+\/><MobileSelectionIndicator/, '奖章选中标记不应继续以图标容器为定位参照。');
assert.doesNotMatch(viewSource, /text-transparent/, '奖章未选中时不应保留透明的空复选标记。');
assert.doesNotMatch(viewSource, /const medalCardClassName[\s\S]{0,500}selected \? 'bg-\[var\(--tm-brand-reward-soft\)\]/, '奖章选中态不应铺设浅色底。');
assert.doesNotMatch(viewSource, /medalIconClassName[\s\S]*rounded-full/, '奖章本体不应再被无意义的圆形底色包裹。');
assert.doesNotMatch(viewSource, /box-shadow:var\(--tm-shadow-card\)/, '奖章网格不应使用白色卡片阴影。');
assert.match(viewSource, /flex-col/, '奖章卡应采用图标在上、名称在下的上下结构。');
assert.match(viewSource, /选择学生/, '底部主操作应先引导选择学生。');
assert.match(viewSource, /已选 \{selectedMedals\.length\} 枚/, '选择奖章后应在固定底部展示已选数量。');
assert.match(viewSource, /\{selectedMedalNames\}/, '已选提示应展示完整奖章名称。');
assert.match(viewSource, /onClick=\{\(\) => setSheetMode\('students'\)\}[\s\S]*>选择学生<\/button>/, '主页主按钮应始终进入学生选择。');
assert.match(viewSource, /MobileStudentPickerSheet/, '页面应复用公共学生选择弹窗。');
assert.match(pickerSource, /StudentCompactSelectGrid/, '公共学生选择弹窗应继续复用学生多选网格。');
assert.match(pickerSource, /搜索姓名、学号/, '学生选择应支持按姓名或学号搜索。');
assert.match(viewSource, /allStudentsSelected = activeStudents\.length > 0 && activeStudents\.every/, '奖章弹窗的全选状态应按班级全部有效学生计算。');
assert.match(viewSource, /toggleAllStudents[\s\S]*activeStudents\.forEach/, '奖章弹窗的全选不应受搜索结果范围影响。');
assert.match(viewSource, /selectAllAction=\{\{/, '奖章弹窗应复用公共全选操作。');
assert.doesNotMatch(viewSource, /全选当前|全选本班|取消全班/, '奖章弹窗应统一使用“全选 / 取消全选”。');
assert.match(viewSource, /onClick=\{\(\) => setSheetMode\('confirm'\)\}/, '学生选择底部按钮应提交并进入二次确认。');
assert.match(viewSource, /`颁发奖章（\$\{selectedStudentIds\.size\}人）` : '颁发奖章'/, '学生选择底部按钮应显示“颁发奖章（N人）”。');
assert.doesNotMatch(viewSource, /提交发放/, '奖章发放流程不应继续使用“提交发放”文案。');
assert.match(viewSource, /title="确认发放"/, '奖章发放应提供二次确认层。');
assert.match(viewSource, /selectedMedals\.map\(medal =>/, '二次确认应展示全部待发放奖章。');
assert.match(viewSource, /selectedStudents\.map\(student =>/, '二次确认应展示全部待发放学生。');
assert.doesNotMatch(viewSource, /selectedStudents\.slice\(0, 4\)/, '二次确认不得省略学生名单。');
assert.match(viewSource, />返回修改<\/button>/, '二次确认应允许返回修改学生选择。');
assert.match(viewSource, /颁发成功/, '颁发成功后应提供反馈。');

console.log('MedalIssuanceView assertions passed');
