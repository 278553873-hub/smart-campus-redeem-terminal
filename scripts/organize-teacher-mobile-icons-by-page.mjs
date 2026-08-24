import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as lucideIcons from 'lucide-react';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(projectRoot, 'mobile-app/assets/resources/teacher-mobile-icons');
const outputRoot = path.join(packageRoot, 'by-page');
const commonFolder = '00-公共图标';
const commonRoot = path.join(outputRoot, commonFolder);
const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const aliasMap = { CircleAlert: 'AlertCircle', PenLine: 'Edit3', LoaderCircle: 'Loader2' };

const toKebabCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Za-z])(\d+)/g, '$1-$2')
  .replace(/(\d+)([A-Za-z])/g, '$1-$2')
  .toLowerCase();

const iconLabels = {
  'alert-circle.svg': '警告提示', 'alert-triangle.svg': '风险提示', 'archive.svg': '归档',
  'archive-restore.svg': '恢复归档', 'arrow-down-narrow-wide.svg': '降序排列', 'arrow-left.svg': '返回',
  'arrow-up-down.svg': '排序', 'arrow-up-narrow-wide.svg': '升序排列', 'arrow-up-right.svg': '进入或跳转',
  'award.svg': '荣誉或奖励', 'badge-check.svg': '已认证或已完成', 'bar-chart-3.svg': '数据报表',
  'book-open.svg': '科目或协议', 'book-open-check.svg': '档案内容', 'book-open-text.svg': '阅读报告',
  'bot.svg': 'AI（人工智能）内容', 'building-2.svg': '学校来源', 'calculator.svg': '计算',
  'calendar.svg': '日期', 'calendar-clock.svg': '日期时间', 'calendar-days.svg': '日期选择',
  'calendar-range.svg': '时间范围', 'camera.svg': '拍照或修改头像', 'check.svg': '确认或已选择',
  'check-circle-2.svg': '完成状态', 'chevron-down.svg': '展开或下拉', 'chevron-left.svg': '返回',
  'chevron-right.svg': '进入下一级', 'chevron-up.svg': '收起', 'circle.svg': '未选择',
  'circle-alert.svg': '警告提示', 'circle-dot.svg': '单选项', 'circle-help.svg': '帮助说明',
  'clipboard-check.svg': '已完成采集', 'clipboard-list.svg': '问卷或采集', 'clock.svg': '时间',
  'coins.svg': '校园币', 'compass.svg': '方向或发展建议', 'copy.svg': '复制',
  'database-zap.svg': '数据反馈', 'download.svg': '下载', 'dumbbell.svg': '体育',
  'edit-3.svg': '编辑', 'eye.svg': '查看或预览', 'eye-off.svg': '隐藏内容',
  'file.svg': '文件', 'file-cog.svg': '档案设计', 'file-pen-line.svg': '编辑档案',
  'file-search.svg': '查看文件', 'file-spreadsheet.svg': '表格文件', 'file-text.svg': '文档或作业',
  'flask-conical.svg': '科学', 'folder.svg': '分组',
  'folder-open.svg': '资料或档案', 'folder-plus.svg': '新增分组', 'gift.svg': '奖励兑换',
  'grip-vertical.svg': '拖动排序', 'hash.svg': '数字字段', 'heart-handshake.svg': '协作关怀',
  'history.svg': '历史记录', 'home.svg': '班级底部导航', 'image.svg': '图片',
  'image-off.svg': '无图片', 'image-plus.svg': '添加图片', 'info.svg': '信息提示',
  'key-round.svg': '密码', 'keyboard.svg': '键盘输入', 'landmark.svg': '校园银行',
  'languages.svg': '语言', 'layers.svg': '分层内容', 'layout.svg': '版式', 'link.svg': '链接邀请',
  'list-checks.svg': '清单', 'list-plus.svg': '新增列表项', 'list-tree.svg': '指标树或大纲',
  'loader-2.svg': '加载中', 'lock.svg': '隐私或锁定', 'lock-keyhole.svg': '权限锁定',
  'log-in.svg': '加入班级', 'log-out.svg': '退出或解散', 'map.svg': '成长路径',
  'map-pin.svg': '地点', 'mars.svg': '男生', 'megaphone.svg': '通知或建议',
  'message-circle.svg': '消息或邀请家长', 'message-square.svg': '评语', 'message-square-text.svg': '文字题或说明',
  'mic.svg': '语音录入', 'minus.svg': '移除', 'monitor.svg': '数字设备',
  'more-horizontal.svg': '更多操作', 'more-vertical.svg': '文件更多操作', 'palette.svg': '样式设置',
  'pen-line.svg': '编辑', 'pen-tool.svg': '设计', 'pencil.svg': '编辑', 'pencil-line.svg': '编辑记录',
  'phone.svg': '拨打电话', 'plus.svg': '新增', 'power.svg': '启用', 'power-off.svg': '停用',
  'printer.svg': '打印', 'qr-code.svg': '二维码', 'quote.svg': '内容摘要', 'refresh-cw.svg': '重试或刷新',
  'repeat-2.svg': '转移班主任', 'rotate-ccw.svg': '撤销或恢复', 'ruler.svg': '身高数据',
  'save.svg': '保存', 'scan-face.svg': '更新人脸', 'scan-search.svg': '分析查看',
  'school.svg': '学校', 'search.svg': '搜索', 'send.svg': '发送或提交', 'settings.svg': '设置',
  'share-2.svg': '分享', 'shield.svg': '安全或兑换密码', 'shield-check.svg': '安全校验',
  'shopping-bag.svg': '消费记录', 'sliders-horizontal.svg': '筛选或管理', 'smile.svg': '成长表现',
  'sparkles.svg': 'AI（人工智能）生成', 'star.svg': '评分或收藏', 'sun.svg': '成长亮点',
  'tags.svg': '标签', 'target.svg': '目标或设置', 'text-cursor-input.svg': '文字输入',
  'trash-2.svg': '删除或移除', 'trending-up.svg': '成长趋势', 'triangle.svg': '图表标记',
  'trophy.svg': '排行榜', 'user.svg': '我的底部导航', 'user-check.svg': '学生核验',
  'user-cog.svg': '设置副班主任', 'user-plus.svg': '邀请人员', 'user-round.svg': '个人来源或学生',
  'user-round-check.svg': '填写人或已选人员', 'user-round-search.svg': '查找人员', 'users.svg': '学生或成员列表',
  'users-round.svg': '协作来源或多人', 'venus.svg': '女生', 'volume-2.svg': '播放语音', 'x.svg': '关闭',
};

