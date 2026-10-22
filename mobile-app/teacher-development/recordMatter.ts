import { TEACHERS, type DevelopmentIndicator, type DevelopmentRecord } from './data';
import { findImageSample, LEGACY_IMAGE_SAMPLES } from './imageSamples';

/** 图片仅采用已核对的材料摘要；文本只整理时间口吻与人称，不补充成果或学习收获。 */
export function recordMatter(record: DevelopmentRecord, _indicator?: DevelopmentIndicator) {
  if (record.matter?.trim()) return record.matter.trim();
  const teacherName = TEACHERS.find(teacher => teacher.id === record.teacherId)?.name ?? '';
  if (record.inputType === 'image') {
    const sample = findImageSample(record.imageSampleId);
    if (sample && sample.teacherId === (record.inputContext?.teacherId ?? record.teacherId)) return sample.summary;
    const legacy = LEGACY_IMAGE_SAMPLES.find(sample => sample.id === record.imageSampleId);
    if (legacy) return `${TEACHERS.find(teacher => teacher.id === record.inputContext?.teacherId)?.name ?? teacherName}的${legacy.heading}：${legacy.lines.join('，')}。`;
    return '材料内容尚未识别，请重新分析或更换清晰图片。';
  }
  let text = record.text.trim().replace(/^(?:今天|今日)[，,、\s]*/, '');
  const authorName = TEACHERS.find(teacher => teacher.id === record.authorId)?.name ?? teacherName;
  text = text.replace(/^我(?=已|与|和|完成|参加|主持|进行|开展|在|负责|提交|计划|准备|尚未|没有|未|正在|拟|将|希望|发现|认为|想)/, authorName);
  if (text && teacherName && !text.includes(teacherName)) text = `${teacherName}${text}`;
  return text || '暂无事项描述';
}
