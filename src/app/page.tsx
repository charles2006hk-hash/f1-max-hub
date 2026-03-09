import { Trophy, Zap, MessageSquare, Calendar, Flag, Radio, Video } from 'lucide-react';
import CommentBoard from '@/components/CommentBoard';
import VoiceOfDay from '@/components/VoiceOfDay';
import HeroBanner from '@/components/HeroBanner';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const revalidate = 3600;

// 🏎️ 抓取真實 F1 數據 (使用開源的 Jolpica API)
async function getRealF1Data() {
  try {
    const [standingsRes, scheduleRes] = await Promise.all([
      fetch('https://api.jolpica.com/f1/current/driverStandings.json', { next: { revalidate: 3600 } }),
      fetch('https://api.jolpica.com/f1/current.json', { next: { revalidate: 3600 } })
    ]);
    const standingsData = await standingsRes.json();
    const scheduleData = await scheduleRes.json();
    
    // 取前 5 名車手
    const standings = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 5);
    // 取接下來的 3 場比賽
    const now = new Date();
    const upcomingRaces = scheduleData.MRData.RaceTable.Races.filter((r: any) => new Date(r.date) >= now).slice(0, 3);
    
    return { standings, upcomingRaces };
  } catch (error) {
    console.error("F1 API Failed", error);
    return { standings: [], upcomingRaces: [] }; // 失敗時回傳空陣列防呆
  }
}

// 📺 從 Firebase 讀取你後台發佈的內容
async function getCmsData() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "home_config"));
    if (docSnap.exists()) return docSnap.data();
  } catch (e) {}
  return {
    newsHeadline: "Waiting for Admin Update...", newsContent: "", newsVideoUrl: "", newsVideoPrompt: "",
    techHeadline: "Waiting for Admin Update...", techContent: "", techVideoUrl: "", techVideoPrompt: ""
  };
}

export default async function Home() {
  const f1Data = await getRealF1Data();
  const cmsData = await getCmsData();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-20 scroll-smooth font-sans">
      <nav className="border-b border-blue-900/50 bg-blue-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3"><span className="text-yellow-400 font-black text-2xl italic tracking-tighter">MAX<span className="text-white">33</span></span></div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Admin: Jason</div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-12">
        <HeroBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 左側主內容區 (2/3) */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* 🎥 每日新聞廣播 (由後台控制) */}
            <section id="ai-news" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-6">
                <Radio className="text-red-600" size={28} />
                <h2 className="text-3xl font-bold text-white">Daily AI Broadcast</h2>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-1 shadow-xl overflow-hidden group">
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex items-center justify-center">
                  {cmsData.newsVideoUrl ? (
                    <video src={cmsData.newsVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
                  ) : (
                    <span className="text-slate-600">No Video Provided</span>
                  )}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 max-w-[80%]">
                    <p className="text-[10px] text-red-500 font-bold uppercase mb-1">AI Video Synth</p>
                    <p className="text-xs text-gray-300 font-mono truncate">Prompt: {cmsData.newsVideoPrompt}</p>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{cmsData.newsHeadline}</h3>
                  <p className="text-gray-400 text-lg">{cmsData.newsContent}</p>
                </div>
              </div>
            </section>

            {/* 🎥 技術分析區 (由後台控制) */}
            <section id="ai-tech" className="scroll-mt-24">
              <div className="flex items-center gap-3 border-l-4 border-yellow-400 pl-4 mb-6">
                <Trophy className="text-yellow-400" size={28} />
                <h2 className="text-3xl font-bold text-white">Tech Intelligence</h2>
              </div>
              <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden border-b border-slate-800 flex items-center justify-center">
                  {cmsData.techVideoUrl ? (
                    <video src={cmsData.techVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
                  ) : (
                    <span className="text-slate-600">No Video Provided</span>
                  )}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 max-w-[80%]">
                    <p className="text-[10px] text-yellow-400 font-bold uppercase mb-1">Tech Render Engine</p>
                    <p className="text-xs text-gray-300 font-mono truncate">Prompt: {cmsData.techVideoPrompt}</p>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{cmsData.techHeadline}</h3>
                  <p className="text-gray-300 text-lg">{cmsData.techContent}</p>
                </div>
              </div>
            </section>

            <section id="paddock-feed"><CommentBoard /></section>
          </div>

          {/* 右側資訊區 (1/3) - 真實動態數據 */}
          <div className="lg:col-span-1 space-y-10">
            <section><VoiceOfDay /></section>

            {/* 🏎️ 真實積分榜 */}
            <section id="standings" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="font-bold text-white flex items-center gap-2"><Flag size={18} className="text-blue-500"/> Real-time Standings</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-900 border-b border-slate-800">
                  <tr><th className="px-4 py-3">Pos</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3 text-right">PTS</th></tr>
                </thead>
                <tbody>
                  {f1Data.standings.length > 0 ? f1Data.standings.map((driver: any) => (
                    <tr key={driver.position} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-bold text-slate-400">{driver.position}</td>
                      <td className="px-4 py-3 text-white font-bold">{driver.Driver.code || driver.Driver.familyName} <span className="text-slate-500 text-[10px] uppercase ml-1">{driver.Constructors[0]?.name}</span></td>
                      <td className="px-4 py-3 font-bold text-yellow-400 text-right">{driver.points}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="p-4 text-center text-slate-500">Awaiting official data...</td></tr>}
                </tbody>
              </table>
            </section>

            {/* 📅 真實賽程表 */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Calendar size={18} className="text-red-500"/> Upcoming Races</h3>
              <div className="space-y-4">
                {f1Data.upcomingRaces.length > 0 ? f1Data.upcomingRaces.map((race: any, i: number) => {
                  const date = new Date(race.date);
                  return (
                    <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-800 last:border-0">
                      <div>
                        <div className="text-xs text-red-500 font-bold mb-1 uppercase">{date.toLocaleString('en-US', { month: 'short', day: '2-digit' })}</div>
                        <div className="text-sm font-bold text-white">{race.raceName}</div>
                      </div>
                      <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{race.Circuit.Location.country}</div>
                    </div>
                  );
                }) : <div className="text-slate-500 text-sm">Awaiting official schedule...</div>}
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
