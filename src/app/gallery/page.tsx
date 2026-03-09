"use client";

import { useState } from 'react';
import { ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react';
import Lightbox from '@/components/Lightbox';

// 這裡我先放了一些高畫質的 F1 賽車/Max 相關的 Unsplash 免費圖庫作為示範
// 未來你可以直接把這些網址換成真實的 Max 帥照！
const maxPhotos = [
  "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532983330958-4b32abe9deab?q=80&w=1500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=1500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=1500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1500&auto=format&fit=crop",
];

export default function GalleryPage() {
  const [lightboxState, setLightboxState] = useState({ isOpen: false, currentIndex: 0 });

  const openLightbox = (index: number) => {
    setLightboxState({ isOpen: true, currentIndex: index });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-orange-500 selection:text-white pb-24 md:pb-20 font-sans">
      
      {/* 頂部導航 */}
      <nav className="border-b border-orange-900/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center max-w-7xl">
          <a href="/" className="text-gray-300 hover:text-white transition flex items-center gap-2 text-sm font-bold group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
          </a>
          <span className="text-orange-500 font-black text-xl tracking-tighter uppercase flex items-center gap-2">
            <Camera size={20}/> The Vault
          </span>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl space-y-8">
        
        {/* 標題區塊 */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-wide">
            Max's <span className="text-orange-500">Lens</span>
          </h1>
          <p className="text-gray-400">A curated collection of absolute dominance. From the paddock to the top step of the podium.</p>
        </div>

        {/* 瀑布流相片牆 (CSS Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {maxPhotos.map((photo, i) => (
            <div 
              key={i} 
              className="relative group overflow-hidden rounded-2xl bg-slate-900 aspect-[4/3] cursor-zoom-in border border-slate-800 hover:border-orange-500/50 transition-colors"
              onClick={() => openLightbox(i)}
            >
              <img 
                src={photo} 
                alt={`Max Verstappen ${i}`} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold flex items-center gap-2">
                  <ImageIcon size={18} className="text-orange-500"/> View Full Size
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 呼叫之前寫好的放大燈箱 */}
      {lightboxState.isOpen && (
        <Lightbox 
          images={maxPhotos}
          selectedIndex={lightboxState.currentIndex}
          onClose={() => setLightboxState({ ...lightboxState, isOpen: false })}
          onPrev={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + maxPhotos.length) % maxPhotos.length }))}
          onNext={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % maxPhotos.length }))}
        />
      )}
    </main>
  );
}
