import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

// Steps Prompt Definitions (Based on the provided evaluation_prompt project)
const STEP1_PROMPT = `
# 校园评价对象提取任务
你是一个专门用于从教师校园日常记录中精准提取相关对象的AI助手。你的任务是从输入的教师评价内容中识别并提取所有涉及的学生、班级、年级与学校对象，并根据语义判断这些对象是否为此次事件的直接评价主体（main_object）。

## 核心要求
- 严格按照输入内容提取信息，不进行主观修改。
- 只有直接承受评价（加/扣分）的对象 main_object 为 true。

## 输出格式 (JSON)
{
  "students": [ { "grade_name": "...", "class_name": "...", "student_name": "...", "main_object": true/false } ],
  "classes": [ { "class_name": "...", "grade_name": "...", "main_object": true/false } ],
  "grades": [ { "grade_name": "...", "main_object": true/false } ],
  "school": [ { "school_name": "...", "main_object": true/false } ]
}
`;

const STEP3_PROMPT = `
# 指标匹配任务
你专注于从评价文本中提炼事件核心以匹配最贴近的三级指标。

## 输入
- 评价内容：原始文本
- all_indicators：所有可用指标列表

## 输出格式 (JSON)
{
  "status": "authorized",
  "selected_indicators": [
    {
      "id": "...",
      "name": "...",
      "level_one": "...",
      "level_two": "...",
      "level_three": "...",
      "reason": "匹配理由"
    }
  ]
}
`;

const STEP4_PROMPT = `
# 最终评价处理任务
你负责接收指标的匹配结果后，结合学生年级段完成时间提取、分值判定与评语生成。

## 规则
1. 判定行为方向 (加分或减分)。
2. 确定分值档位 (-5 到 +5，不为 0)。
3. 提取事件发生日期。
4. 生成 1-2 句自然、口语化的 AI 评语。

## 输出格式 (JSON)
{
  "evaluation_date": "YYYY-MM-DD",
  "event_summary": "评语...",
  "hits": [
    {
      "indicator_id": "...",
      "isBad": true/false,
      "score": number,
      "reason": "审计理由"
    }
  ]
}
`;

export const analyzeBehaviorRecord = async (
    content: string,
    allIndicators: any[],
    teacherInfo?: any
) => {
    if (!API_KEY) {
        console.warn("API Key not found for behavior analysis");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const combinedPrompt = `
      You are an education data assistant. Process the following teacher record:
      "${content}"

      Task 1: Extract involved objects (students, classes).
      Task 2: Match to these indicators: ${JSON.stringify(allIndicators.slice(0, 50))}... (truncated for context)
      Task 3: Determine score (-5 to 5) and write an encouraging comment in Chinese.

      Output JSON only:
      {
        "objects": { ...Extraction Result... },
        "indicators": [ ...Matched Indicators... ],
        "analysis": {
          "score": number,
          "isBad": boolean,
          "comment": "AI评语",
          "date": "YYYY-MM-DD"
        }
      }
    `;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: combinedPrompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const responseText = response.text;
        if (!responseText) return null;
        return JSON.parse(responseText);

    } catch (error) {
        console.error("AI Analysis failed:", error);
        return null;
    }
};