const customLabels = {
  'avatar-camera.svg': '头像编辑角标', 'back.svg': '返回',
  'collaboration-class-source.svg': '协作班级来源', 'keyboard-delete.svg': '虚拟键盘删除',
  'keyboard-shift.svg': '虚拟键盘大写切换', 'loading-spinner.svg': '全局加载反馈',
  'more-archive-design.svg': '更多工具：档案设计', 'more-coin-issuance.svg': '更多工具：货币发放',
  'more-department-management.svg': '更多工具：部门管理', 'more-questionnaire.svg': '更多工具：问卷采集',
  'more-subject-management.svg': '更多工具：科目管理', 'more-suggestion-feedback.svg': '更多工具：建议反馈',
  'personal-class-source.svg': '个人班级来源', 'profile-settings.svg': '个人设置',
  'questionnaire-todo-chevron-right.svg': '待填写采集进入箭头', 'questionnaire-todo.svg': '待填写采集',
  'school-source-chevron-down.svg': '学校来源下拉箭头', 'school-source.svg': '学校来源',
  'student-detail-clock.svg': '学生详情时间', 'student-detail-file-text.svg': '学生详情文件',
  'term-highlight-add.svg': '学期报告新增高光', 'term-highlight-camera.svg': '学期报告拍照',
  'term-highlight-delete.svg': '学期报告删除高光', 'term-highlight-gallery.svg': '学期报告相册选择',
  'term-highlight-upload.svg': '学期报告上传图片', 'term-highlight-zoom-in.svg': '学期报告查看大图',
  'voice-onboarding-arrow-solid-gold.svg': '语音录入控件指引（奖励金粗线、无描边）',
};

