import fs from 'node:fs';

const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const record = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');
const leader = fs.readFileSync('mobile-app/views/LeaderReportView.tsx', 'utf8');

const failures = [];

if (!leader.includes('h-[44px]')) {
  failures.push('对照页“学校数据报表”顶部栏不是 44px，无法作为对齐基准。');
}

if (!app.includes('h-11 flex items-center justify-between px-4 sticky top-0')) {
  failures.push('通用 LocalHeader 应统一为 44px 高度，并使用 16px 横向边距。');
}

if (app.includes("sticky top-0 z-[45] backdrop-blur-md") && app.includes("'bg-white/38 border-b")) {
  failures.push('通用 LocalHeader 不应保留底部分隔线，应依靠毛玻璃与内容自然分层。');
}

if (app.includes('className="h-14 flex items-center justify-between px-6 bg-white/80')) {
  failures.push('通用 LocalHeader 仍为 56px，会导致“我的班级”标题低于微信胶囊中心。');
}

if (!record.includes('min-h-11 flex-1') || !record.includes('min-h-11 shrink-0')) {
  failures.push('记录页顶部模式和指标入口应使用至少 44px 的稳定触控高度。');
}

if (record.includes('h-[50px] flex items-center gap-2 pl-4 pr-[132px]')) {
  failures.push('记录页顶部切换栏仍为 50px。');
}

if (!record.includes('pt-2')) {
  failures.push('记录页关闭模拟真实手机效果时缺少顶部呼吸空间。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('mobile header alignment assertions passed');
