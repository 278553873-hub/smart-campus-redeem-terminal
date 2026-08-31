import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync('mobile-app/views/TeacherIndicatorCatalogView.tsx', 'utf8');
const canvasSource = fs.readFileSync('mobile-app/components/indicator/TeacherIndicatorMindMap.tsx', 'utf8');
const dataSource = fs.readFileSync('mobile-app/data/teacherIndicatorCatalog.ts', 'utf8');
const recordSource = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const appSource = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const tokenSource = fs.readFileSync('mobile-app/styles/teacherMobileTokens.ts', 'utf8');
const guidelineSource = fs.readFileSync('design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', 'utf8');

assert.match(viewSource, /MobilePageHeader title=\{catalog\.title\}/, '指标目录应使用公共全屏子页面标题栏。');
assert.match(viewSource, /MobileBottomSheet[\s\S]*size="tall"/, '三级指标应使用公共高位底部抽屉展示详情。');
assert.match(viewSource, /TeacherIndicatorMindMap/, '指标目录应使用独立思维导图画布组件。');
assert.match(canvasSource, /<ReactFlow/, '指标体系应在可拖动缩放的成熟画布引擎中展示。');
assert.match(canvasSource, /dagre\.layout\(graph\)/, '三级结构应使用层级布局引擎计算节点位置。');
assert.match(canvasSource, /type: 'step'/, '指标关系线应使用直角折线，避免圆滑曲线占用画布空间。');
assert.match(canvasSource, /onNodeClick=\{\(\) => undefined\}/, '画布节点应保留触控事件承载，避免成熟画布引擎关闭节点点击。');
assert.match(canvasSource, /useState<Set<string>>\(\(\) => new Set\(\)\)/, '所有一级指标应默认收起。');
assert.match(canvasSource, /setExpandedLevelOneIds\(new Set\(\[branchId\]\)\)/, '普通浏览应只展开当前一级分支。');
assert.match(canvasSource, /setExpandedLevelTwoIds\(groupExpanded \? new Set\(\) : new Set\(\[groupId\]\)\)/, '普通浏览应只展开当前二级指标的三级组。');
assert.match(canvasSource, /aria-expanded=\{data\.expanded\}/, '一级和二级指标应使用整块节点展开和收起。');
assert.match(canvasSource, /label="总览"/, '画布应提供一键返回一级结构总览的操作。');
assert.doesNotMatch(canvasSource, /Maximize2|zoomIn|zoomOut/, '手机端画布不应常驻低频缩放按钮或使用放大图标误导二级指标行为。');
assert.match(canvasSource, /onSelectLeaf\(leaf/, '只有三级指标按钮应进入指标详情。');
assert.match(canvasSource, /var\(--tm-indicator-canvas-branch-1\)/, '画布分支应使用教师端组件 Token。');
assert.match(tokenSource, /'--tm-indicator-canvas-leaf-height'/, '教师端 Token 源应统一维护三级指标触控高度。');
assert.doesNotMatch(viewSource + canvasSource, /type="search"|SearchResults|搜索指标|个一级|个二级|个三级/, '指标总览页不应保留搜索或层级数量统计。');

for (const requiredText of ['展开全部', '收起全部', '加分理由', '减分理由', '评价示例', '学校暂未配置']) {
  assert.ok((viewSource + canvasSource).includes(requiredText), `指标查阅页缺少：${requiredText}`);
}

assert.match(dataSource, /student: buildStudentCatalog\(\)/, '数据层应提供学生评价指标。');
assert.match(dataSource, /class: buildClassCatalog\(\)/, '数据层应提供班级评价指标。');
assert.match(recordSource, /onClick=\{onViewIndicators\}/, '记录页指标入口应可进入目录。');
assert.match(appSource, /onViewIndicators=\{\(\) => navigateTo\('indicator_catalog'\)\}/, '应通过应用返回栈进入指标目录。');
assert.match(appSource, /scope=\{activeLogTab\}/, '指标目录应继承当前记录对象。');
assert.match(guidelineSource, /点击记录页“指标”后进入独立全屏子页面/, '教师手机端规范应记录指标查阅形式。');
assert.match(guidelineSource, /画布默认收起所有分支/, '教师手机端规范应固定画布默认状态。');
assert.match(guidelineSource, /只展开它的二级指标并自动收起其他一级分支/, '教师手机端规范应固定一级单分支阅读方式。');
assert.match(guidelineSource, /只展开它的三级指标并收起同一分支下其他三级组/, '教师手机端规范应固定二级单分支阅读方式。');
assert.match(guidelineSource, /只有点击三级指标才使用公共高位底部抽屉/, '教师手机端规范应限制详情弹窗入口。');

console.log('教师手机端指标目录与详情页结构测试通过。');