const pageSpecificLabels = {
  '03-班级/班级列表': {
    'bar-chart-3.svg': '进入班级报告', 'check.svg': '班级号复制成功', 'copy.svg': '复制班级号',
    'file-text.svg': '作业录入', 'gift.svg': '兑换奖励', 'message-circle.svg': '邀请家长加入',
    'more-horizontal.svg': '打开班级更多操作', 'scan-face.svg': '更新人脸数据', 'shield.svg': '设置兑换密码',
    'sliders-horizontal.svg': '班级显示管理', 'trophy.svg': '排行榜', 'user-plus.svg': '邀请老师加入',
    'users.svg': '学生列表、批量修改、离校学生管理',
  },
  '03-班级/班级更多操作': {
    'check.svg': '班级号复制成功', 'copy.svg': '复制班级号', 'file-text.svg': '作业录入',
    'gift.svg': '兑换奖励', 'message-circle.svg': '邀请家长加入',
    'more-horizontal.svg': '更多操作入口', 'scan-face.svg': '更新人脸数据', 'shield.svg': '设置兑换密码',
    'user-plus.svg': '邀请老师加入', 'users.svg': '批量修改学生、离校学生管理', 'x.svg': '关闭班级更多操作',
  },
  '03-班级/班级详情': {
    'copy.svg': '复制班级号或邀请文案', 'log-out.svg': '退出或解散班级',
    'more-horizontal.svg': '老师更多操作', 'pencil.svg': '编辑家长信息', 'phone.svg': '拨打家长电话',
    'qr-code.svg': '二维码邀请', 'repeat-2.svg': '转移班主任', 'share-2.svg': '发送给微信好友',
    'trash-2.svg': '移除老师或解除家长绑定', 'user-cog.svg': '设置或取消副班主任',
    'user-plus.svg': '邀请老师或家长绑定',
  },
};

