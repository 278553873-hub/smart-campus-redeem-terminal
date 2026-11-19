import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '../..');
const cache = path.join(root, 'node_modules/.cache');
fs.mkdirSync(cache, { recursive: true });
const temporary = fs.mkdtempSync(path.join(cache, 'student-growth-check-'));
try {
  const output = path.join(temporary, 'checks.mjs');
  const bundled = await build({
    stdin: { resolveDir: root, loader: 'tsx', contents: String.raw`
      import assert from 'node:assert/strict';
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { DEFAULT_GROWTH_INDICATOR_PATHS as paths, getGrowthDemoTerm, selectGrowthSnapshot, selectGrowthScope } from './components/student-growth-screen/studentGrowthModel';
      import { createGrowthDemoDataset, loadStudentGrowth } from './components/student-growth-screen/studentGrowthService';
      import StudentGrowthScreen, { StudentGrowthContent, StudentGrowthBoards, getStudentGrowthLayout } from './components/student-growth-screen/StudentGrowthScreen';
      import { GrowthRankingList, growthStudentClassName } from './components/student-growth-screen/StudentGrowthRanking';
      import { defaultGrowthBoardSelection } from './components/student-growth-screen/StudentGrowthOverview';
      import { selectGrowthClasses, selectGrowthClassRanking, selectGrowthGradePraise, selectGrowthPublicPraise } from './components/student-growth-screen/studentGrowthOverviewModel';
      import { StudentGrowthAccountDialog } from './components/student-growth-screen/StudentGrowthAccountDialog';
      import { GROWTH_RANK_SIZE, selectGrowthRanking } from './components/student-growth-screen/studentGrowthRankingModel';
      import { SchoolCockpitEntry, StudentHonorEntry } from './components/SchoolScreenEntries';
      import { ScreenPanoramaNavigation } from './components/screen-navigation/ScreenPanoramaNavigation';
      import { getLeaderReportSnapshot } from './mobile-app/services/leaderReportService';
      const now = new Date('2026-11-16T09:29:01+08:00').getTime();
      const source = await getLeaderReportSnapshot({period:'term'});
      const before = JSON.stringify(source);
      const dataset = await loadStudentGrowth(now);
      const snapshot = selectGrowthSnapshot(dataset);
      assert.equal(JSON.stringify(source), before);
      assert.deepEqual(dataset, createGrowthDemoDataset(source, now), '同样输入生成稳定演示明细');
      assert.deepEqual(await getLeaderReportSnapshot({period:'term'}), source, '不回写共享报表');
      assert.equal(dataset.term.start, new Date('2026-09-01T00:00:00+08:00').getTime());
      assert.equal(getGrowthDemoTerm(new Date('2027-01-01T00:00:00+08:00').getTime()).start, dataset.term.start, '1月仍属于秋季学期');
      assert.equal(getGrowthDemoTerm(new Date('2027-02-01T00:00:00+08:00').getTime()).start, new Date('2027-02-01T00:00:00+08:00').getTime());
      assert.equal(snapshot.summary.totalStudents, source.summary.totalStudents);
      assert.equal(snapshot.grades.reduce((n,g)=>n+g.total,0), snapshot.summary.totalStudents);
      assert.ok(dataset.records.some(r=>r.timestamp < now-30*86400000), '演示明细包含一个月前的学期记录');
      assert.ok(dataset.records.every(r=>r.timestamp>=dataset.term.start && r.timestamp<=now));
      assert.ok(snapshot.summary.praisedStudents < snapshot.summary.recordedStudents);
      assert.equal(snapshot.summary.records, dataset.records.length);
      assert.equal(snapshot.studentScores.reduce((n,s)=>n+s.total,0), dataset.records.reduce((n,r)=>n+r.delta,0));
      assert.ok(snapshot.studentScores.every(s=>s.total===Object.values(s.dimensions).reduce((n,v)=>n+v,0)));
      assert.ok(dataset.students.every(s=>!s.displayName.includes('*') && s.classId), '公开姓名为全名，班级有稳定标识');
      assert.equal(GROWTH_RANK_SIZE,10);
      const defaultBoards=renderToStaticMarkup(<StudentGrowthBoards snapshot={snapshot} />);
      const boardHtml=(html,title)=>html.match(new RegExp('<section[^>]*aria-label="'+title+'"[\\s\\S]*?<\\/section>'))[0];
      const [filteredGroup,readonlyGroup]=defaultBoards.split('<aside class="student-growth-readonly-boards"');
      const panelTitles=markup=>[...markup.matchAll(/<section[^>]*aria-label="([^"]+)"/g)].map(match=>match[1]);
      assert.deepEqual(panelTitles(filteredGroup),['学生得分榜','班级积分榜','班级表扬榜','单项之星','年级风采','班级人均积分榜'],'六张可筛选卡片集中在同一分组，阅读顺序与布局一致');
      assert.deepEqual(panelTitles(readonlyGroup),['成长之星','成长动态'],'两张没有筛选的卡片集中在另一分组');
      assert.ok(!defaultBoards.includes('student-growth-panel-filters'),'恢复原筛选排版，不新增筛选容器');
      for(const title of ['成长之星','成长动态']) {
        const fixed=boardHtml(defaultBoards,title);
        assert.ok(!fixed.includes('role="combobox"') && !fixed.includes('<button') && !fixed.includes('student-growth-panel-filters'),'只读板块不放筛选或仿控件');
      }
      assert.equal(selectGrowthClasses(snapshot,snapshot.grades[0].id).length,3,'实际演示一年级只有3个班');
      for(const title of ['班级积分榜','班级表扬榜']) {
        const board=defaultBoards.match(new RegExp('<section[^>]*aria-label="'+title+'"[\\s\\S]*?<\\/section>'))[0];
        assert.equal((board.match(/<li /g)||[]).length,10,'实际演示默认'+title+'必须有10个班');
        assert.ok(!board.includes('student-growth-select'),'移除卡片内重复的年级下拉');
      }
      const gradeRankingBoard=boardHtml(defaultBoards,'班级人均积分榜');
      assert.equal((gradeRankingBoard.match(/<li /g)||[]).length,10,'全部年级只展示全校统一前十，不按年级分别取十个');
      const visibleClassNames=board=>[...board.matchAll(/<strong title="[^"]*">([^<]+)<\/strong>/g)].map(match=>match[1]);
      assert.deepEqual(visibleClassNames(gradeRankingBoard),selectGrowthClassRanking(snapshot).map(row=>row.name),'全校人均排序与现有班级积分榜一致，直接显示完整班级名称');
      assert.ok(!gradeRankingBoard.includes('student-growth-scope') && !gradeRankingBoard.includes('<article'),'不添加人均积分提示或年级分组');
      const defaultClasses=selectGrowthClassRanking(snapshot);
      assert.equal(defaultClasses.length,10);
      assert.ok(new Set(defaultClasses.map(row=>row.gradeId)).size>1,'全校榜从全部年级名册汇总');
      const firstGradeBoard=renderToStaticMarkup(<StudentGrowthBoards snapshot={snapshot} selection={{...defaultGrowthBoardSelection(),gradeId:snapshot.grades[0].id}} />);
      for(const title of ['班级积分榜','班级表扬榜']) {
        const board=firstGradeBoard.match(new RegExp('<section[^>]*aria-label="'+title+'"[\\s\\S]*?<\\/section>'))[0];
        assert.equal((board.match(/<li /g)||[]).length,3,'选一年级按实际3个班展示');
      }

      assert.equal((boardHtml(firstGradeBoard,'班级人均积分榜').match(/<li /g)||[]).length,3,'选定一年级后展示实际三个班的排名，不再只显示一个领先班级');

      const people=[dataset.students[0],dataset.students[1],dataset.students.find(s=>s.gradeId!==dataset.students[0].gradeId)];
      const [virtue] = paths, wisdom=paths.find(p=>p[0]==='求知');
      const rec=(id,s,path,delta,timestamp=now)=>({id,studentId:s.id,indicatorPath:path,delta,timestamp,publicBehavior:'主动帮助同学',teacherName:'李敏'});
      const fixture={ schoolName:'测试学校', students:people, indicatorPaths:paths, term:dataset.term, generatedAt:now, records:[
        rec('a',people[0],virtue,5,dataset.term.start), rec('b',people[0],virtue,-2),rec('c',people[0],wisdom,2),
        rec('d',people[1],virtue,5),rec('e',people[2],virtue,8),
        rec('old',people[2],virtue,900,dataset.term.start-1),rec('future',people[2],virtue,900,now+1),
        {...rec('unknown',people[0],virtue,900),studentId:'unknown'}, rec('bad',people[0],['崇德','不存在','不存在'],900),
      ]};
      const checked=selectGrowthSnapshot(fixture);
      assert.equal(checked.summary.records,5, '包含学期开始时刻，排除学期外、未来、未知学生与无效路径');
      assert.equal(checked.summary.recordedStudents,3, '重复记录不重复计算学生');
      assert.deepEqual(selectGrowthRanking(checked).map(r=>[r.score,r.rank,r.tied]),[[8,1,false],[5,2,true],[5,2,true]]);
      assert.deepEqual(selectGrowthRanking(checked,'total',people[0].gradeId).map(r=>[r.score,r.rank]),[[5,1],[5,1]]);
      assert.equal(selectGrowthRanking(checked,'崇德')[0].score,8);
      assert.equal(selectGrowthRanking(checked,'progress').length,0, '不沿用七天进步榜口径');
      assert.equal(selectGrowthRanking(checked,'不存在').length,0);
      assert.equal(selectGrowthSnapshot({...fixture,term:{...dataset.term,end:now-1}}).summary.records,1, '截止时间不得超过学期结束');
      const negative=selectGrowthSnapshot({...fixture, records:[rec('n',people[0],virtue,-1)]});
      assert.equal(selectGrowthRanking(negative).length,0);
      assert.equal(negative.summary.recordedStudents,1); assert.equal(negative.summary.praisedStudents,0);
      const mixed=selectGrowthSnapshot({...fixture,records:[rec('plus',people[0],virtue,2),rec('minus',people[0],virtue,-8),rec('only-minus',people[1],virtue,-1)]});
      assert.equal(selectGrowthScope(mixed,people[0].gradeId).summary.praisedStudents,1,'净积分为负的孩子也可能得到过表扬');
      assert.equal(selectGrowthScope(mixed,people[0].gradeId).summary.recordedStudents,2);
      assert.equal(selectGrowthScope(mixed,'missing'),mixed,'不存在的年级回退全校');
      for(const count of [5,6,10]) {
        const names=Array.from({length:count},(_,i)=>'学校指标'+i);
        const configured=names.map(name=>[name,'二级','三级']);
        const custom=selectGrowthSnapshot({...fixture,indicatorPaths:configured,records:names.map((_,i)=>rec('custom'+i,people[0],configured[i],i+1))});
        assert.deepEqual(custom.dimensions.map(d=>d.name),names,'维度读取学校配置及其顺序');
        for(const gradeCount of [6,9,12]) {
          const students=Array.from({length:gradeCount},(_,g)=>Array.from({length:12},(_,i)=>({
            id:'g'+g+'-s'+i,displayName:'测*'+i,gradeId:'g'+g,gradeName:(g+1)+'年级',className:'2班',
          }))).flat();
          const records=students.flatMap((student,i)=>configured.map((path,d)=>rec('g'+i+'d'+d,student,path,i+d+1)));
          const combined=selectGrowthSnapshot({...fixture,students,records,indicatorPaths:configured});
          const html=renderToStaticMarkup(<StudentGrowthBoards snapshot={combined} />);
          assert.equal((html.match(/<section /g)||[]).length,8,'所有指标和年级数量下均是八个板块');
          assert.equal((html.match(/class="student-growth-dimension-star"/g)||[]).length,count,'学校全部配置指标在单项之星同页展示');
          assert.equal((html.match(/class="student-growth-rank-student"/g)||[]).length,10,'学生得分榜固定前十人');
          assert.equal((html.match(/class="student-growth-grade-summary"/g)||[]).length,gradeCount,'所有年级同页展示');
          assert.ok(html.includes(gradeCount+'年级'),'最高年级可见');
          assert.ok(!html.includes('查看更多'),'不公开展开个人评价记录');
          for(const grade of combined.grades) {
            const scoped=selectGrowthScope(combined,grade.id);
            assert.equal(scoped.summary.totalStudents,12);
            assert.equal(scoped.summary.praisedStudents,12);
            assert.equal(scoped.summary.records,12*count);
            assert.ok(scoped.records.every(r=>r.studentId.startsWith(grade.id+'-')));
            const selected=renderToStaticMarkup(<StudentGrowthBoards snapshot={combined} selection={{...defaultGrowthBoardSelection(),gradeId:grade.id}} />);
            const board=selected.match(/<section[^>]*aria-label="学生得分榜"[\s\S]*?<\/section>/)[0];
            assert.ok(board.includes(grade.name+'2班'));
            assert.equal(selected,renderToStaticMarkup(<StudentGrowthBoards snapshot={scoped} selection={{...defaultGrowthBoardSelection(),gradeId:grade.id}} />),'全部八板块等价于先筛选完整年级明细再计算，不能混入其他年级');
            assert.equal((selected.match(/class="student-growth-grade-summary"/g)||[]).length,1,'年级风采只显示所选年级');
            assert.equal(selectGrowthRanking(combined,'total',grade.id)[0].rank,1);
          }
        }
        assert.equal(selectGrowthRanking(custom,names[count-1])[0].score,count,'新增指标参与真实聚合与排名');
      }
      // 构造12个班级，验证组件确实展示10行，不会保留旧TOP5限制。
      const manyClasses=Array.from({length:12},(_,index)=>({id:'many-s'+index,displayName:'测试学生'+index,classId:'many-c'+index,className:(index+1)+'班',gradeId:'many-g',gradeName:'一年级'}));
      const manySnapshot=selectGrowthSnapshot({...fixture,students:manyClasses,records:manyClasses.map((student,index)=>rec('many-r'+index,student,virtue,index+1))});
      const manyHtml=renderToStaticMarkup(<StudentGrowthBoards snapshot={manySnapshot} />);
      assert.ok(!manyHtml.includes('班级好表现'),'已移除板块及控件');
      for(const title of ['学生得分榜','班级积分榜','班级表扬榜','班级人均积分榜']) {
        const board=manyHtml.match(new RegExp('<section[^>]*aria-label="'+title+'"[\\s\\S]*?<\\/section>'))[0];
        assert.equal((board.match(/<li /g)||[]).length,10,title+'展示TOP10');
        assert.ok(board.includes('TOP 10'));
      }
      const gradeRanks=selectGrowthClassRanking(manySnapshot);
      assert.equal(gradeRanks.length,10,'同一年级超过10个班只展示前10名');
      assert.equal(gradeRanks[0].id,'many-c11');
      const roundTie=selectGrowthSnapshot({...fixture,students:manyClasses.slice(0,3),records:[rec('tie0',manyClasses[0],virtue,1.01),rec('tie1',manyClasses[1],virtue,1.04),rec('tie2',manyClasses[2],virtue,.9)]});
      assert.deepEqual(selectGrowthClassRanking(roundTie).map(row=>[row.rank,row.tied]),[[1,true],[1,true],[3,false]],'展示相同一位小数的人均积分时按并列名次处理');
      const starBoard=manyHtml.match(/<section[^>]*aria-label="成长之星"[\s\S]*?<\/section>/)[0];
      assert.equal((starBoard.match(/<li(?:\s|>)/g)||[]).length,3,'成长之星仍为TOP3');
      assert.ok(!starBoard.includes('主动帮助同学') && !starBoard.includes('<p>') && !starBoard.includes('在日常学习和活动中受到老师表扬'),'成长之星不再补写行为描述');
      assert.ok(starBoard.includes('随得分榜'),'明确前三名跟随得分榜筛选');
      assert.equal(selectGrowthClassRanking(manySnapshot,'many-g','total','praise').length,10);
      const missingPraise=selectGrowthSnapshot({...fixture,students:manyClasses,records:[]});
      assert.equal(selectGrowthClassRanking(missingPraise,'many-g','total','praise').length,0,'无表扬时不补足榜单');
      // 班级按全员人均积分比较；表扬人数去重，包括净积分为负的学生。
      const roster=[
        {id:'a1',displayName:'陈子涵',classId:'a',className:'1班',gradeId:'g1',gradeName:'一年级'},
        {id:'a2',displayName:'林思雨',classId:'a',className:'1班',gradeId:'g1',gradeName:'一年级'},
        {id:'b1',displayName:'吴浩然',classId:'b',className:'2班',gradeId:'g1',gradeName:'一年级'},
        {id:'b2',displayName:'王子轩',classId:'b',className:'2班',gradeId:'g1',gradeName:'一年级'},
        {id:'b3',displayName:'张诗涵',classId:'b',className:'2班',gradeId:'g1',gradeName:'一年级'},
        {id:'c1',displayName:'李明轩',classId:'c',className:'1班',gradeId:'g2',gradeName:'二年级'},
      ];
      const aggregated=selectGrowthSnapshot({...fixture,students:roster,records:[
        rec('a1+',roster[0],virtue,12),rec('a1++',roster[0],virtue,2),
        rec('b1+',roster[2],virtue,2),rec('b1-',roster[2],virtue,-7),rec('b2+',roster[3],wisdom,8),
        rec('c1+',roster[5],virtue,100),
      ]});
      const groups=selectGrowthClasses(aggregated,'g1');
      assert.equal(groups.length,2);
      assert.deepEqual(groups.map(g=>[g.total,g.points,g.average,g.praised]),[[2,14,7,1],[3,3,1,2]]);
      assert.equal(selectGrowthClassRanking(aggregated,'g1')[0].id,'a');
      assert.equal(selectGrowthClassRanking(aggregated,'g1','total','praise')[0].id,'b','表扬按比例排名，包含有过表扬但净分为负的学生');
      assert.equal(selectGrowthClassRanking(aggregated,'g1','崇德','praise')[0].id,'a');
      assert.deepEqual(selectGrowthClassRanking(aggregated,'missing'),[],'不存在年级不回退全校比较');
      assert.deepEqual(selectGrowthClassRanking(aggregated).map(row=>row.id),['c','a','b'],'未选年级按全校班级人均排序');
      assert.deepEqual(selectGrowthGradePraise(aggregated).map(g=>[g.total,g.praised]),[[5,3],[1,1]]);
      const mixedGradeBoard=boardHtml(renderToStaticMarkup(<StudentGrowthBoards snapshot={aggregated} />),'班级人均积分榜');
      assert.deepEqual(visibleClassNames(mixedGradeBoard),['二年级1班','一年级1班','一年级2班'],'全部年级统一排序，各年级班级不单独重置名次');
      assert.deepEqual([...mixedGradeBoard.matchAll(/class="student-growth-rank-position" aria-label="第(\d+)名"/g)].map(match=>Number(match[1])),[1,2,3]);
      const metricClassBoard=boardHtml(renderToStaticMarkup(<StudentGrowthBoards snapshot={aggregated} selection={{...defaultGrowthBoardSelection(),averageClassMetric:wisdom[0]}} />),'班级人均积分榜');
      assert.deepEqual(visibleClassNames(metricClassBoard),['一年级2班'],'卡片按所选指标的人均积分排序');
      const perPerson=selectGrowthSnapshot({...fixture,students:roster.slice(0,5),records:[rec('avg-a',roster[0],virtue,14),rec('avg-b',roster[2],virtue,18)]});
      assert.deepEqual(visibleClassNames(boardHtml(renderToStaticMarkup(<StudentGrowthBoards snapshot={perPerson} />),'班级人均积分榜')),['一年级1班','一年级2班'],'按人均7.0和6.0排名，不能按总分14和18排名');
      for(const className of ['4班','三年级4班']) {
        const fullClass=selectGrowthSnapshot({...fixture,students:[{...roster[0],gradeId:'g3',gradeName:'三年级',className}],records:[rec('full-class',roster[0],virtue,3)]});
        assert.deepEqual(visibleClassNames(boardHtml(renderToStaticMarkup(<StudentGrowthBoards snapshot={fullClass} />),'班级人均积分榜')),['三年级4班'],'完整名称必须直接可见，并避免重复拼接年级');
      }
      assert.ok(selectGrowthPublicPraise(aggregated,'g1').every(item=>item.record.delta>0 && item.student.gradeId==='g1'));
      const publicOnly=selectGrowthSnapshot({...fixture,students:[roster[0]],records:[{...rec('private',roster[0],virtue,987654),publicBehavior:'主动帮助同学',privateRemark:'完整私密评价'}]});
      const publicHtml=renderToStaticMarkup(<StudentGrowthBoards snapshot={publicOnly} />);
      const personBoard=publicHtml.match(/<section[^>]*aria-label="学生得分榜"[\s\S]*?<\/section>/)[0];
      assert.ok(personBoard.includes('987,654') && publicHtml.includes('陈子涵') && !publicHtml.includes('完整私密评价'),'公开积分列，完整评价原文仍不公开');
      const visibleScoreHtml=renderToStaticMarkup(<GrowthRankingList title="综合榜" rows={[{student:people[0],score:987654,rank:1,tied:true}]} limit={10} />);
      assert.ok(visibleScoreHtml.includes('987,654') && visibleScoreHtml.includes('并列第1名'),'积分可见且保留并列名次');
      const selectedMetricHtml=renderToStaticMarkup(<StudentGrowthBoards snapshot={checked} selection={{...defaultGrowthBoardSelection(),studentMetric:virtue[0]}} />);
      const metricScores=[...boardHtml(selectedMetricHtml,'学生得分榜').matchAll(/class="student-growth-rank-score">([^<]+)/g)].map(match=>match[1]);
      assert.deepEqual(metricScores,['8','5','3'],'切换指标后显示该指标净积分，不能继续显示综合分');
      assert.ok(boardHtml(selectedMetricHtml,'成长之星').includes('并列')===false,'该指标前三名没有并列，不补写并列');
      assert.equal((boardHtml(publicHtml,'成长之星').match(/<li(?:\s|>)/g)||[]).length,1,'不足三人时不伪造补位');
      const changedCards=renderToStaticMarkup(<StudentGrowthBoards snapshot={snapshot} selection={{...defaultGrowthBoardSelection(),studentMetric:virtue[0],classMetric:virtue[0],praiseMetric:virtue[0],gradeMetric:virtue[0],averageClassMetric:virtue[0]}} />);
      assert.equal(boardHtml(changedCards,'成长动态'),boardHtml(defaultBoards,'成长动态'),'各卡片指标切换不改变全局年级下的最新成长动态');
      const loginHtml=renderToStaticMarkup(<StudentGrowthAccountDialog onClose={()=>{}} />);
      // Arco弹窗在服务端不渲染Portal，私人数据仍不能从公开快照解锁。
      assert.ok(!loginHtml.includes('987654'));
      assert.equal(growthStudentClassName({gradeName:'七年级',className:'2班'}),'七年级2班');
      assert.equal(growthStudentClassName({gradeName:'七年级',className:'七年级2班'}),'七年级2班','完整班名不重复添加年级');
      const html=renderToStaticMarkup(<StudentGrowthContent snapshot={snapshot} reducedMotion />);
      assert.equal((html.match(/aria-label="学生荣誉榜年级"/g)||[]).length,1,'整个页面只保留一个全局年级筛选');
      assert.ok(!defaultBoards.includes('student-growth-select'),'八张卡片内均不再提供年级下拉');
      const activity=boardHtml(defaultBoards,'成长动态');
      assert.equal((activity.match(/<li /g)||[]).length,6,'成长动态由三条增加为六条紧凑记录');
      const recent=selectGrowthPublicPraise(snapshot).sort((a,b)=>b.record.timestamp-a.record.timestamp||a.record.id.localeCompare(b.record.id)).slice(0,6);
      assert.deepEqual([...activity.matchAll(/dateTime="([^"]+)"/g)].map(match=>Date.parse(match[1])),recent.map(item=>item.record.timestamp),'六条记录按最新时间排序');
      assert.ok(activity.includes(recent[0].record.indicatorPath.join('-')) && activity.includes('+'+recent[0].record.delta+'分'),'公开动态包含完整三级指标和加分');
      for(const forbidden of ['近7天','轮播','暂停','年级专场','进步榜','坚持榜','示例','模拟']) assert.ok(!html.includes(forbidden),forbidden);
      const empty=selectGrowthSnapshot({...fixture,students:[],records:[],indicatorPaths:[]});
      const emptyHtml=renderToStaticMarkup(<StudentGrowthContent snapshot={empty} reducedMotion />);
      assert.ok(emptyHtml.includes('暂无上榜学生') && !emptyHtml.includes('NaN'));
      assert.ok(renderToStaticMarkup(<StudentGrowthBoards snapshot={negative} />).includes('暂无上榜学生'),'有榜单但无正分学生时保留空榜');
      const rootHtml=renderToStaticMarkup(<StudentGrowthScreen />);
      assert.ok(rootHtml.includes('<span>学生荣誉榜</span>') && !rootHtml.includes('screen-panorama-navigation') && !rootHtml.includes('近7天'),'荣誉榜使用独立标题，不挂载驾驶舱页签');
      assert.ok(renderToStaticMarkup(<SchoolCockpitEntry />).includes('学校驾驶舱'));
      assert.ok(renderToStaticMarkup(<StudentHonorEntry />).includes('学生荣誉榜'));
      assert.deepEqual(getStudentGrowthLayout(1280,720),{compact:false,scale:2/3,width:1920,height:1080});
      assert.equal(getStudentGrowthLayout(390,844).compact,true);
      assert.equal(getStudentGrowthLayout(2560,1080).width,2560);
      console.log('学生全景检查通过：全局年级联动八板块、独立指标、六条紧凑动态、个人积分列、成长之星无补写描述、三榜TOP10及全校/年级人均班级TOP10、5/6/10指标与6/9/12年级、同源聚合及私密记录隔离。');
    ` },
    outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, metafile: true, logLevel: 'silent',
  });
  assert.ok(!Object.keys(bundled.metafile.inputs).some(file => file.startsWith('components/data-screen/') || file.startsWith('components/demo-data-screen/')), '新大屏不能导入现有大屏的展示组件或状态');
  await import(pathToFileURL(output).href);
  const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
  assert.ok(app.includes("(currentApp === 'data-screen' || currentApp === 'moral-education-screen' || currentApp === 'student-growth-screen') && <ScreenPanoramaHost"));
  assert.ok(app.includes("currentApp === 'school-pc-screen' && <SchoolPcDataScreen />"));
  assert.ok(app.includes("app === 'student-growth-screen'"));
  assert.ok(app.includes("app === 'student-honor-screen'") && app.includes("currentApp === 'student-honor-screen' && <StudentHonorScreen />"),'荣誉榜地址独立打开学生看板');
  const menu = fs.readFileSync(path.join(root, 'components/SchoolScreenEntries.tsx'), 'utf8');
  assert.ok(menu.includes('href="?app=data-screen"') && menu.includes('href="?app=student-honor-screen"'));
  console.log('入口地址与现有两个方案的独立映射通过');
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
