import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ArchiveDesignView.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/studentArchiveStore.ts', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) throw new Error(message);
};

requireText(meSource, "title: '档案设计'", '教师手机端更多工具缺少档案设计入口。');
requireText(accessSource, "administrator:", '学校管理员必须具备独立空间角色。');
requireText(accessSource, "leader:", '学校领导必须具备独立空间角色。');
requireText(accessSource, "'archiveDesign'", '档案设计入口必须由学校空间角色策略控制。');
requireText(appSource, "'archive_design'", '教师端导航必须注册档案设计页面。');
requireText(appSource, '<ArchiveDesignView', '教师端必须渲染档案设计业务页面。');
requireText(meSource, '待完成建档', '建档任务必须进入教师“我的”待办。');
requireText(appSource, 'pendingArchiveTaskCount', '教师底部导航必须汇总待办建档任务角标。');
requireText(appSource, "setArchiveEntryMode('assigned')", '待办入口必须进入责任教师任务视图。');

for (const required of [
  '校本模板',
  '推荐模板',
  '档案管理视图',
  "label: '档案设计'",
  "label: '建档任务'",
  '新建档案',
  '选择模板',
  '复制为校本模板',
  '参与来源',
  '系统信息',
  '档案分组',
  '编辑分组',
  '所属分组',
  '用于成长对比',
  '系统带出',
  '发布模板',
  '发起档案任务',
  '填写责任人',
  '当前班主任',
  '指定任课教师',
  '提醒设置',
  '任务进度',
  '信息来源',
  '保存草稿',
  '确认成档',
  '接班摘要',
  '成长变化',
  '长期底档',
  '阶段时间线',
  '来源记录与查看日志',
  '申请更正最新档案',
]) {
  requireText(viewSource, required, `档案设计流程缺少：${required}`);
}

for (const required of [
  "export type ArchiveStage = 'entry' | 'term' | 'transition'",
  "export type ArchiveTemplateStatus = 'recommended' | 'draft' | 'published' | 'disabled'",
  "export type ArchiveSource = 'homeroom' | 'guardian' | 'student' | 'records'",
  'export interface ArchiveSection',
  'sectionId: string',
  'templateVersion: number',
  "status: 'archived' | 'revision-draft'",
  'revisionOf?: string',
  'correctionReason?: string',
  'ArchiveAuditEvent',
]) {
  requireText(storeSource, required, `档案数据层缺少：${required}`);
}

for (const template of ['一年级初始成长档案', '学期成长档案', '毕业与转衔档案']) {
  requireText(storeSource, template, `推荐模板缺少：${template}`);
}

for (const field of ['优势特点', '兴趣倾向', '学习习惯', '情绪状态', '同伴交往', '当前关注', '有效支持方式', '阶段目标']) {
  requireText(storeSource, field, `稳定核心字段缺少：${field}`);
}

for (const section of ['学业基础', '兴趣偏好', '认知特点', '交往风格', '性格与家庭', '优先发展目标', '内驱力特征']) {
  requireText(storeSource, section, `一年级初始档案缺少分组：${section}`);
}

for (const field of ['基础认知', '专注习惯', '提问与任务', '动手创意', '学习方式', '问题解决', '帮助分享', '规则礼貌', '冲突处理', '运动活力', '主要照顾人', '家庭陪伴时间', '学生自选', '教师建议', '当前突出内驱力信号', '初始光芒定位', '下一阶段优先关注方向', '家长确认']) {
  requireText(storeSource, field, `一年级初始档案缺少字段：${field}`);
}

requireText(storeSource, 'createTemplateVersion', '已发布模板必须通过新版本继续编辑。');
requireText(storeSource, 'saveStudentArchiveDraft', '班主任必须能够保存和确认学生档案。');
requireText(storeSource, 'requestSnapshotCorrection', '成档后必须通过更正草稿修订。');
requireText(storeSource, 'appendArchiveViewAudit', '完整档案查看必须写入审计记录。');
requireText(storeSource, 'updateStudentBaseArchive', '长期底档必须支持独立即时更新。');
requireText(storeSource, 'ArchiveClassAssignment', '建档任务必须保存逐班责任人。');
requireText(storeSource, 'ArchiveReminderPolicy', '建档任务必须保存提醒规则。');
requireText(storeSource, 'getPendingArchiveTasksForTeacher', '教师端必须能够计算个人待办建档任务。');
requireText(viewSource, "previousSnapshot?.answers[fieldItem.semanticKey]", '班主任填写时必须看到核心字段上期值。');
requireText(viewSource, "const compareKeys = ['learning-habits', 'peer-relations', 'stage-goal']", '教师查看时必须展示稳定核心字段的成长对比。');

forbidText(viewSource, '下载档案', '完整档案不应默认开放下载。');
forbidText(viewSource, '转发档案', '完整档案不应默认开放转发。');
forbidText(viewSource, '档案完成 {overallRate}%', '档案设计顶部不应汇总跨任务完成率。');
forbidText(viewSource, '名学生已成档', '档案设计顶部不应统计学生成档总数。');
forbidText(viewSource, 'placeholder="搜索学生"', '档案设计不应提供学生档案查询。');
forbidText(viewSource, "student.status === 'archived' ? openArchive", '建档任务不应直接打开已成档学生档案。');

console.log('ArchiveDesignView flow assertions passed');
