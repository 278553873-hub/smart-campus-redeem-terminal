import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ParentBankFeaturePreviewControls.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (target, text, message) => {
  if (!target.includes(text)) failures.push(message ?? `缺少：${text}`);
};

requireText(source, '积分银行功能开放', '预览卡片标题应直接说明配置对象。');
requireText(source, "label: '开放'", '预览卡片应提供开放状态。');
requireText(source, "label: '未开放'", '预览卡片应提供未开放状态。');
requireText(source, 'aria-pressed={selected}', '开放状态切换应提供可访问的选中语义。');
requireText(appSource, '<ParentBankFeaturePreviewControls', '家长端演示区必须挂载积分银行开放配置卡。');
requireText(appSource, 'parentBankFeatureEnabled={parentBankFeatureEnabled}', '积分银行开放状态必须传入家长端。');
requireText(parentSource, '{parentBankFeatureEnabled && <div', '未开放时必须隐藏货柜机兑换凭证。');
requireText(parentSource, 'if (!activeChild || !parentBankFeatureEnabled) return null;', '未开放时成长币与预计可得一体卡应整体隐藏。');
requireText(parentSource, 'const GrowthBankEntry = () => {', '成长币入口应作为学生卡片下方的独立板块。');
requireText(parentSource, 'if (!activeChild || !parentBankFeatureEnabled) return null;', '未开放时必须隐藏成长币与积分银行入口。');
requireText(parentSource, '<GrowthChildProfileCard />\n        <GrowthBankEntry />\n        <GrowthSummaryCards />', '开放时成长币应位于学生卡片下方、总分卡片上方。');
requireText(parentSource, "if (screen === 'bank') setScreen('growth');", '关闭功能时必须退出积分银行页。');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent bank feature preview assertions passed');
