import { MOCK_CLASS_EVALUATION_INDICATORS } from '../constants';
import type { ClassInfo } from '../types';

/** 与手机端共用的演示分支；正式识别服务接入后替换，不用于真实业务计分。 */
export function buildClassRecordDemoAnalysis(text: string, classes: ClassInfo[]) {
    const classNumbers = ['一','二','三','四','五','六','七','八','九','十'];
    const targets = classes.filter(c => {
        const number = c.classNumber ?? Number(c.id.split('_').at(-1));
        return text.includes(c.name) || [String(number), classNumbers[number - 1]].some(n => text.includes(`${c.gradeLevel}${n}班`) || text.includes(`${c.gradeLevel}（${n}）班`));
    });
    const leaves = MOCK_CLASS_EVALUATION_INDICATORS.flatMap(a => a.children.flatMap(b => b.children.map(c => ({ label: `${a.name}-${b.name}-${c.name}`, value: c.scoreValue }))));
    const preferred = /红领巾|佩戴/.test(text) ? '佩戴规范' : /桌椅|卫生|清洁|垃圾/.test(text) ? '内务整理' : /路队|放学/.test(text) ? '文明放学' : /早操|做操/.test(text) ? '做操规范' : '公共秩序';
    const leaf = leaves.find(c => c.label.endsWith(preferred)) ?? leaves[0];
    const negative = /没有|未|不整齐|不规范|追逐|打闹|垃圾|扣分/.test(text);
    const score = { ...leaf, value: leaf.value * (negative ? -1 : 1) };
    return {
        aiSummary: text || '请核对班级、评价指标和分值后保存。',
        theme: negative ? 'negative' as const : 'positive' as const,
        students: targets.map(c => ({id:c.id, name:c.name})),
        score,
        scores: [score],
    };
}
