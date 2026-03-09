"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, selectedIndex, onClose, onPrev, onNext }: LightboxProps) {
  
  // 處理鍵盤事件 (ESC, 左右箭頭)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // 鎖定滾動
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto"; // 解鎖滾動
    };
  }, [onClose, onPrev, onNext]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center p-4 transition-opacity duration-300">
      
      {/* 頂部控制列 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <span className="text-gray-400 font-mono text-sm">
          {selectedIndex + 1} / {images.length}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5 transition">
          <X size={24} />
        </button>
      </div>

      {/* 左右導航 */}
      {images.length > 1 && (
        <>
          <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition">
            <ChevronLeft size={30} />
          </button>
          <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition">
            <ChevronRight size={30} />
          </button>
        </>
      )}

      {/* 🔥 核心修復：使用 object-contain 確保完整的圖片 (包含 Meme 文字) 都能看到，且不爆設計 */}
      <div className="w-full h-full flex items-center justify-center p-10">
        <img 
          src={images[selectedIndex]} 
          alt={`Full view ${selectedIndex}`} 
          className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_60px_rgba(255,255,255,0.1)]"
          onClick={(e) => e.stopPropagation()} // 防止點擊圖片關閉
        />
      </div>

    </div>
  );
}
