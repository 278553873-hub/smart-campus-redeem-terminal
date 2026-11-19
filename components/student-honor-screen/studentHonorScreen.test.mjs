import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '../..');
const cache = path.join(root, 'node_modules/.cache');
fs.mkdirSync(cache, { recursive: true });
const temporary = fs.mkdtempSync(path.join(cache, 'student-honor-check-'));
try {
  const output = path.join(temporary, 'checks.mjs');
  await build({
    stdin: { resolveDir: root, loader: 'tsx', contents: String.raw`
      import assert from 'node:assert/strict';
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import StudentHonorScreen, { StudentHonorContent, HonorGradeBoardContent } from './components/student-honor-screen/StudentHonorScreen';
      import { createHonorGradeBoards, formatHonorRank, getHonorGradeGrid } from './components/student-honor-screen/studentHonorModel';
      import { getHonorStudentAvatar } from './components/student-honor-screen/studentHonorAvatars';
      import { loadStudentGrowth } from './components/student-growth-screen/studentGrowthService';
      import { selectGrowthSnapshot } from './components/student-growth-screen/studentGrowthModel';
      import { selectGrowthRanking } from './components/student-growth-screen/studentGrowthRankingModel';
      import { getMockClassSeed, getMockStudentNameAt } from './mobile-app/data/studentNamePool';
      import { getSystemStudentAvatar } from './mobile-app/assets/studentAvatarCatalog';

      const dataset = await loadStudentGrowth(new Date('2026-11-18T10:00:00+08:00').getTime());
      const snapshot = selectGrowthSnapshot(dataset);
      const boards = createHonorGradeBoards(snapshot);
      assert.equal(boards.length, snapshot.grades.length);
      assert.ok(boards.length >= 6, '读取演示学校实际配置，不能固定六个年级');
      for (const board of boards) {
        assert.equal(board.rows.length, 10);
        assert.deepEqual(board.rows, selectGrowthRanking(snapshot, 'total', board.id), '每个年级从完整名册按真实净总分排名');
        assert.ok(board.rows.every(row => row.student.gradeId === board.id));
        for (const row of board.rows) {
          const index = Number(row.student.id.match(/-student-(\d+)$/)[1]) - 1;
          const gender = getMockStudentNameAt(row.student.classId, index).g;
          assert.equal(getHonorStudentAvatar(row.student), getSystemStudentAvatar(gender, getMockClassSeed(row.student.classId) * 31 + index * 17), '复用教师端同一学生头像');
        }
      }
      assert.equal(getHonorStudentAvatar({ ...dataset.students[0], avatar: '/school/student-photo.jpg' }), '/school/student-photo.jpg');
      assert.equal(formatHonorRank(1), '01');

      const path = ['品德', '行为', '友善'];
      const student = (id, gradeId) => ({id, gradeId, gradeName: gradeId === 'g1' ? '一年级' : '二年级', displayName: id, classId: gradeId+'-class-1', className: (gradeId === 'g1' ? '一年级' : '二年级')+'1班'});
      const people = [student('甲', 'g1'), student('乙', 'g1'), student('丙', 'g1'), student('丁', 'g1'), student('戊', 'g2')];
      const record = (id, person, delta, timestamp=100) => ({id, studentId:person.id, indicatorPath:path, delta, timestamp});
      const fixture = {schoolName:'测试学校', students:people, indicatorPaths:[path], generatedAt:200, term:{start:100,end:200}, records:[
        record('a',people[0],310), record('b',people[0],-4), record('c',people[1],306), record('d',people[2],81), record('e',people[3],-2), record('f',people[4],999),
        record('old',people[2],10000,99), record('future',people[2],10000,201),
      ]};
      const checked = createHonorGradeBoards(selectGrowthSnapshot(fixture));
      assert.deepEqual(checked[0].rows.map(row => [row.score,row.rank,row.tied]), [[306,1,true],[306,1,true],[81,3,false]], '保留真实分数与并列，不转换百分制，不将其他年级混入');
      assert.equal(checked[1].rows[0].score,999);
      const tieHtml = renderToStaticMarkup(<HonorGradeBoardContent board={checked[0]} />);
      assert.equal((tieHtml.match(/class="honor-crown"/g)||[]).length,2,'并列第一都拥有皇冠');
      assert.ok(tieHtml.includes('306') && tieHtml.includes('81') && !tieHtml.includes('100分'));
      assert.equal((tieHtml.match(/class="honor-finalist /g)||[]).length,3);
      for (const count of [0,1,2]) {
        const html = renderToStaticMarkup(<HonorGradeBoardContent board={{...checked[0],rows:checked[0].rows.slice(0,count)}} />);
        assert.equal((html.match(/class="honor-finalist /g)||[]).length,count,'不足三人按实际人数展示');
        assert.ok(!html.includes('NaN'));
      }
      const empty = renderToStaticMarkup(<StudentHonorContent snapshot={selectGrowthSnapshot({...fixture,students:[],records:[]})} />);
      assert.ok(empty.includes('暂无年级学生数据'));

      const html = renderToStaticMarkup(<StudentHonorContent snapshot={snapshot} />);
      assert.equal((html.match(/class="honor-grade-card"/g)||[]).length,boards.length,'实际演示学校全部年级同时呈现');
      assert.ok(!html.includes('role="tab"') && !html.includes('<button'),'没有年级切换操作');
      assert.equal((html.match(/class="honor-finalist /g)||[]).length,boards.length*3);
      assert.equal((html.match(/class="honor-list-rank"/g)||[]).length,boards.length*7,'所有年级均保留前三名和其余七位，不以只展示前三名减少内容');
      for (const board of boards) {
        assert.ok(html.includes('id="honor-grade-'+board.id+'"'));
        for (const row of board.rows) assert.ok(html.includes(row.student.displayName));
      }
      for (const forbidden of ['班级积分榜','班级表扬榜','成长动态','单项之星','我的成长','type="password"','screen-panorama-navigation']) assert.ok(!html.includes(forbidden),forbidden);

      for (const gradeCount of [6,9,12]) {
        const students = Array.from({length:gradeCount},(_,g) => Array.from({length:12},(_,i) => ({...people[0],id:'grade'+g+'-student-'+(i+1),displayName:'学生'+(i+1),gradeId:'grade'+g,gradeName:(g+1)+'年级'}))).flat();
        const adapted = selectGrowthSnapshot({...fixture,students,records:students.map((person,i)=>record('r'+i,person,306+i))});
        const output = renderToStaticMarkup(<StudentHonorContent snapshot={adapted} />);
        const grid = getHonorGradeGrid(gradeCount);
        assert.ok(grid.columns*grid.rows >= gradeCount && grid.rows <= 3,'全部年级在至多三行网格里展示');
        assert.equal((output.match(/class="honor-grade-card"/g)||[]).length,gradeCount);
        assert.equal((output.match(/class="honor-finalist /g)||[]).length,gradeCount*3);
        assert.equal((output.match(/class="honor-list-rank"/g)||[]).length,gradeCount*7,'6/9/12年级均同页完整呈现每级TOP10');
        for (let g=0;g<gradeCount;g++) assert.ok(output.includes('id="honor-grade-grade'+g+'"'));
        assert.ok(!output.includes('role="tab"') && !output.includes('<button'));
      }
      const rootHtml = renderToStaticMarkup(<StudentHonorScreen />);
      assert.ok(rootHtml.includes('学生<span>荣誉榜</span>') && rootHtml.includes('正在准备荣誉榜'),'独立入口可以正常渲染');
      console.log('学生荣誉榜检查通过：6/9/12年级同页完整TOP10、无年级切换、总分隔离、并列、头像一致与空榜。');
    ` },
    outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external',
    loader: { '.css': 'empty', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.png': 'dataurl', '.svg': 'dataurl' },
    logLevel: 'silent',
  });
  await import(pathToFileURL(output).href);
  const app = fs.readFileSync(path.join(root,'App.tsx'),'utf8');
  assert.ok(app.includes("from './components/student-honor-screen/StudentHonorScreen'"));
  const source = fs.readFileSync(path.join(import.meta.dirname,'StudentHonorScreen.tsx'),'utf8');
  assert.ok(!source.includes('setInterval') && !source.includes('useStudentGrowthPlayback'),'没有自动切换年级');
  for (const file of ['crown.png','podium.png','celebration-background.png']) assert.ok(fs.statSync(path.join(root,'public/assets/student-honor',file)).size > 1000);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
