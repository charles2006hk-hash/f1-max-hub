import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 🔥 終極防幻覺 Prompt：強制導航與搜尋真實數據
    const prompt = `
      CRITICAL INSTRUCTION: You are an F1 Live Data Extraction Tool. DO NOT invent or hallucinate data. 
      You MUST fetch the REAL, CURRENT 2026 data.

      STEP 1: Access https://www.formula1.com/en/results/2026/races
      STEP 2: Identify the MOST RECENTLY COMPLETED Grand Prix in the 2026 season from that list.
      STEP 3: Read the official Top 8 driver standings/results strictly from that specific completed race.
      STEP 4: Identify the next 5 UPCOMING races in the 2026 calendar.

      Example formatting rules:
      - Driver codes must be 3 letters (e.g., VER, LEC, RUS, NOR).
      - Team names should be short (e.g., Red Bull, Ferrari, Mercedes, McLaren).
      - Points (pts) must be accurate to the real-world official results.

      OUTPUT STRICTLY IN VALID JSON FORMAT ONLY (No markdown blocks, no intro text):
      {
        "standings": [
          { "pos": 1, "driver": "DRIVER_CODE", "team": "Team Name", "pts": 25, "trend": "up" }
        ],
        "races": [
          { "date": "MAR 08", "name": "Australian Grand Prix", "status": "COMPLETED" },
          { "date": "MAR 22", "name": "Saudi Arabian Grand Prix", "status": "UPCOMING" }
        ]
      }
    `;

    const response = await ai.models.generateContent({ 
      model: 'gemini-2.5-flash', 
      contents: prompt 
    });
    
    let text = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
