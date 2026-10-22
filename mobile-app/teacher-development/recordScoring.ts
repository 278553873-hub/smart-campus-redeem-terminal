import type { DevelopmentIndicator, RecordInputType } from './data';
import type { FieldValues } from './indicatorFields';

/** 识别与人工校正复用学校计分条件，不在页面另写评分分支。 */
export function calculateRecordDelta(indicator: DevelopmentIndicator, details: FieldValues, text: string, inputType: RecordInputType) {
  const level = details.level;
  let delta = indicator.delta;
  if (indicator.id === 'C09' && !(details.category === '课题研究' && level === '市级' && details.stage === '结题' && details.contribution === '主持人')) delta = 0;
  if (indicator.id === 'C12' && !(level === '区级' && /公开课/.test(text) && details.contribution === '执教人')) delta = 0;
  if (['C04', 'C05', 'C11'].includes(indicator.id) && inputType !== 'image') delta = 0;
  const completed = !/尚未|未完成|没有完成|计划|准备|拟参加|将参加/.test(text);
  if (['C06', 'C07', 'C08'].includes(indicator.id) && (!completed || !/完成|已参加|参加了|已改进|改进了|已沟通|沟通了|与.+沟通/.test(text))) delta = 0;
  if (indicator.id === 'C01' && !/无故缺课|课堂.*播放|课堂.*追星/.test(text)) delta = 0;
  if (indicator.id === 'C02' && !/公开辱骂/.test(text)) delta = 0;
  if (indicator.id === 'C03' && !/冒用.*证书/.test(text)) delta = 0;
  if (indicator.id === 'C04' && !/分层教学/.test(text)) delta = 0;
  if (indicator.id === 'C05' && (!/个别支持/.test(text) || /未提供个别支持/.test(text))) delta = 0;
  if (indicator.id === 'C11' && !/完成.*带教/.test(text)) delta = 0;
  return delta;
}
