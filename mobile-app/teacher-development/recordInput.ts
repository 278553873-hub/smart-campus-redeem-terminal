import { INITIAL_RECORDS, SELF_COMMUNICATION_EXAMPLE, TEACHERS, type DevelopmentRecord } from './data';

type LegacyRecord = Omit<DevelopmentRecord, 'inputType'> & { inputType?: DevelopmentRecord['inputType']; evidence?: string };
const legacyTexts: Record<string, string> = {
  r1: '张敏于2026年10月12日完成新课程教学研修。', r2: '与家长沟通学生学习习惯',
  r3: '张敏主持的市级项目化学习课题于2026年10月8日结题。', r4: '区县级阅读教学公开课',
  r5: '优化阅读课堂提问策略', r6: '完成青年教师带教任务', r7: '完成英语教学研修',
  r8: '分层教学实践与反馈', r9: '课堂实验研究课题结题', r10: '改进史料阅读教学方法',
  r11: '参加春季语文研修', r12: '区县级公开课执教证明',
};
const previousImageTexts: Record<string, string> = {
  r1: '今天，我完成了校级新课程教学研修，学到了几种课堂提问的方法。',
  r5: '今天，我完成了阅读课堂提问策略的教研改进，先让学生交流，再进行全班分享。',
};

/** 仅替换未编辑的旧预置输入；审核结果、计分和用户修改独立保留。 */
export function migrateRecordInput(record: LegacyRecord): DevelopmentRecord {
  const { evidence, ...legacy } = record;
  const template = INITIAL_RECORDS.find(item => item.id === legacy.id && item.teacherId === legacy.teacherId && item.date === legacy.date);
  const eventTimestamp = legacy.id.match(/^event-(\d{13})-/)?.[1];
  const saved = { ...legacy, recordedAt: legacy.recordedAt ?? (eventTimestamp ? new Date(Number(eventTimestamp)).toISOString() : template?.recordedAt) };
  const seed = INITIAL_RECORDS.find(item => item.id === saved.id);
  const previousCommunication = '今天，我与刘甜家长沟通学生学习习惯，商量了每天阅读二十分钟的安排。';
  const edited = saved.history.some(item => ['修改后重新提交', '编辑记录', '重新分析', '校正识别结果'].includes(item));
  // 只为未被改写的张敏预置事件接上同一事件的实图，保留审核、计分和历史定义。
  if (template && seed && ['r1', 'r3', 'r5'].includes(seed.id)
    && saved.authorId === seed.authorId && saved.indicatorId === seed.indicatorId
    && [seed.text, legacyTexts[seed.id], previousImageTexts[seed.id]].includes(saved.text)
    && !edited) {
    const snapshot = saved.fieldSnapshot;
    const hours = seed.fieldSnapshot?.values.hours;
    return { ...saved, text: seed.text, inputType: 'image', imageSampleId: seed.imageSampleId,
      fieldSnapshot: snapshot
        ? { ...snapshot, values: { ...snapshot.values, ...(hours !== undefined && snapshot.fields.some(field => field.key === 'hours') ? { hours } : {}) } }
        : seed.fieldSnapshot };
  }
  if (seed && saved.teacherId === seed.teacherId && saved.authorId === seed.authorId
    && (saved.text === legacyTexts[saved.id] || (saved.id === 'r2' && saved.text === previousCommunication))
    && !edited) {
    return { ...saved, text: seed.text, inputType: seed.inputType, imageSampleId: seed.imageSampleId,
      note: saved.id === 'r12' && saved.note === '材料未显示本人执教信息，请核对并更新证明后重新提交。' ? seed.note : saved.note };
  }
  const teacher = TEACHERS.find(item => item.id === saved.teacherId);
  const oldVoice = saved.text.match(/^(.+)老师于(20\d{2})年(\d{1,2})月(\d{1,2})日完成一次家校沟通，与家长沟通了学生的阅读习惯。$/);
  if (oldVoice && saved.authorId === saved.teacherId && saved.indicatorId === 'C06'
    && oldVoice[1] === teacher?.name
    && `${oldVoice[2]}-${oldVoice[3].padStart(2, '0')}-${oldVoice[4].padStart(2, '0')}` === saved.date
    && !edited) {
    return { ...saved, inputType: 'voice', text: SELF_COMMUNICATION_EXAMPLE };
  }
  // 无法确认旧图片内容时保留文字，避免用另一张演示图片替代用户录入。
  return { ...saved, inputType: saved.inputType ?? 'text' };
}
