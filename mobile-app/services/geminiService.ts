import { GoogleGenAI } from "@google/genai";
import { DetailedReportSection, ScoreItem } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const generateStudentReport = async (
  studentName: string,
  scores: ScoreItem[],
  subject: string
): Promise<DetailedReportSection[]> => {
  if (!processEnvApiKey) {
    console.warn("API Key not found, returning mock data.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  const prompt = `
    Generate a detailed academic and physical education report for a student named "${studentName}".
    The report should be for the subject: "${subject}".
    
    Here are the student's holistic scores:
    ${scores.map(s => `- ${s.label}: ${s.score}`).join('\n')}

    Please generate a JSON response with the following structure (strictly JSON, no markdown code blocks):
    [
      { "title": "Overall Evaluation", "content": "..." },
      { "title": "Highlights", "content": "..." },
      { "title": "Development & Improvement", "content": "..." },
      { "title": "Professional Suggestions", "content": "..." }
    ]

    Tone: Encouraging, professional, and formal Chinese.
    The "Highlights" section should have numbered points.
    Make the content specific to the scores provided. Low scores should have constructive feedback.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as DetailedReportSection[];
  } catch (error) {
    console.error("Failed to generate report:", error);
    throw error;
  }
};
