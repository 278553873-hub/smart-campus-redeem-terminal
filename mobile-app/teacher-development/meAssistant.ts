import type { AssistantChatAnswer } from '../components/assistant-chat/AssistantConversationThread';
import { ALL_PERIODS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { inPeriod, reviewInbox, teacherScore } from './domain';

export const personalQuestions = ['看看我的成长情况', '有哪些记录需要跟进', '给我一些成长建议'];
export const principalQuestions = ['查看全校教师成长概况', '有哪些记录待我审核', '本学期管理建议'];
/** 演示问答只使用当前身份可访问的记录，不推测教师表现，也不修改审核或计分。 */
export function answerMeQuestion(question: string, principal: boolean, teacher: TeacherDossier, teachers: TeacherDossier[], records: DevelopmentRecord[], indicators: DevelopmentIndicator[], periodId: string): AssistantChatAnswer {
  const period = ALL_PERIODS.find(p => p.id === periodId)?.label ?? '当前考核周期';
  const school = principal && !!teacher.manager;
  const scoped = records.filter(r => inPeriod(r, periodId) && r.status !== 'withdrawn' && (school || r.teacherId === teacher.id));
  const approved = scoped.filter(r => r.status === 'approved');
  const pending = scoped.filter(r => r.status === 'pending');
  const returned = scoped.filter(r => r.status === 'returned');
  const breakdown = school ? [
    { detail: '', label: '教师人数', value: `${teachers.length}人` },
    { detail: '', label: '成长记录', value: `${scoped.length}条` },
    { detail: '', label: '已生效', value: `${approved.length}条` },
  ] : [
    { detail: '', label: '当前积分', value: `${teacherScore(indicators, records, teacher.id, periodId)}分` },
    { detail: '', label: '已生效成长记录', value: `${approved.length}条` },
  ];
  if (/审核|跟进|待办|未通过/.test(question)) {
    const actionable = school ? reviewInbox(records, teacher.id).filter(r => inPeriod(r, periodId)).length : pending.length;
    return { answerType: 'followup', message: school ? `${period}有${actionable}条记录待您审核。本人提交或涉及本人的记录需由其他管理者处理。` : `${period}您有${pending.length}条记录待审核、${returned.length}条记录未通过。`, breakdown: [], analysis: [], suggestions: [{ title: '跟进', body: school ? '可在“记录 → 审核”查看事实与材料后处理。' : returned.length ? '先到“记录 → 未通过”查看原因，补充材料后重新提交；待审核记录无需重复提交。' : '可在“记录 → 待审核”查看进展。' }] };
  }
  if (/建议|提升|计划/.test(question)) {
    const covered = new Set(approved.map(r => indicators.find(i => i.id === r.indicatorId)?.dimension));
    const absent = [...new Set(indicators.map(i => i.dimension))].filter(d => !covered.has(d));
    return { answerType: 'advice', message: `${period}的成长建议如下。记录数量反映留痕情况，不直接代表工作质量。`, breakdown, analysis: [], suggestions: [{ title: '建议', body: school ? `先跟进${pending.length}条待审核记录，再结合教师档案安排研修与经验分享，避免仅按记录数量评价教师。` : `整理近期教学实践与研修成果，及时补充真实材料。${absent.length ? `“${absent.join('、')}”暂无已生效记录，可结合实际工作补充。` : '可挑选一项已有实践，记录后续反思与改进。'}` }] };
  }
  if (/成长|概况|统计|积分|情况/.test(question)) return { answerType: 'overview', message: `${period}${school ? '全校教师' : teacher.name}的成长情况如下，仅统计本期记录。`, breakdown: [...breakdown, { detail: '', label: '待审核', value: `${pending.length}条` }, { detail: '', label: '未通过', value: `${returned.length}条` }], analysis: [], suggestions: [{ title: '查看', body: '可在“报表”查看详细统计，在“档案”追溯成长记录与计分依据。' }] };
  return { answerType: 'unsupported', message: '当前演示支持成长概况、记录跟进和成长建议。您可以选择下方问题继续查看。', breakdown: [], analysis: [], suggestions: [] };
}
