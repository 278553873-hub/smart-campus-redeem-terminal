import fs from 'node:fs';

const source = fs.readFileSync(new URL('./SchoolPcLogin.tsx', import.meta.url), 'utf8');
const portal = fs.readFileSync(new URL('./SaaSPortal.tsx', import.meta.url), 'utf8');
const scan = fs.readFileSync(new URL('./SchoolPcScanLogin.tsx', import.meta.url), 'utf8');

const requiredSnippets = [
  'if (!credential.trim())',
  'if (!requirePhone()) return',
  '演示登录可使用任意手机号和密码。',
  '演示登录可使用任意手机号和验证码。',
  'onClick={getDemoCode}',
  "const [view, setView] = useState<LoginView>('scan')",
  'if (isSchoolAdministrator && isPassword)',
  "setView('verify')",
  '管理员登录，双重验证',
  '账号密码校验通过，为保障系统安全，请扫码完成二次验证',
  'onVerified={isVerifying ? completeVerification : undefined}',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`PC 端演示登录缺少预期实现：${snippet}`);
  }
}

if (source.includes('DEMO_VERIFICATION_CODE') || !scan.includes('const scanSeconds = 300')) {
  throw new Error('学校电脑端演示应接受任意验证码，并保留 300 秒扫码倒计时。');
}

if (!portal.includes("isSchoolAdministrator={teacherProfile.role === '学校管理员'}") || !portal.includes('onLoginSuccess(/[一-龥]/.test(trimmed)')) {
  throw new Error('学校电脑端应使用新登录页并保留演示教师名称处理。');
}

console.log('SaaS portal demo login assertions passed');
