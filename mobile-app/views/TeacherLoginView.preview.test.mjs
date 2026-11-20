import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';
import { RECENT_TEACHER_LOGIN_PHONE, WECHAT_TEACHER_LOGIN_PHONES, resolveDemoTeacherLoginAccount } from '../data/teacherLoginAccounts.ts';
import { maskTeacherLoginPhone, resolveTeacherLoginDestination } from '../domain/teacherLoginAccess.ts';

// 执行真实登录组件的事件和状态更新，定时器可控，不依赖浏览器或真实授权。
const file = fs.readFileSync(new URL('./TeacherLoginView.tsx', import.meta.url), 'utf8');
const source = file.slice(file.indexOf('interface TeacherLoginViewProps'))
  .replace('export default TeacherLoginView;', 'globalThis.LoginView = TeacherLoginView;');
const { code } = await transform(source, { loader: 'tsx', target: 'es2022' });

const text = node => Array.isArray(node) ? node.map(text).join(' ')
  : node && typeof node === 'object' ? text(node.props?.children)
    : typeof node === 'string' || typeof node === 'number' ? String(node) : '';
const button = (node, label) => {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === 'button' && text(node).trim().replace(/\s+/g, ' ') === label) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = button(child, label);
    if (found) return found;
  }
};

const createLogin = (overrides = {}) => {
  const state = [];
  const timers = new Map();
  const sessions = [];
  const personalChoices = [];
  let cursor = 0;
  let timerId = 0;
  const stub = () => null;
  const context = vm.createContext({
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = { current: initial };
      return state[index];
    },
    useEffect() {},
    window: {
      setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
    ASSETS: { MANAGEMENT: { TEACHER_LOGIN_ICON: 'login-icon' } },
    Info: stub, PasswordRevealButton: stub, MobileBottomSheet: stub, MobileToast: stub,
    TeacherSchoolAccessView: stub,
    RECENT_TEACHER_LOGIN_PHONE, WECHAT_TEACHER_LOGIN_PHONES, resolveDemoTeacherLoginAccount,
    maskTeacherLoginPhone, resolveTeacherLoginDestination,
    readTeacherPersonalChoice: () => false,
    confirmTeacherPersonalChoice: phone => personalChoices.push(phone),
  });
  vm.runInContext(code, context);
  return {
    sessions, personalChoices,
    render() {
      cursor = 0;
      return context.LoginView({
        enableSchoolOnboarding: true, previewSchoolAccess: true,
        onLogin: session => sessions.push(session), ...overrides,
      });
    },
    flushLogin() {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach(callback => callback());
    },
    isGuide: node => node.type === stub,
  };
};

for (const entry of ['一键登录', '手机号登录/注册']) {
  const login = createLogin();
  button(login.render(), entry).props.onClick();
  const guide = login.render();
  assert.ok(login.isGuide(guide), entry + '应直接打开预览页');
  assert.equal(guide.props.phone, WECHAT_TEACHER_LOGIN_PHONES[0]);
  assert.equal(login.sessions.length, 0, '预览不建立登录会话');
  guide.props.onReturnToLogin();
  const recent = button(login.render(), '最近登录 190****0000');
  assert.ok(recent, '退出预览应回到登录页');
  recent.props.onClick();
  login.flushLogin();
  assert.equal(login.sessions.length, 1, entry + '预览退出后，最近登录必须进入学校版');
  assert.equal(login.sessions[0].account.phone, RECENT_TEACHER_LOGIN_PHONE);
  assert.equal(login.sessions[0].spaceId, 'school-star');
  assert.equal(login.isGuide(login.render()), false, '学校账号不再被预览拦截');
  assert.deepEqual(login.personalChoices, [], '退出预览不记录个人版选择');
}

const recent = createLogin();
button(recent.render(), '最近登录 190****0000').props.onClick();
recent.flushLogin();
assert.equal(recent.sessions[0]?.spaceId, 'school-star', '首次最近登录同样直达学校版');

const legacy = createLogin({ enableSchoolOnboarding: false });
button(legacy.render(), '最近登录 190****0000').props.onClick();
legacy.flushLogin();
assert.deepEqual(legacy.sessions, [undefined], '未启用学校分流的版本保留原登录方式');
console.log('登录预览入口检查通过：两入口预览、退出恢复、最近登录直达学校版');
