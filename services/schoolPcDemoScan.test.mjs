import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { createSchoolPcDemoScanHandler } from './schoolPcDemoScan.mjs';

const api = '/api/school-pc-demo-scan';
const phonePage = new URL('../public/demos/school-pc-scan-confirm.html', import.meta.url);
const script = readFileSync(phonePage, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

test('首页扫码直接登录，管理员验证码仍需手机确认', async () => {
  const handle = createSchoolPcDemoScanHandler();
  const request = (method, url, token) => {
    const reply = {};
    const headers = token ? { authorization: `Bearer ${token}` } : {};
    assert.equal(handle({ method, url, headers }, {
      setHeader() {},
      writeHead(status) { reply.status = status; },
      end(body) { reply.body = body && JSON.parse(body); },
    }), true);
    return reply;
  };
  const login = request('POST', `${api}?mode=login`).body;
  const verification = request('POST', `${api}?mode=verify`).body;
  const status = token => request('GET', `${api}/status`, token);

  function openPhone(session, search) {
    const elements = {
      title: {},
      instruction: {},
      confirmation: { hidden: true, addEventListener(_event, confirm) { this.confirm = confirm; } },
    };
    vm.runInNewContext(script, {
      URLSearchParams,
      location: { search, hash: `#${session.scanToken}` },
      document: { getElementById: id => elements[id] },
      fetch: async (url, options) => request(options.method, url.replace(/^\.\./, ''), options.headers.Authorization.slice(7)),
    });
    return elements;
  }

  assert.equal(login.lifetimeSeconds, 300);
  assert.deepEqual(status(login.pollToken).body, { confirmed: false });
  const directPhone = openPhone(login, '?mode=login');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(directPhone.confirmation.hidden, true);
  assert.equal(directPhone.instruction.textContent, '登录成功，请返回电脑。');
  assert.deepEqual(status(login.pollToken).body, { confirmed: true });
  assert.equal(status(login.pollToken).status, 410);

  assert.equal(request('POST', `${api}/login`, verification.scanToken).status, 403);
  const verificationPhone = openPhone(verification, '');
  assert.equal(verificationPhone.confirmation.hidden, false);
  assert.deepEqual(status(verification.pollToken).body, { confirmed: false });
  await verificationPhone.confirmation.confirm();
  assert.deepEqual(status(verification.pollToken).body, { confirmed: true });
});
