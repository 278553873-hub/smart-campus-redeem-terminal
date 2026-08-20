
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialAdvice(coins: number, bankBalance: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `我是一名小学生。我有${coins}枚可用成长币，已经存下${bankBalance}枚成长币。请给我1-2句简短的、友好的规划建议或鼓励。请用中文回答，语气要亲切、简单，适合小孩子。`,
      config: {
        systemInstruction: "你是一个名为'智慧猫头鹰'的校园理财导师吉祥物。你会使用表情符号和简单的中文词汇给小学生提供建议。",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "你做得真棒！每一枚存下来的成长币，都在帮你离小目标更近一步！🌟";
  }
}
