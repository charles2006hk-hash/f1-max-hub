import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 🔥 最新的動態抓取邏輯：不再寫死澳洲站，而是讓 AI 自己去總表找最新賽事！
    const prompt = `
      Task: Act as an expert F1 Data Scraper. 
      Step 1: Visit https://www.formula1.com/en/results/2026/races to identify the LATEST COMPLETED Grand Prix in the 2026 season.
      Step 2: Navigate to that specific completed race's "Race Result" page.
      Step 3: Extract the Top 8 Driver Standings based on those results, and list the next 5 upcoming races from the calendar.

      Current Context: It is the 2026 F1 season. Do NOT hardcode Australia. Always look for the most recently completed race on the official site.
      
      OUTPUT STRICTLY IN JSON FORMAT ONLY (No markdown, no text):
      {
        "standings": [
          { "pos": 1, "driver": "DRIVER_CODE", "team": "TEAM_NAME", "pts": 25, "trend": "up" }
        ],
        "races": [
          { "date": "MMM DD", "name": "Race Name", "status": "WINNER_NAME WON or UPCOMING" }
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
