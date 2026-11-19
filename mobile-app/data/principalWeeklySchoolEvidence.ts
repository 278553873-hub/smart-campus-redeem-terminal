/**
 * 领导汇报方案使用的全校分析输入（mock）。用户已授权预设相应数据。
 * 这是聚合证据夹具，不是实际学校统计；不改写既有评价总量或制造措施执行记录。
 * 模拟后台已对全校原始事件去重、按学生和年级汇总后的输入，不另造全量学生明细。
 */
export const PRINCIPAL_WEEKLY_SCHOOL_EVIDENCE = {
  mode: 'mock' as const,
  inputScope: 'single-report-week' as const,
  school: { gradeCount: 6, classCount: 16, activeClassCount: 15 },
  cooperation: {
    current: { gradeCount: 6, classCount: 12, studentCount: 236 },
    scenes: ['课堂讨论', '校园劳动'],
    behaviors: ['完成本人分工', '主动给同伴讲解', '帮助小组收尾'],
  },
  independence: {
    gradeCount: 6,
    classCount: 12,
    studentCount: 90,
    subjects: ['语文', '数学', '科学'],
    grades: [
      { grade: '一年级', studentCount: 14 },
      { grade: '二年级', studentCount: 15 },
      { grade: '三年级', studentCount: 16 },
      { grade: '四年级', studentCount: 15 },
      { grade: '五年级', studentCount: 14 },
      { grade: '六年级', studentCount: 16 },
    ],
    behaviors: ['先读清任务要求', '独立尝试解决', '带着具体问题求助'],
  },
  responsibility: {
    grades: ['三年级', '四年级', '五年级', '六年级'],
    classCount: 8,
    scenes: ['班级值日', '班内物品整理', '图书管理', '校园活动服务'],
    behavior: '未被逐个点名安排前，主动承担公共任务',
  },
  participationGap: {
    grades: ['三年级', '四年级'],
    classCount: 4,
    cohortSize: 120,
    limitedParticipationStudents: 42,
    // 这些是明确的行为描述，不是因“没有记录”而判断没有参与。
    behaviors: ['少数学生包办主要任务', '其他学生等待结果或旁观'],
    planning: { teachingDays: 10, groupTasksPerGrade: 2, rolesPerStudent: 1 },
  },
};

export const PRINCIPAL_WEEKLY_SCHOOL_HIGHLIGHTS = [
  {
    title: '各年级都有孩子主动帮助同伴',
    detail: '6个年级、12个班级的老师记录到，孩子会在讨论时给同学讲步骤，也会在劳动时帮小组收尾。孩子不只做好自己的分工，也会帮小组把事情做完。',
    evidence: '单个报告周的记录涉及6个年级、12个班级、236名学生；行为包括完成本人分工、主动讲解和协助收尾。按原始事件去重，不以全班展开明细制造独立事件，不作跨周比较。',
  },
  {
    title: '孩子会先自己想办法，再向老师求助',
    detail: '语文、数学和科学课上，6个年级都有孩子先自己尝试，遇到困难再向老师请教。孩子不仅在做任务，也在主动寻找方法、表达自己的困难。',
    evidence: '单个报告周，6个年级12个班级的90名学生有明确的读要求、独立尝试、带具体问题求助等行为描述，涉及语文、数学、科学。不计算全校能力比例，不推断历史改善。',
  },
  {
    title: '学生会主动参与班级事务和校园服务',
    detail: '三至六年级8个班级的学生，会主动值日、整理物品，也会管理图书、为校园活动服务。孩子承担的任务既有班里的日常小事，也有面向校园的公共服务。',
    evidence: '单个报告周，三至六年级8个班级记录了班级值日、班内整理、图书管理、校园活动服务中的主动承担。只是同周不同场景的归纳，没有前期数据，不写从班级向校园延伸。',
  },
];
