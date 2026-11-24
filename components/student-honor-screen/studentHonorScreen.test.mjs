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
      import StudentHonorScreen, { StudentHonorContent } from './components/student-honor-screen/StudentHonorScreen';
      import { HonorRankBoard } from './components/student-honor-screen/HonorRankBoard';
      import { createHonorClassBoard, createHonorGradeBoards, createHonorStagePages, formatHonorRank, getHonorGradeGrid, getHonorStudentClassName } from './components/student-honor-screen/studentHonorModel';
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
      const tieHtml = renderToStaticMarkup(<HonorRankBoard board={checked[0]} />);
      assert.equal((tieHtml.match(/src="[^"]*avatar-frame-1\.png"/g)||[]).length,2,'并列第一使用相同的第一名头像框');
      assert.equal((tieHtml.match(/class="honor-student-class"/g)||[]).length,3,'前三名的班级直接展示，不依赖鼠标提示');
      assert.ok(tieHtml.includes('avatar-frame-3.png') && !tieHtml.includes('avatar-frame-2.png'));
      const podiumHeights = html => [...html.matchAll(/--honor-podium-height-ratio:([0-9.]+)/g)].map(match => Number(match[1]) * 100);
      const podiumLifts = html => [...html.matchAll(/--honor-podium-lift:([0-9.]+)%/g)].map(match => Number(match[1]));
      const podiumRanks = html => [...html.matchAll(/class="honor-finalist honor-place-\d+" data-rank="(\d+)"/g)].map(match => Number(match[1]));
      assert.deepEqual(podiumHeights(tieHtml), [100, 100, 60]);
      assert.deepEqual(podiumLifts(tieHtml), [19, 19, 0]);
      assert.deepEqual(podiumRanks(tieHtml), [1, 1, 3], '柱体颜色读取实际名次');
      const equalRows = checked[0].rows.map(row => ({ ...row, score: 306, rank: 1, tied: true }));
      const equalPodium = renderToStaticMarkup(<HonorRankBoard board={{ ...checked[0], rows: equalRows }} />);
      assert.deepEqual(podiumHeights(equalPodium), [100, 100, 100]);
      assert.deepEqual(podiumLifts(equalPodium), [0, 0, 0], '全部并列时三个分数仍紧邻名单上缘');
      assert.ok(tieHtml.includes('>一年级1班<'),'班级显示完整年级和班号');
      assert.ok(tieHtml.includes('306') && tieHtml.includes('81') && !tieHtml.includes('100分'));
      assert.equal((tieHtml.match(/class="honor-finalist /g)||[]).length,3);
      for (const count of [0,1,2]) {
        const html = renderToStaticMarkup(<HonorRankBoard board={{...checked[0],rows:checked[0].rows.slice(0,count)}} />);
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
      assert.deepEqual(teacherBoards.slice(0, 3).map(board => board.rows.slice(0, 3).map(row => row.rank)), [[1, 1, 3], [1, 2, 2], [1, 1, 1]]);
      assert.ok(teacherBoards.slice(0, 3).every(board => board.rows[2].score > board.rows[3].score));
      const classStudents = Array.from({ length: 12 }, (_, index) => ({
        id: String(index), name: '本班学生' + index, avatar: '/student-avatar.png', score: index < 2 ? 100 : 100 - index,
      }));
      const classBoard = createHonorClassBoard('c_2025_1', '2025级1班', classStudents);
      assert.equal(classBoard.rows.length, 10);
      assert.deepEqual(classBoard.rows.slice(0, 3).map(row => row.rank), [1, 1, 3]);
      assert.ok(classBoard.rows.every(row => row.student.classId === 'c_2025_1' && row.student.className === '2025级1班'));
      const classHtml = renderToStaticMarkup(<HonorRankBoard board={classBoard} />);
      assert.ok(classHtml.includes('2025级1班') && classHtml.includes('/student-avatar.png'));
      assert.equal((classHtml.match(/class="honor-list-rank"/g) || []).length, 7);
      assert.equal(createHonorClassBoard('c_2025_1', '2025级1班', []).rows.length, 0);
      const updatedClassStudents = classStudents.map(student => student.id === '11' ? { ...student, score: 102 } : student);
      assert.equal(createHonorClassBoard('c_2025_1', '2025级1班', updatedClassStudents).rows[0].student.id, '11');
      const tiedSecond = renderToStaticMarkup(<HonorRankBoard board={teacherBoards[1]} />);
      assert.deepEqual(podiumRanks(tiedSecond), [1, 2, 2]);
      assert.deepEqual(podiumHeights(tiedSecond), [100, 80, 80]);
      assert.deepEqual(podiumLifts(tiedSecond), [9.5, 0, 0]);
      const distinctBoard = teacherBoards.find(board => new Set(board.rows.slice(0, 3).map(row => row.score)).size === 3);
      const distinctPodium = renderToStaticMarkup(<HonorRankBoard board={distinctBoard} />);
      assert.deepEqual(podiumRanks(distinctPodium), [1, 2, 3]);
      const distinctClass = createHonorClassBoard('c_2025_2', '2025级2班', classStudents.map((student, index) => ({ ...student, score: 100 - index })));
      for (const podium of [distinctPodium, renderToStaticMarkup(<HonorRankBoard board={distinctClass} />)]) {
        assert.deepEqual(podiumHeights(podium), [100, 80, 60], '相同名次使用同一档柱高');
        assert.deepEqual(podiumLifts(podium), [19, 9.5, 0], '头像与学生信息随名次一同错落');
      }
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
          assert.ok(row.score >= base);
          if (!teacherBoards.slice(0, 3).includes(board) || row.rank > 3) assert.ok(row.score - base < 37);
        }
      }
      const rootHtml = renderToStaticMarkup(<StudentHonorScreen />);
      assert.ok(rootHtml.includes('honor-school-name') && rootHtml.includes('honor-title-name">学生成长荣誉榜</span>') && rootHtml.includes('正在准备荣誉榜'),'独立入口可以正常渲染');
      assert.ok(!rootHtml.includes('榜单类型') && !html.includes('班级榜年级'));
      console.log('学生成长荣誉榜检查通过：年级榜、班级前十名、分数更新、并列与空榜。');
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
  for (const file of ['avatar-frame-1.png','avatar-frame-2.png','avatar-frame-3.png']) assert.ok(fs.statSync(path.join(root,'public/assets/student-honor',file)).size > 1000);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
