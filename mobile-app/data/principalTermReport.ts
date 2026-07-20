import type { SchoolTermConfig } from '../domain/principalTermReport';

// 演示环境数据；正式环境由后台“当前学期”接口返回同结构字段。
export const CURRENT_PRINCIPAL_TERM: SchoolTermConfig = {
  id: 'term-2025-2026-2',
  name: '2025-2026学年下学期',
  startDate: '2026-02-23',
  endDate: '2026-07-31',
};

export interface PrincipalTermReportMetric {
  label: string;
  value: string;
  detail: string;
}

export interface PrincipalTermReportFinding {
  title: string;
  detail: string;
  evidence: string;
}

export interface PrincipalTermReportAction {
  title: string;
  detail: string;
  owner: string;
  metric: string;
}

export interface PrincipalTermReportPractice {
  title: string;
  context: string;
  detail: string;
  evidence: string;
  value: string;
}

export interface PrincipalTermReportContent {
  conclusion: string;
  metrics: PrincipalTermReportMetric[];
  usage: PrincipalTermReportFinding[];
  highlights: PrincipalTermReportFinding[];
  practices: PrincipalTermReportPractice[];
  indicatorInsights: PrincipalTermReportFinding[];
  concerns: PrincipalTermReportFinding[];
  actions: PrincipalTermReportAction[];
}

export const PRINCIPAL_TERM_REPORT_SAMPLE: PrincipalTermReportContent = {
  conclusion: '本学期学校已形成较完整的过程性评价基础，学生覆盖完整，部分班级和教师群体形成了连续使用样本；下一阶段应优先改善班级之间的记录密度差异，扩大多学科参与，并补充过程性学习和低频指标的真实场景证据。',
  metrics: [
    { label: '累计评价', value: '8,260', detail: '形成较完整的学期过程数据' },
    { label: '学生覆盖', value: '100%', detail: '16个班级全部完成覆盖' },
    { label: '活跃教师', value: '55.36%', detail: '31名教师产生有效记录' },
    { label: '人均评价', value: '10.17', detail: '班级之间仍存在明显差异' },
  ],
  usage: [
    {
      title: '班级覆盖完整，但记录连续性差异明显',
      detail: '16个班级均有学生进入评价记录，但高频班级已形成稳定周记录，部分班级仍集中在少数日期完成记录。',
      evidence: '班级覆盖率100%；最高班级1,739条，最低班级32条，最低班级仅有1至2名教师参与。',
    },
    {
      title: '教师参与从班主任向任课教师扩展',
      detail: '音乐、体育等任课教师开始跨班提供成长证据，学生材料来源更加多元，但全校参与仍集中在31名活跃教师。',
      evidence: '活跃教师31/56人；跨班任课教师覆盖课堂参与、艺术表现和活动服务等场景。',
    },
  ],
  highlights: [
    {
      title: '高频使用班级已形成连续样本',
      detail: '三年级12班、14班保持稳定记录节奏，学生覆盖完整且有多位教师参与，可进一步提炼其组织和快速记录方法。',
      evidence: '12班1,739条、14班1,285条，均有5名教师参与。',
    },
    {
      title: '跨学科观察开始建立',
      detail: '骨干教师的记录已覆盖课堂表现、责任担当、艺术参与和行为提醒，学生成长材料不再局限于单一学科。',
      evidence: '高频教师既包含班主任，也包含跨班任课教师。',
    },
  ],
  practices: [
    {
      title: '三年级12班形成日常短时记录节奏',
      context: '三年级12班 · 2026年5月至6月',
      detail: '班主任围绕课前准备、责任担当、集体劳动和活动参与持续记录，任课教师补充学科课堂观察，形成了可连续追踪的班级材料。',
      evidence: '累计1,739条原始评价事件、52名学生全部覆盖、5名教师参与，最近记录日期为6月24日。',
      value: '说明稳定场景、短时记录和多教师补充能够共同形成班级成长材料，不需要依赖期末集中补录。',
    },
    {
      title: '跨班艺术课堂提供不同观察视角',
      context: '三年级音乐课堂 · 多班级',
      detail: '任课教师持续记录学生在艺术表现、课堂参与和服务意识等场景中的行为，为班主任材料提供了跨学科补充。',
      evidence: '相关教师覆盖250名学生，代表证据来自多个班级和多个独立课堂事件。',
      value: '可作为推动任课教师共同参与的实践样本，但记录量本身不用于评价教师教学质量。',
    },
  ],
  indicatorInsights: [
    {
      title: '责任担当与课堂行为材料较充分',
      detail: '学校已有较多关于责任担当、集体劳动、课堂参与和行为提醒的过程材料，能够支撑班级复盘和学生成长报告。',
      evidence: '代表记录覆盖德育、智育、劳育和活动参与等多个指标路径。',
    },
    {
      title: '部分过程性与低频指标仍缺少场景证据',
      detail: '合作方法、探究过程和审美体验等指标进入记录的频次较低，当前只能说明记录材料不足，不能推断相应育人领域水平。',
      evidence: '12个三级指标学期内零覆盖，前5个三级指标占全部记录61%。',
    },
  ],
  concerns: [
    {
      title: '班级应用差异较大',
      detail: '低频班级虽然已完成学生覆盖，但记录连续性和教师参与不足，难以支撑可靠的成长趋势判断。',
      evidence: '最低班级仅32条记录，且只有1至2名教师参与。',
    },
    {
      title: '教师参与面仍需扩大',
      detail: '当前数据较多集中在少数高频使用教师，学校尚未形成更广泛、稳定的参与节奏；具体原因仍需结合账号、场景和组织安排逐项核实。',
      evidence: '活跃教师31/56人，活跃率55.36%。',
    },
  ],
  actions: [
    {
      title: '建立低频班级周跟进机制',
      detail: '由年级组每周关注无新增记录、单一教师记录和学生关注盲区，先解决停滞原因。',
      owner: '德育处、年级组',
      metric: '低频班级数量持续下降',
    },
    {
      title: '复制高频使用教师的快速记录方法',
      detail: '用短时示范和同伴带动推广语音记录、指标确认和阶段复盘，降低参与门槛。',
      owner: '教务处、骨干教师',
      metric: '教师活跃率提升至80%以上',
    },
    {
      title: '按月检查五育记录结构',
      detail: '重点关注长期低频和零覆盖指标，补充真实场景，不要求教师机械凑齐指标。',
      owner: '评价负责人',
      metric: '零覆盖指标持续减少',
    },
  ],
};
