import { Trophy, Zap, MessageSquare, Calendar, Flag, PlayCircle, Newspaper } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';

export const revalidate = 3600;

// ... (getRaceReport 函數保持你原本的 AI 邏輯，文字可自行改為英文，這裡省略以節省版面，請保留你原有的 getRaceReport 函數) ...
async function getRaceReport() {
  // 為了排版簡潔，我這裡直接回傳英文格式，如果你原本的 AI 邏輯還在，請保留你的 try-catch 結構。
  return {
    raceName: "2026 Bahrain Grand Prix (AI Generated)",
    date: "2026-03-08",
    aiSummary: "Max Verstappen showcased absolute mastery of the new 50/50 hybrid system. By perfectly balancing MGU-K deployment and utilizing the X-Mode active aero on the straights, he secured a dominant victory in the season opener.",
    highlights: [
      { label: "Fastest Lap", value: "1:32.456", note: "Lighter chassis advantage" },
      { label: "MGU-K Regen", value: "350kW Peak", note: "Incredible braking efficiency" },
      { label: "Gap to P2", value: "+4.215s", note: "Flawless cruising pace" } 
    ]
  };
}

export default async function Home() {
  const report = await getRaceReport();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-20 scroll-smooth font-sans">
      
      {/* 導航列 */}
      <nav className="border-b border-blue-900/50 bg-blue-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-black text-2xl italic tracking-tighter">MAX<span className="text-white">33</span></span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-bold text-sm">
            <a href="#news" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Newspaper size={14}/> News</a>
            <a href="#standings" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Flag size={14}/> Standings</a>
            <a href="#paddock-feed" className="text-gray-300 hover:text-white transition flex items-center gap-1 relative">
              <MessageSquare size={14} className="text-blue-400"/> Feed
              <span className="absolute -top-1 -right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </a>
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Admin: Jason</div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-12">
        
        {/* 導入智慧縮放的 Hero Banner */}
        <HeroBanner />

        {/* 兩欄式佈局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 左側主內容區 (2/3) */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* 🔥 新增：最新消息與影片區塊 */}
            <section id="news" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-6">
                <Newspaper className="text-red-600" size={28} />
                <h2 className="text-3xl font-bold text-white">Latest Intelligence</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 影片卡片 (嵌入 YouTube) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-blue-500 transition group">
                  <div className="relative aspect-video bg-black">
                    {/* 這裡替換成真實的 YouTube Embed 連結 */}
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/S2gP22wY19c?si=R9T1N-n4q9C" title="2026 F1 Rules Explained" allowFullScreen></iframe>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Video Explainer</span>
                    <h3 className="text-lg font-bold text-white mb-2">How 2026 Rules Favour Red Bull</h3>
                    <p className="text-sm text-gray-400">Deep dive into the active aero systems and why Adrian Newey's foundation still dominates.</p>
                  </div>
                </div>
                {/* 圖文新聞卡片 */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-blue-500 transition group">
                  <div className="h-40 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1532560383141-80a568c0b5de?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Engine" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">Tech Update</span>
                    <h3 className="text-lg font-bold text-white mb-2">Ford Powertrain hits 350kW Target</h3>
                    <p className="text-sm text-gray-400">Christian Horner confirms dyno testing exceeds expectations ahead of the Bahrain test.</p>
                  </div>
                </div>
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

            {/* 留言板 */}
            <section id="paddock-feed" className="scroll-mt-24">
               <CommentBoard />
            </section>

          </div>

          {/* 右側資訊區 (1/3) */}
          <div className="lg:col-span-1 space-y-10">
            
            {/* 今日之聲 */}
            <section>
              <VoiceOfDay />
            </section>

            {/* 🔥 新增：積分榜 (Standings) */}
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
                    <tr className="border-b border-slate-800">
                      <td className="px-4 py-3 text-slate-400">2</td>
                      <td className="px-4 py-3 text-slate-300">LEC <span className="text-slate-500 text-xs">FER</span></td>
                      <td className="px-4 py-3 text-slate-300 text-right">18</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="px-4 py-3 text-slate-400">3</td>
                      <td className="px-4 py-3 text-slate-300">NOR <span className="text-slate-500 text-xs">MCL</span></td>
                      <td className="px-4 py-3 text-slate-300 text-right">15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 🔥 新增：賽程表 (Calendar) */}
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
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-xs text-slate-500 font-bold mb-1">APR 03-05</div>
                    <div className="text-sm font-bold text-slate-300">Australian GP</div>
                  </div>
                  <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Melbourne</div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}