import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('App.tsx', 'utf8');
const demo = fs.readFileSync('components/UiRenovationDemo.tsx', 'utf8');
const explorationPath = 'public/demos/gradient-background-exploration.html';
const loginIconPath = 'public/demos/teacher-login-icon-inventory.html';
const temporaryLoginIconPath = 'public/demos/teacher-login-icon-gradient-tuner.html';
const tabExplorationPath = 'public/demos/tab-switch-exploration.html';
const colorInventoryPath = 'public/demos/color-system-inventory.html';
const colorAuditPath = 'public/demos/color-system-audit.json';
const typographyInventoryPath = 'public/demos/typography-system-inventory.html';
const typographyAuditPath = 'public/demos/typography-system-audit.json';
const radiusInventoryPath = 'public/demos/radius-inventory.html';
const buttonInventoryPath = 'public/demos/button-style-inventory.html';
const buttonAuditPath = 'public/demos/button-style-audit.json';
const modalInventoryPath = 'public/demos/modal-style-inventory.html';
const modalAuditPath = 'public/demos/modal-style-audit.json';
const termReportRedesignPath = 'components/TermReportRedesignDemo.tsx';
const termReportViewPath = 'mobile-app/views/TermReportView.tsx';
const removedTermReportHtmlPath = 'public/demos/term-report-redesign.html';

