import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const cache = path.join(root, 'node_modules/.cache');
fs.mkdirSync(cache, { recursive: true });
const directory = fs.mkdtempSync(path.join(cache, 'school-basic-info-'));
try {
  const outfile = path.join(directory, 'checks.mjs');
  await build({
    stdin: {
      contents: `
        import assert from 'node:assert/strict';
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import SchoolBasicInfoSettings from './components/SchoolBasicInfoSettings';
        import { createSchoolBasicInfo, validateSchoolBasicInfo } from './shared/schoolBasicInfo';
        import { readSchoolBasicInfo, saveSchoolBasicInfo, schoolBasicInfoKey, SCHOOL_BASIC_INFO_CHANGED } from './shared/schoolBasicInfoStore';
        import { readImageUpload, IMAGE_UPLOAD_MAX_BYTES } from './shared/imageUpload';

        const memory = new Map();
        const events = new EventTarget();
        let failSave = false;
        const localStorage = {
          getItem: key => memory.get(key) ?? null,
          setItem: (key, value) => { if (failSave) throw new Error('quota'); memory.set(key, value); },
        };
        globalThis.window = Object.assign(events, { localStorage });
        let changed = 0;
        events.addEventListener(SCHOOL_BASIC_INFO_CHANGED, event => { changed++; assert.equal(event.detail.schoolId, 'school-a'); });
        const initial = createSchoolBasicInfo('学校原名称');
        assert.deepEqual(readSchoolBasicInfo('school-a', '学校原名称'), initial);
        assert.ok(validateSchoolBasicInfo({ ...initial, displayName: '  ' }).displayName);
        assert.ok(validateSchoolBasicInfo({ ...initial, displayName: '校'.repeat(41) }).displayName);
        assert.ok(validateSchoolBasicInfo({ ...initial, displayName: '学校\\n名称' }).displayName);
        assert.ok(validateSchoolBasicInfo({ ...initial, features: '校'.repeat(2001) }).features);
        assert.ok(validateSchoolBasicInfo({ ...initial, logoUrl: 'javascript:alert(1)' }).logoUrl);
        assert.ok(validateSchoolBasicInfo({ ...initial, logoUrl: 'data:image/svg+xml;base64,aaaa' }).logoUrl);

        const logo = 'data:image/png;base64,bG9nbw==';
        const saved = saveSchoolBasicInfo('school-a', { displayName: '  学校展示名称  ', logoUrl: logo, features: '校训：求真\\r\\n校风：笃行\\n育人理念：全面成长' });
        assert.equal(saved.displayName, '学校展示名称');
        assert.equal(saved.features, '校训：求真\\n校风：笃行\\n育人理念：全面成长');
        assert.equal(changed, 1);
        assert.deepEqual(readSchoolBasicInfo('school-a', '学校原名称'), saved, '保存后重新读取能完整恢复');
        assert.deepEqual(readSchoolBasicInfo('school-b', '另一所学校'), createSchoolBasicInfo('另一所学校'), '学校配置互相隔离');
        const html = renderToStaticMarkup(React.createElement(SchoolBasicInfoSettings, { schoolId: 'school-a', schoolName: '学校原名称' }));
        for (const text of ['学校基本信息', '学校对外展示名称', '学校Logo', '学校特色信息', '更换Logo', '移除', '保存', '取消', '学校展示名称', '学校Logo预览']) assert.ok(html.includes(text), text);
        assert.ok(html.includes('<textarea') && html.includes('校训：求真'));
        assert.ok(html.includes(logo));
        assert.ok(!html.includes('示例') && !html.includes('localStorage') && !html.includes('服务端'));

        failSave = true;
        assert.throws(() => saveSchoolBasicInfo('school-a', { ...saved, displayName: '不应保存' }), /当前修改已保留/);
        assert.equal(changed, 1, '失败不发出成功事件');
        assert.deepEqual(readSchoolBasicInfo('school-a', '学校原名称'), saved, '失败不覆盖旧配置');
        failSave = false;
        assert.throws(() => saveSchoolBasicInfo('school-a', { ...saved, displayName: '' }), /请输入/);
        assert.equal(changed, 1);
        memory.set(schoolBasicInfoKey('school-b'), '{bad');
        assert.deepEqual(readSchoolBasicInfo('school-b', '另一所学校'), createSchoolBasicInfo('另一所学校'));
        saveSchoolBasicInfo('school-a', { ...saved, logoUrl: '' });
        assert.equal(readSchoolBasicInfo('school-a', '学校原名称').logoUrl, '', '移除Logo独立保存');

        let revoked = 0;
        let draw;
        URL.createObjectURL = () => 'blob:test';
        URL.revokeObjectURL = () => { revoked++; };
        globalThis.Image = class { naturalWidth = 1200; naturalHeight = 600; async decode() {} };
        const canvas = { width: 0, height: 0, getContext: () => ({ drawImage: (...args) => { draw = args; } }), toDataURL: () => logo };
        globalThis.document = { createElement: () => canvas };
        assert.equal(await readImageUpload({ type: 'image/png', size: 1024 }), logo);
        assert.deepEqual([canvas.width, canvas.height], [512, 256], '等比缩小，不裁切、不拉伸');
        assert.equal(draw.length, 5);
        assert.equal(revoked, 1);
        await assert.rejects(readImageUpload({ type: 'image/png', size: IMAGE_UPLOAD_MAX_BYTES + 1 }), /不能超过/);
        await assert.rejects(readImageUpload({ type: 'application/pdf', size: 1024 }), /PNG/);
        globalThis.Image = class { async decode() { throw new Error('decode'); } };
        await assert.rejects(readImageUpload({ type: 'image/png', size: 1024 }), /图片无法读取/);
        assert.equal(revoked, 2, '失败也释放临时图片地址');
        assert.equal(readSchoolBasicInfo('school-a', '学校原名称').logoUrl, '', '上传失败不影响已保存配置');
        delete globalThis.window;
        delete globalThis.document;
        delete globalThis.Image;
        console.log('学校基本信息检查通过：表单渲染、学校隔离、名称校验、多行文本、Logo处理及保存失败保护。');
      `,
      resolveDir: root, loader: 'tsx', sourcefile: 'school-basic-info-checks.tsx',
    },
    outfile, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'silent',
  });
  await import(pathToFileURL(outfile).href);
  const dashboard = fs.readFileSync(path.join(root, 'components/TeacherDashboard.tsx'), 'utf8');
  assert.ok(dashboard.includes("children: ['学校基本信息', '学期管理'"));
  assert.ok(dashboard.includes("activeMenu === '学校基本信息' && <SchoolBasicInfoSettings"));
} finally { fs.rmSync(directory, { recursive: true, force: true }); }
