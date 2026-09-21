import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const sheetSource = readFileSync(new URL('./parent-app/ParentExchangePasswordSheet.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? '缺少：' + text);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message ?? '不应出现：' + text);
};

// 家长端页面：入口、数据归属与回调
requireText(parentSource, 'exchangePassword: string;', '兑换密码必须归属于具体孩子，不能使用家长级全局密码。');
requireText(parentSource, '>兑换密码</span>', '成长页孩子卡片应提供简洁的兑换密码入口。');
requireText(parentSource, '>••••••</span>', '成长页必须用固定六位掩码表示系统初始密码。');
requireText(parentSource, 'openExchangePasswordSheet(activeChild)', '兑换密码入口必须绑定当前孩子。');
requireText(parentSource, 'isValidExchangePassword(nextPassword)', '保存前必须校验6位数字密码。');
requireText(parentSource, "setSubmitSuccessMessage('兑换密码已更新')", '保存成功后应提供清晰反馈。');
requireText(parentSource, 'Boolean(exchangePasswordChildId)', '兑换密码抽屉打开时应隐藏底部导航。');
requireText(parentSource, '<ExchangePasswordSheet />', '家长端页面必须挂载兑换密码抽屉。');
requireText(parentSource, 'parentBankFeatureEnabled &&', '未开放积分银行时必须隐藏兑换凭证入口和预计可得模块。');
requireText(parentSource, "import { ParentExchangePasswordSheet } from './parent-app/ParentExchangePasswordSheet';", '兑换密码抽屉必须抽成独立组件。');
requireText(parentSource, 'onSave={saveExchangePassword}', '抽屉保存必须通过回调交回家长端更新数据。');
forbidText(parentSource, 'exchangePasswordDraft', '密码草稿不得留在家长端根组件：每输入一位都会重渲染整页，手机会卡。');
forbidText(parentSource, 'exchangePasswordVisible', '密码明文状态应由抽屉自己维护。');
forbidText(parentSource, 'exchangePasswordEditing', '密码编辑态应由抽屉自己维护。');
forbidText(parentSource, '货柜机兑换密码', '兑换密码入口应精简为“兑换密码”，不应包含底层硬件称谓。');
forbidText(parentSource, '>查看 / 修改<', '兑换密码入口不应保留冗余的查看/修改文字。');
forbidText(parentSource, '>查看/修改<', '兑换密码入口不应保留冗余的查看/修改文字。');
forbidText(parentSource, '给孩子在货柜机使用', '兑换密码入口不应保留重复用途备注。');
forbidText(parentSource, "activeChild.exchangePassword ? '已设置' : '待设置'", '系统必然存在初始密码，不应展示设置状态。');

// 抽屉组件：状态自持、交互与高度
requireText(sheetSource, 'const [draft, setDraft] = useState', '输入草稿必须由抽屉自己维护，家长输入时只重渲染抽屉。');
requireText(sheetSource, 'sanitizeExchangePassword(event.target.value)', '密码输入应过滤非数字并限制长度。');
requireText(sheetSource, 'isValidExchangePassword(draft)', '保存前必须校验6位数字密码。');
requireText(sheetSource, "setError('请输入6位数字密码')", '密码位数不足时必须给出明确提示。');
requireText(sheetSource, 'maskExchangePassword(shownPassword)', '兑换密码默认应掩码展示。');
requireText(sheetSource, "import { PasswordRevealButton } from '../../mobile-app/components/ui/PasswordRevealButton';", '密码显隐必须复用公共组件，避免各端把睁眼闭眼图标写反。');
requireText(sheetSource, '<PasswordRevealButton', '兑换密码展示行应使用公共密码显隐按钮。');
requireText(sheetSource, 'strokeWidth={2.5}', '兑换密码展示行的眼睛图标线宽应保持 2.5。');
forbidText(sheetSource, '新的6位密码', '文案统一为“6位数字密码”。');
forbidText(sheetSource, '当前密码', '文案统一为“6位数字密码”。');
forbidText(sheetSource, 'maxLength', '密码输入框不再依赖 maxLength 限长，避免满 6 位后删不掉。');
forbidText(sheetSource, 'exchangePasswordChild', '家长端绝大多数只有一个孩子，弹窗不展示学生姓名，保持页面精简。');
forbidText(sheetSource, 'autoFocus', '切换查看/修改态时不应自动聚焦，避免键盘弹起带动弹窗位移。');
forbidText(sheetSource, 'min-h-5', '错误提示不应独占一行占位，否则切换态时弹窗会被撑高。');
forbidText(sheetSource, 'focus:ring', '手机端密码输入框聚焦时不应加焦点环，只保留光标。');
forbidText(sheetSource, 'focus:border', '手机端密码输入框聚焦时不应改变边框颜色，只保留光标。');

const sixDigitLabelCount = sheetSource.split('>6位数字密码</span>').length - 1;
if (sixDigitLabelCount !== 1) failures.push('密码文案只保留一处“6位数字密码”，在标题行左侧统一展示。');

if (!sheetSource.includes('h-[52px] w-full') || !sheetSource.includes('flex min-h-[52px]')) {
  failures.push('输入框与密码展示行高度必须一致（52px），切换态时抽屉高度才不会跳动。');
}

if (sheetSource.split('rounded-[var(--pm-radius-field)]').length - 1 !== 3) {
  failures.push('密码输入框、展示框与框内按钮都必须使用 8px 的字段圆角令牌 --pm-radius-field。');
}

if (!sheetSource.includes('请输入密码')) {
  failures.push('密码输入框应保留简洁的提示文案。');
}

if (!sheetSource.includes('pointer-events-none absolute inset-y-0 left-4 flex items-center')) {
  failures.push('提示文案必须用与输入框等高的居中层渲染，否则小字号文案不会上下居中。');
}

if (!sheetSource.includes('px-4 text-[length:var(--pm-font-size-page-title)]')) {
  failures.push('输入文字必须左对齐，并保持页面标题字号。');
}

forbidText(sheetSource, 'placeholder', '提示文案不得再用原生占位符：小字号挂在输入文字的基线上，看起来上下没有居中。');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent exchange password assertions passed');
