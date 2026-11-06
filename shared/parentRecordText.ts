/** 演示纠错适配：只修复确定的常见词，不扩写、不改变评价含义。真实AI服务可替换此入口。 */
export function correctParentRecordText(value: string): string {
  return value.trim().replace(/睡叫/g, '睡觉').replace(/写做业/g, '写作业').replace(/做做业/g, '做作业').replace(/按排/g, '安排').replace(/在接再厉/g, '再接再厉');
}
