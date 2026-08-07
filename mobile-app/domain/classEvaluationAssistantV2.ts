export type ClassEvaluationResponsibility = 'class' | 'teacher' | 'shared';

export type ClassEvaluationRectificationStatus = 'pending' | 'reviewing' | 'resolved';

export interface ClassEvaluationAction {
    title: string;
    owner: string;
    verification: string;
}

export interface ClassEvaluationRecord {
    id: string;
    classId: string;
    date: string;
    dimension: string;
    indicator: string;
    finding: string;
    deduction: number;
    classDeduction: number;
    teacherDeduction: number;
    responsibility: ClassEvaluationResponsibility;
    rule: string;
    rectificationStatus: ClassEvaluationRectificationStatus;
    actions: ClassEvaluationAction[];
}

export interface ClassEvaluationSnapshot {
    id: string;
    classId: string;
    periodStart: string;
    periodEnd: string;
    fullScore: number;
    finalScore: number;
    deduction: number;
    classDeduction: number;
    teacherDeduction: number;
    recordCount: number;
    hasRecordDetails: boolean;
}

export type ClassEvaluationAnswerType =
    | 'score_summary'
    | 'deduction_summary'
    | 'deduction_detail'
    | 'rule'
    | 'responsibility'
    | 'action_advice'
    | 'clarification'
    | 'unavailable';

export interface ClassEvaluationAnswerMetric {
    label: string;
    value: string;
    tone?: 'default' | 'negative';
}

export interface ClassEvaluationAnswerBreakdown {
    label: string;
    value: string;
    detail: string;
}

export interface ClassEvaluationConversationContext {
    classId: string;
    periodStart: string;
    periodEnd: string;
    indicator?: string;
    date?: string;
    recordIds: string[];
    responsibilityTypes: ClassEvaluationResponsibility[];
}

export interface ClassEvaluationAssistantAnswer {
    answerType: ClassEvaluationAnswerType;
    message: string;
    metrics: ClassEvaluationAnswerMetric[];
    breakdown: ClassEvaluationAnswerBreakdown[];
    actions: ClassEvaluationAction[];
    context: ClassEvaluationConversationContext;
    evidenceRefs: string[];
    followUpSuggestions: string[];
}

interface AskClassEvaluationQuestionInput {
    question: string;
    snapshot: ClassEvaluationSnapshot;
    records: ClassEvaluationRecord[];
    previousContext?: ClassEvaluationConversationContext;
}

const roundScore = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

const formatScore = (value: number) => roundScore(value).toFixed(1);

const formatDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${Number(month)}月${Number(day)}日`;
};

const responsibilityLabels: Record<ClassEvaluationResponsibility, string> = {
    class: '班级行为责任',
    teacher: '教师组织责任',
    shared: '共同责任',
};

export const calculateClassEvaluationSnapshot = (
    classId: string,
    periodStart: string,
    periodEnd: string,
    records: ClassEvaluationRecord[],
    fullScore = 100,
): ClassEvaluationSnapshot => {
    const periodRecords = records.filter(record => (
        record.classId === classId
        && record.date >= periodStart
        && record.date <= periodEnd
    ));
    const deduction = roundScore(periodRecords.reduce((sum, record) => sum + record.deduction, 0));
    const classDeduction = roundScore(periodRecords.reduce((sum, record) => sum + record.classDeduction, 0));
    const teacherDeduction = roundScore(periodRecords.reduce((sum, record) => sum + record.teacherDeduction, 0));

    return {
        id: `${classId}:${periodStart}:${periodEnd}`,
        classId,
        periodStart,
        periodEnd,
        fullScore,
        finalScore: roundScore(fullScore - deduction),
        deduction,
        classDeduction,
        teacherDeduction,
        recordCount: periodRecords.length,
        hasRecordDetails: periodRecords.length > 0,
    };
};

const createContext = (
    snapshot: ClassEvaluationSnapshot,
    records: ClassEvaluationRecord[],
    details?: Pick<ClassEvaluationConversationContext, 'indicator' | 'date' | 'responsibilityTypes'>,
): ClassEvaluationConversationContext => ({
    classId: snapshot.classId,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    indicator: details?.indicator,
    date: details?.date,
    recordIds: records.map(record => record.id),
    responsibilityTypes: details?.responsibilityTypes ?? [],
});

const summarizeByDimension = (records: ClassEvaluationRecord[]): ClassEvaluationAnswerBreakdown[] => {
    const dimensions = new Map<string, { deduction: number; count: number }>();
    records.forEach(record => {
        const current = dimensions.get(record.dimension) ?? { deduction: 0, count: 0 };
        dimensions.set(record.dimension, {
            deduction: roundScore(current.deduction + record.deduction),
            count: current.count + 1,
        });
    });

    return Array.from(dimensions.entries())
        .sort((left, right) => right[1].deduction - left[1].deduction)
        .slice(0, 5)
        .map(([label, value]) => ({
            label,
            value: `-${formatScore(value.deduction)}分`,
            detail: `${value.count}笔`,
        }));
};

const summarizeRecords = (records: ClassEvaluationRecord[]): ClassEvaluationAnswerBreakdown[] => (
    records.slice(0, 5).map(record => ({
        label: record.indicator,
        value: `-${formatScore(record.deduction)}分`,
        detail: `${formatDate(record.date)} · ${responsibilityLabels[record.responsibility]}`,
    }))
);

const rectificationPriority: Record<ClassEvaluationRectificationStatus, number> = {
    pending: 0,
    reviewing: 1,
    resolved: 2,
};

const prioritizeRecords = (records: ClassEvaluationRecord[]) => (
    [...records].sort((left, right) => (
        rectificationPriority[left.rectificationStatus] - rectificationPriority[right.rectificationStatus]
        || right.deduction - left.deduction
        || right.date.localeCompare(left.date)
    ))
);

const uniqueActions = (records: ClassEvaluationRecord[]): ClassEvaluationAction[] => {
    const seen = new Set<string>();
    return records
        .flatMap(record => record.actions)
        .filter(action => {
            if (seen.has(action.title)) return false;
            seen.add(action.title);
            return true;
        })
        .slice(0, 3);
};

const parseChineseDate = (question: string, periodYear: string): string | undefined => {
    const matched = question.match(/(\d{1,2})月(\d{1,2})日/);
    if (!matched) return undefined;
    return `${periodYear}-${matched[1].padStart(2, '0')}-${matched[2].padStart(2, '0')}`;
};

const detectIndicator = (question: string): string | undefined => {
    const indicators = [
        '诗意中队',
        '安全教育',
        '健体班级',
        '文雅班级',
        '美净班级',
        '早操',
        '眼操',
        '眼保健操',
        '午检',
        '晨检',
        '路队',
        '图书',
        '公区',
        '卫生',
        '美净',
    ];
    const matched = indicators.find(indicator => question.includes(indicator));
    if (matched === '眼保健操') return '眼操';
    if (matched === '卫生' || matched === '美净') return '美净';
    return matched;
};

const recordMatchesIndicator = (record: ClassEvaluationRecord, indicator: string) => {
    if (indicator === record.dimension) return true;
    if (indicator === '美净') return record.dimension === '美净班级';
    return `${record.dimension}${record.indicator}${record.finding}`.includes(indicator);
};

const unavailableAnswer = (
    snapshot: ClassEvaluationSnapshot,
    message = `当前只同步了本周期最终得分${formatScore(snapshot.finalScore)}分，没有对应扣分明细，因此暂时无法确认具体原因。`,
): ClassEvaluationAssistantAnswer => ({
    answerType: 'unavailable',
    message,
    metrics: [{ label: '当前得分', value: formatScore(snapshot.finalScore) }],
    breakdown: [],
    actions: [],
    context: createContext(snapshot, []),
    evidenceRefs: [],
    followUpSuggestions: ['查看当前得分', '扣分明细何时同步'],
});

export const createClassEvaluationWelcomeAnswer = (
    snapshot: ClassEvaluationSnapshot,
    records: ClassEvaluationRecord[],
): ClassEvaluationAssistantAnswer => {
    if (!snapshot.hasRecordDetails) return unavailableAnswer(snapshot);

    const sortedDimensions = summarizeByDimension(records);
    const mainDimension = sortedDimensions[0];
    return {
        answerType: 'score_summary',
        message: `本周期得分${formatScore(snapshot.finalScore)}分，共${snapshot.recordCount}笔扣分。主要集中在${mainDimension.label}${mainDimension.value}，可继续询问具体日期、项目或责任归属。`,
        metrics: [
            { label: '当前得分', value: formatScore(snapshot.finalScore) },
            { label: '累计扣分', value: `-${formatScore(snapshot.deduction)}`, tone: 'negative' },
            { label: '扣分记录', value: `${snapshot.recordCount}笔` },
        ],
        breakdown: sortedDimensions,
        actions: [],
        context: createContext(snapshot, records),
        evidenceRefs: records.map(record => record.id),
        followUpSuggestions: ['本周为什么扣分', '哪些属于教师组织责任', '7月18日有哪些扣分'],
    };
};

export const askClassEvaluationQuestion = ({
    question,
    snapshot,
    records,
    previousContext,
}: AskClassEvaluationQuestionInput): ClassEvaluationAssistantAnswer => {
    const normalizedQuestion = question.trim();
    const periodRecords = records.filter(record => (
        record.classId === snapshot.classId
        && record.date >= snapshot.periodStart
        && record.date <= snapshot.periodEnd
    ));

    if (!snapshot.hasRecordDetails || periodRecords.length === 0) return unavailableAnswer(snapshot);

    const isAdviceQuestion = /怎么改|如何改|整改|怎么做|怎么办|怎么提升|如何提升|追上第一/.test(normalizedQuestion);
    const isRuleQuestion = /规则|依据|为什么扣这么多|怎么扣/.test(normalizedQuestion);
    const isTeacherResponsibilityQuestion = /教师|老师|组织责任|谁的责任/.test(normalizedQuestion);
    const parsedDate = parseChineseDate(normalizedQuestion, snapshot.periodStart.slice(0, 4));
    const detectedIndicator = detectIndicator(normalizedQuestion);
    const inheritedIndicator = isAdviceQuestion ? previousContext?.indicator : undefined;
    const targetIndicator = detectedIndicator ?? inheritedIndicator;

    let matchedRecords = periodRecords;
    if (parsedDate) matchedRecords = matchedRecords.filter(record => record.date === parsedDate);
    if (targetIndicator) matchedRecords = matchedRecords.filter(record => recordMatchesIndicator(record, targetIndicator));
    if (isTeacherResponsibilityQuestion) matchedRecords = matchedRecords.filter(record => record.teacherDeduction > 0);
    if (isAdviceQuestion && !parsedDate && !targetIndicator && previousContext?.recordIds.length) {
        matchedRecords = periodRecords.filter(record => previousContext.recordIds.includes(record.id));
    }

    const responsibilityTypes: ClassEvaluationResponsibility[] = isTeacherResponsibilityQuestion
        ? ['teacher', 'shared']
        : [];
    const context = createContext(snapshot, matchedRecords, {
        indicator: targetIndicator,
        date: parsedDate,
        responsibilityTypes,
    });

    if (matchedRecords.length === 0) {
        const scope = parsedDate ? formatDate(parsedDate) : targetIndicator ?? '该条件';
        return {
            answerType: 'deduction_detail',
            message: `${scope}没有查询到扣分记录。你可以换一个日期或检查项目继续问。`,
            metrics: [],
            breakdown: [],
            actions: [],
            context,
            evidenceRefs: [],
            followUpSuggestions: ['本周为什么扣分', '哪些属于教师组织责任'],
        };
    }

    const matchedDeduction = roundScore(matchedRecords.reduce((sum, record) => sum + record.deduction, 0));

    if (isAdviceQuestion) {
        const prioritizedRecords = prioritizeRecords(matchedRecords);
        return {
            answerType: 'action_advice',
            message: `针对刚才的${targetIndicator ?? '扣分记录'}，建议先处理${prioritizedRecords[0].indicator}，用连续检查结果确认是否改善。`,
            metrics: [],
            breakdown: summarizeRecords(prioritizedRecords),
            actions: uniqueActions(prioritizedRecords),
            context,
            evidenceRefs: prioritizedRecords.map(record => record.id),
            followUpSuggestions: ['查看对应扣分明细', '眼操扣分规则是什么'],
        };
    }

    if (isRuleQuestion) {
        const ruleRecords = matchedRecords.slice(0, 3);
        return {
            answerType: 'rule',
            message: ruleRecords.map(record => `${record.indicator}：${record.rule}`).join('\n'),
            metrics: [],
            breakdown: summarizeRecords(ruleRecords),
            actions: [],
            context: createContext(snapshot, ruleRecords, {
                indicator: targetIndicator,
                date: parsedDate,
                responsibilityTypes,
            }),
            evidenceRefs: ruleRecords.map(record => record.id),
            followUpSuggestions: ['查看对应扣分明细', '怎么改'],
        };
    }

    if (isTeacherResponsibilityQuestion) {
        const teacherDeduction = roundScore(matchedRecords.reduce((sum, record) => sum + record.teacherDeduction, 0));
        return {
            answerType: 'responsibility',
            message: `本周期有${matchedRecords.length}笔记录涉及教师组织责任，教师责任部分合计扣${formatScore(teacherDeduction)}分；共同责任仅计入其中的教师分摊部分。`,
            metrics: [{ label: '教师责任扣分', value: `-${formatScore(teacherDeduction)}`, tone: 'negative' }],
            breakdown: matchedRecords.slice(0, 5).map(record => ({
                label: record.indicator,
                value: `-${formatScore(record.teacherDeduction)}分`,
                detail: record.responsibility === 'shared' ? '共同责任中的教师部分' : '教师组织责任',
            })),
            actions: [],
            context,
            evidenceRefs: matchedRecords.map(record => record.id),
            followUpSuggestions: ['眼操扣分规则是什么', '这些记录怎么改'],
        };
    }

    if (parsedDate || targetIndicator) {
        const scope = parsedDate ? formatDate(parsedDate) : targetIndicator;
        return {
            answerType: 'deduction_detail',
            message: `${scope}共${matchedRecords.length}笔扣分，合计扣${formatScore(matchedDeduction)}分。以下均来自本周期评价台账。`,
            metrics: [{ label: '合计扣分', value: `-${formatScore(matchedDeduction)}`, tone: 'negative' }],
            breakdown: summarizeRecords(matchedRecords),
            actions: [],
            context,
            evidenceRefs: matchedRecords.map(record => record.id),
            followUpSuggestions: ['怎么改', '查看对应扣分明细'],
        };
    }

    return {
        answerType: 'deduction_summary',
        message: `本周期共${snapshot.recordCount}笔扣分，合计扣${formatScore(snapshot.deduction)}分；其中班级行为责任${formatScore(snapshot.classDeduction)}分，教师组织责任${formatScore(snapshot.teacherDeduction)}分。`,
        metrics: [
            { label: '当前得分', value: formatScore(snapshot.finalScore) },
            { label: '班级责任', value: `-${formatScore(snapshot.classDeduction)}`, tone: 'negative' },
            { label: '教师责任', value: `-${formatScore(snapshot.teacherDeduction)}`, tone: 'negative' },
        ],
        breakdown: summarizeByDimension(periodRecords),
        actions: [],
        context: createContext(snapshot, periodRecords),
        evidenceRefs: periodRecords.map(record => record.id),
        followUpSuggestions: ['早操具体扣在哪里', '哪些属于教师组织责任', '怎么改'],
    };
};

export const getRecordsFromAnswer = (
    answer: ClassEvaluationAssistantAnswer,
    records: ClassEvaluationRecord[],
) => records.filter(record => answer.evidenceRefs.includes(record.id));
