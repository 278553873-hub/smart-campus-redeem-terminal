import { INITIAL_RECORDS, type DevelopmentRecord } from './data';

type LegacyRecord = Omit<DevelopmentRecord, 'inputType'> & { inputType?: DevelopmentRecord['inputType']; evidence?: string };
const legacyTexts: Record<string, string> = {
  r1: '张敏于2026年10月12日完成新课程教学研修。', r2: '与家长沟通学生学习习惯',
  r3: '张敏主持的市级项目化学习课题于2026年10月8日结题。', r4: '区县级阅读教学公开课',
  r5: '优化阅读课堂提问策略', r6: '完成青年教师带教任务', r7: '完成英语教学研修',
  r8: '分层教学实践与反馈', r9: '课堂实验研究课题结题', r10: '改进史料阅读教学方法',
  r11: '参加春季语文研修', r12: '区县级公开课执教证明',
};

/** 仅替换未编辑的旧预置输入；审核结果、计分和用户修改独立保留。 */
export function migrateRecordInput(record: LegacyRecord): DevelopmentRecord {
  const { evidence, ...saved } = record;
  if (saved.inputType) return saved as DevelopmentRecord;
  const seed = INITIAL_RECORDS.find(item => item.id === saved.id);
  if (seed && saved.text === legacyTexts[saved.id] && !saved.history.includes('修改后重新提交')) {
    return { ...saved, text: seed.text, inputType: seed.inputType, imageSampleId: seed.imageSampleId,
      note: saved.id === 'r12' && saved.note === '材料未显示本人执教信息，请核对并更新证明后重新提交。' ? seed.note : saved.note };
  }
  // 无法确认旧图片内容时保留文字，避免用另一张演示图片替代用户录入。
  return { ...saved, inputType: 'text' };
}
