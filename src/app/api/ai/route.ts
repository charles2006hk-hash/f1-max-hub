import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      你是 2026 年 F1 賽季的專業體育新聞主編與 AI 影片導演。
      請根據最新的 F1 賽事發展，自動為我生成今天網站要發佈的內容與影片 Prompt：
      1. 【新聞】今日 F1 最新重大新聞或謠言。
      2. 【技術】2026 賽車技術亮點或賽事分析。
      請務必只輸出嚴格的 JSON 格式 (不要包含 markdown 標記)：
      {
        "news": {
          "headline": "引人入勝的英文新聞標題",
          "content": "約 40 字的英文新聞內容",
          "videoPrompt": "給影片生成 AI 看的英文 prompt (例如: Cinematic 4k shot of Red Bull F1 car in Bahrain...)"
        },
        "tech": {
          "headline": "專業的英文技術分析標題",
          "content": "約 40 字的英文技術細節說明",
          "videoPrompt": "給影片生成 AI 看的英文 prompt (例如: Hyper-realistic 3D render of a 2026 F1 hybrid engine glowing...)"
        }
      }
    `;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    let text = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
