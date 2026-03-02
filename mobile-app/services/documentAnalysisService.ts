import { GoogleGenAI } from '@google/genai';
import { EducationDocumentAnalysis } from '../types';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

const ROLE_PROMPT = `# 一、角色设定（Role）
你是一名熟悉中国基础教育场景的教育文档分析专家与教务数据助手，精通对教师上传的各类教育文档（成绩表、评价标准、教学方案、制度文件等）进行理解、归类和结构化总结。你生成的结果将被系统长期存储，并用于期末一键生成全校、全学科学生评价报告，因此需要稳定、可扩展、可被程序调用。

# 二、你的任务（Task）
用户上传了一份教育相关文档（格式可能是图片、Excel、Word、PDF 等），你需要：
1. 理解文档内容。
2. 判断文档类型与系统角色。
3. 提取稳定的通用结构化字段。
4. 在必要时提取类型扩展字段（尤其是成绩文档）。
5. 生成清晰、客观的自然语言概要。

**重要原则**
- 只基于文档内容进行判断。
- 文档中未出现的信息不要推断或补充。
- 不确定的信息请明确标注为「未提及 / 未明确」。

# 三、文档类型与系统角色判断（内部逻辑）
文档类型（doc_type）枚举：score_document、evaluation_standard、teaching_plan、student_process_record、policy_or_notice、other_education_document。
数据角色（data_role）枚举：primary_data、rule_reference、background_info、management_info、other。

# 四、统一输出格式
严格返回 JSON：
{
  "doc_meta": {
    "doc_type": "",
    "data_role": "",
    "primary_subject": "",
    "education_stage": "",
    "school_year": "",
    "semester": "",
    "grade_scope": "",
    "class_scope": "",
    "student_scope": "",
    "time_scope": "",
    "core_purpose": "",
    "can_be_used_in_report": false,
    "confidence": 0.0
  },
  "extensions": {
    "score": null,
    "evaluation_standard": null,
    "teaching_plan": null,
    "custom": null
  },
  "summary": {
    "one_sentence": "",
    "detailed": ""
  },
  "semantic_tags": []
}

# 五、字段填写规则
成绩文档需补充 score 字段，评价标准补充 evaluation_standard，教学方案补充 teaching_plan，其他情况写 custom 重点。字段含义与取值范围与之前说明一致。

# 六、必须遵守的输出原则
- 不推断、不编造文档中未出现的信息。
- 成绩文档优先保证结构化完整。
- 非成绩文档可以结构不完整，但语义必须清晰。
- 所有输出字段必须存在，不用的扩展字段设为 null。

# 七、目标提醒
输出将用于：
- 文档库长期存储与自动匹配。
- 期末一键生成全校学生学科评价报告。
- 按学期 / 学科 / 年级自动检索可用文档。
`;

type MockKey = 'PE_EVAL' | 'PE_EVAL_V2' | 'PHYSICAL_SUMMARY' | 'GENERIC';

