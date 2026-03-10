"use client";

import { useState, useRef, useEffect } from "react";

export default function VideoPlayer({ urls }: { urls?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!urls) return <span className="text-slate-600 text-sm">Signal Lost</span>;

  // 🔥 支援用「換行符號」或「逗號」分隔多個影片網址
  const urlList = urls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);

  if (urlList.length === 0) return <span className="text-slate-600 text-sm">Signal Lost</span>;

  const handleEnded = () => {
    if (urlList.length > 1) {
      // 播完切換下一部，到底了就從頭開始
      setCurrentIndex((prev) => (prev + 1) % urlList.length);
    }
  };

  // 當 currentIndex 改變時，強迫影片重新載入並播放
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.warn("Autoplay blocked", e));
    }
  }, [currentIndex]);

  return (
    <video
      ref={videoRef}
      src={urlList[currentIndex]}
      autoPlay
      muted
      playsInline
      // 如果只有一部影片，就用原生 loop；如果有多部，就靠 onEnded 切換
      loop={urlList.length === 1} 
      onEnded={handleEnded}
      className="w-full h-full object-cover transition-opacity duration-500"
    />
  );
}
