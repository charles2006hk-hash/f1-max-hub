import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 🔥 強制 AI 針對 F1 官網 2026 澳洲站的結果進行解析
    const prompt = `
      Task: Scrape and parse the 2026 F1 Australian Grand Prix results from the official F1 website.
      Reference URL: https://www.formula1.com/en/results/2026/races/1279/australia/race-result

      Context: The race was held on March 8, 2026. George Russell (Mercedes) won, followed by Kimi Antonelli. Max Verstappen finished 6th.
      
      Requirements:
      1. Extract the Top 10 Driver Standings based on this race result.
      2. Identify the next 5 upcoming races in the 2026 calendar (China, Japan, Bahrain, etc.).
      
      OUTPUT STRICTLY IN JSON FORMAT ONLY (no markdown blocks, no prose):
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
          { "date": "MAR 08", "name": "Australian GP", "status": "RUS WON" },
          { "date": "MAR 15", "name": "Chinese GP", "status": "UPCOMING" },
          { "date": "MAR 29", "name": "Japanese GP", "status": "UPCOMING" },
          { "date": "APR 12", "name": "Bahrain GP", "status": "UPCOMING" },
          { "date": "APR 19", "name": "Saudi Arabian GP", "status": "UPCOMING" }
        ]
      }
    `;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    let text = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
