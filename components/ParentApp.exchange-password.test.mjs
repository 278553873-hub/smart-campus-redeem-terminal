import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (text, message) => {
  if (!parentSource.includes(text)) failures.push(message ?? `缺少：${text}`);
};

const forbidText = (text, message) => {
  if (parentSource.includes(text)) failures.push(message ?? `不应出现：${text}`);
};

requireText('exchangePassword: string;', '兑换密码必须归属于具体孩子，不能使用家长级全局密码。');
requireText('>兑换密码</span>', '成长页孩子卡片应提供简洁的兑换密码入口。');
requireText('>••••••</span>', '成长页必须用固定六位掩码表示系统初始密码。');
requireText('openExchangePasswordSheet(activeChild)', '兑换密码入口必须绑定当前孩子。');
requireText('maskExchangePassword(password)', '兑换密码默认应掩码展示。');
requireText('sanitizeExchangePassword(event.target.value)', '密码输入应过滤非数字并限制长度。');
requireText('isValidExchangePassword(nextPassword)', '保存前必须校验6位数字密码。');
requireText("setSubmitSuccessMessage('兑换密码已更新')", '保存成功后应提供清晰反馈。');
requireText('Boolean(exchangePasswordChildId)', '兑换密码抽屉打开时应隐藏底部导航。');
requireText('<ExchangePasswordSheet />', '家长端页面必须挂载兑换密码抽屉。');
requireText('parentBankFeatureEnabled &&', '未开放积分银行时必须隐藏兑换凭证入口和预计可得模块。');
forbidText('货柜机兑换密码', '兑换密码入口应精简为“兑换密码”，不应包含底层硬件称谓。');
forbidText('>查看 / 修改<', '兑换密码入口不应保留冗余的查看/修改文字。');
forbidText('>查看/修改<', '兑换密码入口不应保留冗余的查看/修改文字。');
forbidText('给孩子在货柜机使用', '兑换密码入口不应保留重复用途备注。');
forbidText("activeChild.exchangePassword ? '已设置' : '待设置'", '系统必然存在初始密码，不应展示设置状态。');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent exchange password assertions passed');