const pageDefinitions = [
  { folder: '01-登录/教师登录', roots: ['mobile-app/views/TeacherLoginView.tsx'] },
  { folder: '02-记录/记录首页', roots: ['mobile-app/views/ClassRecordLogView.tsx'], custom: ['voice-onboarding-arrow-solid-gold.svg'] },
  { folder: '02-记录/评价录入', roots: ['mobile-app/views/RecordInputView.tsx', 'mobile-app/components/VirtualKeyboard.tsx'], custom: ['keyboard-shift.svg', 'keyboard-delete.svg'] },
  { folder: '03-班级/班级列表', roots: ['mobile-app/views/ClassListView.tsx'] },
  { folder: '03-班级/班级更多操作', manualIcons: ['copy.svg', 'check.svg', 'more-horizontal.svg', 'chevron-right.svg', 'x.svg', 'file-text.svg', 'gift.svg', 'users.svg', 'scan-face.svg', 'shield.svg', 'user-plus.svg', 'message-circle.svg'] },
  { folder: '03-班级/班级详情', roots: ['mobile-app/views/ClassInfoView.tsx'] },
  { folder: '03-班级/学生列表', roots: ['mobile-app/views/ClassDetailView.tsx'] },
  { folder: '03-班级/班级报告', roots: ['mobile-app/views/ClassReportView.tsx'] },
  { folder: '03-班级/班级排行榜', roots: ['mobile-app/views/ClassLeaderboardView.tsx'] },
  { folder: '03-班级/班级奖励兑换', roots: ['mobile-app/views/reward-verification/RewardVerificationView.tsx'] },
  { folder: '03-班级/更新人脸数据', roots: ['mobile-app/views/face-update/FaceUpdateView.tsx'] },
  { folder: '03-班级/设置兑换密码', roots: ['mobile-app/views/bank-password/BankPasswordView.tsx'] },
  { folder: '03-班级/作业录入', roots: ['mobile-app/views/HomeworkEntryView.tsx'] },
  { folder: '03-班级/批量修改学生', roots: ['mobile-app/views/StudentBatchEditView.tsx'] },
  { folder: '04-学生/学生详情', roots: ['mobile-app/views/DashboardView.tsx'], custom: ['student-detail-clock.svg', 'student-detail-file-text.svg'] },
  { folder: '04-学生/评价记录', roots: ['mobile-app/views/StudentEvaluationRecordsView.tsx'] },
  { folder: '04-学生/基础信息编辑', roots: ['mobile-app/views/StudentBasicEditView.tsx'] },
  { folder: '04-学生/校园币详情', roots: ['mobile-app/views/StudentCoinDetailView.tsx'] },
  { folder: '04-学生/身体测量', roots: ['mobile-app/views/student-growth/StudentBodyMeasurementsView.tsx'] },
  { folder: '04-学生/学生成长档案', roots: ['mobile-app/views/archive-design/StudentArchiveView.tsx'] },
  { folder: '04-学生/采集详情', roots: ['mobile-app/views/student-collection/StudentCollectionRecordDetailView.tsx'] },
  { folder: '04-学生/学期报告', roots: ['mobile-app/views/TermReportView.tsx'], custom: ['term-highlight-delete.svg', 'term-highlight-camera.svg', 'term-highlight-zoom-in.svg', 'term-highlight-add.svg', 'term-highlight-upload.svg', 'term-highlight-gallery.svg'] },
  { folder: '05-我的/我的首页', roots: ['mobile-app/views/MeView.tsx'], custom: ['avatar-camera.svg', 'profile-settings.svg', 'personal-class-source.svg', 'collaboration-class-source.svg', 'school-source.svg', 'school-source-chevron-down.svg', 'questionnaire-todo.svg', 'questionnaire-todo-chevron-right.svg', 'more-subject-management.svg', 'more-department-management.svg', 'more-coin-issuance.svg', 'more-suggestion-feedback.svg', 'more-questionnaire.svg', 'more-archive-design.svg'] },
  { folder: '05-我的/我的文件', roots: ['mobile-app/views/MyFilesView.tsx'] },
  { folder: '05-我的/编辑教师信息', roots: ['mobile-app/views/TeacherProfileEditView.tsx'] },
  { folder: '05-我的/设置', manualIcons: ['shield.svg', 'key-round.svg', 'lock.svg', 'book-open.svg', 'chevron-right.svg'] },
  { folder: '05-我的/科目管理', manualIcons: ['plus.svg', 'edit-3.svg', 'trash-2.svg', 'grip-vertical.svg', 'check.svg', 'x.svg'] },
  { folder: '05-我的/部门管理', manualIcons: ['plus.svg', 'edit-3.svg', 'trash-2.svg', 'check.svg', 'x.svg'] },
  { folder: '05-我的/货币发放', manualIcons: ['check.svg', 'circle-help.svg'] },
  { folder: '05-我的/建议反馈', manualIcons: ['image-plus.svg', 'x.svg', 'check.svg'] },
  { folder: '06-问卷与档案/问卷采集', roots: ['mobile-app/views/questionnaire/QuestionnaireManagementView.tsx'] },
  { folder: '06-问卷与档案/档案设计', roots: ['mobile-app/views/archive-design/ArchiveDesignView.tsx'] },
  { folder: '07-AI助理/班主任助理', roots: ['mobile-app/views/AiHeadteacherAssistantV2View.tsx'] },
  { folder: '07-AI助理/本周行动建议', roots: ['mobile-app/views/WeeklyActionAdviceView.tsx'] },
  { folder: '07-AI助理/往期行动建议', roots: ['mobile-app/views/WeeklyActionAdviceHistoryView.tsx'] },
  { folder: '07-AI助理/教师评价复盘', roots: ['mobile-app/views/TeacherEvaluationReviewView.tsx'] },
  { folder: '07-AI助理/往期评价复盘', roots: ['mobile-app/views/TeacherEvaluationReviewHistoryView.tsx'] },
  { folder: '07-AI助理/校长助理', roots: ['mobile-app/views/AiPrincipalAssistantView.tsx'] },
  { folder: '07-AI助理/学校周月报告', roots: ['mobile-app/views/PrincipalPeriodicReportView.tsx'] },
  { folder: '07-AI助理/学校报告历史', roots: ['mobile-app/views/PrincipalReportHistoryView.tsx'] },
  { folder: '07-AI助理/学校学期报告', roots: ['mobile-app/views/PrincipalTermReportView.tsx'] },
  { folder: '08-数据报表/学生评价报表', roots: ['mobile-app/views/LeaderReportView.tsx'] },
  { folder: '08-数据报表/班级评价报表', roots: ['mobile-app/views/MoralEducationCockpitView.tsx'] },
];

const alwaysCommon = new Set([
  'lucide:chevron-left.svg', 'lucide:chevron-right.svg', 'lucide:chevron-down.svg',
  'lucide:x.svg', 'lucide:check.svg', 'lucide:plus.svg', 'lucide:more-horizontal.svg',
  'lucide:home.svg', 'lucide:file-text.svg', 'lucide:user.svg', 'custom:loading-spinner.svg',
]);

