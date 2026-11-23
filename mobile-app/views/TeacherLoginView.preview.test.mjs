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

const findNode = (node, predicate) => {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
};

const glassDialog = () => null;

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
    MobileGlassActionDialog: glassDialog,
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
    sheets(node) {
      const found = [];
      const walk = current => {
        if (!current || typeof current !== 'object') return;
        if (current.type === stub) found.push(current.props);
        [current.props?.children].flat(Infinity).forEach(walk);
      };
      walk(node);
      return found;
    },
  };
};

const getDemoDialog = page => findNode(page, node => node.type === glassDialog);
const chooseStatus = (page, label) => {
  const dialog = getDemoDialog(page);
  assert.equal(dialog?.props.title, '模拟用户场景');
  assert.deepEqual(Array.from(dialog.props.actions, action => action.label), ['已加入学校版', '未加入学校版']);
  dialog.props.actions.find(action => action.label === label).onSelect();
};

{
  const login = createLogin();
  button(login.render(), '一键登录').props.onClick();
  const preview = login.render();
  assert.equal(findNode(preview, node => node.type === 'main').props.inert, true, '分支浮层打开时停用背后的登录操作');
  assert.equal(login.sessions.length, 0, '选择分支前不建立登录会话');
  getDemoDialog(preview).props.onClose();
  assert.equal(getDemoDialog(login.render()), undefined, '关闭浮层可返回登录页');
  button(login.render(), '一键登录').props.onClick();
  chooseStatus(login.render(), '未加入学校版');
  const guide = login.render();
  assert.ok(login.isGuide(guide), '一键登录的未加入分支打开学校关联引导');
  assert.equal(guide.props.phone, WECHAT_TEACHER_LOGIN_PHONES[0]);
  assert.equal(login.sessions.length, 0, '预览不建立登录会话');
  guide.props.onReturnToLogin();
  const recent = button(login.render(), '最近登录 190****0000');
  assert.ok(recent, '退出预览应回到登录页');
  recent.props.onClick();
  login.flushLogin();
  assert.equal(login.sessions.length, 1, '预览退出后，最近登录必须进入学校版');
  assert.equal(login.sessions[0].account.phone, RECENT_TEACHER_LOGIN_PHONE);
  assert.equal(login.sessions[0].spaceId, 'school-star');
  assert.equal(login.isGuide(login.render()), false, '学校账号不再被预览拦截');
  assert.deepEqual(login.personalChoices, [], '退出预览不记录个人版选择');
}

{
  const login = createLogin();
  button(login.render(), '一键登录').props.onClick();
  chooseStatus(login.render(), '已加入学校版');
  assert.equal(login.sessions[0]?.spaceId, 'school-star', '一键登录的已加入分支直接进入学校版');
  assert.equal(login.sessions[0]?.account.phone, WECHAT_TEACHER_LOGIN_PHONES[1]);
}

{
  const login = createLogin();
  const page = login.render();
  findNode(page, node => node.type === 'input' && node.props.type === 'checkbox').props.onChange({ target: { checked: false } });
  button(login.render(), '一键登录').props.onClick();
  assert.equal(getDemoDialog(login.render()), undefined, '未同意隐私指引时不打开演示分支');
}

