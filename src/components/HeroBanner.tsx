"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function HeroBanner() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 檢查瀏覽器記憶，如果之前來過，就自動縮小
    const visited = localStorage.getItem("max33_visited");
    if (visited) {
      setIsMinimized(true);
    } else {
      localStorage.setItem("max33_visited", "true");
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null; // 避免畫面閃爍

  return (
    <section className={`relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 bg-slate-900 border border-blue-900/50 transition-all duration-700 ease-in-out ${isMinimized ? 'h-48' : 'h-[80vh] min-h-[500px] flex flex-col md:flex-row'}`}>
      
      {/* 縮小模式的精簡文字 */}
      {isMinimized && (
        <div className="absolute inset-0 z-20 flex items-center justify-between p-8 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-wide mb-2">
              THE 2026 <span className="text-red-600">ERA</span>
            </h1>
            <p className="text-gray-400 text-sm">Welcome back to the MAX33 Hub.</p>
          </div>
          <button onClick={() => setIsMinimized(false)} className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur transition">
            <ChevronDown size={20} />
          </button>
        </div>
      )}

      {/* 展開模式的完整文字 */}
      {!isMinimized && (
        <div className="p-10 md:w-1/2 z-20 flex flex-col justify-center bg-gradient-to-r from-slate-950 to-transparent">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-wide leading-tight">
            Embrace The <br/><span className="text-red-600">New Rules</span>
          </h1>
          <p className="text-gray-300 leading-relaxed mb-8 text-lg max-w-md">
            The 2026 regulations redefine Formula 1. With active aerodynamics and a 50/50 power split, witness Max Verstappen's journey to absolute dominance in a completely new machine.
          </p>
          <div className="flex gap-4 items-center">
            <span className="px-5 py-2 bg-red-600/20 text-red-500 font-bold rounded border border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">Simply Lovely.</span>
            <button onClick={() => setIsMinimized(true)} className="ml-auto flex items-center gap-1 text-sm text-gray-400 hover:text-white transition">
              Minimize <ChevronUp size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 背景圖片 */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1500&auto=format&fit=crop" 
          alt="F1 Racing" 
          className="object-cover w-full h-full opacity-70 grayscale-[10%]"
        />
      </div>
    </section>
  );
}