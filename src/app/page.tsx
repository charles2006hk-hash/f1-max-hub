import { Trophy, Zap, MessageSquare, Calendar, Flag, Radio, Star, Home as HomeIcon, TrendingUp } from 'lucide-react';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const revalidate = 0;

// 🏎️ 既然外部 API 無法給我們未來的數據，我們直接用超逼真的模擬資料來打造專業的「資訊跑馬燈」！
const simulated2026Standings = [
  { pos: 1, driver: "VER", team: "Red Bull", pts: 78, trend: "up" },
  { pos: 2, driver: "LEC", team: "Ferrari", pts: 62, trend: "same" },
  { pos: 3, driver: "NOR", team: "McLaren", pts: 55, trend: "up" },
  { pos: 4, driver: "HAM", team: "Ferrari", pts: 48, trend: "down" },
  { pos: 5, driver: "PIA", team: "McLaren", pts: 36, trend: "same" },
  { pos: 6, driver: "RUS", team: "Mercedes", pts: 30, trend: "down" },
  { pos: 7, driver: "ALB", team: "Williams", pts: 18, trend: "up" },
  { pos: 8, driver: "ALO", team: "Aston Martin", pts: 15, trend: "down" },
];

const simulated2026Races = [
  { date: "MAR 08", name: "Bahrain GP", status: "VER WON" },
  { date: "MAR 22", name: "Saudi Arabian GP", status: "VER WON" },
  { date: "APR 05", name: "Australian GP", status: "VER WON" },
  { date: "APR 19", name: "Japanese GP", status: "UPCOMING" },
  { date: "MAY 03", name: "Miami GP", status: "UPCOMING" },
];

async function getCmsData() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "home_config"));
    if (docSnap.exists()) return docSnap.data();
  } catch (e) {}
  return { newsHeadline: "Awaiting Live Signal...", newsContent: "Connecting to the paddock...", techHeadline: "Awaiting Live Signal...", techContent: "Connecting..." };
}

export default async function Home() {
  const cmsData = await getCmsData();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-24 md:pb-20 scroll-smooth font-sans">
      
      <nav className="border-b border-blue-900/50 bg-blue-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-black text-xl md:text-2xl italic tracking-tighter">MAX<span className="text-white">33</span> Hub</span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-bold text-sm">
            <a href="/legacy" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Zap size={14} className="text-yellow-400 animate-pulse"/> Legacy of Max</a>
            <a href="#paddock-feed" className="text-gray-300 hover:text-white transition flex items-center gap-1 relative">
              <MessageSquare size={14} className="text-blue-400"/> Paddock Feed
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl space-y-8 md:space-y-12">
        <HeroBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            <section id="ai-news" className="scroll-mt-24">
              <div className="flex items-center gap-2 md:gap-3 border-l-4 border-red-600 pl-3 md:pl-4 mb-4 md:mb-6"><Radio className="text-red-600" size={24} /> <h2 className="text-2xl md:text-3xl font-bold text-white">Daily Broadcast</h2></div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-1 shadow-xl overflow-hidden group">
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex items-center justify-center">
                  {cmsData.newsVideoUrl ? (
                    <video src={cmsData.newsVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
                  ) : (<span className="text-slate-600 text-sm">Signal Lost</span>)}
                </div>
                <div className="p-5 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{cmsData.newsHeadline}</h3>
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed">{cmsData.newsContent}</p>
                </div>
              </div>
            </section>
            
            <section id="ai-tech" className="scroll-mt-24">
              <div className="flex items-center gap-2 md:gap-3 border-l-4 border-yellow-400 pl-3 md:pl-4 mb-4 md:mb-6"><Trophy className="text-yellow-400" size={24} /> <h2 className="text-2xl md:text-3xl font-bold text-white">Tech Intel</h2></div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-5 md:p-8"><h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{cmsData.techHeadline}</h3><p className="text-gray-400 text-base md:text-lg leading-relaxed">{cmsData.techContent}</p></div>
            </section>

            <section id="paddock-feed" className="scroll-mt-24"><CommentBoard /></section>
          </div>

          <div className="lg:col-span-1 space-y-8 md:space-y-10">
            <section><VoiceOfDay /></section>
            
            {/* 🔥 全新：動態滾動的 LIVE Data Center */}
            <section id="standings" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 flex flex-col h-[500px]">
              {/* 資訊屏標頭 */}
              <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-10 relative shadow-md">
                <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm md:text-base">
                  <TrendingUp size={18} className="text-red-500 animate-pulse"/> Live Data Center
                </h3>
                <span className="text-[10px] bg-red-600/20 text-red-500 px-2 py-1 rounded border border-red-600/50 font-mono">2026 SEASON</span>
              </div>
              
              {/* 📺 跳動資訊屏主體 (利用 CSS hover 暫停滾動) */}
              <div className="flex-1 overflow-hidden relative bg-slate-950/50 group">
                <div className="absolute w-full animate-marquee hover:[animation-play-state:paused] flex flex-col">
                  
                  {/* 第一塊：積分榜 */}
                  <div className="p-4 space-y-2 mb-8">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Driver Standings</div>
                    {simulated2026Standings.map((driver, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-900/80 p-3 rounded-lg border border-slate-800 hover:border-blue-500/50 transition">
                        <div className="flex items-center gap-3">
                          <span className={`font-black w-5 text-center ${i === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>{driver.pos}</span>
                          <div>
                            <div className="font-bold text-white text-sm">{driver.driver}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{driver.team}</div>
                          </div>
                        </div>
                        <div className="font-black text-blue-400">{driver.pts} <span className="text-[10px] text-slate-600 font-normal">PTS</span></div>
                      </div>
                    ))}
                  </div>

                  {/* 第二塊：賽程進度 */}
                  <div className="p-4 space-y-2 mb-8 border-t border-slate-800/50 pt-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Race Calendar</div>
                    {simulated2026Races.map((race, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border-l-2 border-slate-800 pl-4 relative">
                        <div className={`absolute -left-[5px] w-2 h-2 rounded-full ${race.status.includes('WON') ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-700'}`}></div>
                        <div>
                          <div className="text-[10px] text-red-500 font-bold">{race.date}</div>
                          <div className="text-sm font-bold text-slate-300">{race.name}</div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded ${race.status.includes('WON') ? 'bg-yellow-400/10 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                          {race.status}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 重複第一塊以實現無縫輪播 */}
                  <div className="p-4 space-y-2 border-t border-slate-800/50 pt-6">
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 text-center">-- END OF DATA --</div>
                  </div>

                </div>
                {/* 漸層遮罩讓滾動看起來更自然 */}
                <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 z-50 px-6 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)] flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <a href="#" className="flex flex-col items-center gap-1 text-blue-400"><HomeIcon size={22} /><span className="text-[10px] font-bold">Home</span></a>
        <a href="#standings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"><Flag size={22} /><span className="text-[10px] font-bold">Data</span></a>
        <a href="#paddock-feed" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition relative"><MessageSquare size={22} /><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span><span className="text-[10px] font-bold">Feed</span></a>
        <a href="/legacy" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"><Zap size={22} className="text-yellow-500"/><span className="text-[10px] font-bold">Legacy</span></a>
      </div>
    </main>
  );
}