const generatedCustomSvg = {
  'student-detail-clock.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#171513" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>
`,
  'student-detail-file-text.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#171513" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
  <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
</svg>
`,
  'voice-onboarding-arrow-solid-gold.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="72" viewBox="0 0 64 72" fill="none">
  <path d="M29 11L35 56M22 44L35 57L45 41" stroke="#FA9C00" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`,
};

const customSvgCache = new Map();
const collectExistingCustomSvg = (directory) => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectExistingCustomSvg(absolutePath);
    else if (entry.name.endsWith('.svg') && customLabels[entry.name]) {
      customSvgCache.set(entry.name, fs.readFileSync(absolutePath, 'utf8'));
    }
  }
};
collectExistingCustomSvg(outputRoot);

const readCustomSvg = (fileName) => {
  if (generatedCustomSvg[fileName]) return generatedCustomSvg[fileName];
  const cachedSvg = customSvgCache.get(fileName);
  if (!cachedSvg) throw new Error(`Missing source for custom SVG ${fileName}`);
  return cachedSvg;
};

const renderLucideSvg = (exportName) => {
  const Icon = lucideIcons[exportName];
  if (!Icon) throw new Error(`lucide-react does not export ${exportName}`);
  const markup = renderToStaticMarkup(React.createElement(Icon, {
    width: 24,
    height: 24,
    color: '#171513',
    strokeWidth: 2,
  }));
  return `${markup
    .replace(/<([a-z][\w:-]*)([^>]*)><\/\1>/g, '<$1$2 />')
    .replace(/></g, '>\n  <')
    .replace(/\n  <\/svg>$/, '\n</svg>')}\n`;
};

const resolveLocalImport = (fromFile, specifier) => {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [base, ...codeExtensions.map((extension) => `${base}${extension}`), ...codeExtensions.map((extension) => path.join(base, `index${extension}`))];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
};

const sharedIconsPath = path.join(projectRoot, 'mobile-app/components/Icons.tsx');
const sharedIconsSource = fs.readFileSync(sharedIconsPath, 'utf8');
const sharedIconsFile = ts.createSourceFile(sharedIconsPath, sharedIconsSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const lucideLocals = new Map();
const wrapperIcons = new Map();

for (const statement of sharedIconsFile.statements) {
  if (!ts.isImportDeclaration(statement) || statement.moduleSpecifier.text !== 'lucide-react') continue;
  const bindings = statement.importClause?.namedBindings;
  if (bindings && ts.isNamedImports(bindings)) {
    for (const element of bindings.elements) lucideLocals.set(element.name.text, element.propertyName?.text ?? element.name.text);
  }
}

const findWrappedIcon = (node) => {
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) return lucideLocals.get(node.tagName.getText(sharedIconsFile));
  let result;
  ts.forEachChild(node, (child) => { if (!result) result = findWrappedIcon(child); });
  return result;
};

for (const statement of sharedIconsFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
    const iconName = findWrappedIcon(declaration.initializer);
    if (iconName) wrapperIcons.set(declaration.name.text, iconName);
  }
}

const collectDependencies = (roots) => {
  const visited = new Set();
  const queue = roots.map((root) => path.join(projectRoot, root));
  while (queue.length) {
    const file = queue.pop();
    if (!file || visited.has(file) || !fs.existsSync(file)) continue;
    visited.add(file);
    if (!codeExtensions.includes(path.extname(file))) continue;
    const source = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      const dependency = resolveLocalImport(file, statement.moduleSpecifier.text);
      if (dependency && dependency.startsWith(projectRoot) && !dependency.includes('.test.')) queue.push(dependency);
    }
  }
  return visited;
};

const collectIcons = (files) => {
  const icons = new Set();
  for (const file of files) {
    if (!codeExtensions.includes(path.extname(file)) || file === sharedIconsPath) continue;
    const source = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const imports = [];
    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      const moduleName = statement.moduleSpecifier.text;
      if (moduleName === 'lucide-react') {
        for (const element of bindings.elements) {
          if (!statement.importClause?.isTypeOnly && !element.isTypeOnly) imports.push({ local: element.name.text, exportName: element.propertyName?.text ?? element.name.text });
        }
      } else if (/(?:^|\/)components\/Icons$|(?:^|\/)Icons$/.test(moduleName)) {
        for (const element of bindings.elements) {
          const wrapperName = element.propertyName?.text ?? element.name.text;
          const exportName = wrapperIcons.get(wrapperName);
          if (exportName) imports.push({ local: element.name.text, exportName });
        }
      }
    }
    const localNames = new Set(imports.map((entry) => entry.local));
    const usedLocals = new Set();
    const visit = (node) => {
      if (ts.isIdentifier(node) && localNames.has(node.text)) {
        let parent = node.parent;
        let insideImport = false;
        while (parent && parent !== sourceFile) {
          if (ts.isImportDeclaration(parent)) { insideImport = true; break; }
          parent = parent.parent;
        }
        if (!insideImport) usedLocals.add(node.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    for (const entry of imports) if (usedLocals.has(entry.local)) icons.add(aliasMap[entry.exportName] ?? entry.exportName);
  }
  return icons;
};

const lucideExportByFileName = new Map();
for (const exportName of Object.keys(lucideIcons)) {
  const canonicalName = aliasMap[exportName] ?? exportName;
  lucideExportByFileName.set(`${toKebabCase(canonicalName)}.svg`, canonicalName);
}

const pages = pageDefinitions.map((page) => {
  const resources = new Map();
  const addLucide = (exportName) => {
    const canonicalName = aliasMap[exportName] ?? exportName;
    const fileName = `${toKebabCase(canonicalName)}.svg`;
    resources.set(`lucide:${fileName}`, {
      key: `lucide:${fileName}`,
      fileName,
      exportName: canonicalName,
      label: pageSpecificLabels[page.folder]?.[fileName]
        ?? iconLabels[fileName]
        ?? `Lucide：${fileName.replace('.svg', '')}`,
      type: 'Lucide SVG',
    });
  };

  for (const fileName of page.manualIcons ?? []) {
    const exportName = lucideExportByFileName.get(fileName);
    if (!exportName) throw new Error(`Cannot resolve Lucide file ${fileName}`);
    addLucide(exportName);
  }
  if (page.roots) {
    for (const exportName of collectIcons(collectDependencies(page.roots))) addLucide(exportName);
  }
  for (const fileName of page.custom ?? []) {
    resources.set(`custom:${fileName}`, {
      key: `custom:${fileName}`,
      fileName,
      label: customLabels[fileName] ?? fileName,
      type: '页面专用 SVG',
    });
  }
  return { ...page, resources };
});

const usageByResource = new Map();
for (const page of pages) {
  for (const resource of page.resources.values()) {
    const usage = usageByResource.get(resource.key) ?? { resource, pages: [] };
    usage.pages.push(page.folder);
    usageByResource.set(resource.key, usage);
  }
}

for (const key of alwaysCommon) {
  if (usageByResource.has(key)) continue;
  const [type, fileName] = key.split(':');
  if (type === 'lucide') {
    const exportName = lucideExportByFileName.get(fileName);
    if (!exportName) throw new Error(`Cannot resolve common Lucide file ${fileName}`);
    usageByResource.set(key, {
      resource: { key, fileName, exportName, label: iconLabels[fileName] ?? fileName, type: 'Lucide SVG' },
      pages: [],
    });
  } else {
    usageByResource.set(key, {
      resource: { key, fileName, label: customLabels[fileName] ?? fileName, type: '通用 SVG' },
      pages: [],
    });
  }
}

const isCommonResource = (key) => alwaysCommon.has(key) || usageByResource.get(key).pages.length > 1;
const writeResource = (resource, destination) => {
  if (resource.key.startsWith('lucide:')) {
    fs.writeFileSync(destination, renderLucideSvg(resource.exportName));
  } else if (resource.key.startsWith('custom:')) {
    fs.writeFileSync(destination, readCustomSvg(resource.fileName));
  }
};

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(commonRoot, { recursive: true });

const commonRows = [];
for (const { resource, pages: usedPages } of usageByResource.values()) {
  if (!isCommonResource(resource.key)) continue;
  writeResource(resource, path.join(commonRoot, resource.fileName));
  commonRows.push({ ...resource, usedPages });
}

fs.writeFileSync(path.join(commonRoot, 'README.md'), [
  '# 公共图标',
  '',
  '被多个业务页面复用的图标统一存放在这里，避免同一文件重复保存。各页面的 `README.md` 已给出可直接使用的相对路径。',
  '',
  '| 文件 | 通用用途 | 使用页面 | 类型 |',
  '| --- | --- | --- | --- |',
  ...commonRows
    .sort((left, right) => left.fileName.localeCompare(right.fileName))
    .map((row) => `| \`${row.fileName}\` | ${row.label} | ${row.usedPages.length ? row.usedPages.join('、') : '全局备用'} | ${row.type} |`),
  '',
].join('\n'));

