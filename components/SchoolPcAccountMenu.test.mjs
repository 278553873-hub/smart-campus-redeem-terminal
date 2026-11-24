import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const cache = path.join(root, 'node_modules/.cache');
fs.mkdirSync(cache, { recursive: true });
const directory = fs.mkdtempSync(path.join(cache, 'school-pc-account-menu-'));

try {
  const outfile = path.join(directory, 'checks.mjs');
  await build({
    stdin: {
      contents: `
        import assert from 'node:assert/strict';
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import SaaSPortal from './components/SaaSPortal';
        import SchoolPcAccountMenu from './components/SchoolPcAccountMenu';
        import SchoolPcTeachingDashboard from './components/SchoolPcTeachingDashboard';
        import { getDemoSchoolPcMemberships } from './components/schoolPcMemberships';

        const workspaces = getDemoSchoolPcMemberships();
        const [star, qizhong, qinghe, personal] = workspaces;
        const schools = [star, qizhong, qinghe];
        assert.deepEqual(workspaces.map(workspace => workspace.id), ['school-star', 'school-qizhong', 'school-qinghe', 'personal']);
        assert.equal(star.canManageSchool, true);
        assert.equal(qizhong.canManageSchool, false);
        assert.equal(qinghe.canManageSchool, false);
        assert.deepEqual(schools.map(school => school.schoolTypeLabel), ['十二年一贯制', '小学', '小学']);
        assert.deepEqual(qizhong.classroomClassNames, ['2025级4班']);
        assert.deepEqual(qinghe.classroomClassNames, ['2025级3班', '2025级6班']);
        assert.deepEqual(personal.classroomClassNames, ['2025级1班']);
        assert.deepEqual(personal.availableApps, ['smart-big-screen']);

        const noop = () => {};
        const renderMenu = (current, options) => renderToStaticMarkup(
          <SchoolPcAccountMenu teacherName="郭老师" avatar="/teacher-avatar.png" current={current} workspaces={options} onWorkspaceChange={noop} />,
        );
        const multi = renderMenu(qizhong, workspaces);
        assert.match(multi, /<button[^>]*aria-haspopup="menu"/);
        assert.match(multi, /aria-label="郭老师的账号菜单，当前学校成都七中初中附属小学"/);
        const trigger = multi.match(/<button[^>]*aria-haspopup="menu"[^>]*>.*?<\\/button>/)?.[0] ?? '';
        assert.match(trigger, /<img[^>]*src="\\/teacher-avatar.png"[^>]*>.*?>郭老师<.*?>成都七中初中附属小学</);
        assert.match(trigger, /class="[^"]*font-medium[^"]*" title="成都七中初中附属小学"/);
        assert.match(multi, /role="menu"[^>]*aria-label="账号菜单"/);
        assert.equal((multi.match(/role="menuitemradio"/g) ?? []).length, 4);
        assert.equal((multi.match(/>学校版</g) ?? []).length, 3);
        assert.match(multi, /lucide-user-round.*?>个人版</);
        assert.equal((multi.match(/lucide-building-2/g) ?? []).length, 3);
        assert.match(multi, /lucide-building-2[^"]*text-blue-600/);
        assert.match(multi, /role="menuitemradio"[^>]*aria-checked="true"[^>]*>.*?title="成都七中初中附属小学"/);
        assert.match(multi, />十二年一贯制<.*?title="成都七中初中附属小学".*?>小学</);
        assert.match(multi, /切换空间/);
        assert.doesNotMatch(multi, /退出登录/);
        const single = renderMenu(qinghe, [qinghe]);
        assert.match(single, /青禾实验小学/);
        assert.doesNotMatch(single, /切换学校|menuitemradio/);
        assert.match(single, />学校版<.*?>小学</);

        const sixthSchool = { ...star, id: 'school-sixth', name: '第六所学校' };
        const six = renderMenu(star, [...schools, { ...star, id: 'school-fourth' }, { ...star, id: 'school-fifth' }, sixthSchool]);
        assert.match(six, /class="overflow-y-auto" style="max-height:320px"/);
        assert.equal((six.match(/style="height:64px"/g) ?? []).length, 6);
        assert.match(six, /第六所学校/);

        const renderHome = school => renderToStaticMarkup(
          <SaaSPortal isLoggedIn teacherProfile={{ name: '郭老师', role: school.role, school: school.name }}
            availableApps={school.availableApps} enrolledStudentCount={school.enrolledStudentCount} onLoginSuccess={noop} onNavigate={noop} />,
        );
        assert.match(renderHome(star), /开通学生：2530/);
        assert.match(renderHome(star), /积分银行/);
        for (const school of schools) {
          const page = renderHome(school);
          assert.ok(page.includes(school.name));
          assert.match(page, /管理后台/);
          assert.match(page, /课堂大屏/);
        }
        assert.doesNotMatch(renderHome(qizhong), /星河实验学校|开通学生：2530|积分银行/);
        const personalHome = renderHome(personal);
        assert.match(personalHome, /个人空间/);
        assert.match(personalHome, /课堂大屏/);
        assert.doesNotMatch(personalHome, /管理后台|积分银行/);

        const teachingDashboard = renderToStaticMarkup(<SchoolPcTeachingDashboard classNames={qizhong.classroomClassNames} />);
        assert.match(teachingDashboard, /班级管理/);
        assert.match(teachingDashboard, /2025级4班/);
        assert.doesNotMatch(teachingDashboard, /2025级3班|2025级6班|货柜超市/);
      `,
      resolveDir: root, loader: 'tsx', sourcefile: 'school-pc-account-menu-checks.tsx',
    },
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    loader: { '.css': 'empty', '.png': 'text', '.jpg': 'text', '.svg': 'text', '.webp': 'text' },
    plugins: [{
      name: 'render-account-menu-content',
      setup(builder) {
        // Render the dropdown contents inline so the server render can inspect the actual Arco menu items.
        builder.onResolve({ filter: /^@arco-design\/web-react$/ }, ({ importer }) => (
          importer === path.join(root, 'components/SchoolPcAccountMenu.tsx')
            ? { path: 'arco-dropdown-inline', namespace: 'account-menu-test' }
            : null
        ));
        builder.onLoad({ filter: /.*/, namespace: 'account-menu-test' }, () => ({
          contents: `
            import React from 'react';
            export { Avatar, Button, Menu, Tag } from '@arco-design/web-react';
            export function Dropdown({ children, droplist }) {
              return React.createElement(React.Fragment, null, children, droplist);
            }
          `,
          resolveDir: root,
        }));
      },
    }],
  });
  await import(pathToFileURL(outfile).href);
  const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
  assert.match(app, /<SchoolPcAccountMenu\b[^>]*\/>\s*<\/div>\s*<Button\b[\s\S]*?aria-label="退出登录"[\s\S]*?!font-medium[\s\S]*?onClick=\{handleLogout\}/);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
