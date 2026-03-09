import { ArrowLeft, Flag, Zap, Award, Karting, User } from 'lucide-react';

export default function MaxLegacyPage() {
  
  const timelineEvents = [
    { year: "1997", icon: <User />, title: "The Birth of a Racer", desc: "Born in Hasselt, Belgium, to racer Jos Verstappen and karting ace Sophie Kumpen. Gravity never stood a chance." },
    { year: "2003-2013", icon: <Karting size={20}/>, title: "Karting Miracles", desc: "From Minimax to KZ2, Max dominated karting globally, winning nearly every championship he entered with blistering speed and relentless racecraft." },
    { year: "2015", icon: <Zap />, title: " youngest F1 Driver", desc: "Debuted for Scuderia Toro Rosso at just 17, scoring points at the Malaysian GP. The world knew a star was here." },
    { year: "2016", icon: <Flag />, title: "First Win: Spain", desc: "Promoted to Red Bull Racing. Won on debut at the Spanish GP, becoming the youngest winner in F1 history." },
    { year: "2021", icon: <Award />, title: "WORLD CHAMPION", desc: "Defeated Lewis Hamilton in Abu Dhabi after an epic season-long battle, securing his maiden World Championship with a last-lap overtake." },
    { year: "2022-2023", icon: <Trophy />, title: "Absolute Dominance", desc: "Smashed records with back-to-back titles in the RB18 and the historic RB19, cementing his place among F1's legends." },
    { year: "2026", icon: <Radio />, title: "The Next Era", desc: "Witnessing Max take the wheel under the new engine regulations. The legend grows..." },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-red-600 selection:text-white pb-20 font-sans">
      
      {/* 頂部導航 */}
      <nav className="border-b border-blue-900/50 bg-blue-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <a href="/" className="text-gray-300 hover:text-white transition flex items-center gap-2 text-sm font-bold">
            <ArrowLeft size={16} /> Back to Hub
          </a>
          <span className="text-yellow-400 font-black text-2xl italic tracking-tighter">MAX<span className="text-white">33</span> Legacy</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl space-y-16">
        
        {/* 英雄區塊 (Jason 的感受故事) */}
        <section className="bg-slate-900 p-12 rounded-3xl border border-blue-900/50 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950 to-transparent"></div>
          <div className="relative z-20 flex-1 space-y-5">
            <h1 className="text-5xl font-black text-white uppercase italic tracking-wide leading-tight">Growing Up <br/>With <span className="text-red-600">Max</span></h1>
            <div className="w-16 h-1.5 bg-red-600 rounded-full"></div>
            <p className="text-gray-300 leading-relaxed text-lg max-w-xl">
              Watching Max since his karting days, there's a fearless intensity you just don't see in other racers. This dedicated section is my tribute to witnessing that journey from a karting miracle to a multiple World Champion. It’s more than stats; it’s about the spirit of racing he embodies.
              <br/><br/>
              <span className="text-yellow-400 font-bold">Simply Lovely.</span>
            </p>
          </div>
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-yellow-400/20 p-2 shrink-0 relative z-20">
             <img src="https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover rounded-full filter grayscale" alt="Karting" />
          </div>
        </section>

        {/* 傳奇時間軸 */}
        <section className="space-y-10">
          <div className="flex items-center gap-3 pl-4 border-l-4 border-yellow-400">
            <Flag className="text-yellow-400" size={28} />
            <h2 className="text-3xl font-bold text-white uppercase tracking-wider">Milestones & History</h2>
          </div>

          <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-800 before:z-0 pl-12">
            {timelineEvents.map((event, i) => (
              <div key={i} className="relative z-10 group flex flex-col md:flex-row gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-yellow-600/50 transition">
                {/* 年份圖示 */}
                <div className="absolute left-[-40px] top-6 w-8 h-8 rounded-full bg-slate-950 border-2 border-yellow-400 flex items-center justify-center text-yellow-400">
                  {event.icon}
                </div>
                <div className="md:w-32 shrink-0 flex items-start">
                  <span className="text-3xl font-black text-white italic tracking-tighter opacity-70">{event.year}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-wide">{event.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