{
  const openSchoolStatus = (login, { password = false, phone = WECHAT_TEACHER_LOGIN_PHONES[0] } = {}) => {
    let page = login.render();
    assert.equal(login.isGuide(page), false, '手机号登录/注册不应被预览拦截');
    button(page, '手机号登录/注册').props.onClick();
    page = login.render();
    let phoneSheet = login.sheets(page).find(props => props.title === '手机号登录/注册');
    assert.equal(phoneSheet?.open, true, '手机号登录/注册应打开原登录弹窗');
    assert.equal(login.isGuide(page), false, '弹窗打开时仍停留在登录页');
    assert.equal(login.sessions.length, 0, '仅打开弹窗不建立登录会话');

    if (password) {
      button({ props: { children: phoneSheet.titleContent } }, '密码登录').props.onClick();
      phoneSheet = login.sheets(login.render()).find(props => props.title === '手机号登录/注册');
    }
    const phoneInput = findNode({ props: { children: phoneSheet.children } }, node => node.type === 'input' && node.props?.placeholder === '请输入手机号');
    assert.ok(phoneInput, '手机号弹窗应保留手机号输入框');
    phoneInput.props.onChange({ target: { value: phone } });
    page = login.render();
    phoneSheet = login.sheets(page).find(props => props.title === '手机号登录/注册');
    const submitLabel = password ? '登录' : '注册/登录';
    button({ props: { children: phoneSheet.children } }, submitLabel).props.onClick();
    assert.equal(getDemoDialog(login.render()), undefined, '凭证未填写时不打开演示分支');
    const credentialInput = findNode({ props: { children: phoneSheet.children } }, node => node.type === 'input' && node.props?.placeholder === (password ? '请输入密码' : '请输入验证码'));
    assert.ok(credentialInput, '手机号弹窗应保留凭证输入框');
    credentialInput.props.onChange({ target: { value: password ? 'demo1234' : '1234' } });
    page = login.render();
    phoneSheet = login.sheets(page).find(props => props.title === '手机号登录/注册');
    const submit = button({ props: { children: phoneSheet.children } }, submitLabel);
    assert.ok(submit, '手机号弹窗应保留注册/登录按钮');
    submit.props.onClick();
    return login.render();
  };

  const joined = createLogin();
  const joinedStatusPage = openSchoolStatus(joined);
  chooseStatus(joinedStatusPage, '已加入学校版');
  assert.equal(joined.sessions.length, 1, '已加入学校版应直接进入学校版');
  assert.equal(joined.sessions[0].spaceId, 'school-star');
  assert.equal(joined.sessions[0].account.phone, WECHAT_TEACHER_LOGIN_PHONES[0]);
  assert.equal(joined.isGuide(joined.render()), false, '已加入学校版不展示关联引导');

  const unjoined = createLogin();
  const unjoinedStatusPage = openSchoolStatus(unjoined);
  chooseStatus(unjoinedStatusPage, '未加入学校版');
  const guide = unjoined.render();
  assert.ok(unjoined.isGuide(guide), '未加入学校版才进入学校关联引导');
  assert.equal(guide.props.phone, WECHAT_TEACHER_LOGIN_PHONES[0]);
  assert.equal(unjoined.sessions.length, 0, '未加入学校版不建立学校版登录会话');

  const password = createLogin();
  chooseStatus(openSchoolStatus(password, { password: true, phone: RECENT_TEACHER_LOGIN_PHONE }), '未加入学校版');
  password.render().props.onEnterPersonal();
  assert.equal(password.sessions[0]?.spaceId, 'personal', '密码登录可演示未加入学校版');
  assert.equal(password.sessions[0]?.account.phone, RECENT_TEACHER_LOGIN_PHONE);
  assert.equal(password.sessions[0]?.account.schoolSpaceIds.length, 0);
  assert.equal(password.sessions[0]?.account.collaborationSpaceIds.length, 0);
}

const recent = createLogin();
button(recent.render(), '最近登录 190****0000').props.onClick();
recent.flushLogin();
assert.equal(recent.sessions[0]?.spaceId, 'school-star', '首次最近登录同样直达学校版');

const legacy = createLogin({ enableSchoolOnboarding: false });
button(legacy.render(), '一键登录').props.onClick();
assert.equal(getDemoDialog(legacy.render()), undefined);
assert.equal(legacy.sheets(legacy.render()).find(props => props.title === '申请获取并验证你的手机号')?.open, true);
button(legacy.render(), '最近登录 190****0000').props.onClick();
legacy.flushLogin();
assert.deepEqual(legacy.sessions, [undefined], '未启用学校分流的版本保留原登录方式');
console.log('登录预览入口检查通过：一键登录和手机号登录分流、最近登录直达学校版');