const overview = [];
for (const page of pages) {
  const pageDirectory = path.join(outputRoot, page.folder);
  fs.mkdirSync(pageDirectory, { recursive: true });
  const rows = [];
  for (const resource of page.resources.values()) {
    const common = isCommonResource(resource.key);
    const destination = common ? path.join(commonRoot, resource.fileName) : path.join(pageDirectory, resource.fileName);
    if (!common) writeResource(resource, destination);
    rows.push({
      ...resource,
      relativePath: path.relative(pageDirectory, destination).split(path.sep).join('/'),
      common,
    });
  }

  const pageName = page.folder.split('/').at(-1);
  fs.writeFileSync(path.join(pageDirectory, 'README.md'), [
    `# ${pageName}图标`,
    '',
    `这里列出“${pageName}”页面及其弹窗、抽屉和复用子组件实际使用的图标。公共图标只在公共目录保存一份。`,
    '',
    '| 资源路径 | 页面用途 | 存放位置 | 类型 |',
    '| --- | --- | --- | --- |',
    ...rows
      .sort((left, right) => left.fileName.localeCompare(right.fileName))
      .map((row) => `| \`${row.relativePath}\` | ${row.label} | ${row.common ? '公共图标' : '本页面'} | ${row.type} |`),
    '',
  ].join('\n'));
  overview.push({ folder: page.folder, count: rows.length });
}

