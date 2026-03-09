import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      You are an expert F1 data analyst. Today is March 2026. The 2026 F1 Australian GP has concluded.
      Provide the highly accurate, current 2026 Driver Standings (Top 8) and the Next 5 Upcoming Races.
      OUTPUT STRICTLY IN JSON FORMAT ONLY (no markdown blocks, no text):
      {
        "standings": [
          { "pos": 1, "driver": "VER", "team": "Red Bull", "pts": 26, "trend": "up" },
          { "pos": 2, "driver": "LEC", "team": "Ferrari", "pts": 18, "trend": "same" }
        ],
        "races": [
          { "date": "MAR 22", "name": "Saudi Arabian GP", "status": "UPCOMING" }
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
