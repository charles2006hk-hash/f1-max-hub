import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 🔥 改變策略：不再硬核爬蟲，改為專家知識提取，並提供強大的 JSON 範本鎖定輸出
    const prompt = `
      Task: You are an expert F1 data analyst for the 2026 season.
      Provide the LATEST 2026 F1 Driver Standings (Top 8) and the next 5 upcoming races in the 2026 calendar.
      Context: The 2026 Australian Grand Prix has concluded. 
      
      OUTPUT STRICTLY IN VALID JSON FORMAT ONLY. Do not include markdown formatting like \`\`\`json. Just output the raw JSON object.
      
      Example Expected Structure (Update with accurate 2026 post-Australia data):
      {
        "standings": [
          { "pos": 1, "driver": "RUS", "team": "Mercedes", "pts": 25, "trend": "up" },
          { "pos": 2, "driver": "ANT", "team": "Mercedes", "pts": 18, "trend": "up" },
          { "pos": 3, "driver": "LEC", "team": "Ferrari", "pts": 15, "trend": "up" },
          { "pos": 4, "driver": "HAM", "team": "Ferrari", "pts": 12, "trend": "up" },
          { "pos": 5, "driver": "NOR", "team": "McLaren", "pts": 10, "trend": "up" },
          { "pos": 6, "driver": "VER", "team": "Red Bull", "pts": 8, "trend": "down" },
          { "pos": 7, "driver": "BEA", "team": "Haas", "pts": 6, "trend": "up" },
          { "pos": 8, "driver": "LIN", "team": "RB", "pts": 4, "trend": "up" }
        ],
        "races": [
          { "date": "MAR 15", "name": "Chinese Grand Prix", "status": "UPCOMING" },
          { "date": "MAR 29", "name": "Japanese Grand Prix", "status": "UPCOMING" },
          { "date": "APR 12", "name": "Bahrain Grand Prix", "status": "UPCOMING" },
          { "date": "APR 19", "name": "Saudi Arabian Grand Prix", "status": "UPCOMING" },
          { "date": "MAY 03", "name": "Miami Grand Prix", "status": "UPCOMING" }
        ]
      }
    `;

    const response = await ai.models.generateContent({ 
      model: 'gemini-2.5-flash', 
      contents: prompt 
    });
    
    let text = response.text || '';
    
    // 🔥 強力清理：移除 AI 可能雞婆加上的 Markdown 標籤與文字說明
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // 🔥 防呆機制：強制尋找 JSON 的大括號範圍
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
    }

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("F1 API Error:", error);
    // 如果 AI 真的發生嚴重錯誤，我們回傳一組預設的格式，讓後台不會顯示空白
    return NextResponse.json({
      standings: [{ "pos": 1, "driver": "ERROR", "team": "API", "pts": 0, "trend": "same" }],
      races: [{ "date": "ERR", "name": "API Connection Failed", "status": "ERROR" }]
    });
  }
}
