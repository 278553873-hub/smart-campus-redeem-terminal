import { DIMENSIONS, IMAGE_SAMPLES, PERIODS, TEACHERS, type DevelopmentIndicator, type DevelopmentRecord, type EvaluationRole, type RecordInputType } from './data';
export const inPeriod = (record: DevelopmentRecord, periodId: string) => {
  if (periodId === 'all') return true;
  const period = PERIODS.find(item => item.id === periodId);
  return !!period && record.date >= period.start && record.date <= period.end;
};
export const indicatorScore = (indicator: DevelopmentIndicator, records: DevelopmentRecord[], teacherId: string, periodId: string) => {
  const delta = records.filter(r => r.teacherId === teacherId && r.indicatorId === indicator.id && r.status === 'approved' && inPeriod(r, periodId)).reduce((sum, r) => sum + r.delta, 0);
  return Math.max(indicator.lower, Math.min(indicator.upper, indicator.base + delta));
};
export const teacherScore = (indicators: DevelopmentIndicator[], records: DevelopmentRecord[], teacherId: string, periodId: string) => indicators.reduce((sum, item) => sum + indicatorScore(item, records, teacherId, periodId), 0);
export const canReview = (record: DevelopmentRecord, actorId: string) => !!TEACHERS.find(t => t.id === actorId)?.manager && record.status === 'pending' && record.authorId !== actorId && record.teacherId !== actorId;
// 主操作入口独立于档案、报表的学期和查询条件，避免隐藏待办。
export const recordInbox = (records: DevelopmentRecord[], actorId: string) => records.filter(r => r.status !== 'withdrawn' && (r.authorId === actorId || r.teacherId === actorId));
export const reviewInbox = (records: DevelopmentRecord[], actorId: string, state: 'pending' | 'approved' | 'returned' = 'pending') => {
  if (!TEACHERS.find(t => t.id === actorId)?.manager) return [];
  return records.filter(r => state === 'pending' ? canReview(r, actorId) : r.reviewerId === actorId && r.status === state);
};
export const effectiveRecords = (records: DevelopmentRecord[], periodId: string, teacherId?: string) => records.filter(r => r.status === 'approved' && inPeriod(r, periodId) && (!teacherId || r.teacherId === teacherId));
export const dimensionCounts = (indicators: DevelopmentIndicator[], records: DevelopmentRecord[]) => DIMENSIONS.map(name => ({ name, count: records.filter(r => indicators.find(i => i.id === r.indicatorId)?.dimension === name).length }));
export interface RecognitionInput { text: string; actorId: string; role: EvaluationRole; targetId?: string; date: string; inputType?: RecordInputType; imageSampleId?: string; }
export type Recognition = { ok: true; record: DevelopmentRecord } | { ok: false; question: string };
// 演示适配器：只处理可解释的预置匹配，不冒充实时大模型或图片文字识别。
export function recognizeRecord(input: RecognitionInput, indicators: DevelopmentIndicator[], existing: DevelopmentRecord[]): Recognition {
  const actor = TEACHERS.find(t => t.id === input.actorId);
  if (!actor || (input.role === 'manager' && !actor.manager)) return { ok: false, question: '当前账号没有管理者权限。' };
  const inputType = input.inputType ?? 'text';
  if (!['text', 'voice', 'image'].includes(inputType)) return { ok: false, question: '请使用文字、语音或图片录入。' };
  if (inputType === 'image' && !IMAGE_SAMPLES.some(sample => sample.id === input.imageSampleId)) return { ok: false, question: '请选择清晰完整的图片后再提交。' };
  const isSelf = /(?:^|[，。！？；,\n])\s*(?:今天[，,]?\s*)?我(?:与|和|已|完成|参加|主持|进行|开展|在|负责|提交)/.test(input.text);
  let teacherId = input.role === 'teacher' ? input.actorId : input.targetId;
  const namedTeachers = TEACHERS.filter(t => input.text.includes(t.name));
  if (input.role === 'manager' && isSelf) {
    if (teacherId && teacherId !== input.actorId) return { ok: false, question: '描述中的“我”与所选教师不一致，请核对评价对象。' };
    teacherId = input.actorId;
  }
  if (input.role === 'manager' && !teacherId) {
    if (namedTeachers.length !== 1) return { ok: false, question: '请选择本次评价的教师。' };
    teacherId = namedTeachers[0].id;
  }
  if (!TEACHERS.some(t => t.id === teacherId)) return { ok: false, question: '没有找到这位教师，请重新选择。' };
  if (!isSelf && input.role === 'teacher' && namedTeachers.some(t => t.id !== input.actorId)) return { ok: false, question: '教师只能提交本人的记录，请核对记录归属。' };
  if (!isSelf && input.role === 'manager' && namedTeachers.some(t => t.id !== teacherId)) return { ok: false, question: '描述中的姓名与所选教师不一致，请核对评价对象。' };
  const candidates = indicators.filter(i => i.keywords.some(word => input.text.includes(word)));
  const indicator = candidates.find(i => ['C01', 'C02', 'C03', 'C09', 'C12', 'C11', 'C04', 'C05', 'C10'].includes(i.id)) ?? candidates[0];
  if (!indicator) return { ok: false, question: '请补充具体事件，例如完成了什么学习、教研或教学活动。' };
  const effectiveRole = teacherId === input.actorId ? 'teacher' : input.role;
  if (!indicator.roles.includes(effectiveRole)) return { ok: false, question: '该指标仅允许管理者评价其他教师，不能自行申报。' };
  let date = input.date;
  const parsedDate = input.text.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})日?/);
  if (parsedDate) date = `${parsedDate[1]}-${parsedDate[2].padStart(2, '0')}-${parsedDate[3].padStart(2, '0')}`;
  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts || !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) return { ok: false, question: '请选择有效的发生日期。' };
  if (!PERIODS.some(p => date >= p.start && date <= p.end)) return { ok: false, question: '该日期不在已配置的考核周期内，请核对发生日期。' };
  const keyText = input.text.replace(/\s|[，。、“”]/g, '');
  if (existing.some(r => r.teacherId === teacherId && r.status !== 'withdrawn' && r.indicatorId === indicator.id && r.date === date && r.text.replace(/\s|[，。、“”]/g, '') === keyText)) return { ok: false, question: '这件事已经记录过，可到原记录补充材料。' };
  const level = ['国家级', '省级', '区县级', '市级', '集团级', '校级'].find(l => input.text.includes(l));
  let delta = indicator.delta;
  if (indicator.id === 'C09' && !(level === '市级' && /结题/.test(input.text) && /主持/.test(input.text))) delta = 0;
  if (indicator.id === 'C12' && !(level === '区县级' && /公开课/.test(input.text) && /执教/.test(input.text))) delta = 0;
  if (['C04', 'C05', 'C11'].includes(indicator.id) && inputType !== 'image') delta = 0;
  const completed = !/尚未|未完成|没有完成|计划|准备|拟参加|将参加/.test(input.text);
  if (['C06', 'C07', 'C08'].includes(indicator.id) && (!completed || !/完成|已参加|参加了|已改进|改进了|已沟通|沟通了|与.+沟通/.test(input.text))) delta = 0;
  if (indicator.id === 'C01' && !/无故缺课|课堂.*播放|课堂.*追星/.test(input.text)) delta = 0;
  if (indicator.id === 'C02' && !/公开辱骂/.test(input.text)) delta = 0;
  if (indicator.id === 'C03' && !/冒用.*证书/.test(input.text)) delta = 0;
  if (indicator.id === 'C04' && !/分层教学/.test(input.text)) delta = 0;
  if (indicator.id === 'C05' && !/个别支持/.test(input.text)) delta = 0;
  if (indicator.id === 'C11' && !/完成.*带教/.test(input.text)) delta = 0;
  const unverified = delta < 0 && (!/已核实|经核实/.test(input.text) || /未核实|尚未核实|未经核实|并未核实/.test(input.text));
  if (unverified) return { ok: false, question: '请先核实事实，再填写核实依据。仅有投诉不能提交扣分评价，本次尚未提交。' };
  const id = `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return { ok: true, record: {
    id, teacherId: teacherId!, authorId: input.actorId, text: input.text.trim(), title: input.text.trim().replace(new RegExp(`^${TEACHERS.find(t => t.id === teacherId)!.name}(老师)?[，,：:]?`), '').slice(0, 40), indicatorId: indicator.id, date,
    category: indicator.id === 'C09' && /论文|专著/.test(input.text) ? '论文专著' : indicator.category,
    level, stage: /结题/.test(input.text) ? '结题' : /立项/.test(input.text) ? '立项' : undefined,
    contribution: /主持/.test(input.text) ? '主持人' : /执教/.test(input.text) ? '执教人' : /参与/.test(input.text) ? '参与人' : undefined,
    delta, status: indicator.requiresReview ? 'pending' : 'approved', requiresReview: indicator.requiresReview,
    rule: delta === 0 ? '未命中已配置的计分条件，仅归档。' : indicator.rule,
    inputType, imageSampleId: inputType === 'image' ? input.imageSampleId : undefined,
    history: ['提交记录', `AI匹配${indicator.name}`, indicator.requiresReview ? '进入审核队列，尚未计分' : '按免审配置自动生效'],
  } };
}
export function reviewRecord(records: DevelopmentRecord[], id: string, actorId: string, approve: boolean, reason = '') {
  if (!approve && !reason.trim()) return records;
  return records.map(r => r.id !== id || !canReview(r, actorId) ? r : { ...r, status: approve ? 'approved' as const : 'returned' as const, reviewerId: actorId, note: approve ? undefined : reason.trim(), history: [...r.history, approve ? '管理者审核通过，系统计分入档' : `管理者审核未通过：${reason.trim()}`] });
}

// 未通过后修改保留同一个事件编号和修订链，不增加成长记录条数。
export function saveRecord(records: DevelopmentRecord[], next: DevelopmentRecord, actorId: string, replacesId: string | null = null): DevelopmentRecord[] {
  if (next.authorId !== actorId) return records;
  if (replacesId) return records.map(r => r.id === replacesId && r.authorId === actorId && r.status === 'returned' ? { ...next, id: r.id, history: [...r.history, '修改后重新提交', ...next.history] } : r);
  return records.some(r => r.id === next.id) ? records : [next, ...records];
}
