import { Trophy, Zap, MessageSquare, Flag, Radio, Star, Home as HomeIcon, TrendingUp } from 'lucide-react';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 🔥 關鍵修正 1：設定為 0，確保你後台一按發佈，首頁立刻秒更新！
export const revalidate = 0;

async function getCmsData() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "home_config"));
    if (docSnap.exists()) return docSnap.data();
  } catch (e) {}
  return { 
    newsHeadline: "Awaiting Live Signal...", newsContent: "Connecting to the paddock...", 
    techHeadline: "Awaiting Live Signal...", techContent: "Connecting...",
    standingsData: "[]", racesData: "[]"
  };
}

export default async function Home() {
  const cmsData = await getCmsData();
  
  // 🔥 關鍵修正 2：安全地解析你從後台傳過來的 JSON 數據
  let standings = [];
  let races = [];
  try {
    standings = JSON.parse(cmsData.standingsData || "[]");
    races = JSON.parse(cmsData.racesData || "[]");
    
    // 防呆機制：如果你後台還沒存過資料，先給一組預設展示資料
    if (standings.length === 0) {
      standings = [
        { pos: 1, driver: "VER", team: "Red Bull", pts: 26, trend: "up" },
        { pos: 2, "driver": "LEC", "team": "Ferrari", "pts": 18, "trend": "same" }
      ];
      races = [
        { date: "MAR 22", name: "Saudi Arabian GP", status: "UPCOMING" }
      ];
    }
  } catch (e) {
    console.error("Failed to parse F1 data JSON from CMS");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-24 md:pb-20 scroll-smooth font-sans">
      
      {/* 導航列 */}
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

        {/* Max's Legacy 探索卡片 */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 shadow-xl hover:border-yellow-600/50 transition">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 rounded-full bg-yellow-400/10 border-2 border-yellow-400/20 shrink-0"><Star size={24} className="text-yellow-400"/></div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-white mb-1">Max Verstappen's Legacy</h2>
              <p className="text-gray-400 text-xs md:text-sm">From karting miracles to World Champion status.</p>
            </div>
          </div>
          <a href="/legacy" className="bg-yellow-400 text-slate-950 px-6 py-3 md:py-2 rounded-full text-sm font-bold active:scale-95 transition w-full md:w-auto text-center mt-2 md:mt-0">Explore Now</a>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            <section id="ai-news" className="scroll-mt-24">
              <div className="flex items-center gap-2 md:gap-3 border-l-4 border-red-600 pl-3 md:pl-4 mb-4 md:mb-6"><Radio className="text-red-600" size={24} /> <h2 className="text-2xl md:text-3xl font-bold text-white">Daily Broadcast</h2></div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-1 shadow-xl overflow-hidden group hover:border-red-900/50 transition duration-500">
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex items-center justify-center">
                  {cmsData.newsVideoUrl ? (
                    <video src={cmsData.newsVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
                  ) : (<span className="text-slate-600 text-sm">Signal Lost</span>)}
                  <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-700/50 max-w-[85%]">
                    <p className="text-[9px] text-red-500 font-bold uppercase mb-0.5">AI Video Synth</p>
                    <p className="text-[10px] text-gray-300 font-mono truncate">Prompt: {cmsData.newsVideoPrompt}</p>
                  </div>
                </div>
                <div className="p-5 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{cmsData.newsHeadline}</h3>
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed">{cmsData.newsContent}</p>
                </div>
              </div>
            </section>
            
            <section id="ai-tech" className="scroll-mt-24">
              <div className="flex items-center gap-2 md:gap-3 border-l-4 border-yellow-400 pl-3 md:pl-4 mb-4 md:mb-6"><Trophy className="text-yellow-400" size={24} /> <h2 className="text-2xl md:text-3xl font-bold text-white">Tech Intel</h2></div>
              <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex items-center justify-center">
                  {cmsData.techVideoUrl ? (
                    <video src={cmsData.techVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
                  ) : (<span className="text-slate-600 text-sm">No Video Provided</span>)}
                  <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-700/50 max-w-[85%]">
                    <p className="text-[9px] text-yellow-400 font-bold uppercase mb-0.5">Tech Render Engine</p>
                    <p className="text-[10px] text-gray-300 font-mono truncate">Prompt: {cmsData.techVideoPrompt}</p>
                  </div>
                </div>
                <div className="p-5 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{cmsData.techHeadline}</h3>
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed">{cmsData.techContent}</p>
                </div>
              </div>
            </section>

            <section id="paddock-feed" className="scroll-mt-24"><CommentBoard /></section>
          </div>

          <div className="lg:col-span-1 space-y-8 md:space-y-10">
            <section><VoiceOfDay /></section>
            
            {/* 🔥 資訊屏現在完全吃後台的 standings 和 races 變數！ */}
            <section id="standings" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 flex flex-col h-[500px]">
              <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-10 relative shadow-md">
                <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm md:text-base">
                  <TrendingUp size={18} className="text-red-500 animate-pulse"/> Live Data Center
                </h3>
                <span className="text-[10px] bg-red-600/20 text-red-500 px-2 py-1 rounded border border-red-600/50 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> SYSTEM OK
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden relative bg-slate-950/50 group">
                <div className="absolute w-full animate-marquee hover:[animation-play-state:paused] flex flex-col">
                  
                  {/* 第一塊：從 Firebase 讀取的積分榜 */}
                  <div className="p-4 space-y-2 mb-8">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Driver Standings</div>
                    {standings.map((driver: any, i: number) => (
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

                  {/* 第二塊：從 Firebase 讀取的賽程表 */}
                  <div className="p-4 space-y-2 mb-8 border-t border-slate-800/50 pt-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Race Calendar</div>
                    {races.map((race: any, i: number) => (
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
                  
                  <div className="p-4 space-y-2 border-t border-slate-800/50 pt-6">
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 text-center">-- END OF SYNC --</div>
                  </div>

                </div>
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
