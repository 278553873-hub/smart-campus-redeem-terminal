import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const sectionStart = source.indexOf("{/* 设备基础配置 */}");
const sectionEnd = source.indexOf("{/* 角色管理 */}", sectionStart);

if (sectionStart === -1 || sectionEnd === -1) {
  throw new Error('未找到设备基础配置页面片段');
}

const section = source.slice(sectionStart, sectionEnd);
const mainShell = source.slice(source.indexOf('<main'), source.indexOf('{/* 货币发放管理', source.indexOf('<main')));

const requiredSnippets = [
  'w-full font-sans text-sm text-[#4E5969] px-6 py-5 flex flex-col gap-4',
  'bg-[#FFFFFF] rounded border border-[#E5E6EB] p-6',
  'm-0 text-base font-semibold leading-[24px] text-[#1D2129] mb-5">设备基础配置',
  'grid grid-cols-[96px_1fr_96px_1fr]',
  '<table className="w-full border-collapse text-left text-sm font-normal text-[#4E5969]"',
  'className="h-12 px-4 border-b border-[#E5E6EB] font-semibold min-w-[160px]"',
  'h-8 rounded border border-[#E5E6EB]',
  'h-8 rounded border-0 bg-[#165DFF] px-4 text-sm font-normal text-white'
];

const forbiddenSnippets = [
  'max-w-5xl',
  'rounded-lg border border-[#E5E6EB]',
  'rounded-[2rem]',
  'rounded-2xl',
  'text-2xl font-black',
  'hover:scale',
  'shadow-md',
  'shadow-sm',
  'MonitorSmartphone',
  'Sparkles size',
  '终端设备及首页配置',
  '配置货柜终端首页展示文案',
  '系统全局所用货币图标，可采用各校个性化设计样式',
  '终端首页入口',
  'w-[108px]',
  'h-12 items-center'
];

for (const snippet of requiredSnippets) {
  if (!section.includes(snippet)) {
    throw new Error(`设备基础配置缺少 PC 规范片段：${snippet}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (section.includes(snippet)) {
    throw new Error(`设备基础配置仍包含旧布局、重复标题或无效说明：${snippet}`);
  }
}

if (!mainShell.includes("activeMenu === '考试数据' || activeMenu === '作业数据' || activeMenu === '设备基础配置'")) {
  throw new Error('设备基础配置应与考试数据使用同样的内容区边距规则');
}

if (!mainShell.includes("activeMenu !== '考试数据' && activeMenu !== '作业数据' && activeMenu !== '设备基础配置'")) {
  throw new Error('设备基础配置不应再渲染页面外标题');
}
