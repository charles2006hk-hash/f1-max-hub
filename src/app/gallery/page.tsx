"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, ImageIcon, Loader2, Star } from 'lucide-react';
import Lightbox from '@/components/Lightbox';
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";

interface VaultPhoto {
  id: string;
  imageUrl: string;
  likes: number;
  time: number;
}

export default function GalleryPage() {
  const [lightboxState, setLightboxState] = useState({ isOpen: false, currentIndex: 0 });
  const [photos, setPhotos] = useState<VaultPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 拿掉 orderBy 避開複合索引錯誤
    const q = query(collection(db, "max_gallery"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPhotos = snapshot.docs.map(d => ({
        id: d.id,
        imageUrl: d.data().imageUrl,
        likes: d.data().likes || 0,
        time: d.data().createdAt?.toMillis() || 0
      }));
      // 依照時間排序
      fetchedPhotos.sort((a, b) => b.time - a.time);
      setPhotos(fetchedPhotos);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 粉絲評分系統
  const handleRate = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation(); // 防止觸發打開燈箱
    const hasRated = localStorage.getItem(`max33_rated_${photoId}`);
    if (hasRated) {
      alert("You have already rated this photo!");
      return;
    }
    await updateDoc(doc(db, "max_gallery", photoId), { likes: increment(1) });
    localStorage.setItem(`max33_rated_${photoId}`, "true");
  };

  const openLightbox = (index: number) => setLightboxState({ isOpen: true, currentIndex: index });

  // 為了傳給 Lightbox，只需要純圖片網址陣列
  const pureImageUrls = photos.map(p => p.imageUrl);

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
          <p className="text-gray-400">Curated by Admin Jason. Rate the most iconic moments of absolute dominance.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : photos.length === 0 ? (
          <div className="text-center text-slate-500 py-20">The Vault is currently empty.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((photo, i) => (
              <div key={photo.id} className="relative group overflow-hidden rounded-xl bg-slate-900 aspect-square cursor-zoom-in border border-slate-800 hover:border-orange-500/50 transition-colors" onClick={() => openLightbox(i)}>
                
                <img src={photo.imageUrl} alt="Max" className="w-full h-full object-contain bg-black group-hover:scale-105 transition-all duration-500" loading="lazy" />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"><ImageIcon size={32} className="text-white/70"/></div>
                
                {/* 🔥 粉絲評分按鈕 (懸浮在圖片右下角) */}
                <button 
                  onClick={(e) => handleRate(e, photo.id)}
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-orange-500 border border-slate-700 hover:border-orange-400 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors z-10"
                >
                  <Star size={14} className={photo.likes > 0 ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
                  <span className={`text-xs font-bold ${photo.likes > 0 ? "text-yellow-400" : "text-slate-300"}`}>{photo.likes}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxState.isOpen && (
        <Lightbox images={pureImageUrls} selectedIndex={lightboxState.currentIndex} onClose={() => setLightboxState({ ...lightboxState, isOpen: false })} onPrev={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + pureImageUrls.length) % pureImageUrls.length }))} onNext={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % pureImageUrls.length }))} />
      )}
    </main>
  );
}
