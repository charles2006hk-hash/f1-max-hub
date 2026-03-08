"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Newspaper } from "lucide-react";

export default function DynamicNews() {
  const [newsData, setNewsData] = useState({
    youtubeUrl: "https://www.youtube.com/embed/M-9v9y_L1NE",
    newsImage: "https://images.unsplash.com/photo-1538330627120-11100f971ba4?q=80&w=800&auto=format&fit=crop",
    newsTitle: "Ford Powertrain hits 350kW Target",
    newsDesc: "Christian Horner confirms dyno testing exceeds expectations ahead of the Bahrain test."
  });

  useEffect(() => {
    // 從 Firebase 讀取最新設定
    const fetchNews = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) {
        setNewsData(docSnap.data() as any);
      }
    };
    fetchNews();
  }, []);

  return (
    <section id="news" className="scroll-mt-24">
      <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-6">
        <Newspaper className="text-red-600" size={28} />
        <h2 className="text-3xl font-bold text-white">Latest Intelligence</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-blue-500 transition group">
          <div className="relative aspect-video bg-black">
            <iframe className="w-full h-full" src={newsData.youtubeUrl} title="Video" allowFullScreen></iframe>
          </div>
          <div className="p-5">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Video Explainer</span>
            <h3 className="text-lg font-bold text-white mb-2">Paddock Insights</h3>
            <p className="text-sm text-gray-400">Latest technical breakdown from the F1 paddock.</p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-blue-500 transition group">
          <div className="h-40 overflow-hidden relative">
            <img src={newsData.newsImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="News" />
          </div>
          <div className="p-5">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">Tech Update</span>
            <h3 className="text-lg font-bold text-white mb-2">{newsData.newsTitle}</h3>
            <p className="text-sm text-gray-400">{newsData.newsDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}