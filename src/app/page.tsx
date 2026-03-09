import { Trophy, Zap, MessageSquare, Calendar, Flag, Radio, Video, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';

export const revalidate = 3600;

// 🧠 升級版 AI 大腦：連同「影片 Prompt」一起自動生成
async function getRaceReport() {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert F1 insider for the 2026 season. Generate JSON format ONLY (no markdown blocks):
    {
      "race": {
        "raceName": "2026 Bahrain Grand Prix",
        "date": "2026-03-08",
        "aiSummary": "Max Verstappen showcased absolute mastery of the new 50/50 hybrid system...",
        "highlights": [
          { "label": "Fastest Lap", "value": "1:32.456", "note": "Lighter chassis" },
          { "label": "MGU-K Regen", "value": "350kW", "note": "Peak efficiency" },
          { "label": "Gap to P2", "value": "+4.215s", "note": "Cruising pace" }
        ],
        "videoPrompt": "A highly detailed, cinematic 30-second 3D render of a 2026 Red Bull F1 car dynamically adjusting its active aero wings while braking heavily, glowing hybrid battery, photorealistic, 4k, 60fps."
      },
      "news": {
        "headline": "Ford Powertrain hits 350kW Target",
        "content": "Christian Horner confirms dyno testing exceeds expectations ahead of the Bahrain test. The new 50/50 power unit is ready.",
        "tag": "TECH RUMOR",
        "videoPrompt": "A futuristic engine dyno room, glowing blue and orange energy flowing through a 2026 F1 power unit, mechanics in Red Bull gear looking at holographic data screens, hyper-realistic, slow motion."
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
      aiSummary: "AI telemetry offline. Max Verstappen demonstrated absolute dominance in the RB22.",
      highlights: [
        { label: "Fastest Lap", value: "1:32.456", note: "Lighter chassis advantage" },
        { label: "MGU-K Regen", value: "350kW Peak", note: "Incredible braking efficiency" },
        { label: "Gap to P2", value: "+4.215s", note: "Flawless cruising pace" } 
      ],
      videoPrompt: "Cinematic shot of a 2026 F1 car with active aero, speeding through the Bahrain night."
    },
    news: {
      headline: "Red Bull Ford Powertrains Hit Milestone",
      content: "Sources suggest the 2026 PU has surpassed early dyno targets, giving Verstappen a huge advantage.",
      tag: "OFFICIAL",
      videoPrompt: "A hyper-realistic 3D render of a futuristic F1 hybrid engine glowing with energy."
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
            <a href="#ai-news" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Radio size={14} className="text-red-500 animate-pulse"/> AI Broadcast</a>
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
            
            {/* 🎥 AI 每日新聞與短片區 */}
            <section id="ai-news" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-6">
                <Radio className="text-red-600" size={28} />
                <h2 className="text-3xl font-bold text-white">Daily AI Broadcast</h2>
                <span className="bg-red-950/50 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-red-400 border border-red-900 ml-auto flex items-center gap-1">
                  <Video size={12} className="animate-pulse" /> Auto-Generated
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-1 shadow-xl overflow-hidden group hover:border-red-900/50 transition duration-500">
                {/* 模擬 AI 影片播放器 */}
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-blue-900/10 z-10 mix-blend-overlay pointer-events-none"></div>
                  {/* 這裡使用一段無版權的科技感背景影片來模擬 AI 生成結果 */}
                  <video src="https://cdn.pixabay.com/video/2020/05/25/40131-424908905_tiny.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60"></video>
                  
                  {/* 影片上的 AI 狀態疊加層 */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1">
                      <Loader2 size={12} className="text-red-500 animate-spin" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">AI Video Synth Engine</span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono truncate">Prompt: {data.news.videoPrompt}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 inline-block bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50">
                    {data.news.tag}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-snug">{data.news.headline}</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{data.news.content}</p>
                </div>
              </div>
            </section>

            {/* 🎥 AI 賽事解析與短片區 */}
            <section id="ai-report" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-yellow-400 pl-4 mb-6">
                <Trophy className="text-yellow-400" size={28} />
                <h2 className="text-3xl font-bold text-white">Race Intelligence</h2>
              </div>
              
              <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                {/* 模擬 AI 技術分析影片 */}
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex flex-col items-center justify-center">
                  <video src="https://cdn.pixabay.com/video/2021/08/04/83864-584759715_tiny.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60"></video>
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={12} className="text-yellow-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Tech Render Engine</span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono truncate">Prompt: {data.race.videoPrompt}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{data.race.raceName}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800">{data.race.aiSummary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.race.highlights.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-yellow-600/50 transition duration-300">
                        <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                        <div className="text-xl font-bold text-yellow-400 mb-2">{item.value}</div>
                        <div className="text-xs text-gray-400">{item.note}</div>
                      </div>
                    ))}
                  </div>
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
            <section>
              <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-3 mb-4">
                <h2 className="text-xl font-bold text-white">Jason's Take</h2>
              </div>
              <VoiceOfDay />
            </section>

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
