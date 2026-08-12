export interface ClassEvaluationRecord {
    id: string;
    classId: string;
    date: string;
    dimension: string;
    indicator: string;
    indicatorPath: [string, string, string];
    finding: string;
    deduction: number;
    rule: string;
}

export interface ClassEvaluationSnapshot {
    id: string;
    classId: string;
    periodStart: string;
    periodEnd: string;
    fullScore: number;
    finalScore: number;
    deduction: number;
    recordCount: number;
    hasRecordDetails: boolean;
}

export type ClassEvaluationAnswerType =
    | 'weekly_performance'
    | 'deduction_patterns'
    | 'next_week_focus'
    | 'clarification'
    | 'unavailable';

export const CLASS_EVALUATION_FIXED_QUESTIONS = [
    { id: 'weekly_performance', label: '本周班级评比表现怎么样？' },
    { id: 'deduction_patterns', label: '本周扣分反映出哪些主要问题？' },
    { id: 'next_week_focus', label: '下周应该重点关注什么？' },
] as const;

export type ClassEvaluationFixedQuestion = typeof CLASS_EVALUATION_FIXED_QUESTIONS[number];
export type ClassEvaluationFixedQuestionId = ClassEvaluationFixedQuestion['id'];

export const CLASS_EVALUATION_CHAT_PROMPT_VERSION = 'headteacher-class-evaluation-chat-v2';
export const CLASS_EVALUATION_WEEKLY_REPORT_PROMPT_VERSION = 'headteacher-class-evaluation-weekly-report-v1';

export interface ClassEvaluationDimensionMetric {
    dimension: string;
    score: number;
    maxScore: number;
    gradeRank: number;
    schoolRank: number;
    recordCount: number;
}

export interface ClassEvaluationComparisonWeek {
    label: string;
    finalScore: number;
    gradeRank: number;
    dimensionRankings: readonly ClassEvaluationDimensionMetric[];
}

export interface ClassEvaluationAnswerMetric {
    label: string;
    value: string;
    tone?: 'default' | 'negative';
}

export interface ClassEvaluationAnswerBreakdown {
    label: string;
    value: string;
    detail: string;
    tone?: 'default' | 'negative';
}

export interface ClassEvaluationAiInsight {
    title: string;
    body: string;
}

export interface ClassEvaluationConversationContext {
    classId: string;
    periodStart: string;
    periodEnd: string;
    recordIds: string[];
}

export interface ClassEvaluationAssistantAnswer {
    answerType: ClassEvaluationAnswerType;
    message: string;
    metrics: ClassEvaluationAnswerMetric[];
    breakdown: ClassEvaluationAnswerBreakdown[];
    analysis: ClassEvaluationAiInsight[];
    suggestions: ClassEvaluationAiInsight[];
    context: ClassEvaluationConversationContext;
    evidenceRefs: string[];
    promptVersion: string;
    dataSnapshotId: string;
}

export interface ClassEvaluationWeeklyReport {
    message: string;
    metrics: ClassEvaluationAnswerMetric[];
    dimensionScores: ClassEvaluationAnswerBreakdown[];
    performanceInsights: ClassEvaluationAiInsight[];
    deductionBreakdown: ClassEvaluationAnswerBreakdown[];
    deductionInsights: ClassEvaluationAiInsight[];
    nextWeekInsights: ClassEvaluationAiInsight[];
    nextWeekSuggestions: ClassEvaluationAiInsight[];
    evidenceRefs: string[];
    promptVersion: string;
    dataSnapshotId: string;
}

interface AskClassEvaluationQuestionInput {
    question: string;
    snapshot: ClassEvaluationSnapshot;
    records: ClassEvaluationRecord[];
    gradeRank: number;
    rankings: readonly ClassEvaluationDimensionMetric[];
    previousWeek?: ClassEvaluationComparisonWeek;
    previousContext?: ClassEvaluationConversationContext;
}

const roundScore = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

const formatScore = (value: number) => roundScore(value).toFixed(1);

const formatSignedScore = (value: number) => {
    const rounded = roundScore(value);
    if (rounded === 0) return '持平';
    return `${rounded > 0 ? '+' : ''}${formatScore(rounded)}分`;
};

const formatScoreTrend = (value: number) => {
    const rounded = roundScore(value);
    if (rounded === 0) return '持平';
    return `${rounded > 0 ? '上升' : '下降'}${formatScore(Math.abs(rounded))}分`;
};

const formatDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${Number(month)}月${Number(day)}日`;
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

    return {
        id: `${classId}:${periodStart}:${periodEnd}`,
        classId,
        periodStart,
        periodEnd,
        fullScore,
        finalScore: roundScore(fullScore - deduction),
        deduction,
        recordCount: periodRecords.length,
        hasRecordDetails: periodRecords.length > 0,
    };
};

const createContext = (
    snapshot: ClassEvaluationSnapshot,
    records: ClassEvaluationRecord[],
): ClassEvaluationConversationContext => ({
    classId: snapshot.classId,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    recordIds: records.map(record => record.id),
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
            tone: 'negative',
        }));
};

const prioritizeRecords = (records: ClassEvaluationRecord[]) => (
    [...records].sort((left, right) => (
        right.deduction - left.deduction
        || right.date.localeCompare(left.date)
    ))
);

const summarizeDimensionScores = (
    rankings: readonly ClassEvaluationDimensionMetric[],
): ClassEvaluationAnswerBreakdown[] => rankings.map(item => ({
    label: item.dimension,
    value: `${formatScore(item.score)}/${formatScore(item.maxScore)}分`,
    detail: `年级第${item.gradeRank} · 全校第${item.schoolRank}`,
}));

const summarizeDimensionChanges = (
    rankings: readonly ClassEvaluationDimensionMetric[],
    previousWeek?: ClassEvaluationComparisonWeek,
): ClassEvaluationAnswerBreakdown[] => rankings.map(item => {
    const previous = previousWeek?.dimensionRankings.find(previousItem => (
        previousItem.dimension === item.dimension
    ));
    const change = previous ? roundScore(item.score - previous.score) : 0;
    return {
        label: item.dimension,
        value: previous ? formatSignedScore(change) : '暂无对比',
        detail: previous
            ? `本周${formatScore(item.score)}分 · 上周${formatScore(previous.score)}分`
            : `本周${formatScore(item.score)}/${formatScore(item.maxScore)}分`,
        tone: change < 0 ? 'negative' : 'default',
    };
});

const getDimensionDeductions = (records: ClassEvaluationRecord[]) => {
    const result = new Map<string, { deduction: number; count: number }>();
    records.forEach(record => {
        const current = result.get(record.dimension) ?? { deduction: 0, count: 0 };
        result.set(record.dimension, {
            deduction: roundScore(current.deduction + record.deduction),
            count: current.count + 1,
        });
    });
    return Array.from(result.entries())
        .map(([dimension, value]) => ({ dimension, ...value }))
        .sort((left, right) => right.deduction - left.deduction || right.count - left.count);
};

const createInsight = (title: string, body: string): ClassEvaluationAiInsight => ({ title, body });

const getPromptVersion = () => CLASS_EVALUATION_CHAT_PROMPT_VERSION;

const includesAny = (value: string, keywords: readonly string[]) => (
    keywords.some(keyword => value.includes(keyword))
);

const resolveQuestionIntent = (
    question: string,
    previousContext?: ClassEvaluationConversationContext,
): ClassEvaluationFixedQuestionId | null => {
    const fixedQuestion = CLASS_EVALUATION_FIXED_QUESTIONS.find(item => item.label === question);
    if (fixedQuestion) return fixedQuestion.id;

    if (includesAny(question, ['责任', '整改', '负责人', '申诉', '改分', '修改分数'])) return null;

    const refersToPrevious = includesAny(question, ['这些', '上述', '刚才', '继续']);
    if (refersToPrevious && previousContext?.recordIds.length) {
        return includesAny(question, ['怎么', '如何', '建议', '关注', '改善'])
            ? 'next_week_focus'
            : 'deduction_patterns';
    }

    if (includesAny(question, ['上周', '相比', '变化', '趋势', '下周', '建议', '关注', '改善', '怎么做', '如何做'])) {
        return 'next_week_focus';
    }
    if (includesAny(question, ['扣分', '失分', '原因', '问题', '记录', '明细', '规则', '依据', '具体扣', '扣在哪'])) {
        return 'deduction_patterns';
    }
    if (includesAny(question, ['得分', '分数', '排名', '整体', '总体', '表现', '情况', '满分', '优势'])) {
        return 'weekly_performance';
    }
    return null;
};

const GENERIC_LABEL_TOKENS = new Set(['班级', '教师', '学生', '评价', '本周', '管理']);

const labelMatchesQuestion = (question: string, label: string) => {
    const aliases = [label, label.replaceAll('眼保健操', '眼操')];
    for (const candidate of aliases) {
        if (question.includes(candidate)) return true;
        for (let index = 0; index < candidate.length - 1; index += 1) {
            const token = candidate.slice(index, index + 2);
            if (!GENERIC_LABEL_TOKENS.has(token) && question.includes(token)) return true;
        }
    }
    return false;
};

const scopeRecordsForQuestion = (
    question: string,
    records: ClassEvaluationRecord[],
) => {
    const scoped = records.filter(record => (
        labelMatchesQuestion(question, record.dimension)
        || labelMatchesQuestion(question, record.indicator)
        || record.indicatorPath.some(label => labelMatchesQuestion(question, label))
    ));
    return scoped.length > 0 ? scoped : records;
};

const unavailableAnswer = (
    snapshot: ClassEvaluationSnapshot,
    message = `当前只同步了本周期最终得分${formatScore(snapshot.finalScore)}分，没有对应扣分明细，因此暂时无法确认具体原因。`,
): ClassEvaluationAssistantAnswer => ({
    answerType: 'unavailable',
    message,
    metrics: [{ label: '当前得分', value: formatScore(snapshot.finalScore) }],
    breakdown: [],
    analysis: [],
    suggestions: [],
    context: createContext(snapshot, []),
    evidenceRefs: [],
    promptVersion: getPromptVersion(),
    dataSnapshotId: snapshot.id,
});

export const askClassEvaluationQuestion = ({
    question,
    snapshot,
    records,
    gradeRank,
    rankings,
    previousWeek,
    previousContext,
}: AskClassEvaluationQuestionInput): ClassEvaluationAssistantAnswer => {
    const normalizedQuestion = question.trim();
    const periodRecords = records.filter(record => (
        record.classId === snapshot.classId
        && record.date >= snapshot.periodStart
        && record.date <= snapshot.periodEnd
    ));

    if (!snapshot.hasRecordDetails || periodRecords.length === 0) return unavailableAnswer(snapshot);

    const questionIntent = resolveQuestionIntent(normalizedQuestion, previousContext);
    if (!questionIntent) {
        return {
            answerType: 'clarification',
            message: '我可以基于当前班级的本周评价台账，回答得分、年级排名、扣分记录、扣分依据、周变化和下周建议。请换一种问法。',
            metrics: [],
            breakdown: [],
            analysis: [],
            suggestions: [],
            context: createContext(snapshot, []),
            evidenceRefs: [],
            promptVersion: getPromptVersion(),
            dataSnapshotId: snapshot.id,
        };
    }

    const prioritizedRecords = prioritizeRecords(periodRecords);
    const dimensionDeductions = getDimensionDeductions(periodRecords);
    const mostDeducted = dimensionDeductions[0];
    const weakestDimension = [...rankings].sort((left, right) => (
        (left.score / left.maxScore) - (right.score / right.maxScore)
        || right.gradeRank - left.gradeRank
    ))[0];

    if (questionIntent === 'weekly_performance') {
        const fullScoreDimensions = rankings.filter(item => item.score === item.maxScore);
        const topTwoDeduction = roundScore(
            (dimensionDeductions[0]?.deduction ?? 0) + (dimensionDeductions[1]?.deduction ?? 0),
        );
        const concentration = snapshot.deduction > 0
            ? Math.round((topTwoDeduction / snapshot.deduction) * 100)
            : 0;

        return {
            answerType: 'weekly_performance',
            message: `本周当前得分${formatScore(snapshot.finalScore)}分，年级第${gradeRank}名。`,
            metrics: [
                { label: '本周得分', value: `${formatScore(snapshot.finalScore)}分` },
                { label: '年级排名', value: `第${gradeRank}名` },
                { label: '累计扣分', value: `-${formatScore(snapshot.deduction)}分`, tone: 'negative' },
            ],
            breakdown: summarizeDimensionScores(rankings),
            analysis: [
                createInsight(
                    '优势表现',
                    fullScoreDimensions.length > 0
                        ? `${fullScoreDimensions.map(item => item.dimension).join('、')}保持满分，是本周相对稳定的项目。`
                        : '本周暂无满分项目，各分类仍有提升空间。',
                ),
                createInsight(
                    '主要短板',
                    `${weakestDimension.dimension}${formatScore(weakestDimension.score)}/${formatScore(weakestDimension.maxScore)}分，年级第${weakestDimension.gradeRank}，是当前得分最低的分类。`,
                ),
                createInsight(
                    '扣分集中度',
                    `前两项扣分合计${formatScore(topTwoDeduction)}分，占本周全部扣分的${concentration}%。`,
                ),
            ],
            suggestions: [
                createInsight('保持优势项', `${fullScoreDimensions.map(item => item.dimension).join('、') || '当前高分项目'}继续按现有节奏观察，避免出现新增扣分。`),
                createInsight('优先补齐短板', `下周先关注${weakestDimension.dimension}，并结合本周${mostDeducted.dimension}的逐笔记录定位高频场景。`),
            ],
            context: createContext(snapshot, periodRecords),
            evidenceRefs: periodRecords.map(record => record.id),
            promptVersion: getPromptVersion(),
            dataSnapshotId: snapshot.id,
        };
    }

    if (questionIntent === 'deduction_patterns') {
        const scopedRecords = scopeRecordsForQuestion(normalizedQuestion, periodRecords);
        const scopedPrioritizedRecords = prioritizeRecords(scopedRecords);
        const scopedDimensionDeductions = getDimensionDeductions(scopedRecords);
        const scopedDeduction = roundScore(scopedRecords.reduce((sum, record) => sum + record.deduction, 0));
        const hasSpecificScope = scopedRecords.length < periodRecords.length;
        const topTwo = scopedDimensionDeductions.slice(0, 2);
        const topTwoDeduction = roundScore(topTwo.reduce((sum, item) => sum + item.deduction, 0));
        const concentration = Math.round((topTwoDeduction / scopedDeduction) * 100);
        const largestRecord = scopedPrioritizedRecords[0];
        const highImpactShare = Math.round((largestRecord.deduction / scopedDeduction) * 100);
        const repeatedDimensions = scopedDimensionDeductions.filter(item => item.count > 1);
        const scopeLabel = hasSpecificScope
            ? Array.from(new Set(scopedRecords.map(record => record.indicator))).slice(0, 2).join('、')
            : '本周';
        const asksForRule = includesAny(normalizedQuestion, ['规则', '依据']);

        return {
            answerType: 'deduction_patterns',
            message: `${scopeLabel}共${scopedRecords.length}笔扣分，合计扣${formatScore(scopedDeduction)}分，主要涉及${topTwo.map(item => item.dimension).join('和')}。`,
            metrics: [
                { label: hasSpecificScope ? '相关扣分' : '累计扣分', value: `-${formatScore(scopedDeduction)}分`, tone: 'negative' },
                { label: hasSpecificScope ? '相关记录' : '扣分记录', value: `${scopedRecords.length}笔` },
                { label: '主要分类', value: scopedDimensionDeductions[0].dimension },
            ],
            breakdown: summarizeByDimension(scopedRecords),
            analysis: [
                createInsight('问题较集中', `${topTwo.map(item => item.dimension).join('、')}合计扣${formatScore(topTwoDeduction)}分，占全部扣分的${concentration}%。`),
                createInsight('高影响事件', `${largestRecord.indicator}单次扣${formatScore(largestRecord.deduction)}分，占相关扣分的${highImpactShare}%。`),
                asksForRule
                    ? createInsight('扣分依据', largestRecord.rule)
                    : createInsight(
                        '重复发生',
                        repeatedDimensions.length > 0
                            ? `${repeatedDimensions.map(item => `${item.dimension}${item.count}笔`).join('、')}，说明问题并非单次偶发。`
                            : '相关分类均为单次记录，暂未发现重复发生的分类。',
                    ),
            ],
            suggestions: [
                createInsight('先看高影响扣分', `优先复盘${largestRecord.indicator}，单次减少此类问题对周总分改善最直接。`),
                createInsight('持续观察高频项', `重点观察${scopedDimensionDeductions[0].dimension}，对照逐笔记录判断同类场景是否继续出现。`),
            ],
            context: createContext(snapshot, scopedPrioritizedRecords),
            evidenceRefs: scopedPrioritizedRecords.map(record => record.id),
            promptVersion: getPromptVersion(),
            dataSnapshotId: snapshot.id,
        };
    }

    const scoreChange = previousWeek
        ? roundScore(snapshot.finalScore - previousWeek.finalScore)
        : 0;
    const dimensionChanges = rankings.map(item => {
        const previous = previousWeek?.dimensionRankings.find(previousItem => (
            previousItem.dimension === item.dimension
        ));
        return {
            dimension: item.dimension,
            currentScore: item.score,
            previousScore: previous?.score,
            change: previous ? roundScore(item.score - previous.score) : 0,
        };
    });
    const biggestDecline = [...dimensionChanges].sort((left, right) => left.change - right.change)[0];
    const stableOrImproved = dimensionChanges.filter(item => item.change >= 0);
    const focusRecords = prioritizedRecords.filter(record => (
        record.dimension === biggestDecline.dimension || record.dimension === mostDeducted.dimension
    ));

    return {
        answerType: 'next_week_focus',
        message: previousWeek
            ? `本周较${previousWeek.label}总分${formatScoreTrend(scoreChange)}，下周建议优先关注${biggestDecline.dimension}和${mostDeducted.dimension}。`
            : `下周建议优先关注${weakestDimension.dimension}和${mostDeducted.dimension}。`,
        metrics: [
            { label: '本周得分', value: `${formatScore(snapshot.finalScore)}分` },
            { label: '年级排名', value: `第${gradeRank}名` },
            {
                label: '较上周',
                value: previousWeek ? formatSignedScore(scoreChange) : '暂无对比',
                tone: scoreChange < 0 ? 'negative' : 'default',
            },
        ],
        breakdown: summarizeDimensionChanges(rankings, previousWeek),
        analysis: [
            createInsight(
                '总体变化',
                previousWeek
                    ? `本周${formatScore(snapshot.finalScore)}分，较上周${formatScore(previousWeek.finalScore)}分${formatScoreTrend(scoreChange)}，年级排名由第${previousWeek.gradeRank}变为第${gradeRank}。`
                    : '当前没有可用于环比的上一周数据。',
            ),
            createInsight('下降最明显', `${biggestDecline.dimension}较上周${formatScoreTrend(biggestDecline.change)}，是五项中下降最明显的分类。`),
            createInsight(
                '稳定或改善',
                stableOrImproved.length > 0
                    ? `${stableOrImproved.map(item => item.dimension).join('、')}与上周持平或有所改善。`
                    : '五项得分均低于上周，需要优先控制新增扣分。',
            ),
        ],
        suggestions: [
            createInsight('第一关注', `先看${biggestDecline.dimension}本周记录，关注造成环比下降的具体场景。`),
            createInsight('第二关注', `${mostDeducted.dimension}是本周累计扣分最多的分类，下一周期持续观察同类记录是否减少。`),
        ],
        context: createContext(snapshot, focusRecords),
        evidenceRefs: focusRecords.map(record => record.id),
        promptVersion: getPromptVersion(),
        dataSnapshotId: snapshot.id,
    };
};

export const generateClassEvaluationWeeklyReport = (
    input: Omit<AskClassEvaluationQuestionInput, 'question'>,
): ClassEvaluationWeeklyReport => {
    const weeklyPerformance = askClassEvaluationQuestion({
        ...input,
        question: CLASS_EVALUATION_FIXED_QUESTIONS[0].label,
    });
    const deductionPatterns = askClassEvaluationQuestion({
        ...input,
        question: CLASS_EVALUATION_FIXED_QUESTIONS[1].label,
    });
    const nextWeekFocus = askClassEvaluationQuestion({
        ...input,
        question: CLASS_EVALUATION_FIXED_QUESTIONS[2].label,
    });

    return {
        message: weeklyPerformance.message,
        metrics: weeklyPerformance.metrics,
        dimensionScores: weeklyPerformance.breakdown,
        performanceInsights: weeklyPerformance.analysis,
        deductionBreakdown: deductionPatterns.breakdown,
        deductionInsights: deductionPatterns.analysis,
        nextWeekInsights: nextWeekFocus.analysis,
        nextWeekSuggestions: nextWeekFocus.suggestions,
        evidenceRefs: Array.from(new Set([
            ...weeklyPerformance.evidenceRefs,
            ...deductionPatterns.evidenceRefs,
            ...nextWeekFocus.evidenceRefs,
        ])),
        promptVersion: CLASS_EVALUATION_WEEKLY_REPORT_PROMPT_VERSION,
        dataSnapshotId: input.snapshot.id,
    };
};

export const getRecordsFromAnswer = (
    answer: ClassEvaluationAssistantAnswer,
    records: ClassEvaluationRecord[],
) => records.filter(record => answer.evidenceRefs.includes(record.id));
