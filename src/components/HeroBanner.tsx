"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function HeroBanner() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => setIsMinimized(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) return null;

  return (
    // 🔥 Updated styling: Changed border and shadow colors to incorporate Max's Orange
    <section className={`relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-orange-900/20 bg-slate-900 border border-orange-900/50 transition-all duration-1000 ease-in-out ${isMinimized ? 'h-28 md:h-40' : 'h-[50vh] min-h-[350px] md:h-[80vh] md:min-h-[500px] flex flex-col md:flex-row'}`}>
      
      {isMinimized && (
        <div className="absolute inset-0 z-20 flex items-center justify-between p-5 md:p-8 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-wide mb-0.5 md:mb-2 flex items-center gap-2">
              THE 2026 <span className="text-orange-500">ERA</span>
            </h1>
            <p className="text-gray-400 text-[10px] md:text-sm">Welcome back to the MAX33 Hub.</p>
          </div>
          <button onClick={() => setIsMinimized(false)} className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur transition border border-slate-700">
            <ChevronDown size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      )}

      {!isMinimized && (
        <div className="p-6 md:p-10 w-full md:w-1/2 z-20 flex flex-col justify-center h-full bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent">
          {/* 🔥 Updated phrasing and accent color to emphasize Max */}
          <h1 className="text-3xl md:text-6xl font-black text-white mb-3 md:mb-6 uppercase italic tracking-wide leading-tight">
            Embrace The <br/><span className="text-orange-500">Lion</span>
          </h1>
          <p className="text-gray-300 leading-relaxed mb-6 md:mb-8 text-sm md:text-lg max-w-md line-clamp-3 md:line-clamp-none">
            The 2026 regulations redefine Formula 1. Witness Max Verstappen's relentless drive to absolute dominance in the new era.
          </p>
          <div className="flex gap-3 md:gap-4 items-center">
            {/* 🔥 Changed badge color to Orange */}
            <span className="px-4 py-2 md:px-5 md:py-2 bg-orange-600/20 text-orange-500 font-bold rounded border border-orange-600/50 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse text-xs md:text-base">Simply Lovely.</span>
            <button onClick={() => setIsMinimized(true)} className="ml-auto flex items-center gap-1 text-xs md:text-sm text-gray-400 hover:text-white transition bg-slate-900/50 px-3 py-1 rounded-full">
              Minimize <ChevronUp size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent z-10"></div>
        {/* 🔥 Updated the background image to one more reflective of Max/Red Bull aesthetics */}
        <img 
          src="https://images.unsplash.com/photo-1532983330958-4b32abe9deab?q=80&w=1500&auto=format&fit=crop" 
          alt="F1 Racing" 
          className="object-cover w-full h-full opacity-60 grayscale-[10%]"
        />
      </div>
    </section>
  );
}
