import { Trophy, Zap, MessageSquare, Calendar, Flag, Radio, Star, Home } from 'lucide-react';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const revalidate = 0;

async function getRealF1Data() {
  let standings = [];
  let upcomingRaces = [];
  try {
    const standingsRes = await fetch('https://api.jolpica.com/f1/2024/driverStandings.json', { cache: 'no-store' });
    const standingsData = await standingsRes.json();
    const lists = standingsData.MRData?.StandingsTable?.StandingsLists;
    if (lists && lists.length > 0) standings = lists[0].DriverStandings.slice(0, 5);
  } catch (error) {}

  try {
    const scheduleRes = await fetch('https://api.jolpica.com/f1/2024.json', { cache: 'no-store' });
    const scheduleData = await scheduleRes.json();
    let races = scheduleData.MRData?.RaceTable?.Races;
    if (races && races.length > 0) {
      upcomingRaces = races.slice(-3);
    }
  } catch (error) {}
  return { standings, upcomingRaces };
}

async function getCmsData() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "home_config"));
    if (docSnap.exists()) return docSnap.data();
  } catch (e) {}
  return { newsHeadline: "Waiting...", newsContent: "", techHeadline: "Waiting...", techContent: "" };
}

export default async function Home() {
  const f1Data = await getRealF1Data();
  const cmsData = await getCmsData();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-24 md:pb-20 scroll-smooth font-sans">
      
      {/* 桌面版/通用 頂部導航列 */}
      <nav className="border-b border-blue-900/50 bg-blue-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-black text-xl md:text-2xl italic tracking-tighter">MAX<span className="text-white">33</span> Hub</span>
          </div>
          {/* 電腦版選單 (手機版隱藏) */}
          <div className="hidden md:flex gap-8 items-center font-bold text-sm">
            <a href="/legacy" className="text-gray-300 hover:text-white transition flex items-center gap-1"><Zap size={14} className="text-yellow-400 animate-pulse"/> Legacy of Max</a>
            <a href="#paddock-feed" className="text-gray-300 hover:text-white transition flex items-center gap-1 relative">
              <MessageSquare size={14} className="text-blue-400"/> Paddock Feed
              <span className="absolute -top-1 -right-2 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
            </a>
          </div>
        </div>
      </nav>

      {/* 內容區塊：手機版 px-4, 電腦版 px-6 */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl space-y-8 md:space-y-12">
        <HeroBanner />

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
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-5 md:p-8"><h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{cmsData.newsHeadline}</h3><p className="text-gray-400 text-base md:text-lg leading-relaxed">{cmsData.newsContent}</p></div>
            </section>
            
            <section id="ai-tech" className="scroll-mt-24">
              <div className="flex items-center gap-2 md:gap-3 border-l-4 border-yellow-400 pl-3 md:pl-4 mb-4 md:mb-6"><Trophy className="text-yellow-400" size={24} /> <h2 className="text-2xl md:text-3xl font-bold text-white">Tech Intel</h2></div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-5 md:p-8"><h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{cmsData.techHeadline}</h3><p className="text-gray-400 text-base md:text-lg leading-relaxed">{cmsData.techContent}</p></div>
            </section>

            <section id="paddock-feed" className="scroll-mt-24"><CommentBoard /></section>
          </div>

          <div className="lg:col-span-1 space-y-8 md:space-y-10">
            <section><VoiceOfDay /></section>
            
            <section id="standings" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"><div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950"><h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base"><Flag size={18} className="text-blue-500"/> Real-time Standings</h3></div><table className="w-full text-xs md:text-sm text-left"><thead className="text-slate-500 bg-slate-900 border-b border-slate-800"><tr><th className="px-3 md:px-4 py-3">Pos</th><th className="px-3 md:px-4 py-3">Driver</th><th className="px-3 md:px-4 py-3 text-right">PTS</th></tr></thead><tbody>{f1Data.standings.map((driver: any) => (<tr key={driver.position} className="border-b border-slate-800/50"><td className="px-3 md:px-4 py-3 font-bold text-slate-400">{driver.position}</td><td className="px-3 md:px-4 py-3 text-white font-bold">{driver.Driver.code || driver.Driver.familyName} <span className="text-slate-500 text-[10px] ml-1 block md:inline">{driver.Constructors[0]?.name}</span></td><td className="px-3 md:px-4 py-3 font-bold text-yellow-400 text-right">{driver.points}</td></tr>))}</tbody></table></section>
            
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-4 md:p-5"><h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm md:text-base"><Calendar size={18} className="text-red-500"/> Upcoming Races</h3><div className="space-y-4">{f1Data.upcomingRaces.map((race: any, i: number) => { return (<div key={i} className="flex justify-between items-center pb-3 border-b border-slate-800 last:border-0 last:pb-0"><div className="text-xs md:text-sm font-bold text-white">{race.raceName}</div><div className="text-[10px] md:text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{race.Circuit.Location.country}</div></div>); })}</div></section>
          </div>
        </div>
      </div>

      {/* 🔥 iPhone 專屬底部導航列 (iOS Bottom Tab Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 z-50 px-6 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)] flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <a href="#" className="flex flex-col items-center gap-1 text-blue-400">
          <Home size={22} />
          <span className="text-[10px] font-bold">Home</span>
        </a>
        <a href="#standings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition">
          <Flag size={22} />
          <span className="text-[10px] font-bold">Standings</span>
        </a>
        <a href="#paddock-feed" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition relative">
          <MessageSquare size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
          <span className="text-[10px] font-bold">Feed</span>
        </a>
        <a href="/legacy" className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition">
          <Zap size={22} className="text-yellow-500"/>
          <span className="text-[10px] font-bold">Legacy</span>
        </a>
      </div>
    </main>
  );
}
