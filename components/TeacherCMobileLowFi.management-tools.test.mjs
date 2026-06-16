import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const prd = fs.readFileSync(new URL('../docs/PRD-ToC个人教师自助开通改造.md', import.meta.url), 'utf8');

function requireText(text, message) {
  if (!source.includes(text)) throw new Error(message);
}

function requirePrd(text, message) {
  if (!prd.includes(text)) throw new Error(message);
}

requireText("| 'schoolUsageReport'", '教师端页面枚举应新增学校数据报表页。');
requireText("if (pageKey === 'schoolUsageReport') return '18';", '学校数据报表页应编号为 18。');
requireText("modules: ['教师卡片', '头像', '姓名', '编辑按钮', '了解学校版', '学校基础信息', '管理工具', '学校数据报表', '生成期末报告'", '14A 应包含管理工具板块。');
requireText("modules: ['教师卡片', '头像', '姓名', '编辑按钮', '当前版本入口', '学校基础信息', '管理工具', '学校数据报表', '生成期末报告'", '14B 应包含管理工具板块。');
requireText('className="relative rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"', '教师信息卡片应使用低保真灰阶卡片质感。');
requireText('className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg font-black text-gray-800"', '教师头像应使用灰阶底色形成头像占位。');
requireText('className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"', '管理工具卡片应与教师信息卡片保持同样卡片效果。');
requireText('<div className="text-sm font-black">管理工具</div>', '管理工具标题应与学校基础信息标题字号字重一致。');
const mineRenderStart = source.indexOf("if (page === 'minePersonal' || page === 'mineSchool')");
const mineRenderEnd = source.indexOf("if (page === 'termManagement')", mineRenderStart);
const mineRender = source.slice(mineRenderStart, mineRenderEnd);
if (mineRender.includes('<Shield size={18} className="text-gray-500" />')) {
  throw new Error('管理工具标题不应显示自己的 icon。');
}
if (mineRender.indexOf('管理工具') > mineRender.indexOf('学校基础信息')) {
  throw new Error('管理工具应展示在学校基础信息上方。');
}
requireText("onClick={() => navigate('schoolUsageReport')}", '学校数据报表入口应进入 18 学校数据报表页。');
requireText('onClick={openFinalReportConfirmSheet}', '生成期末报告入口应先打开二次确认弹窗。');
requireText('className="mt-3 grid grid-cols-2 gap-2"', '管理工具入口应采用横向重点操作布局。');
requireText('className="flex min-h-[86px] flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left active:bg-gray-100"', '管理工具两个入口应使用低保真灰阶重点操作样式。');
if (mineRender.includes('cyan-') || mineRender.includes('indigo-') || mineRender.includes('18,184,203') || mineRender.includes('79,70,229')) {
  throw new Error('低保真原型的管理工具不应使用彩色视觉样式。');
}
requireText('<span className="text-sm font-black leading-5">生成期末报告</span>', '生成期末报告入口不应被处理成强 CTA。');
if (mineRender.includes('bg-gray-900 px-1.5 py-0.5 text-[10px] leading-none text-white')) {
  throw new Error('生成期末报告入口不应使用黑色确认标签抢层级。');
}
if (source.includes('className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-gray-900 bg-gray-950 p-3 text-left text-white active:bg-gray-800"')) {
  throw new Error('生成期末报告不应使用黑底强 CTA 卡片样式。');
}
requireText('const renderFinalReportConfirmSheet = () =>', '应有生成期末报告二次确认弹窗。');
requireText('aria-label="确认生成期末报告"', '二次确认弹窗应具备明确语义标签。');
requireText('学生日常行为已录入完成', '二次确认应确认学生日常行为已录入完成。');
requireText('需要展示成绩时，成绩已录入完成', '二次确认应确认成绩已录入完成。');
requireText('const canSubmit = finalReportBehaviorConfirmed && finalReportScoreConfirmed;', '两个确认项都勾选后才允许生成。');
requireText("showClassActionToast('报告排队生成中');", '确认生成后应 toast 提示报告排队生成中。');
requireText("if (page === 'schoolUsageReport')", '应渲染学校数据报表页。');
requireText('使用趋势', '学校数据报表页应展示使用趋势。');
requireText('<PageNodeButton item="schoolUsageReport" lane={lane.title} />', '页面导航地图应展示 18 学校数据报表节点。');

requirePrd('管理工具卡片 → 14A 和 14B 都展示，包含学校数据报表、生成期末报告', 'PRD 应说明 14A/14B 都展示管理工具。');
requirePrd('生成期末报告 → 二次确认学生日常行为已录入完成；如报告需要展示成绩，确认所有成绩已录入完成；确认后发送生成请求并提示“报告排队生成中”', 'PRD 应说明生成期末报告确认链路。');

console.log('TeacherCMobileLowFi 管理工具结构测试通过');
