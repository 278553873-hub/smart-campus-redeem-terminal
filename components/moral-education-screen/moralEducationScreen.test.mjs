import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const cache = path.join(root, 'node_modules/.cache');
fs.mkdirSync(cache, { recursive: true });
const directory = fs.mkdtempSync(path.join(cache, 'moral-screen-check-'));
try {
  const output = path.join(directory, 'checks.mjs');
  const bundled = await build({
    stdin: { resolveDir: root, loader: 'tsx', contents: String.raw`
      import assert from 'node:assert/strict';
      import React from 'react';
      import { renderToStaticMarkup as render } from 'react-dom/server';
      import { loadMoralScreenDataset, selectMoralScreen, roundMoralScore, rankMoralProblems } from './components/moral-education-screen/moralEducationScreenModel';
      import { createDashboardDonutOption } from './components/charts/DashboardDonutChart';
      import * as echarts from 'echarts/core';
      import { PieChart } from 'echarts/charts';
      import { SVGRenderer } from 'echarts/renderers';
      import { buildMoralGradePages } from './components/moral-education-screen/moralEducationScreenGrades';
      import { createMoralScreenDemoSnapshot, MORAL_DEMO_CLASS_COUNTS } from './components/moral-education-screen/moralEducationScreenDemo';
      import { countMoralEvaluationEvents } from './components/moral-education-screen/moralEducationScreenEvaluations';
      import Screen, { MoralEducationContent } from './components/moral-education-screen/MoralEducationScreen';
      import { MoralOverview, MoralRanking, MoralProblems, MoralProblemRankingList } from './components/moral-education-screen/MoralEducationPanels';
      import { MoralGradeProblems, MoralGradeProblemPage } from './components/moral-education-screen/MoralGradeProblems';
      import { MoralProblemChanges } from './components/moral-education-screen/MoralProblemChanges';
      import { MoralTrend, MoralTrendChart } from './components/moral-education-screen/MoralTrend';
      import { getMoralBarMaximum, getMoralBarRatio } from './components/moral-education-screen/moralChartScale';
      import { MoralGradeRankings, MoralGradeRankingPage } from './components/moral-education-screen/MoralGradeRankings';
      import { MoralProblemDistribution } from './components/moral-education-screen/MoralProblemDistribution';
      import { getMoralEducationCockpitPeriods, getMoralEducationCockpitSnapshot } from './mobile-app/services/moralEducationCockpitService';
      import { SchoolCockpitEntry, StudentHonorEntry } from './components/SchoolScreenEntries';
      const sourcePeriods = await getMoralEducationCockpitPeriods('week');
      const sourceBefore = JSON.stringify(sourcePeriods);
      const dataset = await loadMoralScreenDataset();
      assert.equal(JSON.stringify(sourcePeriods), sourceBefore, '不修改共享报表周期');
      assert.equal(dataset.periods.length, sourcePeriods.length - 2, '排除无效日期，不改写源日期');
      assert.ok(dataset.periods.every(period => /^\d{4}-\d{2}-\d{2}$/.test(period.startDate)));
      const latest = dataset.periods.at(-1);
      assert.equal(latest.startDate, '2026-10-03');
      assert.equal(latest.endDate, '2026-10-09');
      const original = JSON.stringify(dataset);
      const snapshot = selectMoralScreen(dataset, latest.id);
      for(const values of [[81,306],[.1,.2],[0,0],[]]) {
        const maximum=getMoralBarMaximum(values);
        assert.ok(Number.isFinite(maximum)&&maximum>0);
        for(const value of values) assert.equal(getMoralBarRatio(value,maximum),value/maximum,'条形长度采用实际数值，不套用百分制门槛');
      }
      assert.equal(getMoralBarMaximum([.1,.2]),.2,'小数扣分也按自己的真实最大值绘图');
      for(const value of [NaN,Infinity,-1]) assert.equal(getMoralBarRatio(value,0),0,'零数据和异常值不产生无效尺寸');
      const source = await getMoralEducationCockpitSnapshot({periodType:'week',periodId:latest.id});
      const sourceCopy=JSON.stringify(source);
      const demoSource=createMoralScreenDemoSnapshot(source);
      assert.equal(JSON.stringify(source),sourceCopy,'模拟数据不改写共享手机端报表');
      assert.deepEqual(demoSource,dataset.snapshots.at(-1),'页面实际加载差异班数的模拟名册');
      assert.deepEqual(snapshot.grades.map(grade=>grade.classCount),[5,8,12,6,10,7]);
      assert.equal(snapshot.summary.classCount, 48);
      assert.equal(snapshot.grades.length, 6);
      assert.equal(snapshot.dimensions.length, 5);
      assert.deepEqual(snapshot.dimensions, demoSource.gradeReports.find(report=>report.gradeId==='all').dimensions);
      assert.equal(snapshot.summary.deduction, source.summary.cumulativeDeduction);
      assert.equal(snapshot.summary.issueCount, source.summary.issueCount);
      assert.equal(snapshot.summary.averageScore, demoSource.summary.averageScore);
      assert.equal(snapshot.summary.evaluationCount,89,'评价次数读取独立发起事件，不用记录条数代替');
      for(const evaluationCount of [0,123]) assert.equal(createMoralScreenDemoSnapshot({...source,summary:{...source.summary,evaluationCount}}).summary.evaluationCount,evaluationCount,'已有评价次数字段优先，零值不被模拟数据覆盖');
      const event={id:'one',occurredAt:'2026-10-03T08:00:00+08:00',classIds:['a','b','c'],status:'published'};
      assert.equal(countMoralEvaluationEvents([event,event,{...event,id:'two',classIds:['d']}],latest),2,'多班评价及重复记录按发起ID去重');
      assert.equal(countMoralEvaluationEvents([
        {...event,id:'first',occurredAt:'2026-10-02T16:00:00Z'},
        {...event,id:'last',occurredAt:'2026-10-09T15:59:59Z'},
        {...event,id:'before',occurredAt:'2026-10-02T15:59:59Z'},
        {...event,id:'after',occurredAt:'2026-10-09T16:00:00Z'},
        {...event,id:'draft',status:'draft'}, {...event,id:'voided',status:'voided'},
        {...event,id:'invalid',occurredAt:'invalid'}, {...event,id:'empty',classIds:[]},
      ],latest),2,'按中国时区计入周期首末日，忽略草稿、撤销和无效事件');
      assert.equal(roundMoralScore(snapshot.classes.reduce((sum,item)=>sum+item.deduction,0)),snapshot.summary.deduction);
      assert.equal(snapshot.classes.reduce((sum,item)=>sum+item.issueCount,0),snapshot.summary.issueCount);
      assert.ok(snapshot.classes.every(item=>item.score>=0 && item.score<=item.maxScore && roundMoralScore(item.score+item.deduction)===item.maxScore));
      assert.equal(snapshot.problems.reduce((sum,item)=>sum+item.recordCount,0), snapshot.summary.issueCount);
      assert.equal(roundMoralScore(snapshot.problems.reduce((sum,item)=>sum+item.deduction,0)), snapshot.summary.deduction);
      assert.ok(snapshot.classes.every(item=>/^[一二三四五六]年级\d+班$/.test(item.name)), '完整年级和班级，不使用入学年份缩写');
      for (const item of snapshot.classes) {
        const ties = snapshot.classes.filter(other=>other.score===item.score);
        assert.equal(item.rank, snapshot.classes.findIndex(other=>other.score===item.score)+1);
        assert.equal(item.tied, ties.length>1);
      }
      assert.ok(snapshot.classes.some(item=>item.tied), '实际数据包含并列名次');
      assert.ok(snapshot.problems.every(item=>item.path.length===3 && item.path[2]===item.name));
      assert.ok(snapshot.problems.every((item,index)=>!index || snapshot.problems[index-1].recordCount>=item.recordCount));
      const expectedTrend=await Promise.all(dataset.periods.slice(-5).map(async period=>(await getMoralEducationCockpitSnapshot({periodType:'week',periodId:period.id})).trend.at(-1)));
      assert.equal(snapshot.trend.length,5);
      assert.deepEqual(snapshot.trend,expectedTrend,'最近五个周期均直接读取手机端原报表数值');
      const phoneProblems=source.gradeReports.find(item=>item.gradeId==='all').problemDimensions;
      assert.deepEqual(snapshot.problemDistribution.map(({id,name,recordCount})=>({id,name,recordCount})),phoneProblems.map(({id,name,recordCount})=>({id,name,recordCount})),'全校问题分布一级指标及条数与手机端一致');
      assert.equal(snapshot.problemDistribution.reduce((sum,item)=>sum+item.recordCount,0),source.summary.issueCount);
      assert.ok(Math.abs(snapshot.problemDistribution.reduce((sum,item)=>sum+item.percentage,0)-100)<1e-8);
      for (const grade of snapshot.grades) {
        const scoped = selectMoralScreen(dataset, latest.id, grade.id);
        assert.equal(scoped.classes.length,grade.classCount, '选年级后对完整名册重排，不筛选全校前十');
        assert.ok(scoped.classes.every(item=>item.gradeId===grade.id));
        assert.equal(scoped.summary.issueCount,grade.issueCount);
        assert.deepEqual(scoped.dimensions,demoSource.gradeReports.find(report=>report.gradeId===grade.id).dimensions);
        assert.equal(roundMoralScore(grade.ranking.reduce((sum,item)=>sum+item.deduction,0)),scoped.summary.deduction);
        assert.equal(grade.ranking.reduce((sum,item)=>sum+item.issueCount,0),grade.issueCount);
        assert.deepEqual(scoped.trend,expectedTrend,'德育趋势固定读取手机端全校报表最近五个周期');
        assert.deepEqual(scoped.problemDistribution,snapshot.problemDistribution,'问题分布固定全校范围');
      }
      assert.equal(selectMoralScreen(dataset,'unknown'),null,'不存在的周期不回退到别期');
      assert.equal(selectMoralScreen({periods:[],snapshots:[]},latest.id),null);
      assert.deepEqual(selectMoralScreen(dataset,dataset.periods[0].id).trend,(await getMoralEducationCockpitSnapshot({periodType:'week',periodId:dataset.periods[0].id})).trend.slice(-1),'历史不足五期时仅展示实际有效周期');
      assert.equal(selectMoralScreen(dataset,dataset.periods[2].id).trend.length,3,'不足五个有效周期时不重复补齐');
      assert.equal(JSON.stringify(dataset),original,'筛选不改写源班级和名次');
      const html = render(<MoralEducationContent snapshot={snapshot} />);
      assert.ok(!html.includes('考核周') && !html.includes('arco-select'),'大屏不显示考核周文字或周期选择框');
      assert.equal((html.match(/<section /g)||[]).length,8);
      for (const title of ['班级评价概况','全校排行榜 TOP10','年级高频问题 TOP3','问题分布','年级排行榜','全校高频问题 TOP5','近期问题变化','德育趋势']) assert.ok(html.includes(title));
      assert.ok(!html.includes('各年级高频问题 TOP3'),'年级高频问题标题使用精简名称');
      assert.ok(!html.includes('高频待改进事项'),'同类卡片统一命名为高频问题');
      for(const [,rank] of html.matchAll(/class="moral-(?:rank|problem-index)"[^>]*>(\d+)<\/span>/g)) assert.ok(/^(?:0[1-9]|[1-9]\d+)$/.test(rank),'全页榜单名次统一至少两位，不足两位补零');
      assert.ok(html.indexOf('全校高频问题 TOP5')<html.indexOf('年级高频问题 TOP3')&&html.indexOf('年级高频问题 TOP3')<html.indexOf('近期问题变化')&&html.indexOf('近期问题变化')<html.indexOf('德育趋势'),'全校高频问题 TOP5在左，年级高频问题紧随其后');
      for (const hidden of ['班级得分分布','各年级待改进记录','已评价班级数','参与评价教师数','班级荣誉','问题跟进']) assert.ok(!html.includes(hidden));
      const overview=render(<MoralOverview snapshot={snapshot} />);
      assert.equal((overview.match(/class="moral-metric"/g)||[]).length,5,'顶部五项统计，评价次数独立展示');
      assert.ok(overview.includes('评价次数')&&overview.includes('89<small>次</small>'));
      assert.ok(html.indexOf('全校排行榜 TOP10')<html.indexOf('年级排行榜')&&html.indexOf('年级排行榜')<html.indexOf('问题分布'),'两类排行榜相邻，问题分布卡在右侧');
      const schoolRanking=render(<MoralRanking snapshot={snapshot} />);
      assert.equal((schoolRanking.match(/<li(?:\s|>)/g)||[]).length,10,'全校排行榜固定展示前十班');
      assert.ok(!schoolRanking.includes('<button'),'全校TOP10不再分页');
      assert.ok(!schoolRanking.includes('moral-score-track'),'排行榜不添加得分条');
      for(const item of snapshot.classes.slice(0,10)) assert.ok(schoolRanking.includes(item.name));
      for(let page=0;page<2;page++) {
        const gradePage=render(<MoralGradeRankingPage grades={snapshot.grades} page={page} />);
        assert.equal((gradePage.match(/<article /g)||[]).length,3,'每屏三个年级');
        assert.equal((gradePage.match(/<ol /g)||[]).length,3,'每个年级保持排名榜单');
        assert.equal((gradePage.match(/<li(?:\s|>)/g)||[]).length,MORAL_DEMO_CLASS_COUNTS.slice(page*3,page*3+3).reduce((sum,count)=>sum+count,0),'每个年级一次展示全部班级');
        assert.ok(!gradePage.includes('扣分') && !gradePage.includes('待改进') && !gradePage.includes('<button'),'年级榜只保留名次、班级、得分');
        for(const grade of snapshot.grades.slice(page*3,page*3+3)) {
          assert.ok(gradePage.includes(grade.name+'班级排行榜'));
          const sourceGrade=demoSource.grades.find(item=>item.id===grade.id);
          assert.deepEqual(grade.ranking.map(item=>item.id),sourceGrade.classes.map(item=>item.id));
          assert.equal(grade.ranking[0].rank,1,'年级内部重新排名，从第一名开始');
          for(const item of grade.ranking) assert.ok(gradePage.includes(item.name));
        }
      }
      const allGrades=Array.from({length:12},(_,index)=>({...snapshot.grades[index%6],id:'grade-'+index,name:(index+1)+'年级'}));
      for(let page=0;page<4;page++) assert.equal((render(<MoralGradeRankingPage grades={allGrades} page={page} />).match(/<article /g)||[]).length,3);
      const singleGrade=render(<MoralGradeRankings snapshot={{...snapshot,grades:snapshot.grades.slice(0,1)}} />);
      assert.ok(!singleGrade.includes('<button') && !singleGrade.includes('第1屏'),'只有一屏时无无效控制或页码');
      const gradeRanking=render(<MoralGradeRankings snapshot={snapshot} />);
      assert.ok(!gradeRanking.includes('<button') && !gradeRanking.includes('tabindex') && gradeRanking.includes('第1屏，共2屏'),'自动换组且仅显示被动页码，不需操作');
      const mixedGrades=[5,12,8,1,0,19].map((count,index)=>({
        ...snapshot.grades[index],
        ranking:Array.from({length:count},(_,i)=>({...snapshot.grades[index].ranking[i%5],id:'g'+index+'-class'+i,name:snapshot.grades[index].name+(i+1)+'班',rank:i+1})),
        classCount:count,
      }));
      const mixedBefore=JSON.stringify(mixedGrades);
      const mixedPages=buildMoralGradePages(mixedGrades);
      assert.deepEqual(mixedPages.map(page=>page.groupIndex),[0,1,1],'十二班以内一屏完整展示，超过十二班自动补完再切换年级组');
      assert.deepEqual(mixedPages[0].grades.map(grade=>[grade.from,grade.to,grade.total]),[[1,5,5],[1,12,12],[1,8,8]]);
      assert.deepEqual(mixedPages[2].grades.map(grade=>[grade.from,grade.to,grade.total]),[[1,1,1],[0,0,0],[13,19,19]],'更长名册自动展示末页，短名册保留完整信息');
      for(const grade of mixedGrades) {
        const visible=mixedPages.flatMap(page=>page.grades.filter(item=>item.id===grade.id).flatMap(item=>item.rows));
        assert.deepEqual([...new Set(visible.map(item=>item.id))],grade.ranking.map(item=>item.id),'任意班数的每个班都能完整到达');
      }
      for(const page of mixedPages) for(const grade of page.grades) assert.ok(grade.rows.length<=12,'容纳十二班且不缩小字号');
      assert.equal(JSON.stringify(mixedGrades),mixedBefore,'分页不改写班级名册、排序或名次');
      const firstMixed=render(<MoralGradeRankingPage grades={mixedGrades} page={0} />);
      assert.ok(firstMixed.includes('二年级12班') && firstMixed.includes('二年级1班') && !firstMixed.includes('个班'),'十二班当前屏全部展示，年级标题不显示班级数量');
      for(const column of ['名次','班级','得分']) assert.ok(firstMixed.includes(column));
      const lastMixed=render(<MoralGradeRankingPage grades={mixedGrades} page={2} />);
      assert.ok(lastMixed.includes('六年级19班') && !lastMixed.includes('13–19 / 19班'));
      assert.ok(!render(<MoralGradeRankings snapshot={{...snapshot,grades:[mixedGrades[1]]}} />).includes('第1屏'),'单年级十二班一屏显示，不增加分页');
      const fifteen={...snapshot.grades[2],classCount:15,ranking:Array.from({length:15},(_,i)=>({...snapshot.grades[2].ranking[0],id:'fifteen-'+i,name:'三年级'+(i+1)+'班',rank:i+1}))};
      const fifteenGrades=[fifteen,...snapshot.grades.slice(0,2),snapshot.grades[3]];
      const fifteenPages=buildMoralGradePages(fifteenGrades);
      assert.deepEqual(fifteenPages.map(page=>page.groupIndex),[0,0,1],'15班所在组先自动展示完，再切下一组');
      assert.equal(fifteenPages[0].grades[0].rows.length,12);
      assert.deepEqual(fifteenPages[1].grades[0].rows.map(item=>item.rank),[13,14,15],'剩余3班保留原名次，不重新从第一名开始');
      const fifteenLast=render(<MoralGradeRankingPage grades={fifteenGrades} page={1} />);
      assert.ok(fifteenLast.includes('三年级15班') && !fifteenLast.includes('13–15 / 15班') && !fifteenLast.includes('<button'),'15班自动补完，保留实际名次且不显示年级班数，无需操作');
      assert.deepEqual(buildMoralGradePages([]),[]);
      assert.deepEqual(buildMoralGradePages([mixedGrades[4]])[0].grades[0].rows,[]);
      assert.equal(snapshot.grades.reduce((sum,item)=>sum+item.issueCount,0),snapshot.summary.issueCount,'各年级待改进条数合计与全校一致');
      const flattenProblems=report=>report.problemDimensions.flatMap(dimension=>dimension.categories.flatMap(category=>category.details.map(detail=>({...detail,path:[dimension.name,category.name,detail.name],dimensionId:dimension.id})))).sort((a,b)=>b.recordCount-a.recordCount||b.deduction-a.deduction||a.id.localeCompare(b.id));
      for(const [index,grade] of snapshot.grades.entries()) {
        const expected=flattenProblems(source.gradeReports.find(report=>report.gradeId===grade.id)).slice(0,3);
        assert.deepEqual(grade.topProblems,expected,'各年级从自己完整问题数据中取前三项');
        const gradePage=render(<MoralGradeProblemPage grades={snapshot.grades} page={Math.floor(index/3)} />);
        assert.ok(gradePage.includes(grade.name));
        const total=source.gradeReports.find(report=>report.gradeId===grade.id).problemDimensions.reduce((sum,item)=>sum+item.recordCount,0);
        assert.equal(grade.issueCount,total,'年级总问题条数来自完整报表，不使用TOP3合计');
        assert.ok(render(<MoralGradeProblemPage grades={[grade]} />).includes('总<strong>'+total.toLocaleString('zh-CN')+'</strong>条'),'年级名称旁精简显示该年级全部问题条数');
        for(const item of expected) assert.ok(gradePage.includes(item.name)&&gradePage.includes('aria-label="'+item.recordCount.toLocaleString('zh-CN')+'条">'+item.recordCount.toLocaleString('zh-CN')+'</strong>'));
      }
      for(const grades of [snapshot.grades,allGrades.slice(0,7)]) {
        const seen=[];
        for(let page=0;page<Math.ceil(grades.length/3);page++) {
          const group=grades.slice(page*3,page*3+3);
          const gradePage=render(<MoralGradeProblemPage grades={grades} page={page} />);
          assert.equal((gradePage.match(/<article /g)||[]).length,group.length,'每屏三个年级，末屏保留实际年级数');
          assert.equal((gradePage.match(/<li(?:\s|>)/g)||[]).length,group.reduce((sum,grade)=>sum+grade.topProblems.length,0),'各年级前三项完整展示，不足三项不补数据');
          for(const grade of grades) assert.equal(gradePage.includes(grade.name+'高频问题前三项'),group.some(item=>item.id===grade.id),'分组不遗漏或重复年级');
          seen.push(...group.map(grade=>grade.id));
        }
        assert.deepEqual(seen,grades.map(grade=>grade.id));
      }
      assert.ok(snapshot.grades.some(grade=>grade.topProblems.length===3),'有三项以上问题的年级完整展示前三项');
      const gradeProblems=render(<MoralGradeProblems snapshot={snapshot} />);
      assert.ok(!gradeProblems.includes('<button')&&gradeProblems.includes('第1屏，共2屏'),'六个年级自动分两屏，保留单行问题名称');
      assert.ok(!render(<MoralGradeProblems snapshot={{...snapshot,grades:snapshot.grades.slice(0,3)}} />).includes('第1屏'),'三个以内年级只有一屏，不展示无效页码');
      assert.ok(!gradeProblems.includes('moral-data-bar')&&!gradeProblems.includes('width:'),'年级高频问题移除进度条及对应刻度');
      assert.equal((gradeProblems.match(/class="moral-problem-index"/g)||[]).length,snapshot.grades.slice(0,3).reduce((sum,grade)=>sum+grade.topProblems.length,0),'每项问题展示独立名次，保留真实条数和指标名称');
      for(const [,row] of gradeProblems.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) assert.ok(row.indexOf('moral-problem-index')<row.indexOf('moral-grade-problem-name')&&row.indexOf('moral-grade-problem-name')<row.indexOf('moral-data-number'),'年级问题固定按序号、指标、数量排列');
      const previous=dataset.snapshots.at(-2).gradeReports.find(report=>report.gradeId==='all');
      for(const item of snapshot.problemChanges) {
        const current=phoneProblems.find(problem=>problem.id===item.id)?.recordCount??0;
        const before=previous.problemDimensions.find(problem=>problem.id===item.id)?.recordCount??0;
        assert.deepEqual([item.currentCount,item.previousCount,item.delta],[current,before,current-before],'变化比较原报表相邻有效周期条数');
      }
      assert.ok(selectMoralScreen(dataset,dataset.periods[0].id).problemChanges.every(item=>item.delta===null),'无上期不编造变化');
      const noCurrentProblems={...demoSource,gradeReports:demoSource.gradeReports.map(report=>report.gradeId==='all'?{...report,problemDimensions:[]}:report)};
      const zeroChanges=selectMoralScreen({periods:dataset.periods.slice(-2),snapshots:[dataset.snapshots.at(-2),noCurrentProblems]},latest.id).problemChanges;
      assert.ok(zeroChanges.every(item=>item.currentCount===0&&item.delta===-item.previousCount),'本期零条的指标仍完整显示');
      const changeHtml=render(<MoralProblemChanges snapshot={{...snapshot,problemChanges:[
        {...snapshot.problemChanges[0],id:'up',delta:3}, {...snapshot.problemChanges[1],id:'down',delta:-2},
        {...snapshot.problemChanges[2],id:'same',delta:0}, {...snapshot.problemChanges[3],id:'none',delta:null},
      ]}} />);
      for(const value of ['+3<small>条</small>','-2<small>条</small>','持平','—']) assert.ok(changeHtml.includes(value));
      assert.ok(!changeHtml.includes('<button')&&!changeHtml.includes('分</small>'),'问题变化只比较条数，无操作和评分分段');
      const comparison=render(<MoralProblemChanges snapshot={{...snapshot,problemChanges:[
        {...snapshot.problemChanges[0],currentCount:3,previousCount:6,delta:-3},
        {...snapshot.problemChanges[1],currentCount:0,previousCount:null,delta:null},
      ]}} />);
      for(const value of ['height:100%','height:50%','height:0%','上期6条','本期3条','上期暂无数据']) assert.ok(comparison.includes(value),'纵向柱高按真实条数采用共同刻度，缺失与零值分别处理');
      assert.equal((comparison.match(/class="moral-change-column /g)||[]).length,4,'每项指标并列展示上期、本期两根纵向柱');
      const distribution=render(<MoralProblemDistribution snapshot={snapshot} />);
      assert.equal((distribution.match(/data-problem-dimension=/g)||[]).length,phoneProblems.length);
      assert.ok(distribution.includes('dashboard-donut-chart')&&!distribution.includes('<svg')&&!distribution.includes('<circle'),'使用通用看板环形图，不自绘图形');
      for(const item of snapshot.problemDistribution) assert.ok(distribution.includes(item.name+'，'+Number(item.percentage.toFixed(1))+'%，'+item.recordCount+'条'));
      assert.ok(!distribution.includes('<button')&&!distribution.includes('扣分')&&!distribution.includes('平均得分'),'问题分布只显示一级指标百分比和条数，无展开或旧评分详情');
      const countsOnly=selectMoralScreen({periods:[latest],snapshots:[{...demoSource,gradeReports:[{...demoSource.gradeReports[0],problemDimensions:phoneProblems.slice(0,2).map((item,index)=>({...item,recordCount:index?3:1}))}]}]},latest.id);
      assert.deepEqual(countsOnly.problemDistribution.map(item=>item.percentage),[25,75],'占比按记录条数计算，不用扣分比例替代');
      const singleDistribution=render(<MoralProblemDistribution snapshot={{...snapshot,problemDistribution:[{id:'single',name:'单一问题',recordCount:3,percentage:100}]}} />);
      assert.ok(singleDistribution.includes('100%')&&!singleDistribution.includes('NaN'),'单一指标完整成环');
      echarts.use([PieChart,SVGRenderer]);
      for(const data of [[{name:'甲',value:1,color:'#f5a623',gradient:{from:'#ffd17b',to:'#d7871a'}},{name:'乙',value:3,color:'#70a8de',gradient:{from:'#9acbfa',to:'#4f85be'}}],[{name:'单项',value:4,color:'#f5a623'}],[]]) {
        const chart=echarts.init(null,undefined,{renderer:'svg',ssr:true,width:400,height:400});
        chart.setOption(createDashboardDonutOption(data));
        const svg=chart.renderToSVGString();
        assert.ok(svg.includes('<svg')&&!svg.includes('NaN')&&!svg.includes('Infinity'),'ECharts真实渲染环形分段、单项和空数据');
        if(data.some(item=>item.gradient)) assert.ok(svg.includes('<linearGradient'),'渐变使用ECharts标准填充渲染');
        assert.deepEqual(chart.getOption().series[0].data.map(item=>item.value),data.map(item=>item.value),'通用图表直接使用真实条数');
        chart.dispose();
      }
      const rankingFixture=[{...snapshot.problems[0],id:'many-records',recordCount:20,deduction:2},{...snapshot.problems[0],id:'many-points',recordCount:3,deduction:10},{...snapshot.problems[0],id:'tie-records',recordCount:20,deduction:5}];
      const rankingCopy=JSON.stringify(rankingFixture);
      assert.deepEqual(rankMoralProblems(rankingFixture,'recordCount').map(item=>item.id),['tie-records','many-records','many-points']);
      assert.deepEqual(rankMoralProblems(rankingFixture,'deduction').map(item=>item.id),['many-points','tie-records','many-records']);
      assert.equal(JSON.stringify(rankingFixture),rankingCopy,'切换排序不改写原报表');
      const problemPanel=render(<MoralProblems snapshot={snapshot} />);
      assert.equal((problemPanel.match(/role="tab"/g)||[]).length,2);
      assert.ok(problemPanel.includes('按条数')&&problemPanel.includes('按分数')&&!problemPanel.includes('按记录条数排序'));
      assert.equal((problemPanel.match(/<li(?:\s|>)/g)||[]).length,5,'不同排序均展示前五项');
      for(const metric of ['recordCount','deduction']) {
        const list=render(<MoralProblemRankingList problems={snapshot.problems} metric={metric} />);
        const rows=rankMoralProblems(snapshot.problems,metric).slice(0,5);
        assert.ok(!list.includes('moral-data-bar')&&!list.includes('width:'),'两个排序标签均仅显示名次、三级指标与数值，不展示进度条');
        for(const item of rows) {
          assert.ok(list.includes('class="moral-problem-path">'+item.name+'</span>'),'只显示第三级指标名称');
          assert.ok(!list.includes(item.path.join(' / ')),'不展示一级、二级指标路径');
        }
        assert.ok(!list.includes('<p')&&!list.includes('<br'),'指标名称保持单行展示');
        const unit=metric==='recordCount'?'条':'分';
        const hiddenUnit=metric==='recordCount'?'分':'条';
        assert.equal((list.match(new RegExp('<small>'+unit+'</small>','g'))||[]).length,5);
        assert.ok(!list.includes('<small>'+hiddenUnit+'</small>'),'只展示当前标签对应的数值');
      }
      for(const metric of ['averageScore','deduction']) {
        const trend=render(<MoralTrendChart snapshot={snapshot} metric={metric} />);
        for(const point of expectedTrend) assert.ok(trend.includes(point.label+'，'+point[metric].toLocaleString('zh-CN',{maximumFractionDigits:1})+'分'),'两类趋势最近五期均对应手机端数值');
        assert.ok(trend.includes('class="moral-trend-area"')&&trend.includes('class="moral-trend-value is-latest"'),'趋势包含渐变面积和最新值强调');
        assert.ok(!trend.includes('<tspan'),'五个周期的日期范围完整单行展示');
        for(const point of expectedTrend) assert.ok(trend.includes('class="moral-trend-axis">'+point.label+'</text>'),'日期不拆分起止时间');
        assert.ok(!trend.includes('NaN')&&!trend.includes('Infinity'));
        const single=render(<MoralTrendChart snapshot={{...snapshot,trend:[{...expectedTrend[0],averageScore:0,deduction:0}]}} metric={metric} />);
        assert.ok(!single.includes('NaN')&&!single.includes('Infinity'),'单周期和零值仍能绘制有效图形');
      }
      const trendPanel=render(<MoralTrend snapshot={snapshot} />);
      assert.equal((trendPanel.match(/role="tab"/g)||[]).length,2);
      assert.ok(trendPanel.includes('平均得分')&&trendPanel.includes('累计待改进'));
      const empty={...snapshot,classes:[],grades:[],dimensions:[],problemDistribution:[],problemChanges:[],problems:[],trend:[]};
      for(const Component of [MoralRanking,MoralGradeRankings,MoralGradeProblems,MoralProblemChanges,MoralProblemDistribution,MoralProblems,MoralTrend]) {
        const markup=render(<Component snapshot={empty} />);
        assert.ok(markup.includes('暂无') && !markup.includes('NaN') && !markup.includes('Infinity'));
        assert.ok(!markup.includes('考核周'),'空态也不显示考核周');
      }
      const rootHtml=render(<Screen theme="dark" onThemeChange={()=>{}} />);
      assert.ok(rootHtml.includes('德育管理全景') && rootHtml.includes('学校育人全景'));
      assert.ok(rootHtml.includes('<span>学生成长全景驾驶舱</span>'), '切换页签保留整体驾驶舱名称');
      assert.ok(rootHtml.includes('切换为浅色样式'));
      assert.ok(rootHtml.includes('screen-ghost-fibers-canvas'),'德育深色模式加载与学校页共用的粒子背景');
      const lightRoot=render(<Screen theme="light" onThemeChange={()=>{}} />);
      assert.equal((lightRoot.match(/data-theme="light"/g)||[]).length,2);
      assert.ok(!lightRoot.includes('screen-ghost-fibers-canvas'),'浅色模式卸载粒子背景');
      assert.ok(lightRoot.includes('切换为暗色样式') && lightRoot.includes('<span>学生成长全景驾驶舱</span>'));
      for (const hidden of ['学生全景','学生得分榜','我的成长','实时检查','AI洞察','设计说明','模拟','演示']) assert.ok(!html.includes(hidden) && !rootHtml.includes(hidden),hidden);
      const entryHtml=render(<><SchoolCockpitEntry /><StudentHonorEntry /></>);
      assert.equal((entryHtml.match(/target="_blank"/g)||[]).length,2,'两个PC入口均在新窗口打开');
      assert.ok(entryHtml.includes('?app=data-screen') && entryHtml.includes('?app=student-honor-screen') && entryHtml.includes('学生荣誉榜'));
      assert.ok(entryHtml.includes('打开学生荣誉榜大屏（新窗口）') && !entryHtml.includes('>大屏</span>'));
      assert.ok(!entryHtml.includes('德育管理全景'),'学校PC不再提供额外的德育独立入口');
      console.log('德育管理全景检查通过：评价次数独立计数、各年级问题前三项、近期问题条数变化、差异班数与数据守恒、自动换组、八板块渲染及空态。');
    ` },
    outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, metafile: true, logLevel: 'silent',
  });
  assert.ok(!Object.keys(bundled.metafile.inputs).some(file=>/^components\/(?:data-screen|demo-data-screen|student-growth-screen)\//.test(file)), '德育页不能导入其他大屏业务展示、状态或样式');
  await import(pathToFileURL(output).href);
} finally { fs.rmSync(directory, { recursive: true, force: true }); }
