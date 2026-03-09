"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, ImageIcon, Loader2 } from 'lucide-react';
import Lightbox from '@/components/Lightbox';
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function GalleryPage() {
  const [lightboxState, setLightboxState] = useState({ isOpen: false, currentIndex: 0 });
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 只抓取被管理員 Approved 的照片
    const q = query(collection(db, "max_gallery"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => doc.data().imageUrl));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openLightbox = (index: number) => setLightboxState({ isOpen: true, currentIndex: index });

  return (
    <main className="min-h-screen bg-slate-950 text-gray-200 selection:bg-orange-500 selection:text-white pb-24 md:pb-20 font-sans">
      <nav className="border-b border-orange-900/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center max-w-7xl">
          <a href="/" className="text-gray-300 hover:text-white transition flex items-center gap-2 text-sm font-bold group"><ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub</a>
          <span className="text-orange-500 font-black text-xl tracking-tighter uppercase flex items-center gap-2"><Camera size={20}/> The Vault</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-wide">Max's <span className="text-orange-500">Vault</span></h1>
          <p className="text-gray-400">Curated by Admin Jason. The ultimate collection of absolute dominance submitted by the Orange Army.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : photos.length === 0 ? (
          <div className="text-center text-slate-500 py-20">The Vault is currently empty. Submit photos in the Paddock Feed!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((photo, i) => (
              <div key={i} className="relative group overflow-hidden rounded-xl bg-slate-900 aspect-square cursor-zoom-in border border-slate-800 hover:border-orange-500/50 transition-colors" onClick={() => openLightbox(i)}>
                {/* 確保照片不裁切文字 */}
                <img src={photo} alt="Max" className="w-full h-full object-contain bg-black group-hover:scale-105 transition-all duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={24} className="text-white"/></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxState.isOpen && (
        <Lightbox images={photos} selectedIndex={lightboxState.currentIndex} onClose={() => setLightboxState({ ...lightboxState, isOpen: false })} onPrev={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + photos.length) % photos.length }))} onNext={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % photos.length }))} />
      )}
    </main>
  );
}