const MOCK_RESPONSES: Record<MockKey, EducationDocumentAnalysis> = {
  PE_EVAL: {
    doc_meta: {
      doc_type: 'score_document',
      data_role: 'primary_data',
      primary_subject: '体育',
      education_stage: '小学',
      school_year: '2024-2025 学年',
      semester: '上学期',
      grade_scope: '三年级',
      class_scope: '三年级全部班级',
      student_scope: '42人',
      time_scope: '2024年12月',
      core_purpose: '记录并汇总三年级体育综合素质测评成绩，用于期末评价与上报',
      can_be_used_in_report: true,
      confidence: 0.86
    },
    extensions: {
      score: {
        exam_type: '期末',
        score_nature: '结果性成绩',
        class_count: '3个班',
        student_count: '42',
        score_dimensions: ['身体素质', '专项技能', '课堂表现'],
        scoring_method: '四级制转等级',
        is_primary_data_source: true,
        missing_info: ['未见具体评分标准']
      },
      evaluation_standard: null,
      teaching_plan: null,
      custom: null
    },
    summary: {
      one_sentence: '文档汇总了三年级体育综合素质评价各班学生的期末成绩，用于期末等级评定与上报。',
      detailed: '表格分班呈现身体素质、专项技能、课堂表现等维度的测评结果，辅以等级或分值，可作为体育学科报告的直接数据来源。未见具体评分细则，需要按学校统一标准解析。'
    },
    semantic_tags: ['体育', '期末成绩', '三年级', '综合素质', '2024-2025学年']
  },
  PE_EVAL_V2: {
    doc_meta: {
      doc_type: 'score_document',
      data_role: 'primary_data',
      primary_subject: '体育',
      education_stage: '小学',
      school_year: '2024-2025 学年',
      semester: '下学期',
      grade_scope: '三年级',
      class_scope: '三年级全部班级',
      student_scope: '未明确',
      time_scope: '2025年1月',
      core_purpose: '跟踪不同班级体育综合素质测试的最新成绩情况',
      can_be_used_in_report: true,
      confidence: 0.8
    },
    extensions: {
      score: {
        exam_type: '期末',
        score_nature: '结果性成绩',
        class_count: '未明确',
        student_count: '未明确',
        score_dimensions: ['体能测试', '专项技能', '行为表现'],
        scoring_method: '等级制',
        is_primary_data_source: true,
        missing_info: ['未说明评价标准', '未区分班级权重']
      },
      evaluation_standard: null,
      teaching_plan: null,
      custom: null
    },
    summary: {
      one_sentence: '文档记录下学期三年级体育综合素质的终结性成绩，便于生成学生体育报告。',
      detailed: '文件对各班体能、技能和课堂表现进行了量化，适合作为AI生成体育学科小结的底稿。需结合学校统一标准解读等级含义。'
    },
    semantic_tags: ['体育', '综合素质', '期末', '三年级']
  },
  PHYSICAL_SUMMARY: {
    doc_meta: {
      doc_type: 'score_document',
      data_role: 'primary_data',
      primary_subject: '体育',
      education_stage: '小学',
      school_year: '2024-2025 学年',
      semester: '上学期',
      grade_scope: '全学段',
      class_scope: '各班级',
      student_scope: '未明确',
      time_scope: '2024年秋季学期',
      core_purpose: '汇总全校学生体质健康监测指标，用于上报与趋势分析',
      can_be_used_in_report: true,
      confidence: 0.78
    },
    extensions: {
      score: {
        exam_type: '体测',
        score_nature: '结果性成绩',
        class_count: '未明确',
        student_count: '未明确',
        score_dimensions: ['BMI', '肺活量', '50米跑', '立定跳远'],
        scoring_method: '国家体测标准转换',
        is_primary_data_source: true,
        missing_info: ['未提及年级权重']
      },
      evaluation_standard: null,
      teaching_plan: null,
      custom: null
    },
    summary: {
      one_sentence: '记录秋季学期体质健康各项指标的统计结果，用于校级体育健康报告。',
      detailed: '表格按指标汇总各班或年级的体测数据，可直接用于期末体育健康章节，也能支持生成班级体质趋势分析，需补充具体学生人数。'
    },
    semantic_tags: ['体育', '体质健康', '秋季学期', '体测数据']
  },
  GENERIC: {
    doc_meta: {
      doc_type: 'other_education_document',
      data_role: 'other',
      primary_subject: '未明确',
      education_stage: '未明确',
      school_year: '未提及',
      semester: '未明确',
      grade_scope: '未明确',
      class_scope: '未明确',
      student_scope: '未明确',
      time_scope: '未明确',
      core_purpose: '未提及',
      can_be_used_in_report: false,
      confidence: 0.3
    },
    extensions: {
      score: null,
      evaluation_standard: null,
      teaching_plan: null,
      custom: {
        key_points: ['缺少结构化内容'],
        possible_usage: '需要进一步补充后才能进入报告'
      }
    },
    summary: {
      one_sentence: '文档内容信息不足，无法生成有效的教育标签。',
      detailed: '请上传更完整的成绩或方案文件，以便系统生成结构化字段并进入评价报告。'
    },
    semantic_tags: ['未分类', '信息不足']
  }
};

const pickMockByName = (fileName?: string): MockKey => {
  if (!fileName) return 'GENERIC';
  if (fileName.includes('体质健康')) return 'PHYSICAL_SUMMARY';
  if (fileName.includes('综合素质') && fileName.includes('下')) return 'PE_EVAL_V2';
  if (fileName.includes('综合素质')) return 'PE_EVAL';
  return 'GENERIC';
};

const cloneAnalysis = (analysis: EducationDocumentAnalysis): EducationDocumentAnalysis => JSON.parse(JSON.stringify(analysis));

const buildPrompt = (content: string, fileName?: string) => `${ROLE_PROMPT}

# 四、文档内容
文件名称：${fileName || '未命名文件'}
文本内容：
${content}

请严格按照上方 JSON 结构输出，不要添加额外说明。`;

export const analyzeEducationDocument = async (
  documentContent: string,
  fileName?: string
): Promise<EducationDocumentAnalysis> => {
  if (!documentContent?.trim()) {
    return cloneAnalysis(MOCK_RESPONSES.GENERIC);
  }

  if (!API_KEY) {
    console.warn('API Key not found for document analysis, returning mock data.');
    return cloneAnalysis(MOCK_RESPONSES[pickMockByName(fileName)]);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = buildPrompt(documentContent, fileName);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) {
      console.warn('Empty AI response, using mock data.');
      return cloneAnalysis(MOCK_RESPONSES[pickMockByName(fileName)]);
    }

    return JSON.parse(text) as EducationDocumentAnalysis;
  } catch (error) {
    console.error('Failed to analyze document:', error);
    return cloneAnalysis(MOCK_RESPONSES[pickMockByName(fileName)]);
  }
};

export const getMockAnalysis = (fileName?: string): EducationDocumentAnalysis => {
  return cloneAnalysis(MOCK_RESPONSES[pickMockByName(fileName)]);
};
