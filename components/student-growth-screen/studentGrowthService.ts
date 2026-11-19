import { getLeaderReportSnapshot, type LeaderReportSnapshot } from '../../mobile-app/services/leaderReportService';
import { getMockStudentNameAt } from '../../mobile-app/data/studentNamePool';
import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';
import { DEFAULT_GROWTH_INDICATOR_PATHS, createGrowthDimensions, getGrowthDemoTerm, type GrowthDataset, type GrowthRecord, type GrowthStudent, type GrowthIndicatorPath, type GrowthTerm } from './studentGrowthModel';

const hash = (value: string) => {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
};

const teachers = ['李敏', '张晓燕', '王海', '陈静', '刘欣', '周宁'];
// 公开正向摘要与具体三级指标绑定；不使用私密评语拼接公开动态。
const behaviors: Record<string, string> = {
  '遵守纪律': '课前主动准备好学习用品', '文明礼貌': '主动向老师和同学问好', '友善交往': '主动帮助遇到困难的同学',
  '爱护公物': '用完器材后主动整理归位', '尊师孝亲': '主动为长辈分担力所能及的事', '爱党爱国': '认真参加升旗仪式',
  '诚信担当': '答应同学的事情认真做到', '德育实践': '主动参加校园志愿服务', '道德与法治学科': '结合身边的事表达自己的判断',
  '语文达人': '清楚地向同学分享阅读收获', '数学达人': '主动向同学讲清解题思路', '英语达人': '主动用英语交流自己的想法',
  '语文学科': '认真阅读并写下自己的理解', '数学学科': '遇到难题先尝试不同解法', '英语学科': '在课堂上积极用英语表达',
  '科学学科': '认真观察并记录实验结果', '信息科技学科': '独立完成信息科技课堂任务', '运动达人': '积极参加课间体育锻炼',
  '体质测评': '认真完成各项体质测试', '体育锻炼': '积极参加跑步和球类运动', '心理监测': '主动表达感受并寻求帮助',
  '生命心理学科': '愿意倾听并鼓励身边的同学', '体育学科': '认真练习课堂上的运动动作', '艺术达人': '主动展示自己的艺术作品',
  '文化达人': '主动分享自己了解的文化知识', '交流活动': '认真倾听并回应他人的分享', '音乐学科': '认真练习并完成音乐展示',
  '美术学科': '用画笔表达自己的观察和想法', '书法学科': '专心练习并认真书写每一个字', '日常劳动': '主动完成班级值日任务',
  '劳动学科': '独立完成课堂上的劳动任务', '思创达人': '主动提出自己的创意和做法', '思创实践': '动手尝试并改进自己的作品',
};
const publicBehavior = (path: GrowthIndicatorPath) => behaviors[path[2]] || (path[0] === '躬行' ? '和同学分工完成劳动任务' : path[0] === '尚美' ? '积极参加艺术实践活动' : `在“${path[2]}”方面受到老师表扬`);

/** 只读复用学校年级/班级名单结构；按年级总人数校准班级演示名册，保持学校总数一致。 */
export function createGrowthRoster(report: LeaderReportSnapshot): GrowthStudent[] {
  return report.gradeCoverages.flatMap(grade => {
    const classTotal = grade.classes.reduce((sum, item) => sum + item.total, 0);
    if (!classTotal || !grade.total) return [];
    const counts = grade.classes.map(item => Math.floor(grade.total * item.total / classTotal));
    const remainderOrder = grade.classes.map((item, index) => ({ index, remainder: grade.total * item.total / classTotal - counts[index] }))
      .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
    const remaining = grade.total - counts.reduce((sum, count) => sum + count, 0);
    for (let i = 0; i < remaining; i++) counts[remainderOrder[i].index]++;
    return grade.classes.flatMap((item, classIndex) => Array.from({ length: counts[classIndex] }, (_, index) => ({
      id: `${item.id}-student-${index + 1}`,
      displayName: getMockStudentNameAt(item.id, index).n,
      gradeId: grade.id, gradeName: grade.name, classId: item.id, className: `${grade.name}${classIndex + 1}班`,
    })));
  });
}

/** 共享服务暂不提供学生级事件；独立生成稳定演示明细，再按学生ID聚合，绝不回写其他大屏。 */
export function createGrowthDemoDataset(report: LeaderReportSnapshot, now: number, options: { term?: GrowthTerm; indicatorPaths?: readonly GrowthIndicatorPath[] } = {}): GrowthDataset {
  const students = createGrowthRoster(report);
  const records: GrowthRecord[] = [];
  const term = options.term ?? getGrowthDemoTerm(now);
  const indicatorPaths = options.indicatorPaths ?? DEFAULT_GROWTH_INDICATOR_PATHS;
  const dimensions = createGrowthDimensions(indicatorPaths);
  const dimensionPaths = dimensions.map(dimension => indicatorPaths.filter(path => path[0] === dimension.name));
  const end = Math.min(now, term.end);
  const duration = end - term.start;
  // 演示明细均匀分布于整个学期，不再只生成近两周数据。
  if (duration >= 0 && dimensions.length) for (const student of students) {
    if (hash(`${student.id}:reach`) % 100 >= 94) continue;
    const onlyImprovementRecords = hash(`${student.id}:support`) % 100 < 9;
    let recorded = false;
    for (let dimension = 0; dimension < dimensions.length; dimension++) {
      if (hash(`${student.id}:dimension:${dimension}`) % 100 >= 80) continue;
      const count = 12 + hash(`${student.id}:count:${dimension}`) % 32;
      for (let index = 0; index < count; index++) {
        const seed = hash(`${student.id}:${dimension}:${index}`);
        records.push({ id: `growth-${student.id}-${dimension}-${index}`, studentId: student.id,
          indicatorPath: dimensionPaths[dimension][seed % dimensionPaths[dimension].length],
          delta: onlyImprovementRecords || seed % 11 === 0 ? -1 : 1 + seed % 3,
          timestamp: term.start + Math.floor((seed / 0xffffffff) * duration),
          teacherName: teachers[seed % teachers.length],
          publicBehavior: publicBehavior(dimensionPaths[dimension][seed % dimensionPaths[dimension].length]),
        });
      }
      recorded = true;
    }
    if (!recorded) records.push({ id: `growth-${student.id}-fallback`, studentId: student.id, indicatorPath: dimensionPaths[0][0], delta: -1, timestamp: term.start });
  }
  return { schoolName: TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star')?.title ?? '星河实验学校', students, records, generatedAt: now, term, indicatorPaths };
}

export async function loadStudentGrowth(now = Date.now()) {
  return createGrowthDemoDataset(await getLeaderReportSnapshot({ period: 'term' }), now);
}
