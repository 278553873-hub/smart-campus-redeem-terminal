import { readFileSync } from 'node:fs';

const previewSource = readFileSync(new URL('./TerminalLoginMethodPreviewControls.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const failures = [];

if (previewSource.includes('<legend') || previewSource.includes('<fieldset')) {
  failures.push('登录方式预览不应使用 legend/fieldset，避免标题与边框发生穿模。');
}

if (!previewSource.includes('<h2 className="mb-3') || !previewSource.includes('登录方式预览</h2>')) {
  failures.push('登录方式预览标题应完整放在卡片内容区内。');
}

if (!previewSource.includes('grid grid-cols-3') || !previewSource.includes('whitespace-nowrap')) {
  failures.push('三种预览方式应使用横向三段控件，并禁止选项文字换行。');
}

for (const label of ['仅人脸', '仅密码', '两种方式']) {
  if (!previewSource.includes(`label: '${label}'`)) {
    failures.push(`登录方式预览缺少“${label}”选项。`);
  }
}

if (!appSource.includes("useState<StudentLoginPreviewMode>('password-only')")) {
  failures.push('货柜机登录方式预览应默认选择“仅密码”。');
}

if (appSource.includes('key={studentLoginPreviewMode}')) {
  failures.push('切换登录方式预览不应重新挂载货柜机页面，避免没有页面切换却触发右滑入场动画。');
}

if (!appSource.includes('[data-preview-anchor="terminal-device"]') || !appSource.includes('deviceRight + gap') || !appSource.includes('max-[1050px]:right-16')) {
  failures.push('登录方式预览应根据货柜机实际渲染右边界定位，并在窄屏下与 DEMO 环境切换把手保留明确间距。');
}

if (!previewSource.includes('shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]') || !previewSource.includes('min-h-9') || !previewSource.includes('leading-tight')) {
  failures.push('登录方式预览的卡片阴影、选项高度和文字行高应与家长手机端预览保持一致。');
}

if (!previewSource.includes('relative hidden max-[1050px]:block') || !previewSource.includes('absolute right-0 top-[52px]')) {
  failures.push('窄屏登录方式预览的展开层应与右侧入口对齐。');
}

if (!appSource.includes("const TERMINAL_ENTRY_BUTTON_BASE = 'h-[72px]")) {
  failures.push('终端入口按钮未统一固定为 72px 高度。');
}

if (!appSource.includes('text-center px-10 pt-16 pb-20')) {
  failures.push('不同登录方式下，欢迎页按钮组应保留更充足的底部安全间距。');
}

for (const action of ['刷脸登录', '密码登录', '查看商品']) {
  if (!appSource.includes(`<span>${action}</span>`)) {
    failures.push(`终端登录页缺少“${action}”入口。`);
  }
}

if (!appSource.includes('TERMINAL_ENTRY_BUTTON_PRIMARY') || !appSource.includes('TERMINAL_ENTRY_BUTTON_SECONDARY') || !appSource.includes('TERMINAL_ENTRY_BUTTON_TERTIARY')) {
  failures.push('三个入口应共享尺寸，并仅以主、次、三级样式区分。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('terminal login preview control assertions passed');