fs.writeFileSync(path.join(outputRoot, 'README.md'), [
  '# 教师手机端按页面图标目录',
  '',
  '开发先进入对应的中文页面文件夹查看 `README.md`。页面独有图标保存在页面文件夹；跨页面复用图标统一保存在 `00-公共图标`，同一图标文件全局只保留一份。',
  '',
  '| 页面目录 | 页面所需图标数 |',
  '| --- | ---: |',
  ...overview.map((item) => `| \`${item.folder}\` | ${item.count} |`),
  '',
  `公共目录当前包含 ${commonRows.length} 个共享图标。页面所需图标数是引用关系，不代表重复文件数。`,
  '',
].join('\n'));

for (const duplicateDirectory of ['lucide', 'custom-svg', 'image-icons']) {
  fs.rmSync(path.join(packageRoot, duplicateDirectory), { recursive: true, force: true });
}
fs.copyFileSync(
  path.join(projectRoot, 'node_modules/lucide-react/LICENSE'),
  path.join(packageRoot, 'LUCIDE_LICENSE'),
);

const uniqueFileCount = usageByResource.size;
fs.writeFileSync(path.join(packageRoot, 'README.md'), [
  '# 教师手机端图标资源',
  '',
  '本目录是提供给 Vue 开发的教师手机端图标交付包，不需要安装 React 或 `lucide-react`。',
  '',
  '请从 `by-page/` 进入对应中文业务页面。每个页面的 `README.md` 都写明“资源路径 → 页面用途”；公共图标只在 `by-page/00-公共图标/` 保存一份。',
  '',
  `当前共 ${uniqueFileCount} 个唯一 SVG 图标文件，覆盖 ${pages.length} 个业务页面目录。`,
  '',
  'SVG 可以在 Vue 中直接作为图片引用。需要跟随文字颜色时，可内联 SVG 并把根节点的 `stroke` 改为 `currentColor`。',
  '',
  '本目录不重复收录 PNG、JPG、页面背景、头像、空状态插画、活动照片、AI（人工智能）角色图片和动态绘制图表；这些图片继续使用项目既有资源。',
  '',
].join('\n'));

console.log(`Generated ${pages.length} page folders with ${uniqueFileCount} unique icon files in ${path.relative(projectRoot, outputRoot)}`);
