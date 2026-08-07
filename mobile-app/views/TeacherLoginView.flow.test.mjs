import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const mobileAppDir = path.resolve(testDir, '..');
const loginSource = readFileSync(path.join(testDir, 'TeacherLoginView.tsx'), 'utf8');
const appSource = readFileSync(path.join(mobileAppDir, 'App.tsx'), 'utf8');
const assetSource = readFileSync(path.join(mobileAppDir, 'assets/images.ts'), 'utf8');
const tokenSource = readFileSync(path.join(mobileAppDir, 'styles/teacherMobileTokens.ts'), 'utf8');
const loginIconPath = path.join(mobileAppDir, 'assets/resources/teacher-login-icon.jpg');

assert.match(appSource, /const \[isAuthenticated, setIsAuthenticated\] = useState\(true\)/, '教师端应持有明确的登录态。');
assert.match(appSource, /const handleTeacherLogout = \(\) => \{[\s\S]*resetAuthenticatedNavigation\(\);[\s\S]*setIsAuthenticated\(false\);[\s\S]*\};/, '退出登录应先清理导航状态，再切换到未登录态。');
assert.match(appSource, /setHistory\(\[\]\);[\s\S]*setCurrentView\('home_log'\);/, '退出或登录时应重置历史栈与落地页。');
assert.match(appSource, /<MineSettingsView onLogout=\{handleTeacherLogout\} \/>/, '设置页退出按钮应接入真实退出处理。');
assert.doesNotMatch(appSource, /退出登录功能演示中/, '教师端不应保留退出登录演示提示。');

assert.match(loginSource, />\s*微信登录\s*<\/button>/, '登录页应把微信登录作为主操作。');
assert.match(loginSource, />最近登录<[\s\S]*>190\*\*\*\*0000</, '登录页应在最近登录文案下方展示较小字号的脱敏手机号。');
assert.match(loginSource, /loginWithRecentAccount[\s\S]*请先阅读并同意隐私保护指引[\s\S]*completeLogin\(\)/, '最近登录应校验协议后直接登录。');
assert.match(loginSource, /手机号登录\/注册/, '登录页应提供手机号登录或注册。');
assert.match(loginSource, /header=\{\([\s\S]*aria-label="关闭手机号登录"/, '手机号登录弹窗应隐藏重复标题，仅保留关闭入口。');
assert.match(loginSource, /验证码登录/, '手机号底部弹窗应支持验证码登录。');
assert.match(loginSource, /密码登录/, '手机号底部弹窗应支持密码登录。');
assert.match(loginSource, /MobileBottomSheet/, '登录低频能力应复用统一底部弹窗。');
assert.match(loginSource, /请先阅读并同意隐私保护指引/, '登录前应校验隐私协议确认。');
assert.match(loginSource, /min-h-12/, '登录主操作应提供足够的触控高度。');
assert.match(loginSource, /var\(--tm-brand-primary\)/, '登录页应使用教师端设计 Token。');
assert.match(loginSource, /h-\[84px\] w-\[84px\].*rounded-\[var\(--tm-radius-inner\)\]/, '登录视觉资源应以小尺寸圆角方形产品 Icon 展示。');
assert.match(loginSource, /wechatLoginButtonClass = '[^']*max-w-\[300px\][^']*rounded-full/, '微信登录主按钮应适度加宽并使用全圆角。');
assert.match(loginSource, /wechatLoginButtonClass = '[^']*bg-\[var\(--tm-platform-wechat\)\]/, '微信登录按钮应使用微信平台色 Token。');
assert.match(loginSource, /recentLoginButtonClass = '[^']*flex-col[^']*bg-\[var\(--tm-brand-primary\)\]/, '最近登录按钮应使用品牌红并纵向排列文案。');
assert.match(loginSource, /wechatLoginButtonClass = '[^']*h-14/, '微信登录按钮高度应为 56px。');
assert.match(loginSource, /recentLoginButtonClass = '[^']*h-14/, '最近登录按钮高度应为 56px。');
assert.match(loginSource, /text-\[length:var\(--tm-font-size-card-title\)\][^>]*>最近登录</, '最近登录标题应使用 15px 字号 Token。');
assert.match(loginSource, /mt-\[calc\(var\(--tm-space-8\)\*4\)\] flex w-full flex-col items-center/, '登录主操作区应下移到更易触达的位置。');
assert.match(loginSource, /wechatLoginButtonClass} mt-\[var\(--tm-space-5\)\]/, '最近登录与微信登录之间应使用 20px 间距。');
assert.equal((loginSource.match(/role="tablist"/g) ?? []).length, 1, '手机号登录方式只应在弹窗顶部展示一次。');
assert.match(loginSource, /role="tab"[\s\S]*text-\[length:var\(--tm-font-size-section-title\)\]/, '手机号登录方式应上移到弹窗顶部并使用 17px 字号 Token。');
assert.match(loginSource, /max-w-\[300px\] pb-\[var\(--tm-space-4\)\] pt-\[var\(--tm-space-5\)\]/, '手机号登录输入区整体宽度应为 300px 并居中。');
assert.match(loginSource, /sheetPrimaryButtonClass = '[^']*max-w-\[300px\]/, '弹窗登录按钮宽度应与输入区统一为 300px。');
assert.match(loginSource, /phoneLoginLinkClass = 'flex min-h-11/, '手机号登录入口应降级为文字链接。');
assert.match(loginSource, /border border-transparent bg-\[var\(--tm-bg-surface-soft\)\]/, '手机号登录输入控件应使用浅色表面并弱化默认边界。');
assert.match(loginSource, /focus:border-\[var\(--tm-brand-primary-soft-strong\)\]/, '手机号登录输入控件聚焦时应保留轻量品牌反馈。');
assert.doesNotMatch(loginSource, /KeyRound|MessageCircle|Smartphone/, '登录操作按钮不应附加图标。');
assert.match(loginSource, /submitting \? '正在登录\.\.\.' : phoneLoginMode === 'sms' \? '注册\/登录' : '登录'/, '验证码模式应显示注册/登录，密码模式应显示登录。');
assert.doesNotMatch(loginSource, /min-h-\[314px\]/, '登录页不应把产品 Icon 平铺成大面积头图。');
assert.doesNotMatch(loginSource, /#[0-9a-f]{3,8}/i, '登录页不应新增硬编码颜色。');
assert.match(tokenSource, /'--tm-platform-wechat': teacherPlatformSemantic\.wechat/, '教师端应提供微信平台色 Token。');

assert.match(assetSource, /TEACHER_LOGIN_ICON: teacherLoginIconImg/, '登录 Icon 应通过统一资源表暴露。');
assert.equal(existsSync(loginIconPath), true, '登录 Icon 资源应存在。');
assert.ok(statSync(loginIconPath).size < 300 * 1024, '登录 Icon 资源应控制在 300KB 内。');

console.log('teacher login flow assertions passed');
