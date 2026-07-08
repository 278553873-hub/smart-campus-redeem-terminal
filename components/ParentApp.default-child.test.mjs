import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

requireText(parentSource, 'defaultHasBoundChild?: boolean;', '家长端应保留可配置的默认绑定状态，方便演示和未绑定流程复用。');
requireText(parentSource, 'defaultHasBoundChild = true', 'demo 导航进入家长端时应默认模拟已有孩子。');
requireText(parentSource, "useState<Screen>(() => defaultHasBoundChild ? 'growth' : 'binding')", '已有孩子默认应进入成长页，未绑定配置才进入绑定页。');
requireText(parentSource, "createDemoChild('郑小磊', 'BS2024', '20250101', 0)", '已有孩子默认态应初始化第一个演示孩子资料。');
requireText(parentSource, "createDemoChild('林小满', 'BS2024', '20250102', 1, { canViewArchive: true })", '已有孩子默认态应初始化第二个带档案演示孩子。');
requireText(parentSource, 'canViewArchive: Boolean(options.canViewArchive)', '演示孩子应通过参数控制是否展示档案入口。');
requireText(parentSource, "const [bindForm, setBindForm] = useState({ schoolCode: '', studentName: '', studentNo: '' })", '绑定表单流程仍需保留。');
requireText(parentSource, 'openBinding', '切换孩子中的新增绑定入口仍需保留。');
requireText(appSource, '<ParentApp showPhoneShell={showParentPhoneShell} />', 'demo 导航仍应使用家长端默认配置进入。');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent default child assertions passed');
