import { Trophy, Zap, MessageSquare, Calendar, Flag, Newspaper, Radio } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';

export const revalidate = 3600;

// 🧠 升級版的 AI 大腦：一次生成「戰報」與「每日新聞」
async function getRaceReport() {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert F1 insider and technical analyst for the 2026 season. 
    Generate two things:
    1. A post-race report for the 2026 Bahrain Grand Prix focusing on Max Verstappen's performance with the new 50/50 hybrid and active aero.
    2. A "Daily Breaking News" or rumor about the 2026 grid (e.g., Red Bull Powertrains development, FIA technical directives, etc.).

    OUTPUT STRICTLY IN JSON FORMAT ONLY (no markdown blocks):
    {
      "race": {
        "raceName": "2026 Bahrain Grand Prix",
        "date": "2026-03-08",
        "aiSummary": "Max Verstappen showcased absolute mastery... (around 60 words)",
        "highlights": [
          { "label": "Fastest Lap", "value": "1:32.XXX", "note": "Lighter chassis" },
          { "label": "MGU-K Regen", "value": "350kW", "note": "Peak efficiency" },
          { "label": "Gap to P2", "value": "+X.XXXs", "note": "Cruising pace" }
        ]
      },
      "news": {
        "headline": "A catchy, realistic 2026 F1 news headline",
        "content": "A detailed 50-word paragraph about this news or paddock rumor.",
        "tag": "TECH RUMOR"
      }
    }
  `;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({ model: modelName, contents: prompt });
      let text = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(text);
      data.race.raceName = `${data.race.raceName} (AI Generated)`;
      return data;
    } catch (error) {
      console.warn(`Model ${modelName} failed.`);
    }
  }

  // 備用資料
  return {
    race: {
      raceName: "2026 Bahrain Grand Prix (Offline Mode)",
      date: "2026-03-08",
      aiSummary: "AI telemetry offline. Max Verstappen demonstrated absolute dominance in the RB22, perfectly executing battery deployment.",
      highlights: [
        { label: "Fastest Lap", value: "1:32.456", note: "Lighter chassis advantage" },
        { label: "MGU-K Regen", value: "350kW Peak", note: "Incredible braking efficiency" },
        { label: "Gap to P2", value: "+4.215s", note: "Flawless cruising pace" } 
      ]
    },
    news: {
      headline: "Red Bull Ford Powertrains Hit Milestone",
      content: "Sources suggest the 2026 PU has surpassed early dyno targets, particularly in the MGU-K energy recovery phases, giving Verstappen a significant advantage.",
      tag: "OFFICIAL"
    }
  };
}

export default async function Home() {
  const data = await getRaceReport();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-20 scroll-smooth font-sans">
      
      {/* 導航列 */}
      <nav className="border-b border-blue-900/50 bg-blue-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-black text-2xl italic tracking-tighter">MAX<span className="text-white">33</span></span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-bold text-sm">
            <a href="#ai-news" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Radio size={14} className="text-red-500 animate-pulse"/> AI News</a>
            <a href="#standings" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Flag size={14}/> Standings</a>
            <a href="#paddock-feed" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <MessageSquare size={14} className="text-blue-400"/> Feed
            </a>
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Admin: Jason</div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-12">
        <HeroBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 左側主內容區 (2/3) */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* 🔥 全新的 AI 自動生成新聞區塊 */}
            <section id="ai-news" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-6">
                <Radio className="text-red-600" size={28} />
                <h2 className="text-3xl font-bold text-white">AI Paddock Radar</h2>
                <span className="bg-red-950/50 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-red-400 border border-red-900 ml-auto flex items-center gap-1">
                  <Zap size={12} /> Auto-Updated
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-8 shadow-xl relative overflow-hidden group hover:border-red-900/50 transition duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 inline-block bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50">
                  {data.news.tag}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4 leading-snug">{data.news.headline}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{data.news.content}</p>
              </div>
            </section>

            {/* AI Report (原有的) */}
            <section id="ai-report" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-yellow-400 pl-4 mb-6">
                <Trophy className="text-yellow-400" size={28} />
                <h2 className="text-3xl font-bold text-white">Race Intelligence</h2>
              </div>
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{data.race.raceName}</h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800 relative z-10">{data.race.aiSummary}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {data.race.highlights.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-red-600/50 transition duration-300">
                      <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                      <div className="text-xl font-bold text-yellow-400 mb-2">{item.value}</div>
                      <div className="text-xs text-gray-400">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 留言板 */}
            <section id="paddock-feed" className="scroll-mt-24">
               <CommentBoard />
            </section>

          </div>

          {/* 右側資訊區 (1/3) */}
          <div className="lg:col-span-1 space-y-10">
            
            {/* 🔥 這是你的專屬陣地：Voice of the Day */}
            <section>
              <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-3 mb-4">
                <h2 className="text-xl font-bold text-white">Jason's Take</h2>
              </div>
              <VoiceOfDay />
            </section>

            {/* 積分榜 */}
            <section id="standings" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="font-bold text-white flex items-center gap-2"><Flag size={18} className="text-blue-500"/> 2026 Standings</h3>
                <span className="text-xs text-slate-500">Round 1/24</span>
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-900 border-b border-slate-800">
                    <tr><th className="px-4 py-3">Pos</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3 text-right">PTS</th></tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-900/20 border-b border-slate-800">
                      <td className="px-4 py-3 font-bold text-white">1</td>
                      <td className="px-4 py-3 font-bold text-white">VER <span className="text-slate-500 text-xs font-normal">RBR</span></td>
                      <td className="px-4 py-3 font-bold text-yellow-400 text-right">26</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 賽程表 */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Calendar size={18} className="text-red-500"/> Next Races</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-xs text-red-500 font-bold mb-1">MAR 20-22</div>
                    <div className="text-sm font-bold text-white">Saudi Arabian GP</div>
                  </div>
                  <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Jeddah</div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
