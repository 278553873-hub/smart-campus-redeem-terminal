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
      import { createHonorGradeBoards, createHonorStagePages, formatHonorRank, getHonorGradeGrid, getHonorStudentClassName } from './components/student-honor-screen/studentHonorModel';
      import { getHonorStudentAvatar } from './components/student-honor-screen/studentHonorAvatars';
      import { loadStudentHonor } from './components/student-honor-screen/studentHonorService';
      import { GET_MOCK_STUDENTS_FOR_CLASS, MOCK_CLASSES } from './mobile-app/constants';
      import { CURRENT_PRINCIPAL_TERM } from './mobile-app/data/principalTermReport';
      import { createDemoStudentLevelEvaluationRecords, getStudentLevelNetScore } from './mobile-app/domain/studentPerformance';
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
      assert.equal(getHonorStudentClassName({ gradeName: '3年级', className: '1班' }), '3年级1班');
      assert.equal(getHonorStudentClassName({ gradeName: '3年级', className: '3年级1班' }), '3年级1班');
      assert.equal(getHonorStudentClassName({ gradeName: '', className: '1班' }), '1班');
      assert.equal(getHonorStudentClassName({ gradeName: '3年级', className: '' }), '未分班');

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
      assert.equal((tieHtml.match(/class="honor-student-class"/g)||[]).length,3,'前三名的班级直接展示，不依赖鼠标提示');
      const podiumHeights = html => [...html.matchAll(/--honor-podium-height:([0-9.]+)%/g)].map(match => Number(match[1]));
      assert.deepEqual(podiumHeights(tieHtml), [100, 100, 72]);
      const equalRows = checked[0].rows.map(row => ({ ...row, score: 306, rank: 1, tied: true }));
      assert.deepEqual(podiumHeights(renderToStaticMarkup(<HonorGradeBoardContent board={{ ...checked[0], rows: equalRows }} />)), [100, 100, 100]);
      assert.ok(tieHtml.includes('>一年级1班<'),'班级显示完整年级和班号');
      assert.ok(tieHtml.includes('306') && tieHtml.includes('81') && !tieHtml.includes('100分'));
      assert.equal((tieHtml.match(/class="honor-finalist /g)||[]).length,3);
      for (const count of [0,1,2]) {
        const html = renderToStaticMarkup(<HonorGradeBoardContent board={{...checked[0],rows:checked[0].rows.slice(0,count)}} />);
        assert.equal((html.match(/class="honor-finalist /g)||[]).length,count,'不足三人按实际人数展示');
        assert.ok(!html.includes('NaN'));
      }
      const empty = renderToStaticMarkup(<StudentHonorContent snapshot={selectGrowthSnapshot({...fixture,students:[],records:[]})} />);
      assert.ok(empty.includes('暂无年级学生数据'));

      const visibleBoards = boards.slice(0, 6);
      const html = renderToStaticMarkup(<StudentHonorContent snapshot={snapshot} />);
      assert.equal((html.match(/class="honor-grade-card"/g)||[]).length,visibleBoards.length,'首屏最多同时展示六个年级');
      assert.equal(html.includes('荣誉榜分页'), boards.length > 6);
      assert.equal((html.match(/class="honor-finalist /g)||[]).length,visibleBoards.length*3);
      assert.equal((html.match(/class="honor-list-rank"/g)||[]).length,visibleBoards.length*7,'所有年级均保留前三名和其余七位，不以只展示前三名减少内容');
      assert.equal((html.match(/class="honor-student-class"/g)||[]).length,visibleBoards.length*10,'每张年级榜的十名学生都直接显示班级');
      assert.equal((html.match(/class="honor-student-name"/g)||[]).length,visibleBoards.length*10,'姓名与名次、班级、总分使用同一行结构');
      assert.equal((html.match(/class="honor-student-score"/g)||[]).length,visibleBoards.length*10,'每名学生的总分在同一行呈现');
      assert.ok(!html.includes('honor-list-person'),'姓名与班级不再用不同字号拼在同一格');
      assert.ok(!html.includes('<small>分</small>'),'前三名与其余名次使用同一套分数样式，不单独附单位');
      for (const board of visibleBoards) {
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
        assert.equal((output.match(/class="honor-grade-card"/g)||[]).length,6);
        assert.equal((output.match(/class="honor-finalist /g)||[]).length,18);
        assert.equal((output.match(/class="honor-list-rank"/g)||[]).length,42,'每页最多六个年级，完整呈现每级TOP10');
        for (let g=0;g<6;g++) assert.ok(output.includes('id="honor-grade-grade'+g+'"'));
        assert.equal(output.includes('荣誉榜分页'), gradeCount > 6);
        if (gradeCount > 6) assert.equal((output.match(/aria-current="page"/g) || []).length, 1);
      }
      const teacherSnapshot = await loadStudentHonor();
      const teacherStudents = new Map(MOCK_CLASSES.flatMap(item => GET_MOCK_STUDENTS_FOR_CLASS(item.id)).map(student => [student.id, student]));
      const stagePages = createHonorStagePages(teacherSnapshot);
      assert.deepEqual(stagePages.map(page => [page.stage, page.boards.length]), [['primary', 6], ['secondary', 6]]);
      assert.ok(stagePages.every(page => page.boards.every(board => board.rows.length === 10)));
      for (const page of stagePages) {
        assert.ok(page.boards.some(board => new Set(board.rows.slice(0, 3).map(row => row.score)).size === 3));
        assert.ok(page.boards.every(board => new Set(board.rows.map(row => row.score)).size > 1));
      }
      const teacherBoards = stagePages[0].boards;
      assert.equal(teacherBoards.length, 6);
      for (const board of teacherBoards) {
        assert.equal(board.rows.length, 10);
        for (const row of board.rows) {
          const source = teacherStudents.get(row.student.id);
          assert.equal(source.status, 'active');
          assert.equal(row.student.displayName, source.name);
          assert.equal(getHonorStudentAvatar(row.student), source.avatar);
          const base = getStudentLevelNetScore(
            createDemoStudentLevelEvaluationRecords(source, CURRENT_PRINCIPAL_TERM), 'term', CURRENT_PRINCIPAL_TERM,
          );
          assert.ok(row.score >= base && row.score - base < 37);
        }
      }
      const rootHtml = renderToStaticMarkup(<StudentHonorScreen />);
      assert.ok(rootHtml.includes('honor-school-name') && rootHtml.includes('honor-title-name">学生荣誉榜</span>') && rootHtml.includes('正在准备荣誉榜'),'独立入口可以正常渲染');
      console.log('学生荣誉榜检查通过：每屏最多六个年级完整TOP10、小学及初高中分屏、总分隔离、并列、头像一致与空榜。');
    ` },
    outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external',
    loader: { '.css': 'empty', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.png': 'dataurl', '.svg': 'dataurl' },
    logLevel: 'silent',
  });
  await import(pathToFileURL(output).href);
  const app = fs.readFileSync(path.join(root,'App.tsx'),'utf8');
  assert.ok(app.includes("from './components/student-honor-screen/StudentHonorScreen'"));
  const source = fs.readFileSync(path.join(import.meta.dirname,'StudentHonorScreen.tsx'),'utf8');
  assert.ok(source.includes('30_000') && source.includes('visibilitychange'),'按学段轮播，并在页面隐藏时暂停');
  for (const file of ['crown.png','podium.png','celebration-background.png']) assert.ok(fs.statSync(path.join(root,'public/assets/student-honor',file)).size > 1000);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