assert.match(app, /import UiRenovationDemo from '\.\/components\/UiRenovationDemo'/);
assert.match(app, /app === 'ui-renovation'/);
assert.match(app, /currentApp === 'ui-renovation' && <UiRenovationDemo \/>/);
assert.match(app, /setCurrentApp\('ui-renovation'\)/);
assert.match(app, />UI改造<\/span>/);
assert.match(demo, /label: '渐变背景'/);
assert.match(demo, /label: '登录 Icon'/);
assert.match(demo, /label: 'Tab切换'/);
assert.match(demo, /label: '颜色系统'/);
assert.match(demo, /label: '字体系统'/);
assert.match(demo, /label: '圆角'/);
assert.match(demo, /label: '按钮样式'/);
assert.match(demo, /label: '弹窗样式'/);
assert.match(demo, /label: '期末报告新样式'/);
assert.match(demo, /src: '\/demos\/gradient-background-exploration\.html'/);
assert.match(demo, /src: '\/demos\/teacher-login-icon-inventory\.html'/);
assert.match(demo, /src: '\/demos\/tab-switch-exploration\.html'/);
assert.match(demo, /src: '\/demos\/color-system-inventory\.html'/);
assert.match(demo, /src: '\/demos\/typography-system-inventory\.html'/);
assert.match(demo, /src: '\/demos\/radius-inventory\.html'/);
assert.match(demo, /src: '\/demos\/button-style-inventory\.html'/);
assert.match(demo, /src: '\/demos\/modal-style-inventory\.html'/);
assert.match(demo, /lazy\(\(\) => import\('\.\/TermReportRedesignDemo'\)\)/);
assert.match(demo, /activeDemo\.id === 'term-report'/);
assert.match(demo, /overflow-x-auto/);
assert.match(demo, /role="tablist"/);
assert.match(demo, /role="tabpanel"/);
assert.match(demo, /aria-selected=\{isActive\}/);
assert.equal(fs.existsSync(explorationPath), true, 'UI改造渐变探索页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(loginIconPath), true, '教师端登录 Icon 方案应位于正式 Demo 目录。');
assert.equal(fs.existsSync(temporaryLoginIconPath), false, '登录 Icon 临时调试页应在接入 UI 改造后删除。');
assert.equal(fs.existsSync(tabExplorationPath), true, 'UI改造 Tab 切换探索页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(colorInventoryPath), true, 'UI改造颜色系统盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(colorAuditPath), true, '颜色系统盘点应提供可追溯的审计数据。');
assert.equal(fs.existsSync(typographyInventoryPath), true, 'UI改造字体系统盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(typographyAuditPath), true, '字体系统盘点应提供可追溯的审计数据。');
assert.equal(fs.existsSync(radiusInventoryPath), true, 'UI改造圆角盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(buttonInventoryPath), true, 'UI改造按钮盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(buttonAuditPath), true, '按钮盘点应提供可追溯的全量审计数据。');
assert.equal(fs.existsSync(modalInventoryPath), true, 'UI改造弹窗盘点页应位于正式 Demo 目录。');
assert.equal(fs.existsSync(modalAuditPath), true, '弹窗盘点应提供可追溯的审计数据。');
assert.equal(fs.existsSync(termReportRedesignPath), true, '期末报告新样式应使用 React 组件复用正式教师端界面。');
assert.equal(fs.existsSync(removedTermReportHtmlPath), false, '不得保留手写手机壳和重画报告的旧 HTML 页面。');
assert.equal(fs.existsSync('tmp/gradient-background-exploration.html'), false, '正式接入后应删除临时页面副本。');
assert.equal(fs.existsSync('.codex-work/teacher-mobile-switch-inventory.html'), false, '正式接入后应删除 Tab 切换临时页面副本。');

const exploration = fs.readFileSync(explorationPath, 'utf8');
assert.match(exploration, /data-style="diffuse"/);
assert.match(exploration, /data-style="linear"/);
assert.match(exploration, /data-style="aurora"/);
assert.match(exploration, /data-style="conic"/);
assert.equal((exploration.match(/<figure class=/g) ?? []).length, 11, '渐变探索页应保留 11 套配色方案。');
assert.match(exploration, /方案十一 · 红蓝清透/);
assert.match(exploration, /\.scheme-red-blue-clean/);

const tabExploration = fs.readFileSync(tabExplorationPath, 'utf8');
assert.match(tabExploration, /<title>教师手机端切换控件盘点<\/title>/);
assert.match(tabExploration, /6 类基础视觉样式/);
assert.match(tabExploration, /独立使用：19 处/);
assert.match(tabExploration, /组合使用：7 类/);
assert.match(tabExploration, /data-switch/);

const colorInventory = fs.readFileSync(colorInventoryPath, 'utf8');
assert.match(colorInventory, /<title>教师手机端颜色系统盘点<\/title>/);
assert.match(colorInventory, /结论：部分统一/);
assert.match(colorInventory, /18 个颜色语义域/);
assert.match(colorInventory, /209 \/ 209/);
assert.match(colorInventory, /旧命名彩色工具类/);
assert.match(colorInventory, /品牌、危险、选中/);
assert.doesNotMatch(colorInventory, /补充|更新日志|本次发现的遗漏/);

const colorAudit = JSON.parse(fs.readFileSync(colorAuditPath, 'utf8'));
assert.equal(colorAudit.sourceFileCount, 126, '颜色系统应覆盖全部教师手机端界面源码。');
assert.equal(colorAudit.colorTokenCount, 209, '颜色变量应完整覆盖 209 个定义。');
assert.equal(colorAudit.colorTokenDomainCount, 18, '颜色变量应按 18 个语义域归类。');
assert.equal(colorAudit.colorVariableReferenceCount, 4141, '应记录颜色变量的完整引用量。');
assert.equal(colorAudit.legacyNamedColorCount, 600, '旧命名彩色工具类应与基础色分开统计。');
assert.equal(colorAudit.neutralNamedColorCount, 384, '白、黑、透明等基础色应单独统计。');
assert.equal(colorAudit.literalColorCount, 107, '应记录全部直接色值。');
assert.equal(colorAudit.colorTokenDomains.reduce((sum, domain) => sum + domain.count, 0), 209, '颜色语义域不可漏项。');

const typographyInventory = fs.readFileSync(typographyInventoryPath, 'utf8');
assert.match(typographyInventory, /<title>教师手机端字体系统盘点<\/title>/);
assert.match(typographyInventory, /结论：未统一/);
assert.match(typographyInventory, /18 个字号变量/);
assert.match(typographyInventory, /直接像素字号 · 524 处 \/ 19 种/);
assert.match(typographyInventory, /Tailwind 字号 · 315 处 \/ 8 种/);
assert.match(typographyInventory, /字重 · 1,420 处 \/ 6 种/);
assert.doesNotMatch(typographyInventory, /补充|更新日志|本次发现的遗漏/);

const typographyAudit = JSON.parse(fs.readFileSync(typographyAuditPath, 'utf8'));
assert.equal(typographyAudit.sourceFileCount, 126, '字体系统应覆盖全部教师手机端界面源码。');
assert.equal(typographyAudit.effectiveTypographyTokenCount, 23, '应合并教师端与问卷共享字体变量。');
assert.equal(typographyAudit.typographyTokenVariantCount, 1, '应识别跨作用域的文档标题字号差异。');
assert.equal(typographyAudit.undefinedFontVariableCount, 0, '不得把共享问卷变量误报为未定义。');
assert.equal(typographyAudit.fontVariableReferenceCount, 757, '应记录字体变量的完整引用量。');
assert.equal(typographyAudit.arbitraryFontSizeCount, 524, '应记录全部直接像素字号。');
assert.equal(typographyAudit.namedFontSizeCount, 315, '应记录全部 Tailwind 字号。');
assert.equal(typographyAudit.fontWeightCount, 1420, '应记录全部字重类。');
assert.equal(typographyAudit.lineHeightCount, 236, '应记录全部显式行高。');

const radiusInventory = fs.readFileSync(radiusInventoryPath, 'utf8');
assert.match(radiusInventory, /<title>教师手机端圆角盘点<\/title>/);
assert.match(radiusInventory, /6 档语义圆角/);
assert.match(radiusInventory, /--tm-radius-control/);
assert.match(radiusInventory, /历史写法分布/);

const buttonInventory = fs.readFileSync(buttonInventoryPath, 'utf8');
assert.match(buttonInventory, /<title>教师手机端按钮样式盘点<\/title>/);
assert.match(buttonInventory, /651/);
assert.match(buttonInventory, /441/);
assert.match(buttonInventory, /7 类按钮，27 种主要结构/);
assert.match(buttonInventory, /新建另一套分组/);
assert.match(buttonInventory, /C4-01/);
assert.match(buttonInventory, /整行操作与入口/);
assert.match(buttonInventory, /灰底品牌新建行/);
assert.match(buttonInventory, /浅灰外层 · 红色圆形图标 · 红字 · 按压浅红/);
assert.match(buttonInventory, /全量源码明细/);
assert.match(buttonInventory, /data-mode="signatures"/);
assert.match(buttonInventory, /data-mode="controls"/);
assert.doesNotMatch(buttonInventory, /遗漏样式|补齐：|本次发现的遗漏|补充 [ABC]|更新日志/);

const buttonAudit = JSON.parse(fs.readFileSync(buttonAuditPath, 'utf8'));
assert.equal(buttonAudit.buttonCount, 651, '应覆盖全部原生按钮实例。');
assert.equal(buttonAudit.buttonLikeAnchorCount, 4, '应另计全部按钮外观链接。');
assert.equal(buttonAudit.controlCount, 655, '按钮形控件总数应完整。');
assert.equal(buttonAudit.fileCount, 94, '应覆盖全部包含按钮的源码文件。');
assert.equal(buttonAudit.exactStyleCount, 512, '应按外层与内部承载统计精确写法。');
assert.equal(buttonAudit.visualSignatureCount, 441, '应保留代码级视觉签名的真实差异。');
assert.equal(buttonAudit.noClassNameCount, 0, '不应存在未登记样式的按钮。');

const groupingButton = buttonAudit.controls.find(control => (
  control.file === 'mobile-app/views/ClassDetailView.tsx' && control.line === 1605
));
assert.ok(groupingButton, '应收录“新建另一套分组”按钮。');
assert.match(groupingButton.label, /新建另一套分组/);
assert.match(groupingButton.className, /bg-\[var\(--tm-bg-surface-soft\)\]/);
assert.match(groupingButton.className, /active:bg-\[var\(--tm-brand-primary-soft\)\]/);
assert.match(groupingButton.className, /text-\[var\(--tm-brand-primary\)\]/);
assert.ok(groupingButton.childClassNames.some(className => (
  className.includes('h-8')
  && className.includes('w-8')
  && className.includes('rounded-full')
  && className.includes('bg-[var(--tm-brand-primary)]')
)), '应同时盘点按钮内部的 32 像素红色圆形图标承载。');

const modalInventory = fs.readFileSync(modalInventoryPath, 'utf8');
assert.match(modalInventory, /<title>教师手机端弹窗样式盘点<\/title>/);
assert.match(modalInventory, /7 类可见样式/);
assert.match(modalInventory, /<strong>12<\/strong><span>套弹层外壳实现<\/span>/);
assert.match(modalInventory, /结论：未统一/);
assert.match(modalInventory, /MobileBottomSheet/);
assert.match(modalInventory, /MobileConfirmSheet/);
assert.match(modalInventory, /校长报表旧式抽屉/);
assert.match(modalInventory, /全量实现索引/);
assert.doesNotMatch(modalInventory, /补充|更新日志|本次发现的遗漏/);

const modalAudit = JSON.parse(fs.readFileSync(modalAuditPath, 'utf8'));
assert.equal(modalAudit.visualStyleCount, 7, '弹窗应按 7 类可见样式归类。');
assert.equal(modalAudit.shellImplementationCount, 12, '应覆盖 12 套弹层外壳实现。');
assert.equal(modalAudit.parallelBottomShellCount, 9, '应识别主组件之外的 9 套底部弹层外壳。');
assert.equal(modalAudit.standardBottomSheetReferenceCount, 87, '应记录公共底部抽屉的源码引用数。');
assert.equal(modalAudit.standardBottomSheetFileCount, 35, '应记录公共底部抽屉的覆盖文件数。');
assert.equal(modalAudit.implementationFamilies.length, 12, '全量实现索引不可缺项。');
assert.ok(modalAudit.implementationFamilies.some(item => item.id === 'leader-report-legacy' && item.stateCount === 6));
assert.ok(modalAudit.implementationFamilies.some(item => item.id === 'class-record-local' && item.stateCount === 4));

const termReportRedesign = fs.readFileSync(termReportRedesignPath, 'utf8');
const termReportView = fs.readFileSync(termReportViewPath, 'utf8');
assert.match(termReportRedesign, /<PhoneMockup/);
assert.match(termReportRedesign, /<TermReportView/);
assert.match(termReportRedesign, /additionalMobilePages=\{additionalMobilePages\}/);
assert.match(termReportRedesign, /additionalA4Pages=\{additionalA4Pages\}/);
assert.match(termReportRedesign, /additionalMobileAnchorItems=\{additionalMobileAnchorItems\}/);
assert.match(termReportRedesign, /aria-label="报告预览样式"/);
assert.match(termReportRedesign, />手机端/);
assert.match(termReportRedesign, />A4版/);
assert.match(termReportRedesign, /initialViewMode="mobile"/);
assert.match(termReportRedesign, /initialViewMode="a4"/);
assert.match(termReportRedesign, /showViewModeToggle=\{false\}/);
assert.match(termReportRedesign, /李亦洋/);
assert.match(termReportRedesign, /20210200324/);
assert.match(termReportRedesign, /学校五个育人维度/);
assert.match(termReportRedesign, /校本成长画像/);
assert.match(termReportRedesign, /行为成长足迹/);
assert.match(termReportRedesign, /学期成长变化/);
assert.match(termReportRedesign, /校本专题成果/);
assert.match(termReportRedesign, /期末报告样式配置/);
assert.match(termReportRedesign, /基于学校指标的可配置报告预览/);
assert.match(termReportView, /additionalMobilePages\?: React\.ReactNode\[\]/);
assert.match(termReportView, /additionalA4Pages\?: React\.ReactNode\[\]/);
assert.match(termReportView, /additionalMobileAnchorItems\?: TermReportAnchorItem\[\]/);
assert.match(termReportView, /additionalMobilePages = \[\]/);
assert.match(termReportView, /\.\.\.additionalMobilePages/);
assert.match(termReportView, /\.\.\.additionalA4Pages/);
assert.doesNotMatch(termReportRedesign, /五好少年称号|能力得分|综合得分|下一步成长建议|分项成长解读/);

console.log('UI改造 Demo 导航与静态页面断言通过');
