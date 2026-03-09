import { Trophy, Zap, MessageSquare, Flag, Radio, Star, Home as HomeIcon, TrendingUp, Camera } from 'lucide-react';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';
import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, limit } from "firebase/firestore";

// 🔥 確保後台發佈後秒更新
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

// 🔥 新增：抓取 The Vault 中已批准的最新 10 張照片，用來做首頁膠卷
async function getVaultPhotos() {
  try {
    const q = query(collection(db, "max_gallery"), where("status", "==", "approved"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data().imageUrl);
  } catch (e) { return []; }
}

export default async function Home() {
  const cmsData = await getCmsData();
  const vaultPhotos = await getVaultPhotos();
  
  // 安全地解析從後台傳過來的 JSON 數據
  let standings = [];
  let races = [];
  try {
    standings = JSON.parse(cmsData.standingsData || "[]");
    races = JSON.parse(cmsData.racesData || "[]");
    
    if (standings.length === 0) {
      standings = [
        { pos: 1, driver: "VER", team: "Red Bull", pts: 26, trend: "up" },
        { pos: 2, "driver": "LEC", "team": "Ferrari", "pts": 18, "trend": "same" }
      ];
      races = [{ date: "MAR 22", name: "Saudi Arabian GP", status: "UPCOMING" }];
    }
  } catch (e) { console.error("Failed to parse F1 data JSON"); }

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-orange-500 selection:text-white pb-24 md:pb-20 scroll-smooth font-sans relative overflow-hidden">
      
      {/* 🔥 Max 專屬靈魂：超大霸氣背景浮水印 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-white/[0.02] italic pointer-events-none select-none z-0 whitespace-nowrap">
        MV33
      </div>

      {/* 導航列 */}
      <nav className="border-b border-blue-900/50 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center max-w-7xl relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-orange-500 font-black text-xl md:text-2xl italic tracking-tighter">MAX<span className="text-white">33</span> Hub</span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-bold text-sm">
            <a href="/legacy" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Zap size={14} className="text-yellow-400 animate-pulse"/> Legacy</a>
            <a href="/gallery" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Camera size={14} className="text-orange-500"/> Vault</a>
            <a href="#paddock-feed" className="text-gray-300 hover:text-white transition flex items-center gap-1 relative">
              <MessageSquare size={14} className="text-blue-400"/> Paddock Feed
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl space-y-8 md:space-y-12 relative z-10">
        <HeroBanner />

        {/* Max's Legacy 探索卡片 */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 shadow-xl hover:border-orange-500/30 transition group">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 rounded-full bg-orange-500/10 border-2 border-orange-500/20 shrink-0 group-hover:scale-110 transition-transform"><Star size={24} className="text-orange-500"/></div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-white mb-1">Max Verstappen's Legacy</h2>
              <p className="text-gray-400 text-xs md:text-sm">From karting miracles to World Champion status.</p>
            </div>
          </div>
          <a href="/legacy" className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 md:py-2 rounded-full text-sm font-bold active:scale-95 transition w-full md:w-auto text-center mt-2 md:mt-0 shadow-lg shadow-orange-900/20">Explore History</a>
        </section>

        {/* 🔥 全新：無縫水平滾動相片膠卷 (The Vault Filmstrip) */}
        {vaultPhotos.length > 0 && (
          <section className="overflow-hidden relative w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-3 group">
            <div className="absolute top-3 left-4 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-orange-500/30 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] text-orange-400 font-bold uppercase">The Vault</span>
            </div>
            <div className="flex w-max animate-marquee-x hover:[animation-play-state:paused] gap-3">
              {[...vaultPhotos, ...vaultPhotos].map((photo, i) => (
                <a href="/gallery" key={i} className="relative w-40 h-28 md:w-56 md:h-36 shrink-0 rounded-lg overflow-hidden border border-slate-800 hover:border-orange-500 transition-colors cursor-pointer block">
                  <img src={photo} alt="vault preview" className="w-full h-full object-cover opacity-70 hover:opacity-100 hover:scale-110 transition duration-500" />
                </a>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-12 md:w-20 h-full bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-12 md:w-20 h-full bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
          </section>
        )}

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
        <a href="#" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"><HomeIcon size={20} /><span className="text-[10px] font-bold">Home</span></a>
        <a href="#standings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"><Flag size={20} /><span className="text-[10px] font-bold">Data</span></a>
        <a href="#paddock-feed" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition relative"><MessageSquare size={20} /><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span><span className="text-[10px] font-bold">Feed</span></a>
        <a href="/legacy" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"><Zap size={20}/><span className="text-[10px] font-bold">Legacy</span></a>
        <a href="/gallery" className="flex flex-col items-center gap-1 text-orange-500 transition"><Camera size={20}/><span className="text-[10px] font-bold">Vault</span></a>
      </div>
      {/* 🔥 在這裡插入「雷射刻蝕感」Footer */}
      <footer className="py-20 bg-slate-950 flex justify-center border-t border-slate-900/50">
        <div className="relative px-8 py-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-slate-800 shadow-2xl overflow-hidden group max-w-lg w-full mx-4">
          
          {/* 金屬髮絲紋背景效果 (透過 CSS 模擬) */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-2">
            {/* 主版權文字：雷射刻蝕感 */}
            <h3 className="etched-text text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-center">
              © 2026 MAX33 HUB <span className="mx-2 text-slate-800">|</span> ALL SYSTEMS GO
            </h3>
            
            {/* 你的專屬簽名：橙色電鍍刻蝕 */}
            <div className="flex items-center gap-3 mt-3">
              <div className="h-[1px] w-6 md:w-10 bg-slate-800"></div>
              <p className="etched-orange text-[9px] md:text-[11px] font-bold italic tracking-[0.3em] whitespace-nowrap">
                DESIGNED & DRIVEN BY JASON
              </p>
              <div className="h-[1px] w-6 md:w-10 bg-slate-800"></div>
            </div>

            {/* 底部微小編號：像零件序號一樣 */}
            <span className="text-[7px] text-slate-700 font-mono mt-4 opacity-40 group-hover:opacity-100 transition duration-500">
              SERIAL NO. MV33-2026-HKG-001 <span className="ml-2">|</span> VER: 2.5.0-FLASH
            </span>
          </div>

          {/* 四個角落的「鉚釘」裝飾 */}
          <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-slate-800 shadow-inner"></div>
          <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-slate-800 shadow-inner"></div>
          <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-slate-800 shadow-inner"></div>
          <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-slate-800 shadow-inner"></div>
        </div>
      </footer>

      {/* 手機版底部導航欄 (原本就在這裡) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 ...">
        {/* ... */}
      </div>
    </main>
  );
}
