import { ShieldAlert, Cpu, Trophy, Zap, ChevronDown, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay'; // 引入新的右側組件

export const revalidate = 3600;

async function getRaceReport() {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert F1 analyst. Generate a post-race report for the 2026 Bahrain Grand Prix (Season Opener).
    2026 Rules context: MGU-H is removed, MGU-K is boosted to 350kW (50/50 power ratio), and Active Aero is introduced.
    Focus on Max Verstappen's performance.
    
    OUTPUT STRICTLY IN JSON FORMAT ONLY (no markdown blocks like \`\`\`json):
    {
      "raceName": "2026 Bahrain Grand Prix",
      "date": "2026-03-08",
      "aiSummary": "A concise, professional, and thrilling 80-word summary of the race under 2026 regulations.",
      "highlights": [
        { "label": "Fastest Lap", "value": "1:32.XXX", "note": "Brief note" },
        { "label": "MGU-K Deployment", "value": "Data", "note": "Brief note" },
        { "label": "Gap to P2", "value": "+X.XXXs", "note": "Brief note" }
      ]
    }
  `;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({ model: modelName, contents: prompt });
      let text = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(text);
      data.raceName = `${data.raceName} (AI Generated via ${modelName})`;
      return data;
    } catch (error) {
      console.warn(`Model ${modelName} failed.`);
    }
  }

  return {
    raceName: "2026 Bahrain Grand Prix (Offline Mode)",
    date: "2026-03-08",
    aiSummary: "AI telemetry is currently offline. Nevertheless, Max Verstappen demonstrated absolute dominance in the RB22, perfectly executing battery deployment and active aero strategies to secure victory in the season opener.",
    highlights: [
      { label: "Fastest Lap", value: "1:32.456", note: "Lighter chassis advantage" },
      { label: "MGU-K Regen", "value": "350kW Peak", note: "Incredible braking efficiency" },
      { label: "Gap to P2", value: "+4.215s", note: "Flawless cruising pace" } 
    ]
  };
}

export default async function Home() {
  const report = await getRaceReport();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-20 scroll-smooth font-sans">
      
      {/* Navigation */}
      <nav className="border-b border-blue-900/50 bg-blue-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-black text-2xl italic tracking-tighter">MAX<span className="text-white">33</span></span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-bold text-sm">
            <a href="#ai-report" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Zap size={14} className="text-yellow-400"/> AI Analysis
            </a>
            <a href="#paddock-feed" className="text-gray-300 hover:text-white transition flex items-center gap-1 relative">
              <MessageSquare size={14} className="text-blue-400"/> Feed
              <span className="absolute -top-1 -right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </a>
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            By Jason Lam
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 bg-slate-900 border border-blue-900/50 flex flex-col md:flex-row pb-12 md:pb-0 mb-16">
          <div className="p-10 md:w-1/2 z-10 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-wide">
              Growing Up With <br/><span className="text-red-600">Super Max</span>
            </h1>
            <p className="text-gray-300 leading-relaxed mb-6 text-lg">
              Hi, I'm Jason Lam. From the karting miracles to the F1 World Championships, Max Verstappen's fearless driving style has always inspired me. This is my dedicated 2026 Tech & Race Hub to witness the next era of dominance.
            </p>
            <div className="flex gap-4">
              <span className="px-5 py-2 bg-red-600/20 text-red-500 font-bold rounded border border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">Simply Lovely.</span>
            </div>
          </div>
          <div className="relative md:w-1/2 h-72 md:h-auto">
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1000&auto=format&fit=crop" alt="F1 Racing" className="object-cover w-full h-full opacity-60 grayscale-[20%]" />
          </div>
        </section>

        {/* 🌟 Layout Switch: 2 Columns for Content / 1 Column for Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content (Left, 2/3 width) */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* AI Report */}
            <section id="ai-report" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-yellow-400 pl-4 mb-6">
                <Trophy className="text-yellow-400" size={28} />
                <h2 className="text-3xl font-bold text-white">Race Intelligence</h2>
                <span className="bg-blue-950 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-blue-300 border border-blue-800 ml-auto flex items-center gap-1">
                  <Zap size={12} className="text-yellow-400 animate-pulse"/> Auto
                </span>
              </div>
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{report.raceName}</h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-8 bg-slate-950 p-6 rounded-xl border border-slate-800 relative z-10">{report.aiSummary}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {report.highlights.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-red-600/50 transition duration-300">
                      <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                      <div className="text-xl font-bold text-yellow-400 mb-2">{item.value}</div>
                      <div className="text-xs text-gray-400">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Comment Board (Feed) */}
            <section id="paddock-feed" className="scroll-mt-24">
               <CommentBoard />
            </section>

          </div>

          {/* Sidebar (Right, 1/3 width) */}
          <div className="lg:col-span-1 space-y-10">
            
            {/* Voice of the Day Component */}
            <section>
              <VoiceOfDay />
            </section>

            {/* Tech Rules Mini-Cards */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-slate-600 pl-3 mb-4">
                <h2 className="text-xl font-bold text-white">2026 Tech Specs</h2>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800">
                <Cpu className="text-red-500 mb-3" size={24} />
                <h3 className="font-bold text-white mb-2">50/50 Hybrid Power</h3>
                <p className="text-gray-400 text-xs leading-relaxed">MGU-H removed. MGU-K battery deployment increased to 350kW, creating a near 1:1 ratio with the ICE.</p>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800">
                <ShieldAlert className="text-blue-500 mb-3" size={24} />
                <h3 className="font-bold text-white mb-2">Active Aerodynamics</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Replacing DRS, cars now feature X-Mode (Low Drag) on straights and Z-Mode (High Downforce) in corners.</p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}